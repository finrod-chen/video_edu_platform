# Synology Container Manager 部署指南

適用於：喜躍生醫影音訓練系統 (`ghcr.io/finrod-chen/video_edu_platform`)
部署方式：Container Manager「Project」功能 + `docker-compose.prod.yml`

## 整體流程

```
git push → GitHub Actions (CI + Docker Publish)
         → image 推送到 ghcr.io/finrod-chen/video_edu_platform:latest
         → Synology Container Manager 定期/手動 pull 最新 image → 重啟容器
```

App 本身**不含任何資料庫密碼**——所有連線資訊都在部署時透過環境變數（`.env` 檔）注入，image 換到哪台機器都一樣，只換 `.env` 即可。

## 前置需求

- DSM 7.2 以上，已安裝 **Container Manager** 套件
- NAS 對外網路正常（需要能連到 `ghcr.io` 拉 image）
- 一個可連線的 MySQL（可以是 NAS 上的 MariaDB 套件，也可以是外部/公司內網的 MySQL）
- 已用 `db/schema.sql`（和選擇性的 `db/seed.sql`）在該 MySQL 上建好資料庫
- 一組 Google OAuth 2.0 用戶端憑證（見步驟 2 的「Google SSO」小節）

## 步驟 1：建立專案資料夾

用 **File Station** 建立一個資料夾，例如：

```
/docker/video_edu_platform/
```

把以下檔案/資料夾放進這個資料夾：

1. `docker-compose.prod.yml`（repo 根目錄下，直接複製過去）
2. `.env`（下一步自己建立，**不要**把這個檔案 commit 進 git）
3. `uploads/`（手動建立一個空資料夾，用來存手冊影片/縮圖，並開放寫入權限）：
   ```bash
   mkdir -p /volume1/docker/video_edu_platform/uploads/tmp
   chmod -R 777 /volume1/docker/video_edu_platform/uploads
   ```
   （容器內執行的使用者跟 NAS 主機的 UID 不一定對得上，`chmod 777` 是最簡單可行的做法；`docker-compose.prod.yml` 會把這個資料夾掛進容器的 `/app/uploads`，重建容器不會遺失已上傳的檔案。）

## 步驟 2：建立 `.env`

複製 repo 裡的 `.env.example` 內容，另存成 `.env`，填入真實的值：

```bash
# MySQL 連線資訊
DB_HOST=你的MySQL主機位址        # 例如 192.168.1.10，或 NAS 上跑 MariaDB 就用 localhost/host.docker.internal
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=你的真實密碼           # 不要留空
DB_NAME=training_platform       # 建議依實際資料庫名稱調整
DB_CONNECTION_LIMIT=10

# Next.js server 對外埠號（容器內固定 3000，這裡改的是「主機」對外埠號）
PORT=3000
HOSTNAME=0.0.0.0

# Google SSO（見下方「Google SSO 設定」）
GOOGLE_CLIENT_ID=你的Client ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的Client Secret
AUTH_SECRET=用 openssl rand -base64 33 產生的隨機字串
AUTH_TRUST_HOST=true
AUTH_URL=https://video-edu.xiyuebiomed.com.tw

# 手冊影片儲存目錄（對應步驟 1 建立的 uploads 資料夾，容器內路徑固定 /app/uploads）
UPLOAD_DIR=/app/uploads

# Gmail SMTP（指派通知信，選填——沒設定的話指派功能仍可用，只是不會寄信）
# 需要在寄件 Gmail 帳號開啟兩步驟驗證，並到 https://myaccount.google.com/apppasswords 產生應用程式密碼
GMAIL_SMTP_USER=your-account@gmail.com
GMAIL_SMTP_PASSWORD=你的應用程式密碼
GMAIL_SMTP_FROM=your-account@gmail.com

# OpenAI Whisper（手冊編輯頁「產生字幕」/「批次補字幕」按鈕，選填）
OPENAI_API_KEY=你的OpenAI API Key
```

