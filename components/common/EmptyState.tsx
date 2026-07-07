import { AddLinkModal } from "@/components/bookmark/AddLinkModal";

export function EmptyState({ query, filtered }: { query?: string; filtered?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-24 text-center">
      
      {query ? (
        <p className="text-[13px] text-description">
          <span className="font-semibold text-foreground">&apos;{query}&apos;</span>에 대한 검색 결과가 없습니다.
        </p>
      ) : filtered ? (
        <p className="text-[13px] text-description">조건에 맞는 링크가 없습니다.</p>
      ) : (
        <>
          <p className="text-[13px] text-description">아직 저장한 링크가 없습니다.</p>
          <AddLinkModal variant="cta" />
        </>
      )}
    </div>
  );
}
