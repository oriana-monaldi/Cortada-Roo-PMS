import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ApartmentGalleryProps = {
  images: string[];
  apartmentName: string;
};

const ApartmentGallery = ({ images, apartmentName }: ApartmentGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const visibleImages = images.slice(0, 8);
  const remainingImages = Math.max(images.length - visibleImages.length, 0);

  const openImage = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const showPreviousImage = () => {
    setSelectedIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  };

  const showNextImage = () => {
    setSelectedIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0].clientX;
    const difference = touchStartX.current - touchEndX;

    if (difference > 50) {
      showNextImage();
    }

    if (difference < -50) {
      showPreviousImage();
    }

    touchStartX.current = null;
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Título superior */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => openImage(0)}
            className="
              inline-flex items-center gap-2
              text-sm font-semibold text-neutral-950
              transition hover:text-[#9b6f45]
            "
          >
            <Images size={18} strokeWidth={1.8} />
            Todas las fotos ({images.length})
          </button>
        </div>

        {/* Galería desktop/tablet */}
        <div className="hidden gap-2 sm:grid sm:grid-cols-[2fr_1fr]">
          {/* Imagen principal */}
          <button
            type="button"
            onClick={() => openImage(0)}
            className="
              group relative h-[430px] overflow-hidden
              rounded-l-2xl bg-neutral-100 text-left
              lg:h-[500px]
            "
            aria-label={`Abrir imagen principal de ${apartmentName}`}
          >
            <img
              src={images[0]}
              alt={`${apartmentName} - imagen 1`}
              className="
                h-full w-full object-cover
                transition duration-500
                group-hover:scale-[1.02]
              "
            />

            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </button>

          {/* Imágenes derechas */}
          <div className="grid gap-2">
            {images.slice(1, 3).map((image, index) => {
              const realIndex = index + 1;

              return (
                <button
                  key={`${image}-${realIndex}`}
                  type="button"
                  onClick={() => openImage(realIndex)}
                  className={`
                    group relative overflow-hidden bg-neutral-100 text-left
                    ${index === 0 ? "rounded-tr-2xl" : "rounded-br-2xl"}
                  `}
                  aria-label={`Abrir imagen ${realIndex + 1}`}
                >
                  <img
                    src={image}
                    alt={`${apartmentName} - imagen ${realIndex + 1}`}
                    className="
                      h-full w-full object-cover
                      transition duration-500
                      group-hover:scale-105
                    "
                  />

                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Miniaturas desktop/tablet */}
        <div className="mt-2 hidden grid-cols-5 gap-2 sm:grid">
          {visibleImages.slice(3, 8).map((image, index) => {
            const realIndex = index + 3;
            const isLastVisibleImage = index === 4;
            const showMoreOverlay = isLastVisibleImage && remainingImages > 0;

            return (
              <button
                key={`${image}-${realIndex}`}
                type="button"
                onClick={() => openImage(realIndex)}
                className="
                  group relative h-[110px] overflow-hidden
                  rounded-xl bg-neutral-100 text-left
                  lg:h-[135px]
                "
                aria-label={
                  showMoreOverlay
                    ? `Ver ${remainingImages} fotos más`
                    : `Abrir imagen ${realIndex + 1}`
                }
              >
                <img
                  src={image}
                  alt={`${apartmentName} - imagen ${realIndex + 1}`}
                  className="
                    h-full w-full object-cover
                    transition duration-500
                    group-hover:scale-105
                  "
                />

                <div
                  className={`
                    absolute inset-0 transition
                    ${
                      showMoreOverlay
                        ? "bg-black/45"
                        : "bg-black/0 group-hover:bg-black/10"
                    }
                  `}
                />

                {showMoreOverlay && (
                  <span
                    className="
                      absolute inset-0 flex items-center justify-center
                      px-3 text-center text-sm font-semibold text-white
                      lg:text-base
                    "
                  >
                    +{remainingImages} fotos
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Galería mobile */}
        <div className="sm:hidden">
          <button
            type="button"
            onClick={() => openImage(0)}
            className="
              group relative block h-[250px] w-full
              overflow-hidden rounded-2xl bg-neutral-100
              text-left
            "
          >
            <img
              src={images[0]}
              alt={`${apartmentName} - imagen principal`}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            <span
              className="
                absolute bottom-3 right-3
                inline-flex items-center gap-2
                rounded-lg bg-white/95 px-3 py-2
                text-xs font-semibold text-neutral-950
                shadow-md
              "
            >
              <Images size={15} />
              Ver {images.length} fotos
            </span>
          </button>

          <div
            className="
              mt-2 flex snap-x snap-mandatory gap-2
              overflow-x-auto pb-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {images.slice(1).map((image, index) => {
              const realIndex = index + 1;

              return (
                <button
                  key={`${image}-${realIndex}`}
                  type="button"
                  onClick={() => openImage(realIndex)}
                  className="
                    h-[95px] w-[135px] shrink-0 snap-start
                    overflow-hidden rounded-xl bg-neutral-100
                  "
                >
                  <img
                    src={image}
                    alt={`${apartmentName} - imagen ${realIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-black/95 px-3 py-4
            sm:px-8
          "
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="
              absolute right-4 top-4 z-30
              flex h-11 w-11 items-center justify-center
              rounded-full bg-white/10 text-white
              transition hover:bg-white/20
            "
            aria-label="Cerrar galería"
          >
            <X size={24} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPreviousImage();
            }}
            className="
              absolute left-2 top-1/2 z-30
              flex h-11 w-11 -translate-y-1/2
              items-center justify-center
              rounded-full bg-white/10 text-white
              transition hover:bg-white/20
              sm:left-6 sm:h-12 sm:w-12
            "
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={28} />
          </button>

          <div
            className="
              flex h-full w-full max-w-7xl
              items-center justify-center
            "
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[selectedIndex]}
              alt={`${apartmentName} - imagen ${selectedIndex + 1}`}
              draggable={false}
              className="
                max-h-[85vh] max-w-full
                select-none object-contain
              "
            />
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNextImage();
            }}
            className="
              absolute right-2 top-1/2 z-30
              flex h-11 w-11 -translate-y-1/2
              items-center justify-center
              rounded-full bg-white/10 text-white
              transition hover:bg-white/20
              sm:right-6 sm:h-12 sm:w-12
            "
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={28} />
          </button>

          <div
            className="
              absolute bottom-4 left-1/2
              -translate-x-1/2 rounded-full
              bg-black/60 px-4 py-2
              text-xs text-white
            "
          >
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ApartmentGallery;
