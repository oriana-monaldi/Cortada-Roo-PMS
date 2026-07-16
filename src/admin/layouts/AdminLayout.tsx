import { CalendarDays, Home, LogOut, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const navigationItems = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: Home,
    end: true,
  },
  {
    label: "Reservas",
    to: "/admin/reservas",
    icon: CalendarDays,
    end: false,
  },
  {
    label: "Configuración",
    to: "/admin/configuracion",
    icon: Settings,
    end: false,
  },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-neutral-950">
      {/* Sidebar desktop */}
      <aside
        className="
          fixed inset-y-0 left-0 z-40 hidden
          w-64 border-r border-neutral-200
          bg-white lg:block
        "
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-neutral-100 px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a57b52]">
              Cortada Roo
            </p>

            <h1 className="mt-2 font-serif text-2xl font-semibold">
              Administración
            </h1>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `
                      flex items-center gap-3 rounded-xl px-4 py-3
                      text-sm font-medium transition

                      ${
                        isActive
                          ? "bg-[#f2e8dc] text-[#8d633d]"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                      }
                    `
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-neutral-100 p-4">
            <div className="mb-3 rounded-xl bg-neutral-50 px-4 py-3">
              <p className="truncate text-xs font-semibold text-neutral-900">
                Administrador
              </p>

              <p className="mt-1 truncate text-xs text-neutral-500">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex w-full items-center justify-center gap-2
                rounded-xl border border-neutral-200
                px-4 py-3 text-sm font-semibold
                text-neutral-700 transition

                hover:border-neutral-300
                hover:bg-neutral-50
                hover:text-neutral-950
              "
            >
              <LogOut size={17} strokeWidth={1.8} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Header mobile */}
      <header
        className="
          sticky top-0 z-30 flex h-16 items-center
          justify-between border-b border-neutral-200
          bg-white px-4 lg:hidden
        "
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
            Cortada Roo
          </p>

          <p className="font-serif text-lg font-semibold">Administración</p>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl border border-neutral-200
            text-neutral-700
          "
          aria-label="Abrir menú"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Menú mobile */}
      {isMenuOpen && (
        <div
          className="
            fixed inset-x-0 top-16 z-40
            border-b border-neutral-200
            bg-white p-4 shadow-lg lg:hidden
          "
        >
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `
                      flex items-center gap-3 rounded-xl px-4 py-3
                      text-sm font-medium transition

                      ${
                        isActive
                          ? "bg-[#f2e8dc] text-[#8d633d]"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }
                    `
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="
              mt-4 flex w-full items-center justify-center gap-2
              rounded-xl border border-neutral-200
              px-4 py-3 text-sm font-semibold text-neutral-700
            "
          >
            <LogOut size={17} strokeWidth={1.8} />
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Contenido */}
      <main className="min-h-screen lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
