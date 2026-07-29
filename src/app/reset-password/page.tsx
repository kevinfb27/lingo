"use client";

import AuthShell from "@/components/auth/AuthShell";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, []);

  function handleCodeChange(value: string) {
    const onlyNumbers = value.replace(/\D/g, "");
    setCode(onlyNumbers.slice(0, 6));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    if (!email.trim()) {
      setMessage("Debes escribir tu correo electrónico.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setMessage("El código debe contener exactamente 6 números.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsSuccess(true);
    setMessage("La información fue validada correctamente.");
  }

  return (
    <AuthShell
      title="Crea una nueva contraseña"
      description="Ingresa el código enviado a tu correo y establece tu nueva contraseña."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          <label htmlFor="code" className="form-label">
            Código de verificación
          </label>

          <input
            id="code"
            name="code"
            type="text"
            value={code}
            onChange={(event) => handleCodeChange(event.target.value)}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className="form-input text-center text-2xl font-black tracking-[0.45em]"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="form-label">
            Nueva contraseña
          </label>

          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            minLength={8}
            required
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar nueva contraseña
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repite la contraseña"
            autoComplete="new-password"
            minLength={8}
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="primary-button">
          Cambiar contraseña
        </button>

        {message && (
          <p className={isSuccess ? "message-success" : "message-error"}>
            {message}
          </p>
        )}
      </form>

      <div className="mt-7 space-y-3 text-center">
        <Link
          href="/forgot-password"
          className="secondary-link block text-sm"
        >
          Solicitar otro código
        </Link>

        <Link
          href="/login"
          className="block text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthShell>
  );
}