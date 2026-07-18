import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  confirmReservation,
  recoverExpiredReservation,
  getReservations,
} from "../../services/reservationService";
import type { Reservation, ReservationStatus } from "../../types/reservation";

type StatusFilter = "all" | ReservationStatus;

const statusOptions: Array<{
  value: StatusFilter;
  label: string;
}> = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "expired", label: "Expiradas" },
  { value: "checked-in", label: "Con check-in" },
  { value: "checked-out", label: "Finalizadas" },
  { value: "cancelled", label: "Canceladas" },
];

const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  expired: "Expirada",
  "checked-in": "Check-in realizado",
  "checked-out": "Finalizada",
  cancelled: "Cancelada",
};

const statusStyles: Record<ReservationStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  expired: "border-red-200 bg-red-50 text-red-700",
  "checked-in": "border-blue-200 bg-blue-50 text-blue-700",
  "checked-out": "border-neutral-200 bg-neutral-100 text-neutral-600",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

const sourceLabels: Record<string, string> = {
  website: "Página web",
  particular: "Particular",
  booking: "Booking",
  airbnb: "Airbnb",
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatPrice = (price: number) => {
  return price.toLocaleString("es-AR");
};

const getReservationPriority = (reservation: Reservation) => {
  switch (reservation.status) {
    case "pending":
      return reservation.expiresAt.getTime() > Date.now() ? 0 : 1;
    case "expired":
      return 1;
    case "confirmed":
      return 2;
    case "checked-in":
      return 3;
    case "checked-out":
      return 4;
    case "cancelled":
      return 5;
    default:
      return 6;
  }
};

const sortReservations = (reservations: Reservation[]) => {
  return [...reservations].sort((first, second) => {
    const firstPriority = getReservationPriority(first);
    const secondPriority = getReservationPriority(second);

    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority;
    }

    const firstCheckIn = first.checkIn?.getTime?.() ?? Number.MAX_SAFE_INTEGER;
    const secondCheckIn =
      second.checkIn?.getTime?.() ?? Number.MAX_SAFE_INTEGER;

    if (firstCheckIn !== secondCheckIn) {
      return firstCheckIn - secondCheckIn;
    }

    return second.createdAt.getTime() - first.createdAt.getTime();
  });
};

