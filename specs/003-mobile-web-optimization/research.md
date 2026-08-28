# 研究：敲磚塊行動版體驗與發佈流程

## 研究範圍

本次檢查目前 repo 的技能目錄、現有 `web/` Sites 專案與前一個公開發佈功能，判斷哪些做法適合行動版增強。研究只處理本專案已有的本地資料與 Sites 工作流程，不引入外部服務或新的遊戲框架。

## Repo 技能盤點

### 觀察

- 根目錄 `.agents/skills/` 目前只有 `speckit-*` SDD 技能，沒有其他可直接複用的專案發佈技能。
- 同一個 Desktop 專案範圍內沒有找到其他兄弟專案的 `.agents/skills/*/SKILL.md` 發佈實作。
- 可用的 Sites 建站／託管技能提供現有 `web/.openai/hosting.json`、建置、版本保存與公開部署的標準流程。
- 前一個 `002-web-game-publish` 功能已證明 `web/` 隔離、Sites 專案識別保存與公開網址驗收適合此 repo。

### 決策

建立本專案專用 `.agents/skills/brick-breaker-publish/`，以 Sites 流程為發布骨架，補上本專案的行動版檢查、既有 project id 重用、品質閘門與「未明確要求不部署」規則。

### 替代方案

- **只沿用通用 Sites 技能**：不足以檢查觸控放開、安全區、窄螢幕與行動版人工驗收。
- **新增通用部署腳本或 CI 服務**：目前只有一個靜態網站，會增加維護與秘密管理複雜度，超出需求。
- **直接修改既有 `002` 文件**：會把已公開版本的歷史驗收與尚未公開的行動版變更混在一起，降低需求追蹤清楚度。

## 行動輸入研究

### 決策

使用瀏覽器原生 Pointer Events：

- `pointerdown` 設定共享 `InputState` 的方向旗標，並使用 pointer capture。
- `pointerup`、`pointercancel` 與 `lostpointercapture` 清除旗標。
- 既有的 window blur、document visibilitychange 與遊戲終止流程清除全部旗標。
- 觸控發球／重玩與鍵盤 Space 共用一個 handler，避免兩條重置路徑產生差異。

### 理由

Pointer Events 同時涵蓋滑鼠、觸控筆與觸控，不需要加入手勢套件。Pointer capture 能讓玩家手指短暫滑出按鈕時仍收到放開事件；生命週期清除則處理來電、切頁與瀏覽器取消觸控等非正常結束。

### 替代方案

- **只監聽 `touchstart`／`touchend`**：需要處理多套事件模型，也容易漏掉取消與 capture 遺失。
- **點擊左右按鈕一次移動固定距離**：手機上不利於持續控制，且與桌面按住方向鍵的操作模型不一致。
- **在 Canvas 上追蹤手指座標**：會新增座標轉換與手勢狀態，超出目前最小需求。

## 響應式版面研究

### 決策

- 保留單一 800×600 Canvas，使用 CSS `width: 100%` 與 `aspect-ratio: 4 / 3` 縮放。
- viewport 使用 `device-width`、`initialScale: 1` 與 `viewport-fit: cover`。
- 行動版使用 `env(safe-area-inset-*)`，並以 `100dvh` 搭配 `100vh` fallback。
- 在 `(pointer: coarse)` 或 `max-width: 640px` 顯示控制列；觸控按鈕至少 44px。
- 以 `max-height: 560px` 且橫向的查詢縮短上下間距，不強制鎖定方向。

### 理由

遊戲規則與畫布座標不應因裝置尺寸改變；CSS 縮放可以讓同一份繪製與碰撞邏輯在手機與桌面共用。安全區與動態高度是行動瀏覽器的版面邊界，不需要引入額外套件。

### 替代方案

- **依裝置建立另一個 Canvas 尺寸與遊戲規則**：會產生兩套碰撞與速度行為，降低回歸可信度。
- **使用 CSS `transform: scale`**：可能造成實際布局尺寸與觸控命中區不同，直接以寬度與比例布局更可預期。
- **鎖定 portrait**：會限制橫向手機使用場景，且不必要。

## Sites 發佈研究

### 決策

技能遵循以下安全順序：

1. 從 `web/.openai/hosting.json` 讀取既有 `project_id`；沒有正式識別時停止並要求建立／確認，不自行捏造。
2. 在 `web/` 來源上完成行動版檢查、lint、TypeScript 與 production build。
3. 以已驗證的 Git commit 建立可追蹤 Sites 版本；認證只在短暫命令環境存在。
4. 只有使用者明確要求公開部署時才更新公開版本；部署後檢查網址可存取並回報版本對應。

### 理由

現有網站已使用正式 Sites 專案。重用 project id 能避免建立孤立網站；先 build 再保存版本能避免把未通過編譯的來源送出；把部署與驗證分開則能支援使用者先人工測試行動版。

### 不採用

- 不把目前公開 URL、token、cookie 或短期認證寫死在技能。
- 不因建立技能而自動部署新版本。
- 不為沒有 D1、R2、Auth 需求的遊戲新增 add-on。

## 結論

目前最適合的方案是「既有 Sites 發佈流程 + 專案本地行動版品質閘門」。它保留既有網頁遊戲與公開專案的追蹤方式，只在瀏覽器輸入與 CSS 版面層增加必要能力，並把發佈前的行動版檢查固定下來。
