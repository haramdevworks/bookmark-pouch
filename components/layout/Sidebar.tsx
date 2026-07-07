import Link from "next/link";
import { Cloud as CloudIcon, Tag as TagIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFolders } from "@/services/folderService";
import { getTags } from "@/services/tagService";
import { CreateFolderForm } from "./CreateFolderForm";
import { FolderList } from "./FolderList";
import { TagList } from "./TagList";

export async function Sidebar() {
  let folders: Awaited<ReturnType<typeof getFolders>> = [];
  let tags: Awaited<ReturnType<typeof getTags>> = [];
  let hasLoadError = false;

  try {
    [folders, tags] = await Promise.all([getFolders(), getTags()]);
  } catch {
    hasLoadError = true;
  }

  return (
    <aside className="flex w-[240px] shrink-0 flex-col gap-6 border-r border-border bg-sidebar px-4 py-8">
      <Link href="/" className="px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="파우치" className="h-8 w-auto" />
      </Link>

      {hasLoadError && (
        <p className="px-2 text-[11px] text-destructive">
          폴더/태그를 불러오지 못했습니다. 잠시 후 새로고침해주세요.
        </p>
      )}

      <Accordion multiple defaultValue={["folders", "tags"]} className="gap-2">
        <AccordionItem value="folders" className="border-none">
          <AccordionTrigger className="px-2 py-2 text-[13px] font-semibold text-foreground hover:bg-accent hover:no-underline">
            <span className="flex items-center gap-2">
              <CloudIcon className="size-3.5" />
              폴더
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <FolderList folders={folders} />
            <CreateFolderForm />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tags" className="border-none">
          <AccordionTrigger className="px-2 py-2 text-[13px] font-semibold text-foreground hover:bg-accent hover:no-underline">
            <span className="flex items-center gap-2">
              <TagIcon className="size-3.5" />
              태그
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-2 pt-1.5">
              <TagList tags={tags} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
