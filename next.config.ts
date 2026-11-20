import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 暫時關閉：Next 16.4 + cacheComponents 在 OpenNext / Cloudflare Workers 上渲染會卡死（500、Worker hung）。
  // 等 https://github.com/opennextjs/opennextjs-cloudflare/pull/1318 合併並發布後再改回 true（兩個一起）。
  // 程式碼仍照 cacheComponents 的規則寫（動態資料包 <Suspense>），打開時才不用改。
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

// 讓 next dev 也能用 Cloudflare bindings（getCloudflareContext）
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
