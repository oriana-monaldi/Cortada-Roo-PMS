import { X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import BookingDateRangePicker from "../../components/ui/BookingDateRangePicker";
import { apartments } from "../../data/apartments";
import { createAdminReservation } from "../../services/reservationService";
import { getVacationPeriods } from "../../services/vacationService";
import type { ReservationSource } from "../../types/reservation";
import type { VacationPeriod } from "../../types/vacation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHONE_LENGTH = 11;
const MIN_PHONE_LENGTH = 10;
const MAX_OBSERVATIONS_LENGTH = 300;

const CHECK_IN_TIME_OPTIONS = [
  { value: "10:00-12:00", label: "10:00 a 12:00" },
  { value: "12:00-14:00", label: "12:00 a 14:00" },
  { value: "14:00-16:00", label: "14:00 a 16:00" },
  { value: "16:00-18:00", label: "16:00 a 18:00" },
  { value: "18:00-20:00", label: "18:00 a 20:00" },
  { value: "20:00-22:00", label: "20:00 a 22:00" },
];

const SOURCE_OPTIONS: Array<{ value: ReservationSource; label: string }> = [
  { value: "particular", label: "Particular" },
  { value: "website", label: "Página web" },
  { value: "booking", label: "Booking" },
  { value: "airbnb", label: "Airbnb" },
];

const formatGuestName = (value: string) => {
  const sanitizedValue = value
    .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s/, "")
    .toLocaleLowerCase("es-AR");

  return sanitizedValue.replace(
    /(^|[\s'-])([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g,
    (_, separator: string, letter: string) =>
      `${separator}${letter.toLocaleUpperCase("es-AR")}`,
  );
};

const isValidFullName = (value: string) => {
  const words = value.trim().split(/\s+/);

  return (
    words.length >= 2 &&
    words.every((word) =>
      /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'-]*$/.test(word),
    )
  );
};

type ManualReservationModalProps = {
  onClose: () => void;
  onCreated: () => Promise<void>;
};

const ManualReservationModal = ({
  onClose,
  onCreated,
}: ManualReservationModalProps) => {
  const [apartmentId, setApartmentId] = useState(apartments[0]?.id ?? "");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [source, setSource] = useState<ReservationSource>("particular");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState("1");
  const [estimatedCheckInTime, setEstimatedCheckInTime] = useState("");
  const [observations, setObservations] = useState("");
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [loadingVacationPeriods, setLoadingVacationPeriods] = useState(true);
  const [vacationMessage, setVacationMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedApartment = useMemo(
    () => apartments.find((apartment) => apartment.id === apartmentId) ?? null,
    [apartmentId],
  );

  useEffect(() => {
    const loadVacationPeriods = async () => {
      try {
        setVacationPeriods(await getVacationPeriods());
      } catch (error) {
        console.error("Error al cargar vacaciones para alta manual:", error);
        setSubmitError("No pudimos verificar las fechas bloqueadas.");
      } finally {
        setLoadingVacationPeriods(false);
      }
    };

    void loadVacationPeriods();
  }, []);

  const totalPrice = useMemo(() => {
    if (!selectedApartment || !selectedRange?.from || !selectedRange.to) {
      return 0;
    }

    const difference =
      selectedRange.to.getTime() - selectedRange.from.getTime();
    const nights = Math.max(Math.round(difference / 86_400_000), 0);

    return nights * selectedApartment.pricePerNight;
  }, [selectedApartment, selectedRange]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedGuestName = guestName.trim();
    const normalizedGuestEmail = guestEmail.trim().toLowerCase();
    const guestCount = Number(guests);

    if (!selectedApartment) {
      setSubmitError("Seleccioná una habitación válida.");
      return;
    }

    if (!isValidFullName(normalizedGuestName)) {
      setSubmitError("Ingresá un nombre y un apellido válidos.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedGuestEmail)) {
      setSubmitError("Ingresá un correo electrónico válido.");
      return;
    }

    if (
      guestPhone.length < MIN_PHONE_LENGTH ||
      guestPhone.length > MAX_PHONE_LENGTH
    ) {
      setSubmitError(
        `El teléfono debe tener entre ${MIN_PHONE_LENGTH} y ${MAX_PHONE_LENGTH} números.`,
      );
      return;
    }

    if (!selectedRange?.from || !selectedRange.to) {
      setSubmitError("Indicá las fechas de ingreso y salida.");
      return;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setSubmitError("La cantidad de huéspedes debe ser válida.");
      return;
    }

    if (guestCount > selectedApartment.capacity) {
      setSubmitError(
        `Esta habitación admite hasta ${selectedApartment.capacity} ${
          selectedApartment.capacity === 1 ? "huésped" : "huéspedes"
        }.`,
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await createAdminReservation({
        apartmentId: selectedApartment.id,
        checkIn: selectedRange.from,
        checkOut: selectedRange.to,
        estimatedCheckInTime,
        guestEmail: normalizedGuestEmail,
        guestName: normalizedGuestName,
        guestPhone,
        guests: guestCount,
        observations: observations.trim(),
        source,
      });

      await onCreated();
      onClose();
    } catch (error) {
      console.error("Error al crear la reserva manual:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No pudimos registrar la reserva manual.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/50 px-2 py-2 sm:px-4 sm:py-8">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[#e7e1da] bg-[#fffdfb] shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3 border-b border-[#ece6df] px-4 py-3 sm:gap-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b67b45]">
              Recepción
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-[#172033] sm:mt-2 sm:text-2xl">
              Alta manual de reserva
            </h2>
            <p className="mt-1 text-xs text-neutral-600 sm:mt-2 sm:text-sm">
              Registrá reservas presenciales o ingresadas por otros canales.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e7e1da] bg-white text-neutral-500 transition hover:text-neutral-900 sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Origen de la reserva
              </span>
              <select
                value={source}
                onChange={(event) =>
                  setSource(event.target.value as ReservationSource)
                }
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30 sm:h-11 sm:text-sm"
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Habitación
              </span>
              <select
                value={apartmentId}
                onChange={(event) => setApartmentId(event.target.value)}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30 sm:h-11 sm:text-sm"
              >
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Nombre y apellido
              </span>
              <input
                type="text"
                value={guestName}
                onChange={(event) => {
                  setGuestName(formatGuestName(event.target.value));
                  setSubmitError("");
                }}
                onBlur={() => setGuestName(guestName.trim())}
                maxLength={70}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30 sm:h-11 sm:text-sm"
                placeholder="Ej. Pérez Carlos"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Email
              </span>
              <input
                type="email"
                value={guestEmail}
                onChange={(event) => {
                  setGuestEmail(event.target.value);
                  setSubmitError("");
                }}
                onBlur={() => setGuestEmail(guestEmail.trim().toLowerCase())}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30 sm:h-11 sm:text-sm"
                placeholder="nombre@email.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Teléfono
              </span>
              <input
                type="tel"
                value={guestPhone}
                onChange={(event) => {
                  setGuestPhone(
                    event.target.value.replace(/\D/g, "").slice(0, 11),
                  );
                  setSubmitError("");
                }}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30 sm:h-11 sm:text-sm"
                placeholder="Ej. 3471123456"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Huéspedes
              </span>
              <input
                type="number"
                min={1}
                max={selectedApartment?.capacity ?? 10}
                value={guests}
                onChange={(event) => {
                  setGuests(event.target.value);
                  setSubmitError("");
                }}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30 sm:h-11 sm:text-sm"
                required
              />
            </label>

            <div className="md:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Fechas de la estadía
              </span>
              {loadingVacationPeriods ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs text-neutral-500">
                  Verificando fechas bloqueadas...
                </div>
              ) : (
                <BookingDateRangePicker
                  selectedRange={selectedRange}
                  vacationPeriods={vacationPeriods}
                  vacationMessage={vacationMessage}
                  onVacationMessageChange={setVacationMessage}
                  onRangeChange={(range) => {
                    setSelectedRange(range);
                    setSubmitError("");
                  }}
                />
              )}
            </div>

            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Horario aproximado de check-in
                <span className="ml-1 font-normal text-neutral-400">
                  (opcional)
                </span>
              </span>
              <select
                value={estimatedCheckInTime}
                onChange={(event) => {
                  setEstimatedCheckInTime(event.target.value);
                  setSubmitError("");
                }}
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30"
              >
                <option value="">Sin horario informado</option>
                {CHECK_IN_TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Observaciones
                <span className="ml-1 font-normal text-neutral-400">
                  (opcional)
                </span>
              </span>
              <textarea
                value={observations}
                onChange={(event) => {
                  setObservations(
                    event.target.value.slice(0, MAX_OBSERVATIONS_LENGTH),
                  );
                  setSubmitError("");
                }}
                rows={4}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30 sm:py-3 sm:text-sm"
                placeholder="Ej. Reserva presencial, pago en mostrador, llegada anticipada."
              />
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-[#ece6df] bg-[#f8f5f1] px-3 py-2.5 sm:mt-5 sm:px-4 sm:py-3">
            <p className="text-xs font-semibold text-[#6a4d33]">
              Alta interna
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              La reserva se registrará como confirmada. Total estimado:{" "}
              <span className="font-semibold text-[#172033]">
                ${totalPrice.toLocaleString("es-AR")}
              </span>
            </p>
          </div>

          {submitError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 sm:h-11 sm:px-5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#9b6f45] px-4 text-sm font-semibold text-white transition hover:bg-[#845b39] disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:px-5"
            >
              {submitting ? "Registrando..." : "Registrar reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualReservationModal;
