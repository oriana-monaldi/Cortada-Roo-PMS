import type { FormEvent } from "react";
import {
  CalendarDays,
  ChevronDown,
  ShieldCheck,
  Tag,
  UserRound,
} from "lucide-react";

import heroImage from "../../assets/img1.jpeg";

const HeroSection = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="relative bg-[#faf9f7]">
      {/* Parte visual del Hero */}
      <div className="relative min-h-[540px] overflow-hidden text-white sm:min-h-[560px] md:min-h-[550px] lg:min-h-[500px]">
        <img
          src={heroImage}
          alt="Complejo Apartamentos Cortada Roo"
          className="
            absolute inset-0 h-full w-full object-cover
            object-[58%_center]
            sm:object-center
          "
        />

        {/* Overlay mobile */}
        <div className="absolute inset-0 bg-black/25" />

        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-black/45
            via-black/10
            to-black/65

            md:bg-gradient-to-r
            md:from-black/65
            md:via-black/25
            md:to-transparent
          "
        />

        {/* Contenido */}
        <div
          className="
            relative z-10 mx-auto flex min-h-[540px] w-full max-w-[1440px]
            flex-col justify-end px-4 pb-20 pt-24

            sm:min-h-[560px] sm:px-6 sm:pb-24
            md:min-h-[550px] md:justify-center md:px-8 md:pb-24
            lg:min-h-[500px] lg:px-12 lg:pb-16 lg:pt-28
          "
        >
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ead8c2] sm:text-xs">
              Complejo de apartamentos
            </p>

            <h1
              className="
                mt-3 max-w-[310px] font-serif text-[36px] font-medium
                leading-[1.04] tracking-[-0.02em] text-white

                min-[380px]:max-w-[350px]
                min-[380px]:text-[40px]

                sm:max-w-lg sm:text-5xl
                md:text-[52px]
                lg:text-[58px]
              "
            >
              Tu lugar ideal
              <br />
              en <span className="text-[#ead8c2]">Cañada de Gómez</span>
            </h1>

            <p
              className="
                mt-4 max-w-[310px] text-sm leading-6 text-white/90
                min-[380px]:max-w-sm
                sm:max-w-md sm:text-base
              "
            >
              Apartamentos modernos y completamente equipados para que te
              sientas como en casa.
            </p>

            {/* Beneficios */}
            <div
              className="
                mt-5 grid max-w-sm grid-cols-1 gap-2.5
                text-xs text-white/90

                sm:grid-cols-3 sm:gap-4
                md:max-w-xl
              "
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#ead8c2]"
                />

                <span>Reserva segura</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#ead8c2]"
                />

                <span>Reservas 24/7</span>
              </div>

              <div className="flex items-center gap-2">
                <Tag
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#ead8c2]"
                />

                <span>Mejor precio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div
        id="reservar"
        className="
          relative z-20 mx-auto -mt-10 w-full max-w-[1440px]
          px-4

          sm:-mt-12 sm:px-6
          md:px-8
          lg:-mt-14 lg:px-12
        "
      >
        <div
          className="
            rounded-2xl border border-neutral-200/80
            bg-white p-4 text-neutral-900
            shadow-[0_16px_45px_rgba(0,0,0,0.14)]

            sm:p-5
            lg:ml-auto lg:max-w-[900px]
          "
        >
          <form
            onSubmit={handleSubmit}
            className="
              grid grid-cols-1 gap-4

              sm:grid-cols-2
              lg:grid-cols-[1fr_1fr_0.85fr_auto]
              lg:items-end lg:gap-3
            "
          >
            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-semibold text-neutral-700">
                Check-in
              </span>

              <div className="relative">
                <input
                  type="date"
                  className="
                    h-12 w-full min-w-0 rounded-lg
                    border border-neutral-200 bg-white
                    px-3 pr-10 text-sm text-neutral-700
                    outline-none transition
                    focus:border-neutral-500
                  "
                />

                <CalendarDays
                  size={17}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none absolute right-3 top-1/2
                    -translate-y-1/2 text-neutral-500
                  "
                />
              </div>
            </label>

            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-semibold text-neutral-700">
                Check-out
              </span>

              <div className="relative">
                <input
                  type="date"
                  className="
                    h-12 w-full min-w-0 rounded-lg
                    border border-neutral-200 bg-white
                    px-3 pr-10 text-sm text-neutral-700
                    outline-none transition
                    focus:border-neutral-500
                  "
                />

                <CalendarDays
                  size={17}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none absolute right-3 top-1/2
                    -translate-y-1/2 text-neutral-500
                  "
                />
              </div>
            </label>

            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-semibold text-neutral-700">
                Huéspedes
              </span>

              <div className="relative">
                <UserRound
                  size={17}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none absolute left-3 top-1/2
                    -translate-y-1/2 text-neutral-500
                  "
                />

                <select
                  defaultValue="2"
                  className="
                    h-12 w-full min-w-0 appearance-none rounded-lg
                    border border-neutral-200 bg-white
                    pl-10 pr-10 text-sm text-neutral-700
                    outline-none transition
                    focus:border-neutral-500
                  "
                >
                  <option value="1">1 persona</option>
                  <option value="2">2 personas</option>
                  <option value="3">3 personas</option>
                  <option value="4">4 personas</option>
                  <option value="5">5 personas</option>
                </select>

                <ChevronDown
                  size={17}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none absolute right-3 top-1/2
                    -translate-y-1/2 text-neutral-500
                  "
                />
              </div>
            </label>

            <button
              type="submit"
              className="
                flex h-12 w-full items-center justify-center
                rounded-lg bg-neutral-950 px-5
                text-sm font-semibold text-white
                transition hover:bg-neutral-800
                active:scale-[0.99]

                sm:col-span-2
                lg:col-span-1 lg:min-w-[170px]
              "
            >
              Buscar disponibilidad
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
