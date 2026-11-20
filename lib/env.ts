import { z } from "zod";

// ==========================================
// 1. 公開環境變數
// ==========================================

// NEXT_PUBLIC_ 開頭的值在 build 時寫進 bundle，所以必須逐一寫出 process.env.XXX，不能整包傳 process.env
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

if (!parsed.success) {
  throw new Error(
    `環境變數設定錯誤（本機看 .env.local，部署看 Cloudflare Build variables）：\n${z.prettifyError(parsed.error)}`
  );
}

export const env = parsed.data;
