import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

// ==========================================
// 1. Metadata
// ==========================================

export const metadata: Metadata = {
  title: "註冊",
};

// ==========================================
// 2. 註冊頁
// ==========================================

export default function SignupPage() {
  return <SignupForm />;
}
