import { ArrowRight } from "lucide-react";

import galleryOne from "../../assets/img1.jpeg";
import galleryTwo from "../../assets/img5.jpeg";
import galleryThree from "../../assets/img6.jpeg";
import galleryFour from "../../assets/img10.jpeg";
import galleryFive from "../../assets/img17.jpeg";

const galleryImages = [
  {
    src: galleryOne,
    alt: "Patio interior del complejo Cortada Roo",
  },
  {
    src: galleryTwo,
    alt: "Cocina equipada de los apartamentos",
  },
  {
    src: galleryThree,
    alt: "Ambiente interior del apartamento",
  },
  {
    src: galleryFour,
    alt: "Comedor y espacio de descanso",
  },
  {
    src: galleryFive,
    alt: "Ingreso al complejo Cortada Roo",
  },
];

const Gallery = () => {
  return (
    <section
      id="galeria"
      className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52] sm:text-sm">
              Galería
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl lg:text-5xl">
              Conocé nuestros espacios
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-600 sm:text-base">
              Descubrí cada ambiente del complejo y encontrá el apartamento
              ideal para tu próxima estadía.
            </p>
          </div>

          <a
            href="/galeria"
            className="
              inline-flex h-11 w-fit items-center justify-center gap-3
              rounded-lg border border-[#c49a70] px-5
              text-sm font-semibold text-neutral-900 transition
              hover:bg-[#c49a70] hover:text-white
            "
          >
            Ver galería completa
            <ArrowRight size={17} strokeWidth={1.8} />
          </a>
        </div>

        <div
          className="
            mt-9 grid grid-cols-2 gap-3
            sm:gap-4
            lg:mt-12 lg:grid-cols-5
          "
        >
          {galleryImages.map((image, index) => (
            <figure
              key={image.src}
              className={`
                group overflow-hidden rounded-xl bg-neutral-100
                ${index === 0 ? "col-span-2 lg:col-span-1" : ""}
              `}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="
                  h-40 w-full object-cover transition duration-500
                  group-hover:scale-105
                  sm:h-48
                  lg:h-44
                "
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
