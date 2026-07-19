import {
  BedDouble,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { VacationPeriod } from "../../types/vacation";

type Reservation = {
  id: string;
  guestName?: string;
  guestEmail?: string;
  estimatedCheckInTime?: string;
  observations?: string;

  apartmentId?: string;
  apartmentName?: string;
  roomType?: string;

  guests?: number;
  status?: string;

  checkIn?: Date | null;
  checkOut?: Date | null;

  from?: Date | null;
  to?: Date | null;
};

type OccupancyCalendarProps = {
  reservations: Reservation[];
  vacationPeriods: VacationPeriod[];
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
  "checked-in": "Alojado",
  "checked-out": "Finalizada",
  cancelled: "Cancelada",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "checked-in": "bg-[#eef1f6] text-[#26354a] ring-[#d7deea]",
  "checked-out": "bg-neutral-100 text-neutral-600 ring-neutral-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const normalizeDate = (date: Date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const isSameDay = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

const formatCompleteDate = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatMobileDay = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(date);

const formatMobileWeekday = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
  }).format(date);

const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);

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

  return normalizedDay >= checkIn && normalizedDay < checkOut;
};

const vacationIncludesDay = (period: VacationPeriod, day: Date) => {
  const normalizedDay = normalizeDate(day);

  return (
    normalizedDay >= normalizeDate(period.startDate) &&
    normalizedDay <= normalizeDate(period.endDate)
  );
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

  const combinedValue = values.join(" ");

  if (
    combinedValue.includes("single") ||
    combinedValue.includes("individual") ||
    combinedValue.includes("1 persona") ||
    combinedValue.includes("una persona")
  ) {
    return "single";
  }

  if (
    combinedValue.includes("double") ||
    combinedValue.includes("doble") ||
    combinedValue.includes("2 personas") ||
    combinedValue.includes("dos personas")
  ) {
    return "double";
  }

  if (
    combinedValue.includes("triple") ||
    combinedValue.includes("3 personas") ||
    combinedValue.includes("tres personas")
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
      label: "Libre",
      border: "border-neutral-200",
      background: "bg-neutral-50",
      bar: "bg-neutral-300",
      text: "text-neutral-600",
      dot: "bg-neutral-300",
    };
  }

  if (percentage < 40) {
    return {
      label: "Baja",
      border: "border-cyan-200",
      background: "bg-cyan-50/80",
      bar: "bg-cyan-500",
      text: "text-cyan-800",
      dot: "bg-cyan-500",
    };
  }

  if (percentage < 70) {
    return {
      label: "Media",
      border: "border-amber-200",
      background: "bg-amber-50/60",
      bar: "bg-amber-400",
      text: "text-amber-700",
      dot: "bg-amber-400",
    };
  }

  if (percentage < 100) {
    return {
      label: "Alta",
      border: "border-orange-200",
      background: "bg-orange-50/70",
      bar: "bg-orange-400",
      text: "text-orange-700",
      dot: "bg-orange-400",
    };
  }

  return {
    label: "Completo",
    border: "border-rose-300",
    background: "bg-rose-100/80",
    bar: "bg-rose-600",
    text: "text-rose-800",
    dot: "bg-rose-600",
  };
};

const getAvailabilityTextClass = (available: number) => {
  if (available === 0) {
    return "text-red-700";
  }

  if (available === 1) {
    return "text-amber-700";
  }

  return "text-emerald-700";
};

