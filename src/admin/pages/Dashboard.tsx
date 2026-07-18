import { BedDouble, CalendarClock, CalendarDays, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getReservations } from "../../services/reservationService";
import { getVacationPeriods } from "../../services/vacationService";
import OccupancyCalendar from "../components/OccupancyCalendar";

type Reservations = Awaited<ReturnType<typeof getReservations>>;
type Reservation = Reservations[number];
type VacationPeriods = Awaited<ReturnType<typeof getVacationPeriods>>;

const TOTAL_ROOMS = 7;

const normalizeDate = (date: Date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const isSameDay = (firstDate: Date | null | undefined, secondDate: Date) => {
  if (!firstDate) {
    return false;
  }

  return (
    normalizeDate(firstDate).getTime() === normalizeDate(secondDate).getTime()
  );
};

const isActiveReservation = (reservation: Reservation, now: number) => {
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
};

const reservationOccupiesDay = (reservation: Reservation, day: Date) => {
  if (
    !reservation.checkIn ||
    !reservation.checkOut ||
    !isActiveReservation(reservation, Date.now())
  ) {
    return false;
  }

  const normalizedDay = normalizeDate(day);
  const checkIn = normalizeDate(reservation.checkIn);
  const checkOut = normalizeDate(reservation.checkOut);

  return normalizedDay >= checkIn && normalizedDay < checkOut;
};

const formatToday = () =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

const Dashboard = () => {
  const [reservations, setReservations] = useState<Reservations>([]);
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriods>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const [data, vacations] = await Promise.all([
        getReservations(),
        getVacationPeriods(),
      ]);

      const sortedReservations = [...data].sort(
        (firstReservation, secondReservation) => {
          const firstDate = firstReservation.createdAt?.getTime?.() ?? 0;

          const secondDate = secondReservation.createdAt?.getTime?.() ?? 0;

          return secondDate - firstDate;
        },
      );

      setReservations(sortedReservations);
      setVacationPeriods(vacations);
    } catch (loadError) {
      console.error("Error cargando el dashboard:", loadError);

      setError("No se pudieron cargar los datos de recepción.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  const summary = useMemo(() => {
    const today = normalizeDate(new Date());
    const now = Date.now();

    const occupiedToday = reservations.filter((reservation) =>
      reservationOccupiesDay(reservation, today),
    );

    const arrivalsToday = reservations.filter(
      (reservation) =>
        (reservation.status === "confirmed" ||
          reservation.status === "checked-in") &&
        isSameDay(reservation.checkIn, today),
    );

    const pendingReservations = reservations.filter(
      (reservation) =>
        reservation.status === "pending" &&
        reservation.expiresAt.getTime() > now,
    );

    return {
      availableRooms: Math.max(TOTAL_ROOMS - occupiedToday.length, 0),
      arrivals: arrivalsToday.length,
      pending: pendingReservations.length,
    };
  }, [reservations]);

  const indicators = [
    {
      label: "Disponibles",
      value: summary.availableRooms,
      helper: `de ${TOTAL_ROOMS} habitaciones`,
      icon: BedDouble,
      iconClasses: "bg-emerald-50 text-emerald-700",
      valueClasses: "text-emerald-700",
    },
    {
      label: "Llegadas",
      value: summary.arrivals,
      helper: "programadas para hoy",
      icon: CalendarDays,
      iconClasses: "bg-[#eef1f6] text-[#26354a]",
      valueClasses: "text-[#172033]",
    },
    {
      label: "Pendientes",
      value: summary.pending,
      helper: "requieren atención",
      icon: CalendarClock,
      iconClasses: "bg-amber-50 text-amber-700",
      valueClasses: "text-amber-700",
    },
  ];

  return (
    <>
      <section className="mx-auto w-full min-w-0 max-w-[1440px] space-y-4 overflow-x-hidden sm:space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b67b45] sm:text-xs">
              Recepción
            </p>

            <h1 className="mt-1 font-serif text-2xl font-semibold text-[#172033] lg:text-3xl">
              Estado de hoy
            </h1>

            <p className="mt-1 text-xs capitalize text-neutral-500 sm:text-sm">
              {formatToday()}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void loadReservations()}
              disabled={loading}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#ded8d1] bg-white px-3 text-xs font-medium text-[#273246] transition hover:border-[#b67b45] hover:text-[#9a6235] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {indicators.map((indicator) => {
            const Icon = indicator.icon;

            return (
              <article
                key={indicator.label}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e7e1da] bg-white px-3 py-3 lg:px-4"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${indicator.iconClasses}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p
                      className={`text-xl font-semibold ${indicator.valueClasses}`}
                    >
                      {loading ? "—" : indicator.value}
                    </p>

                    <p className="text-xs font-medium text-[#273246] lg:text-sm">
                      {indicator.label}
                    </p>
                  </div>

                  <p className="mt-0.5 truncate text-[10px] text-neutral-500 lg:text-xs">
                    {indicator.helper}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="w-full min-w-0">
          <OccupancyCalendar
            reservations={reservations}
            vacationPeriods={vacationPeriods}
            totalRooms={TOTAL_ROOMS}
          />
        </div>
      </section>
    </>
  );
};

export default Dashboard;
