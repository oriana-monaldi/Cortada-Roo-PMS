import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Apartamentos",
    href: "/#apartamentos",
  },
  {
    label: "Servicios",
    href: "/#servicios",
  },
  {
    label: "Galería",
    href: "/#galeria",
  },
  {
    label: "Contacto",
    href: "/#contacto",
  },
];

const Navbar = () => {
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  const previousScrollPosition = useRef(0);

  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !hasScrolled && !isMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      const previousPosition = previousScrollPosition.current;
      const scrollDifference = currentScrollPosition - previousPosition;

      setHasScrolled(currentScrollPosition > 30);

      if (isMenuOpen || currentScrollPosition < 80) {
        setIsNavbarVisible(true);
        previousScrollPosition.current = currentScrollPosition;
        return;
      }

      if (scrollDifference > 8) {
        setIsNavbarVisible(false);
      }

      if (scrollDifference < -8) {
        setIsNavbarVisible(true);
      }

      previousScrollPosition.current = currentScrollPosition;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsNavbarVisible(true);
    previousScrollPosition.current = window.scrollY;
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`
        fixed left-0 top-0 z-50 w-full
        transform transition-all duration-300 ease-in-out
        ${isNavbarVisible || isMenuOpen ? "translate-y-0" : "-translate-y-full"}
        ${
          isTransparent
            ? "bg-transparent text-white"
            : "bg-white/95 text-neutral-900 shadow-sm backdrop-blur-md"
        }
      `}
    >
      <nav
        className="
          mx-auto flex h-20 max-w-[1440px]
          items-center justify-between
          px-4 sm:px-6 lg:px-12
        "
        aria-label="Navegación principal"
      >
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-3"
          aria-label="Ir al inicio"
        >
          <div
            className={`
              flex h-10 w-10 items-center justify-center
              rounded-full border text-xs font-semibold
              transition-colors duration-300
              sm:h-11 sm:w-11 sm:text-sm
              ${
                isTransparent
                  ? "border-white/70 text-white"
                  : "border-neutral-900 text-neutral-900"
              }
            `}
          >
            CR
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]">
              Cortada Roo
            </p>

            <p
              className={`
                mt-0.5 text-[10px] uppercase tracking-[0.24em]
                transition-colors duration-300
                ${isTransparent ? "text-white/70" : "text-neutral-500"}
              `}
            >
              Apartamentos temporarios
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 xl:flex">
          {navigationItems.map((item) => {
            const isHomeLink = item.href === "/";

            return isHomeLink ? (
              <Link
                key={item.label}
                to={item.href}
                className="
                  relative text-sm font-medium
                  transition-opacity duration-200
                  after:absolute after:-bottom-2 after:left-0
                  after:h-px after:w-0 after:bg-current
                  after:transition-all after:duration-300
                  hover:opacity-70 hover:after:w-full
                "
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="
                  relative text-sm font-medium
                  transition-opacity duration-200
                  after:absolute after:-bottom-2 after:left-0
                  after:h-px after:w-0 after:bg-current
                  after:transition-all after:duration-300
                  hover:opacity-70 hover:after:w-full
                "
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/#reservar"
            className={`
              hidden rounded-full border px-5 py-2.5
              text-sm font-semibold transition-all duration-300
              sm:inline-flex
              ${
                isTransparent
                  ? `
                    border-white bg-white text-neutral-900
                    hover:bg-transparent hover:text-white
                  `
                  : `
                    border-neutral-900 bg-neutral-900 text-white
                    hover:bg-transparent hover:text-neutral-900
                  `
              }
            `}
          >
            Reservá ahora
          </a>

          <button
            type="button"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            className={`
              flex h-10 w-10 items-center justify-center
              rounded-full border transition-colors duration-300
              sm:h-11 sm:w-11
              xl:hidden
              ${
                isTransparent
                  ? "border-white/60 hover:bg-white/10"
                  : "border-neutral-200 hover:bg-neutral-100"
              }
            `}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={21} strokeWidth={1.8} />
            ) : (
              <Menu size={21} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`
          absolute left-0 top-full w-full
          overflow-hidden border-t border-neutral-200
          bg-white text-neutral-900 shadow-lg
          transition-all duration-300 xl:hidden
          ${
            isMenuOpen
              ? "max-h-[calc(100vh-5rem)] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }
        `}
      >
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex flex-col">
            {navigationItems.map((item) => {
              const itemClasses = `
                flex min-h-14 items-center
                border-b border-neutral-100
                text-base font-medium
                transition-colors duration-200
                hover:text-neutral-500
              `;

              if (item.href === "/") {
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={closeMenu}
                    className={itemClasses}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className={itemClasses}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <a
            href="/#reservar"
            onClick={closeMenu}
            className="
              mt-6 flex min-h-12 w-full items-center justify-center
              rounded-full bg-neutral-900 px-6
              text-sm font-semibold text-white
              transition-colors duration-200
              hover:bg-neutral-700
            "
          >
            Reservá ahora
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
