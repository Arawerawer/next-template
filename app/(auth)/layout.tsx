import { Logo } from "@/components/site/logo";
import { ModeToggle } from "@/components/theme/mode-toggle";

// ==========================================
// 1. 登入／註冊 layout
// ==========================================

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-12">
      <div className="absolute top-3 right-4">
        <ModeToggle />
      </div>
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
