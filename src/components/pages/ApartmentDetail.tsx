import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Camera,
  Dumbbell,
  KeyRound,
  MapPin,
  Shirt,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Tv,
  UtensilsCrossed,
  UsersRound,
  Wifi,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { apartments } from "../../data/apartments";
import { createReservation } from "../../services/reservationService";
import ApartmentGallery from "../ui/ApartmentGallery";

const DAY_IN_MILLISECONDS = 86_400_000;

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

const parseQueryDate = (value: string | null) => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatPrice = (price: number) => {
  return price.toLocaleString("es-AR");
};

const calculateNights = (checkIn: Date, checkOut: Date) => {
  const difference = checkOut.getTime() - checkIn.getTime();

  return Math.max(Math.round(difference / DAY_IN_MILLISECONDS), 0);
};

const ApartmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const apartment = apartments.find((item) => item.id === id);

  const checkIn = useMemo(
    () => parseQueryDate(searchParams.get("from")),
    [searchParams],
  );

  const checkOut = useMemo(
    () => parseQueryDate(searchParams.get("to")),
    [searchParams],
  );

  const guests = Number(searchParams.get("guests"));

  const hasReservationData = Boolean(
    checkIn &&
    checkOut &&
    checkOut > checkIn &&
    Number.isInteger(guests) &&
    guests > 0 &&
    apartment &&
    guests <= apartment.capacity,
  );

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;

  const totalPrice = apartment ? nights * apartment.pricePerNight : 0;

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  if (!apartment) {
    return (
      <section className="min-h-screen bg-[#faf9f7] px-5 pb-12 pt-28 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-[1220px]">
          <h1 className="font-serif text-3xl font-semibold text-neutral-950 sm:text-4xl">
            Habitación no encontrada
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-600">
            La habitación que intentás consultar no existe.
          </p>

          <Link
            to="/#apartamentos"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition hover:text-neutral-950"
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
            Volver a habitaciones
          </Link>
        </div>
      </section>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasReservationData || !checkIn || !checkOut) {
      setSubmitError("Las fechas o la cantidad de huéspedes no son válidas.");
      return;
    }

    if (!guestName.trim()) {
      setSubmitError("Ingresá tu nombre y apellido.");
      return;
    }

    if (!guestEmail.trim()) {
      setSubmitError("Ingresá tu correo electrónico.");
      return;
    }

    if (!guestPhone.trim()) {
      setSubmitError("Ingresá tu teléfono.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await createReservation({
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        guestName,
        guestEmail,
        guestPhone,
        guests,
        checkIn,
        checkOut,
        pricePerNight: apartment.pricePerNight,
      });

      navigate(`/reserva-exitosa?id=${result.id}`);
    } catch (error) {
      console.error("Error al crear la reserva:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "No pudimos crear la reserva. Intentá nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#faf9f7]">
      {/* Encabezado */}
      <section className="bg-white px-5 pb-6 pt-24 sm:px-8 sm:pt-28 lg:px-12">
        <div className="mx-auto w-full max-w-[1220px]">
          <Link
            to="/#apartamentos"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-950 sm:text-sm"
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            Volver a habitaciones
          </Link>

          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
              Cortada Roo
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl lg:text-[42px]">
              {apartment.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Galería y reserva */}
      <section className="bg-white px-5 pb-10 sm:px-8 sm:pb-12 lg:px-12">
        <div className="mx-auto grid w-full max-w-[1220px] gap-6 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start">
          <div className="min-w-0">
            <ApartmentGallery
              images={apartment.images}
              apartmentName={apartment.name}
            />
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_26px_rgba(0,0,0,0.06)] lg:mt-[31px]">
            {hasReservationData && checkIn && checkOut ? (
              <>
                <div className="border-b border-neutral-100 pb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a57b52]">
                    Tu estadía
                  </p>

                  <h2 className="mt-1.5 font-serif text-xl font-semibold text-neutral-950">
                    Completá tu reserva
                  </h2>
                </div>

                {/* Resumen */}
                <div className="mt-4 rounded-xl bg-[#f5f2ed] p-4">
                  <div className="flex gap-3">
                    <CalendarDays
                      size={18}
                      strokeWidth={1.7}
                      className="mt-0.5 shrink-0 text-[#9b6f45]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatDate(checkIn)} — {formatDate(checkOut)}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {nights} {nights === 1 ? "noche" : "noches"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-3 border-t border-neutral-200 pt-3">
                    <UsersRound
                      size={18}
                      strokeWidth={1.7}
                      className="shrink-0 text-[#9b6f45]"
                    />

                    <p className="text-sm text-neutral-700">
                      {guests} {guests === 1 ? "huésped" : "huéspedes"}
                    </p>
                  </div>
                </div>

                {/* Precio */}
                <div className="mt-4 flex items-end justify-between gap-4 border-b border-neutral-100 pb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Total
                    </p>

                    <p className="mt-1 font-serif text-2xl font-bold text-neutral-950">
                      ${formatPrice(totalPrice)}
                    </p>
                  </div>

                  <p className="text-right text-xs leading-5 text-neutral-500">
                    ${formatPrice(apartment.pricePerNight)}
                    <br />
                    por noche
                  </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="mt-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Nombre y apellido
                    </span>

                    <input
                      type="text"
                      value={guestName}
                      onChange={(event) => {
                        setGuestName(event.target.value);
                        setSubmitError("");
                      }}
                      autoComplete="name"
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30"
                      placeholder="Ej. Juan Pérez"
                    />
                  </label>

                  <label className="mt-3 block">
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
                      autoComplete="email"
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30"
                      placeholder="nombre@email.com"
                    />
                  </label>

                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                      Teléfono
                    </span>

                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(event) => {
                        setGuestPhone(event.target.value);
                        setSubmitError("");
                      }}
                      autoComplete="tel"
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#d7b58d]/30"
                      placeholder="Ej. 3471 123456"
                    />
                  </label>

                  {submitError && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium leading-5 text-red-700"
                    >
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#9b6f45] px-5 text-sm font-semibold text-white transition hover:bg-[#845b39] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Enviando reserva..." : "Confirmar reserva"}
                  </button>

                  <p className="mt-3 text-center text-[10px] leading-4 text-neutral-500">
                    La solicitud quedará pendiente hasta que el alojamiento la
                    confirme.
                  </p>
                </form>
              </>
            ) : (
              <div className="py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a57b52]">
                  Reserva
                </p>

                <h2 className="mt-2 font-serif text-xl font-semibold text-neutral-950">
                  Primero consultá disponibilidad
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Elegí las fechas y la cantidad de huéspedes desde el buscador
                  principal para reservar esta habitación.
                </p>

                <Link
                  to="/#reservar"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Consultar disponibilidad
                </Link>
              </div>
            )}
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

            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              {apartment.services.map((service) => {
                const Icon = getServiceIcon(service);

                return (
                  <div
                    key={service}
                    className="flex min-w-0 items-center gap-2.5 text-xs text-neutral-700 sm:text-sm"
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
