import { AppHeader } from "@/components/site/app-header";

// ==========================================
// 1. 登入後 layout
// ==========================================

// 接 Auth 後在這一組擋未登入的使用者
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
