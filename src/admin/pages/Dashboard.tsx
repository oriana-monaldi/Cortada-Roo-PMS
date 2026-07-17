import {
  BedDouble,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  DoorOpen,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import OccupancyCalendar from "../components/OccupancyCalendar";
import { getReservations } from "../../services/reservationService";

type Reservations = Awaited<ReturnType<typeof getReservations>>;
type Reservation = Reservations[number];

const TOTAL_ROOMS = 7;

const ROOM_INVENTORY = [
  {
    title: "Habitaciones individuales",
    description: "Hasta 1 huésped",
    rooms: 2,
    capacity: 2,
    icon: UserRound,
  },
  {
    title: "Habitaciones dobles",
    description: "Hasta 2 huéspedes",
    rooms: 3,
    capacity: 6,
    icon: UsersRound,
  },
  {
    title: "Habitaciones triples",
    description: "Hasta 3 huéspedes",
    rooms: 2,
    capacity: 6,
    icon: BedDouble,
  },
];

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const isSameDay = (date: Date | undefined, target: Date) => {
  if (!date) return false;

  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
};

const isTodayInsideReservation = (reservation: Reservation, today: Date) => {
  const checkIn = reservation.checkIn;
  const checkOut = reservation.checkOut;

  if (!checkIn || !checkOut) return false;

  const normalizedCheckIn = new Date(checkIn);
  const normalizedCheckOut = new Date(checkOut);

  normalizedCheckIn.setHours(0, 0, 0, 0);
  normalizedCheckOut.setHours(0, 0, 0, 0);

  return today >= normalizedCheckIn && today < normalizedCheckOut;
};

const formatDate = (date?: Date) => {
  if (!date) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getStatusLabel = (status: Reservation["status"]) => {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    "checked-in": "Alojado",
    "checked-out": "Finalizada",
    cancelled: "Cancelada",
  };

  return labels[status] ?? status;
};

const getStatusClasses = (status: Reservation["status"]) => {
  const classes: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "checked-in": "bg-[#eef1f6] text-[#26354a] ring-[#d7deea]",
    "checked-out": "bg-neutral-100 text-neutral-600 ring-neutral-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
  };

  return classes[status] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200";
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

      setReservations(
        [...data].sort((a, b) => {
          const dateA = a.createdAt?.getTime?.() ?? 0;
          const dateB = b.createdAt?.getTime?.() ?? 0;

          return dateB - dateA;
        }),
      );
    } catch (err) {
      console.error("Error cargando el dashboard:", err);
      setError("No se pudieron cargar los datos del dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  const statistics = useMemo(() => {
    const today = startOfToday();

    const pending = reservations.filter(
      (reservation) => reservation.status === "pending",
    ).length;

    const confirmed = reservations.filter(
      (reservation) => reservation.status === "confirmed",
    ).length;

    const occupiedToday = reservations.filter(
      (reservation) =>
        reservation.status === "checked-in" ||
        (reservation.status === "confirmed" &&
          isTodayInsideReservation(reservation, today)),
    );

    const guestsToday = occupiedToday.reduce(
      (total, reservation) => total + Number(reservation.guests ?? 0),
      0,
    );

    const arrivalsToday = reservations.filter(
      (reservation) =>
        reservation.status !== "cancelled" &&
        isSameDay(reservation.checkIn, today),
    ).length;

    const departuresToday = reservations.filter(
      (reservation) =>
        reservation.status !== "cancelled" &&
        isSameDay(reservation.checkOut, today),
    ).length;

    return {
      pending,
      confirmed,
      occupiedRooms: Math.min(occupiedToday.length, TOTAL_ROOMS),
      availableRooms: Math.max(TOTAL_ROOMS - occupiedToday.length, 0),
      guestsToday,
      arrivalsToday,
      departuresToday,
    };
  }, [reservations]);

  const statCards = [
    {
      title: "Reservas pendientes",
      value: statistics.pending,
      helper: "Esperando confirmación",
      icon: CalendarClock,
      iconClasses: "bg-amber-50 text-amber-700",
    },
    {
      title: "Confirmadas",
      value: statistics.confirmed,
      helper: "Reservas activas",
      icon: CalendarCheck2,
      iconClasses: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Ocupadas hoy",
      value: `${statistics.occupiedRooms}/${TOTAL_ROOMS}`,
      helper: `${statistics.availableRooms} disponibles`,
      icon: BedDouble,
      iconClasses: "bg-[#f4ece4] text-[#9a6235]",
    },
    {
      title: "Huéspedes hoy",
      value: statistics.guestsToday,
      helper: "Personas alojadas",
      icon: UsersRound,
      iconClasses: "bg-[#eef1f6] text-[#26354a]",
    },
  ];

  const recentReservations = reservations.slice(0, 5);

  return (
    <section className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#b67b45]">
            Panel general
          </p>

          <h1 className="font-serif text-4xl font-semibold text-[#172033]">
            Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Estado actual de las reservas, la ocupación y la disponibilidad de
            Cortada Roo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReservations()}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ded8d1] bg-white px-4 text-sm font-medium text-[#273246] shadow-sm transition hover:border-[#b67b45] hover:text-[#9a6235] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-3xl border border-[#e7e1da] bg-[#fffdfb] p-5 shadow-[0_14px_40px_rgba(32,28,24,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    {card.title}
                  </p>

                  <p className="mt-4 text-3xl font-semibold tracking-tight text-[#172033]">
                    {loading ? "—" : card.value}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">{card.helper}</p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.iconClasses}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="flex items-center gap-4 rounded-2xl border border-[#e7e1da] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4ece4] text-[#9a6235]">
            <DoorOpen className="h-5 w-5" />
          </div>

          <div>
            <p className="text-2xl font-semibold text-[#172033]">
              {loading ? "—" : statistics.availableRooms}
            </p>
            <p className="text-sm text-neutral-500">
              Habitaciones disponibles hoy
            </p>
          </div>
        </article>

        <article className="flex items-center gap-4 rounded-2xl border border-[#e7e1da] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <p className="text-2xl font-semibold text-[#172033]">
              {loading ? "—" : statistics.arrivalsToday}
            </p>
            <p className="text-sm text-neutral-500">Llegadas de hoy</p>
          </div>
        </article>

        <article className="flex items-center gap-4 rounded-2xl border border-[#e7e1da] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef1f6] text-[#26354a]">
            <CalendarCheck2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-2xl font-semibold text-[#172033]">
              {loading ? "—" : statistics.departuresToday}
            </p>
            <p className="text-sm text-neutral-500">Salidas de hoy</p>
          </div>
        </article>
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <div className="min-w-0">
          <OccupancyCalendar
            reservations={reservations}
            totalRooms={TOTAL_ROOMS}
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#e7e1da] bg-[#fffdfb] p-6 shadow-[0_14px_40px_rgba(32,28,24,0.05)]">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b67b45]">
                Inventario
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-[#172033]">
                Habitaciones
              </h2>
            </div>

            <div className="space-y-3">
              {ROOM_INVENTORY.map((room) => {
                const Icon = room.icon;

                return (
                  <article
                    key={room.title}
                    className="flex items-center gap-4 rounded-2xl border border-[#ece6df] bg-white p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4ece4] text-[#9a6235]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#273246]">
                        {room.title}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {room.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-semibold text-[#172033]">
                        {room.rooms}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {room.capacity} plazas
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#ece6df] pt-5">
              <span className="text-sm text-neutral-500">Capacidad total</span>
              <span className="font-semibold text-[#172033]">
                7 habitaciones · 14 huéspedes
              </span>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e7e1da] bg-[#fffdfb] p-6 shadow-[0_14px_40px_rgba(32,28,24,0.05)]">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b67b45]">
                Actividad
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-[#172033]">
                Reservas recientes
              </h2>
            </div>

            {loading ? (
              <p className="text-sm text-neutral-500">Cargando reservas...</p>
            ) : recentReservations.length === 0 ? (
              <p className="rounded-2xl bg-[#f7f3ee] px-4 py-5 text-sm text-neutral-500">
                Todavía no hay reservas registradas.
              </p>
            ) : (
              <div className="space-y-3">
                {recentReservations.map((reservation) => (
                  <article
                    key={reservation.id}
                    className="rounded-2xl border border-[#ece6df] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#273246]">
                          {reservation.guestName || "Huésped"}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {formatDate(reservation.checkIn)} —{" "}
                          {formatDate(reservation.checkOut)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${getStatusClasses(
                          reservation.status,
                        )}`}
                      >
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                      <span>
                        {reservation.guests ?? 0}{" "}
                        {Number(reservation.guests) === 1
                          ? "huésped"
                          : "huéspedes"}
                      </span>

                      <span>{reservation.apartmentName ?? "Habitación"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
};

export default Dashboard;
