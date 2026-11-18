import type { Metadata } from "next";
import { Geist_Mono, Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

// ==========================================
// 1. 字型
// ==========================================

// 英文、數字
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// 中文（字檔大，不預載）
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  weight: ["400", "500", "700"],
  preload: false,
});

// 程式碼
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ==========================================
// 2. Metadata
// ==========================================

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name}｜${siteConfig.tagline}`,
    template: `%s｜${siteConfig.name}`,
  },
  description: siteConfig.description,
};

// ==========================================
// 3. Layout
// ==========================================

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant-TW"
      // next-themes 會在瀏覽器端加上 .dark，不加這個會跳 hydration 警告
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        inter.variable,
        notoSansTC.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
