import { ArrowRight, BedDouble, Snowflake, Users, Wifi } from "lucide-react";
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
      {/* Imagen */}
      <Link
        to={`/apartamentos/${apartment.id}`}
        className="relative block h-[190px] overflow-hidden sm:h-[215px] lg:h-[235px]"
        aria-label={`Ver detalle de ${apartment.name}`}
      >
        <img
          src={apartment.image}
          alt={apartment.name}
          className="
            h-full w-full object-cover object-top
            transition duration-500
            group-hover:scale-105
          "
        />

        <span
          className="
            absolute left-4 top-4
            rounded-md bg-white/95
            px-3 py-1.5
            text-[10px] font-bold uppercase
            tracking-[0.08em] text-neutral-900
            shadow-md backdrop-blur-sm
          "
        >
          {apartment.capacity}{" "}
          {apartment.capacity === 1 ? "huésped" : "huéspedes"}
        </span>
      </Link>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/apartamentos/${apartment.id}`} className="w-fit">
          <h3
            className="
              text-sm font-bold uppercase tracking-[0.04em]
              text-neutral-950 transition
              group-hover:text-[#9b6f45]
            "
          >
            {apartment.name}
          </h3>
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Users size={14} strokeWidth={1.7} />
            {apartment.capacity}{" "}
            {apartment.capacity === 1 ? "huésped" : "huéspedes"}
          </span>

          <span className="flex items-center gap-1.5">
            <BedDouble size={14} strokeWidth={1.7} />

            {apartment.shortName}
          </span>

          <span className="flex items-center gap-1.5">
            <Wifi size={14} strokeWidth={1.7} />
            WiFi
          </span>

          <span className="flex items-center gap-1.5">
            <Snowflake size={14} strokeWidth={1.7} />
            Aire acondicionado
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Desde
            </p>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-950">
                ${formatPrice(apartment.pricePerNight)}
              </span>

              <span className="text-[10px] text-neutral-500">por noche</span>
            </div>

            <Link
              to={`/apartamentos/${apartment.id}`}
              className="
                mt-4 inline-flex min-h-11 w-full
                items-center justify-center gap-2
                rounded-lg bg-neutral-950 px-5
                text-sm font-semibold text-white
                transition duration-200
                hover:bg-[#9b6f45]
                focus:outline-none focus:ring-2
                focus:ring-[#d7b58d] focus:ring-offset-2
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
