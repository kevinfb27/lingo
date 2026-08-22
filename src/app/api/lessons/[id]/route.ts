import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
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
    const lesson = await prisma.lesson.findUnique({
      where: {
        id,
      },

      include: {
        unit: {
          include: {
            course: true,
          },
        },

        exercises: {
          orderBy: {
            order: "asc",
          },

          include: {
            options: {
              orderBy: {
                order: "asc",
              },

              select: {
                id: true,
                text: true,
                order: true,
              },
            },
          },
        },

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
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lección no encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      estimatedMinutes: lesson.estimatedMinutes,

      status:
        lesson.progress[0]?.status ??
        "NOT_STARTED",

      score:
        lesson.progress[0]?.score ?? 0,

      unit: {
        id: lesson.unit.id,
        title: lesson.unit.title,
      },

      course: {
        id: lesson.unit.course.id,
        slug: lesson.unit.course.slug,
        title: lesson.unit.course.title,
        targetLanguage:
          lesson.unit.course.targetLanguage,
      },

      exercises: lesson.exercises.map(
        (exercise) => ({
          id: exercise.id,
          type: exercise.type,
          instruction: exercise.instruction,
          prompt: exercise.prompt,
          audioText: exercise.audioText,
          items: exercise.items,
          options: exercise.options,
        }),
      ),
    });
  } catch (error) {
    console.error(
      "Error cargando lección:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No fue posible cargar la lección.",
      },
      { status: 500 },
    );
  }
}