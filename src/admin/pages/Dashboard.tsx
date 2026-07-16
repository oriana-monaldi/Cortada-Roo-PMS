import {
  BedDouble,
  CalendarCheck2,
  CalendarClock,
  UsersRound,
} from "lucide-react";

const Dashboard = () => {
  return (
    <section>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
          Panel general
        </p>

        <h1 className="mt-2 font-serif text-3xl font-semibold text-neutral-950 sm:text-4xl">
          Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          Resumen general de reservas, huéspedes y ocupación del complejo.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">
              Reservas pendientes
            </p>

            <CalendarClock
              size={20}
              strokeWidth={1.7}
              className="text-[#a57b52]"
            />
          </div>

          <p className="mt-5 text-3xl font-semibold text-neutral-950">0</p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">Confirmadas</p>

            <CalendarCheck2
              size={20}
              strokeWidth={1.7}
              className="text-[#a57b52]"
            />
          </div>

          <p className="mt-5 text-3xl font-semibold text-neutral-950">0</p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">Huéspedes</p>

            <UsersRound
              size={20}
              strokeWidth={1.7}
              className="text-[#a57b52]"
            />
          </div>

          <p className="mt-5 text-3xl font-semibold text-neutral-950">0</p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">
              Habitaciones ocupadas
            </p>

            <BedDouble size={20} strokeWidth={1.7} className="text-[#a57b52]" />
          </div>

          <p className="mt-5 text-3xl font-semibold text-neutral-950">0</p>
        </article>
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-serif text-xl font-semibold text-neutral-950">
          Últimas reservas
        </h2>

        <p className="mt-3 text-sm text-neutral-500">
          Las reservas recientes aparecerán acá.
        </p>
      </div>
    </section>
  );
};

export default Dashboard;
