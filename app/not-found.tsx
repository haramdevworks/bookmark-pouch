import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-24 text-center">
      <p className="text-[13px] text-description">요청하신 페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        목록으로 돌아가기
      </Link>
    </div>
  );
}
