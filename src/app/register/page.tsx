"use client";

import AuthShell from "@/components/auth/AuthShell";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    if (name.trim().length < 2) {
      setMessage("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsSuccess(true);
    setMessage(`Cuenta preparada correctamente para ${name}.`);
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      description="Comienza tu camino para hablar nuevos idiomas."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="form-label">
            Nombre
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Escribe tu nombre"
            autoComplete="name"
            required
            className="form-input"
          />
        </div>

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
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            minLength={8}
            required
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar contraseña
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            minLength={8}
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="primary-button">
          Crear cuenta
        </button>

        {message && (
          <p className={isSuccess ? "message-success" : "message-error"}>
            {message}
          </p>
        )}
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="secondary-link">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}