import { ArrowRight, BedDouble, Building2, Users } from "lucide-react";
import { Link } from "react-router-dom";

import type { Apartment } from "../../data/apartments";

type ApartmentCardProps = {
  apartment: Apartment;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(price);
};

const ApartmentCard = ({ apartment }: ApartmentCardProps) => {
  return (
    <article
      className="
        group flex h-full flex-col overflow-hidden rounded-2xl
        border border-neutral-200 bg-white
        shadow-[0_4px_20px_rgba(0,0,0,0.05)]
        transition duration-300
        hover:-translate-y-1
        hover:shadow-[0_14px_35px_rgba(0,0,0,0.1)]
      "
    >
      <Link
        to={`/apartamentos/${apartment.id}`}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <img
          src={apartment.image}
          alt={apartment.name}
          className="
            h-full w-full object-cover
            transition duration-500
            group-hover:scale-105
          "
        />

        <span
          className="
            absolute left-3 top-3 rounded-md
            bg-white/95 px-3 py-1.5
            text-[10px] font-semibold uppercase
            tracking-[0.1em] text-neutral-900
            shadow-sm backdrop-blur-sm
          "
        >
          Hasta {apartment.capacity}{" "}
          {apartment.capacity === 1 ? "persona" : "personas"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-serif text-xl font-semibold text-neutral-950">
          {apartment.name}
        </h3>

        <p className="mt-3 text-sm leading-6 text-neutral-600">
          {apartment.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <Users size={17} strokeWidth={1.7} />

            <span>
              {apartment.capacity}{" "}
              {apartment.capacity === 1 ? "huésped" : "huéspedes"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 size={17} strokeWidth={1.7} />

            <span>
              {apartment.totalUnits}{" "}
              {apartment.totalUnits === 1 ? "habitación" : "habitaciones"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BedDouble size={17} strokeWidth={1.7} />
            <span>{apartment.shortName}</span>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="border-t border-neutral-100 pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Precio por noche
            </p>

            <div className="mt-1 flex flex-wrap items-baseline gap-1">
              <span className="text-2xl font-bold text-neutral-950">
                ${formatPrice(apartment.pricePerNight)}
              </span>

              <span className="text-sm text-neutral-500">ARS</span>
            </div>

            <Link
              to={`/apartamentos/${apartment.id}`}
              className="
                mt-5 inline-flex min-h-11 w-full
                items-center justify-center gap-2
                rounded-lg bg-neutral-950 px-5
                text-sm font-semibold text-white
                transition hover:bg-neutral-800
              "
            >
              Ver habitación
              <ArrowRight size={17} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ApartmentCard;
