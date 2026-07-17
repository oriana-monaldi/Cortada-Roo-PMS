import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { apartments, type Apartment } from "../data/apartments";
import { db } from "../firebase/config";
import type { CreateReservationInput, Reservation } from "../types/reservation";

const COLLECTION_NAME = "reservations";
const reservationsCollection = collection(db, COLLECTION_NAME);

const DAY_IN_MILLISECONDS = 86_400_000;

const generateReservationCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return Array.from({ length: 6 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length)),
  ).join("");
};

export const RESERVATION_TIMEOUT_MINUTES = 10;

const RESERVATION_TIMEOUT_MILLISECONDS =
  RESERVATION_TIMEOUT_MINUTES * 60 * 1000;

const normalizeDate = (date: Date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const timestampToDate = (value: unknown): Date => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  throw new Error("La fecha guardada en Firestore no es válida.");
};

const optionalTimestampToDate = (value: unknown): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return timestampToDate(value);
};

const calculateNights = (checkIn: Date, checkOut: Date) => {
  const normalizedCheckIn = normalizeDate(checkIn);
  const normalizedCheckOut = normalizeDate(checkOut);

  return Math.ceil(
    (normalizedCheckOut.getTime() - normalizedCheckIn.getTime()) /
      DAY_IN_MILLISECONDS,
  );
};

const rangesOverlap = (
  requestedCheckIn: Date,
  requestedCheckOut: Date,
  existingCheckIn: Date,
  existingCheckOut: Date,
) => {
  return (
    normalizeDate(requestedCheckIn) < normalizeDate(existingCheckOut) &&
    normalizeDate(requestedCheckOut) > normalizeDate(existingCheckIn)
  );
};

const validateReservationDates = (checkIn: Date, checkOut: Date) => {
  const normalizedCheckIn = normalizeDate(checkIn);
  const normalizedCheckOut = normalizeDate(checkOut);

  if (
    Number.isNaN(normalizedCheckIn.getTime()) ||
    Number.isNaN(normalizedCheckOut.getTime())
  ) {
    throw new Error("Las fechas seleccionadas no son válidas.");
  }

  if (normalizedCheckOut <= normalizedCheckIn) {
    throw new Error(
      "La fecha de check-out debe ser posterior a la fecha de check-in.",
    );
  }

  if (calculateNights(normalizedCheckIn, normalizedCheckOut) < 1) {
    throw new Error("La reserva debe tener al menos una noche.");
  }
};

export const getReservations = async (): Promise<Reservation[]> => {
  const snapshot = await getDocs(query(reservationsCollection));

  return snapshot.docs.map((document) => {
    const data = document.data();

    /*
     * Compatibilidad con reservas creadas antes de agregar expiresAt:
     * si una reserva antigua no tiene vencimiento, usamos createdAt.
     * Esto evita que la aplicación se rompa al leer documentos existentes.
     */
    const createdAt = timestampToDate(data.createdAt);
    const expiresAt =
      optionalTimestampToDate(data.expiresAt) ??
      new Date(createdAt.getTime() + RESERVATION_TIMEOUT_MILLISECONDS);

    return {
      id: document.id,
      reservationCode: data.reservationCode ?? document.id,

      apartmentId: data.apartmentId,
      apartmentName: data.apartmentName,

      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,

      estimatedCheckInTime: data.estimatedCheckInTime ?? "",
      observations: data.observations ?? "",

      guests: data.guests,

      checkIn: timestampToDate(data.checkIn),
      checkOut: timestampToDate(data.checkOut),
      nights: data.nights,

      pricePerNight: data.pricePerNight,
      totalPrice: data.totalPrice,

      status: data.status,

      createdAt,
      updatedAt: timestampToDate(data.updatedAt),

      expiresAt,
      confirmedAt: optionalTimestampToDate(data.confirmedAt),
    } satisfies Reservation;
  });
};

