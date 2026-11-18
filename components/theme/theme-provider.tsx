"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// ==========================================
// 1. 主題 Provider
// ==========================================

// shadcn 官方做法：包一層 next-themes，讓 Server Component 的 layout 可以使用
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
