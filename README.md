# TOEIC 筆記

多益準備筆記的公開版，網站：<https://hereisaa.github.io/toeic-notes/>

這個 repo 只放**我自己寫的筆記與設定**。網站由 [Quartz](https://quartz.jzhao.xyz/)（MIT，作者 jackyzha0）產生，但 Quartz 的原始碼不放進來——建置時才依 `quartz.ref` 釘選的版本抓下來。

## 結構

| 路徑 | 說明 |
|---|---|
| `content/` | 41 篇筆記，從私人 Obsidian vault 的 `30-TOEIC/` 鏡像而來，**不要直接編輯** |
| `site/index.md` | 網站首頁正本，同步時複製成 `content/index.md` |
| `quartz.config.yaml` | 網站設定（語系、外掛、版面） |
| `quartz.ref` | 釘選的 Quartz commit，升級就改這個檔 |
| `scripts/` | 同步與建置腳本 |
| `.quartz-engine/` | 本機建置用的 Quartz（gitignored，第一次 `npm run build` 會自動抓） |

## 更新流程

```bash
npm run sync       # 從 vault 鏡像筆記到 content/
npm run preview    # 本機預覽 http://localhost:8080
git add -A && git commit -m "Update notes" && git push
```

推上 `main` 後 GitHub Actions 會自動重新建置並部署，進度看 [Actions](https://github.com/Hereisaa/toeic-notes/actions)。沒有自動觸發時手動跑：

```bash
gh workflow run deploy.yml --ref main
```

同步腳本預設讀 `../knowledge-vault/30-TOEIC`，路徑不同時用環境變數指定：

```bash
VAULT_TOEIC_DIR=/path/to/vault/30-TOEIC npm run sync
```

來源已刪除的筆記不會被直接刪掉，而是移到 `~/.ai-trash/toeic-notes-sync-<timestamp>/`。

## 升級 Quartz

把 `quartz.ref` 換成新的 commit SHA，跑 `npm run preview` 確認沒壞，再 commit 推上去。

```bash
git -C .quartz-engine fetch origin v5
git -C .quartz-engine rev-parse origin/v5   # 取得最新 SHA
```
