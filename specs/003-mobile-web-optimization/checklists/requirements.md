# 需求檢查清單：敲磚塊行動版體驗與發佈流程

## 規格完整性

- [x] 需求已拆成玩家觸控操作、響應式版面與維護者發佈流程三個使用者故事。
- [x] 每個使用者故事都有優先級、獨立測試與驗收情境。
- [x] 已明確定義 pointer up、pointer cancel、capture 遺失、失焦與頁面隱藏等輸入邊界。
- [x] 已明確保留桌面鍵盤、既有遊戲規則與 Python 教學檔案。
- [x] 已定義 360px 直向、低高度橫向、安全區與 44px 觸控目標的可量測條件。

## 技術與交付一致性

- [x] `web/app/page.tsx`、`web/app/globals.css` 與 `web/app/layout.tsx` 已列為受影響檔案。
- [x] 未新增 npm 套件、資料庫、D1、R2、Auth 或遊戲引擎。
- [x] `.agents/skills/brick-breaker-publish/` 已列為專案交付物，且包含 Sites 設定重用與秘密處理規則。
- [x] 已參考 GitHub 其他專案，納入可移植的 Git preflight、固定 viewport UI 矩陣、review／release gate，並排除 Cloudflare、VSIX 與課程專用流程。
- [x] 發佈技能規定先通過 lint、TypeScript 與 production build。
- [x] 發佈技能規定沒有明確公開要求時不得覆蓋既有公開網站。

## 驗收狀態

- [x] 已完成程式與 SDD 文件初稿。
- [x] `npm run lint`、TypeScript 與 `npm run build` 驗證通過。
- [x] 專案技能通過 `quick_validate.py`。
- [x] 依使用者回報，行動裝置人工驗收 M-001 至 M-007 均通過，結果已記錄於 `quickstart.md`。
- [ ] 若之後要求公開發佈，已以通過驗收的 commit 建立 Sites 版本並驗證網址。
