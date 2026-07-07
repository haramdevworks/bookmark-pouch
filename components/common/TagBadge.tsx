import type { Tag } from "@/types";

export function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-tag-bg px-3 text-[11px] font-medium text-tag-fg">
      #{tag.name}
    </span>
  );
}
