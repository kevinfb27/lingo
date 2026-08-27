import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

import {
  LessonProgressStatus,
} from "@/generated/prisma/client";

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
      {
        error: "No autorizado.",
      },
      {
        status: 401,
      },
    );
  }

  const { id } = await context.params;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        {
          error: "Lección no encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    const existingProgress =
      await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: id,
          },
        },
      });

    if (!existingProgress) {
      await prisma.lessonProgress.create({
        data: {
          userId: session.user.id,
          lessonId: id,

          status:
            LessonProgressStatus.IN_PROGRESS,

          startedAt: new Date(),
        },
      });
    } else if (
      existingProgress.status ===
      LessonProgressStatus.NOT_STARTED
    ) {
      await prisma.lessonProgress.update({
        where: {
          id: existingProgress.id,
        },

        data: {
          status:
            LessonProgressStatus.IN_PROGRESS,

          startedAt:
            existingProgress.startedAt ??
            new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Error iniciando lección:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No fue posible iniciar la lección.",
      },
      {
        status: 500,
      },
    );
  }
}