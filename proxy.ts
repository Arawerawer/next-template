import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// ==========================================
// 1. 路由分類
// ==========================================

// 需要登入才能進的路徑（前綴比對）；新增登入後頁面時加在這裡
const protectedPrefixes = ["/notes"];

// 登入後不該再看到的頁面
const authRoutes = ["/login", "/signup"];

// ==========================================
// 2. Proxy
// ==========================================

// 這裡只做樂觀檢查（讀 cookie 裡的 JWT），真正的權限由 Server Component（lib/auth/user.ts）和 Nest 把關
export async function proxy(request: NextRequest) {
  const { response, isLoggedIn } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isLoggedIn) {
    return redirectWithCookies(request, "/login", response);
  }

  if (authRoutes.includes(pathname) && isLoggedIn) {
    return redirectWithCookies(request, "/notes", response);
  }

  return response;
}

// ==========================================
// 3. 導頁並保留刷新後的 cookie
// ==========================================

// 直接 NextResponse.redirect() 會丟掉 updateSession 剛寫入的新 token，所以要把 cookie 和 header 複製過去
function redirectWithCookies(request: NextRequest, pathname: string, from: NextResponse) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));

  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  ["cache-control", "expires", "pragma"].forEach((key) => {
    const value = from.headers.get(key);
    if (value) redirect.headers.set(key, value);
  });

  return redirect;
}

// ==========================================
// 4. 比對路徑
// ==========================================

// 排除靜態檔與圖片，避免每個資源都經過 proxy。
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
