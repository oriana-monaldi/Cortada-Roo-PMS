import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Home,
  Landmark,
  MessageCircle,
} from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";

type ReservationSuccessLocationState = {
  totalPrice?: number;
};

const formatPrice = (price: number) => {
  return price.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const ReservationSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const reservationId = searchParams.get("id");

  const locationState =
    location.state as ReservationSuccessLocationState | null;

  const totalPrice =
    typeof locationState?.totalPrice === "number" &&
    Number.isFinite(locationState.totalPrice)
      ? locationState.totalPrice
      : 0;

  const depositAmount = totalPrice * 0.5;

  const bankName = import.meta.env.VITE_BANK_NAME || "Banco Santander";

  const bankAccount =
    import.meta.env.VITE_BANK_ACCOUNT || "CAJA DE AHORRO EN PESOS 101-368333/4";

  const bankCbu = import.meta.env.VITE_BANK_CBU || "0720101788000036833340";

  const bankAlias = import.meta.env.VITE_BANK_ALIAS || "BOYA.CANAL.SILLON";

  const bankHolder = import.meta.env.VITE_BANK_HOLDER || "RUBEN ANDRES LOPEZ";

  const bankDocument =
    import.meta.env.VITE_BANK_DOCUMENT || "CUIT 23-16830023-9";

  const whatsappUrl =
    import.meta.env.VITE_WHATSAPP_RECEIPT_URL || "https://wa.link/fdbd7m";

  const bankDetails = [
    { label: "Banco", value: bankName, field: "bank" },
    { label: "Cuenta", value: bankAccount, field: "account" },
    { label: "Tipo de cuenta", value: bankDocument, field: "document" },
    { label: "CBU", value: bankCbu, field: "cbu" },
    { label: "Alias", value: bankAlias, field: "alias" },
    { label: "Titular", value: bankHolder, field: "holder" },
  ];

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField(null);
      }, 1800);
    } catch (error) {
      console.error("No se pudo copiar el dato:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f2]">
      <Navbar />

      <main className="flex flex-1 items-start px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:pb-14">
        <section className="mx-auto grid w-full max-w-[1020px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_14px_42px_rgba(0,0,0,0.07)] lg:grid-cols-2">
          {/* Columna izquierda: estado */}
          <div className="border-b border-neutral-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a57b52]">
              Solicitud recibida
            </p>

            <h1 className="mt-2 text-1xl font-semibold leading-tight text-neutral-950 sm:text-[28px]">
              Tu solicitud fue enviada
            </h1>

            <p className="mt-0.5 text-[11px] text-neutral-500">
              Registramos correctamente tu solicitud. Para confirmar la reserva,
              realizá la transferencia de la seña y enviá el comprobante.{" "}
            </p>

            <div className="mt-5 rounded-xl border border-neutral-200 bg-[#faf9f7] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Estado de la reserva
              </p>

              <div className="mt-4">
                <div className="relative flex gap-3 pb-4">
                  <div className="relative flex w-5 shrink-0 justify-center">
                    <CheckCircle2
                      size={18}
                      strokeWidth={2}
                      className="relative z-10 bg-[#faf9f7] text-emerald-600"
                    />
                    <span className="absolute left-1/2 top-4 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-neutral-300" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-neutral-950">
                      Solicitud enviada
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                      La solicitud fue registrada correctamente.
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-3 pb-4">
                  <div className="relative flex w-5 shrink-0 justify-center">
                    <span className="relative z-10 mt-0.5 h-4 w-4 rounded-full border-4 border-[#a57b52] bg-white" />
                    <span className="absolute left-1/2 top-4 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-neutral-300" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#8d623c]">
                      Esperando transferencia
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                      Transferí el 50% del total de la estadía.
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-3 pb-4">
                  <div className="relative flex w-5 shrink-0 justify-center">
                    <Circle
                      size={16}
                      strokeWidth={1.8}
                      className="relative z-10 mt-0.5 bg-[#faf9f7] text-neutral-300"
                    />
                    <span className="absolute left-1/2 top-4 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-neutral-300" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-neutral-500">
                      Esperando comprobante
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-neutral-400">
                      Enviá el comprobante por WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex w-5 shrink-0 justify-center">
                    <Circle
                      size={16}
                      strokeWidth={1.8}
                      className="mt-0.5 text-neutral-300"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-neutral-500">
                      Reserva confirmada
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-neutral-400">
                      Recibirás la confirmación por correo electrónico.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {reservationId && (
              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Código de reserva
                </p>

                <p className="mt-1.5 break-all text-sm font-semibold text-neutral-950">
                  {reservationId}
                </p>
              </div>
            )}

            <Link
              to="/"
              className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              <Home size={14} strokeWidth={1.8} />
              Volver al inicio
            </Link>
          </div>

          {/* Columna derecha: transferencia */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-white">
                <Landmark size={17} strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-neutral-950 sm:text-base">
                  Datos para realizar la transferencia
                </h2>

                <p className="mt-0.5 text-[11px] text-neutral-500">
                  Transferí la seña y luego enviá el comprobante
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {bankDetails.map((detail) => (
                <div
                  key={detail.field}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {detail.label}
                    </p>

                    <p className="mt-1 break-all text-[11px] font-semibold leading-4 text-neutral-900">
                      {detail.value}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(detail.value, detail.field)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
                    aria-label={`Copiar ${detail.label}`}
                    title={`Copiar ${detail.label}`}
                  >
                    {copiedField === detail.field ? (
                      <Check
                        size={14}
                        className="text-emerald-600"
                        strokeWidth={2}
                      />
                    ) : (
                      <Copy size={13} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {totalPrice > 0 ? (
              <div className="mt-5 rounded-xl border border-neutral-200 bg-[#faf9f7] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Resumen del pago
                </p>

                <div className="mt-3 flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
                  <span className="text-sm text-neutral-600">
                    Total de la estadía
                  </span>

                  <strong className="text-sm font-semibold text-neutral-950">
                    {formatPrice(totalPrice)}
                  </strong>
                </div>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">
                      Seña a transferir
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      50% del total
                    </p>
                  </div>

                  <strong className="text-2xl font-bold text-neutral-950">
                    {formatPrice(depositAmount)}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs leading-5 text-amber-950">
                  No pudimos recuperar el importe de esta reserva.
                </p>
              </div>
            )}

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-[11px] leading-4 text-amber-950">
                La reserva quedará pendiente hasta que recibamos y verifiquemos
                el comprobante.
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-xs font-semibold text-white transition hover:bg-[#20bd5a]"
            >
              <MessageCircle size={15} strokeWidth={1.8} />
              Enviar comprobante por WhatsApp
            </a>

            <p className="mt-2 text-center text-[9px] leading-4 text-neutral-500">
              Incluí el código de reserva en el mensaje para identificar el
              pago.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReservationSuccess;
