import { AppHeader } from "@/components/site/app-header";

// ==========================================
// 1. 登入後 layout
// ==========================================

// 擋未登入：proxy.ts 先導頁，AppHeader 裡的 getCurrentUser() 再檢查一次
// 這裡不要 await session（cacheComponents 規則），需要使用者的元件自己呼叫 getCurrentUser() 並包 <Suspense>
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
