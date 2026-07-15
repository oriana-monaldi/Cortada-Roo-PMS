import {
  ArrowLeft,
  Bath,
  CalendarDays,
  Check,
  ChevronRight,
  DoorOpen,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { apartments } from "../../data/apartments";

const ApartmentDetail = () => {
  const { id } = useParams<{ id: string }>();

  const apartment = apartments.find((item) => item.id === id);

  if (!apartment) {
    return (
      <section className="min-h-screen bg-[#faf9f7] px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <h1 className="font-serif text-4xl font-semibold text-neutral-950">
            Habitación no encontrada
          </h1>

          <Link
            to="/#apartamentos"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-700"
          >
            <ArrowLeft size={17} />
            Volver a habitaciones
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-[#faf9f7]">
      <section className="bg-white px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
        <div className="mx-auto w-full max-w-[1440px]">
          <Link
            to="/#apartamentos"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowLeft size={17} strokeWidth={1.8} />
            Volver a habitaciones
          </Link>

          <div className="mt-7 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52] sm:text-sm">
              Cortada Roo
            </p>

            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-neutral-950 sm:text-5xl lg:text-6xl">
              {apartment.name}
            </h1>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-600">
              <span className="flex items-center gap-2">
                <Users size={17} />
                Hasta {apartment.capacity}{" "}
                {apartment.capacity === 1 ? "huésped" : "huéspedes"}
              </span>

              <span className="flex items-center gap-2">
                <DoorOpen size={17} />
                {apartment.totalUnits} unidades en total
              </span>

              <span className="flex items-center gap-2">
                <Bath size={17} />
                Baño privado
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1440px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {apartment.images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`overflow-hidden rounded-2xl bg-neutral-100 ${
                index === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <img
                src={image}
                alt={`${apartment.name} - imagen ${index + 1}`}
                className={`w-full object-cover ${
                  index === 0
                    ? "h-[280px] sm:h-[420px] lg:h-full lg:min-h-[520px]"
                    : "h-[220px] sm:h-[240px] lg:h-[250px]"
                }`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
              Sobre la habitación
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold text-neutral-950 sm:text-4xl">
              Comodidad y tranquilidad durante tu estadía
            </h2>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">
              {apartment.longDescription}
            </p>

            <div className="mt-10 border-t border-neutral-200 pt-10">
              <h2 className="font-serif text-2xl font-semibold text-neutral-950">
                Servicios incluidos
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {apartment.services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-3 text-sm text-neutral-700"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eee3d6] text-[#93683e]">
                      <Check size={16} />
                    </span>

                    {service}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="font-serif text-2xl font-semibold text-neutral-950">
              Consultá disponibilidad
            </h2>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold">
                  Check-in
                </span>

                <div className="relative">
                  <input
                    type="date"
                    className="h-12 w-full rounded-lg border border-neutral-200 px-3 pr-10"
                  />

                  <CalendarDays
                    size={17}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold">
                  Check-out
                </span>

                <input
                  type="date"
                  className="h-12 w-full rounded-lg border border-neutral-200 px-3"
                />
              </label>
            </div>

            <Link
              to={`/disponibilidad?apartment=${apartment.id}`}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-neutral-950 px-6 text-sm font-semibold text-white"
            >
              Buscar disponibilidad
              <ChevronRight size={17} />
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ApartmentDetail;
