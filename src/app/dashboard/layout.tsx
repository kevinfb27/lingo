import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardSidebar
        userName={session.user.name}
        userEmail={session.user.email}
      />

      <div className="min-w-0 lg:pl-72">
        {children}
      </div>
    </div>
  );
}