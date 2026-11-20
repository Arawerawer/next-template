import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

// ==========================================
// 1. 刷新 session
// ==========================================

// 給 proxy.ts 用：token 快過期時刷新，並把新 cookie 同時寫進 request（給後面的 Server Component）與 response（給瀏覽器）
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          // 帶 token 的回應不能被 CDN 快取，否則會把別人的 session 給錯人
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  // 一定要呼叫 auth 方法才會觸發刷新；getClaims() 會驗證 JWT 簽章，不要改成只讀 cookie 的 getSession()
  // 建立 client 和 getClaims() 之間不要插入其他邏輯，否則可能出現使用者被隨機登出、很難除錯的問題
  const { data } = await supabase.auth.getClaims();

  return { response, isLoggedIn: Boolean(data?.claims) };
}
