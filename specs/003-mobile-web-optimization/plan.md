# 實作計畫：敲磚塊行動版體驗與發佈流程

**分支**：`003-mobile-web-optimization` | **日期**：2026-08-28 | **規格**：[spec.md](./spec.md)

**輸入**：來自 `/specs/003-mobile-web-optimization/spec.md` 的功能規格。

## 摘要

本功能在不改變既有遊戲規則與公開網站專案識別的前提下，改善 `web/` 敲磚塊網站的行動裝置體驗。瀏覽器遊戲保留 800×600 內部座標與 4:3 畫布，新增使用 Pointer Events 的左右觸控按鈕，以及發球／重玩按鈕；桌面上的 Space、方向鍵與 A／D 操作維持不變。版面將處理裝置 viewport、瀏海安全區、動態視窗高度、窄螢幕與低高度橫向視窗。

同一個功能分支新增 `.agents/skills/brick-breaker-publish/` 專案技能，將目前 Sites 發佈經驗與 GitHub 其他專案中可移植的安全維護原則整理成可重複的檢查、建置、版本保存、PR 與公開部署流程。本次只建立與驗證流程，不因行動版修改而自動覆蓋既有公開網站。

## 技術背景

**語言／版本**：既有 Python 3.14.4 與 `pygame==2.6.1` 不變；網站使用 TypeScript、Next.js 16.2.6、React 19.2.6 與 Node.js `>=22.13.0`。

**主要依賴**：現有 Sites／Vinext 專案、React Pointer Events、瀏覽器內建 Canvas 2D 與 `requestAnimationFrame`；不新增套件。

**儲存**：不適用；遊戲狀態仍只存在頁面記憶體，發佈版本識別由既有 `web/.openai/hosting.json` 與 Git／Sites 版本管理。

**測試**：`npm run lint`、TypeScript `--noEmit`、`npm run build`、既有 Python 語法檢查，以及行動版瀏覽器人工驗收；不導入新的測試框架。

**目標平台**：支援 Pointer Events 的現代行動瀏覽器、現代桌面瀏覽器，以及 Sites 的 Cloudflare Workers 相容網站執行環境。

**專案類型**：既有 Python／Pygame 教學專案加上一個可公開發佈的單頁靜態網頁遊戲。

**效能目標**：遊戲仍以 60 FPS 為目標；觸控輸入在 pointer event 發生後直接更新共享輸入狀態，不增加輪詢或外部請求；行動版不應因 CSS 縮放複製另一份 Canvas。

**限制**：不改動 `Day1/`、`Day2/` 與 `requirements.txt`；不加入資料庫、登入、D1、R2、音效、手把、多關卡、排行榜或第三方遊戲函式庫；本次不直接公開部署新版本。

**規模／範圍**：一個首頁、一個共享 `InputState`、三個行動裝置控制按鈕、兩組行動版媒體查詢，以及一份專案本地發佈技能。

## 憲章檢查

*閘門：研究前與設計完成後均須通過。*

| 原則 | 狀態 | 本計畫的證據 |
|------|------|--------------|
| I. 逐步可執行的學習節奏 | 通過 | 先保留既有遊戲循環，再以一個共享輸入橋接加入觸控，最後補版面與交付檢查；每個切片均可本機驗收。 |
| II. 清楚可讀的 Python | 通過 | 不修改既有 Python 教學檔案；網頁端使用 `clearInput`、`handleSpacePress` 等描述性函式。 |
| III. 物件與遊戲迴圈責任清楚 | 通過 | `web/app/game.ts` 仍只負責遊戲規則；`web/app/page.tsx` 負責瀏覽器輸入、生命週期與繪製，觸控與鍵盤共用同一個 `InputState`。 |
| IV. 可觀察行為必須驗收 | 通過 | `quickstart.md` 列出 360px 直向、低高度橫向、觸控按住／放開／取消、發球、重玩與桌面回歸驗收；完成前仍須執行行動裝置人工測試。 |
| V. 以學習為中心的最小複雜度 | 通過（有界例外） | 網頁適配層已存在，本次只使用 React 事件與 CSS；不新增抽象層、套件或外部服務。 |
| VI. SDD 文件繁體中文標準 | 通過 | 本功能的規格、研究、資料模型、契約、快速驗收與任務均以繁體中文撰寫；程式識別字、命令與 API 名稱保留原文。 |
| VII. Spec Kit 分支與 PR 生命週期 | 通過 | 分支為 `003-mobile-web-optimization`，與 `specs/003-mobile-web-optimization/` 對應；完成後由此分支交付 PR，合併確認後才清理分支。 |

**閘門結果**：通過。這是既有網頁發佈適配層的行動版增強，不改變 Python／Pygame 教學主體，也不需要修訂憲章。

## 研究結論

研究細節記錄於 [research.md](./research.md)，本次採用以下決策：

