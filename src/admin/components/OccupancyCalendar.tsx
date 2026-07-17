import {
  BedDouble,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Reservation = {
  id: string;
  guestName?: string;
  guestEmail?: string;

  apartmentId?: string;
  apartmentName?: string;
  roomType?: string;

  guests?: number;
  status?: string;

  checkIn?: Date | null;
  checkOut?: Date | null;

  // Compatibilidad con la versión anterior.
  from?: Date | null;
  to?: Date | null;
};

type OccupancyCalendarProps = {
  reservations: Reservation[];
  totalRooms: number;
};

type RoomCategory = "single" | "double" | "triple";

type RoomAvailability = {
  title: string;
  description: string;
  total: number;
  occupied: number;
  available: number;
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const ROOM_INVENTORY: Record<
  RoomCategory,
  {
    title: string;
    description: string;
    total: number;
  }
> = {
  single: {
    title: "Individual",
    description: "Para 1 persona",
    total: 2,
  },
  double: {
    title: "Doble",
    description: "Para hasta 2 personas",
    total: 3,
  },
  triple: {
    title: "Triple",
    description: "Para hasta 3 personas",
    total: 2,
  },
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  "checked-in": "Con check-in",
  "checked-out": "Finalizada",
  cancelled: "Cancelada",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  "checked-in": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "checked-out": "bg-neutral-100 text-neutral-600 ring-neutral-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const formatCompleteDate = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);

const isSameDay = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const normalizeRoomValue = (value?: string) =>
  value
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim() ?? "";

const getReservationStart = (reservation: Reservation) =>
  reservation.checkIn ?? reservation.from ?? null;

const getReservationEnd = (reservation: Reservation) =>
  reservation.checkOut ?? reservation.to ?? null;

const isActiveReservation = (reservation: Reservation) =>
  reservation.status === "pending" ||
  reservation.status === "confirmed" ||
  reservation.status === "checked-in";

const reservationOccupiesDay = (reservation: Reservation, day: Date) => {
  const startDate = getReservationStart(reservation);
  const endDate = getReservationEnd(reservation);

  if (!startDate || !endDate || !isActiveReservation(reservation)) {
    return false;
  }

  const normalizedDay = normalizeDate(day);
  const checkIn = normalizeDate(new Date(startDate));
  const checkOut = normalizeDate(new Date(endDate));

  // La fecha de salida no cuenta como una noche ocupada.
  return normalizedDay >= checkIn && normalizedDay < checkOut;
};

const getReservationRoomCategory = (
  reservation: Reservation,
): RoomCategory | null => {
  const values = [
    reservation.roomType,
    reservation.apartmentId,
    reservation.apartmentName,
  ]
    .filter(Boolean)
    .map((value) => normalizeRoomValue(value));

  const value = values.join(" ");

  if (
    value.includes("single") ||
    value.includes("individual") ||
    value.includes("1 persona") ||
    value.includes("una persona")
  ) {
    return "single";
  }

  if (
    value.includes("double") ||
    value.includes("doble") ||
    value.includes("2 personas") ||
    value.includes("dos personas")
  ) {
    return "double";
  }

  if (
    value.includes("triple") ||
    value.includes("3 personas") ||
    value.includes("tres personas")
  ) {
    return "triple";
  }

  return null;
};

const getAvailabilityByCategory = (
  dayReservations: Reservation[],
): Record<RoomCategory, RoomAvailability> => {
  const occupied: Record<RoomCategory, number> = {
    single: 0,
    double: 0,
    triple: 0,
  };

  dayReservations.forEach((reservation) => {
    const category = getReservationRoomCategory(reservation);

    if (category) {
      occupied[category] += 1;
    }
  });

  return {
    single: {
      ...ROOM_INVENTORY.single,
      occupied: occupied.single,
      available: Math.max(ROOM_INVENTORY.single.total - occupied.single, 0),
    },
    double: {
      ...ROOM_INVENTORY.double,
      occupied: occupied.double,
      available: Math.max(ROOM_INVENTORY.double.total - occupied.double, 0),
    },
    triple: {
      ...ROOM_INVENTORY.triple,
      occupied: occupied.triple,
      available: Math.max(ROOM_INVENTORY.triple.total - occupied.triple, 0),
    },
  };
};

const getOccupancyStyle = (occupiedRooms: number, totalRooms: number) => {
  const percentage = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  if (occupiedRooms === 0) {
    return {
      label: "Todo disponible",
      border: "border-neutral-200",
      background: "bg-white",
      bar: "bg-neutral-300",
      text: "text-neutral-500",
    };
  }

  if (percentage < 40) {
    return {
      label: "Ocupación baja",
      border: "border-emerald-200",
      background: "bg-emerald-50/50",
      bar: "bg-emerald-400",
      text: "text-emerald-700",
    };
  }

  if (percentage < 70) {
    return {
      label: "Ocupación media",
      border: "border-amber-200",
      background: "bg-amber-50/60",
      bar: "bg-amber-400",
      text: "text-amber-700",
    };
  }

  if (percentage < 100) {
    return {
      label: "Poca disponibilidad",
      border: "border-orange-200",
      background: "bg-orange-50/60",
      bar: "bg-orange-400",
      text: "text-orange-700",
    };
  }

  return {
    label: "Completo",
    border: "border-red-200",
    background: "bg-red-50/60",
    bar: "bg-red-400",
    text: "text-red-700",
  };
};

const getAvailabilityStyle = (available: number, total: number) => {
  if (available === 0) {
    return {
      container: "border-red-200 bg-red-50",
      number: "text-red-700",
      badge: "bg-red-100 text-red-700",
      label: "Sin disponibilidad",
    };
  }

  if (available === 1 && total > 1) {
    return {
      container: "border-amber-200 bg-amber-50",
      number: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
      label: "Última disponible",
    };
  }

  return {
    container: "border-emerald-200 bg-emerald-50",
    number: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    label: "Disponible",
  };
};

const OccupancyCalendar = ({
  reservations,
  totalRooms,
}: OccupancyCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // JavaScript comienza la semana el domingo.
    // Esto lo transforma para comenzar el lunes.
    const leadingEmptyDays = (firstDayOfMonth.getDay() + 6) % 7;

    const days: Array<Date | null> = [];

    for (let index = 0; index < leadingEmptyDays; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const selectedReservations = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return reservations.filter((reservation) =>
      reservationOccupiesDay(reservation, selectedDate),
    );
  }, [reservations, selectedDate]);

  const selectedAvailability = useMemo(
    () => getAvailabilityByCategory(selectedReservations),
    [selectedReservations],
  );

  const selectedOccupiedRooms = Math.min(
    selectedReservations.length,
    totalRooms,
  );

  const selectedAvailableRooms = Math.max(
    totalRooms - selectedOccupiedRooms,
    0,
  );

  const selectedPercentage =
    totalRooms > 0 ? Math.round((selectedOccupiedRooms / totalRooms) * 100) : 0;

  const selectedOccupancyStyle = getOccupancyStyle(
    selectedOccupiedRooms,
    totalRooms,
  );

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (previousMonth) =>
        new Date(previousMonth.getFullYear(), previousMonth.getMonth() - 1, 1),
    );

    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (previousMonth) =>
        new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1),
    );

    setSelectedDate(null);
  };

  return (
    <>
      <section className="rounded-3xl border border-[#e7e1da] bg-[#fffdfb] p-4 shadow-[0_14px_40px_rgba(32,28,24,0.05)] sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b67b45]">
              Disponibilidad mensual
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#172033]">
              Calendario de habitaciones
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Tocá un día para consultar habitaciones individuales, dobles y
              triples.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="rounded-xl border border-[#e3ddd6] bg-white p-2.5 text-[#273246] transition hover:border-[#b67b45] hover:text-[#9a6235]"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <p className="min-w-40 text-center text-sm font-semibold capitalize text-[#172033]">
              {formatMonth(currentMonth)}
            </p>

            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-xl border border-[#e3ddd6] bg-white p-2.5 text-[#273246] transition hover:border-[#b67b45] hover:text-[#9a6235]"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[720px]">
            <div className="mb-3 grid grid-cols-7 gap-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-28 rounded-2xl bg-[#f8f6f3]"
                    />
                  );
                }

                const dayReservations = reservations.filter((reservation) =>
                  reservationOccupiesDay(reservation, day),
                );

                const occupiedRooms = Math.min(
                  dayReservations.length,
                  totalRooms,
                );

                const availableRooms = Math.max(totalRooms - occupiedRooms, 0);

                const percentage =
                  totalRooms > 0
                    ? Math.round((occupiedRooms / totalRooms) * 100)
                    : 0;

                const occupancyStyle = getOccupancyStyle(
                  occupiedRooms,
                  totalRooms,
                );

                const isToday = isSameDay(day, new Date());

                const isSelected =
                  selectedDate !== null && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    aria-label={`Ver disponibilidad del ${formatCompleteDate(
                      day,
                    )}`}
                    className={`min-h-28 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-[#b67b45] hover:shadow-md ${
                      occupancyStyle.border
                    } ${occupancyStyle.background} ${
                      isSelected ? "ring-2 ring-[#b67b45]/25" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday ? "bg-[#172033] text-white" : "text-[#172033]"
                        }`}
                      >
                        {day.getDate()}
                      </span>

                      <span
                        className={`text-[10px] font-semibold ${occupancyStyle.text}`}
                      >
                        {availableRooms} libres
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-end justify-between gap-2">
                        <p className="text-sm font-semibold text-[#172033]">
                          {occupiedRooms}/{totalRooms}
                        </p>

                        <span className="text-[10px] font-medium text-neutral-500">
                          ocupadas
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
                        <div
                          className={`h-full rounded-full transition-all ${occupancyStyle.bar}`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>

                      <p
                        className={`mt-2 text-[10px] font-medium ${occupancyStyle.text}`}
                      >
                        {occupancyStyle.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#ece6df] pt-5 text-xs text-neutral-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-neutral-300" />
            Todo disponible
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            Ocupación baja
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            Ocupación media
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-400" />
            Poca disponibilidad
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            Completo
          </span>
        </div>
      </section>

      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/45 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDate(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="availability-modal-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#e7e1da] bg-[#fffdfb] p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b67b45]">
                  Disponibilidad del día
                </p>

                <h3
                  id="availability-modal-title"
                  className="mt-2 font-serif text-2xl font-semibold capitalize text-[#172033]"
                >
                  {formatCompleteDate(selectedDate)}
                </h3>

                <p className="mt-2 text-sm text-neutral-500">
                  Consultá qué habitación puede recibir a 1, 2 o 3 personas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="rounded-xl border border-[#e3ddd6] bg-white p-2 text-[#273246] transition hover:bg-[#f7f3ee]"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-xl font-semibold text-[#172033]">
                ¿Hay lugar para alojarse?
              </h4>

              <p className="mt-1 text-sm text-neutral-500">
                La disponibilidad está separada según la capacidad de cada
                habitación.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(
                  Object.entries(selectedAvailability) as Array<
                    [RoomCategory, RoomAvailability]
                  >
                ).map(([category, room]) => {
                  const styles = getAvailabilityStyle(
                    room.available,
                    room.total,
                  );

                  return (
                    <article
                      key={category}
                      className={`rounded-2xl border p-4 ${styles.container}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#172033]">
                            {room.title}
                          </p>

                          <p className="mt-1 text-xs text-neutral-600">
                            {room.description}
                          </p>
                        </div>

                        <BedDouble className="h-5 w-5 shrink-0 text-[#b67b45]" />
                      </div>

                      <p
                        className={`mt-5 text-3xl font-semibold ${styles.number}`}
                      >
                        {room.available}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-600">
                        {room.available === 1
                          ? "habitación disponible"
                          : "habitaciones disponibles"}{" "}
                        de {room.total}
                      </p>

                      <span
                        className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}
                      >
                        {styles.label}
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e7e1da] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#172033]">
                    Resumen general
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Total de habitaciones del alojamiento
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedOccupancyStyle.text} bg-neutral-50`}
                >
                  {selectedPercentage}% ocupado
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f8f6f3] p-3">
                  <p className="text-2xl font-semibold text-[#172033]">
                    {selectedOccupiedRooms}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">Ocupadas</p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-2xl font-semibold text-emerald-700">
                    {selectedAvailableRooms}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">Disponibles</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full ${selectedOccupancyStyle.bar}`}
                  style={{
                    width: `${Math.min(selectedPercentage, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-7">
              <h4 className="font-serif text-xl font-semibold text-[#172033]">
                Reservas que ocupan este día
              </h4>

              <div className="mt-4 space-y-3">
                {selectedReservations.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-[#ddd5cd] bg-white py-10 text-center text-sm text-neutral-500">
                    No hay reservas activas para este día. Todas las
                    habitaciones están disponibles.
                  </p>
                ) : (
                  selectedReservations.map((reservation) => (
                    <article
                      key={reservation.id}
                      className="rounded-2xl border border-[#e7e1da] bg-white p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#172033]">
                            {reservation.guestName ||
                              reservation.guestEmail ||
                              "Huésped"}
                          </p>

                          <p className="mt-1 text-sm text-neutral-500">
                            {reservation.apartmentName ||
                              "Habitación sin categoría"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                            statusClasses[reservation.status ?? ""] ??
                            "bg-neutral-100 text-neutral-600 ring-neutral-200"
                          }`}
                        >
                          {statusLabels[reservation.status ?? ""] ??
                            reservation.status ??
                            "Sin estado"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
                        <UsersRound className="h-4 w-4 text-[#b67b45]" />
                        {reservation.guests ?? 0} huésped
                        {reservation.guests === 1 ? "" : "es"}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OccupancyCalendar;
