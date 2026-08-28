# 資料模型：敲磚塊行動版體驗與發佈流程

本功能不新增資料庫或持久化資料。以下模型描述瀏覽器記憶體中的遊戲狀態、輸入橋接與可追蹤的網站版本。

## 遊戲狀態（`GameState`）

| 欄位 | 型別 | 規則 | 來源 |
|------|------|------|------|
| `bricks` | `Brick[]` | 45 個磚塊；`alive` 決定是否繪製與碰撞 | `resetGame()`／`updateGame()` |
| `paddle` | `Paddle` | 以 800×600 邏輯座標移動，x 值限制在畫布內 | `updateGame()` |
| `ball` | `Ball` | 未發球時跟隨底板；發球後依速度更新 | `handleSpace()`／`updateGame()` |
| `lives` | `number` | 初始 3；掉球遞減，最低為 0 | `updateGame()` |
| `score` | `number` | 初始 0；每個磚塊增加 10 | `updateGame()` |
| `gameOver` | `boolean` | 生命歸零時為 `true` | `updateGame()`／`resetGame()` |
| `gameWon` | `boolean` | 最後一塊磚被清除時為 `true` | `updateGame()`／`resetGame()` |

### 不變條件

- `gameOver` 與 `gameWon` 不可同時為 `true`。
- `gameOver` 或 `gameWon` 為 `true` 時，`updateGame()` 不再移動任何物件。
- `handleSpace()` 在終止狀態回傳完整的 `resetGame()` 結果；其他狀態只將球標記為已發球。
- 觸控與鍵盤只改變輸入，不直接改變磚塊、生命或分數。

## 輸入狀態（`InputState`）

| 欄位 | 型別 | 啟動來源 | 清除來源 |
|------|------|----------|----------|
| `left` | `boolean` | ArrowLeft／A keydown、左觸控 `pointerdown` | 對應 keyup／pointerup／pointercancel／lostpointercapture、blur、visibilitychange、遊戲終止 |
| `right` | `boolean` | ArrowRight／D keydown、右觸控 `pointerdown` | 對應 keyup／pointerup／pointercancel／lostpointercapture、blur、visibilitychange、遊戲終止 |

### 觸控事件生命週期

```text
pointerdown → setPointerCapture → InputState[direction] = true
     ├─ pointerup       ─┐
     ├─ pointercancel   ─┤→ InputState[direction] = false
     └─ lostpointercapture┘

window blur / document hidden / game over → left = false, right = false
```

若在終止回合收到新的觸控按下，系統不啟動方向輸入；重玩入口仍透過 `handleSpace()` 完整重置狀態。

## 網站版本（Sites 交付模型）

| 欄位 | 型別 | 規則 |
|------|------|------|
| `project_id` | `string` | 從 `web/.openai/hosting.json` 讀取；必須是正式存在的 Sites 專案識別 |
| `source_commit` | `string` | 建立版本前已通過品質檢查的 Git commit SHA |
| `archive` | `path` | 由 `web/` 產生的網站來源封存檔；不得包含認證秘密 |
| `deployment_status` | `enum` | `準備中`、`已保存`、`已部署`、`驗證失敗`；未明確要求公開時最多到 `已保存` |

### 版本交付不變條件

- `project_id` 不存在或無法確認時，不能進入保存與部署。
- `archive` 只包含網站來源與建置必要檔案，不包含 token、cookie 或本機秘密。
- `已部署` 必須對應已通過 lint、TypeScript、build 與行動版檢查的 `source_commit`。
- 本功能不把遊戲回合資料同步到 Sites；Sites 只保存網站版本。
