"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleAlertIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/lib/auth/actions";

// ==========================================
// 1. 登入表單
// ==========================================

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const emailError = state?.fieldErrors?.email?.[0];
  const passwordError = state?.fieldErrors?.password?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">登入</CardTitle>
        <CardDescription>輸入 Email 和密碼登入帳號</CardDescription>
      </CardHeader>
      <CardContent>
        {/* noValidate：交給 zod 驗證，錯誤訊息才會統一是中文 */}
        <form id="login-form" action={formAction} noValidate>
          <FieldGroup>
            {state?.error && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Field data-invalid={Boolean(emailError)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                defaultValue={state?.email}
                aria-invalid={Boolean(emailError)}
                required
              />
              <FieldError>{emailError}</FieldError>
            </Field>
            <Field data-invalid={Boolean(passwordError)}>
              <FieldLabel htmlFor="password">密碼</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(passwordError)}
                required
              />
              <FieldError>{passwordError}</FieldError>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button type="submit" form="login-form" className="w-full" disabled={pending}>
          {pending && <Spinner />}
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
