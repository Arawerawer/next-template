import { format } from "date-fns";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteNoteDialog } from "@/components/notes/delete-note-dialog";
import { NoteFormDialog } from "@/components/notes/note-form-dialog";
import type { Note } from "@/lib/notes";

// ==========================================
// 1. 筆記卡片
// ==========================================

export function NoteCard({ note }: { note: Note }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{note.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-2 text-sm text-muted-foreground">{note.content}</p>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs text-muted-foreground">
          {format(new Date(note.createdAt), "MM/dd")}
        </span>
        <div className="flex gap-1">
          <NoteFormDialog note={note}>
            <Button variant="ghost" size="icon-sm" aria-label="編輯">
              <PencilIcon />
            </Button>
          </NoteFormDialog>
          <DeleteNoteDialog note={note} />
        </div>
      </CardFooter>
    </Card>
  );
}
