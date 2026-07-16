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

export const apartments: Apartment[] = [
  {
    id: "individual",
    name: "Habitación Individual",
    shortName: "Individual",
    description: "Una opción cómoda y funcional para quienes viajan solos.",
    longDescription:
      "La habitación individual está pensada para quienes buscan tranquilidad, privacidad y comodidad durante su estadía. Cuenta con un ambiente completamente equipado y acceso a los servicios generales del complejo.",
    image: img3,
    images: [
      img3,
      img5,
      img6,
      img7,
      img8,
      img11,
      img13,
      img14,
      img15,
      img16,
      img21,
    ],
    capacity: 1,
    totalUnits: 2,
    pricePerNight: 110000,
    services: [
      "WiFi de alta velocidad",
      "Aire acondicionado",
      "Smart TV",
      "Cocina equipada",
      "Baño privado",
      "Ropa de cama y toallas",
      "Ingreso independiente",
      "Acceso mediante código",
    ],
  },
  {
    id: "doble",
    name: "Habitación Doble",
    shortName: "Doble",
    description: "Una alternativa cómoda para dos huéspedes.",
    longDescription:
      "La habitación doble ofrece un espacio cómodo y funcional para dos personas. Es ideal para parejas, compañeros de trabajo o huéspedes que buscan una estadía práctica con todos los servicios necesarios.",
    image: img24,
    images: [img2, img22, img21, img23, img16, img14, img13, img10, img9],
    capacity: 2,
    totalUnits: 3,
    pricePerNight: 130000,
    services: [
      "WiFi de alta velocidad",
      "Aire acondicionado",
      "Smart TV",
      "Cocina equipada",
      "Baño privado",
      "Ropa de cama y toallas",
      "Ingreso independiente",
      "Acceso mediante código",
    ],
  },
  {
    id: "triple",
    name: "Habitación Triple",
    shortName: "Triple",
    description: "Una opción amplia para grupos de hasta tres personas.",
    longDescription:
      "La habitación triple está diseñada para grupos pequeños o familias que necesitan mayor capacidad sin perder comodidad. Cuenta con ambientes funcionales y todos los servicios necesarios para una estadía agradable.",
    image: img24,
    images: [img24, img2, img3, img9, img10, img11, img13, img14, img16, img8],
    capacity: 3,
    totalUnits: 2,
    pricePerNight: 150000,
    services: [
      "WiFi de alta velocidad",
      "Aire acondicionado",
      "Smart TV",
      "Cocina equipada",
      "Baño privado",
      "Ropa de cama y toallas",
      "Ingreso independiente",
      "Acceso mediante código",
    ],
  },
];
