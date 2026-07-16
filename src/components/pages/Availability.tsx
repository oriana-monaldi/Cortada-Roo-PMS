import { BedDouble, CalendarDays, Search, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import AvailableApartmentCard from "../availability/AvailableApartmentCard";
import type { Apartment } from "../../data/apartments";
import { checkAvailability } from "../../services/reservationService";

const parseQueryDate = (value: string) => {
  return new Date(`${value}T00:00:00`);
};

const formatDate = (value: string) => {
  const date = parseQueryDate(value);

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const Availability = () => {
  const [searchParams] = useSearchParams();

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const guests = Number(searchParams.get("guests"));

  const hasValidSearch = Boolean(
    from && to && Number.isInteger(guests) && guests > 0,
  );

  useEffect(() => {
    const loadAvailability = async () => {
      if (!hasValidSearch || !from || !to) {
        setApartments([]);
        setError("Faltan fechas o la cantidad de huéspedes no es válida.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const availableApartments = await checkAvailability({
          checkIn: parseQueryDate(from),
          checkOut: parseQueryDate(to),
          guests,
        });

        setApartments(availableApartments);
      } catch (currentError) {
        console.error("Error al consultar disponibilidad:", currentError);

        setApartments([]);

        setError(
          currentError instanceof Error
            ? currentError.message
            : "No pudimos consultar la disponibilidad.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadAvailability();
  }, [from, to, guests, hasValidSearch]);

  return (
    <main className="min-h-screen bg-[#faf9f7] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Encabezado */}
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52] sm:text-sm">
          Disponibilidad
        </p>

        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl lg:text-5xl">
          Habitaciones disponibles
        </h1>

        {/* Resumen de búsqueda */}
        {hasValidSearch && from && to && (
          <div
            className="
              mt-7 grid max-w-[850px]
              overflow-hidden rounded-2xl
              border border-[#e2d8cb]
              bg-white
              shadow-[0_8px_24px_rgba(0,0,0,0.04)]

              sm:grid-cols-3
            "
          >
            {/* Check-in */}
            <div
              className="
                flex items-center gap-3
                border-b border-[#e7ded3]
                px-4 py-4

                sm:border-b-0
                sm:border-r
                sm:px-5
              "
            >
              <div
                className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-xl bg-[#f3e9dd]
                  text-[#a57b52]
                "
              >
                <CalendarDays size={21} strokeWidth={1.7} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Check-in
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-neutral-950 sm:text-base">
                  {formatDate(from)}
                </p>
              </div>
            </div>

            {/* Check-out */}
            <div
              className="
                flex items-center gap-3
                border-b border-[#e7ded3]
                px-4 py-4

                sm:border-b-0
                sm:border-r
                sm:px-5
              "
            >
              <div
                className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-xl bg-[#f3e9dd]
                  text-[#a57b52]
                "
              >
                <CalendarDays size={21} strokeWidth={1.7} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Check-out
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-neutral-950 sm:text-base">
                  {formatDate(to)}
                </p>
              </div>
            </div>

            {/* Huéspedes */}
            <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
              <div
                className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-xl bg-[#f3e9dd]
                  text-[#a57b52]
                "
              >
                <UsersRound size={21} strokeWidth={1.7} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Huéspedes
                </p>

                <p className="mt-1 text-sm font-semibold text-neutral-950 sm:text-base">
                  {guests} {guests === 1 ? "huésped" : "huéspedes"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <Search
                size={19}
                strokeWidth={1.7}
                className="animate-pulse text-[#a57b52]"
              />

              <p className="text-sm text-neutral-600">
                Buscando disponibilidad...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Sin disponibilidad */}
        {!loading && !error && apartments.length === 0 && (
          <div
            className="
              mt-10 flex flex-col gap-5
              rounded-2xl border border-neutral-200
              bg-white p-6

              sm:flex-row
              sm:items-center
              sm:p-8
            "
          >
            <div
              className="
                flex h-14 w-14 shrink-0
                items-center justify-center
                rounded-full bg-[#f3e9dd]
                text-[#a57b52]
              "
            >
              <BedDouble size={26} strokeWidth={1.6} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                No encontramos habitaciones disponibles
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Probá con otras fechas o modificá la cantidad de huéspedes.
              </p>

              <Link
                to="/#reservar"
                className="
                  mt-4 inline-flex h-10
                  items-center justify-center gap-2
                  rounded-xl bg-neutral-950
                  px-5 text-sm font-semibold text-white
                  transition hover:bg-neutral-800
                "
              >
                <CalendarDays size={16} strokeWidth={1.8} />
                Modificar búsqueda
              </Link>
            </div>
          </div>
        )}

        {/* Departamentos disponibles */}
        {!loading && !error && apartments.length > 0 && from && to && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {apartments.map((apartment) => (
              <AvailableApartmentCard
                key={apartment.id}
                apartment={apartment}
                checkIn={from}
                checkOut={to}
                guests={guests}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Availability;
