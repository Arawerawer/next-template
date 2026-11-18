# next-template

前後端分離專案的 Next.js 前端模板，目標是 clone 下來就能靠 AI 快速切版，並部署到 Cloudflare。

---

## 技術棧

- Next.js 16（App Router、`cacheComponents`）
- React 19、TypeScript
- Tailwind CSS 4
- shadcn/ui（Radix、Vega 風格，已安裝全部元件）

---

## 檔案結構

```
next-template/
├── app/                      # App Router 路由
│   ├── layout.tsx            # 根 layout（字型、全域樣式）
│   ├── page.tsx              # 首頁
│   ├── globals.css           # Tailwind 與 shadcn 主題色 CSS 變數
│   └── favicon.ico
├── components/
│   └── ui/                   # shadcn 產生的元件（勿大改，自訂元件放 components/ 其他資料夾）
├── hooks/                    # 自訂 React hooks（client 端）
│   ├── use-mobile.ts         # 判斷是否為手機寬度
│   └── use-highlighted-code.ts  # 程式碼區塊語法上色
├── lib/                      # 非畫面的工具程式碼
│   ├── utils.ts              # cn()：合併 Tailwind class
│   └── highlighter.tsx       # shiki 語法上色設定
├── public/                   # 靜態檔案
├── components.json           # shadcn CLI 設定
├── next.config.ts            # Next 設定（cacheComponents、Tailwind turbopack loader）
├── eslint.config.mjs
├── tsconfig.json             # 路徑別名 @/* → 專案根目錄
├── AGENTS.md                 # Next 自動產生的 AI 規則
└── CLAUDE.md                 # Claude Code 專案說明
```

---

## 常用指令

```bash
npm install          # 安裝套件
npm run dev          # 開發伺服器 http://localhost:3000
npm run lint         # ESLint
npx tsc --noEmit     # 型別檢查
npx shadcn@latest add <元件名>   # 新增 shadcn 元件或 block
```
