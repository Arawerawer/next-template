import { NextResponse } from "next/server";

// ==========================================
// 1. Proxy
// ==========================================
// 部署驗證用：確認 proxy.ts 在 Cloudflare Workers 上有執行（回應會帶 x-proxy header）。
// 之後第 3 步在這裡做 token 刷新與 /api/* 轉 Bearer（屆時加上 request: NextRequest 參數）。
export function proxy() {
  const response = NextResponse.next();
  response.headers.set("x-proxy", "ok");
  return response;
}

// ==========================================
// 2. 比對路徑
// ==========================================
// 排除靜態檔與圖片，避免每個資源都經過 proxy。
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
