import { ArrowLeft, CalendarDays, Check, ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { apartments } from "../../data/apartments";
import ApartmentGallery from "../ui/ApartmentGallery";

const ApartmentDetail = () => {
  const { id } = useParams<{ id: string }>();

  const apartment = apartments.find((item) => item.id === id);

  if (!apartment) {
    return (
      <section className="min-h-screen bg-[#faf9f7] px-4 pb-12 pt-24 sm:px-6">
        <div className="mx-auto w-full max-w-[1020px]">
          <h1 className="font-serif text-3xl font-semibold text-neutral-950">
            Habitación no encontrada
          </h1>

          <Link
            to="/#apartamentos"
            className="
              mt-5 inline-flex items-center gap-2
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

  return (
    <main className="bg-[#faf9f7]">
      {/* Encabezado */}
      <section className="bg-white px-4 pb-5 pt-22 sm:px-6 sm:pb-6 sm:pt-24 lg:px-8">
        <div className="mx-auto w-full max-w-[1020px]">
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
                sm:text-4xl
                lg:text-[42px]
              "
            >
              {apartment.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="bg-white px-4 pb-3 sm:px-6 sm:pb-4 lg:px-8">
        <div className="mx-auto w-full max-w-[1020px]">
          <ApartmentGallery
            images={apartment.images}
            apartmentName={apartment.name}
          />
        </div>
      </section>

      {/* Información y reserva */}
      <section className="px-4 pb-9 pt-4 sm:px-6 sm:pb-11 sm:pt-5 lg:px-8 lg:pb-14 lg:pt-6">
        <div
          className="
            mx-auto grid w-full max-w-[1020px]
            gap-7
            lg:grid-cols-[minmax(0,1fr)_310px]
            lg:items-start
          "
        >
          {/* Información */}
          <div className="min-w-0">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
                Sobre la habitación
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-neutral-950 sm:text-3xl">
                Comodidad durante tu estadía
              </h2>

              <p className="mt-4 text-sm leading-6 text-neutral-600">
                {apartment.longDescription}
              </p>
            </div>

            <div className="mt-7 border-t border-neutral-200 pt-7">
              <h2 className="font-serif text-xl font-semibold text-neutral-950">
                Servicios incluidos
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {apartment.services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-3 text-sm text-neutral-700"
                  >
                    <span
                      className="
                        flex h-7 w-7 shrink-0 items-center justify-center
                        rounded-full bg-[#eee3d6] text-[#93683e]
                      "
                    >
                      <Check size={13} strokeWidth={2} />
                    </span>

                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reserva */}
          <aside
            className="
              rounded-2xl border border-neutral-200
              bg-white p-5
              shadow-[0_10px_28px_rgba(0,0,0,0.05)]
              lg:sticky lg:top-20
            "
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a57b52]">
              Reservá tu estadía
            </p>

            <h2 className="mt-2 font-serif text-xl font-semibold text-neutral-950">
              Consultá disponibilidad
            </h2>

            <p className="mt-2 text-sm leading-5 text-neutral-600">
              Seleccioná tus fechas y cantidad de huéspedes.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Check-in
                </span>

                <div className="relative">
                  <input
                    type="date"
                    className="
                      h-10 w-full rounded-lg border border-neutral-200
                      bg-white px-3 pr-9 text-sm text-neutral-700
                      outline-none transition focus:border-neutral-500
                    "
                  />

                  <CalendarDays
                    size={15}
                    strokeWidth={1.7}
                    className="
                      pointer-events-none absolute right-3 top-1/2
                      -translate-y-1/2 text-neutral-500
                    "
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Check-out
                </span>

                <div className="relative">
                  <input
                    type="date"
                    className="
                      h-10 w-full rounded-lg border border-neutral-200
                      bg-white px-3 pr-9 text-sm text-neutral-700
                      outline-none transition focus:border-neutral-500
                    "
                  />

                  <CalendarDays
                    size={15}
                    strokeWidth={1.7}
                    className="
                      pointer-events-none absolute right-3 top-1/2
                      -translate-y-1/2 text-neutral-500
                    "
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                  Huéspedes
                </span>

                <select
                  defaultValue={apartment.capacity}
                  className="
                    h-10 w-full rounded-lg border border-neutral-200
                    bg-white px-3 text-sm text-neutral-700
                    outline-none transition focus:border-neutral-500
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
              </label>
            </div>

            <Link
              to={`/disponibilidad?apartment=${apartment.id}`}
              className="
                mt-5 inline-flex min-h-10 w-full
                items-center justify-center gap-2
                rounded-lg bg-neutral-950 px-5
                text-sm font-semibold text-white
                transition hover:bg-neutral-800
              "
            >
              Buscar disponibilidad
              <ChevronRight size={15} strokeWidth={1.8} />
            </Link>

            <p className="mt-3 text-center text-[10px] leading-4 text-neutral-500">
              La consulta no confirma la reserva.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default ApartmentDetail;