/**
 * Marca como expiradas las reservas pendientes cuyo plazo ya terminó.
 *
 * Devuelve la cantidad de reservas que fueron actualizadas.
 * Se puede ejecutar todas las veces que sea necesario.
 */
export const expireReservations = async (): Promise<number> => {
  const reservations = await getReservations();
  const now = Date.now();

  const expiredReservations = reservations.filter(
    (reservation) =>
      reservation.status === "pending" &&
      reservation.expiresAt.getTime() <= now,
  );

  if (expiredReservations.length === 0) {
    return 0;
  }

  await Promise.all(
    expiredReservations.map((reservation) =>
      updateDoc(doc(db, COLLECTION_NAME, reservation.id), {
        status: "expired",
        updatedAt: serverTimestamp(),
      }),
    ),
  );

  return expiredReservations.length;
};

type CheckAvailabilityInput = {
  checkIn: Date;
  checkOut: Date;
  guests: number;
};

export const checkAvailability = async ({
  checkIn,
  checkOut,
  guests,
}: CheckAvailabilityInput): Promise<Apartment[]> => {
  validateReservationDates(checkIn, checkOut);

  if (!Number.isInteger(guests) || guests < 1) {
    throw new Error("La cantidad de huéspedes debe ser válida.");
  }

  await expireReservations();

  const reservations = await getReservations();

  const now = Date.now();

  const activeReservations = reservations.filter((reservation) => {
    if (
      reservation.status === "cancelled" ||
      reservation.status === "expired" ||
      reservation.status === "checked-out"
    ) {
      return false;
    }

    if (
      reservation.status === "pending" &&
      reservation.expiresAt.getTime() <= now
    ) {
      return false;
    }

    return true;
  });

  return apartments.filter((apartment) => {
    if (apartment.capacity < guests) {
      return false;
    }

    const occupiedUnits = activeReservations.filter((reservation) => {
      return (
        reservation.apartmentId === apartment.id &&
        rangesOverlap(
          checkIn,
          checkOut,
          reservation.checkIn,
          reservation.checkOut,
        )
      );
    }).length;

    return occupiedUnits < apartment.totalUnits;
  });
};

export const createReservation = async (
  reservation: CreateReservationInput,
) => {
  validateReservationDates(reservation.checkIn, reservation.checkOut);

  if (!Number.isInteger(reservation.guests) || reservation.guests < 1) {
    throw new Error("La cantidad de huéspedes debe ser válida.");
  }

  if (!reservation.estimatedCheckInTime.trim()) {
    throw new Error("Seleccioná un horario aproximado de check-in.");
  }

  if (reservation.observations.length > 300) {
    throw new Error("Las observaciones no pueden superar los 300 caracteres.");
  }

  const apartment = apartments.find(
    (item) => item.id === reservation.apartmentId,
  );

  if (!apartment) {
    throw new Error("El apartamento seleccionado no existe.");
  }

  if (reservation.guests > apartment.capacity) {
    throw new Error(
      `Esta habitación admite hasta ${apartment.capacity} ${
        apartment.capacity === 1 ? "huésped" : "huéspedes"
      }.`,
    );
  }

  const availableApartments = await checkAvailability({
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
  });

  const isStillAvailable = availableApartments.some(
    (item) => item.id === reservation.apartmentId,
  );

  if (!isStillAvailable) {
    throw new Error(
      "La habitación dejó de estar disponible para las fechas seleccionadas.",
    );
  }

  const nights = calculateNights(reservation.checkIn, reservation.checkOut);
  const totalPrice = nights * reservation.pricePerNight;

  const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT_MILLISECONDS);
  const reservationCode = generateReservationCode();
  const documentReference = await addDoc(reservationsCollection, {
    apartmentId: reservation.apartmentId,
    apartmentName: reservation.apartmentName,

    guestName: reservation.guestName.trim(),
    guestEmail: reservation.guestEmail.trim().toLowerCase(),
    guestPhone: reservation.guestPhone.trim(),

    estimatedCheckInTime: reservation.estimatedCheckInTime.trim(),
    observations: reservation.observations.trim(),

    guests: reservation.guests,

    checkIn: Timestamp.fromDate(normalizeDate(reservation.checkIn)),
    checkOut: Timestamp.fromDate(normalizeDate(reservation.checkOut)),

    nights,
    pricePerNight: reservation.pricePerNight,
    totalPrice,

    status: "pending",
    reservationCode,

    expiresAt: Timestamp.fromDate(expiresAt),
    confirmedAt: null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: documentReference.id,
    reservationCode,
    nights,
    totalPrice,
    expiresAt,
  };
};

