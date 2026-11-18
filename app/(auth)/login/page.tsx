import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

// ==========================================
// 1. Metadata
// ==========================================

export const metadata: Metadata = {
  title: "登入",
};

// ==========================================
// 2. 登入頁
// ==========================================

export default function LoginPage() {
  return <LoginForm />;
}
