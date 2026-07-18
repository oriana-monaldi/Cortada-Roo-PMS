import {cert, getApps, initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

const getDb = () => {
  if (!getApps().length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
      throw new Error("Falta FIREBASE_SERVICE_ACCOUNT_JSON en Vercel.");
    }

    initializeApp({credential: cert(JSON.parse(serviceAccountJson))});
  }

  return getFirestore();
};

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

const json = (body: unknown, status = 200) =>
  Response.json(body, {status});

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return json({success: false, message: "Método no permitido."}, 405);
    }

    try {
      const body = await request.json();
      const checkIn = getDate(body?.checkIn);
      const checkOut = getDate(body?.checkOut);

      if (!checkIn || !checkOut || checkOut <= checkIn) {
        return json(
          {success: false, message: "Las fechas de la consulta no son válidas."},
          400,
        );
      }

      const db = getDb();
      const vacationSnapshot = await db.collection("vacationPeriods").get();
      const vacationConflict = vacationSnapshot.docs.some((document) => {
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
        return json(
          {
            success: false,
            message:
              "No se pueden reservar esas fechas porque el alojamiento estará en modo vacaciones.",
          },
          409,
        );
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

        if (typeof reservation.apartmentId === "string") {
          occupiedByApartment[reservation.apartmentId] =
            (occupiedByApartment[reservation.apartmentId] ?? 0) + 1;
        }
      });

      return json({success: true, occupiedByApartment});
    } catch (error) {
      console.error("Error consultando disponibilidad:", error);
      return json(
        {success: false, message: "No pudimos consultar la disponibilidad."},
        500,
      );
    }
  },
};
