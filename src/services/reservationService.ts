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
import { auth } from "../firebase/config";
import {
  getVacationBlockMessage,
  getVacationConflict,
  getVacationPeriods,
} from "./vacationService";
import type {
  CreateAdminReservationInput,
  CreateReservationInput,
  Reservation,
  ReservationSource,
} from "../types/reservation";

const COLLECTION_NAME = "reservations";
const reservationsCollection = collection(db, COLLECTION_NAME);
const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
const backendBaseUrl = import.meta.env.DEV
  ? configuredBackendUrl || "http://localhost:3001"
  : configuredBackendUrl?.startsWith("https://")
    ? configuredBackendUrl
    : "/api";

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
const DEFAULT_RESERVATION_SOURCE: ReservationSource = "website";

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
      source: (data.source as ReservationSource) ?? DEFAULT_RESERVATION_SOURCE,

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

  const response = await fetch(`${backendBaseUrl}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      checkIn: normalizeDate(checkIn).toISOString(),
      checkOut: normalizeDate(checkOut).toISOString(),
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; occupiedByApartment?: Record<string, number> }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? "No pudimos consultar la disponibilidad.");
  }

  const occupiedByApartment = payload?.occupiedByApartment ?? {};

  return apartments.filter((apartment) => {
    if (apartment.capacity < guests) {
      return false;
    }

    const occupiedUnits = occupiedByApartment[apartment.id] ?? 0;

    return occupiedUnits < apartment.totalUnits;
  });
};

export const createReservation = async (
  reservation: CreateReservationInput,
) => {
  validateReservationDates(reservation.checkIn, reservation.checkOut);
  const vacationPeriods = await getVacationPeriods();
  const vacationConflict = getVacationConflict(
    reservation.checkIn,
    reservation.checkOut,
    vacationPeriods,
  );

  if (vacationConflict) {
    throw new Error(getVacationBlockMessage(vacationConflict));
  }

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
    source: reservation.source ?? DEFAULT_RESERVATION_SOURCE,

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

export const createAdminReservation = async (
  reservation: CreateAdminReservationInput,
) => {
  validateReservationDates(reservation.checkIn, reservation.checkOut);
  const vacationPeriods = await getVacationPeriods();
  const vacationConflict = getVacationConflict(
    reservation.checkIn,
    reservation.checkOut,
    vacationPeriods,
  );

  if (vacationConflict) {
    throw new Error(getVacationBlockMessage(vacationConflict));
  }

  if (!Number.isInteger(reservation.guests) || reservation.guests < 1) {
    throw new Error("La cantidad de huéspedes debe ser válida.");
  }

  if (reservation.observations.length > 300) {
    throw new Error("Las observaciones no pueden superar los 300 caracteres.");
  }

  const apartment = apartments.find(
    (item) => item.id === reservation.apartmentId,
  );

  if (!apartment) {
    throw new Error("La habitación seleccionada no existe.");
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
      "La habitación no está disponible para las fechas seleccionadas.",
    );
  }

  const nights = calculateNights(reservation.checkIn, reservation.checkOut);
  const totalPrice = nights * apartment.pricePerNight;
  const reservationCode = generateReservationCode();
  const now = new Date();

  const documentReference = await addDoc(reservationsCollection, {
    apartmentId: apartment.id,
    apartmentName: apartment.name,

    guestName: reservation.guestName.trim(),
    guestEmail: reservation.guestEmail.trim().toLowerCase(),
    guestPhone: reservation.guestPhone.trim(),
    source: reservation.source,

    estimatedCheckInTime: reservation.estimatedCheckInTime.trim(),
    observations: reservation.observations.trim(),

    guests: reservation.guests,

    checkIn: Timestamp.fromDate(normalizeDate(reservation.checkIn)),
    checkOut: Timestamp.fromDate(normalizeDate(reservation.checkOut)),

    nights,
    pricePerNight: apartment.pricePerNight,
    totalPrice,

    status: "confirmed",
    reservationCode,

    expiresAt: Timestamp.fromDate(now),
    confirmedAt: serverTimestamp(),

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: documentReference.id,
    reservationCode,
    nights,
    totalPrice,
  };
};

export const confirmReservation = async (reservationId: string) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Iniciá sesión como administrador para confirmar la reserva.");
  }

  const idToken = await currentUser.getIdToken();
  const response = await fetch(
    `${backendBaseUrl}/send-payment-email/${reservationId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; success?: boolean }
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message ??
        "No pudimos confirmar la reserva ni enviar el correo.",
    );
  }
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
