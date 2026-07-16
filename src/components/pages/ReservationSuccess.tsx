import { CheckCircle2, Home } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const ReservationSuccess = () => {
  const [searchParams] = useSearchParams();

  const reservationId = searchParams.get("id");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4 py-28">
      <section className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-[0_18px_55px_rgba(0,0,0,0.08)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={34} strokeWidth={1.7} />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#a57b52]">
          Solicitud recibida
        </p>

        <h1 className="mt-3 font-serif text-3xl font-semibold text-neutral-950 sm:text-4xl">
          Tu reserva fue enviada
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-600 sm:text-base">
          Recibimos tu solicitud correctamente. La reserva quedó pendiente de
          confirmación y nos comunicaremos con vos para completar el proceso.
        </p>

        {reservationId && (
          <div className="mt-7 rounded-2xl bg-[#f5f2ed] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Código de reserva
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-neutral-950">
              {reservationId}
            </p>
          </div>
        )}

        <Link
          to="/"
          className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <Home size={17} strokeWidth={1.8} />
          Volver al inicio
        </Link>
      </section>
    </main>
  );
};

export default ReservationSuccess;