| 變數 | 說明 | 是否必填 |
|---|---|---|
| `DB_HOST` | MySQL 主機位址或 IP | 必填 |
| `DB_PORT` | MySQL 埠號，預設 `3306` | 選填 |
| `DB_USER` | MySQL 帳號 | 必填 |
| `DB_PASSWORD` | MySQL 密碼 | 必填（可為空字串，但不建議） |
| `DB_NAME` | 資料庫名稱 | 必填 |
| `DB_CONNECTION_LIMIT` | 連線池上限，預設 `10` | 選填 |
| `PORT` | 主機對外埠號（`docker-compose.prod.yml` 用 `${PORT:-3000}` 讀取） | 選填，預設 `3000` |
| `HOSTNAME` | Next.js server 監聽位址，容器內用，一般維持 `0.0.0.0` 即可 | 選填 |
| `GOOGLE_CLIENT_ID` | Google OAuth 用戶端 ID | 必填 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 用戶端密鑰 | 必填 |
| `AUTH_SECRET` | 簽章/加密 session 用的隨機密鑰 | 必填 |
| `AUTH_TRUST_HOST` | 在 Docker/反向代理後面必須設 `true`，否則登入 callback 會被拒絕 | 必填（固定填 `true`） |
| `AUTH_URL` | 對外真實網址（例如 Cloudflare Tunnel 的網域），**沒設會導致登入導回 `http://0.0.0.0:3000/...` 並失敗** | 只要不是純 `localhost` 測試就必填 |
| `UPLOAD_DIR` | 手冊影片/縮圖的儲存目錄，Docker 部署固定填 `/app/uploads`（對應掛進去的 volume） | 必填 |
| `GMAIL_SMTP_USER` | 寄件 Gmail 帳號 | 選填（不設定則指派通知信不會寄出，其餘功能不受影響） |
| `GMAIL_SMTP_PASSWORD` | Gmail 應用程式密碼（不是登入密碼） | 選填，同上 |
| `GMAIL_SMTP_FROM` | 信件顯示的寄件人地址，預設同 `GMAIL_SMTP_USER` | 選填 |
| `OPENAI_API_KEY` | 呼叫 Whisper API 產生字幕用 | 選填（不設定則「產生字幕」按鈕會失敗，其餘功能不受影響） |

> **若 MySQL 也裝在同一台 NAS**：Container Manager 的容器預設跟 NAS 上其他套件（如 MariaDB）不在同一個 Docker network，`DB_HOST` 不能直接填 `localhost`。可行做法：
> - 用 NAS 的區網 IP（例如 `192.168.1.5`）＋ 該 MySQL 服務對外開放的埠號，或
> - 把 MySQL 也用 Docker 容器跑，兩個容器放進同一個 `docker-compose.prod.yml` 的自訂 network 裡（需要另外調整 compose 檔，非本文件預設範圍）。

### Google SSO 設定

系統只接受 **@xiyuebiomed.com.tw** 網域的 Google 帳號登入（其他網域會被擋下，顯示「僅限 @xiyuebiomed.com.tw 網域帳號登入」）。同仁第一次用 Google 登入成功後，系統會**自動建立**一個「一般」權限的帳號，不需要手動先在後台開帳號。

1. 到 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → 建立 OAuth 2.0 用戶端 ID → 應用程式類型選 **Web 應用程式**
2. 「已授權的重新導向 URI」加入：
   ```
   https://<你對外的網域或NAS位址>/api/auth/callback/google
   ```
   本機測試則另外加：`http://localhost:3000/api/auth/callback/google`
3. 建立後把 **用戶端 ID** 和 **用戶端密鑰** 填入 `.env` 的 `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
4. `AUTH_SECRET` 用以下指令產生一組隨機值：
   ```bash
   openssl rand -base64 33
   ```
5. 因為容器跑在反向代理/Docker 後面，`AUTH_TRUST_HOST` 一定要設成 `true`，否則登入時會因為 Host header 不被信任而失敗
6. **務必同時設定 `AUTH_URL`**（例如 `https://video-edu.xiyuebiomed.com.tw`）。用 Cloudflare Tunnel 等反向代理時，Auth.js 有時無法從轉發的 request 正確判斷對外網址，會退回用容器自己的 bind address 組出 `http://0.0.0.0:3000/...` 這種網址，導致登入後跳回錯誤的網址、顯示 `error=Configuration`。設定 `AUTH_URL` 直接指定正確網址即可解決

## 步驟 3：在 Container Manager 建立 Project

1. 開啟 **Container Manager** → 左側「專案」（Project）→「新增」
2. 專案名稱：`video_edu_platform`
3. 路徑：選擇 `/docker/video_edu_platform/`（步驟 1 建立的資料夾）
4. Container Manager 會自動偵測到資料夾內的 `docker-compose.prod.yml`
5. 下一步會出現「網路服務入口」設定，可略過或依需求設定反向代理
6. 確認畫面會列出即將建立的服務（`app`）與讀到的環境變數，檢查 `.env` 內容有正確帶入
7. 按「完成」開始建置並啟動

