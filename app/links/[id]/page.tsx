import { notFound } from "next/navigation";
import { getBookmarkById } from "@/services/bookmarkService";
import { getFolders } from "@/services/folderService";
import { BookmarkDetailForm } from "@/components/bookmark/BookmarkDetailForm";

export default async function BookmarkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bookmark, folders] = await Promise.all([getBookmarkById(id), getFolders()]);

  if (!bookmark) {
    notFound();
  }

  return <BookmarkDetailForm bookmark={bookmark} folders={folders} />;
}
