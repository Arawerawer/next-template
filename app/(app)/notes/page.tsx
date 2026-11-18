import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/notes/note-card";
import { NoteFormDialog } from "@/components/notes/note-form-dialog";
import { NotesEmpty } from "@/components/notes/notes-empty";
import type { Note } from "@/lib/notes";

// ==========================================
// 1. Metadata
// ==========================================

export const metadata: Metadata = {
  title: "我的筆記",
};

// ==========================================
// 2. 假資料
// ==========================================

// 靜態階段用，接 API 後整段刪除，改成 prefetchQuery + HydrationBoundary
const notes: Note[] = [
  {
    id: "1",
    title: "買菜清單",
    content: "牛奶、雞蛋、吐司、香蕉、洗衣精，順便看看有沒有特價的咖啡豆。",
    createdAt: "2026-11-18T10:00:00+08:00",
  },
  {
    id: "2",
    title: "會議紀錄",
    content: "討論下季目標：完成會員系統、改善首頁轉換率、整理技術債。下次會議訂在週五。",
    createdAt: "2026-11-17T14:30:00+08:00",
  },
  {
    id: "3",
    title: "讀書心得",
    content: "這本書最有收穫的一句話：先求有，再求好。很多事情卡住都是因為想一次做到完美。",
    createdAt: "2026-11-15T21:00:00+08:00",
  },
];

// ==========================================
// 3. 筆記列表頁
// ==========================================

export default function NotesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">我的筆記</h1>
        <NoteFormDialog>
          <Button>
            <PlusIcon />
            新增筆記
          </Button>
        </NoteFormDialog>
      </div>

      {notes.length === 0 ? (
        <NotesEmpty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
