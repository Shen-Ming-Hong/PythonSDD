# 任務：公開網頁版敲磚塊遊戲

**輸入**：設計文件位於 `/specs/002-web-game-publish/`。

**前置條件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/`、`quickstart.md`。

**測試策略**：規格未要求導入 TDD 或新的測試框架；依憲章執行 Sites 建置、既有 Python 語法／檔案回歸檢查，以及由使用者完成的瀏覽器人工驗收。

**組織方式**：任務依 P1／P2 使用者故事排列；每個故事完成後都能依自己的獨立驗收情境確認結果。最後的公開部署任務是人工測試通過後才可執行的交付閘門。

## 任務格式

- `[P]`：可與同階段其他任務平行執行，且不會同時修改相同檔案。
- `[US1]`、`[US2]`、`[US3]`：任務所屬的使用者故事。
- 每個任務都指定實際檔案路徑，並依執行順序使用連續任務編號。

## 階段 1：準備

**目的**：建立獨立的 Sites 網站專案，確認既有桌面教學版本可作為規則基準。

- [X] T001 在 `web/` 使用 `@openai/create-sites@0.2.0` 建立 Sites 專案，保留產生的 `web/package.json` 與對應 lockfile，且不初始化根目錄網站。
- [X] T002 [P] 確認 `Day2/prj07_win.py`、`Day2/prj06_lives_restart.py` 與 `requirements.txt` 的既有內容與可執行基準，作為網頁規則對照，不修改這些檔案。
- [X] T003 確認 `web/.gitignore` 覆蓋 `node_modules/`、`dist/`、`.env*` 與 `*.log`，並保留 `web/.openai/hosting.json` 等必要部署設定。

## 階段 2：基礎設施與最小可見切片

**目的**：完成網站建置設定、共用遊戲狀態模型與能被看見的初始頁面；本階段完成前不進行完整回合功能。

- [X] T004 在 `web/vite.config.*` 維持 Sites plugin 與 Cloudflare Workers 相容輸出設定，並確認 `web/package.json` 的 `dev` 與 `build` scripts 可用。
- [X] T005 在 `web/app/game.ts` 建立 800×600 邏輯座標、45 塊磚、底板、球與 `GameState` 型別／建立函式，包含 3 次生命、0 分與完整 `resetGame()` 初始狀態。
- [X] T006 在 `web/app/layout.tsx`、`web/app/page.tsx` 與 `web/app/globals.css` 建立單頁遊戲入口、Canvas／遊戲容器、標題、操作提示、生命／分數狀態區與基本桌面版面。
- [X] T007 使用 `web/package.json` 執行第一次 `npm run build`，以 `web/app/page.tsx` 的初始切片確認路由可編譯且沒有 starter placeholder 阻擋遊戲頁面。

**檢查點**：本機頁面能顯示遊戲專屬入口、45 塊磚、底板、等待發球的球與初始狀態，且不影響根目錄 Python 專案。

## 階段 3：使用者故事 1－從公開網址開始遊戲（優先級：P1）🎯 MVP

**目標**：訪客能在桌面瀏覽器載入遊戲並以鍵盤完成發球、移動、碰撞與計分。

**獨立驗收**：依 `specs/002-web-game-publish/quickstart.md` 的情境一至三，在本機預覽中確認公開入口、初始資料、Space、Left／Right、A／D、邊界、碰撞與 10 分計分。

### 使用者故事 1 實作任務

- [X] T008 [US1] 在 `web/app/page.tsx` 集中處理 Space、Left／Right、A／D 與 Escape 鍵盤事件，建立按鍵狀態、遊戲焦點與阻止 Space 預設捲動的行為。
- [X] T009 [US1] 在 `web/app/game.ts` 實作以 60 FPS 為基準的經過時間更新，完成等待發球、底板邊界、球的牆面反彈與球遺失判定。
- [X] T010 [US1] 在 `web/app/game.ts` 實作底板／磚塊碰撞、矩形重疊方向判定、每塊磚只移除一次與每塊 10 分計分，對齊 `Day2/prj07_win.py` 的既有規則。
- [X] T011 [US1] 在 `web/app/page.tsx`、`web/app/globals.css` 與 `web/app/layout.tsx` 完成進行中畫面繪製、生命／分數同步、操作提示、遊戲容器標籤與桌面視窗縮放。
- [X] T012 [US1] 依 `specs/002-web-game-publish/quickstart.md` 執行使用者故事 1 的本機建置與初始／操作／碰撞 smoke check，確認 `web/package.json` 建置成功且根目錄 `Day2/prj07_win.py` 未被修改。

**檢查點**：訪客能載入單頁、發球、控制底板、擊破磚塊並看到正確分數；使用者故事 1 可獨立展示。

## 階段 4：使用者故事 2－完成或結束一局並重新開始（優先級：P1）

**目標**：玩家清板或耗盡生命後能看見正確且凍結的結果，並用 Space 開始新回合。

**獨立驗收**：依 `specs/002-web-game-publish/quickstart.md` 的情境四至六，分別驗證 You Win、Game Over、10 秒凍結與完整重玩。

### 使用者故事 2 實作任務

- [X] T013 [US2] 在 `web/app/game.ts` 實作球遺失後扣生命／重置、生命歸零進入 `gameOver`、最後一塊磚計分後進入 `gameWon`，並保證兩個終止旗標互斥。
- [X] T014 [US2] 在 `web/app/game.ts` 封鎖終止狀態的物件更新與碰撞，並讓 `resetGame()` 同時重建 45 塊磚、底板、球、生命、分數與終止旗標。
- [X] T015 [US2] 在 `web/app/page.tsx` 與 `web/app/globals.css` 繪製 `You Win`、`Game Over` 與 `Press SPACE to restart`，保留最終狀態，並只讓終止畫面的 Space 觸發重置。
- [X] T016 [US2] 在 `web/app/layout.tsx`、`web/app/page.tsx` 與 `web/app/globals.css` 補足可讀的生命／分數／結果狀態文字與 ARIA 更新，確認焦點、縮放與非重置按鍵不會改變終止回合。
- [X] T017 [US2] 依 `specs/002-web-game-publish/quickstart.md` 執行使用者故事 2 的本機建置與狀態 smoke check，確認勝利、Game Over、凍結與重玩流程均可被人工測試。

**檢查點**：使用者故事 1 與使用者故事 2 都可在本機獨立展示，且結果互斥、畫面凍結、Space 可完整重置。

## 階段 5：使用者故事 3－準備並驗證公開發佈（優先級：P2）

**目標**：完成公開網站所需的內容、metadata、Sites 設定與建置交付物；正式公開部署必須等待人工測試通過。

**獨立驗收**：確認網站建置成功、網站頁面有專屬標題／描述、Sites 專案設定不含不需要的 add-on，並可從部署檔案交接到公開發佈流程。

### 使用者故事 3 實作任務

- [X] T018 [US3] 在 `web/app/layout.tsx` 設定遊戲專屬頁面標題、描述、Open Graph／X 基本 metadata 與語言設定；本版本不增加額外社群預覽圖片，保留 Sites starter 的網站圖示。
- [X] T019 [US3] 在 `web/.openai/hosting.json` 確認 Sites 專案 metadata 只包含本功能必要設定，不加入 D1、R2、Auth 或秘密；若 Sites 尚未產生 project id，保留給發佈階段建立，不自行編造識別值。
- [X] T020 [US3] 在 `web/package.json` 執行最終 `npm run build`，確認建置輸出、靜態資產、metadata 與 Sites hosting 設定可被交付流程使用。
- [X] T021 [US3] 依 `specs/002-web-game-publish/quickstart.md` 完成本機建置、頁面回應與既有 `Day2/prj06_lives_restart.py`／`Day2/prj07_win.py` 回歸檢查，並將可由工具確認的結果記錄在 `specs/002-web-game-publish/quickstart.md`。
- [ ] T022 [US3] **人工測試已通過，執行公開發佈**：使用 Sites 建立／沿用 `web/.openai/hosting.json` 的網站、保存已驗證版本、公開部署並在未登入新瀏覽器視窗驗證公開網址。

## 階段 6：收尾與跨情境驗證

**目的**：整理 SDD 追溯、確認舊版本保留，並留下人工測試與後續公開部署的清楚邊界。

- [X] T023 [P] 在 `specs/002-web-game-publish/spec.md`、`specs/002-web-game-publish/plan.md`、`specs/002-web-game-publish/data-model.md`、`specs/002-web-game-publish/contracts/ui.md` 與 `specs/002-web-game-publish/quickstart.md` 交叉確認術語、數值與按鍵行為一致。
- [X] T024 在 `specs/002-web-game-publish/quickstart.md` 補登工具可完成的建置／回應／回歸結果，保留需由使用者執行的 SC-001～SC-007 人工結果為待測試，並在 `specs/002-web-game-publish/tasks.md` 保留 T022 的人工測試閘門。

## 依賴與執行順序

### 階段依賴

- 階段 1 可立即開始；T002 可與 T001 平行，T003 依賴 T001 的 `web/` 建立。
- 階段 2 依賴 T001、T003；T004～T006 建立網站與模型，T007 必須在最小切片完成後執行。
- 階段 3 依賴階段 2；T008～T011 必須依序整合輸入、更新、碰撞與繪製，T012 為故事 1 檢查點。
- 階段 4 依賴 T012；T013～T016 依序完成終止狀態與可見結果，T017 為故事 2 檢查點。
- 階段 5 的 T018～T021 依賴 T017；T022 必須等待使用者完成所有人工測試並另行確認公開發佈。
- 階段 6 依賴 T021；T023 可與 T024 平行，但都不得修改既有 Python 檔案。

### 使用者故事依賴

- **使用者故事 1（P1）**：依賴基礎切片；提供可獨立遊玩的 MVP。
- **使用者故事 2（P1）**：依賴使用者故事 1 的回合更新與碰撞；不增加外部服務。
- **使用者故事 3（P2）**：依賴使用者故事 1 與 2 的本機建置和人工可測試版本；T022 另依賴使用者人工測試通過。

### 平行執行機會

- T002 只讀取既有 Python 基準，可與網站初始化 T001 平行。
- T023 只做 SDD 文件一致性檢查，可與不修改相同文件內容的回歸檢查安排平行；同一份文件若需修改仍必須序列處理。
- 不將 T008～T016 標記為平行，因為它們會依序修改並整合 `web/app/game.ts`、`web/app/page.tsx` 與介面狀態。

## 實作策略

### MVP 優先

1. 完成階段 1～2，讓網頁頁面能載入並顯示初始遊戲。
2. 完成使用者故事 1，先交付可發球、移動、碰撞與計分的本機版本。
3. 完成使用者故事 2，補上完整勝利／失敗／重玩流程。
4. 完成使用者故事 3 的 metadata、Sites 設定與建置交付準備。
5. **人工測試通過後執行 T022，完成 Sites 公開部署並驗證公開網址。**

### 增量交付

1. 每個階段完成後先驗證目前 checkpoint，再進入下一階段。
2. 保持 `Day2/` 與 `requirements.txt` 不變，網頁邏輯只在 `web/` 內增量建立。
3. 人工測試若發現問題，先回到對應故事任務修正並重新建置，再考慮 T022 公開發佈。

## 追溯摘要

| 需求／成功標準／設計來源 | 對應任務 |
|--------------------------|----------|
| FR-001：公開網址可直接進入遊戲 | T001、T006、T018、T019、T022 |
| FR-002：45 塊磚、3 次生命、0 分初始狀態 | T005、T006、T012、T021 |
| FR-003：Space、Left／Right、A／D 控制 | T008、T011、T012 |
| FR-004：牆面／底板／磚塊碰撞與 10 分計分 | T009、T010、T012 |
| FR-005：球遺失、扣生命與 Game Over | T009、T013、T017 |
| FR-006：最後一塊磚計分後進入勝利 | T010、T013、T015、T017 |
| FR-007：結果文字與最終分數／生命保留 | T015、T016、T017 |
| FR-008：終止狀態凍結 | T013、T014、T015、T017 |
| FR-009：Space 完整重置 | T005、T014、T015、T017 |
| FR-010：桌面視窗可見與非觸控範圍 | T006、T011、T016、T021 |
| FR-011：保留既有桌面檢查點 | T002、T012、T021、T024 |
| SC-001：3 次未登入開啟成功 | T018、T019、T022、T024 |
| SC-002：3 次操作與至少一次計分 | T008、T009、T010、T012、T024 |
| SC-003：3 次清板且 1 秒內顯示勝利 | T013、T015、T017、T022、T024 |
| SC-004：3 次 Game Over 且 10 秒不變 | T013、T014、T015、T017、T022、T024 |
| SC-005：3 次終止狀態重玩 | T014、T015、T017、T022、T024 |
| SC-006：3 種桌面視窗尺寸 | T011、T016、T021、T024 |
| SC-007：5 位第一次玩家理解結果與重玩 | T015、T016、T022、T024 |
| `data-model.md`：狀態、實體與不變條件 | T005、T009、T010、T013、T014 |
| `contracts/ui.md`：鍵盤、焦點、畫面與 Sites 契約 | T006、T008、T011、T015、T016、T018、T019、T022 |

## 憲章合規確認

- 本任務文件的標題、說明、階段、任務、依賴、策略、追溯表與備註均使用繁體中文；任務標籤、路徑、命令、套件與介面固定文字保留必要原文。
- 任務先建立可執行的網站 checkpoint，再逐步加入遊戲狀態、碰撞、結果與公開交付，符合憲章 I～IV。
- 新增 TypeScript／Canvas 僅限 `web/` 瀏覽器適配層，不引入遊戲引擎、後端、持久化或第三方遊戲套件，符合憲章 V 的有界例外說明。
- 所有 SDD 文件以繁體中文撰寫，既有桌面檢查點保留，分支與 PR 收尾要求依憲章 VI～VII 執行。
