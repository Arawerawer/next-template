import { siteConfig } from "@/lib/site";

// ==========================================
// 1. Footer
// ==========================================

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
        © {siteConfig.name}
      </div>
    </footer>
  );
}
