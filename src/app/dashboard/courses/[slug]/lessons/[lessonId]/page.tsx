import LessonPlayer from "@/components/dashboard/LessonPlayer";

type LessonPageProps = {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;

  return <LessonPlayer lessonId={lessonId} />;
}
