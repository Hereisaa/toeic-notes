// Mirrors the TOEIC folder of the private Obsidian vault into content/.
// Stale files are moved to ~/.ai-trash/ instead of being deleted, so a bad
// sync is always recoverable.
import { cp, mkdir, readdir, rename } from "node:fs/promises"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const vaultDir =
  process.env.VAULT_TOEIC_DIR ??
  path.resolve(repoRoot, "..", "knowledge-vault", "30-TOEIC")
const contentDir = path.join(repoRoot, "content")
const landingPage = path.join(repoRoot, "site", "index.md")

if (!existsSync(vaultDir)) {
  console.error(`找不到來源資料夾：${vaultDir}`)
  console.error("可用環境變數 VAULT_TOEIC_DIR 指定實際路徑。")
  process.exit(1)
}

async function listMarkdown(dir, base = dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await listMarkdown(full, base)))
    else if (entry.name.endsWith(".md")) out.push(path.relative(base, full))
  }
  return out
}

const wanted = new Set(await listMarkdown(vaultDir))
const present = existsSync(contentDir) ? await listMarkdown(contentDir) : []
const stale = present.filter((p) => !wanted.has(p) && p !== "index.md")

if (stale.length > 0) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const trashDir = path.join(homedir(), ".ai-trash", `toeic-notes-sync-${stamp}`)
  for (const rel of stale) {
    const target = path.join(trashDir, rel)
    await mkdir(path.dirname(target), { recursive: true })
    await rename(path.join(contentDir, rel), target)
  }
  console.log(`已移走 ${stale.length} 個來源已不存在的檔案 → ${trashDir}`)
  stale.forEach((rel) => console.log(`  - ${rel}`))
}

await mkdir(contentDir, { recursive: true })
await cp(vaultDir, contentDir, {
  recursive: true,
  filter: (src) => !path.basename(src).startsWith("."),
})
await cp(landingPage, path.join(contentDir, "index.md"))

console.log(`已同步 ${wanted.size} 篇筆記：${vaultDir} → ${contentDir}`)
