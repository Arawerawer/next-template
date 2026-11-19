// ==========================================
// 1. OpenNext 設定
// ==========================================
// 目前沒用 ISR / revalidateTag，不需要 incremental cache、tag cache、queue。
// 不要開 enableCacheInterception：和 PPR（cacheComponents）衝突。
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
