import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  KeyRound,
  MapPin,
  Shirt,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Tv,
  UtensilsCrossed,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "@daypicker/react";
import { es } from "@daypicker/react/locale";
import "@daypicker/react/style.css";
import { Link, useParams } from "react-router-dom";

import { apartments } from "../../data/apartments";
import ApartmentGallery from "../ui/ApartmentGallery";

const getServiceIcon = (service: string) => {
  const normalizedService = service.toLowerCase();

  if (
    normalizedService.includes("internet") ||
    normalizedService.includes("wifi") ||
    normalizedService.includes("starlink")
  ) {
    return Wifi;
  }

  if (normalizedService.includes("aire acondicionado")) {
    return Snowflake;
  }

  if (
    normalizedService.includes("smart tv") ||
    normalizedService.includes("televisión")
  ) {
    return Tv;
  }

  if (normalizedService.includes("cocina")) {
    return UtensilsCrossed;
  }

  if (normalizedService.includes("baño")) {
    return Bath;
  }

  if (normalizedService.includes("ropa de cama")) {
    return BedDouble;
  }

  if (normalizedService.includes("toalla")) {
    return Shirt;
  }

  if (
    normalizedService.includes("código") ||
    normalizedService.includes("ingreso independiente")
  ) {
    return KeyRound;
  }

  if (normalizedService.includes("gimnasio")) {
    return Dumbbell;
  }

  if (
    normalizedService.includes("cámara") ||
    normalizedService.includes("seguridad")
  ) {
    return Camera;
  }

  if (
    normalizedService.includes("instalaciones nuevas") ||
    normalizedService.includes("espacios comunes")
  ) {
    return Sparkles;
  }

  if (normalizedService.includes("ubicación")) {
    return MapPin;
  }

  return ShieldCheck;
};

const getShortServiceName = (service: string) => {
  const normalizedService = service.toLowerCase();

  if (
    normalizedService.includes("starlink") ||
    normalizedService.includes("internet")
  ) {
    return "Internet Starlink";
  }

  if (normalizedService.includes("wifi")) {
    return "WiFi";
  }

  if (normalizedService.includes("aire acondicionado")) {
    return "Aire acondicionado";
  }

  if (normalizedService.includes("smart tv")) {
    return "Smart TV";
  }

  if (normalizedService.includes("cocina")) {
    return "Cocina equipada";
  }

  if (normalizedService.includes("baño")) {
    return "Baño privado";
  }

  if (normalizedService.includes("ropa de cama")) {
    return "Ropa de cama";
  }

  if (normalizedService.includes("toalla")) {
    return "Toallas";
  }

  if (normalizedService.includes("ingreso independiente")) {
    return "Ingreso independiente";
  }

  if (normalizedService.includes("código")) {
    return "Acceso por código";
  }

  if (normalizedService.includes("gimnasio")) {
    return "Gimnasio";
  }

  if (
    normalizedService.includes("cámara") ||
    normalizedService.includes("seguridad")
  ) {
    return "Seguridad";
  }

  if (normalizedService.includes("espacios comunes")) {
    return "Espacios comunes";
  }

  if (normalizedService.includes("instalaciones nuevas")) {
    return "Instalaciones nuevas";
  }

  if (normalizedService.includes("ubicación")) {
    return "Ubicación céntrica";
  }

  return service;
};

