import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";
import type {
  CreateVacationPeriodInput,
  VacationPeriod,
} from "../types/vacation";

const COLLECTION_NAME = "vacationPeriods";
const vacationPeriodsCollection = collection(db, COLLECTION_NAME);
const DAY_IN_MILLISECONDS = 86_400_000;

const normalizeDate = (date: Date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const timestampToDate = (value: unknown) => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  throw new Error("La fecha guardada en Firestore no es válida.");
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
};

const rangesOverlap = (
  firstStart: Date,
  firstEndExclusive: Date,
  secondStart: Date,
  secondEndExclusive: Date,
) => {
  return firstStart < secondEndExclusive && firstEndExclusive > secondStart;
};

export const formatVacationDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const getVacationPeriods = async (): Promise<VacationPeriod[]> => {
  const snapshot = await getDocs(query(vacationPeriodsCollection));

  return snapshot.docs
    .map((document) => {
      const data = document.data();

      return {
        id: document.id,
        startDate: timestampToDate(data.startDate),
        endDate: timestampToDate(data.endDate),
        note: data.note ?? "Modo vacaciones",
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } satisfies VacationPeriod;
    })
    .sort((first, second) => first.startDate.getTime() - second.startDate.getTime());
};

export const getVacationConflict = (
  checkIn: Date,
  checkOut: Date,
  periods: VacationPeriod[],
) => {
  const normalizedCheckIn = normalizeDate(checkIn);
  const normalizedCheckOut = normalizeDate(checkOut);

  return (
    periods.find((period) =>
      rangesOverlap(
        normalizedCheckIn,
        normalizedCheckOut,
        normalizeDate(period.startDate),
        addDays(normalizeDate(period.endDate), 1),
      ),
    ) ?? null
  );
};

export const getVacationBlockMessage = (period: VacationPeriod) => {
  return `No se pueden reservar esas fechas porque el alojamiento estará en modo vacaciones del ${formatVacationDate(period.startDate)} al ${formatVacationDate(period.endDate)}.`;
};

export const createVacationPeriod = async ({
  startDate,
  endDate,
  note,
}: CreateVacationPeriodInput) => {
  const normalizedStartDate = normalizeDate(startDate);
  const normalizedEndDate = normalizeDate(endDate);

  if (
    Number.isNaN(normalizedStartDate.getTime()) ||
    Number.isNaN(normalizedEndDate.getTime())
  ) {
    throw new Error("Las fechas del modo vacaciones no son válidas.");
  }

  if (normalizedEndDate < normalizedStartDate) {
    throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");
  }

  const periods = await getVacationPeriods();
  const conflict = getVacationConflict(
    normalizedStartDate,
    addDays(normalizedEndDate, 1),
    periods,
  );

  if (conflict) {
    throw new Error(
      `Ya existe un período de vacaciones que se cruza con esas fechas: del ${formatVacationDate(conflict.startDate)} al ${formatVacationDate(conflict.endDate)}.`,
    );
  }

  const numberOfDays =
    Math.floor(
      (normalizedEndDate.getTime() - normalizedStartDate.getTime()) /
        DAY_IN_MILLISECONDS,
    ) + 1;

  if (numberOfDays < 1) {
    throw new Error("El período de vacaciones debe tener al menos un día.");
  }

  await addDoc(vacationPeriodsCollection, {
    startDate: Timestamp.fromDate(normalizedStartDate),
    endDate: Timestamp.fromDate(normalizedEndDate),
    note: note?.trim() || "Modo vacaciones",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const deleteVacationPeriod = async (periodId: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, periodId));
};
