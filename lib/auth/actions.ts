"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";

// ==========================================
// 1. 表單狀態
// ==========================================

// 給 useActionState 用；email 回傳是為了表單重設後保留使用者輸入過的值（密碼不回傳）
export type AuthFormState =
  | {
      email?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      error?: string;
      message?: string;
    }
  | undefined;

// ==========================================
// 2. 錯誤訊息
// ==========================================

const errorMessages: Record<string, string> = {
  invalid_credentials: "Email 或密碼錯誤",
  email_not_confirmed: "這個帳號還沒完成 Email 驗證，請先到信箱點驗證連結",
  user_already_exists: "這個 Email 已經註冊過了",
  email_exists: "這個 Email 已經註冊過了",
  weak_password: "密碼強度不足，請換一組更複雜的密碼",
  over_request_rate_limit: "嘗試次數太多，請稍後再試",
  over_email_send_rate_limit: "寄信次數太多，請稍後再試",
  signup_disabled: "目前暫停開放註冊",
};

function toMessage(error: AuthError) {
  const message = error.code ? errorMessages[error.code] : undefined;
  if (!message) console.error("Supabase Auth 錯誤：", error);
  return message ?? "發生錯誤，請稍後再試";
}

// ==========================================
// 3. 登入
// ==========================================

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });

  if (!parsed.success) {
    return { email, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { email, error: toMessage(error) };
  }

  redirect("/notes");
}

// ==========================================
// 4. 註冊
// ==========================================

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const parsed = signupSchema.safeParse({
    email,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { email, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { email, error: toMessage(error) };
  }

  // Supabase 開了「Confirm email」時不會回傳 session，要等使用者點信裡的連結（目前關閉，需要時另做 callback 路由）
  if (!data.session) {
    return { email, message: "註冊成功！請到信箱點驗證連結後再登入。" };
  }

  redirect("/notes");
}

// ==========================================
// 5. 登出
// ==========================================

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
