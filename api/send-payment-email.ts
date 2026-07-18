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

      const reservationId = new URL(request.url).searchParams.get("reservationId");

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

      const totalPrice = Number(reservation.totalPrice);
      const deposit = totalPrice * 0.5;
      const remaining = totalPrice - deposit;
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
          html: `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#f3eee8;font-family:Arial,Helvetica,sans-serif;color:#302a26">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#f3eee8"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:650px;background:#fff;border:1px solid #e9dfd6;border-radius:22px;overflow:hidden;box-shadow:0 12px 35px rgba(71,52,37,.12)">
      <tr><td align="center" style="padding:36px 28px 32px;background:#8b6544">
        <div style="display:inline-block;margin-bottom:18px;padding:8px 14px;background:#fff;border-radius:999px;color:#8b6544;font-size:12px;font-weight:bold;letter-spacing:1.5px">CORTADA ROO</div>
        <div style="width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:#fff;line-height:64px;text-align:center;font-size:30px">🎉</div>
        <h1 style="margin:0;color:#fff;font-size:32px;line-height:1.2">¡Reserva confirmada!</h1>
        <p style="margin:12px 0 0;color:#f3e9df;font-size:16px;line-height:1.6">Tu estadía en Cortada Roo ya está asegurada.</p>
      </td></tr>
      <tr><td style="padding:34px 34px 12px">
        <h2 style="margin:0 0 12px;color:#302a26;font-size:24px">¡Hola, ${escapeHtml(reservation.guestName)}! 👋</h2>
        <p style="margin:0;color:#6f655e;font-size:16px;line-height:1.7">Recibimos correctamente el pago de tu seña y tu reserva quedó confirmada. A continuación encontrarás toda la información correspondiente a tu estadía.</p>
      </td></tr>
      <tr><td style="padding:18px 34px 8px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf8f1;border:1px solid #cce8d5;border-radius:14px"><tr>
        <td width="52" align="center" style="padding:19px 0 19px 18px;font-size:24px">✅</td><td style="padding:18px 18px 18px 10px"><p style="margin:0;color:#277044;font-size:16px;font-weight:bold">Pago recibido correctamente</p><p style="margin:5px 0 0;color:#4e765c;font-size:14px;line-height:1.5">La habitación quedó reservada a nombre de ${escapeHtml(reservation.guestName)}.</p></td>
      </tr></table></td></tr>
      <tr><td style="padding:26px 34px 10px"><h3 style="margin:0 0 16px;color:#8b6544;font-size:19px">🛏️ Detalle de la reserva</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf8f5;border:1px solid #ebe3db;border-radius:14px">
          <tr><td style="padding:15px 18px;border-bottom:1px solid #ebe3db;color:#766b63;font-size:14px">🔖 Código de reserva</td><td align="right" style="padding:15px 18px;border-bottom:1px solid #ebe3db;font-weight:bold">${escapeHtml(reservation.reservationCode ?? reservationId)}</td></tr>
          <tr><td style="padding:15px 18px;border-bottom:1px solid #ebe3db;color:#766b63;font-size:14px">🏨 Habitación</td><td align="right" style="padding:15px 18px;border-bottom:1px solid #ebe3db;font-weight:bold">${escapeHtml(reservation.apartmentName)}</td></tr>
          <tr><td style="padding:15px 18px;border-bottom:1px solid #ebe3db;color:#766b63;font-size:14px">📅 Check-in</td><td align="right" style="padding:15px 18px;border-bottom:1px solid #ebe3db;font-weight:bold">${reservation.checkIn.toDate().toLocaleDateString("es-AR")}</td></tr>
          <tr><td style="padding:15px 18px;border-bottom:1px solid #ebe3db;color:#766b63;font-size:14px">📅 Check-out</td><td align="right" style="padding:15px 18px;border-bottom:1px solid #ebe3db;font-weight:bold">${reservation.checkOut.toDate().toLocaleDateString("es-AR")}</td></tr>
          <tr><td style="padding:15px 18px;color:#766b63;font-size:14px">👥 Huéspedes</td><td align="right" style="padding:15px 18px;font-weight:bold">${escapeHtml(reservation.guests)}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:26px 34px 10px"><h3 style="margin:0 0 16px;color:#8b6544;font-size:19px">💳 Información del pago</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf8f5;border:1px solid #ebe3db;border-radius:14px">
          <tr><td style="padding:15px 18px;border-bottom:1px solid #ebe3db;color:#766b63;font-size:14px">Valor total</td><td align="right" style="padding:15px 18px;border-bottom:1px solid #ebe3db;font-weight:bold">$${totalPrice.toLocaleString("es-AR")}</td></tr>
          <tr><td style="padding:15px 18px;border-bottom:1px solid #ebe3db;color:#277044;font-size:14px;font-weight:bold">✅ Seña recibida</td><td align="right" style="padding:15px 18px;border-bottom:1px solid #ebe3db;color:#277044;font-weight:bold">$${deposit.toLocaleString("es-AR")}</td></tr>
          <tr><td style="padding:17px 18px;color:#8b6544;font-size:15px;font-weight:bold">💰 Saldo pendiente</td><td align="right" style="padding:17px 18px;color:#8b6544;font-size:18px;font-weight:bold">$${remaining.toLocaleString("es-AR")}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 34px 8px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8e8;border:1px solid #ead9aa;border-radius:14px"><tr><td width="50" align="center" style="padding:18px 0 18px 16px;font-size:22px">📌</td><td style="padding:17px 18px 17px 8px"><p style="margin:0 0 5px;color:#765a27;font-size:15px;font-weight:bold">Conservá este correo</p><p style="margin:0;color:#846f48;font-size:13px;line-height:1.6">Este mensaje funciona como comprobante de confirmación de tu reserva y del pago de la seña.</p></td></tr></table></td></tr>
      <tr><td style="padding:26px 34px 36px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#8b6544;border-radius:16px"><tr><td align="center" style="padding:26px 20px;color:#fff"><p style="margin:0 0 8px;font-size:21px;font-weight:bold">¡Te esperamos! ✨</p><p style="margin:0;color:#f4e9df;font-size:14px;line-height:1.7">Muchas gracias por elegir Cortada Roo para tu estadía. Será un placer recibirte.</p></td></tr></table></td></tr>
      <tr><td align="center" style="padding:25px;background:#302a26"><p style="margin:0 0 7px;color:#fff;font-size:16px;font-weight:bold">Cortada Roo 🏡</p><p style="margin:0;color:#cfc5bd;font-size:12px;line-height:1.6">📍 Cañada de Gómez, Santa Fe, Argentina<br>📞 +54 9 3471 31-6230<br>🌐 temporarioscortadaro.com</p><p style="margin:11px 0 0;color:#968a81;font-size:11px;line-height:1.5">Este correo fue enviado automáticamente como comprobante de confirmación de tu reserva.<br><br><strong>Por favor, no respondas este correo</strong>, ya que esta casilla no recibe mensajes.</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`,
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
