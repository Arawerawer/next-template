# PLAN.md（臨時交接檔）

> 這是換電腦用的交接檔，整理自 2026-11-24～27 的討論。
> 內容包含：原本工作區 `project-template/CLAUDE.md` 的全部內容、建 Nest 的決定、步驟、**目標 file tree**。
> **Nest 建好、工作區 `CLAUDE.md` 重建之後，就刪掉這個檔案**（它暫時違反「子專案不可指向其他子專案」的規則，所以只能是臨時的）。

---

## 0. 回家後怎麼接續

1. 建資料夾 `project-template/`，在裡面 clone：`git clone https://github.com/Arawerawer/next-template.git`
2. Next 照 `README.md` 的「開發環境」設定（Node 22.22.2、npm 10.9.7、`.env.local`）。
3. VS Code 開 `project-template/` 這層，跟 Claude 說：「讀 `next-template/PLAN.md`，接著做」。
4. 從下面「4. 建 Nest 的步驟」Step 1 開始。
5. Nest 建好後，請 Claude 用「1. 工作區 CLAUDE.md」重建 `project-template/CLAUDE.md`（最上方加 `@next-template/CLAUDE.md`、`@nest-template/CLAUDE.md`），再刪掉本檔。

---

## 1. 工作區 CLAUDE.md（原 `project-template/CLAUDE.md` 內容，已更新）

### 工作區結構

```
project-template/          ← VS Code 從這層開，本身不是 git repo
├── CLAUDE.md              ← 只放跨專案的事（目前已刪，內容在本檔，Nest 建好後重建）
├── next-template/         ← 前端（Next.js 16.4，部署到 Cloudflare Workers）
└── nest-template/         ← 後端（NestJS 12，部署到 Cloud Run）—— 待建
```

### 規則

- 兩個專案要能各自獨立 clone 使用：**子專案的 CLAUDE.md 不可以指向其他子專案**（例如 next 不要寫 `../nest-xxx`），跨專案的關聯只寫在工作區 CLAUDE.md。
- 各專案的細節（技術棧、指令、資料夾分工）寫在各自的 CLAUDE.md；工作區只放：分工、API 約定、共用資源、兩邊要一起改的規則。
- 在某個子專案裡跑指令（`npm`、`git`、`npx tsc` 等）前，先 `cd` 到那個子資料夾；工作區那層沒有 `package.json`。

### 分工

- **Next（`next-template/`）**：只負責畫面與串接 API，不存取資料庫、不放商業邏輯。登入／登出用 Supabase Auth（Server Action），token 存 HttpOnly cookie；`proxy.ts` 把 `/api/*` 轉成 `Authorization: Bearer` 後轉給 Nest。
- **Nest（`nest-template/`，待建）**：輕量 DDD 架構（見第 3 節）；CRUD 與商業邏輯全在這裡；直連 Supabase Postgres；檔案存 R2；CI/CD 部署到 Cloud Run。只認 Bearer token（用 Supabase JWKS 驗 JWT），不處理 cookie。

### 共用資源

- Supabase 專案：`project-template`（Tokyo `ap-northeast-1`）。Next 只用它的 Auth；Nest 連資料庫走 Supavisor transaction mode（port 6543）。
- Supabase JWT 已是非對稱金鑰：JWKS 端點有 `EC ES256 P-256` 公鑰（2026-11-24 實測），Nest 用 JWKS 驗證即可，不需要 JWT secret。
- Next 正式網址：`https://next-template.a0979699161.workers.dev`
- Nest 正式網址：（部署到 Cloud Run 後填）

### 兩邊要一起改的規則

- 密碼最短 8 碼：Next `lib/auth/schemas.ts`、Supabase 後台 Minimum password length（Nest 若有驗證也要一致）。

### API 約定

（Nest 建好後補：路徑、筆記資料格式、錯誤格式。Next 的 `lib/notes.ts` 照這裡寫；Nest 端以 `presentation/notes.schemas.ts` 的 zod 為準。）

### 目前進度與下一步

Next 已完成：靜態畫面、部署到 Cloudflare、Supabase Auth。筆記仍是假資料。

已決定**先建 Nest，再回 Next 做資料抓取**，原因：不做 mock 後端，沒有真 API 就無法驗證 axios／TanStack Query／`/api/*` 轉發。

順序：

