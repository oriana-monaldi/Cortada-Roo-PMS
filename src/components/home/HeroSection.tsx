import {
  CalendarDays,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Tag,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";

import heroImage from "../../assets/img1.jpeg";
import { getVacationPeriods } from "../../services/vacationService";
import type { VacationPeriod } from "../../types/vacation";
import BookingDateRangePicker from "../ui/BookingDateRangePicker";

const formatQueryDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const HeroSection = () => {
  const navigate = useNavigate();

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [searchError, setSearchError] = useState("");
  const [vacationMessage, setVacationMessage] = useState("");
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [loadingVacationPeriods, setLoadingVacationPeriods] = useState(true);

  useEffect(() => {
    const loadVacationPeriods = async () => {
      try {
        const periods = await getVacationPeriods();
        setVacationPeriods(periods);
      } catch (error) {
        console.error("Error al cargar los períodos de vacaciones:", error);
      } finally {
        setLoadingVacationPeriods(false);
      }
    };

    void loadVacationPeriods();
  }, []);

  const hasCompleteRange = Boolean(selectedRange?.from && selectedRange?.to);

  const handleRangeChange = (range: DateRange | undefined) => {
    setSelectedRange(range);
    setSearchError("");
    setVacationMessage("");
  };

  const handleSearch = () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      setSearchError(
        "Seleccioná una fecha de check-in y una fecha de check-out.",
      );

      return;
    }

    if (selectedRange.to <= selectedRange.from) {
      setSearchError("La fecha de check-out debe ser posterior al check-in.");

      return;
    }

    setSearchError("");

    const searchParams = new URLSearchParams({
      from: formatQueryDate(selectedRange.from),
      to: formatQueryDate(selectedRange.to),
      guests: String(guests),
    });

    navigate(`/disponibilidad?${searchParams.toString()}`);
  };

  return (
    <section className="relative h-[100svh] overflow-visible bg-[#faf9f7] text-white">
      {/* Fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImage}
          alt="Complejo Apartamentos Cortada Roo"
          className="
            h-full w-full object-cover
            object-[58%_center]
            sm:object-center
            lg:object-[center_58%]
          "
        />

        <div className="absolute inset-0 bg-black/20" />

        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-black/55
            via-black/10
            to-black/60

            md:bg-gradient-to-r
            md:from-black/70
            md:via-black/25
            md:to-black/5
          "
        />
      </div>

      {/* Contenido */}
      <div
        className="
          relative z-10 mx-auto flex h-full
          w-full max-w-[1440px]
          flex-col
          px-4 pb-8 pt-24

          sm:px-6 sm:pt-24
          md:px-8
          lg:px-12 lg:pb-10 lg:pt-24
        "
      >
        {/* Buscador */}
        <div
          id="reservar"
          className="
            relative z-40 w-full

            lg:ml-auto
            lg:max-w-[1180px]

            xl:max-w-[1240px]
          "
        >
          <div
            className="
              rounded-3xl
              border border-white/40
              bg-white/85
              px-4 py-4
              text-neutral-900
              shadow-[0_12px_35px_rgba(0,0,0,0.15)]
              backdrop-blur-xl

              supports-[backdrop-filter]:bg-white/80

              sm:px-5 sm:py-5
              lg:px-6
            "
          >
            <div
              className="
                grid grid-cols-1 gap-4

                sm:grid-cols-2

                lg:grid-cols-[minmax(0,2fr)_minmax(240px,0.78fr)_minmax(220px,auto)]
                lg:items-stretch
                lg:gap-3
              "
            >
              {/* Fechas */}
              <div className="min-w-0">
                <BookingDateRangePicker
                  selectedRange={selectedRange}
                  onRangeChange={handleRangeChange}
                  vacationPeriods={vacationPeriods}
                  vacationMessage={vacationMessage}
                  onVacationMessageChange={setVacationMessage}
                />
              </div>

              {/* Huéspedes */}
              <label className="relative block min-w-0">
                <select
                  value={guests}
                  onChange={(event) => {
                    setGuests(Number(event.target.value));
                    setSearchError("");
                  }}
                  className="
                    h-[62px] w-full min-w-0
                    appearance-none rounded-xl
                    border border-[#d8c0a6]
                    bg-[#f8f4ef]
                    pb-2 pl-10 pr-10 pt-6
                    text-sm text-[#4d3b2d]
                    outline-none transition

                    hover:border-[#8b6444]
                    hover:bg-[#fbf8f4]

                    focus:border-[#8b6444]
                    focus:bg-[#fbf8f4]
                    focus:ring-1
                    focus:ring-[#8b6444]/30
                  "
                >
                  <option value={1}>1 persona</option>
                  <option value={2}>2 personas</option>
                  <option value={3}>3 personas</option>
                </select>

                <span
                  className="
                    pointer-events-none absolute
                    left-3 top-2.5
                    text-xs font-semibold text-[#8b6444]
                  "
                >
                  Huéspedes
                </span>

                <UserRound
                  size={17}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none absolute
                    bottom-[13px] left-3
                    text-[#8b6444]
                  "
                />

                <ChevronDown
                  size={17}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none absolute
                    bottom-[13px] right-3
                    text-[#8b6444]
                  "
                />
              </label>

              {/* Botón */}
              <button
                type="button"
                onClick={handleSearch}
                disabled={loadingVacationPeriods}
                className={`
                  flex h-[62px] w-full items-center justify-center
                  rounded-xl px-6
                  text-sm font-semibold
                  shadow-sm transition

                  active:scale-[0.99]

                  sm:col-span-2

                  lg:col-span-1
                  lg:min-w-[220px]

                  ${
                    loadingVacationPeriods
                      ? "bg-[#d9c5b0] text-[#704c31]"
                      : hasCompleteRange
                      ? "bg-[#8b6444] text-white hover:bg-[#704c31]"
                      : "bg-[#d9c5b0] text-[#704c31] hover:bg-[#ccb39a]"
                  }
                `}
              >
                {loadingVacationPeriods ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Cargando fechas
                  </span>
                ) : hasCompleteRange
                  ? "Buscar disponibilidad"
                  : "Elegí las fechas"}
              </button>
            </div>

            {(searchError || vacationMessage) && (
              <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                {searchError || vacationMessage}
              </p>
            )}
          </div>
        </div>

        {/* Texto del hero */}
        <div
          className="
            mt-16 flex flex-1 items-start

            sm:mt-20
            md:mt-24
            lg:mt-28
            xl:mt-32
          "
        >
          <div className="max-w-[580px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d9b17a] sm:text-xs">
              Complejo de apartamentos
            </p>

            <h1
              className="
                mt-3 max-w-[320px]
                font-serif text-[38px] font-medium
                leading-[1.02] tracking-[-0.025em]
                text-white

                min-[380px]:max-w-[370px]
                min-[380px]:text-[42px]

                sm:max-w-[510px]
                sm:text-[52px]

                md:text-[58px]
                lg:text-[60px]
                xl:text-[66px]
              "
            >
              Tu lugar ideal
              <br />
              en <span className="text-[#d9b17a]">Cañada de Gómez</span>
            </h1>

            <p
              className="
                mt-4 max-w-[350px]
                text-sm leading-6 text-white/90

                sm:max-w-[470px]
                sm:text-base sm:leading-7
              "
            >
              Apartamentos modernos y completamente equipados para que te
              sientas como en casa.
            </p>

            {/* Beneficios */}
            <div
              className="
                mt-5 grid max-w-sm grid-cols-1 gap-3
                text-xs text-white/90

                sm:max-w-[550px]
                sm:grid-cols-3
                sm:gap-5
              "
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#d9b17a]"
                />

                <span>Reserva segura</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#d9b17a]"
                />

                <span>Reservas 24/7</span>
              </div>

              <div className="flex items-center gap-2">
                <Tag
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#d9b17a]"
                />

                <span>Mejor precio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
