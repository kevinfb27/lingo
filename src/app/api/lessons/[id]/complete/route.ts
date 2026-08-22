import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  LessonProgressStatus,
} from "@/generated/prisma/client";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
    const body: unknown =
      await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("score" in body) ||
      typeof body.score !== "number"
    ) {
      return NextResponse.json(
        {
          error:
            "Puntuación no válida.",
        },
        { status: 400 },
      );
    }

    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(body.score),
      ),
    );

    const lesson =
      await prisma.lesson.findUnique({
        where: {
          id,
        },

        select: {
          id: true,

          unit: {
            select: {
              courseId: true,
            },
          },
        },
      });

    if (!lesson) {
      return NextResponse.json(
        {
          error:
            "Lección no encontrada.",
        },
        { status: 404 },
      );
    }

    const now = new Date();

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId:
            session.user.id,

          lessonId:
            lesson.id,
        },
      },

      create: {
        userId:
          session.user.id,

        lessonId:
          lesson.id,

        status:
          LessonProgressStatus.COMPLETED,

        score,

        startedAt: now,
        completedAt: now,
      },

      update: {
        status:
          LessonProgressStatus.COMPLETED,

        score,

        completedAt: now,
      },
    });

    const courseId =
      lesson.unit.courseId;

    const totalLessons =
      await prisma.lesson.count({
        where: {
          unit: {
            courseId,
          },
        },
      });

    const completedLessons =
      await prisma.lessonProgress.count({
        where: {
          userId:
            session.user.id,

          status:
            LessonProgressStatus.COMPLETED,

          lesson: {
            unit: {
              courseId,
            },
          },
        },
      });

    const courseProgress =
      totalLessons === 0
        ? 0
        : Math.round(
            (completedLessons /
              totalLessons) *
              100,
          );

    await prisma.userCourseProgress.upsert({
      where: {
        userId_courseId: {
          userId:
            session.user.id,

          courseId,
        },
      },

      create: {
        userId:
          session.user.id,

        courseId,

        progress:
          courseProgress,

        completedAt:
          courseProgress === 100
            ? now
            : null,
      },

      update: {
        progress:
          courseProgress,

        completedAt:
          courseProgress === 100
            ? now
            : null,
      },
    });

    return NextResponse.json({
      score,
      courseProgress,
      message:
        "Lección completada.",
    });
  } catch (error) {
    console.error(
      "Error completando lección:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No fue posible completar la lección.",
      },
      { status: 500 },
    );
  }
}