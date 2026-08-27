"use client";
import { Volume2 } from "lucide-react";
import { speakText } from "@/lib/speech";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

type ExerciseType =
  | "MULTIPLE_CHOICE"
  | "FILL_BLANK"
  | "ORDER_WORDS"
  | "LISTENING_CHOICE"
  | "TRANSLATION";

type ExerciseOption = {
  id: string;
  text: string;
  order: number;
};

type Exercise = {
  id: string;
  type: ExerciseType;
  instruction: string | null;
  prompt: string;
  audioText: string | null;
  items: unknown;
  options: ExerciseOption[];
};

type LessonContentType = "INTRO" | "VOCABULARY" | "GRAMMAR" | "EXAMPLE" | "TIP";

type LessonContentItem = {
  term?: string;
  translation?: string;
  note?: string;
  example?: string;
};

type LessonContentBlock = {
  id: string;
  type: LessonContentType;
  title: string | null;
  body: string | null;
  order: number;
  items: unknown;
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  estimatedMinutes: number;

  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

  score: number;

  unit: {
    id: string;
    title: string;
  };

  course: {
    id: string;
    slug: string;
    title: string;
    targetLanguage: string;
  };

  contentBlocks: LessonContentBlock[];
  exercises: Exercise[];
};

type AnswerResult = {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string | null;
};

type Props = {
  lessonId: string;
};

