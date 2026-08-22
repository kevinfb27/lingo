import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    slug: string;
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
      {
        error: "No autorizado.",
      },
      {
        status: 401,
      },
    );
  }

  const { slug } = await context.params;

  try {
    const course = await prisma.course.findUnique({
      where: {
        slug,
        isPublished: true,
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
                exercises: {
                  select: {
                    id: true,
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
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          error: "Curso no encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const formattedCourse = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      level: course.level,
      sourceLanguage: course.sourceLanguage,
      targetLanguage: course.targetLanguage,

      units: course.units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        order: unit.order,

        lessons: unit.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          estimatedMinutes:
            lesson.estimatedMinutes,

          exerciseCount:
            lesson.exercises.length,

          status:
            lesson.progress[0]?.status ??
            "NOT_STARTED",

          score:
            lesson.progress[0]?.score ?? 0,
        })),
      })),
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error(
      "Error cargando curso:",
      error,
    );

    return NextResponse.json(
      {
        error: "No fue posible cargar el curso.",
      },
      {
        status: 500,
      },
    );
  }
}