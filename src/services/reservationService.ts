import {
  addDoc,
  collection,
  doc,
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

    return {
      id: document.id,

      apartmentId: data.apartmentId,
      apartmentName: data.apartmentName,

      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,

      guests: data.guests,

      checkIn: timestampToDate(data.checkIn),
      checkOut: timestampToDate(data.checkOut),
      nights: data.nights,

      pricePerNight: data.pricePerNight,
      totalPrice: data.totalPrice,

      status: data.status,

      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } satisfies Reservation;
  });
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

  const reservations = await getReservations();

  const activeReservations = reservations.filter(
    (reservation) =>
      reservation.status !== "cancelled" &&
      reservation.status !== "checked-out",
  );

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

  const documentReference = await addDoc(reservationsCollection, {
    apartmentId: reservation.apartmentId,
    apartmentName: reservation.apartmentName,

    guestName: reservation.guestName.trim(),
    guestEmail: reservation.guestEmail.trim().toLowerCase(),
    guestPhone: reservation.guestPhone.trim(),

    guests: reservation.guests,

    checkIn: Timestamp.fromDate(normalizeDate(reservation.checkIn)),
    checkOut: Timestamp.fromDate(normalizeDate(reservation.checkOut)),

    nights,
    pricePerNight: reservation.pricePerNight,
    totalPrice,

    status: "pending",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: documentReference.id,
    nights,
    totalPrice,
  };
};

export const confirmReservation = async (reservationId: string) => {
  await updateDoc(doc(db, COLLECTION_NAME, reservationId), {
    status: "confirmed",
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
