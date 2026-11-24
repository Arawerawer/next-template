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
- 已安裝：`@supabase/ssr` + `@supabase/supabase-js`（Supabase Auth）、zod。
- 預定技術棧（尚未安裝）：axios、TanStack Query。
- 下方「目標架構」是已和使用者確認的設計，Auth 已實作，資料抓取（axios、TanStack Query、`/api/*` 轉發）**尚未實作**；動手前先確認對應檔案和套件是否已存在。

## 目標架構（已確認，部分實作）

### 渲染

- 目標是開 `cacheComponents`，但**目前暫時關閉**（見下方「部署」）；所有頁面在 server 渲染，不做純 client 端渲染的頁面。
- 程式碼一律照 `cacheComponents` 的規則寫，打開時才不用改：讀 `cookies()` / `headers()` / `searchParams` / 未快取的 fetch 的元件包在 `<Suspense>` 裡；layout 頂層不 `await` session。關閉期間 build 不會擋這些錯，要自己注意。

### Auth（cookie + Bearer）

- 分工：Supabase 只當 Auth 和資料庫；CRUD、商業邏輯全部在 Nest（直連 Postgres）；不用 Supabase 的 Data API、Storage、Realtime。
- 已實作（第 3 步）：
  - `lib/env.ts`：zod 驗證 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`；新增 `NEXT_PUBLIC_*` 時要逐一寫 `process.env.XXX`（build 時才會內嵌）。
  - `lib/supabase/server.ts`：`await createClient()`，給 Server Component / Server Action 用。
  - `lib/supabase/proxy.ts`：`updateSession()` 刷新 token，回傳 `{ response, isLoggedIn }`；建立 client 後必須馬上呼叫 `getClaims()`，中間不要插邏輯。
  - `proxy.ts`：`protectedPrefixes`（目前 `/notes`）未登入導 `/login`；`authRoutes` 已登入導 `/notes`；導頁要用 `redirectWithCookies()`，否則剛刷新的 token 會遺失。
  - `lib/auth/user.ts`：`getCurrentUser()` 是登入後頁面取使用者的唯一入口（React `cache` 去重，沒登入 `redirect('/login')`），呼叫的元件包 `<Suspense>`。
  - `lib/auth/actions.ts`：`login` / `signup` / `logout` Server Action，表單用 `useActionState`；Supabase 錯誤碼在 `errorMessages` 對照成中文。
  - 驗證身分一律用 `getClaims()`（驗 JWT 簽章），不要用 `getSession()`（只讀 cookie、不驗證）。
  - 瀏覽器端沒有 Supabase client（沒有 `lib/supabase/client.ts`），不要加。

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

### 部署（已上線）

- 部署到 Cloudflare Workers，用 `@opennextjs/cloudflare`（OpenNext）＋ Workers Builds Git 自動部署；步驟寫在 `README.md`。
- 網址：`https://next-template.a0979699161.workers.dev`。
- **`cacheComponents` / `partialPrefetching` 暫時關閉**：Next 16.4 + Cache Components 在 workerd 上渲染會卡死（每頁 500、log 顯示 Worker hung，並有 `setTimeout()` 相容性警告）。原因是 workerd 的計時器／`nextTick` 執行順序和 Node 不同。追蹤 OpenNext issue #1450、PR #1318；PR 合併並發布後，把 `next.config.ts` 兩個旗標改回 `true`，重新部署驗證。
- 不用 Cloudflare 首推的 vinext：它的 `cacheComponents` 不完整、沒有 PPR。
- `@opennextjs/cloudflare` 1.20.16 起要求 Next ≥ 16.4.5，升級 Next 時注意相容範圍（看它的 `peerDependencies`）。
- `proxy.ts`（Node middleware）在 OpenNext 1.20.3 起是 experimental；若在 Workers 上不能跑，退回 `middleware.ts`，或改用 Route Handler 轉發 `/api/*`。
- 目前沒用 ISR / `revalidateTag`，`open-next.config.ts` 是空設定，不綁 R2 / D1 / Durable Objects；**不要開 `enableCacheInterception`**（和 PPR 衝突）。
- 不要加 `export const runtime = "edge"`，OpenNext 不支援 edge runtime。
- **npm 版本鎖死 10.9.7**（Node 22.22.2 內建版本）：本機、其他電腦、Workers Builds 必須同一版，否則 lockfile 會壞。
  - 原因：`@opennextjs/aws` 用 peer dependency 要 `diff@^9`、`shadcn` 要 `diff@^8`；npm 10 和 npm 11/12 對這種 peer dependency 的擺法不同，npm 12 寫出的 lockfile 會被 Workers Builds 的 `npm ci` 判定 `Missing: diff@9.0.0` 而 build 失敗。
  - `package.json` 的 `packageManager: "npm@10.9.7"`：Workers Builds 照這個欄位切換 npm 版本（官方說這是唯一方式），不設會用它的預設版本，預設版本變了部署就可能突然壞掉。
  - `engines.npm: "10.9.7"` ＋ `.npmrc` 的 `engine-strict=true`：版本不符的電腦跑 `npm install` 會直接報 `EBADENGINE`，不會改到 lockfile。
  - 換電腦：`nvm install 22.22.2` → `nvm use 22.22.2`，`npm -v` 確認是 10.9.7。
  - Node 版本寫在 `.node-version`（22.22.2），Workers Builds 照這個檔案切換（不設會用它的預設 Node 24）；升 Node 時 `.node-version`、`packageManager`、`engines` 三處一起改成新版 Node 內建的 npm。
  - 升級 Node / npm 的步驟寫在 `README.md`「升級 Node / npm 版本」（給使用者看的版本）；`.node-version`、`packageManager`、`engines` 三處一起改，刪掉 `node_modules` 重新 `npm install`，再用 `npm ci --dry-run --ignore-scripts` 確認（本機模擬 Workers Builds 的安裝，不會改檔案）。
  - 已驗證（2026-11-24，commit `20158ee`）：Workers Builds log 顯示 `Detected the following tools from environment: npm@10.9.7`，部署成功。
