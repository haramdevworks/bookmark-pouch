import { notFound, redirect } from "next/navigation";
import { getBookmarkById } from "@/services/bookmarkService";
import { getFolders } from "@/services/folderService";
import { getUserId } from "@/lib/auth";
import { BookmarkDetailForm } from "@/components/bookmark/BookmarkDetailForm";

export default async function BookmarkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let userId: string;
  try {
    userId = await getUserId();
  } catch {
    redirect("/auth/login");
  }

  const [bookmark, folders] = await Promise.all([getBookmarkById(id, userId), getFolders(userId)]);

  if (!bookmark) {
    notFound();
  }

  return <BookmarkDetailForm bookmark={bookmark} folders={folders} />;
}
