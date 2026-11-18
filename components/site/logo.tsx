import Link from "next/link";
import { NotebookPenIcon } from "lucide-react";
import { siteConfig } from "@/lib/site";

// ==========================================
// 1. Logo
// ==========================================

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold">
      <NotebookPenIcon className="size-5" />
      {siteConfig.name}
    </Link>
  );
}
