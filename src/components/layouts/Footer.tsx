import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";

const Footer = () => {
  const whatsappNumber = "5493471316230";

  const whatsappMessage =
    "Hola, quisiera consultar disponibilidad en Cortada Roo.";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  return (
    <footer
      id="contacto"
      className="border-t border-neutral-800 bg-[#111111] text-white"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-6 lg:px-12">
        <div
          className="
            grid gap-10
            text-center
            md:grid-cols-2 md:text-left
            lg:grid-cols-[1fr_1.2fr_auto]
            lg:items-start
          "
        >
          {/* Marca */}
          <div>
            <p className="font-serif text-3xl font-semibold tracking-[0.08em]">
              CORTADA ROO
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              Apartamentos
            </p>

            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-400 mx-auto md:mx-0">
              Apartamentos temporarios en Cañada de Gómez.
            </p>
          </div>

          {/* Contacto */}
          <div className="space-y-5 text-sm text-neutral-300">
            <a
              href="tel:+5493471316230"
              className="
                flex items-center justify-center gap-3
                transition hover:text-white
                md:justify-start
              "
            >
              <Phone
                size={17}
                strokeWidth={1.7}
                className="shrink-0 text-[#d7b58d]"
              />

              <span>+54 9 3471 31-6230</span>
            </a>

            <a
              href="mailto:info@temporarioscortadaro.com"
              className="
                flex items-center justify-center gap-3
                transition hover:text-white
                md:justify-start
              "
            >
              <Mail
                size={17}
                strokeWidth={1.7}
                className="shrink-0 text-[#d7b58d]"
              />

              <span className="break-all sm:break-normal">
                info@temporarioscortadaro.com
              </span>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Romegialli+847+Cañada+de+Gómez+Santa+Fe"
              target="_blank"
              rel="noreferrer"
              className="
                flex items-start justify-center gap-3
                transition hover:text-white
                md:justify-start
              "
            >
              <MapPin
                size={17}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[#d7b58d]"
              />

              <span className="leading-6">
                Romegialli 847
                <br />
                Cañada de Gómez, Santa Fe
              </span>
            </a>
          </div>

          {/* Reserva y redes */}
          <div className="flex flex-col items-center md:items-start lg:items-end">
            <a
              href="/#reservar"
              className="
                inline-flex h-11
                w-full max-w-[280px]
                items-center justify-center
                rounded-md bg-[#d7b58d]
                px-6
                text-sm font-semibold text-neutral-950
                transition hover:bg-[#c7a375]
                md:w-auto md:max-w-none
              "
            >
              Reservá ahora
            </a>

            <div className="mt-5 flex justify-center gap-3 md:justify-start lg:justify-end">
              <a
                href="https://www.instagram.com/cortada.roo/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="
    flex h-10 w-10 items-center justify-center
    rounded-full border border-neutral-700
    text-neutral-300 transition
    hover:border-[#d7b58d]
    hover:text-[#d7b58d]
  "
              >
                <FaInstagram size={16} />
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61591440187272&mibextid=wwXIfr&rdid=vLi4QwNaHWUm1OaF&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18sL3JhyGq%2F%3Fmibextid%3DwwXIfr#"
                aria-label="Facebook"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-full border border-neutral-700
                  text-neutral-300 transition
                  hover:border-[#d7b58d]
                  hover:text-[#d7b58d]
                "
              >
                <FaFacebookF size={14} />
              </a>

              <a
                href="https://wa.link/fdbd7m"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-full border border-neutral-700
                  text-neutral-300 transition
                  hover:border-[#d7b58d]
                  hover:text-[#d7b58d]
                "
              >
                <MessageCircle size={17} strokeWidth={1.7} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
