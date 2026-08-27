import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?¿¡;:'"“”‘’()]/g, "")
    .replace(/\s+/g, " ");
}

function getAcceptedAnswers(
  correctAnswer: string | null,
  acceptedAnswers: unknown,
) {
  const answers: string[] = [];

  if (correctAnswer) {
    answers.push(correctAnswer);
  }

  if (Array.isArray(acceptedAnswers)) {
    for (const answer of acceptedAnswers) {
      if (typeof answer === "string") {
        answers.push(answer);
      }
    }
  }

  return Array.from(
    new Set(
      answers
        .map((answer) => answer.trim())
        .filter(Boolean),
    ),
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("answer" in body) ||
      typeof body.answer !== "string"
    ) {
      return NextResponse.json(
        {
          error: "La respuesta no es válida.",
        },
        { status: 400 },
      );
    }

    const answer = body.answer.trim();

    if (!answer) {
      return NextResponse.json(
        {
          error: "Debes responder el ejercicio.",
        },
        { status: 400 },
      );
    }

    const exercise = await prisma.exercise.findUnique({
      where: {
        id,
      },

      include: {
        options: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        {
          error: "Ejercicio no encontrado.",
        },
        { status: 404 },
      );
    }

    let isCorrect = false;

    let correctAnswer =
      exercise.correctAnswer ?? "";

    if (
      exercise.type === "MULTIPLE_CHOICE" ||
      exercise.type === "LISTENING_CHOICE"
    ) {
      const selectedOption =
        exercise.options.find(
          (option) =>
            option.id === answer,
        );

      isCorrect =
        selectedOption?.isCorrect ?? false;

      const correctOption =
        exercise.options.find(
          (option) =>
            option.isCorrect,
        );

      if (correctOption) {
        correctAnswer =
          correctOption.text;
      }
    } else {
      const acceptedAnswers =
        getAcceptedAnswers(
          exercise.correctAnswer,
          exercise.acceptedAnswers,
        );

      const normalizedUserAnswer =
        normalizeAnswer(answer);

      isCorrect =
        acceptedAnswers.some(
          (acceptedAnswer) =>
            normalizeAnswer(
              acceptedAnswer,
            ) ===
            normalizedUserAnswer,
        );
    }

    await prisma.exerciseAttempt.create({
      data: {
        userId:
          session.user.id,

        exerciseId:
          exercise.id,

        answer: {
          value: answer,
        },

        isCorrect,
      },
    });

    return NextResponse.json({
      isCorrect,
      correctAnswer,
      explanation:
        exercise.explanation,
    });
  } catch (error) {
    console.error(
      "Error calificando ejercicio:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No fue posible calificar la respuesta.",
      },
      { status: 500 },
    );
  }
}