---
name: brick-breaker-publish
description: "為 PythonSDD 的敲磚塊網站執行行動版檢查、建置、Sites 版本保存、PR 交付與公開發佈；當需要驗證或發布 web/ 時使用。"
metadata:
  short-description: "行動版敲磚塊網站檢查與 Sites 公開發佈"
---

# 敲磚塊網站發佈

這是 `PythonSDD` 專案的本地發佈技能。網站來源是 `web/`；根目錄的 `Day1/`、`Day2/` 與 `requirements.txt` 是教學版本，除非需求明確指向它們，否則不要刪除、搬移或重構。

## 執行原則

- 先檢查來源與品質，再保存 Site 版本；沒有明確的「公開發佈／部署」要求時，停在驗證與準備階段，不覆蓋目前公開網站。
- 只重用 `web/.openai/hosting.json` 中已存在的 `project_id`。不要捏造、重排、替換或把 Site ID 寫死在技能中；設定檔缺少正式 ID 時先停止並要求確認。
- 不把 token、cookie、短期認證、環境秘密或本機絕對路徑寫入 repo、技能、commit、封存檔或回報內容。
- 不因這個靜態遊戲啟用 D1、R2、Auth、資料庫、登入、音效、多關卡或新的遊戲引擎。

## 發佈前檢查

### 1. 確認範圍與來源

1. 確認目前分支與變更範圍；若是新功能，使用 `NNN-short-name` 格式的功能分支。
2. 讀取 `specs/003-mobile-web-optimization/`（或目前對應的功能規格），確認程式、任務與驗收狀態一致。
3. 只在 `web/` 執行網站命令；不要把根目錄當成 Sites 專案。
4. 讀取 `web/.openai/hosting.json`，確認 `project_id` 是既有且可使用的 Sites 識別。
5. 先確認 `web/` 是否是 Sites 使用的獨立來源 repository；目前專案可能同時有父 repo 與 `web/.git`，保存 Site 版本時必須使用「已推送的網站來源 repo」commit，不可誤用只包含父 repo 文件的 commit。

### 2. 行動版品質閘門

確認 `web/app/page.tsx`、`web/app/globals.css` 與 `web/app/layout.tsx` 具備以下行為：

- Canvas 邏輯座標仍為 800×600，顯示比例為 4:3；不建立第二套手機遊戲規則。
- `(pointer: coarse)` 或寬度不超過 640px 時顯示向左、發球／重玩、向右控制；主要觸控目標至少 44px。
- 左右按鈕使用 Pointer Events；按住時移動、放開時停止，並處理 `pointerup`、`pointercancel`、`lostpointercapture`、window blur 與 document hidden。
- 觸控發球／重玩與鍵盤 Space 共用相同行為；桌面 Space、方向鍵與 A／D 不可回歸失效。
- viewport 使用裝置寬度與 `viewport-fit=cover`；CSS 有安全區、`100dvh`、水平溢出保護與低高度橫向版面處理。
- 觸控控制有中文 `aria-label`、可見 focus 樣式；`#game-status` 保留 `role="status"` 與 `aria-live="polite"`。

可用下列靜態檢查確認關鍵項目：

```bash
rg -n "touch-controls|handleTouchStart|handleTouchEnd|setPointerCapture|viewportFit|safe-area-inset|100dvh" \
  web/app/page.tsx web/app/globals.css web/app/layout.tsx
```

### 3. 建置與回歸檢查

在 `web/` 依序執行：

```bash
npm run lint
./node_modules/.bin/tsc --noEmit
npm run build
```

回到 repo 根目錄後，至少執行：

```bash
python3 -m py_compile Day1/*.py Day2/*.py
```

如果建置或既有 Python 語法檢查失敗，不得進入 Sites 版本保存或部署。

### 4. 人工驗收閘門

在 `http://localhost:3000/` 或對應的預覽環境檢查：

1. 360px 直向視窗沒有水平溢出，遊戲畫布、狀態與控制列都在可見／可捲動範圍內。
2. 按「發球」後球開始運動；按住左右按鈕可移動底板，放開、滑出、取消或切頁返回後不會卡住。
3. 勝利或 Game Over 後按「重玩」，磚塊、生命、分數與球回到初始狀態。
4. 低高度橫向視窗仍能操作；回到桌面後 Space、方向鍵與 A／D 仍可用。

若使用者尚未提供人工驗收結果，將狀態標為「待人工驗收」，不可宣稱行動版已公開。

## Sites 版本與部署

只有在上述檢查通過且使用者明確要求公開發佈時才繼續：

1. 若 `web/` 有獨立 `.git`，先在該網站來源 repo 提交並推送精確網站變更；父 repo 的 SDD／技能 commit 不可代替 Sites 來源 commit。不要以未推送或不同 commit 的本機檔案建立版本。
2. 依 Sites 工具建立封存檔／保存版本，並把 `commit_sha` 指向剛通過檢查的網站來源 commit。可使用目前 Sites 套件的 `package-site.sh` 產生網站封存檔。
3. 使用 Sites connector 的 `save_site_version` 保存版本；只部署已保存的版本，絕不直接部署未保存的來源。
4. 需要公開時使用 Sites connector 的 `deploy_site_version`，部署後以 `get_deployment_status` 輪詢到終止狀態；部署 URL 一律視為 production。
5. 驗證公開 URL 可存取且主要頁面載入，再回報 URL、版本與對應 commit；不要回報任何秘密。

如果使用者只要求「準備發布」「保存版本」或「本機驗證」，不要呼叫 production deploy。若使用者只要求行動版優化，也不要自行把新版本覆蓋既有公開站。

## PR 交付

- 變更應留在目前功能分支，提交訊息遵守 Conventional Commits，描述使用繁體中文，例如 `feat(web): 新增行動版觸控操作`。
- PR 內容應連結對應 `specs/003-mobile-web-optimization/`，並列出 lint、TypeScript、build、Python 語法檢查與人工驗收結果。
- 技能可以協助建立或更新 PR，但不得代替使用者合併；合併確認與分支清除依專案憲章另行完成。
- 若尚未完成行動裝置人工驗收，PR 必須清楚標示未完成項目，不得把「本機 build 成功」當成完整行動版驗收。

## 完成回報

簡潔回報以下項目：

- 行動版品質閘門與各項建置命令的結果。
- 使用的 Sites `project_id` 來源是 `web/.openai/hosting.json`（不要在不必要時重複公開完整識別）。
- Site 版本是否已保存、是否已部署，以及對應 commit。
- PR 連結與尚待使用者人工驗收／合併的項目。
