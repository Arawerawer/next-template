import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { ModeToggle } from "@/components/theme/mode-toggle";

// ==========================================
// 1. 行銷頁 header（未登入）
// ==========================================

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">登入</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">免費註冊</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
