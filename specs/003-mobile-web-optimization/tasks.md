---
description: "敲磚塊行動版體驗與發佈流程的可執行任務"
---

# 任務：敲磚塊行動版體驗與發佈流程

**輸入**：`spec.md`、`plan.md`、`research.md`、`data-model.md`、`contracts/ui.md` 與 `quickstart.md`

**實作策略**：先完成 P1 觸控操作，再完成響應式版面，接著建立 P2 專案發佈技能；最後執行建置、靜態檢查與人工驗收。這次不自動公開部署。

## Phase 1：準備與文件

**目的**：建立與本功能分支對應的 SDD 設計文件，並確認變更只作用於既有 `web/` 發佈適配層。

- [X] T001 [P] 完成 `specs/003-mobile-web-optimization/spec.md` 的使用者故事、FR、SC、邊界與假設
- [X] T002 [P] 完成 `specs/003-mobile-web-optimization/plan.md`、`research.md`、`data-model.md` 與 `contracts/ui.md`
- [X] T003 [P] 完成 `specs/003-mobile-web-optimization/quickstart.md` 與 `checklists/requirements.md` 的行動版驗收項目

## Phase 2：基礎輸入邊界

**目的**：讓鍵盤、觸控與頁面生命週期共用同一個 `InputState`，並確保失焦或遊戲終止時不留下殘留輸入。

- [X] T004 在 `web/app/page.tsx` 建立共用的 `clearInput`、HUD 同步與 Space／觸控發球重玩 handler
- [X] T005 在 `web/app/page.tsx` 加入 Pointer Events 的 pointer capture、pointer up、pointer cancel 與 lost pointer capture 清除流程
- [X] T006 在 `web/app/page.tsx` 將遊戲終止時的方向輸入清除，並保留既有 window blur／document visibilitychange 清除流程

## Phase 3：使用者故事 1——手機觸控遊戲（P1）

**目標**：玩家不依賴實體鍵盤即可移動底板、發球與重新開始。

**獨立測試**：在支援 Pointer Events 的瀏覽器按住左右按鈕、放開，再按發球；確認底板會移動與停止，結果狀態可用「重玩」回復。

- [X] T007 [US1] 在 `web/app/page.tsx` 加入向左、發球／重玩、向右三個具中文 `aria-label` 的觸控控制
- [X] T008 [US1] 在 `web/app/page.tsx` 讓觸控控制與鍵盤 Space 共用狀態更新、結果提示與遊戲區焦點回復
- [X] T009 [US1] 在 `web/app/page.tsx` 更新結果提示與操作說明，使玩家知道可用觸控按鈕重新開始

## Phase 4：使用者故事 2——不同手機尺寸的響應式版面（P1）

**目標**：窄螢幕、瀏海螢幕與低高度橫向視窗都能看見並操作遊戲。

**獨立測試**：以 360px 直向、具安全區的裝置與低高度橫向視窗檢查無水平溢出、4:3 畫布、可見控制與可讀文字；再回到桌面驗證鍵盤回歸。

- [X] T010 [P] [US2] 在 `web/app/layout.tsx` 設定 `viewportFit: 'cover'` 與網站 theme color
- [X] T011 [P] [US2] 在 `web/app/globals.css` 加入安全區間距、`100dvh`、水平溢出保護、4:3 遊戲區與觸控手勢限制
- [X] T012 [US2] 在 `web/app/globals.css` 加入 `(pointer: coarse)`／窄螢幕觸控控制樣式、44px 以上目標與低高度橫向間距調整

## Phase 5：使用者故事 3——可重複的專案發佈技能（P2）

**目標**：維護者可依專案技能驗證行動版與 Sites 發佈前置條件，不誤覆蓋公開站。

**獨立測試**：技能檔格式通過 `quick_validate.py`，內容明確涵蓋 `web/`、`hosting.json`、行動版品質閘門、commit 對應、PR 與公開部署先決條件。

- [X] T013 [P] [US3] 在 `.agents/skills/brick-breaker-publish/SKILL.md` 撰寫本專案來源盤點、行動版檢查、品質閘門與秘密處理規則
- [X] T014 [P] [US3] 在 `.agents/skills/brick-breaker-publish/agents/openai.yaml` 建立技能顯示資訊與 `$brick-breaker-publish` 預設提示
- [X] T015 [US3] 在 `.agents/skills/brick-breaker-publish/SKILL.md` 定義既有 Sites `project_id` 重用、版本保存、PR 交付與「明確要求後才公開部署」流程

## Phase 6：驗證與文件收尾

**目的**：完成程式、技能與 SDD 文件的品質閘門，並記錄行動裝置人工驗收結果。

- [X] T016 [P] 在 `web/` 執行 `npm run lint`、`./node_modules/.bin/tsc --noEmit` 與 `npm run build`
- [X] T017 [P] 在 repo 根目錄執行 `python3 -m py_compile Day1/*.py Day2/*.py`，確認既有教學檔案未受影響
- [X] T018 [P] 執行 `quick_validate.py` 驗證 `.agents/skills/brick-breaker-publish/`
- [X] T019 依使用者提供的人工測試結果，在 `specs/003-mobile-web-optimization/quickstart.md` 記錄 M-001 至 M-007 均通過；不補寫未取得的裝置或瀏覽器細節
- [X] T020 在 `specs/003-mobile-web-optimization/checklists/requirements.md` 更新建置、技能格式與人工驗收狀態；若未收到公開部署要求，不執行 Sites 部署
- [X] T021 參考 GitHub 其他 repository 的維護／PR／發佈技能，將適用的 Git preflight、變更範圍分類、固定 viewport 矩陣、review／release gate 與不適用流程的排除條件納入 `.agents/skills/brick-breaker-publish/SKILL.md` 與 `research.md`，並重新執行技能 validator、文件一致性與 diff 檢查

## 相依性與執行順序

### Phase 相依性

- Phase 1 可立即完成，建立本功能的需求與設計基準。
- Phase 2 必須先於使用者故事實作，因為 US1 與 US2 共用輸入與頁面生命週期邊界。
- Phase 3 與 Phase 4 依賴 Phase 2；T010、T011 可平行，T012 依賴相同 CSS 結構但可與 T010 平行。
- Phase 5 可在 Phase 1 完成後建立，驗證時需使用已完成的網站來源與 `hosting.json`。
- Phase 6 需在所有程式與技能任務完成後執行；T019 的人工驗收結果已由使用者回報並記錄，Sites 發佈仍是獨立的外部交付閘門。

### 使用者故事相依性

- **US1（P1）**：依賴 Phase 2；完成 T004–T009 後可單獨驗證觸控遊戲循環。
- **US2（P1）**：依賴 Phase 2；完成 T010–T012 後可單獨驗證手機版面與桌面回歸。
- **US3（P2）**：依賴 Phase 1；完成 T013–T015 後可單獨驗證技能格式與流程內容，不需要公開部署。

### 可平行工作示例

```text
T010 layout.tsx  ─┐
T011 globals.css ─┼─→ T016 build／T019 人工驗收
T013 SKILL.md    ─┤
T014 openai.yaml ─┘     └→ T018 skill validator
```

## 完成定義

- 所有與程式、文件及技能建立相關的任務標記完成。
- `npm run lint`、TypeScript、`npm run build`、Python 語法檢查與技能格式驗證成功。
- 行動版 M-001 至 M-007 的人工驗收結果已記錄；未完成 Sites 發佈前不得宣稱已公開新版。
- 若使用者另行要求公開發佈，才依專案技能建立 Sites 版本、送出 PR 並部署；本任務本身不自動覆蓋既有公開網址。
