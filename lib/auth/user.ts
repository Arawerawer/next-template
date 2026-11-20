import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ==========================================
// 1. 目前登入的使用者
// ==========================================

export type CurrentUser = {
  id: string;
  email: string;
};

// 登入後頁面取得使用者的唯一入口；沒登入直接導到 /login
// 會讀 cookie，呼叫的元件要包在 <Suspense> 裡（cacheComponents 規則），不要在 layout 頂層 await
// 用 React cache 讓同一個請求內多處呼叫只驗證一次；不用 "use cache"，避免和之後的 TanStack Query 形成兩層快取
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/login");
  }

  return { id: claims.sub, email: claims.email ?? "" };
});