export default function LessonPlayer({ lessonId }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");

  const [selectedWordIndexes, setSelectedWordIndexes] = useState<number[]>([]);

  const [result, setResult] = useState<AnswerResult | null>(null);

  const [correctCount, setCorrectCount] = useState(0);

  const [isChecking, setIsChecking] = useState(false);

  const [completed, setCompleted] = useState(false);

  const [finalScore, setFinalScore] = useState(0);

  const [error, setError] = useState("");

  const [phase, setPhase] = useState<"content" | "practice">("content");

  const [contentIndex, setContentIndex] = useState(0);

  const [isStartingPractice, setIsStartingPractice] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "No fue posible cargar la lección.");

          return;
        }

        const loadedLesson = data as Lesson;

        setLesson(loadedLesson);

        if (
          !loadedLesson.contentBlocks ||
          loadedLesson.contentBlocks.length === 0
        ) {
          setPhase("practice");
        }
      } catch {
        setError("No fue posible conectar con el servidor.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  const currentExercise = lesson?.exercises[currentIndex] ?? null;

  const words = useMemo(() => {
    if (
      currentExercise?.type !== "ORDER_WORDS" ||
      !Array.isArray(currentExercise.items)
    ) {
      return [];
    }

    return currentExercise.items.filter(
      (item): item is string => typeof item === "string",
    );
  }, [currentExercise]);

  function resetExercise() {
    setAnswer("");
    setResult(null);
    setSelectedWordIndexes([]);
    setError("");
  }

  function selectWord(index: number) {
    if (result || selectedWordIndexes.includes(index)) {
      return;
    }

    setSelectedWordIndexes((current) => [...current, index]);
  }

  function removeWord(index: number) {
    if (result) {
      return;
    }

    setSelectedWordIndexes((current) =>
      current.filter((selectedIndex) => selectedIndex !== index),
    );
  }

  function getCurrentAnswer() {
    if (currentExercise?.type === "ORDER_WORDS") {
      return selectedWordIndexes.map((index) => words[index]).join(" ");
    }

    return answer.trim();
  }

  function getContentItems(items: unknown): LessonContentItem[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(
      (item): item is LessonContentItem =>
        typeof item === "object" && item !== null,
    );
  }

  function nextContent() {
    if (!lesson) {
      return;
    }

    if (contentIndex < lesson.contentBlocks.length - 1) {
      setContentIndex((current) => current + 1);

      setError("");
    }
  }

  function previousContent() {
    if (contentIndex > 0) {
      setContentIndex((current) => current - 1);

      setError("");
    }
  }

  async function speakContent(text: string) {
    if (!lesson) {
      return;
    }

    try {
      await speakText(text, lesson.course.targetLanguage);
    } catch {
      setError("No fue posible reproducir la pronunciación.");
    }
  }

  async function beginPractice() {
    if (!lesson) {
      return;
    }

    setError("");
    setIsStartingPractice(true);

    try {
      const response = await fetch(`/api/lessons/${lesson.id}/start`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No fue posible iniciar la práctica.");

        return;
      }

      setCurrentIndex(0);
      setCorrectCount(0);
      setCompleted(false);
      setFinalScore(0);

      resetExercise();

      setPhase("practice");
    } catch {
      setError("No fue posible iniciar la práctica.");
    } finally {
      setIsStartingPractice(false);
    }
  }

  async function checkAnswer() {
    if (!currentExercise) {
      return;
    }

    const submittedAnswer = getCurrentAnswer();

    if (!submittedAnswer) {
      setError("Debes responder antes de continuar.");

      return;
    }

    setError("");
    setIsChecking(true);

    try {
      const response = await fetch(
        `/api/exercises/${currentExercise.id}/answer`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            answer: submittedAnswer,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No fue posible comprobar la respuesta.");

        return;
      }

      const answerResult = data as AnswerResult;

      setResult(answerResult);

      if (answerResult.isCorrect) {
        setCorrectCount((current) => current + 1);
      }
    } catch {
      setError("No fue posible comprobar la respuesta.");
    } finally {
      setIsChecking(false);
    }
  }

  function nextExercise() {
    if (!lesson) {
      return;
    }

    if (currentIndex < lesson.exercises.length - 1) {
      setCurrentIndex((current) => current + 1);

      resetExercise();
    }
  }

  async function finishLesson() {
    if (!lesson) {
      return;
    }

    const score =
      lesson.exercises.length === 0
        ? 0
        : Math.round((correctCount / lesson.exercises.length) * 100);

    setError("");

    try {
      const response = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          score,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No fue posible terminar la lección.");

        return;
      }

      setFinalScore(score);
      setCompleted(true);
    } catch {
      setError("No fue posible terminar la lección.");
    }
  }

  async function playAudio() {
    if (!lesson || !currentExercise?.audioText) {
      return;
    }

    try {
      await speakText(currentExercise.audioText, lesson.course.targetLanguage);
    } catch {
      setError("No fue posible reproducir el audio.");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        Cargando lección...
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="rounded-[2rem] border border-red-400/20 bg-red-400/10 p-6 text-red-300">
        {error}
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  /*
   * ==========================================
   * FASE 1: CONTENIDO / ENSEÑANZA
   * ==========================================
   */
  if (phase === "content" && lesson.contentBlocks.length > 0) {
    const block = lesson.contentBlocks[contentIndex];

    const contentItems = getContentItems(block.items);

    const isLastContent = contentIndex === lesson.contentBlocks.length - 1;

    const contentProgress = Math.round(
      ((contentIndex + 1) / lesson.contentBlocks.length) * 100,
    );

    const contentTypeLabels: Record<LessonContentType, string> = {
      INTRO: "Introducción",
      VOCABULARY: "Vocabulario",
      GRAMMAR: "Gramática",
      EXAMPLE: "En contexto",
      TIP: "Consejo",
    };

    return (
      <main className="mx-auto max-w-4xl">
        <Link
          href={`/dashboard/courses/${lesson.course.slug}`}
          className="text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
        >
          ← Volver al curso
        </Link>

        <div className="mt-7 flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {lesson.unit.title}
            </p>

            <h1 className="mt-1 text-2xl font-black text-white">
              {lesson.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Aproximadamente {lesson.estimatedMinutes} minutos
            </p>
          </div>

          <button
            type="button"
            onClick={beginPractice}
            disabled={isStartingPractice}
            className="shrink-0 text-sm font-bold text-slate-500 transition hover:text-cyan-300 disabled:opacity-50"
          >
            Saltar a práctica
          </button>
        </div>

        {/* PROGRESO */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Preparación
            </span>

            <span className="text-xs font-bold text-cyan-300">
              {contentIndex + 1} / {lesson.contentBlocks.length}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
              style={{
                width: `${contentProgress}%`,
              }}
            />
          </div>
        </div>

        {/* CONTENIDO */}
        <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-7 sm:p-10">
          <span className="inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.13em] text-cyan-300">
            {contentTypeLabels[block.type]}
          </span>

          {block.title && (
            <h2 className="mt-5 text-3xl font-black leading-tight text-white">
              {block.title}
            </h2>
          )}

          {block.body && (
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-400">
              {block.body}
            </p>
          )}

          {contentItems.length > 0 && (
            <div className="mt-8 space-y-4">
              {contentItems.map((item, index) => (
                <article
                  key={`${item.term ?? "item"}-${index}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 p-5"
                >
                  {item.term && (
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-white">
                          {item.term}
                        </p>

                        {item.translation && (
                          <p className="mt-1 font-semibold text-cyan-300">
                            {item.translation}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => speakContent(item.term!)}
                        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400/20"
                        aria-label={`Escuchar ${item.term}`}
                        title="Escuchar pronunciación"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {item.note && (
                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      {item.note}
                    </p>
                  )}

                  {item.example && (
                    <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-400">
                        Ejemplo
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-200">
                          {item.example}
                        </p>

                        <button
                          type="button"
                          onClick={() => speakContent(item.example!)}
                          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-emerald-300 transition hover:bg-emerald-400/10 hover:text-emerald-200"
                          aria-label={`Escuchar ejemplo ${item.example}`}
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-9 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={previousContent}
              disabled={contentIndex === 0}
              className="rounded-2xl bg-white/5 px-5 py-3 font-bold text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Anterior
            </button>

            {isLastContent ? (
              <button
                type="button"
                onClick={beginPractice}
                disabled={isStartingPractice}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isStartingPractice ? "Preparando..." : "Comenzar práctica →"}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextContent}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5"
              >
                Siguiente →
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  /*
   * ==========================================
   * RESULTADO FINAL
   * ==========================================
   */
  if (completed) {
    const passed = finalScore >= 70;

    return (
      <main className="mx-auto max-w-3xl">
        <section
          className={`rounded-[2.5rem] border p-10 text-center ${
            passed
              ? "border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5"
              : "border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-orange-400/5"
          }`}
        >
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
              passed
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {passed ? "✓" : "↻"}
          </div>

          <p
            className={`mt-7 text-sm font-bold uppercase tracking-[0.2em] ${
              passed ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            Lección completada
          </p>

          <h1 className="mt-3 text-4xl font-black text-white">
            {lesson.title}
          </h1>

          <p className="mt-8 text-sm text-slate-400">Tu puntuación</p>

          <p className="mt-2 text-6xl font-black text-cyan-300">
            {finalScore}%
          </p>

          <p className="mt-5 text-slate-400">
            {correctCount} de {lesson.exercises.length} respuestas correctas
          </p>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
            {passed
              ? "Buen trabajo. Has completado esta lección."
              : "Puedes repetir la lección para reforzar los conceptos y mejorar tu resultado."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/dashboard/courses/${lesson.course.slug}`}
              className="inline-flex rounded-2xl bg-white/5 px-6 py-3.5 font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              ← Volver al curso
            </Link>

            <button
              type="button"
              onClick={() => {
                setCompleted(false);
                setFinalScore(0);
                setCorrectCount(0);
                setCurrentIndex(0);
                setContentIndex(0);
                resetExercise();
                setPhase(
                  lesson.contentBlocks.length > 0 ? "content" : "practice",
                );
              }}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5"
            >
              Repetir lección ↻
            </button>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ==========================================
   * FASE 2: PRÁCTICA
   * ==========================================
   */
  if (!currentExercise) {
    return (
      <main className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-slate-400">
            Esta lección todavía no tiene ejercicios.
          </p>

          <Link
            href={`/dashboard/courses/${lesson.course.slug}`}
            className="mt-5 inline-flex text-sm font-bold text-cyan-400 hover:text-cyan-300"
          >
            ← Volver al curso
          </Link>
        </div>
      </main>
    );
  }

  const percentage = Math.round(
    ((currentIndex + 1) / lesson.exercises.length) * 100,
  );

  const isLast = currentIndex === lesson.exercises.length - 1;

  return (
    <main className="mx-auto max-w-4xl">
      <Link
        href={`/dashboard/courses/${lesson.course.slug}`}
        className="text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
      >
        ← Volver al curso
      </Link>

      <div className="mt-7 flex items-center justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {lesson.unit.title}
          </p>

          <h1 className="mt-1 text-2xl font-black text-white">
            {lesson.title}
          </h1>

          <p className="mt-2 text-xs font-bold uppercase tracking-[0.13em] text-emerald-400">
            Práctica
          </p>
        </div>

        <p className="shrink-0 text-sm font-bold text-cyan-300">
          {currentIndex + 1} / {lesson.exercises.length}
        </p>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-7 sm:p-10">
        {currentExercise.instruction && (
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-cyan-400">
            {currentExercise.instruction}
          </p>
        )}

        <h2 className="mt-5 whitespace-pre-line text-2xl font-black leading-relaxed text-white sm:text-3xl">
          {currentExercise.prompt}
        </h2>

        {/* LISTENING */}
        {currentExercise.type === "LISTENING_CHOICE" && (
          <button
            type="button"
            onClick={playAudio}
            className="mt-7 inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-cyan-400/10 px-6 py-4 font-bold text-cyan-300 transition hover:bg-cyan-400/20"
          >
            <Volume2 className="h-5 w-5" />
            Escuchar audio
          </button>
        )}

        {/* OPCIÓN MÚLTIPLE */}
        {(currentExercise.type === "MULTIPLE_CHOICE" ||
          currentExercise.type === "LISTENING_CHOICE") && (
          <div className="mt-8 grid gap-3">
            {currentExercise.options.map((option, index) => (
              <button
                key={option.id}
                type="button"
                disabled={Boolean(result)}
                onClick={() => {
                  setAnswer(option.id);

                  setError("");
                }}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left font-semibold transition ${
                  answer === option.id
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 bg-slate-950/50 text-slate-300 hover:border-white/20 hover:bg-white/5"
                } disabled:cursor-default`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                    answer === option.id
                      ? "bg-cyan-400/15 text-cyan-300"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>

                <span>{option.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* RESPUESTAS ESCRITAS */}
        {(currentExercise.type === "FILL_BLANK" ||
          currentExercise.type === "TRANSLATION") && (
          <div className="mt-8">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Tu respuesta
            </label>

            <input
              value={answer}
              disabled={Boolean(result)}
              onChange={(event) => {
                setAnswer(event.target.value);

                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !result && !isChecking) {
                  checkAnswer();
                }
              }}
              autoFocus
              autoComplete="off"
              placeholder="Escribe tu respuesta..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-5 py-4 text-lg text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 disabled:opacity-70"
            />

            {currentExercise.type === "TRANSLATION" && (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                No necesitas reproducir una traducción literal. Escribe una
                respuesta natural que comunique correctamente la idea.
              </p>
            )}
          </div>
        )}

        {/* ORDENAR PALABRAS */}
        {currentExercise.type === "ORDER_WORDS" && (
          <div className="mt-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Tu oración
            </p>

            <div className="min-h-24 rounded-2xl border border-dashed border-cyan-400/20 bg-cyan-400/5 p-4">
              {selectedWordIndexes.length === 0 ? (
                <p className="py-3 text-center text-sm text-slate-600">
                  Selecciona las palabras en el orden correcto.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedWordIndexes.map((wordIndex) => (
                    <button
                      key={wordIndex}
                      type="button"
                      disabled={Boolean(result)}
                      onClick={() => removeWord(wordIndex)}
                      className="rounded-xl bg-cyan-400/15 px-4 py-2 font-bold text-cyan-200 transition hover:bg-cyan-400/25 disabled:cursor-default"
                    >
                      {words[wordIndex]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-500">
              Palabras disponibles
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {words.map((word, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={
                    selectedWordIndexes.includes(index) || Boolean(result)
                  }
                  onClick={() => {
                    selectWord(index);

                    setError("");
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/10 disabled:cursor-default disabled:opacity-30"
                >
                  {word}
                </button>
              ))}
            </div>

            {!result && selectedWordIndexes.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedWordIndexes([])}
                className="mt-4 text-xs font-bold text-slate-500 transition hover:text-white"
              >
                Limpiar oración
              </button>
            )}
          </div>
        )}

        {/* RESULTADO DEL EJERCICIO */}
        {result && (
          <div
            className={`mt-8 rounded-2xl border p-5 ${
              result.isCorrect
                ? "border-emerald-400/20 bg-emerald-400/10"
                : "border-red-400/20 bg-red-400/10"
            }`}
          >
            <p
              className={`text-lg font-black ${
                result.isCorrect ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {result.isCorrect ? "✓ ¡Correcto!" : "✕ Respuesta incorrecta"}
            </p>

            {!result.isCorrect && (
              <div className="mt-4 rounded-xl bg-slate-950/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Una respuesta correcta
                </p>

                <p className="mt-2 font-bold text-white">
                  {result.correctAnswer}
                </p>
              </div>
            )}

            {result.explanation && (
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {result.explanation}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="mt-5 rounded-xl border border-red-400/10 bg-red-400/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* BOTONES */}
        <div className="mt-8 flex justify-end">
          {!result ? (
            <button
              type="button"
              disabled={isChecking}
              onClick={checkAnswer}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isChecking ? "Comprobando..." : "Comprobar"}
            </button>
          ) : isLast ? (
            <button
              type="button"
              onClick={finishLesson}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5"
            >
              Finalizar lección ✓
            </button>
          ) : (
            <button
              type="button"
              onClick={nextExercise}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5"
            >
              Siguiente →
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
