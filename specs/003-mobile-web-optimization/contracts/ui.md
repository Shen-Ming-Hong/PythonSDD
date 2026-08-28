# 介面契約：敲磚塊行動版與發佈技能

本契約描述可由玩家或維護者觀察到的介面，不是對外 HTTP API。遊戲規則仍由 `web/app/game.ts` 管理。

## 遊戲輸入契約

| 介面 | 觸發 | 預期結果 |
|------|------|----------|
| `Space` | keydown 且非 repeat | 未開始時發球；勝利／Game Over 時完整重玩；阻止瀏覽器捲動 |
| `ArrowLeft`／`A` | keydown／keyup | 分別設定／清除 `InputState.left` |
| `ArrowRight`／`D` | keydown／keyup | 分別設定／清除 `InputState.right` |
| 「向左移動底板」 | pointerdown／pointerup／pointercancel | 按住時設定 `left`，放開或取消時清除 `left` |
| 「向右移動底板」 | pointerdown／pointerup／pointercancel | 按住時設定 `right`，放開或取消時清除 `right` |
| 「發球」／「重玩」 | click | 與 Space 共用相同的發球或完整重玩行為，焦點回到遊戲區 |
| window blur／document hidden | lifecycle event | 同時清除 `left` 與 `right` |

## DOM／可及性契約

- 遊戲區為可聚焦的 `role="group"`，並有描述遊戲操作的 `aria-label`。
- 左右控制按鈕的 `aria-label` 必須分別為可理解的向左／向右移動說明；中央按鈕依狀態表達發球或重新開始。
- `#game-status` 使用 `role="status"` 與 `aria-live="polite"`，播報生命、分數及勝負結果。
- 結果畫面必須告知可用 Space 或觸控按鈕重新開始；觸控按鈕有 `:focus-visible` 樣式。

## 響應式契約

- Canvas 的邏輯尺寸固定為 800×600，顯示尺寸可隨容器寬度縮放，比例固定為 4:3。
- 在 `(pointer: coarse)` 或 `max-width: 640px` 下，觸控控制列可見；其三個主要控制目標至少 44px。
- 360px 寬直向視窗不可產生水平溢出；低高度橫向視窗縮減上下間距但不隱藏遊戲與控制。
- 使用 `viewport-fit=cover` 時，內容與控制列需納入 `safe-area-inset`。

## 發佈技能契約

技能名稱：`$brick-breaker-publish`

技能啟用後必須依序：

1. 確認目前是在功能分支，並讀取 `web/` 與本功能文件。
2. 檢查 viewport、觸控輸入清除、44px 控制目標、4:3 畫布、窄螢幕與橫向樣式。
3. 執行 `npm run lint`、`./node_modules/.bin/tsc --noEmit`、`npm run build`。
4. 讀取 `web/.openai/hosting.json` 的既有 `project_id`，不把秘密寫入任何檔案。
5. 建立可對應已驗證 commit 的 Sites 版本；沒有明確公開要求時停在準備／保存階段。
6. 若使用者明確要求公開，才執行部署、輪詢結果與網址驗證；PR 只送出，不代替使用者合併。
