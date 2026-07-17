import {
  BedDouble,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getReservations } from "../../services/reservationService";
import OccupancyCalendar from "../components/OccupancyCalendar";

type Reservations = Awaited<ReturnType<typeof getReservations>>;
type Reservation = Reservations[number];

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

const reservationOccupiesDay = (reservation: Reservation, day: Date) => {
  if (
    !reservation.checkIn ||
    !reservation.checkOut ||
    reservation.status === "cancelled" ||
    reservation.status === "checked-out"
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

const formatShortDate = (date?: Date | null) => {
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const getStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    "checked-in": "Alojado",
    "checked-out": "Finalizada",
    cancelled: "Cancelada",
  };

  return labels[status ?? ""] ?? status ?? "Sin estado";
};

const getStatusClasses = (status?: string) => {
  const classes: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "checked-in": "bg-[#eef1f6] text-[#26354a] ring-[#d7deea]",
    "checked-out": "bg-neutral-100 text-neutral-600 ring-neutral-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    classes[status ?? ""] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200"
  );
};

const Dashboard = () => {
  const [reservations, setReservations] = useState<Reservations>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReservations();

      const sortedReservations = [...data].sort(
        (firstReservation, secondReservation) => {
          const firstDate = firstReservation.createdAt?.getTime?.() ?? 0;

          const secondDate = secondReservation.createdAt?.getTime?.() ?? 0;

          return secondDate - firstDate;
        },
      );

      setReservations(sortedReservations);
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

    const occupiedToday = reservations.filter((reservation) =>
      reservationOccupiesDay(reservation, today),
    );

    const arrivalsToday = reservations.filter(
      (reservation) =>
        reservation.status !== "cancelled" &&
        reservation.status !== "checked-out" &&
        isSameDay(reservation.checkIn, today),
    );

    const pendingReservations = reservations.filter(
      (reservation) => reservation.status === "pending",
    );

    return {
      availableRooms: Math.max(TOTAL_ROOMS - occupiedToday.length, 0),
      arrivals: arrivalsToday.length,
      pending: pendingReservations.length,
    };
  }, [reservations]);

  const recentReservations = useMemo(
    () => reservations.slice(0, 5),
    [reservations],
  );

  const todayReservations = useMemo(() => {
    const today = normalizeDate(new Date());

    return reservations
      .filter(
        (reservation) =>
          reservationOccupiesDay(reservation, today) ||
          isSameDay(reservation.checkIn, today) ||
          isSameDay(reservation.checkOut, today),
      )
      .slice(0, 5);
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

        <button
          type="button"
          onClick={() => void loadReservations()}
          disabled={loading}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#ded8d1] bg-white px-3 text-xs font-medium text-[#273246] transition hover:border-[#b67b45] hover:text-[#9a6235] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
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
          totalRooms={TOTAL_ROOMS}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <section className="min-w-0 rounded-2xl border border-[#e7e1da] bg-[#fffdfb] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b67b45] sm:text-xs">
                Actividad
              </p>

              <h2 className="mt-1 font-serif text-xl font-semibold text-[#172033]">
                Reservas recientes
              </h2>
            </div>

            <Link
              to="/admin/reservas"
              className="inline-flex items-center gap-1 self-start text-xs font-medium text-[#9a6235] transition hover:text-[#744827] sm:self-auto sm:text-sm"
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[#ece6df]">
            {loading ? (
              <p className="py-5 text-sm text-neutral-500">
                Cargando reservas...
              </p>
            ) : recentReservations.length === 0 ? (
              <p className="py-6 text-sm text-neutral-500">
                Todavía no hay reservas registradas.
              </p>
            ) : (
              recentReservations.map((reservation) => (
                <article
                  key={reservation.id}
                  className="flex min-w-0 flex-col gap-2 py-3 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#273246]">
                      {reservation.guestName || "Huésped"}
                    </p>

                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatShortDate(reservation.checkIn)} —{" "}
                      {formatShortDate(reservation.checkOut)}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 md:justify-end">
                    <p className="max-w-full truncate text-xs text-neutral-500 md:max-w-44">
                      {reservation.apartmentName ?? "Habitación"}
                    </p>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${getStatusClasses(
                        reservation.status,
                      )}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="min-w-0 rounded-2xl border border-[#e7e1da] bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b67b45] sm:text-xs">
            Hoy
          </p>

          <h2 className="mt-1 font-serif text-xl font-semibold text-[#172033]">
            Movimiento del día
          </h2>

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="text-sm text-neutral-500">Cargando actividad...</p>
            ) : todayReservations.length === 0 ? (
              <div className="rounded-xl bg-[#f7f3ee] px-4 py-5 text-center">
                <p className="text-sm font-medium text-[#273246]">
                  Día tranquilo
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  No hay movimientos registrados para hoy.
                </p>
              </div>
            ) : (
              todayReservations.map((reservation) => (
                <article
                  key={reservation.id}
                  className="min-w-0 rounded-xl border border-[#ece6df] p-3"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#273246]">
                        {reservation.guestName || "Huésped"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {reservation.apartmentName ?? "Habitación"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${getStatusClasses(
                        reservation.status,
                      )}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-neutral-500 sm:grid-cols-2 sm:gap-3">
                    <span>Entrada: {formatShortDate(reservation.checkIn)}</span>

                    <span className="sm:text-right">
                      Salida: {formatShortDate(reservation.checkOut)}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Dashboard;