1. 建 Nest 最小版：JWKS 驗證 JWT + 一支 `GET /notes`。
2. Nest 部署到 Cloud Run。
3. 回 Next 做原本的第 4 步：axios ×2、TanStack Query、`lib/notes.ts`、`proxy.ts` 轉發 `/api/*`，接上 `GET /notes` 從頭到尾打通。
4. Nest 補齊筆記 CRUD，Next 刪掉假資料。

注意：

- Next 會多一個 Nest 網址的環境變數；不需公開時不要加 `NEXT_PUBLIC_`，但要在 Cloudflare 另設 runtime 變數（目前只有 build 變數），本機 `.env.local` 也要加。
- Nest 不用開 CORS：瀏覽器只打同網域 `/api/*`，server 端直接打 Nest。

### 已決定（原「待決定」）

- Nest 資料夾名稱：`nest-template`。
- Nest 是獨立的 GitHub repo：`https://github.com/Arawerawer/nest-template`（**還沒開**，見 Step 3）。

---

## 2. 已決定的事項

### Node 版本

- **Nest 用 Node 24.22.3（內建 npm 11.19.1）**，支援到 2028-04。
- 原因：`nest new`（`@nestjs/schematics`）要求 Node `^22.22.3 || ^24.15.0 || >=26`，22.22.2 跑不了。
- **Next 維持 22.22.2、npm 10.9.7，不動**。Next 升 Node 24 有 npm 11 lockfile 風險（`diff` peer dependency 問題），等 Nest 打通後另外排。
- 電腦是 nvm-windows，`nvm use` 會切換整台電腦：做 Nest `nvm use 24.22.3`，做 Next `nvm use 22.22.2`。忘了切也不會弄壞 Next（`engine-strict` 會擋）。
- Nest 也要比照 Next 鎖版本：`.node-version`、`.npmrc`（`engine-strict=true`）、`package.json` 的 `packageManager`、`engines.npm`，另加 `engines.node`（Cloud Run buildpack 看這個選 Node 版本）。

### `nest new` 選項

| 選項 | 原因 |
|---|---|
| `--package-manager npm` | 跟 Next 一致 |
| `--type esm` | v12 預設，測試用 Vitest；`jose` 只有 ESM |
| `--skills claude` | 只裝 `.claude/skills`；`AGENTS.md` 一定會產生 |
| `--no-observe` | Observe 是 Nest 官方雲端 APM，會送資料到外部、要註冊帳號；模板先不裝 |
| 不加 `--skip-git` | 讓它 `git init`，之後接 GitHub |

### 架構：輕量 DDD

- **要做**：module 內分 `domain／application／infrastructure／presentation` 四層；domain 不依賴 Nest 和 Drizzle；規則寫在 entity；repository 用 abstract class 當介面（Nest custom provider，不用 `@Inject()`）。
- **先不做**：`@nestjs/cqrs`（bus）、domain events、saga。需要時再加，`@nestjs/cqrs` 12.1.3 支援 Nest 12。
- **讀寫分開**：寫入走 entity + repository；讀取直接查 DB 回 DTO（加 `user_id` 條件）。
- 選這個而不是 Nest 官方寫法（controller + service）的原因：商業邏輯全在 Nest，官方寫法 service 容易肥；模板會被複製到每個新專案，結構要一開始就立好。
- 代價：一個功能約 8～10 個檔；`nest new` 產生的官方 skills 是官方寫法，所以 `nest-template/CLAUDE.md` 要寫清楚分層規則。

### 其他技術選擇

- **驗證 JWT**：`jose` 的 `createRemoteJWKSet` + `jwtVerify`，檢查 `iss` = `https://<ref>.supabase.co/auth/v1`、`aud` = `authenticated`；使用者 id 取 `sub`。自己寫全域 Guard（`APP_GUARD`）+ `@Public()`。**不用** `@nestjs/authentication`（那是 Nest 自己做登入／session，跟 Supabase 分工衝突）。
- **環境變數**：`@nestjs/config` + zod（v12 官方推薦 Standard Schema／zod）。
- **request 驗證**：v12 內建 `StandardSchemaValidationPipe` + zod。
- **ORM：Drizzle**（暫定，做 `GET /notes` 時最後確認）。用穩定版 0.45.x（v1 還在 RC）。6543 要設 `prepare: false`；migration 走 5432。Prisma 的 npm `latest` 目前指向 8.0.0-rc，不穩。
- **交易**：`@nestjs-cls/transactional` + Drizzle adapter（支援 Nest 12），做寫入時才加。
- **權限**：Nest 用 `postgres` 角色直連，**會繞過 RLS**，「只能看改自己的筆記」一定要在 Nest 做（entity 檢查擁有者、查詢加 `user_id`）。
- **連線**：Cloud Run 只有 IPv4，Supabase 免費方案直連只有 IPv6，所以走 Supavisor pooler（`aws-…pooler.supabase.com`，帳號 `postgres.<ref>`）。
- **Port**：Nest 預設 3000 會跟 Next dev 撞，本機 `.env` 設 `PORT=3001`。
- **部署**：Cloud Run `asia-east1`（台灣，Tier 1 價格）；網頁後台接 GitHub 自動部署（Cloud Build trigger），不用先裝 `gcloud`。先試 buildpacks（不寫 Dockerfile），部署那步再補查官方文件確認。