const getAvailabilityBadgeClasses = (available: number) => {
  if (available === 0) {
    return "bg-red-50 text-red-700";
  }

  if (available === 1) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

const OccupancyCalendar = ({
  reservations,
  vacationPeriods,
  totalRooms,
}: OccupancyCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedDate]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDate(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const leadingEmptyDays = (firstDay.getDay() + 6) % 7;

    const days: Array<Date | null> = [];

    for (let index = 0; index < leadingEmptyDays; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
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

  const selectedVacationPeriod = useMemo(() => {
    if (!selectedDate) {
      return null;
    }

    return vacationPeriods.find((period) =>
      vacationIncludesDay(period, selectedDate),
    );
  }, [selectedDate, vacationPeriods]);

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

  const availabilityEntries = Object.entries(selectedAvailability) as Array<
    [RoomCategory, RoomAvailability]
  >;

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

  const goToToday = () => {
    const today = new Date();

    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  return (
    <>
      <section className="w-full min-w-0 rounded-2xl border border-[#e7e1da] bg-[#fffdfb] p-3 shadow-[0_10px_30px_rgba(32,28,24,0.04)] lg:p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b67b45]">
              Disponibilidad mensual
            </p>

            <h2 className="mt-1 font-serif text-lg font-semibold text-[#172033] lg:text-xl">
              Calendario de habitaciones
            </h2>

            <p className="mt-0.5 hidden text-xs text-neutral-500 lg:block">
              Seleccioná un día para consultar la disponibilidad y las reservas.
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
            <button
              type="button"
              onClick={goToToday}
              className="h-9 shrink-0 rounded-lg border border-[#e3ddd6] bg-white px-3 text-xs font-semibold text-[#273246] transition hover:border-[#b67b45] hover:text-[#9a6235]"
            >
              HOY
            </button>

            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e3ddd6] bg-white text-[#273246] transition hover:border-[#b67b45] hover:text-[#9a6235]"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold capitalize text-[#172033] sm:min-w-36 sm:flex-none">
              {formatMonth(currentMonth)}
            </p>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e3ddd6] bg-white text-[#273246] transition hover:border-[#b67b45] hover:text-[#9a6235]"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="w-full min-w-0">
          <div className="mb-1.5 grid grid-cols-7 gap-1">
            {DAYS.map((day) => (
              <div
                key={day}
                className="truncate py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-neutral-400 sm:text-[10px]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-14 rounded-md bg-[#f8f6f3] sm:min-h-16 sm:rounded-lg lg:min-h-20"
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

              const vacationPeriod = vacationPeriods.find((period) =>
                vacationIncludesDay(period, day),
              );

              const today = isSameDay(day, new Date());

              const selected =
                selectedDate !== null && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  aria-label={`Ver disponibilidad del ${formatCompleteDate(
                    day,
                  )}`}
                  className={`min-h-14 min-w-0 overflow-hidden rounded-md border p-1 text-left transition hover:border-[#b67b45] sm:min-h-16 sm:rounded-lg sm:p-1.5 lg:min-h-20 lg:p-2 ${
                    vacationPeriod ? "border-violet-300 bg-violet-100/80" : `${occupancyStyle.border} ${occupancyStyle.background}`
                  } ${
                    selected ? "ring-2 ring-[#b67b45]/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold sm:h-6 sm:w-6 sm:text-xs ${
                        today ? "bg-[#172033] text-white" : "text-[#172033]"
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {vacationPeriod ? (
                      <span className="hidden rounded-full bg-violet-600 px-1.5 py-0.5 text-[8px] font-semibold text-white xl:inline">
                        Vacaciones
                      </span>
                    ) : (
                      <span className={`hidden text-[9px] font-semibold xl:inline ${occupancyStyle.text}`}>
                        {availableRooms} libres
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between xl:hidden">
                    <span
                      className={`h-2 w-2 rounded-full ${vacationPeriod ? "bg-violet-600" : occupancyStyle.dot}`}
                    />

                    <span className="text-[8px] font-semibold text-neutral-500 sm:text-[9px]">
                      {vacationPeriod ? "Vacaciones" : `${occupiedRooms}/${totalRooms}`}
                    </span>
                  </div>

                  <div className="mt-2 hidden xl:block">
                    {vacationPeriod ? (
                      <p className="text-[10px] font-semibold text-violet-800">Modo vacaciones</p>
                    ) : <><div className="flex items-end justify-between gap-1">
                      <p className="text-xs font-semibold text-[#172033]">
                        {occupiedRooms}/{totalRooms}
                      </p>

                      <span className="text-[9px] font-medium text-neutral-500">
                        ocupadas
                      </span>
                    </div>

                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/80">
                      <div
                        className={`h-full rounded-full ${occupancyStyle.bar}`}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </div>
                    </>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 hidden flex-wrap gap-x-4 gap-y-2 border-t border-[#ece6df] pt-3 text-[10px] text-neutral-600 lg:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            Libre
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            Baja
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Media
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            Alta
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
            Completo
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
            Modo vacaciones
          </span>
        </div>
      </section>

      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#172033]/50 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setSelectedDate(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="availability-title"
            className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[#fffdfb] shadow-2xl sm:max-h-[86vh] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-[#e7e1da]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 px-4 pb-3 pt-2 sm:px-5 sm:pb-3 sm:pt-5">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300 sm:hidden" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b67b45] sm:block">
                    Disponibilidad del día
                  </p>

                  <div className="sm:hidden">
                    <p className="font-serif text-xl font-semibold capitalize text-[#172033]">
                      {formatMobileDay(selectedDate)}
                    </p>

                    <p className="mt-0.5 text-sm capitalize text-neutral-500">
                      {formatMobileWeekday(selectedDate)}
                    </p>
                  </div>

                  <h3
                    id="availability-title"
                    className="mt-1 hidden font-serif text-xl font-semibold capitalize text-[#172033] sm:block"
                  >
                    {formatCompleteDate(selectedDate)}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e3ddd6] bg-white text-[#273246] transition hover:bg-[#f7f3ee]"
                  aria-label="Cerrar detalle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-5">
              {selectedVacationPeriod && (
                <section className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
                  <p className="text-sm font-semibold text-violet-900">Modo vacaciones</p>
                  <p className="mt-1 text-xs text-violet-800">
                    El alojamiento no acepta reservas en esta fecha.
                  </p>
                </section>
              )}

              <section>
                <h4 className="text-sm font-semibold text-[#172033] sm:font-serif sm:text-lg">
                  Habitaciones disponibles
                </h4>

                <div className="mt-3 divide-y divide-[#ece6df] rounded-xl border border-[#e7e1da] bg-white px-4 sm:hidden">
                  {availabilityEntries.map(([category, room]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#172033]">
                          {room.title}
                        </p>

                        <p className="mt-0.5 text-xs text-neutral-500">
                          {room.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`text-lg font-semibold ${getAvailabilityTextClass(
                            room.available,
                          )}`}
                        >
                          {room.available}
                        </p>

                        <p className="text-[10px] text-neutral-500">
                          de {room.total} libres
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 hidden grid-cols-3 gap-3 sm:grid">
                  {availabilityEntries.map(([category, room]) => (
                    <article
                      key={category}
                      className="rounded-xl border border-[#e7e1da] bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#172033]">
                            {room.title}
                          </p>

                          <p className="mt-0.5 text-[11px] text-neutral-500">
                            {room.description}
                          </p>
                        </div>

                        <BedDouble className="h-4 w-4 shrink-0 text-[#b67b45]" />
                      </div>

                      <p
                        className={`mt-3 text-2xl font-semibold ${getAvailabilityTextClass(
                          room.available,
                        )}`}
                      >
                        {room.available}
                      </p>

                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        de {room.total} disponibles
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getAvailabilityBadgeClasses(
                          room.available,
                        )}`}
                      >
                        {room.available === 0
                          ? "Sin disponibilidad"
                          : room.available === 1
                            ? "Última disponible"
                            : "Disponible"}
                      </span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mt-4 hidden rounded-xl border border-[#e7e1da] bg-white p-3 sm:block">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">
                      Ocupación general
                    </p>

                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      {selectedOccupiedRooms} ocupadas ·{" "}
                      {selectedAvailableRooms} disponibles
                    </p>
                  </div>

                  <span
                    className={`rounded-full bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold ${selectedOccupancyStyle.text}`}
                  >
                    {selectedPercentage}%
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full ${selectedOccupancyStyle.bar}`}
                    style={{
                      width: `${Math.min(selectedPercentage, 100)}%`,
                    }}
                  />
                </div>
              </section>

              <section className="mt-5">
                <div className="flex items-end justify-between gap-3">
                  <h4 className="text-sm font-semibold text-[#172033] sm:font-serif sm:text-lg">
                    Reservas del día
                  </h4>

                  <p className="text-xs text-neutral-500">
                    {selectedReservations.length}
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedReservations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#ddd5cd] bg-white px-4 py-5 text-center">
                      <p className="text-sm font-medium text-[#273246]">
                        No hay reservas activas
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        Todas las habitaciones están disponibles para este día.
                      </p>
                    </div>
                  ) : (
                    selectedReservations.map((reservation) => (
                      <article
                        key={reservation.id}
                        className="rounded-xl border border-[#e7e1da] bg-white px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#172033]">
                              {reservation.guestName ||
                                reservation.guestEmail ||
                                "Huésped"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-neutral-500">
                              {reservation.apartmentName ||
                                "Habitación sin categoría"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ring-inset ${
                              statusClasses[reservation.status ?? ""] ??
                              "bg-neutral-100 text-neutral-600 ring-neutral-200"
                            }`}
                          >
                            {statusLabels[reservation.status ?? ""] ??
                              reservation.status ??
                              "Sin estado"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                          <UsersRound className="h-3.5 w-3.5 shrink-0 text-[#b67b45]" />
                          {reservation.guests ?? 0}{" "}
                          {reservation.guests === 1 ? "huésped" : "huéspedes"}
                        </div>

                        <p className="mt-2 text-[11px] text-neutral-500">
                          Check-in aprox.:{" "}
                          <span className="font-medium text-neutral-700">
                            {reservation.estimatedCheckInTime || "No informado"}
                          </span>
                        </p>

                        {reservation.observations && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-neutral-500">
                            Obs.: {reservation.observations}
                          </p>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OccupancyCalendar;
