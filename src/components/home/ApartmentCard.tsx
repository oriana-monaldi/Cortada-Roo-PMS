import { ArrowRight, BedDouble, Snowflake, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

type ApartmentCardData = {
  id: string | number;

  name?: string;
  title?: string;

  image?: string;
  imageUrl?: string;
  images?: string[];

  guests?: number;
  capacity?: number;
  maxGuests?: number;

  type?: string;
  roomType?: string;
  bedType?: string;

  price?: number | string;
  pricePerNight?: number | string;

  badge?: string;
};

type ApartmentCardProps = {
  apartment: ApartmentCardData;
};

const formatPrice = (value: number | string | undefined) => {
  if (value === undefined || value === null || value === "") {
    return "Consultar";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("es-AR");
};

const ApartmentCard = ({ apartment }: ApartmentCardProps) => {
  const title = apartment.name || apartment.title || "Habitación";

  const image =
    apartment.image || apartment.imageUrl || apartment.images?.[0] || "";

  const guests =
    apartment.guests || apartment.capacity || apartment.maxGuests || 1;

  const roomType =
    apartment.type || apartment.roomType || apartment.bedType || "Habitación";

  const price = apartment.pricePerNight ?? apartment.price;

  const badge =
    apartment.badge || `${guests} ${guests === 1 ? "huésped" : "huéspedes"}`;

  return (
    <article
      className="
        overflow-hidden rounded-2xl
        border border-neutral-200
        bg-white
        shadow-[0_8px_24px_rgba(0,0,0,0.05)]
        transition duration-300

        hover:-translate-y-1
        hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)]
      "
    >
      {/* Imagen */}
      <Link
        to={`/apartamentos/${apartment.id}`}
        aria-label={`Ver detalles de ${title}`}
        className="group relative block aspect-[16/10] overflow-hidden bg-neutral-100"
      >
        {image && (
          <img
            src={image}
            alt={title}
            className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-[1.04]
            "
          />
        )}

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
          {badge}
        </span>
      </Link>

      {/* Contenido */}
      <div className="px-4 pb-4 pt-3">
        <Link to={`/apartamentos/${apartment.id}`}>
          <h3 className="text-base font-semibold text-neutral-950 transition-colors hover:text-[#9b6f45]">
            {title}
          </h3>
        </Link>

        {/* Características */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <UsersRound size={14} strokeWidth={1.6} />

            <span>
              {guests} {guests === 1 ? "huésped" : "huéspedes"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <BedDouble size={14} strokeWidth={1.6} />
            <span>{roomType}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Snowflake size={14} strokeWidth={1.6} />
            <span>Aire acondicionado</span>
          </div>
        </div>

        {/* Precio */}
        <div className="mt-4 border-t border-neutral-200 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Desde
          </p>

          <div className="mt-1 flex items-end gap-2">
            <p className="font-serif text-[21px] font-bold leading-none text-neutral-950">
              {price !== undefined ? `$${formatPrice(price)}` : "Consultar"}
            </p>

            {price !== undefined && (
              <span className="pb-[2px] text-[11px] text-neutral-500">
                por noche
              </span>
            )}
          </div>
        </div>

        {/* Botón */}
        <Link
          to={`/apartamentos/${apartment.id}`}
          className="
            mt-4 flex h-11 w-full
            items-center justify-center gap-2
            rounded-xl bg-neutral-950
            text-sm font-semibold text-white
            transition-colors

            hover:bg-neutral-800
          "
        >
          Ver habitación
          <ArrowRight size={16} strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  );
};

export default ApartmentCard;
