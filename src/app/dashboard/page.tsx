import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [
    totalWords,
    learnedWords,
    favoriteWords,
    recentWords,
  ] = await Promise.all([
    prisma.vocabularyEntry.count({
      where: {
        userId: session.user.id,
      },
    }),

    prisma.vocabularyEntry.count({
      where: {
        userId: session.user.id,
        isLearned: true,
      },
    }),

    prisma.vocabularyEntry.count({
      where: {
        userId: session.user.id,
        isFavorite: true,
      },
    }),

    prisma.vocabularyEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  const pendingWords = totalWords - learnedWords;

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <header className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-semibold text-teal-400">
            Panel del estudiante
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Hola, {session.user.name}
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Continúa aprendiendo y organiza todas
            las palabras nuevas que encuentres.
          </p>
        </div>

        <Link
          href="/dashboard/vocabulary"
          className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-center font-bold text-white shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5"
        >
          Agregar palabra
        </Link>
      </header>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold text-slate-400">
            Palabras guardadas
          </p>

          <p className="mt-4 text-4xl font-black">
            {totalWords}
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
          <p className="text-sm font-semibold text-emerald-300">
            Aprendidas
          </p>

          <p className="mt-4 text-4xl font-black text-emerald-300">
            {learnedWords}
          </p>
        </article>

        <article className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
          <p className="text-sm font-semibold text-cyan-300">
            Pendientes
          </p>

          <p className="mt-4 text-4xl font-black text-cyan-300">
            {pendingWords}
          </p>
        </article>

        <article className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6">
          <p className="text-sm font-semibold text-amber-300">
            Favoritas
          </p>

          <p className="mt-4 text-4xl font-black text-amber-300">
            {favoriteWords}
          </p>
        </article>
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-teal-400">
                Vocabulario reciente
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Últimas palabras
              </h2>
            </div>

            <Link
              href="/dashboard/vocabulary"
              className="text-sm font-semibold text-teal-400 hover:text-teal-300"
            >
              Ver todas
            </Link>
          </div>

          {recentWords.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-10 text-center">
              <p className="text-lg font-bold">
                Todavía no tienes palabras guardadas
              </p>

              <p className="mt-2 text-slate-500">
                Agrega la primera palabra a tu
                vocabulario personal.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-white/10">
              {recentWords.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="text-lg font-bold">
                      {entry.word}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {entry.translation}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      entry.isLearned
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-cyan-400/10 text-cyan-300"
                    }`}
                  >
                    {entry.isLearned
                      ? "Aprendida"
                      : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 p-6 sm:p-8">
          <p className="font-semibold text-teal-300">
            Próximo objetivo
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Construye tu diccionario personal
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            Guarda palabras nuevas, su traducción,
            pronunciación y ejemplos para repasarlas
            cuando quieras.
          </p>

          <Link
            href="/dashboard/vocabulary"
            className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5"
          >
            Ir a vocabulario
          </Link>
        </article>
      </section>
    </main>
  );
}