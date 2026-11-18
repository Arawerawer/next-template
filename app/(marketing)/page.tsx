import Link from "next/link";
import { CloudIcon, LockIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

// ==========================================
// 1. 功能介紹內容
// ==========================================

const features = [
  {
    icon: ZapIcon,
    title: "快速",
    description: "打開就能寫，不用整理資料夾或標籤。",
  },
  {
    icon: LockIcon,
    title: "安全",
    description: "筆記只有你自己看得到。",
  },
  {
    icon: CloudIcon,
    title: "隨處可用",
    description: "手機、電腦都能用，資料自動同步。",
  },
];

// ==========================================
// 2. 首頁
// ==========================================

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {siteConfig.tagline}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">免費開始使用</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">了解更多</Link>
          </Button>
        </div>
      </section>

      {/* 功能介紹 */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-14 px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="mb-2 size-6" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold">準備好了嗎？</h2>
          <Button size="lg" asChild>
            <Link href="/signup">立即註冊</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
