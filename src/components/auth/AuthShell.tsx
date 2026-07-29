import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-page">
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-100px] h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl" />
      <div className="absolute right-[20%] top-[20%] h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <section className="auth-card">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl font-black text-white shadow-lg shadow-teal-500/30">
            L
          </span>

          <span className="text-2xl font-black tracking-tight text-slate-900">
            Lingua<span className="text-teal-500">Go</span>
          </span>
        </Link>

        <div className="mb-8 text-center">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
        </div>

        {children}
      </section>
    </main>
  );
}