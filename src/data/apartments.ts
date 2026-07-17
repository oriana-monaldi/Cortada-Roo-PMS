import img2 from "../assets/img2.jpeg";
import img3 from "../assets/img3.jpeg";
import img5 from "../assets/img5.jpeg";
import img6 from "../assets/img6.jpeg";
import img7 from "../assets/img7.jpeg";
import img8 from "../assets/img8.png";
import img9 from "../assets/img9.jpeg";
import img10 from "../assets/img10.jpeg";
import img11 from "../assets/img11.jpeg";
import img13 from "../assets/img13.jpeg";
import img14 from "../assets/img14.jpeg";
import img15 from "../assets/img15.jpeg";

import img16 from "../assets/img16.png";
import img21 from "../assets/img21.png";
import img22 from "../assets/img22.png";
import img23 from "../assets/img23.png";
import img24 from "../assets/im24.png";

export type Apartment = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  image: string;
  images: string[];
  capacity: number;
  totalUnits: number;
  pricePerNight: number;
  services: string[];
};

const defaultServices = [
  "Internet de alta velocidad con Starlink",
  "WiFi de alta velocidad",
  "Aire acondicionado",
  "Smart TV",
  "Cocina totalmente equipada",
  "Baño privado",
  "Ropa de cama",
  "Toallas",
  "Ingreso independiente",
  "Acceso mediante código",
  "Gimnasio exclusivo para huéspedes",
  "Espacios comunes modernos",
  "Cámaras de seguridad",
  "Instalaciones nuevas",
  "Ubicación céntrica",
];

export const apartments: Apartment[] = [
  {
    id: "individual",
    name: "Habitación Individual",
    shortName: "Individual",
    description: "Una opción cómoda y funcional para quienes viajan solos.",
    longDescription:
      "Ideal para quienes buscan una estadía tranquila y confortable. Su diseño moderno, excelente iluminación y equipamiento completo ofrecen el equilibrio perfecto entre comodidad y funcionalidad, tanto para viajes de trabajo como de descanso.",
    image: img6,

    images: [
      img6,
      img11,
      img3,
      img5,
      img6,
      img7,
      img8,
      img13,
      img14,
      img15,
      img16,
      img21,
    ],
    capacity: 1,
    totalUnits: 2,
    pricePerNight: 110000,
    services: defaultServices,
  },

  {
    id: "doble",
    name: "Habitación Doble",
    shortName: "Doble",
    description: "Una alternativa cómoda para dos huéspedes.",
    longDescription:
      "Pensada para compartir una estadía agradable, esta habitación combina amplitud, confort y un ambiente moderno con todas las comodidades necesarias para disfrutar cada momento.",
    image: img24,
    images: [
      img24,
      img2,
      img22,
      img21,
      img23,
      img16,
      img14,
      img13,
      img10,
      img9,
    ],
    capacity: 2,
    totalUnits: 3,
    pricePerNight: 130000,
    services: defaultServices,
  },

  {
    id: "triple",
    name: "Habitación Triple",
    shortName: "Triple",
    description: "Una opción amplia para grupos de hasta tres personas.",
    longDescription:
      "Espacios amplios y completamente equipados para brindar una experiencia cómoda a familias o grupos pequeños, manteniendo el estilo moderno y la calidad que caracterizan al complejo.",
    image: img10,
    images: [
      img3,
      img24,
      img2,
      img3,
      img9,
      img10,
      img11,
      img13,
      img14,
      img16,
      img8,
    ],
    capacity: 3,
    totalUnits: 2,
    pricePerNight: 150000,
    services: defaultServices,
  },
];