1. 使用 Pointer Events 而非新增手勢套件；按鈕用 pointer capture 接住滑出按鈕的放開事件，並以 pointer cancel、capture 遺失與頁面生命週期事件清除輸入。
2. 維持單一 800×600 Canvas，使用 CSS `width: 100%` 與 `aspect-ratio: 4 / 3` 縮放，避免為手機建立不同遊戲座標或第二套碰撞邏輯。
3. 以 `(pointer: coarse)` 或 `max-width: 640px` 顯示觸控控制；觸控目標至少 44px，並以 `env(safe-area-inset-*)`、`100dvh` 與橫向低高度查詢處理行動瀏覽器差異。
4. 發佈技能只讀取既有 `web/.openai/hosting.json`；公開部署必須由使用者明確要求，且只部署已通過品質閘門並與 commit 對應的 Sites 版本。
5. 參考 GitHub 其他專案後，發佈技能補上變更範圍分類、1440×900／1024×768／390×844／844×390 固定 UI 矩陣、P0／P1／P2 review 判斷、修正後重新檢查，以及「CI／外部交付不可由本機 build 推定成功」的規則；Cloudflare、D1／R2、VSIX 與課程專用流程不納入。

## 設計

### 輸入與狀態

- `InputState` 維持 `{ left: boolean; right: boolean }`，不在 `game.ts` 新增觸控專用狀態。
- `handleTouchStart` 只在非終止回合設定對應方向為 `true`，並呼叫 `setPointerCapture`。
- `handleTouchEnd` 與 `onLostPointerCapture` 設定對應方向為 `false`；既有的 window blur、document visibilitychange 與遊戲結束清除整體輸入。
- `handleSpacePress` 是鍵盤 Space 與行動裝置發球／重玩按鈕共用的入口，更新遊戲狀態、HUD、結果提示並把焦點回到遊戲區。

### 版面與可及性

- `layout.tsx` 的 viewport 保留 `device-width` 與 `initialScale: 1`，新增 `viewportFit: 'cover'` 與深色 `themeColor`。
- `globals.css` 保留桌面樣式；行動查詢顯示觸控控制、設定 44px 以上按鈕、禁用遊戲區與控制區的瀏覽器手勢，並套用安全區與動態高度。
- 控制按鈕使用明確的中文 `aria-label`，狀態列仍使用 `role="status"`／`aria-live="polite"`；結果提示同時告知 Space 與觸控重玩入口。

### 專案發佈技能

- 技能放在 `.agents/skills/brick-breaker-publish/`，包含標準 `SKILL.md` 與 `agents/openai.yaml`，由 `skill-creator` 驗證。
- 技能順序為：確認功能分支與文件 → 檢查行動版條件 → 執行 lint／型別／build → 確認 `hosting.json` 的既有 project id → 建立可追蹤 Site 版本 → 依需求交付 PR／部署。
- 技能另會先分類變更影響範圍，並在任何修正後重讀 diff 與重跑受影響檢查；本機 review、PR／push 與 Sites production deploy 是分開的授權閘門。
- 認證 token 只可用短暫命令環境傳遞；技能不保存 token、不捏造 project id、不在未獲明確授權時公開部署。

## 研究與設計產物

- [research.md](./research.md)：repo 與 Sites 發佈做法的盤點、行動版輸入與 viewport 決策。
- [data-model.md](./data-model.md)：共享遊戲／輸入狀態與可追蹤網站版本的欄位與生命週期。
- [contracts/ui.md](./contracts/ui.md)：桌面、觸控、回合結果與發佈技能的可觀察介面契約。
- [quickstart.md](./quickstart.md)：本機建置、靜態行動版檢查與人工驗收步驟。

## 專案結構

### 本功能文件

```text
specs/003-mobile-web-optimization/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### 原始碼與技能

```text
web/
├── .openai/hosting.json       # Sites 專案識別
└── app/
    ├── game.ts                # 遊戲狀態與規則，不因行動版分叉
    ├── page.tsx               # Canvas、鍵盤與觸控輸入、HUD
    ├── globals.css            # 響應式版面、安全區與觸控控制
    └── layout.tsx             # viewport 與頁面 metadata

.agents/skills/brick-breaker-publish/
├── SKILL.md                   # 專案專用發佈流程
└── agents/openai.yaml         # 技能顯示名稱與預設提示
```

**結構決策**：沿用既有 `web/` 單頁網站，不建立 mobile backend、共享套件或獨立遊戲模組；觸控是瀏覽器輸入層，規則仍只在 `web/app/game.ts` 維護。發佈技能是專案維護工具，不與網站執行期程式耦合。

## 複雜度追蹤

| 項目 | 原因 | 已拒絕的較簡單替代方案 |
|------|------|------------------------|
| Pointer capture 與多個失焦清除入口 | 行動瀏覽器可能在手指滑出按鈕、來電或切換頁面時不發出一般放開事件；清除入口是避免底板卡住的必要保護。 | 只使用 `onPointerUp` 會留下卡住輸入，造成遊戲在玩家放手後仍自行移動。 |
| 專案本地發佈技能 | Sites 發佈、行動版驗證與 PR 交付需要可重複且不依賴記憶的檢查順序。 | 只寫一次性的 README 容易漏掉 `hosting.json` 重用、版本追蹤或秘密處理規則。 |
