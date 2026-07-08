import { redirect } from "next/navigation";
import { getBookmarks, searchBookmarks } from "@/services/bookmarkService";
import { getFolders } from "@/services/folderService";
import { getUserId } from "@/lib/auth";
import { BookmarkCard } from "@/components/bookmark/BookmarkCard";
import { AddLinkModal } from "@/components/bookmark/AddLinkModal";
import { AutoRefresh } from "@/components/bookmark/AutoRefresh";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchBar } from "@/components/common/SearchBar";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; folder?: string; tag?: string }>;
}) {
  const { q, folder, tag } = await searchParams;
  const query = q?.trim() ?? "";
  const filters = { folderId: folder || undefined, tagId: tag || undefined };

  let userId: string;
  try {
    userId = await getUserId();
  } catch {
    redirect("/auth/login");
  }

  const [bookmarks, folders] = await Promise.all([
    query ? searchBookmarks(query, filters, userId) : getBookmarks(filters, userId),
    getFolders(userId),
  ]);
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));
  const hasPendingEnrichment = bookmarks.some((bookmark) => bookmark.title === "제목 없음");

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh active={hasPendingEnrichment} />
      <div>
        <h1 className="text-xl font-bold text-foreground">내 링크</h1>
        <p className="mt-1 text-[13px] text-description">
          {query ? `'${query}' 검색 결과 ${bookmarks.length}개` : `저장한 링크 ${bookmarks.length}개`}
        </p>
      </div>

      <SearchBar key={query} defaultQuery={query} />

      {bookmarks.length === 0 ? (
        <EmptyState query={query || undefined} filtered={Boolean(folder || tag)} />
      ) : (
        <div className="flex flex-col gap-5">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              folder={bookmark.folderId ? (folderById.get(bookmark.folderId) ?? null) : null}
            />
          ))}
        </div>
      )}

      <AddLinkModal />
    </div>
  );
}
