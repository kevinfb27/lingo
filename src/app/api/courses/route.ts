import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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

  try {
    const courses = await prisma.course.findMany({
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
    });

    const formattedCourses = courses.map((course) => {
      const lessons = course.units.flatMap(
        (unit) => unit.lessons,
      );

      const totalLessons = lessons.length;

      const completedLessons = lessons.filter(
        (lesson) =>
          lesson.progress[0]?.status === "COMPLETED",
      ).length;

      const progress =
        totalLessons === 0
          ? 0
          : Math.round(
              (completedLessons / totalLessons) * 100,
            );

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        sourceLanguage: course.sourceLanguage,
        targetLanguage: course.targetLanguage,
        totalUnits: course.units.length,
        totalLessons,
        completedLessons,
        progress,
      };
    });

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error(
      "Error cargando cursos:",
      error,
    );

    return NextResponse.json(
      {
        error: "No fue posible cargar los cursos.",
      },
      {
        status: 500,
      },
    );
  }
}