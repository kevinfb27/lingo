"use client";

import AuthShell from "@/components/auth/AuthShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Debes escribir tu correo electrónico.");
      return;
    }

    router.push(
      `/reset-password?email=${encodeURIComponent(cleanEmail)}`
    );
  }

  return (
    <AuthShell
      title="Recupera tu contraseña"
      description="Te enviaremos un código de seis dígitos para crear una nueva contraseña."
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

        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <p className="text-sm leading-6 text-teal-800">
            El código llegará al correo asociado a tu cuenta y tendrá una
            duración limitada.
          </p>
        </div>

        <button type="submit" className="primary-button">
          Enviar código
        </button>

        {message && <p className="message-error">{message}</p>}
      </form>

      <p className="mt-7 text-center">
        <Link href="/login" className="secondary-link text-sm">
          Volver al inicio de sesión
        </Link>
      </p>
    </AuthShell>
  );
}