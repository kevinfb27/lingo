"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type DashboardSidebarProps = {
  userName: string;
  userEmail: string;
};

const navigation = [
  {
    href: "/dashboard",
    label: "Inicio",
    symbol: "⌂",
  },
  {
    href: "/dashboard/vocabulary",
    label: "Vocabulario",
    symbol: "Aa",
  },
];

const upcoming = [
  "Mis cursos",
  "Progreso",
  "Perfil",
];

export default function DashboardSidebar({
  userName,
  userEmail,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isClosingSession, setIsClosingSession] =
    useState(false);

  async function handleLogout() {
    setIsClosingSession(true);

    await authClient.signOut();

    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-slate-950 lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-lg font-black text-white shadow-lg shadow-teal-500/20">
              L
            </span>

            <span className="text-2xl font-black tracking-tight text-white">
              Lingua
              <span className="text-teal-400">
                Go
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 font-semibold transition ${
                  active
                    ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-teal-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sm">
                  {item.symbol}
                </span>

                {item.label}
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="px-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
              Próximamente
            </p>

            <div className="mt-3 space-y-2">
              {upcoming.map((item) => (
                <div
                  key={item}
                  className="flex cursor-not-allowed items-center justify-between rounded-2xl px-4 py-3 text-slate-600"
                >
                  <span>{item}</span>

                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase">
                    Pronto
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-2xl bg-white/5 p-4">
            <p className="truncate font-bold text-white">
              {userName}
            </p>

            <p className="mt-1 truncate text-sm text-slate-500">
              {userEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isClosingSession}
            className="w-full rounded-2xl border border-white/10 px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            {isClosingSession
              ? "Cerrando sesión..."
              : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-black text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
              L
            </span>

            Lingua
            <span className="text-teal-400">
              Go
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-slate-300"
          >
            Salir
          </button>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${
                isActive(item.href)
                  ? "bg-teal-500 text-white"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}