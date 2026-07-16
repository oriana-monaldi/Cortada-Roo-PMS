import img1 from "../../assets/img1.jpeg";
import img2 from "../../assets/img2.jpeg";
import img3 from "../../assets/img3.jpeg";
import img4 from "../../assets/img4.jpeg";
import img5 from "../../assets/img5.jpeg";
import img6 from "../../assets/img6.jpeg";
import img7 from "../../assets/img7.jpeg";
import img9 from "../../assets/img9.jpeg";
import img10 from "../../assets/img10.jpeg";
import img11 from "../../assets/img11.jpeg";
import img12 from "../../assets/img12.jpeg";
import img13 from "../../assets/img13.jpeg";
import img14 from "../../assets/img14.jpeg";
import img15 from "../../assets/img15.jpeg";
import img17 from "../../assets/img17.jpeg";

const galleryImages = [
  { src: img1, alt: "Apartamento Cortada Roo" },
  { src: img2, alt: "Apartamento Cortada Roo" },
  { src: img3, alt: "Apartamento Cortada Roo" },
  { src: img4, alt: "Apartamento Cortada Roo" },
  { src: img5, alt: "Apartamento Cortada Roo" },
  { src: img6, alt: "Apartamento Cortada Roo" },
  { src: img7, alt: "Apartamento Cortada Roo" },
  { src: img9, alt: "Apartamento Cortada Roo" },
  { src: img10, alt: "Apartamento Cortada Roo" },
  { src: img11, alt: "Apartamento Cortada Roo" },
  { src: img12, alt: "Apartamento Cortada Roo" },
  { src: img13, alt: "Apartamento Cortada Roo" },
  { src: img14, alt: "Apartamento Cortada Roo" },
  { src: img15, alt: "Apartamento Cortada Roo" },
  { src: img17, alt: "Apartamento Cortada Roo" },
];

const Gallery = () => {
  const duplicatedImages = [...galleryImages, ...galleryImages];

  return (
    <section
      id="galeria"
      className="bg-white overflow-hidden px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52] sm:text-sm">
            Galería
          </p>

          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Conocé nuestros espacios
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
            Descubrí cada ambiente del complejo y conocé los espacios donde vas
            a disfrutar tu estadía.
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-2xl">
          {/* Degradado izquierdo */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent lg:w-20" />

          {/* Degradado derecho */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent lg:w-20" />

          <div className="gallery-track">
            {duplicatedImages.map((image, index) => (
              <figure
                key={`${image.src}-${index}`}
                className="mx-1 shrink-0 overflow-hidden rounded-2xl bg-neutral-100"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  draggable={false}
                  className="
                    h-[105px] w-[155px] object-cover select-none
                    transition duration-500 hover:scale-105

                    min-[380px]:h-[120px]
                    min-[380px]:w-[180px]

                    sm:h-[160px]
                    sm:w-[250px]

                    md:h-[190px]
                    md:w-[300px]

                    lg:h-[240px]
                    lg:w-[380px]
                  "
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
