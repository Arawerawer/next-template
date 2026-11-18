import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/lib/notes";

// ==========================================
// 1. 新增／編輯筆記 Dialog
// ==========================================

type NoteFormDialogProps = {
  // 有傳 note 就是編輯模式
  note?: Note;
  // 觸發按鈕
  children: React.ReactNode;
};

// 靜態階段：儲存只會關閉視窗；接 API 後改成 useMutation
export function NoteFormDialog({ note, children }: NoteFormDialogProps) {
  const isEdit = note !== undefined;
  const idPrefix = note?.id ?? "new";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯筆記" : "新增筆記"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改後按儲存。" : "寫下標題和內容。"}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-title`}>標題</FieldLabel>
            <Input id={`${idPrefix}-title`} name="title" defaultValue={note?.title} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-content`}>內容</FieldLabel>
            <Textarea
              id={`${idPrefix}-content`}
              name="content"
              rows={6}
              defaultValue={note?.content}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>儲存</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
