import { apartments } from "../../data/apartments";
import ApartmentCard from "./ApartmentCard";

const Apartments = () => {
  return (
    <section
      id="apartamentos"
      className="bg-[#faf9f7] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52] sm:text-sm">
            Habitaciones
          </p>

          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Elegí la opción que mejor se adapta a vos
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
            Contamos con habitaciones individuales, dobles y triples,
            completamente equipadas para disfrutar una estadía cómoda.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-12 xl:grid-cols-3">
          {apartments.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Apartments;
