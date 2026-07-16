import {
  Camera,
  Dumbbell,
  KeyRound,
  Snowflake,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";

const services = [
  {
    title: "Internet Starlink",
    subtitle: "Conexión rápida y estable",
    icon: Wifi,
  },
  {
    title: "Gimnasio exclusivo",
    subtitle: "Disponible para huéspedes",
    icon: Dumbbell,
  },
  {
    title: "Acceso mediante código",
    subtitle: "Ingreso independiente",
    icon: KeyRound,
  },
  {
    title: "Cocina equipada",
    subtitle: "Todo listo para cocinar",
    icon: UtensilsCrossed,
  },
  {
    title: "Aire acondicionado",
    subtitle: "Frío y calor",
    icon: Snowflake,
  },
  {
    title: "Seguridad",
    subtitle: "Cámaras en accesos",
    icon: Camera,
  },
];

const Services = () => {
  return (
    <section
      id="servicios"
      className="bg-[#f5f2ed] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Encabezado (igual a Galería) */}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52] sm:text-sm">
            Servicios
          </p>

          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Todo lo que necesitás para sentirte como en casa
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
            Espacios modernos, equipados y preparados para que disfrutes una
            estadía cómoda y segura.
          </p>
        </div>

        {/* Servicios */}
        <div
          className="
            mt-14
            grid grid-cols-2 gap-y-10
            sm:grid-cols-3
            lg:mt-16
            lg:grid-cols-6
            lg:gap-x-8
          "
        >
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="
                  group
                  flex flex-col items-center
                  text-center
                "
              >
                <div
                  className="
                    flex h-16 w-16 items-center justify-center
                    rounded-full
                    bg-[#efe5d8]
                    transition-all duration-300
                    group-hover:bg-[#a57b52]
                  "
                >
                  <Icon
                    size={28}
                    strokeWidth={1.6}
                    className="
                      text-[#a57b52]
                      transition-all duration-300
                      group-hover:text-white
                      group-hover:scale-110
                    "
                  />
                </div>

                <h3 className="mt-5 text-base font-semibold text-neutral-950">
                  {service.title}
                </h3>

                <p className="mt-2 max-w-[180px] text-sm leading-6 text-neutral-600">
                  {service.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
