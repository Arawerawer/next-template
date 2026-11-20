import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// ==========================================
// 1. Server 用 Supabase client
// ==========================================

// 給 Server Component、Server Action、Route Handler 用；每個請求各建一個，不要共用
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component 不能寫 cookie，會丟錯；token 刷新交給 proxy.ts，這裡可以忽略
        }
      },
    },
  });
}
