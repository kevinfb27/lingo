"use client";

import Link from "next/link";
import { Lock, Check, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  estimatedMinutes: number;
  exerciseCount: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  score: number;
};

type CourseUnit = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
};

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
  units: CourseUnit[];
};

type Props = {
  slug: string;
};

export default function CourseDetailManager({ slug }: Props) {
  const [course, setCourse] = useState<Course | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(`/api/courses/${slug}`, {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "No fue posible cargar el curso.");

          return;
        }

        setCourse(result as Course);
      } catch {
        setError("No fue posible conectar con el servidor.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourse();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        Cargando curso...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div>
        <div className="rounded-[2rem] border border-red-400/20 bg-red-400/10 p-6 text-red-300">
          {error || "Curso no encontrado."}
        </div>

        <Link
          href="/dashboard/courses"
          className="mt-5 inline-block text-sm font-bold text-cyan-400"
        >
          ← Volver a Cursos
        </Link>
      </div>
    );
  }

  /*
   * =====================================
   * TODAS LAS LECCIONES DEL CURSO
   * =====================================
   */

  const lessons = course.units.flatMap((unit) => unit.lessons);

  /*
   * =====================================
   * PROGRESO GENERAL
   * =====================================
   */

  const completed = lessons.filter(
    (lesson) => lesson.status === "COMPLETED",
  ).length;

  const progress =
    lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);

  /*
   * =====================================
   * DESBLOQUEO DE LECCIONES
   * =====================================
   *
   * - La primera siempre está disponible.
   * - Las demás requieren haber
   *   completado la anterior.
   */

  function isLessonUnlocked(lessonId: string) {
    const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

    if (lessonIndex <= 0) {
      return true;
    }

    const previousLesson = lessons[lessonIndex - 1];

    return previousLesson.status === "COMPLETED";
  }

  /*
   * =====================================
   * IDIOMA
   * =====================================
   */

  function getLanguageLabel(language: string) {
    const labels: Record<string, string> = {
      en: "Inglés",
      es: "Español",
      fr: "Francés",
      pt: "Portugués",
    };

    return labels[language] ?? language.toUpperCase();
  }

  return (
    <main>
      <Link
        href="/dashboard/courses"
        className="text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
      >
        ← Volver a Cursos
      </Link>

      {/* =====================================
          ENCABEZADO DEL CURSO
      ====================================== */}

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              {course.level}
            </span>

            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
              {getLanguageLabel(course.targetLanguage)}
            </span>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
              {lessons.length} {lessons.length === 1 ? "lección" : "lecciones"}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black text-white sm:text-4xl">
            {course.title}
          </h1>

          {course.description && (
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              {course.description}
            </p>
          )}

          {/* PROGRESO */}

          <div className="mt-7 max-w-xl">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-slate-400">
                Progreso general
              </span>

              <span className="font-bold text-cyan-300">{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {completed} de {lessons.length} lecciones completadas
            </p>
          </div>
        </div>
      </section>

      {/* =====================================
          UNIDADES
      ====================================== */}

      <div className="mt-8 space-y-6">
        {course.units.map((unit, unitIndex) => (
          <section
            key={unit.id}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
          >
            {/* ENCABEZADO DE UNIDAD */}

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 font-black text-emerald-300">
                {unitIndex + 1}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Unidad {unitIndex + 1}
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  {unit.title}
                </h2>

                {unit.description && (
                  <p className="mt-2 text-slate-400">{unit.description}</p>
                )}
              </div>
            </div>

            {/* LECCIONES */}

            <div className="mt-6 space-y-3">
              {unit.lessons.map((lesson, lessonIndex) => {
                const unlocked = isLessonUnlocked(lesson.id);

                const completedLesson = lesson.status === "COMPLETED";

                const inProgress = lesson.status === "IN_PROGRESS";

                return (
                  <article
                    key={lesson.id}
                    className={`flex flex-col gap-4 rounded-2xl border p-5 transition sm:flex-row sm:items-center ${
                      unlocked
                        ? "border-white/10 bg-slate-950/50"
                        : "border-white/5 bg-slate-950/30 opacity-70"
                    }`}
                  >
                    {/* NÚMERO / ESTADO */}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black ${
                        completedLesson
                          ? "bg-emerald-400/10 text-emerald-300"
                          : unlocked
                            ? "bg-white/5 text-slate-300"
                            : "bg-white/[0.03] text-slate-600"
                      }`}
                    >
                      {completedLesson ? (
                        <Check className="h-5 w-5" />
                      ) : unlocked ? (
                        lessonIndex + 1
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>

                    {/* INFORMACIÓN */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-bold ${
                            unlocked ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {lesson.title}
                        </h3>

                        {completedLesson && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
                            <Check className="h-3.5 w-3.5" />
                            Completada
                          </span>
                        )}

                        {inProgress && unlocked && (
                          <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
                            En progreso
                          </span>
                        )}

                        {!unlocked && (
                          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-600">
                            Bloqueada
                          </span>
                        )}
                      </div>

                      {lesson.description && (
                        <p
                          className={`mt-1 text-sm ${
                            unlocked ? "text-slate-500" : "text-slate-700"
                          }`}
                        >
                          {lesson.description}
                        </p>
                      )}

                      <div
                        className={`mt-3 flex flex-wrap gap-4 text-xs font-semibold ${
                          unlocked ? "text-slate-500" : "text-slate-700"
                        }`}
                      >
                        <span>⏱ {lesson.estimatedMinutes} min</span>

                        <span>{lesson.exerciseCount} ejercicios</span>

                        {completedLesson && (
                          <span className="text-emerald-400">
                            Puntuación: {lesson.score}%
                          </span>
                        )}
                      </div>

                      {!unlocked && (
                        <p className="mt-3 text-xs leading-5 text-slate-600">
                          Completa la lección anterior para desbloquear esta
                          lección.
                        </p>
                      )}
                    </div>

                    {/* BOTÓN */}

                    <div className="shrink-0">
                      {unlocked ? (
                        <Link
                          href={`/dashboard/courses/${course.slug}/lessons/${lesson.id}`}
                          className="inline-flex min-w-28 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                        >
                          {completedLesson ? (
                            <>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Repetir
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              {inProgress ? "Continuar" : "Comenzar"}
                            </>
                          )}
                        </Link>
                      ) : (
                        <span className="inline-flex min-w-28 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-600">
                          <Lock className="h-4 w-4" />
                          Bloqueada
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
