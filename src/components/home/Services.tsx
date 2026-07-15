import {
  Dumbbell,
  KeyRound,
  Snowflake,
  Tv,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";

const services = [
  {
    title: "WiFi de alta velocidad",
    description: "Conexión estable para trabajar, estudiar o disfrutar.",
    icon: Wifi,
  },
  {
    title: "Cocina equipada",
    description: "Todo lo necesario para una estadía cómoda.",
    icon: UtensilsCrossed,
  },
  {
    title: "Aire acondicionado",
    description: "Ambientes climatizados durante todo el año.",
    icon: Snowflake,
  },
  {
    title: "Smart TV",
    description: "Entretenimiento disponible en cada apartamento.",
    icon: Tv,
  },
  {
    title: "Acceso independiente",
    description: "Ingreso práctico y seguro mediante código.",
    icon: KeyRound,
  },
  {
    title: "Gimnasio",
    description: "Espacio exclusivo para mantener tu rutina.",
    icon: Dumbbell,
  },
];

const Services = () => {
  return (
    <section
      id="servicios"
      className="bg-[#f5f2ed] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52] sm:text-sm">
            Servicios
          </p>

          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Todo lo que necesitás para una estadía cómoda
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
            Espacios completamente equipados y servicios pensados para que
            disfrutes cada momento.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="
                  flex gap-4 rounded-2xl border border-neutral-200
                  bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,0.04)]
                  transition duration-300 hover:-translate-y-1
                  hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]
                "
              >
                <div
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-full bg-[#f2e8dc] text-[#9b6f45]
                  "
                >
                  <Icon size={22} strokeWidth={1.7} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-950">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {service.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
