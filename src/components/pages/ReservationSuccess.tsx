import { useEffect, useMemo, useState } from "react";
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

import Navbar from "../layouts/Navbar";

type ReservationSuccessLocationState = {
  reservationCode?: string;
  totalPrice?: number;
  expiresAt?: Date | string | number;
};

const formatPrice = (price: number) => {
  return price.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const parseExpirationDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsedDate = new Date(value);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return null;
};

const formatRemainingTime = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
};

const ReservationSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const reservationId = searchParams.get("id");

  const locationState =
    location.state as ReservationSuccessLocationState | null;

  const expirationDate = useMemo(
    () => parseExpirationDate(locationState?.expiresAt),
    [locationState?.expiresAt],
  );

  const remainingMilliseconds = expirationDate
    ? Math.max(0, expirationDate.getTime() - currentTime)
    : null;

  const isExpired =
    remainingMilliseconds !== null && remainingMilliseconds <= 0;
  const reservationCode = locationState?.reservationCode;
  const remainingTime =
    remainingMilliseconds !== null
      ? formatRemainingTime(remainingMilliseconds)
      : null;

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

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    if (!expirationDate || isExpired) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expirationDate, isExpired]);

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-[#f7f5f2]">
      <Navbar />

      <main className="px-4 pb-8 pt-24 sm:px-6 lg:pb-10">
        <section className="mx-auto grid w-full max-w-[1020px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_14px_42px_rgba(0,0,0,0.07)] lg:grid-cols-2">
          {/* Columna izquierda: estado */}
          <div className="border-b border-neutral-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a57b52]">
              Solicitud recibida
            </p>

            <h1 className="mt-2 text-xl font-semibold leading-tight text-neutral-950 sm:text-[28px]">
              Tu solicitud fue enviada
            </h1>

            <p className="mt-0.5 text-[11px] text-neutral-500">
              {isExpired
                ? "El plazo para completar el pago terminó. Las fechas quedaron disponibles nuevamente."
                : "Registramos correctamente tu solicitud. Para confirmar la reserva, realizá la transferencia de la seña y enviá el comprobante."}
            </p>

            {remainingTime && (
              <div
                className={`mt-4 rounded-xl border p-4 text-center ${
                  isExpired
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    isExpired ? "text-red-700" : "text-amber-800"
                  }`}
                >
                  {isExpired
                    ? "Reserva expirada"
                    : "Tiempo restante para completar el pago"}
                </p>

                <p
                  className={`mt-1 text-3xl font-bold tabular-nums ${
                    isExpired ? "text-red-700" : "text-neutral-950"
                  }`}
                >
                  {remainingTime}
                </p>

                {isExpired && (
                  <p className="mt-2 text-xs text-red-700">
                    Volvé a realizar la reserva para elegir nuevamente las
                    fechas.
                  </p>
                )}
              </div>
            )}

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
                    <p
                      className={`text-sm font-semibold ${
                        isExpired ? "text-red-700" : "text-[#8d623c]"
                      }`}
                    >
                      {isExpired
                        ? "Reserva expirada"
                        : "Esperando transferencia"}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                      {isExpired
                        ? "El tiempo disponible para realizar el pago terminó."
                        : "Transferí el 50% del total de la estadía."}
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

            {reservationCode && (
              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Código de reserva
                </p>

                <p className="mt-1.5 text-xl font-bold tracking-[0.18em] text-neutral-950">
                  {reservationCode}
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
                <h2 className="mt-2 text-xl font-semibold leading-tight text-neutral-950 sm:text-[28px]">
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

            <div
              className={`mt-4 rounded-lg border px-3 py-2.5 ${
                isExpired
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <p
                className={`text-[11px] leading-4 ${
                  isExpired ? "text-red-800" : "text-amber-950"
                }`}
              >
                {isExpired
                  ? "La reserva expiró y ya no puede confirmarse. Volvé a realizar una nueva solicitud."
                  : "La reserva quedará pendiente hasta que recibamos y verifiquemos el comprobante."}
              </p>
            </div>

            {isExpired ? (
              <button
                type="button"
                disabled
                className="mt-4 inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-neutral-300 px-4 text-xs font-semibold text-neutral-600"
              >
                <MessageCircle size={15} strokeWidth={1.8} />
                Reserva expirada
              </button>
            ) : (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-xs font-semibold text-white transition hover:bg-[#20bd5a]"
              >
                <MessageCircle size={15} strokeWidth={1.8} />
                Enviar comprobante por WhatsApp
              </a>
            )}

            <p className="mt-2 text-center text-[9px] leading-4 text-neutral-500">
              {isExpired
                ? "Para continuar, volvé al inicio y realizá una nueva reserva."
                : "Incluí el código de reserva en el mensaje para identificar el pago."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReservationSuccess;
