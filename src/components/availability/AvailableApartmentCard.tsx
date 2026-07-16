import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Snowflake,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { Apartment } from "../../data/apartments";

type AvailableApartmentCardProps = {
  apartment: Apartment;
  checkIn: string;
  checkOut: string;
  guests: number;
};

const formatPrice = (price: number) => {
  return price.toLocaleString("es-AR");
};

const calculateNights = (checkIn: string, checkOut: string) => {
  const startDate = new Date(`${checkIn}T00:00:00`);
  const endDate = new Date(`${checkOut}T00:00:00`);

  const difference = endDate.getTime() - startDate.getTime();

  return Math.max(Math.round(difference / 86_400_000), 0);
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

const AvailableApartmentCard = ({
  apartment,
  checkIn,
  checkOut,
  guests,
}: AvailableApartmentCardProps) => {
  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = nights * apartment.pricePerNight;

  const searchParams = new URLSearchParams({
    from: checkIn,
    to: checkOut,
    guests: String(guests),
  });

  const apartmentUrl = `/apartamentos/${
    apartment.id
  }?${searchParams.toString()}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
      <Link
        to={apartmentUrl}
        className="group relative block aspect-[16/10] overflow-hidden bg-neutral-100"
        aria-label={`Ver ${apartment.name}`}
      >
        <img
          src={apartment.image}
          alt={apartment.name}
          className="
            h-full w-full object-cover
            transition-transform duration-500
            group-hover:scale-[1.04]
          "
        />

        <span
          className="
            absolute left-4 top-4
            rounded-lg bg-white/95
            px-3 py-1.5
            text-[10px] font-semibold uppercase
            tracking-[0.08em] text-neutral-900
            shadow-sm
          "
        >
          Disponible
        </span>
      </Link>

      <div className="p-5">
        <Link to={apartmentUrl}>
          <h2 className="text-lg font-semibold text-neutral-950 transition hover:text-[#9b6f45]">
            {apartment.name}
          </h2>
        </Link>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {apartment.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <UsersRound size={15} strokeWidth={1.6} />
            <span>
              Hasta {apartment.capacity}{" "}
              {apartment.capacity === 1 ? "huésped" : "huéspedes"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <BedDouble size={15} strokeWidth={1.6} />
            <span>{apartment.shortName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Snowflake size={15} strokeWidth={1.6} />
            <span>Aire acondicionado</span>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-[#f5f2ed] p-4">
          <div className="flex items-start gap-3">
            <CalendarDays
              size={18}
              strokeWidth={1.7}
              className="mt-0.5 shrink-0 text-[#9b6f45]"
            />

            <div>
              <p className="text-sm font-medium text-neutral-900">
                {formatDate(checkIn)} — {formatDate(checkOut)}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {nights} {nights === 1 ? "noche" : "noches"} · {guests}{" "}
                {guests === 1 ? "huésped" : "huéspedes"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-neutral-200 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Total de la estadía
          </p>

          <p className="mt-1 font-serif text-2xl font-bold text-neutral-950">
            ${formatPrice(totalPrice)}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            ${formatPrice(apartment.pricePerNight)} por noche
          </p>
        </div>

        <Link
          to={apartmentUrl}
          className="
            mt-5 flex h-12 w-full
            items-center justify-center gap-2
            rounded-xl bg-[#9b6f45]
            px-5 text-sm font-semibold text-white
            transition-colors hover:bg-[#845b39]
          "
        >
          Ver habitación y reservar
          <ArrowRight size={17} strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  );
};

export default AvailableApartmentCard;
