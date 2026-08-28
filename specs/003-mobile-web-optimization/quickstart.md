# 快速驗收：敲磚塊行動版體驗與發佈流程

## 前置條件

- Node.js `>=22.13.0`
- 已安裝 `web/node_modules`
- 可在現代瀏覽器開啟本機網站
- 若要驗證技能格式，需能讀取 `/Users/user/.codex/skills/.system/skill-creator/scripts/quick_validate.py`

## 1. 靜態與建置檢查

```bash
cd web
npm run lint
./node_modules/.bin/tsc --noEmit
npm run build
```

預期：三個命令皆成功結束；不新增遊戲執行期 API、資料庫或外部服務依賴。

回到 repo 根目錄後，檢查既有 Python 教學檔案仍可編譯：

```bash
cd ..
python3 -m py_compile Day1/*.py Day2/*.py
```

## 2. 行動版程式檢查

確認以下內容存在且與契約一致：

```bash
rg -n "touch-controls|handleTouchStart|handleTouchEnd|setPointerCapture|viewportFit|safe-area-inset|100dvh" \
  web/app/page.tsx web/app/globals.css web/app/layout.tsx
```

預期：

- `page.tsx` 具有左右觸控、pointer capture、pointer cancel／capture 遺失清除與發球／重玩共用 handler。
- `layout.tsx` 有 `viewportFit: 'cover'`。
- `globals.css` 有 4:3 畫布、安全區、動態高度、觸控目標與低高度橫向規則。

## 3. 瀏覽器人工驗收（行動裝置或裝置模擬）

啟動本機網站：

```bash
cd web
npm run dev
```

在瀏覽器開啟 `http://localhost:3000/`，依序驗收：

| 編號 | 操作 | 預期結果 | 狀態 |
|------|------|----------|------|
| M-001 | 使用 360px 寬直向視窗開啟首頁 | 無水平捲動；遊戲畫布維持 4:3；左右與中央按鈕都在畫面內 | 使用者回報通過 |
| M-002 | 按下「發球」 | 球開始運動，生命與分數文字可見 | 使用者回報通過 |
| M-003 | 按住左／右按鈕至少 1 秒，再放開 | 底板向對應方向移動；放開後停止，不會卡住 | 使用者回報通過 |
| M-004 | 按住方向按鈕後滑出、取消觸控或切換分頁再回來 | 輸入被清除，底板不會自行持續移動 | 使用者回報通過 |
| M-005 | 觸發勝利或 Game Over 後按「重玩」 | 磚塊、生命、分數與球回到初始狀態 | 使用者回報通過 |
| M-006 | 使用低高度橫向手機視窗 | 上下間距縮小；遊戲區與控制仍可使用 | 使用者回報通過 |
| M-007 | 回到桌面寬度使用 Space、方向鍵、A／D | 原有鍵盤操作仍可使用，規則沒有變化 | 使用者回報通過 |

**人工驗收紀錄**：2026-08-28，使用者回報 M-001 至 M-007 均已完成且未發現問題；本文件不補寫未實際取得的裝置型號、瀏覽器版本或截圖證據。

## 4. 專案技能格式檢查

在 repo 根目錄執行：

```bash
python3 /Users/user/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .agents/skills/brick-breaker-publish
```

預期：顯示技能通過格式驗證；`SKILL.md` 與 `agents/openai.yaml` 均存在，技能名稱為 `brick-breaker-publish`。

## 5. 發佈前置條件

只有在 M-001 至 M-007 與建置檢查通過、且使用者明確要求公開部署後，才可依 `.agents/skills/brick-breaker-publish/SKILL.md`：

1. 讀取 `web/.openai/hosting.json` 的既有 `project_id`。
2. 以已驗證的 Git commit 保存 Sites 版本。
3. 送出功能分支 PR；不在技能內自動合併。
4. 部署後驗證公開網址的 HTTP 狀態與主要頁面可載入性。

本次功能已依明確要求完成來源驗證、Sites 版本保存與公開部署；部署後公開首頁 HTTP 狀態為 200。PR 仍須依專案憲章完成審查與合併。
