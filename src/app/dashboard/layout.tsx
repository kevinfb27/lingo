import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardSidebar />  

      <main className="min-h-screen lg:pl-[17rem]">
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-6 xl:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
