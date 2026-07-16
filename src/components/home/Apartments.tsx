import { apartments } from "../../data/apartments";
import ApartmentCard from "./ApartmentCard";

const Apartments = () => {
  return (
    <section
      id="apartamentos"
      className="bg-[#faf9f7] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
          {/* Información */}
          <div className="max-w-[280px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52] sm:text-sm">
              Apartamentos
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl">
              Elegí el espacio que mejor se adapta a vos
            </h2>

            <p className="mt-4 text-sm leading-6 text-neutral-600 sm:text-base">
              Contamos con habitaciones completamente equipadas para disfrutar
              una estadía cómoda y confortable.
            </p>
          </div>

          {/* Cards */}
          <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