---

## 3. 目標 file tree（最重要）

符號：🆕 = `nest new` 自動產生　★ = 第一步要做（JWKS 驗證 + `GET /notes`）　沒標 = 補齊 CRUD 時才加

```
nest-template/
├── .claude/skills/                    🆕 Nest 官方 skills（--skills claude）
├── AGENTS.md                          🆕 Nest 給 AI 的說明
├── CLAUDE.md                          ★ @AGENTS.md + 分層規則（讓 AI 照 DDD 寫）
├── README.md                          🆕 → 改寫成模板說明 + 檔案結構
├── package.json                       🆕 → 加版本鎖定（packageManager、engines）
├── package-lock.json                  🆕
├── .node-version                      ★ 24.22.3
├── .npmrc                             ★ engine-strict=true
├── .env                               ★ 本機用（不進 git）：PORT=3001、SUPABASE_URL、DATABASE_URL
├── .env.example                       ★ 列出要設哪些變數（進 git）
├── tsconfig.json                      🆕
├── nest-cli.json                      🆕
├── drizzle.config.ts                  ★ drizzle-kit 設定（migration 走 5432）
├── drizzle/                           ★ migration SQL 檔（drizzle-kit 產生）
├── test/                              🆕 e2e 測試
│
└── src/
    ├── main.ts                        🆕 → 改：PORT、全域 zod pipe、shutdown hooks
    ├── app.module.ts                  🆕 → 改：組裝 shared + 各領域 module
    │
    ├── shared/                        ← 跨領域、跟商業規則無關的東西
    │   ├── config/
    │   │   ├── env.schema.ts          ★ zod 驗證環境變數
    │   │   └── config.module.ts       ★ @nestjs/config
    │   ├── auth/
    │   │   ├── auth.guard.ts          ★ jose + Supabase JWKS 驗 Bearer（全域 APP_GUARD）
    │   │   ├── public.decorator.ts    ★ @Public()：不用登入的路由
    │   │   ├── current-user.decorator.ts ★ @CurrentUser()：取出 JWT 的 sub
    │   │   └── auth.module.ts         ★
    │   ├── database/
    │   │   ├── database.module.ts     ★ Drizzle 連線（6543、prepare: false）
    │   │   └── transaction.ts           交易（@nestjs-cls/transactional，CRUD 時才加）
    │   ├── domain/
    │   │   └── domain-error.ts        ★ domain 錯誤的基底 class（純 TS）
    │   ├── http/
    │   │   └── domain-error.filter.ts ★ domain 錯誤 → HTTP 狀態碼（404／403／400）
    │   └── health/
    │       └── health.controller.ts   ★ GET /health（@Public，部署後檢查用）
    │
    └── modules/                       ← 一個領域一個資料夾
        └── notes/
            ├── notes.module.ts        ★ 把 repository 介面綁到 Drizzle 實作
            │
            ├── domain/                ← 純 TS，不 import Nest、不 import Drizzle
            │   ├── note.entity.ts       筆記 entity：建立、改標題、檢查擁有者
            │   ├── note.entity.spec.ts  規則的單元測試（不用連 DB）
            │   ├── note-title.vo.ts     value object：標題不能空、長度上限
            │   ├── note.repository.ts   abstract class：save / findById / delete
            │   └── note.errors.ts       NoteNotFound、NotNoteOwner
            │
            ├── application/           ← 一個 use case 一個檔，只負責協調
            │   ├── list-notes.query.ts  ★ 讀取：直接查 DB 回 DTO（不經過 entity）
            │   ├── get-note.query.ts
            │   ├── create-note.use-case.ts
            │   ├── update-note.use-case.ts
            │   └── delete-note.use-case.ts
            │
            ├── infrastructure/        ← 跟資料庫有關的都在這
            │   ├── notes.table.ts       ★ Drizzle table 定義
            │   ├── note.mapper.ts         DB row ↔ entity
            │   └── drizzle-note.repository.ts  實作 note.repository.ts
            │
            └── presentation/          ← 對外的 HTTP 介面
                ├── notes.controller.ts  ★ GET /notes（之後補 POST／PATCH／DELETE）
                └── notes.schemas.ts     ★ zod：request／response 格式（API 約定照這個寫）
```

