import individualImage from "../assets/img2.jpeg";
import individualImageTwo from "../assets/img3.jpeg";
import individualImageThree from "../assets/img5.jpeg";
import individualImageFour from "../assets/img6.jpeg";

import doubleImage from "../assets/img9.jpeg";
import doubleImageTwo from "../assets/img10.jpeg";
import doubleImageThree from "../assets/img7.jpeg";
import doubleImageFour from "../assets/img5.jpeg";
import doubleImageFive from "../assets/img15.jpeg";
import doubleImageSix from "../assets/img14.jpeg";
import doubleImageSeven from "../assets/img13.jpeg";

import tripleImage from "../assets/img2.jpeg";
import tripleImageTwo from "../assets/img3.jpeg";
import tripleImageThree from "../assets/img5.jpeg";
import tripleImageFour from "../assets/img6.jpeg";
import tripleImageFive from "../assets/img7.jpeg";
import tripleImageSix from "../assets/img8.jpeg";
import tripleImageSeven from "../assets/img13.jpeg";
import tripleImageEight from "../assets/img14.jpeg";

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
    image: individualImage,
    images: [
      individualImage,
      individualImageTwo,
      individualImageThree,
      individualImageFour,
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
    image: doubleImage,
    images: [
      doubleImage,
      doubleImageTwo,
      doubleImageThree,
      doubleImageFour,
      doubleImageFive,
      doubleImageSix,
      doubleImageSeven,
    ],
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
    image: tripleImage,
    images: [
      tripleImage,
      tripleImageTwo,
      tripleImageThree,
      tripleImageFour,
      tripleImageFive,
      tripleImageSix,
      tripleImageSeven,
      tripleImageEight,
    ],
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
