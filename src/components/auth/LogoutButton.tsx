"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    await authClient.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}