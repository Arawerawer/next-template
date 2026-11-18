"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// ==========================================
// 1. 註冊表單
// ==========================================

// 靜態階段：送出不做事；接 Auth 後改成 Server Action + zod 驗證
export function SignupForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">建立帳號</CardTitle>
        <CardDescription>用 Email 免費註冊</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="signup-form" onSubmit={(e) => e.preventDefault()}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">密碼</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">確認密碼</FieldLabel>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button type="submit" form="signup-form" className="w-full">
          註冊
        </Button>
        <p className="text-sm text-muted-foreground">
          已經有帳號了？
          <Link href="/login" className="ml-1 text-foreground underline underline-offset-4">
            登入
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
