import { redirect } from "next/navigation";
import { FLAGSHIP_COURSE } from "@/lib/events-data";

/**
 * Legacy `/flagship` URL — preserved as a redirect to the canonical course
 * detail page so old bookmarks and any external links keep resolving.
 */
export default function FlagshipRedirect(): never {
  redirect(`/courses/${FLAGSHIP_COURSE.slug}`);
}
