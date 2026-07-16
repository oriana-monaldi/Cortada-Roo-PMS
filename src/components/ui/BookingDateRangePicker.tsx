import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";

type BookingDateRangePickerProps = {
  selectedRange: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
};

const normalizeDate = (date: Date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const formatDate = (date?: Date) => {
  if (!date) return "Seleccionar";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getNights = (range?: DateRange) => {
  if (!range?.from || !range?.to) return 0;

  const difference = range.to.getTime() - range.from.getTime();

  return Math.max(Math.round(difference / 86400000), 0);
};

const BookingDateRangePicker = ({
  selectedRange,
  onRangeChange,
}: BookingDateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numberOfMonths, setNumberOfMonths] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => normalizeDate(new Date()), []);
  const nights = getNights(selectedRange);

  const hasCompleteRange = Boolean(selectedRange?.from && selectedRange?.to);

  /*
   * Comportamiento:
   *
   * 1. Sin fechas:
   *    el clic selecciona el check-in.
   *
   * 2. Solo con check-in:
   *    el clic selecciona el check-out.
   *
   * 3. Con rango completo:
   *    el próximo clic inicia un rango nuevo.
   *    Esa fecha pasa a ser el nuevo check-in.
   */
  const handleRangeSelect = (
    nextRange: DateRange | undefined,
    clickedDate: Date,
  ) => {
    if (hasCompleteRange) {
      onRangeChange({
        from: normalizeDate(clickedDate),
        to: undefined,
      });

      return;
    }

    onRangeChange(nextRange);
  };

  const handleClear = () => {
    onRangeChange(undefined);
  };

  useEffect(() => {
    const updateMonths = () => {
      setNumberOfMonths(window.innerWidth >= 1024 ? 2 : 1);
    };

    updateMonths();

    window.addEventListener("resize", updateMonths);

    return () => {
      window.removeEventListener("resize", updateMonths);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      {/* Selector de fechas */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`
  grid w-full grid-cols-2 overflow-hidden rounded-xl
  border bg-[#f7efe5] text-left
  shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]
  backdrop-blur-md transition

  ${
    isOpen
      ? "border-[#d8b07a] ring-1 ring-[#d8b07a]/40"
      : "border-[#d8b07a]/50 hover:border-[#d8b07a] hover:bg-[#fbf6f0]"
  }
`}
        a-expanded={isOpen}
      >
        {/* Check-in */}
        <span className="min-w-0 border-r border-[#d8c8b7] px-3 py-2.5">
          <span className="block text-xs font-semibold text-[#5f5145]">
            Check-in
          </span>

          <span className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-sm text-[#3f3730]">
              {formatDate(selectedRange?.from)}
            </span>

            <CalendarDays
              size={17}
              strokeWidth={1.7}
              className="shrink-0 text-[#d8b07a]"
            />
          </span>
        </span>

        {/* Check-out */}
        <span className="min-w-0 px-3 py-2.5">
          <span className="block text-xs font-semibold text-[#5f5145]">
            Check-out
          </span>

          <span className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-sm text-[#3f3730]">
              {formatDate(selectedRange?.to)}
            </span>

            <CalendarDays
              size={17}
              strokeWidth={1.7}
              className="shrink-0 text-[#8b735d]"
            />
          </span>
        </span>
      </button>

      {/* Calendario desplegable */}
      {isOpen && (
        <div
          className="
            absolute left-0 top-[calc(100%+8px)] z-[100]
            w-[min(92vw,360px)]
            overflow-hidden rounded-2xl
            border border-[#d8c8b7]
            bg-[#f8f3ed]
            text-neutral-900
            shadow-[0_20px_60px_rgba(45,35,25,0.22)]

            lg:w-[680px]
          "
        >
          {/* Encabezado en mobile */}
          <div className="flex items-center justify-between border-b border-[#e2d6ca] px-4 py-3 lg:hidden">
            <div>
              <p className="text-sm font-semibold text-[#352d27]">
                Seleccioná las fechas
              </p>

              <p className="mt-0.5 text-xs text-[#76675a]">
                {hasCompleteRange
                  ? "Seleccioná una fecha para comenzar una nueva búsqueda."
                  : selectedRange?.from
                    ? "Ahora elegí la fecha de salida."
                    : "Elegí la fecha de ingreso."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="
                flex h-8 w-8 items-center justify-center
                rounded-full text-[#76675a]
                transition hover:bg-[#eadfd4]
              "
              aria-label="Cerrar calendario"
            >
              <X size={17} />
            </button>
          </div>

          {/* Calendario */}
          <div className="overflow-x-auto bg-[#f8f3ed] p-3 sm:p-4">
            <DayPicker
              mode="range"
              locale={es}
              lang="es-AR"
              selected={selectedRange}
              onSelect={handleRangeSelect}
              disabled={{ before: today }}
              defaultMonth={selectedRange?.from ?? today}
              numberOfMonths={numberOfMonths}
              pagedNavigation={numberOfMonths === 2}
              showOutsideDays
              min={1}
              className="booking-date-picker"
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft size={20} strokeWidth={2} />
                  ) : (
                    <ChevronRight size={20} strokeWidth={2} />
                  ),
              }}
            />
          </div>

          {/* Pie */}
          <div
            className="
              flex flex-col gap-3
              border-t border-[#e2d6ca]
              bg-[#f3ede6]
              px-4 py-3

              sm:flex-row sm:items-center sm:justify-between
            "
          >
            <div className="text-xs text-[#6d5e51]">
              {selectedRange?.from && selectedRange?.to ? (
                <span>
                  {formatDate(selectedRange.from)} –{" "}
                  {formatDate(selectedRange.to)}{" "}
                  <strong className="text-[#352d27]">
                    ({nights} {nights === 1 ? "noche" : "noches"})
                  </strong>
                </span>
              ) : selectedRange?.from ? (
                <span>Ahora seleccioná la fecha de salida.</span>
              ) : (
                <span>Seleccioná primero la fecha de ingreso.</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <button
                type="button"
                onClick={handleClear}
                disabled={!selectedRange?.from}
                className="
                  text-xs font-semibold text-[#76675a]
                  transition hover:text-[#352d27]

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Limpiar
              </button>

              <button
                type="button"
                disabled={!selectedRange?.from || !selectedRange?.to}
                onClick={() => setIsOpen(false)}
                className="
                  rounded-lg bg-[#9b6f45]
                  px-5 py-2
                  text-xs font-semibold text-white
                  transition hover:bg-[#845b39]

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Aplicar fechas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDateRangePicker;
