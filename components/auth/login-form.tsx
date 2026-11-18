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
// 1. 登入表單
// ==========================================

// 靜態階段：送出不做事；接 Auth 後改成 Server Action + zod 驗證
export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">登入</CardTitle>
        <CardDescription>輸入 Email 和密碼登入帳號</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={(e) => e.preventDefault()}>
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
                autoComplete="current-password"
                required
              />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button type="submit" form="login-form" className="w-full">
          登入
        </Button>
        <p className="text-sm text-muted-foreground">
          還沒有帳號？
          <Link href="/signup" className="ml-1 text-foreground underline underline-offset-4">
            註冊
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