const formatDisplayDate = (date?: Date) => {
  if (!date) return "Seleccionar";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatQueryDate = (date?: Date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeDate = (date: Date) => {
  const normalizedDate = new Date(date);

  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const ApartmentDetail = () => {
  const { id } = useParams<{ id: string }>();

  const apartment = apartments.find((item) => item.id === id);

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guests, setGuests] = useState(1);

  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => normalizeDate(new Date()), []);

  useEffect(() => {
    if (!isCalendarOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(target)
      ) {
        setIsCalendarOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isCalendarOpen]);

  useEffect(() => {
    if (selectedRange?.from && selectedRange?.to) {
      setIsCalendarOpen(false);
    }
  }, [selectedRange]);

  if (!apartment) {
    return (
      <section className="min-h-screen bg-[#faf9f7] px-5 pb-12 pt-28 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-[1220px]">
          <h1 className="font-serif text-3xl font-semibold text-neutral-950 sm:text-4xl">
            Habitación no encontrada
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-600">
            La habitación que intentás consultar no existe o no se encuentra
            disponible.
          </p>

          <Link
            to="/#apartamentos"
            className="
              mt-6 inline-flex items-center gap-2
              text-sm font-semibold text-neutral-700
              transition hover:text-neutral-950
            "
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
            Volver a habitaciones
          </Link>
        </div>
      </section>
    );
  }

  const availabilityUrl = `/disponibilidad?${new URLSearchParams({
    apartment: apartment.id,
    from: formatQueryDate(selectedRange?.from),
    to: formatQueryDate(selectedRange?.to),
    guests: String(guests),
  }).toString()}`;

  const hasCompleteRange = Boolean(selectedRange?.from && selectedRange?.to);

  return (
    <main className="bg-[#faf9f7]">
      {/* Encabezado */}
      <section className="bg-white px-5 pb-6 pt-24 sm:px-8 sm:pt-28 lg:px-12">
        <div className="mx-auto w-full max-w-[1220px]">
          <Link
            to="/#apartamentos"
            className="
              inline-flex items-center gap-2
              text-xs font-medium text-neutral-500
              transition hover:text-neutral-950
              sm:text-sm
            "
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            Volver a habitaciones
          </Link>

          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
              Cortada Roo
            </p>

            <h1
              className="
                mt-2 font-serif text-3xl font-semibold
                leading-tight text-neutral-950
                sm:text-4xl lg:text-[42px]
              "
            >
              {apartment.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Galería y reserva */}
      <section className="bg-white px-5 pb-10 sm:px-8 sm:pb-12 lg:px-12">
        <div
          className="
            mx-auto grid w-full max-w-[1220px]
            gap-6
            lg:grid-cols-[minmax(0,1fr)_350px]
            lg:items-start
          "
        >
          <div className="min-w-0">
            <ApartmentGallery
              images={apartment.images}
              apartmentName={apartment.name}
            />
          </div>

          {/* Selector de reserva */}
          <aside
            ref={calendarContainerRef}
            className="
              relative rounded-2xl border border-neutral-200
              bg-white p-5
              shadow-[0_10px_26px_rgba(0,0,0,0.06)]
              lg:mt-[31px]
            "
          >
            <div className="border-b border-neutral-100 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a57b52]">
                Reserva
              </p>

              <h2 className="mt-1.5 font-serif text-xl font-semibold text-neutral-950">
                Consultá disponibilidad
              </h2>
            </div>

            {/* Campos Desde / Hasta */}
            <button
              type="button"
              onClick={() => setIsCalendarOpen((current) => !current)}
              className="
                mt-4 grid w-full grid-cols-2
                overflow-hidden rounded-xl border
                border-neutral-200 bg-white text-left
                transition hover:border-neutral-400
                focus:outline-none focus:ring-2
                focus:ring-[#d7b58d]/40
              "
              aria-expanded={isCalendarOpen}
            >
              <span className="border-r border-neutral-200 px-3 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  Desde
                </span>

                <span className="mt-1 flex items-center justify-between gap-2 text-sm font-medium text-neutral-900">
                  {formatDisplayDate(selectedRange?.from)}

                  <CalendarDays
                    size={15}
                    strokeWidth={1.7}
                    className="shrink-0 text-neutral-500"
                  />
                </span>
              </span>

              <span className="px-3 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  Hasta
                </span>

                <span className="mt-1 flex items-center justify-between gap-2 text-sm font-medium text-neutral-900">
                  {formatDisplayDate(selectedRange?.to)}

                  <CalendarDays
                    size={15}
                    strokeWidth={1.7}
                    className="shrink-0 text-neutral-500"
                  />
                </span>
              </span>
            </button>

            {/* Calendario emergente */}
            {isCalendarOpen && (
              <div
                className="
                  absolute right-0 top-[150px] z-40
                  w-[min(340px,calc(100vw-2rem))]
                  rounded-2xl border border-neutral-200
                  bg-white p-3
                  shadow-[0_18px_55px_rgba(0,0,0,0.16)]
                  sm:p-4
                "
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">
                      Elegí tu estadía
                    </p>

                    <p className="mt-0.5 text-xs text-neutral-500">
                      Seleccioná la fecha de ingreso y salida.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-full text-neutral-500
                      transition hover:bg-neutral-100
                      hover:text-neutral-950
                    "
                    aria-label="Cerrar calendario"
                  >
                    <X size={17} />
                  </button>
                </div>

                <DayPicker
                  mode="range"
                  locale={es}
                  lang="es-AR"
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  disabled={{ before: today }}
                  defaultMonth={selectedRange?.from ?? today}
                  min={1}
                  resetOnSelect
                  showOutsideDays
                  className="cortada-date-picker"
                />

                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRange(undefined)}
                    className="
                      text-xs font-semibold text-neutral-500
                      transition hover:text-neutral-950
                    "
                  >
                    Limpiar
                  </button>

                  <p className="text-xs text-neutral-500">
                    {selectedRange?.from && !selectedRange?.to
                      ? "Ahora elegí la fecha de salida"
                      : selectedRange?.from && selectedRange?.to
                        ? "Fechas seleccionadas"
                        : "Elegí la fecha de ingreso"}
                  </p>
                </div>
              </div>
            )}

            {/* Huéspedes */}
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Huéspedes
              </span>

              <div className="relative">
                <select
                  value={guests}
                  onChange={(event) => setGuests(Number(event.target.value))}
                  className="
                    h-11 w-full appearance-none rounded-lg
                    border border-neutral-200 bg-white
                    px-3 pr-9 text-sm text-neutral-700
                    outline-none transition
                    focus:border-neutral-500
                  "
                >
                  {Array.from(
                    { length: apartment.capacity },
                    (_, index) => index + 1,
                  ).map((guest) => (
                    <option key={guest} value={guest}>
                      {guest} {guest === 1 ? "persona" : "personas"}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none absolute right-3 top-1/2
                    -translate-y-1/2 text-neutral-500
                  "
                />
              </div>
            </label>

            {hasCompleteRange ? (
              <Link
                to={availabilityUrl}
                className="
                  mt-5 inline-flex h-11 w-full
                  items-center justify-center gap-2
                  rounded-lg bg-neutral-950 px-5
                  text-sm font-semibold text-white
                  transition hover:bg-neutral-800
                "
              >
                Consultar disponibilidad
                <ChevronRight size={16} strokeWidth={1.8} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className="
                  mt-5 inline-flex h-11 w-full
                  items-center justify-center gap-2
                  rounded-lg bg-neutral-950 px-5
                  text-sm font-semibold text-white
                  transition hover:bg-neutral-800
                "
              >
                Elegir fechas
                <CalendarDays size={16} strokeWidth={1.8} />
              </button>
            )}

            <p className="mt-3 text-center text-[10px] leading-4 text-neutral-500">
              La consulta no confirma automáticamente la reserva.
            </p>
          </aside>
        </div>
      </section>

      {/* Descripción y servicios */}
      <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto w-full max-w-[1220px]">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
              Sobre la habitación
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-neutral-950 sm:text-3xl">
              Comodidad durante tu estadía
            </h2>

            <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
              {apartment.longDescription}
            </p>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-8">
            <h2 className="font-serif text-xl font-semibold text-neutral-950 sm:text-2xl">
              Servicios incluidos
            </h2>

            <div
              className="
                mt-6 grid grid-cols-2
                gap-x-5 gap-y-5
                sm:grid-cols-3 lg:grid-cols-4
              "
            >
              {apartment.services.map((service) => {
                const Icon = getServiceIcon(service);

                return (
                  <div
                    key={service}
                    className="
                      flex min-w-0 items-center gap-2.5
                      text-xs text-neutral-700
                      sm:text-sm
                    "
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.7}
                      className="shrink-0 text-[#9b6f45]"
                    />

                    <span className="leading-5">
                      {getShortServiceName(service)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ApartmentDetail;
