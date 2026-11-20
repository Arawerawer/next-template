"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleAlertIcon, MailCheckIcon } from "lucide-react";
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
import { signup } from "@/lib/auth/actions";

// ==========================================
// 1. 註冊表單
// ==========================================

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, undefined);
  const emailError = state?.fieldErrors?.email?.[0];
  const passwordError = state?.fieldErrors?.password?.[0];
  const confirmPasswordError = state?.fieldErrors?.confirmPassword?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">建立帳號</CardTitle>
        <CardDescription>用 Email 免費註冊</CardDescription>
      </CardHeader>
      <CardContent>
        {/* noValidate：交給 zod 驗證，錯誤訊息才會統一是中文 */}
        <form id="signup-form" action={formAction} noValidate>
          <FieldGroup>
            {state?.error && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            {state?.message && (
              <Alert>
                <MailCheckIcon />
                <AlertDescription>{state.message}</AlertDescription>
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
                autoComplete="new-password"
                aria-invalid={Boolean(passwordError)}
                required
              />
              <FieldError>{passwordError}</FieldError>
            </Field>
            <Field data-invalid={Boolean(confirmPasswordError)}>
              <FieldLabel htmlFor="confirm-password">確認密碼</FieldLabel>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(confirmPasswordError)}
                required
              />
              <FieldError>{confirmPasswordError}</FieldError>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button type="submit" form="signup-form" className="w-full" disabled={pending}>
          {pending && <Spinner />}
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
