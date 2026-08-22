import CourseDetailManager from "@/components/dashboard/CourseDetailManager";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({
  params,
}: CoursePageProps) {
  const { slug } = await params;

  return (
    <CourseDetailManager slug={slug} />
  );
}