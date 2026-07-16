import { Lock, LogIn, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/admin" replace />;
  }

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
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5f2] px-4">
      <section className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a57b52]">
            Cortada Roo
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-neutral-950">
            Panel administrador
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
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
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-neutral-200 pl-11 pr-4 text-sm outline-none transition focus:border-[#a57b52]"
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
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-neutral-200 pl-11 pr-4 text-sm outline-none transition focus:border-[#a57b52]"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="
              flex h-12 w-full items-center justify-center gap-2
              rounded-xl bg-[#9b6f45]
              text-sm font-semibold text-white
              transition

              hover:bg-[#855d3c]

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
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
