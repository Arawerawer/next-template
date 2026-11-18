import { NotebookIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// ==========================================
// 1. 沒有筆記時
// ==========================================

export function NotesEmpty() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <NotebookIcon />
        </EmptyMedia>
        <EmptyTitle>還沒有筆記</EmptyTitle>
        <EmptyDescription>點右上角「新增筆記」寫下第一篇。</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
