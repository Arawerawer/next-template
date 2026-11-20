import { z } from "zod";

// ==========================================
// 1. 登入
// ==========================================

export const loginSchema = z.object({
  email: z.email("請輸入正確的 Email"),
  password: z.string().min(1, "請輸入密碼"),
});

// ==========================================
// 2. 註冊
// ==========================================

export const signupSchema = z
  .object({
    email: z.email("請輸入正確的 Email"),
    password: z.string().min(8, "密碼至少 8 個字元"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "兩次輸入的密碼不一致",
    path: ["confirmPassword"],
  });
