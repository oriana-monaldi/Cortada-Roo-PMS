import { apartments } from "../../data/apartments";
import ApartmentCard from "./ApartmentCard";

const Apartments = () => {
  return (
    <section
      id="apartamentos"
      className="bg-[#faf9f7] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-10">
          {/* Información */}
          <div className="max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
              Apartamentos
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-neutral-950 lg:text-3xl">
              Elegí el espacio que mejor se adapta a vos
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Contamos con habitaciones completamente equipadas para disfrutar
              una estadía cómoda y confortable.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {apartments.map((apartment) => (
              <ApartmentCard key={apartment.id} apartment={apartment} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Apartments;
