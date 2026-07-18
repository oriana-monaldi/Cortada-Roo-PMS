import { AlertTriangle, CalendarOff, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import BookingDateRangePicker from "../../components/ui/BookingDateRangePicker";
import { getReservations } from "../../services/reservationService";
import {
  createVacationPeriod,
  deleteVacationPeriod,
  formatVacationDate,
  getVacationPeriods,
} from "../../services/vacationService";
import type { VacationPeriod } from "../../types/vacation";

type Reservations = Awaited<ReturnType<typeof getReservations>>;

const getStatusLabel = (period: VacationPeriod) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(period.startDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(period.endDate);
  endDate.setHours(0, 0, 0, 0);

  if (today < startDate) {
    return "Próximo";
  }

  if (today > endDate) {
    return "Finalizado";
  }

  return "Activo";
};

const getStatusStyles = (period: VacationPeriod) => {
  const status = getStatusLabel(period);

  if (status === "Activo") {
    return "bg-red-100 text-red-700";
  }

  if (status === "Próximo") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-neutral-100 text-neutral-600";
};

const formatReservationDate = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

const isActiveReservation = (reservation: Reservations[number]) => {
  if (
    reservation.status === "cancelled" ||
    reservation.status === "expired" ||
    reservation.status === "checked-out"
  ) {
    return false;
  }

  return (
    reservation.status !== "pending" || reservation.expiresAt.getTime() > Date.now()
  );
};

const overlapsVacationPeriod = (
  reservation: Reservations[number],
  startDate: Date,
  endDate: Date,
) => {
  const vacationStart = new Date(startDate);
  vacationStart.setHours(0, 0, 0, 0);

  const vacationEndExclusive = new Date(endDate);
  vacationEndExclusive.setHours(0, 0, 0, 0);
  vacationEndExclusive.setDate(vacationEndExclusive.getDate() + 1);

  const checkIn = new Date(reservation.checkIn);
  checkIn.setHours(0, 0, 0, 0);

  const checkOut = new Date(reservation.checkOut);
  checkOut.setHours(0, 0, 0, 0);

  return checkIn < vacationEndExclusive && checkOut > vacationStart;
};

const Settings = () => {
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [reservations, setReservations] = useState<Reservations>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadVacationPeriods = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const periods = await getVacationPeriods();
      setVacationPeriods(periods);
    } catch (currentError) {
      console.error(
        "Error al cargar los períodos de vacaciones:",
        currentError,
      );
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No pudimos cargar el modo vacaciones.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVacationPeriods();
  }, [loadVacationPeriods]);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setReservations(await getReservations());
      } catch (currentError) {
        console.error(
          "Error al cargar las reservas para modo vacaciones:",
          currentError,
        );
      }
    };

    void loadReservations();
  }, []);

  const activePeriodsCount = useMemo(
    () =>
      vacationPeriods.filter(
        (period) => getStatusLabel(period) !== "Finalizado",
      ).length,
    [vacationPeriods],
  );

  const conflictingReservations = useMemo(() => {
    if (!selectedRange?.from || !selectedRange.to) {
      return [];
    }

    const startDate = selectedRange.from;
    const endDate = selectedRange.to;

    return reservations.filter(
      (reservation) =>
        isActiveReservation(reservation) &&
        overlapsVacationPeriod(
          reservation,
          startDate,
          endDate,
        ),
    );
  }, [reservations, selectedRange]);

  const handleSave = async () => {
    if (!selectedRange?.from || !selectedRange.to) {
      setError("Seleccioná la fecha de inicio y de finalización.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createVacationPeriod({
        startDate: selectedRange.from,
        endDate: selectedRange.to,
      });

      await loadVacationPeriods();
    } catch (currentError) {
      console.error("Error al guardar el modo vacaciones:", currentError);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No pudimos guardar el modo vacaciones.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (periodId: string) => {
    setDeletingId(periodId);
    setError("");

    try {
      await deleteVacationPeriod(periodId);
      await loadVacationPeriods();
    } catch (currentError) {
      console.error(
        "Error al eliminar el período de vacaciones:",
        currentError,
      );
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No pudimos eliminar el período de vacaciones.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
          Configuración
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-neutral-950">
          Modo vacaciones
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          Bloqueá un rango de fechas para que no haya ninguna habitación
          disponible en la web ni desde el alta interna.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f9ece0] text-[#9b6f45]">
              <CalendarOff size={22} strokeWidth={1.8} />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-neutral-950">
                Bloquear fechas
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Si cargás un período, el huésped no podrá seleccionarlo y verá
                el aviso de modo vacaciones.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Período de vacaciones
              </span>
              <BookingDateRangePicker
                selectedRange={selectedRange}
                onRangeChange={(range) => {
                  setSelectedRange(range);
                  setError("");
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#9b6f45] px-5 text-sm font-semibold text-white transition hover:bg-[#845b39] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Activar modo vacaciones"}
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-[#ece6df] bg-[#f8f5f1] px-4 py-3">
            <p className="text-xs font-semibold text-[#6a4d33]">
              Períodos activos o futuros
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {activePeriodsCount}{" "}
              {activePeriodsCount === 1
                ? "período cargado"
                : "períodos cargados"}
            </p>
          </div>

          {conflictingReservations.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-700"
                />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {conflictingReservations.length} {conflictingReservations.length === 1 ? "reserva coincide" : "reservas coinciden"} con estas vacaciones
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Ya existen estadías para estas fechas. Revisalas antes de
                    activar el bloqueo.
                  </p>
                </div>
              </div>

              <ul className="mt-3 space-y-2 border-t border-amber-200 pt-3">
                {conflictingReservations.map((reservation) => (
                  <li
                    key={reservation.id}
                    className="rounded-xl bg-white/70 px-3 py-2 text-xs text-amber-950"
                  >
                    <p className="font-semibold">
                      {reservation.guestName || reservation.guestEmail || "Huésped"}
                    </p>
                    <p className="mt-0.5 text-amber-800">
                      {reservation.apartmentName || "Habitación"} · {formatReservationDate(reservation.checkIn)} al {formatReservationDate(reservation.checkOut)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-neutral-950">
                Fechas bloqueadas
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Administrá todos los períodos en los que no se aceptan reservas.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
              <Loader2 size={18} className="animate-spin" />
              Cargando períodos...
            </div>
          ) : vacationPeriods.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-center">
              <p className="text-sm font-medium text-neutral-700">
                No hay períodos de vacaciones cargados.
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Cuando bloquees fechas, van a aparecer acá.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {vacationPeriods.map((period) => (
                <div
                  key={period.id}
                  className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatVacationDate(period.startDate)} al{" "}
                        {formatVacationDate(period.endDate)}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyles(period)}`}
                      >
                        {getStatusLabel(period)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-neutral-600">
                      {period.note || "Modo vacaciones"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDelete(period.id)}
                    disabled={deletingId === period.id}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={15} strokeWidth={1.9} />
                    {deletingId === period.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

export default Settings;
