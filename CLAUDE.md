# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 專案定位

這是要放上 GitHub 的**前端模板**：開新專案時 clone 下來，就能靠 AI 快速開發並部署到 Cloudflare。

- 前後端分離：Next 只負責畫面與串接 API，不直接存取資料庫，也不放商業邏輯。
- 後端是另一個 NestJS 專案（DDD、Supabase DB + Auth、檔案存 R2、CI/CD 部署到 Cloud Run），不在這個 repo。
- 預定技術棧：shadcn/ui、zod、axios、TanStack Query、`@supabase/ssr`。
- 下方「目標架構」是已和使用者確認的設計，**尚未實作**；動手前先確認對應檔案和套件是否已存在。

## 目標架構（已確認，尚未實作）

### 渲染

- 保留 `cacheComponents`，所有頁面在 server 渲染，不做純 client 端渲染的頁面。
- 讀 `cookies()` 的元件一律包在 `<Suspense>` 裡（沒包會 build 失敗）；layout 頂層不 `await` session。

### Auth（cookie + Bearer）

- 登入、登出只在 Server Action / Route Handler 執行：用 `@supabase/ssr` 的 server client 串接 Supabase Auth，token 存成同網域的 **HttpOnly cookie**。
- 瀏覽器端不使用 supabase-js（它讀不到 HttpOnly cookie），所有 Supabase 操作都走 server。
- `proxy.ts` 負責兩件事：
  1. token 快過期時刷新並寫回 cookie（Server Component 不能寫 cookie，所以只能在這裡做）。
  2. 攔截 `/api/*`，把 cookie 裡的 token 轉成 `Authorization: Bearer`，再用 `NextResponse.rewrite()` 轉給 Nest。
- 不要用 `next.config.ts` 的 `rewrites` 轉 API：它不能改 header，Nest 會收不到 Bearer。
- Nest 只認 Bearer token（用 Supabase JWKS 驗 JWT），完全不處理 cookie。

### 資料抓取

- 兩個 axios instance，都要設 `adapter: 'fetch'`（Cloudflare Workers 環境需要）：
  - server 用：從 `cookies()` 取 token 帶 Bearer，直接打 Nest 的絕對網址。
  - client 用：打相對路徑 `/api/*`，交給 `proxy.ts` 轉發。
- TanStack Query 只做 client 端快取。Server Component 用 `prefetchQuery` 加上 `HydrationBoundary` 提供初始資料（做法見 `01-app/02-guides/client-side-data-fetching/tanstack-query.md`）。
- 每個資源的 `queryOptions`（query key 加上抓取方式）集中定義，server 預抓和 client 共用同一份。
- 使用者資料不用 `use cache`，避免和 TanStack Query 形成兩層快取。
- zod 用於表單驗證、API 回應解析、環境變數驗證。

### 部署

- 部署到 Cloudflare Workers，使用 Cloudflare 的 Git 自動部署（Workers Builds）。
- Cloudflare 不是 Next 官方 verified adapter，需透過 Cloudflare 自己的 Next 整合（OpenNext）部署；Next 16.4 搭配 `cacheComponents` / `partialPrefetching` 的相容性要實測。

## 指令

- `npm run lint`：ESLint 9 flat config（`eslint-config-next` 的 core-web-vitals + typescript）。
- `npx tsc --noEmit`：型別檢查（`next build` 以外唯一的型別驗證方式）。
- `npm run dev` / `npm run build` / `npm run start`：開發、建置、正式啟動（開發伺服器由使用者自己開，不要代跑）。
- 目前沒有測試框架，也沒有 test script。

## 版本重點

- Next.js 16.4、React 19.3、Tailwind CSS 4.3、TypeScript strict。
- 這版 Next.js 和訓練資料差很多，寫碼前先查 `node_modules/next/dist/docs/`（`01-app/` 是 App Router 文件）。

## 架構

- 只用 App Router，全部在 `app/`，沒有 `src/` 也沒有 `pages/`。
- 路徑別名 `@/*` 指向專案根目錄。
- `layout.tsx` 用全域型別 `LayoutProps<"/">`（Next 自動產生的路由型別，型別在 `.next/types`），新的 layout / page 沿用 `LayoutProps` / `PageProps` 這類 helper。

### `next.config.ts` 開了會改變行為的旗標

- `cacheComponents: true`：資料抓取預設為動態，要快取得明確用 `"use cache"` + `cacheLife` / `cacheTag`。預設啟用 PPR（靜態 shell + 串流動態內容）。
  - 不支援 route segment config 的 `runtime` export（含 `runtime = 'nodejs'`），不要加。
  - 舊的 `dynamic` / `revalidate` 等 segment config 寫法要改，參考 `01-app/02-guides/migrating-to-cache-components.md`。
  - 導覽時用 React `<Activity>` 把離開的路由設為 hidden，元件 state 會保留、effect 會被清掉再重建。
- `partialPrefetching: true`：`<Link>` 預設只預抓每條路由的 App Shell；依賴 `params` / `searchParams` 的內容導覽後才解析。要完整預抓用 `<Link prefetch={true}>`。必須搭配 `cacheComponents`，否則 config 驗證直接報錯。

### Tailwind

- 沒有 `postcss.config`，Tailwind 是透過 `next.config.ts` 的 `turbopack.rules` 用 `@tailwindcss/turbopack` loader 處理所有 `*.css`。
- Tailwind v4 CSS-first 設定：主題 token 寫在 `app/globals.css` 的 `@theme inline`，沒有 `tailwind.config.*`。
- 顏色以 CSS 變數 `--background` / `--foreground` 定義，深色模式用 `prefers-color-scheme` 切換；字型由 `next/font` 的 Geist 注入 `--font-geist-sans` / `--font-geist-mono`。