- `package.json` 的 `allowScripts` 是 npm 12 的安裝腳本白名單（`esbuild`、`workerd` 要下載平台執行檔）；npm 10 不認這個欄位、安裝腳本照常執行，留著是為了之後升 npm 12。

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

### `next.config.ts` 會改變行為的旗標（目前兩個都暫時關閉，以下是打開後的行為）

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
- `lib/`：非畫面的工具程式碼；Supabase client（`lib/supabase/`）、Auth（`lib/auth/`）、環境變數（`lib/env.ts`）已在這裡，之後的 axios instance、`queryOptions` 也放這裡。
- `lib/site.ts`：網站名稱、標語、描述，header、`<title>`、首頁都從這裡讀，不要把名稱寫死在元件裡。

### 範例功能（Notely 筆記）

- 模板內建一個完整但簡化的範例：行銷首頁 `/`、`/login`、`/signup`、筆記 CRUD `/notes`。新功能照這組的寫法做。
- 路由用 route group 分三種版型：`(marketing)`、`(auth)`、`(app)`；登入保護只加在 `(app)`。
- 登入、註冊、登出已串 Supabase；筆記仍是**靜態階段**：筆記是 `app/(app)/notes/page.tsx` 裡的假資料，標了「靜態階段」註解的地方都是之後要接 API 的位置。
- 不做 mock 後端：CRUD 會真的串 Nest、真的部署。
- 進度與下一步（依序）：
  1. ✅ 靜態畫面（四頁）＋ 深色模式切換
  2. ✅ 部署空殼到 Cloudflare（OpenNext）：`cacheComponents` 有已知 bug 先關閉；`proxy.ts` 在 Workers 上實測可用
  3. ✅ Supabase Auth：註冊、登入、登出、`proxy.ts` 刷新 token、`(app)` 擋未登入（只做 email + 密碼）；本機與正式環境都已實測通過（2026-11-20，commit `c27f61d`）
     - Supabase 專案 `project-template`（Tokyo `ap-northeast-1`），之後 Nest 也接這個（Nest 用 JWKS 驗 JWT、連線走 Supavisor transaction mode port 6543）。
     - 不做 email 驗證（Supabase「Confirm email」關閉）；要開時另做 callback 路由，並在 Supabase 加 localhost 與 workers.dev 的 redirect URL。
     - 環境變數只有 `NEXT_PUBLIC_*` 兩個：本機 `.env.local`、Cloudflare「Build variables」（已設定）；目前不需要 runtime 變數。
     - Supabase 後台已設定：Minimum password length 8（和 `lib/auth/schemas.ts` 一致，改一邊要改另一邊）；建專案時關閉自動授權新表給 Data API、開啟新表自動 RLS。
     - 新版 Supabase 後台的「Confirm email」在 Authentication → Sign In / Providers 頁面最上方「User Signups」，不在 Email provider 面板裡。
  4. ⏭️ axios ×2、TanStack Query 骨架（zod 已裝），`lib/notes.ts` 放 schema 與 `queryOptions`
  5. Nest 完成後接上 CRUD，刪掉假資料

### Provider 寫法

- 需要 React Context 的 Provider（`next-themes`、之後的 TanStack Query）一律在 `components/` 下包一個 `"use client"` 元件，再由根 layout（Server Component）引用。

### 字型與語系

- `<html lang="zh-Hant-TW">`，內容以繁體中文為主。
- `app/layout.tsx` 用 `next/font/google` 載入：Inter（`--font-inter`，英文和數字）、Noto Sans TC（`--font-noto-sans-tc`，中文，`preload: false` 因為字檔大）、Geist Mono（`--font-geist-mono`，程式碼）。
- `globals.css` 的 `--font-sans` 順序：Inter → Noto Sans TC → PingFang TC → Microsoft JhengHei。Inter 沒有中文字，中文會自動落到 Noto Sans TC，所以 Inter 必須排在前面。
