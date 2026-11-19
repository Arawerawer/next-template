# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 專案定位

這是要放上 GitHub 的**前端模板**：開新專案時 clone 下來，就能靠 AI 快速開發並部署到 Cloudflare。

- 前後端分離：Next 只負責畫面與串接 API，不直接存取資料庫，也不放商業邏輯。
- 後端是另一個 NestJS 專案（DDD、Supabase DB + Auth、檔案存 R2、CI/CD 部署到 Cloud Run），不在這個 repo。
- 已安裝：shadcn/ui（全部元件）。
- 已接上：`next-themes` 深色模式切換。
- 已安裝：`@opennextjs/cloudflare` + `wrangler`（部署到 Cloudflare Workers）。
- 預定技術棧（尚未安裝）：zod、axios、TanStack Query、`@supabase/ssr`。
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

### 部署（已設定，待實測）

- 部署到 Cloudflare Workers，用 `@opennextjs/cloudflare`（OpenNext）＋ Workers Builds Git 自動部署；步驟寫在 `README.md`。
- 不用 Cloudflare 首推的 vinext：它的 `cacheComponents` 不完整、沒有 PPR。
- `@opennextjs/cloudflare` 1.20.16 起要求 Next ≥ 16.4.5，升級 Next 時注意相容範圍（看它的 `peerDependencies`）。
- `proxy.ts`（Node middleware）在 OpenNext 1.20.3 起是 experimental；若在 Workers 上不能跑，退回 `middleware.ts`，或改用 Route Handler 轉發 `/api/*`。
- 目前沒用 ISR / `revalidateTag`，`open-next.config.ts` 是空設定，不綁 R2 / D1 / Durable Objects；**不要開 `enableCacheInterception`**（和 PPR 衝突）。
- 不要加 `export const runtime = "edge"`，OpenNext 不支援 edge runtime。
- `package.json` 的 `allowScripts` 是 npm 12 的安裝腳本白名單（`esbuild`、`workerd` 要下載平台執行檔）。

## 文件維護

- `README.md` 的「檔案結構」是使用者核對專案架構用的；新增、刪除或搬移資料夾與重要檔案時，同步更新那段 file tree。

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
- 顏色用 shadcn 的 CSS 變數（`--primary`、`--background` 等，oklch）。深色模式靠 `<html>` 上的 `.dark` class（`@custom-variant dark`），由 `next-themes` 切換。
- 深色模式照 shadcn 官方做法：`components/theme/theme-provider.tsx` 包在根 layout（`attribute="class"`、預設跟隨系統），`<html>` 有 `suppressHydrationWarning`；切換按鈕是 `components/theme/mode-toggle.tsx`（淺色／深色／跟隨系統），放在各 header 右上角。

### shadcn/ui

- 設定在 `components.json`：style `radix-vega`、底層 Radix、圖示 lucide、baseColor neutral。
- 切版時優先使用 `components/ui/` 的現成元件和 shadcn blocks（`npx shadcn@latest add <名稱>`），不要用 Tailwind 手刻按鈕、彈窗這類已有的元件。
- `components/ui/` 只放 shadcn 產生的元件；自訂元件放 `components/` 底下的其他資料夾。
- `cn()` 從 `@/lib/utils` 匯入，底層是 shadcn 官方的 `cn` 套件（取代 clsx + tailwind-merge）。
- `combobox` 只有 Base UI 版本，所以 `@base-ui/react` 也在相依套件裡，屬正常。
- `components/ui/carousel.tsx` 和 `hooks/use-mobile.ts` 為了通過 lint（`react-hooks/set-state-in-effect`）改寫成 `useSyncExternalStore`；用 `add --overwrite` 重新產生會蓋掉修改，lint 會再壞。

### 資料夾分工

- `hooks/`：自訂 React hooks（client 端）。
- `lib/`：非畫面的工具程式碼；之後的 axios instance、`queryOptions`、Supabase client、zod schema 也放這裡。
- `lib/site.ts`：網站名稱、標語、描述，header、`<title>`、首頁都從這裡讀，不要把名稱寫死在元件裡。

### 範例功能（Notely 筆記）

- 模板內建一個完整但簡化的範例：行銷首頁 `/`、`/login`、`/signup`、筆記 CRUD `/notes`。新功能照這組的寫法做。
- 路由用 route group 分三種版型：`(marketing)`、`(auth)`、`(app)`；登入保護只加在 `(app)`。
- 目前是**靜態階段**：表單不送出、筆記是 `app/(app)/notes/page.tsx` 裡的假資料，標了「靜態階段」註解的地方都是之後要接 Auth / API 的位置。
- 不做 mock 後端：CRUD 會真的串 Nest、真的部署。
- 進度與下一步（依序）：
  1. ✅ 靜態畫面（四頁）＋ 深色模式切換
  2. 🚧 部署空殼到 Cloudflare（OpenNext），先驗證 Next 16.4 + `cacheComponents` 能不能跑（設定檔已完成，待接 Workers Builds 實測；`proxy.ts` 目前只加 `x-proxy: ok` header 供驗證）
  3. Supabase Auth：註冊、登入、登出、`proxy.ts` 刷新 token、`(app)` 擋未登入（只做 email + 密碼）
  4. zod、axios ×2、TanStack Query 骨架，`lib/notes.ts` 放 schema 與 `queryOptions`
  5. Nest 完成後接上 CRUD，刪掉假資料

### Provider 寫法

- 需要 React Context 的 Provider（`next-themes`、之後的 TanStack Query）一律在 `components/` 下包一個 `"use client"` 元件，再由根 layout（Server Component）引用。

### 字型與語系

- `<html lang="zh-Hant-TW">`，內容以繁體中文為主。
- `app/layout.tsx` 用 `next/font/google` 載入：Inter（`--font-inter`，英文和數字）、Noto Sans TC（`--font-noto-sans-tc`，中文，`preload: false` 因為字檔大）、Geist Mono（`--font-geist-mono`，程式碼）。
- `globals.css` 的 `--font-sans` 順序：Inter → Noto Sans TC → PingFang TC → Microsoft JhengHei。Inter 沒有中文字，中文會自動落到 Noto Sans TC，所以 Inter 必須排在前面。
