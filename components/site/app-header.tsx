import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/site/logo";
import { UserMenu } from "@/components/site/user-menu";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { getCurrentUser } from "@/lib/auth/user";

// ==========================================
// 1. 登入後 header
// ==========================================

// 讀使用者的部分包在 <Suspense> 裡，header 其他部分不用等 session
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Logo href="/notes" />
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Suspense fallback={<Skeleton className="h-9 w-40" />}>
            <CurrentUserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

// ==========================================
// 2. 目前使用者
// ==========================================

async function CurrentUserMenu() {
  const user = await getCurrentUser();
  return <UserMenu email={user.email} />;
}