export const confirmReservation = async (reservationId: string) => {
  const reservationReference = doc(db, COLLECTION_NAME, reservationId);
  const reservationSnapshot = await getDoc(reservationReference);

  if (!reservationSnapshot.exists()) {
    throw new Error("La reserva no existe.");
  }

  const data = reservationSnapshot.data();
  const status = data.status as Reservation["status"];
  const expiresAt = optionalTimestampToDate(data.expiresAt);

  if (status !== "pending") {
    throw new Error("Sólo se pueden confirmar reservas pendientes.");
  }

  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    await updateDoc(reservationReference, {
      status: "expired",
      updatedAt: serverTimestamp(),
    });

    throw new Error(
      "El plazo de pago venció. Usá la opción “Confirmar igualmente” para revisar y recuperar esta reserva.",
    );
  }

  await updateDoc(reservationReference, {
    status: "confirmed",
    confirmedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Recupera una reserva expirada cuando el administrador recibió el pago tarde.
 *
 * Antes de confirmarla, comprueba que todavía exista una unidad disponible
 * para la misma habitación y las mismas fechas.
 */
export const recoverExpiredReservation = async (reservationId: string) => {
  await expireReservations();

  const reservationReference = doc(db, COLLECTION_NAME, reservationId);
  const reservationSnapshot = await getDoc(reservationReference);

  if (!reservationSnapshot.exists()) {
    throw new Error("La reserva no existe.");
  }

  const data = reservationSnapshot.data();
  const status = data.status as Reservation["status"];

  if (status !== "expired") {
    throw new Error("Sólo se pueden recuperar reservas expiradas.");
  }

  const apartmentId = data.apartmentId as string;
  const checkIn = timestampToDate(data.checkIn);
  const checkOut = timestampToDate(data.checkOut);

  const apartment = apartments.find((item) => item.id === apartmentId);

  if (!apartment) {
    throw new Error("La habitación asociada a esta reserva ya no existe.");
  }

  const reservations = await getReservations();
  const now = Date.now();

  const occupiedUnits = reservations.filter((reservation) => {
    if (
      reservation.id === reservationId ||
      reservation.apartmentId !== apartmentId
    ) {
      return false;
    }

    if (
      reservation.status === "cancelled" ||
      reservation.status === "expired" ||
      reservation.status === "checked-out"
    ) {
      return false;
    }

    if (
      reservation.status === "pending" &&
      reservation.expiresAt.getTime() <= now
    ) {
      return false;
    }

    return rangesOverlap(
      checkIn,
      checkOut,
      reservation.checkIn,
      reservation.checkOut,
    );
  }).length;

  if (occupiedUnits >= apartment.totalUnits) {
    throw new Error(
      "No se puede recuperar esta reserva porque la habitación ya fue reservada para esas fechas.",
    );
  }

  await updateDoc(reservationReference, {
    status: "confirmed",
    confirmedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const cancelReservation = async (reservationId: string) => {
  await updateDoc(doc(db, COLLECTION_NAME, reservationId), {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
};

export const checkInReservation = async (reservationId: string) => {
  await updateDoc(doc(db, COLLECTION_NAME, reservationId), {
    status: "checked-in",
    updatedAt: serverTimestamp(),
  });
};

export const checkOutReservation = async (reservationId: string) => {
  await updateDoc(doc(db, COLLECTION_NAME, reservationId), {
    status: "checked-out",
    updatedAt: serverTimestamp(),
  });
};
