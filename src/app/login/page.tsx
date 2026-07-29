"use client";

import AuthShell from "@/components/auth/AuthShell";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setMessage(`Formulario recibido para ${email}.`);
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
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Contraseña
            </label>

            <Link href="/forgot-password" className="secondary-link text-sm">
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

        <button type="submit" className="primary-button">
          Iniciar sesión
        </button>

        {message && <p className="message-success">{message}</p>}
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