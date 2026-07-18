import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import backgroundImage from "../../assets/img1.jpeg";

const Login = () => {
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/90 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a57b52]">
            Cortada Roo
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-neutral-950">
            Panel administrador
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Ingresá con tu cuenta para administrar reservas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-neutral-200 bg-white/90 pl-11 pr-4 text-sm outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#a57b52]/20"
                placeholder="admin@cortadaroo.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Contraseña
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-xl border border-neutral-200 bg-white/90 pl-11 pr-12 text-sm outline-none transition focus:border-[#a57b52] focus:ring-2 focus:ring-[#a57b52]/20"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-[#9b6f45]"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#9b6f45] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#855d3c] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
