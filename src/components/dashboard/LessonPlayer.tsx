"use client";

import { speakText } from "@/lib/speech";
import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  estimatedMinutes: number;

  status:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "COMPLETED";

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

export default function LessonPlayer({
  lessonId,
}: Props) {
  const [
    lesson,
    setLesson,
  ] = useState<Lesson | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    answer,
    setAnswer,
  ] = useState("");

  const [
    selectedWordIndexes,
    setSelectedWordIndexes,
  ] = useState<number[]>([]);

  const [
    result,
    setResult,
  ] = useState<AnswerResult | null>(
    null,
  );

  const [
    correctCount,
    setCorrectCount,
  ] = useState(0);

  const [
    isChecking,
    setIsChecking,
  ] = useState(false);

  const [
    completed,
    setCompleted,
  ] = useState(false);

  const [
    finalScore,
    setFinalScore,
  ] = useState(0);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    async function loadLesson() {
      try {
        const response =
          await fetch(
            `/api/lessons/${lessonId}`,
            {
              cache:
                "no-store",
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.error ??
              "No fue posible cargar la lección.",
          );

          return;
        }

        setLesson(
          data as Lesson,
        );
      } catch {
        setError(
          "No fue posible conectar con el servidor.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  const currentExercise =
    lesson?.exercises[
      currentIndex
    ] ?? null;

  const words = useMemo(() => {
    if (
      currentExercise?.type !==
        "ORDER_WORDS" ||
      !Array.isArray(
        currentExercise.items,
      )
    ) {
      return [];
    }

    return currentExercise.items.filter(
      (
        item,
      ): item is string =>
        typeof item ===
        "string",
    );
  }, [currentExercise]);

  function resetExercise() {
    setAnswer("");
    setResult(null);
    setSelectedWordIndexes([]);
  }

  function selectWord(
    index: number,
  ) {
    if (
      result ||
      selectedWordIndexes.includes(
        index,
      )
    ) {
      return;
    }

    setSelectedWordIndexes(
      (current) => [
        ...current,
        index,
      ],
    );
  }

  function removeWord(
    index: number,
  ) {
    if (result) {
      return;
    }

    setSelectedWordIndexes(
      (current) =>
        current.filter(
          (
            selectedIndex,
          ) =>
            selectedIndex !==
            index,
        ),
    );
  }

  function getCurrentAnswer() {
    if (
      currentExercise?.type ===
      "ORDER_WORDS"
    ) {
      return selectedWordIndexes
        .map(
          (index) =>
            words[index],
        )
        .join(" ");
    }

    return answer.trim();
  }

  async function checkAnswer() {
    if (!currentExercise) {
      return;
    }

    const submittedAnswer =
      getCurrentAnswer();

    if (!submittedAnswer) {
      setError(
        "Debes responder antes de continuar.",
      );

      return;
    }

    setError("");
    setIsChecking(true);

    try {
      const response =
        await fetch(
          `/api/exercises/${currentExercise.id}/answer`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              answer:
                submittedAnswer,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "No fue posible comprobar la respuesta.",
        );

        return;
      }

      const answerResult =
        data as AnswerResult;

      setResult(answerResult);

      if (
        answerResult.isCorrect
      ) {
        setCorrectCount(
          (current) =>
            current + 1,
        );
      }
    } catch {
      setError(
        "No fue posible comprobar la respuesta.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  function nextExercise() {
    if (!lesson) {
      return;
    }

    if (
      currentIndex <
      lesson.exercises.length - 1
    ) {
      setCurrentIndex(
        (current) =>
          current + 1,
      );

      resetExercise();
    }
  }

  async function finishLesson() {
    if (!lesson) {
      return;
    }

    const score =
      lesson.exercises.length ===
      0
        ? 0
        : Math.round(
            (correctCount /
              lesson.exercises
                .length) *
              100,
          );

    try {
      const response =
        await fetch(
          `/api/lessons/${lesson.id}/complete`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              score,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "No fue posible terminar la lección.",
        );

        return;
      }

      setFinalScore(score);
      setCompleted(true);
    } catch {
      setError(
        "No fue posible terminar la lección.",
      );
    }
  }

  async function playAudio() {
    if (
      !lesson ||
      !currentExercise
        ?.audioText
    ) {
      return;
    }

    try {
      await speakText(
        currentExercise.audioText,
        lesson.course
          .targetLanguage,
      );
    } catch {
      setError(
        "No fue posible reproducir el audio.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        Cargando lección...
      </div>
    );
  }

  if (
    error &&
    !lesson
  ) {
    return (
      <div className="rounded-[2rem] border border-red-400/20 bg-red-400/10 p-6 text-red-300">
        {error}
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  if (completed) {
    return (
      <main className="mx-auto max-w-3xl">
        <section className="rounded-[2.5rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-4xl text-emerald-300">
            ✓
          </div>

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            Lección completada
          </p>

          <h1 className="mt-3 text-4xl font-black">
            {lesson.title}
          </h1>

          <p className="mt-8 text-sm text-slate-400">
            Tu puntuación
          </p>

          <p className="mt-2 text-6xl font-black text-cyan-300">
            {finalScore}%
          </p>

          <p className="mt-5 text-slate-400">
            {correctCount} de{" "}
            {lesson.exercises.length}{" "}
            respuestas correctas
          </p>

          <Link
            href={`/dashboard/courses/${lesson.course.slug}`}
            className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white"
          >
            Volver al curso →
          </Link>
        </section>
      </main>
    );
  }

  if (!currentExercise) {
    return (
      <p>
        Esta lección todavía no
        tiene ejercicios.
      </p>
    );
  }

  const percentage =
    Math.round(
      ((currentIndex + 1) /
        lesson.exercises.length) *
        100,
    );

  const isLast =
    currentIndex ===
    lesson.exercises.length - 1;

  return (
    <main className="mx-auto max-w-4xl">
      <Link
        href={`/dashboard/courses/${lesson.course.slug}`}
        className="text-sm font-bold text-cyan-400 hover:text-cyan-300"
      >
        ← Volver al curso
      </Link>

      <div className="mt-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {lesson.unit.title}
          </p>

          <h1 className="mt-1 text-2xl font-black">
            {lesson.title}
          </h1>
        </div>

        <p className="text-sm font-bold text-cyan-300">
          {currentIndex + 1} /{" "}
          {lesson.exercises.length}
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

        <h2 className="mt-5 text-2xl font-black leading-relaxed sm:text-3xl">
          {currentExercise.prompt}
        </h2>

        {currentExercise.type ===
          "LISTENING_CHOICE" && (
          <button
            type="button"
            onClick={playAudio}
            className="mt-7 rounded-2xl bg-cyan-400/10 px-6 py-4 font-bold text-cyan-300 transition hover:bg-cyan-400/20"
          >
            🔊 Escuchar audio
          </button>
        )}

        {(currentExercise.type ===
          "MULTIPLE_CHOICE" ||
          currentExercise.type ===
            "LISTENING_CHOICE") && (
          <div className="mt-8 grid gap-3">
            {currentExercise.options.map(
              (option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={
                    Boolean(result)
                  }
                  onClick={() =>
                    setAnswer(
                      option.id,
                    )
                  }
                  className={`rounded-2xl border p-4 text-left font-semibold transition ${
                    answer === option.id
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                      : "border-white/10 bg-slate-950/50 text-slate-300 hover:border-white/20"
                  }`}
                >
                  {option.text}
                </button>
              ),
            )}
          </div>
        )}

        {(currentExercise.type ===
          "FILL_BLANK" ||
          currentExercise.type ===
            "TRANSLATION") && (
          <input
            value={answer}
            disabled={Boolean(result)}
            onChange={(event) =>
              setAnswer(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                !result
              ) {
                checkAnswer();
              }
            }}
            autoFocus
            placeholder="Escribe tu respuesta..."
            className="mt-8 w-full rounded-2xl border border-white/10 bg-slate-950 px-5 py-4 text-lg text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />
        )}

        {currentExercise.type ===
          "ORDER_WORDS" && (
          <div className="mt-8">
            <div className="min-h-20 rounded-2xl border border-dashed border-cyan-400/20 bg-cyan-400/5 p-4">
              <div className="flex flex-wrap gap-2">
                {selectedWordIndexes.map(
                  (wordIndex) => (
                    <button
                      key={
                        wordIndex
                      }
                      type="button"
                      onClick={() =>
                        removeWord(
                          wordIndex,
                        )
                      }
                      className="rounded-xl bg-cyan-400/15 px-4 py-2 font-bold text-cyan-200"
                    >
                      {
                        words[
                          wordIndex
                        ]
                      }
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {words.map(
                (
                  word,
                  index,
                ) => (
                  <button
                    key={index}
                    type="button"
                    disabled={
                      selectedWordIndexes.includes(
                        index,
                      ) ||
                      Boolean(
                        result,
                      )
                    }
                    onClick={() =>
                      selectWord(
                        index,
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                  >
                    {word}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {result && (
          <div
            className={`mt-8 rounded-2xl border p-5 ${
              result.isCorrect
                ? "border-emerald-400/20 bg-emerald-400/10"
                : "border-red-400/20 bg-red-400/10"
            }`}
          >
            <p
              className={`font-black ${
                result.isCorrect
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {result.isCorrect
                ? "✓ ¡Correcto!"
                : "✕ Respuesta incorrecta"}
            </p>

            {!result.isCorrect && (
              <p className="mt-3 text-sm text-slate-300">
                Respuesta correcta:{" "}
                <span className="font-bold text-white">
                  {
                    result.correctAnswer
                  }
                </span>
              </p>
            )}

            {result.explanation && (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {
                  result.explanation
                }
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="mt-5 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-end">
          {!result ? (
            <button
              type="button"
              disabled={
                isChecking
              }
              onClick={
                checkAnswer
              }
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white disabled:opacity-50"
            >
              {isChecking
                ? "Comprobando..."
                : "Comprobar"}
            </button>
          ) : isLast ? (
            <button
              type="button"
              onClick={
                finishLesson
              }
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white"
            >
              Finalizar lección ✓
            </button>
          ) : (
            <button
              type="button"
              onClick={
                nextExercise
              }
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-bold text-white"
            >
              Siguiente →
            </button>
          )}
        </div>
      </section>
    </main>
  );
}