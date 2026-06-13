import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetail } from "@/components/sections/course-detail";
import { EVENTS, findEvent } from "@/lib/events-data";

/** Pre-render every course detail page at build time. */
export function generateStaticParams(): Array<{ slug: string }> {
  return EVENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = findEvent(slug);
  if (!course) return { title: "Course not found" };

  const canonical = `/courses/${course.slug}`;
  return {
    title: course.title,
    description: course.summary,
    alternates: { canonical },
    openGraph: {
      title: `${course.title} · California Dental Meeting`,
      description: course.summary,
      url: canonical,
      images: course.flyerImage ? [{ url: course.flyerImage }] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  const course = findEvent(slug);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
