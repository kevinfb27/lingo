import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [
    totalVocabulary,
    learnedVocabulary,
    favoriteVocabulary,
    pendingVocabulary,
    recentVocabulary,
    course,
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

    prisma.vocabularyEntry.count({
      where: {
        userId: session.user.id,
        isLearned: false,
      },
    }),

    prisma.vocabularyEntry.findMany({
      where: {
        userId: session.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 4,

      select: {
        id: true,
        word: true,
        translation: true,
        alternativeTranslation: true,
      },
    }),

    prisma.course.findFirst({
      where: {
        isPublished: true,
      },

      orderBy: {
        order: "asc",
      },

      include: {
        units: {
          orderBy: {
            order: "asc",
          },

          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },

              include: {
                progress: {
                  where: {
                    userId: session.user.id,
                  },

                  select: {
                    status: true,
                    score: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const lessons =
    course?.units.flatMap((unit) =>
      unit.lessons.map((lesson) => ({
        ...lesson,
        unitTitle: unit.title,
      })),
    ) ?? [];

  const completedLessons = lessons.filter(
    (lesson) =>
      lesson.progress[0]?.status === "COMPLETED",
  ).length;

  const courseProgress =
    lessons.length === 0
      ? 0
      : Math.round(
          (completedLessons / lessons.length) * 100,
        );

  const nextLesson =
    lessons.find(
      (lesson) =>
        lesson.progress[0]?.status !== "COMPLETED",
    ) ??
    lessons[0] ??
    null;

  const firstName =
    session.user.name?.split(" ")[0] ?? "estudiante";

  return (
    <main>
      {/* ENCABEZADO */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
            LinguaGo
          </p>

          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Hola, {firstName}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Continúa aprendiendo y mantén tu progreso
            en movimiento.
          </p>
        </div>

        <Link
          href="/dashboard/courses"
          className="inline-flex w-fit items-center justify-center rounded-2xl bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Ver todos los cursos →
        </Link>
      </section>

      {/* CONTINUAR APRENDIENDO */}
      {course && (
        <section className="mt-8 overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-white/5 to-emerald-400/5">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

          <div className="grid gap-7 p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  {course.level}
                </span>

                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                  Continuar aprendiendo
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-black text-white">
                {course.title}
              </h2>

              {nextLesson && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Próxima lección
                  </p>

                  <p className="mt-1 font-bold text-slate-200">
                    {nextLesson.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {nextLesson.unitTitle} ·{" "}
                    {nextLesson.estimatedMinutes} min
                  </p>
                </div>
              )}

              <div className="mt-6 max-w-xl">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-400">
                    Progreso del curso
                  </span>

                  <span className="font-bold text-cyan-300">
                    {courseProgress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{
                      width: `${courseProgress}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {completedLessons} de {lessons.length}{" "}
                  lecciones completadas
                </p>
              </div>
            </div>

            {nextLesson ? (
              <Link
                href={`/dashboard/courses/${course.slug}/lessons/${nextLesson.id}`}
                className="inline-flex min-w-44 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5"
              >
                {courseProgress > 0
                  ? "Continuar →"
                  : "Comenzar →"}
              </Link>
            ) : (
              <Link
                href={`/dashboard/courses/${course.slug}`}
                className="inline-flex min-w-44 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 font-bold text-white"
              >
                Ver curso →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ESTADÍSTICAS */}
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          value={totalVocabulary}
          label="Palabras guardadas"
          detail="Tu vocabulario total"
          symbol="Aa"
        />

        <DashboardStat
          value={learnedVocabulary}
          label="Aprendidas"
          detail="Palabras dominadas"
          symbol="✓"
        />

        <DashboardStat
          value={pendingVocabulary}
          label="Por practicar"
          detail="Disponibles en flashcards"
          symbol="▣"
        />

        <DashboardStat
          value={favoriteVocabulary}
          label="Favoritas"
          detail="Palabras destacadas"
          symbol="★"
        />
      </section>

      {/* CONTENIDO INFERIOR */}
      <section className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* ACCESOS RÁPIDOS */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Accesos rápidos
            </p>

            <h2 className="mt-2 text-xl font-black text-white">
              ¿Qué quieres hacer?
            </h2>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <QuickAction
              href="/dashboard/courses"
              symbol="▤"
              title="Cursos"
              description="Continuar aprendiendo"
            />

            <QuickAction
              href="/dashboard/vocabulary"
              symbol="Aa"
              title="Vocabulario"
              description="Guardar nuevas palabras"
            />

            <QuickAction
              href="/dashboard/flashcards"
              symbol="▣"
              title="Flashcards"
              description="Practicar vocabulario"
            />
          </div>
        </div>

        {/* VOCABULARIO RECIENTE */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Vocabulario
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                Palabras recientes
              </h2>
            </div>

            <Link
              href="/dashboard/vocabulary"
              className="text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              Ver todo
            </Link>
          </div>

          {recentVocabulary.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center">
              <p className="text-sm text-slate-500">
                Todavía no has agregado palabras.
              </p>

              <Link
                href="/dashboard/vocabulary"
                className="mt-3 inline-block text-sm font-bold text-cyan-400"
              >
                Agregar mi primera palabra →
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {recentVocabulary.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">
                      {entry.word}
                    </p>

                    {entry.alternativeTranslation && (
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        También:{" "}
                        {entry.alternativeTranslation}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-teal-300">
                    {entry.translation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

type DashboardStatProps = {
  value: number;
  label: string;
  detail: string;
  symbol: string;
};

function DashboardStat({
  value,
  label,
  detail,
  symbol,
}: DashboardStatProps) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-black text-white">
            {value}
          </p>

          <p className="mt-1 font-bold text-slate-300">
            {label}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {detail}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 font-black text-cyan-300">
          {symbol}
        </div>
      </div>
    </article>
  );
}

type QuickActionProps = {
  href: string;
  symbol: string;
  title: string;
  description: string;
};

function QuickAction({
  href,
  symbol,
  title,
  description,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-cyan-400/5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 font-black text-cyan-300">
        {symbol}
      </div>

      <p className="mt-4 font-bold text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <p className="mt-3 text-xs font-bold text-cyan-400 opacity-0 transition group-hover:opacity-100">
        Abrir →
      </p>
    </Link>
  );
}