> `docker-compose.prod.yml` 裡 `image:` 直接寫完整路徑 `ghcr.io/finrod-chen/video_edu_platform:latest`，Container Manager 會照這個路徑直接向 GHCR 拉取，**不需要**額外在「登錄檔」設定裡新增 ghcr.io。

## 步驟 4：驗證部署

容器啟動後，瀏覽：

```
http://<NAS的IP>:<PORT>/api/health/db
```

- 回傳 `{"status":"ok","result":[{"ok":1}]}` → 資料庫連線正常
- 回傳 `{"status":"error","message":"Missing MySQL connection env vars..."}` → `.env` 沒有被正確讀到，檢查檔案是否確實放在專案資料夾內、變數名稱是否打錯
- 回傳其他連線錯誤（如 `ECONNREFUSED`）→ 檢查 `DB_HOST`/`DB_PORT` 是否可從容器內連通、MySQL 帳號權限是否允許該來源 IP 連線

接著瀏覽首頁 `http://<NAS的IP>:<PORT>/` 確認頁面正常渲染。

## 更新資料庫結構（既有部署要手動跑一次）

`db/schema.sql` 每次加新功能，**已經跑過舊版 `schema.sql` 的資料庫**不會自動套用新結構，需要手動依序執行對應的 migration：

```bash
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/002_manual_steps.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/003_folders_and_roles.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/004_acknowledgments_assignments.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/005_quizzes.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/006_caption_status.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/007_step_acknowledgments.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/008_step_edit_data.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/009_step_edit_lock.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/010_manual_daily_visits.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/011_manual_attachments.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/012_step_media_type.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/013_assignment_scope.sql
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < db/migrations/014_users_status_and_email_pref.sql
```

新安裝（空資料庫）直接跑最新的 `db/schema.sql` 即可，不需要另外跑這些 migration。

## 更新版本（拉取新 image）

每次 `git push` 到 `master` 後，GitHub Actions 會自動 build 新的 image 並推到 GHCR（tag: `latest` 與 `:<短 commit sha>`）。要讓 NAS 上的容器使用新版本：

1. Container Manager → 專案 → `video_edu_platform` → 「動作」→「建置」（會重新 `pull` 最新 `latest` image 並重啟容器）

或用 SSH 登入 NAS 手動執行：

```bash
cd /volume1/docker/video_edu_platform   # 依實際掛載路徑調整
sudo docker compose -f docker-compose.prod.yml pull
sudo docker compose -f docker-compose.prod.yml up -d
```

## 常見問題

- **Image 拉不下來 / 403**：到 GitHub 該 package 的 Package settings 確認 `video_edu_platform` 的可見性是 Public（首次發布有時不會自動繼承 repo 的 public 設定）。
- **埠號衝突**：DSM 本身常佔用 5000/5001，一般不影響 3000，但若 NAS 上已有其他服務用 3000，改 `.env` 裡的 `PORT` 即可。
- **容器一直重啟**：查看 Container Manager 裡該容器的 Log，多半是 `.env` 缺值或 DB 連不上，對照上面「步驟 4」排查。
- **登入時出現 `redirect_uri_mismatch`**：Google Cloud Console 裡設定的「已授權的重新導向 URI」跟實際存取網址不一致，確認是 `https://<實際網域>/api/auth/callback/google`（協定、網域、路徑都要完全對上）。
- **登入後立刻被導回 `/login` 並顯示「僅限 @xiyuebiomed.com.tw 網域帳號登入」**：正常行為，代表登入的 Google 帳號不屬於公司網域，換公司帳號重新登入即可。
- **登入一直失敗，畫面顯示「登入失敗，請再試一次」**：通常是 `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` 沒填或填錯，或 `AUTH_TRUST_HOST` 沒設成 `true`。
- **登入後跳到 `http://0.0.0.0:3000/login?error=Configuration`**：
  1. 確認 `.env` 有設 `AUTH_URL=https://<你的真實網域>`（見上方「Google SSO 設定」第 6 點），改完要 `docker compose up -d` 或在 Container Manager 重啟容器，**改 `.env` 不會自動套用**。
  2. 排除以上之後如果還是同樣的錯誤，`error=Configuration` 很可能是登入時自動建立帳號那段程式連不上資料庫（Google 端已經成功回呼，卡在我們自己的伺服器邏輯）。先用瀏覽器打 `https://<你的網域>/api/health/db` 確認資料庫連線正常，再到 Container Manager 看該容器的 Log，搜尋 `[auth] failed to provision user from Google profile` 這行，後面會印出真正的錯誤原因（例如 DB 帳密錯誤、連線被拒等）。