設計重點：

- **依賴方向**：`presentation → application → domain ← infrastructure`。`domain/` 不能 import 任何外層。
- **第一步沒有 entity**：`GET /notes` 只讀取，entity／repository／mapper 做寫入時才加。
- **新增領域**（例如 `tags`）：照 `modules/notes/` 複製一份，`shared/` 不動。
- `nest new` 產生的 `app.controller.ts`、`app.service.ts` 和它們的測試會刪掉，改用 `health.controller.ts`。
- 還不確定：oxlint／Vitest／Prettier 的設定檔實際檔名（跑完 `nest new` 再補進樹）；`shared/`、`modules/` 名稱可再改（例如 `core/`、`features/`）。

---

## 4. 建 Nest 的步驟（使用者自己跑 Step 1～4）

**Step 1：裝 Node 24 並切換**

```powershell
nvm install 24.22.3
nvm use 24.22.3
node -v
npm -v
node -p process.versions.icu
```

預期：`v24.22.3`、`11.19.1`，最後一行印出版本號（不是 `undefined`）。

**Step 2：建立專案**

```powershell
cd <你的路徑>\project-template
npx @nestjs/cli@latest new nest-template --package-manager npm --type esm --skills claude --no-observe
```

中途有其他問題先選預設，跑完把輸出貼給 Claude。

**Step 3：GitHub 開空 repo**

名稱 `nest-template`，**不要**勾 README、.gitignore、license。

**Step 4：推上 GitHub**

```powershell
cd nest-template
git status
git log --oneline
```

`git log` 沒東西的話，先 `git add -A`、`git commit -m "chore: init NestJS project"`。然後：

```powershell
git branch -M main
git remote add origin https://github.com/Arawerawer/nest-template.git
git push -u origin main
```

**Step 5 之後（Claude 接手）**

1. 鎖版本（`.node-version`、`.npmrc`、`packageManager`、`engines`）。
2. 寫 `nest-template/CLAUDE.md`（含分層規則）；重建工作區 `CLAUDE.md`；刪本檔。
3. 照 file tree 建 `shared/`、`modules/notes/`，做 JWKS Guard 與 `GET /notes`。

---

## 5. 參考來源

- NestJS：[First steps](https://docs.nestjs.com/first-steps)、[CLI usages](https://docs.nestjs.com/cli/usages)、[Migration guide（v12）](https://docs.nestjs.com/migration-guide)、[Configuration](https://docs.nestjs.com/techniques/configuration)、[Guards](https://docs.nestjs.com/guards)、[Custom providers](https://docs.nestjs.com/fundamentals/custom-providers)、[Modules](https://docs.nestjs.com/modules)、[CQRS](https://docs.nestjs.com/recipes/cqrs)、[Pipes](https://docs.nestjs.com/pipes)、[Observability](https://docs.nestjs.com/observability/overview)
- Supabase：[JWTs](https://supabase.com/docs/guides/auth/jwts)、[Signing keys](https://supabase.com/docs/guides/auth/signing-keys)、[JWT fields](https://supabase.com/docs/guides/auth/jwt-fields)、[Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)、[Drizzle](https://supabase.com/docs/guides/database/drizzle)
- DDD：[Fowler：DDD](https://martinfowler.com/bliki/DomainDrivenDesign.html)、[Fowler：Anemic Domain Model](https://martinfowler.com/bliki/AnemicDomainModel.html)、[Microsoft：DDD-oriented microservice](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice)、[Stemmler：Entities](https://khalilstemmler.com/articles/typescript-domain-driven-design/entities/)
- 交易：[nestjs-cls Drizzle adapter](https://papooch.github.io/nestjs-cls/plugins/available-plugins/transactional/drizzle-orm-adapter)
- Cloud Run：[從 Git 持續部署](https://docs.cloud.google.com/run/docs/quickstarts/deploy-continuously?hl=zh-TW)、[Buildpacks Node.js](https://docs.cloud.google.com/docs/buildpacks/nodejs)
