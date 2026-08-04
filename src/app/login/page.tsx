"use client";

import AuthShell from "@/components/auth/AuthShell";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Debes escribir tu correo electrónico.");
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: cleanEmail,
        password,
        rememberMe,
      });

      if (error) {
        setMessage("El correo o la contraseña son incorrectos.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage("Ocurrió un error inesperado. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      description="Inicia sesión y continúa avanzando en tus idiomas."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
            className="form-input"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              Contraseña
            </label>

            <Link
              href="/forgot-password"
              className="secondary-link text-sm"
            >
              ¿La olvidaste?
            </Link>
          </div>

          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Escribe tu contraseña"
            autoComplete="current-password"
            required
            className="form-input"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-teal-500"
          />

          Mantener mi sesión iniciada
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        {message && <p className="message-error">{message}</p>}
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        ¿Todavía no tienes una cuenta?{" "}
        <Link href="/register" className="secondary-link">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}