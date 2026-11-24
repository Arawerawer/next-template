# next-template

前後端分離專案的 Next.js 前端模板，目標是 clone 下來就能靠 AI 快速切版，並部署到 Cloudflare。

---

## 技術棧

- Next.js 16（App Router；`cacheComponents` 因 OpenNext 相容性問題暫時關閉）
- React 19、TypeScript
- Tailwind CSS 4
- shadcn/ui（Radix、Vega 風格，已安裝全部元件）
- Supabase Auth（`@supabase/ssr`，token 存 HttpOnly cookie）、zod

---

## 檔案結構

```
next-template/
├── app/                      # App Router 路由
│   ├── layout.tsx            # 根 layout（字型、全域樣式、metadata）
│   ├── (marketing)/          # 行銷頁（header + footer）
│   │   ├── layout.tsx
│   │   └── page.tsx          # /
│   ├── (auth)/               # 登入、註冊（置中卡片版型）
│   │   ├── layout.tsx
│   │   ├── login/page.tsx    # /login
│   │   └── signup/page.tsx   # /signup
│   ├── (app)/                # 登入後頁面（proxy.ts 擋未登入）
│   │   ├── layout.tsx
│   │   └── notes/page.tsx    # /notes：筆記 CRUD
│   ├── globals.css           # Tailwind 與 shadcn 主題色 CSS 變數
│   └── favicon.ico
├── components/
│   ├── ui/                   # shadcn 產生的元件（勿大改，自訂元件放 components/ 其他資料夾）
│   ├── site/                 # Logo、header、footer、使用者選單（登出）
│   ├── theme/                # ThemeProvider、亮暗切換按鈕
│   ├── auth/                 # 登入、註冊表單
│   └── notes/                # 筆記卡片、新增／編輯 Dialog、刪除確認
├── hooks/                    # 自訂 React hooks（client 端）
│   ├── use-mobile.ts         # 判斷是否為手機寬度
│   └── use-highlighted-code.ts  # 程式碼區塊語法上色
├── lib/                      # 非畫面的工具程式碼
│   ├── site.ts               # 網站名稱、標語、描述（開新專案改這裡）
│   ├── env.ts                # 環境變數 zod 驗證（缺值時直接報錯）
│   ├── supabase/
│   │   ├── server.ts         # Server Component / Server Action 用的 Supabase client
│   │   └── proxy.ts          # proxy.ts 用：刷新 token、判斷是否登入
│   ├── auth/
│   │   ├── actions.ts        # 登入、註冊、登出 Server Action
│   │   ├── schemas.ts        # 登入、註冊表單 zod 規則
│   │   └── user.ts           # getCurrentUser()：取得目前使用者，沒登入導到 /login
│   ├── notes.ts              # Note 型別（之後放 zod schema、queryOptions）
│   ├── utils.ts              # cn()：合併 Tailwind class
│   └── highlighter.tsx       # shiki 語法上色設定
├── public/                   # 靜態檔案
│   └── _headers              # Cloudflare 靜態檔快取標頭
├── proxy.ts                  # 請求前置處理：刷新 token、登入導頁（之後加 /api/* 轉 Bearer）
├── components.json           # shadcn CLI 設定
├── next.config.ts            # Next 設定（cacheComponents 開關、Tailwind turbopack loader、OpenNext dev）
├── open-next.config.ts       # OpenNext 設定（快取策略）
├── wrangler.jsonc            # Cloudflare Worker 設定（名稱、相容性旗標）
├── .env.example              # 環境變數範本（複製成 .env.local 後填值）
├── .dev.vars.example         # 本機 preview 用的 Worker 變數範本（複製成 .dev.vars）
├── .npmrc                    # engine-strict：npm 版本不符時拒絕安裝
├── .node-version             # Node 版本（Cloudflare Workers Builds 照這個檔案切換）
├── eslint.config.mjs
├── tsconfig.json             # 路徑別名 @/* → 專案根目錄
├── AGENTS.md                 # Next 自動產生的 AI 規則
└── CLAUDE.md                 # Claude Code 專案說明
```

---

## 開發環境

- Node **22.22.2**、npm **10.9.7**（Node 22.22.2 內建的 npm，不要另外升級）。
- 用 nvm 的話：`nvm install 22.22.2` → `nvm use 22.22.2`。
- Node 版本寫在 `.node-version`，Cloudflare 部署時也用同一版。
- npm 版本寫死在 `package.json`（`packageManager`、`engines`），版本不符時 `npm install` 會直接報錯。原因是 npm 11 以後產生的 `package-lock.json`，Cloudflare 部署時的 `npm ci` 可能不接受。

### 升級 Node / npm 版本

**1. 切換版本**

```bash
nvm install 24.22.1
nvm use 24.22.1
npm -v        # 記下顯示的 npm 版本，下一步要用
```

**2. 改三個地方**

| 檔案 | 改成 |
|---|---|
| `.node-version` | `24.22.1` |
| `package.json` → `packageManager` | `"npm@<npm -v 的版本>"` |
| `package.json` → `engines.npm` | `"<npm -v 的版本>"` |

**3. 重裝套件**

```bash
rm -r node_modules
npm install
npm ci --dry-run --ignore-scripts    # 沒報錯才繼續
```

**4. 推上去確認**

commit、push 後，看 Cloudflare build log：

- 開頭：`Detected the following tools from environment: npm@<新版>, nodejs@<新版>`
- 結尾：`Success! Build completed.`

**5. 其他電腦**

```bash
nvm install 24.22.1
nvm use 24.22.1
```

---

## 環境變數

1. 複製 `.env.example` 成 `.env.local`。
2. 到 Supabase 後台 → Connect（或 Project Settings → API Keys）取得 Project URL 和 publishable key 填進去。
3. 只放 publishable key，**secret key（`sb_secret_`）不要放進這個專案**。

Supabase 後台建議設定：

- Authentication → Sign In / Providers → Email：目前範例沒做 email 驗證 callback，「Confirm email」要關閉。
- 建立專案時，「Grant API access to new tables automatically」取消勾選、「Enable RLS on new tables automatically」勾選（資料一律走 Nest，不讓 publishable key 直接讀寫資料表）。

---

## 常用指令

```bash
npm install          # 安裝套件
npm run dev          # 開發伺服器 http://localhost:3000
npm run lint         # ESLint
npx tsc --noEmit     # 型別檢查
npx shadcn@latest add <元件名>   # 新增 shadcn 元件或 block
npm run preview      # 用 Workers runtime 在本機跑建置結果
npm run deploy       # 從本機建置並部署到 Cloudflare（建議改用 Git 自動部署）
```

---

## 部署到 Cloudflare Workers

使用 [OpenNext](https://opennext.js.org/cloudflare)（`@opennextjs/cloudflare`）＋ Workers Builds Git 自動部署。

1. 開新專案時，把 `wrangler.jsonc` 的 `name` 和 `services[0].service` 改成同一個名稱。
2. Cloudflare 後台 → Workers & Pages → Create → Import a repository，選這個 repo。
3. Settings → Build：
   - Build command：`npx @opennextjs/cloudflare build`
   - Deploy command：`npx @opennextjs/cloudflare deploy`
4. 環境變數：
   - `NEXT_PUBLIC_*` 和 build 時要用的變數放「Build variables and secrets」（`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`）。
   - 執行時的變數和密鑰放「Variables & Secrets」；若在後台設定，deploy command 要加 `-- --keep-vars`，否則每次部署會被清掉。
5. push 到 production branch 就會自動建置部署。

注意：Workers 免費方案單一 Worker 上限 3 MiB（gzip 後），付費方案 10 MiB。
