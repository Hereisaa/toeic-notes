# toeic-notes 專案指令

把私人 Obsidian vault 的 `30-TOEIC/` 發布成公開網站（GitHub Pages，<https://hereisaa.github.io/toeic-notes/>）。

## 結構
- `content/`：**產生物**，由 `npm run sync` 從 vault 鏡像而來，不要手動編輯。筆記正本在 `knowledge-vault/30-TOEIC/`。
- `site/index.md`：網站首頁正本，同步時複製成 `content/index.md`。
- `quartz.config.yaml`：Quartz 設定；建置時複製進引擎目錄。
- `quartz.ref`：釘選的 Quartz commit SHA，升級只改這一行。
- `scripts/sync-notes.mjs`：同步腳本；來源已消失的檔案移到 `~/.ai-trash/`，不直接刪除。
- `scripts/build.mjs`：把 Quartz 抓進 `.quartz-engine/`（gitignored）並用 `-d` 指向本 repo 的 `content/` 建置。

**Quartz 原始碼刻意不進版控**，這樣 repo 裡每個檔案都是自己寫的，contributors 也只會有自己。

## 指令
- `npm run sync`：從 vault 同步筆記。
- `npm run preview`：本機預覽（http://localhost:8080）。
- `npm run build`：只建置，產物在 `.quartz-engine/public/`。

## 慣例與邊界
- 部署分支是 `main`，推上去觸發 `.github/workflows/deploy.yml`；卡住時 `gh workflow run deploy.yml --ref main`。
- 這是**公開** repo：進到 `content/` 的內容都會公開，過濾要在同步來源做，不能靠 frontmatter。
- 筆記慣例（模板、frontmatter、wiki-link）以 `knowledge-vault/CLAUDE.md` 為準。
- 升級 Quartz 只改 `quartz.ref`，不要把 Quartz 的檔案 commit 進來。

## 驗收底線
改設定或升級 `quartz.ref` 後跑 `npm run build` 確認成功，再確認 `git status` 只動到預期檔案。
