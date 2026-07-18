import {cert, getApps, initializeApp} from "firebase-admin/app";
import {FieldValue, getFirestore} from "firebase-admin/firestore";

export const runtime = "nodejs";

const ADMIN_EMAIL = "complejolopezsantafe@gmail.com";

const getFirebaseApp = () => {
  if (!getApps().length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
        ? Buffer.from(
          process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
          "base64",
        ).toString("utf8")
        : undefined);

    if (!serviceAccountJson) {
      throw new Error("Falta la credencial de Firebase en Vercel.");
    }

    initializeApp({credential: cert(JSON.parse(serviceAccountJson))});
  }

  return getApps()[0];
};

const getDb = () => getFirestore(getFirebaseApp());

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const json = (body: unknown, status = 200) =>
  Response.json(body, {status});

const verifyAdmin = async (authorization: string | null) => {
  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const webApiKey = process.env.FIREBASE_WEB_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY || process.env.apiKey;

  if (!webApiKey) {
    throw new Error("Falta la API key de Firebase en Vercel.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(webApiKey)}`,
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({idToken: authorization.slice(7)}),
    },
  );

  if (!response.ok) {
    return false;
  }

  const payload = await response.json() as {users?: Array<{email?: string}>};
  return payload.users?.[0]?.email === ADMIN_EMAIL;
};

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return json({success: false, message: "Método no permitido."}, 405);
    }

    try {
      if (!(await verifyAdmin(request.headers.get("authorization")))) {
        return json({success: false, message: "No autorizado."}, 403);
      }

      const url = new URL(request.url);
      const reservationId = url.searchParams.get("reservationId") ||
        url.pathname.split("/").pop();

      if (!reservationId) {
        return json({success: false, message: "Reserva inválida."}, 400);
      }

      const db = getDb();
      const reservationRef = db.collection("reservations").doc(reservationId);
      const reservationSnapshot = await reservationRef.get();

      if (!reservationSnapshot.exists) {
        return json({success: false, message: "Reserva no encontrada."}, 404);
      }

      const reservation = reservationSnapshot.data();

      if (!reservation || reservation.status !== "pending") {
        return json(
          {
            success: false,
            message: reservation?.status === "confirmed" ?
              "La reserva ya estaba confirmada." :
              "Sólo se pueden confirmar reservas pendientes.",
          },
          400,
        );
      }

      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        throw new Error("Falta RESEND_API_KEY en Vercel.");
      }

      const deposit = Number(reservation.totalPrice) * 0.5;
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ??
            "Cortada Roo <onboarding@resend.dev>",
          to: reservation.guestEmail,
          subject: "Reserva confirmada - Cortada Roo",
          html: `<main style="font-family:Arial,sans-serif;color:#302a26">
            <h1>¡Reserva confirmada!</h1>
            <p>Hola ${escapeHtml(reservation.guestName)}, recibimos tu seña y tu reserva quedó confirmada.</p>
            <p><strong>Código:</strong> ${escapeHtml(reservation.reservationCode ?? reservationId)}</p>
            <p><strong>Habitación:</strong> ${escapeHtml(reservation.apartmentName)}</p>
            <p><strong>Check-in:</strong> ${reservation.checkIn.toDate().toLocaleDateString("es-AR")}</p>
            <p><strong>Check-out:</strong> ${reservation.checkOut.toDate().toLocaleDateString("es-AR")}</p>
            <p><strong>Seña recibida:</strong> $${deposit.toLocaleString("es-AR")}</p>
          </main>`,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as
          {message?: string} | null;
        throw new Error(payload?.message ?? "Resend no pudo enviar el correo.");
      }

      await reservationRef.update({
        status: "confirmed",
        confirmedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return json({success: true});
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
      return json(
        {
          success: false,
          message: error instanceof Error ? error.message :
            "No pudimos confirmar la reserva.",
        },
        500,
      );
    }
  },
};
