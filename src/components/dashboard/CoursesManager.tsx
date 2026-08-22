"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string;
  sourceLanguage: string;
  targetLanguage: string;
  totalUnits: number;
  totalLessons: number;
  completedLessons: number;
  progress: number;
};

const languageLabels: Record<string, string> = {
  en: "Inglés",
  es: "Español",
  fr: "Francés",
  pt: "Portugués",
};

export default function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch("/api/courses", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "No fue posible cargar los cursos.");

          return;
        }

        setCourses(result as Course[]);
      } catch {
        setError("No fue posible conectar con el servidor.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        Cargando cursos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-400/20 bg-red-400/10 p-6 text-red-300">
        {error}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/15 p-12 text-center">
        <p className="text-xl font-black">Todavía no hay cursos disponibles</p>

        <p className="mt-2 text-slate-500">
          Los nuevos cursos aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {courses.map((course) => (
        <article
          key={course.id}
          className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-cyan-400/20"
        >
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

          <div className="p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    {course.level}
                  </span>

                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    {languageLabels[course.targetLanguage] ??
                      course.targetLanguage}
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-black text-white">
                  {course.title}
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  {course.description}
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-2xl font-black text-cyan-300">
                EN
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-2xl font-black text-white">
                  {course.totalUnits}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Unidades
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-2xl font-black text-white">
                  {course.totalLessons}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Lecciones
                </p>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-400">Progreso</p>

                <p className="text-sm font-bold text-cyan-300">
                  {course.progress}%
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                  style={{
                    width: `${course.progress}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {course.completedLessons} de {course.totalLessons} lecciones
                completadas
              </p>
            </div>

            <Link
              href={`/dashboard/courses/${course.slug}`}
              className="mt-7 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5"
            >
              {course.progress > 0 ? "Continuar curso →" : "Comenzar curso →"}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