const getExpirationText = (reservation: Reservation) => {
  if (reservation.status === "expired") {
    return "El plazo de pago venció";
  }

  if (reservation.status !== "pending") {
    return null;
  }

  const remainingMilliseconds = reservation.expiresAt.getTime() - Date.now();

  if (remainingMilliseconds <= 0) {
    return "Pendiente de actualización: el plazo ya venció";
  }

  const totalMinutes = Math.ceil(remainingMilliseconds / 60_000);

  if (totalMinutes < 60) {
    return `Vence en ${totalMinutes} min`;
  }

  return `Vence el ${formatDateTime(reservation.expiresAt)}`;
};

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadReservations = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const result = await getReservations();
      const sortedReservations = sortReservations(result);
      setReservations(sortedReservations);
    } catch (currentError) {
      console.error("Error al cargar reservas:", currentError);
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No pudimos cargar las reservas.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => setSuccessMessage(""), 6_000);
    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadReservations(true);
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadReservations]);

  const filteredReservations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        reservation.guestName.toLowerCase().includes(normalizedSearch) ||
        reservation.guestEmail.toLowerCase().includes(normalizedSearch) ||
        reservation.guestPhone.toLowerCase().includes(normalizedSearch) ||
        reservation.apartmentName.toLowerCase().includes(normalizedSearch) ||
        reservation.reservationCode.toLowerCase().includes(normalizedSearch) ||
        reservation.id.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [reservations, searchTerm, statusFilter]);

  const updateReservationStatus = async (
    reservationId: string,
    action: () => Promise<void>,
    confirmationMessage?: string,
  ) => {
    setUpdatingId(reservationId);
    setActionError("");

    try {
      await action();
      await loadReservations(true);
      if (confirmationMessage) setSuccessMessage(confirmationMessage);
    } catch (currentError) {
      console.error("Error al actualizar reserva:", currentError);
      setActionError(
        currentError instanceof Error
          ? currentError.message
          : "No pudimos actualizar la reserva.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section>
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl sm:left-auto sm:right-6 sm:top-6 sm:translate-x-0"
        >
          <CheckCircle2
            size={22}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-900">
              Pago confirmado
            </p>
            <p className="mt-1 text-sm leading-5 text-emerald-800">
              {successMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="rounded-lg p-1 text-emerald-700 transition hover:bg-emerald-50"
            aria-label="Cerrar mensaje"
          >
            <X size={18} />
          </button>
        </div>
      )}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
            Gestión
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-neutral-950 sm:text-4xl">
            Reservas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Administrá solicitudes, pagos, vencimientos, ingresos y salidas de
            los huéspedes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReservations(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            strokeWidth={1.8}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isActive = statusFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <label className="relative block w-full xl:max-w-sm">
            <Search
              size={17}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar huésped, email o habitación"
              className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30"
            />
          </label>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-medium text-red-700">{actionError}</p>
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-[#9b6f45]" />
          <p className="mt-4 text-sm text-neutral-600">Cargando reservas...</p>
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadReservations()}
            className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && filteredReservations.length === 0 && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <CalendarDays
            size={34}
            strokeWidth={1.5}
            className="mx-auto text-[#a57b52]"
          />
          <h2 className="mt-4 font-serif text-xl font-semibold text-neutral-950">
            No encontramos reservas
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            No hay reservas que coincidan con los filtros seleccionados.
          </p>
        </div>
      )}

      {!loading && !error && filteredReservations.length > 0 && (
        <div className="mt-6 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredReservations.map((reservation) => {
            const isUpdating = updatingId === reservation.id;
            const expirationText = getExpirationText(reservation);
            const isExpanded = expandedId === reservation.id;

            return (
              <article
                key={reservation.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.04)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((current) =>
                      current === reservation.id ? null : reservation.id,
                    )
                  }
                  className="flex flex-1 flex-col w-full px-4 py-4 text-left transition hover:bg-neutral-50 sm:px-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-neutral-950">
                        {reservation.guestName}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyles[reservation.status]}`}
                        >
                          {statusLabels[reservation.status]}
                        </span>
                        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-600">
                          {sourceLabels[reservation.source] ?? "Sin origen"}
                        </span>
                        <span className="inline-flex rounded-full bg-[#f6f1ea] px-2.5 py-1 text-[10px] font-semibold text-[#8b6544]">
                          Código {reservation.reservationCode ?? reservation.id}
                        </span>
                      </div>

                      <div className="mt-2 min-h-[18px]">
                        {expirationText && (
                          <p
                            className={`text-[11px] font-semibold ${
                              reservation.status === "expired" ||
                              reservation.expiresAt.getTime() <= Date.now()
                                ? "text-red-700"
                                : "text-amber-700"
                            }`}
                          >
                            {expirationText}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-neutral-400">
                      {isExpanded ? (
                        <ChevronUp size={18} strokeWidth={2} />
                      ) : (
                        <ChevronDown size={18} strokeWidth={2} />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Habitación
                      </p>
                      <div className="mt-1 flex items-start gap-2 text-sm font-medium text-neutral-900">
                        <BedDouble
                          size={16}
                          strokeWidth={1.8}
                          className="mt-0.5 shrink-0 text-[#9b6f45]"
                        />
                        <span>{reservation.apartmentName}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Total
                      </p>
                      <p className="mt-1 font-serif text-xl font-bold text-neutral-950">
                        ${formatPrice(reservation.totalPrice)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Estadía
                      </p>
                      <div className="mt-1 flex items-start gap-2 text-sm text-neutral-800">
                        <CalendarDays
                          size={16}
                          strokeWidth={1.8}
                          className="mt-0.5 shrink-0 text-[#9b6f45]"
                        />
                        <div>
                          <p>{formatDate(reservation.checkIn)}</p>
                          <p className="text-neutral-500">
                            hasta {formatDate(reservation.checkOut)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Huéspedes
                      </p>
                      <div className="mt-1 flex items-start gap-2 text-sm font-medium text-neutral-900">
                        <UsersRound
                          size={16}
                          strokeWidth={1.8}
                          className="mt-0.5 shrink-0 text-[#9b6f45]"
                        />
                        <span>
                          {reservation.guests}{" "}
                          {reservation.guests === 1 ? "huésped" : "huéspedes"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-neutral-100 px-4 py-4 sm:px-5">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                            Contacto
                          </p>
                          <div className="mt-2 flex min-w-0 flex-col gap-2 text-sm text-neutral-600">
                            <a
                              href={`mailto:${reservation.guestEmail}`}
                              className="flex min-w-0 items-center gap-2 transition hover:text-neutral-950"
                            >
                              <Mail
                                size={16}
                                strokeWidth={1.7}
                                className="shrink-0 text-[#9b6f45]"
                              />
                              <span className="truncate">
                                {reservation.guestEmail}
                              </span>
                            </a>

                            <a
                              href={`tel:${reservation.guestPhone}`}
                              className="flex items-center gap-2 transition hover:text-neutral-950"
                            >
                              <Phone
                                size={16}
                                strokeWidth={1.7}
                                className="shrink-0 text-[#9b6f45]"
                              />
                              {reservation.guestPhone}
                            </a>
                          </div>
                        </div>

                        <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                            Check-in aprox.
                          </p>
                          <div className="mt-2 flex items-start gap-2 text-sm font-medium text-neutral-900">
                            <Clock3
                              size={16}
                              strokeWidth={1.8}
                              className="mt-0.5 shrink-0 text-[#9b6f45]"
                            />
                            <span>
                              {reservation.estimatedCheckInTime || "No informado"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                          Observaciones
                        </p>
                        <p
                          className="mt-2 line-clamp-4 break-words text-sm leading-6 text-neutral-700"
                          title={reservation.observations || "Sin observaciones"}
                        >
                          {reservation.observations || "Sin observaciones"}
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                <div className="mt-auto border-t border-neutral-100 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
                    {reservation.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(event) => {
                            event.stopPropagation();
                            void updateReservationStatus(reservation.id, () =>
                              confirmReservation(reservation.id),
                              "El pago se confirmó y el correo fue enviado al huésped.",
                            );
                          }}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          <Check size={16} strokeWidth={2} />
                          Confirmar pago
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(event) => {
                            event.stopPropagation();
                            void updateReservationStatus(reservation.id, () =>
                              cancelReservation(reservation.id),
                            );
                          }}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          <X size={16} strokeWidth={2} />
                          Cancelar
                        </button>
                      </>
                    )}

                    {reservation.status === "confirmed" && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(event) => {
                            event.stopPropagation();
                            void updateReservationStatus(reservation.id, () =>
                              checkInReservation(reservation.id),
                            );
                          }}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          <LogIn size={16} strokeWidth={2} />
                          Hacer check-in
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(event) => {
                            event.stopPropagation();
                            void updateReservationStatus(reservation.id, () =>
                              cancelReservation(reservation.id),
                            );
                          }}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          <XCircle size={16} strokeWidth={1.8} />
                          Cancelar reserva
                        </button>
                      </>
                    )}

                    {reservation.status === "expired" && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(event) => {
                            event.stopPropagation();
                            void updateReservationStatus(reservation.id, () =>
                              recoverExpiredReservation(reservation.id),
                            );
                          }}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          <Check size={16} strokeWidth={2} />
                          Confirmar igualmente
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(event) => {
                            event.stopPropagation();
                            void updateReservationStatus(reservation.id, () =>
                              cancelReservation(reservation.id),
                            );
                          }}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          <X size={16} strokeWidth={2} />
                          Cancelar
                        </button>
                      </>
                    )}

                    {reservation.status === "checked-in" && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={(event) => {
                          event.stopPropagation();
                          void updateReservationStatus(reservation.id, () =>
                            checkOutReservation(reservation.id),
                          );
                        }}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        <LogOut size={16} strokeWidth={2} />
                        Hacer check-out
                      </button>
                    )}

                    {reservation.status === "checked-out" && (
                      <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 text-xs font-semibold text-neutral-600 sm:w-auto">
                        <CheckCircle2 size={16} strokeWidth={1.8} />
                        Estadía finalizada
                      </span>
                    )}

                    {reservation.status === "cancelled" && (
                      <span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-xs font-semibold text-red-700 sm:w-auto">
                        <XCircle size={16} strokeWidth={1.8} />
                        Reserva cancelada
                      </span>
                    )}

                    {isUpdating && (
                      <span className="inline-flex h-10 items-center gap-2 px-2 text-xs font-medium text-neutral-500">
                        <RefreshCw size={15} className="animate-spin" />
                        Actualizando...
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Reservations;
