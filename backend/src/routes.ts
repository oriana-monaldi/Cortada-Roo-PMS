import { Express, Request, Response } from "express";
import { FieldValue } from "firebase-admin/firestore";

import { db } from "./firebase";
import { sendPaymentEmail } from "./email";

const getDate = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const isActiveReservation = (reservation: FirebaseFirestore.DocumentData) => {
  if (["cancelled", "expired", "checked-out"].includes(reservation.status)) {
    return false;
  }

  if (reservation.status === "pending") {
    const expiresAt = reservation.expiresAt?.toDate?.();
    return expiresAt instanceof Date && expiresAt.getTime() > Date.now();
  }

  return true;
};

export function registerRoutes(app: Express) {
  app.get("/", (_req, res) => {
    res.json({
      ok: true,
      service: "Cortada Roo Backend",
    });
  });

  app.post("/availability", async (req: Request, res: Response) => {
    try {
      const checkIn = getDate(req.body?.checkIn);
      const checkOut = getDate(req.body?.checkOut);

      if (!checkIn || !checkOut || checkOut <= checkIn) {
        return res.status(400).json({
          success: false,
          message: "Las fechas de la consulta no son válidas.",
        });
      }

      const vacationSnapshot = await db.collection("vacationPeriods").get();
      const vacationConflict = vacationSnapshot.docs.find((document) => {
        const period = document.data();
        const startDate = period.startDate?.toDate?.();
        const endDate = period.endDate?.toDate?.();

        if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
          return false;
        }

        endDate.setDate(endDate.getDate() + 1);
        return checkIn < endDate && checkOut > startDate;
      });

      if (vacationConflict) {
        return res.status(409).json({
          success: false,
          message: "No se pueden reservar esas fechas porque el alojamiento estará en modo vacaciones.",
        });
      }

      const reservationsSnapshot = await db.collection("reservations").get();
      const occupiedByApartment: Record<string, number> = {};

      reservationsSnapshot.docs.forEach((document) => {
        const reservation = document.data();

        if (!isActiveReservation(reservation)) {
          return;
        }

        const reservationCheckIn = reservation.checkIn?.toDate?.();
        const reservationCheckOut = reservation.checkOut?.toDate?.();

        if (
          !(reservationCheckIn instanceof Date) ||
          !(reservationCheckOut instanceof Date) ||
          checkIn >= reservationCheckOut ||
          checkOut <= reservationCheckIn
        ) {
          return;
        }

        const apartmentId = reservation.apartmentId;

        if (typeof apartmentId === "string") {
          occupiedByApartment[apartmentId] =
            (occupiedByApartment[apartmentId] ?? 0) + 1;
        }
      });

      return res.json({ success: true, occupiedByApartment });
    } catch (error) {
      console.error("Error consultando disponibilidad:", error);
      return res.status(500).json({
        success: false,
        message: "No pudimos consultar la disponibilidad.",
      });
    }
  });

  app.post(
    "/send-payment-email/:reservationId",
    async (req: Request, res: Response) => {
      try {
        const reservationId = String(req.params.reservationId);

        const reservationRef = db.collection("reservations").doc(reservationId);

        const reservationSnap = await reservationRef.get();

        if (!reservationSnap.exists) {
          return res.status(404).json({
            success: false,
            message: "Reserva no encontrada",
          });
        }

        const reservation = reservationSnap.data();

        if (!reservation) {
          return res.status(404).json({
            success: false,
            message: "Reserva inválida",
          });
        }

        if (reservation.status !== "pending") {
          return res.status(400).json({
            success: false,
            message:
              reservation.status === "confirmed"
                ? "La reserva ya estaba confirmada."
                : "Sólo se pueden confirmar reservas pendientes.",
          });
        }

        await sendPaymentEmail({
          guestName: reservation.guestName,
          guestEmail: reservation.guestEmail,
          reservationCode: reservation.reservationCode ?? reservationId,
          apartmentName: reservation.apartmentName,
          checkIn: reservation.checkIn.toDate().toLocaleDateString("es-AR"),
          checkOut: reservation.checkOut.toDate().toLocaleDateString("es-AR"),
          guests: reservation.guests,
          totalPrice: reservation.totalPrice,
        });

        await reservationRef.update({
          status: "confirmed",
          confirmedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return res.json({
          success: true,
        });
      } catch (error) {
        console.error(error);

        return res.status(500).json({
          success: false,
          message:
            error instanceof Error ? error.message : "Error interno al enviar el correo",
        });
      }
    },
  );
}
