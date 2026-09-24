// Builds the site with Quartz without keeping Quartz's source in this repo.
// The engine is cloned into .quartz-engine (gitignored) and pinned to the
// commit recorded in quartz.ref; our notes are passed in with `-d`, and only
// the site config and custom styles are copied into the engine.
import { execSync } from "node:child_process"
import { copyFileSync, cpSync, existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const QUARTZ_REPO = "https://github.com/jackyzha0/quartz.git"
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const engineDir = path.join(repoRoot, ".quartz-engine")
const ref = readFileSync(path.join(repoRoot, "quartz.ref"), "utf-8").trim()

const run = (command, cwd = repoRoot) => execSync(command, { cwd, stdio: "inherit" })

if (!existsSync(engineDir)) {
  console.log(`取得 Quartz 建置引擎（${ref.slice(0, 7)}）…`)
  run(`git clone --quiet "${QUARTZ_REPO}" "${engineDir}"`)
}
// --force discards our copied custom.scss so a quartz.ref bump can check out.
run(`git -C "${engineDir}" checkout --quiet --force ${ref}`)
if (!existsSync(path.join(engineDir, "node_modules"))) {
  run("npm ci", engineDir)
}

// Our own plugins live in site/plugins/; the config references them as
// ./site-plugins/<name> relative to the engine, which is also the layout the
// deploy workflow sets up. `plugin install` symlinks them into .quartz/plugins.
cpSync(path.join(repoRoot, "site", "plugins"), path.join(engineDir, "site-plugins"), { recursive: true })
if (!existsSync(path.join(engineDir, ".quartz", "plugins", "table-labels"))) {
  run("npx quartz plugin install", engineDir)
}

copyFileSync(path.join(repoRoot, "quartz.config.yaml"), path.join(engineDir, "quartz.config.yaml"))
copyFileSync(
  path.join(repoRoot, "site", "custom.scss"),
  path.join(engineDir, "quartz", "styles", "custom.scss"),
)

const passthrough = process.argv.slice(2).join(" ")
run(`npx quartz build -d "${path.join(repoRoot, "content")}" ${passthrough}`.trim(), engineDir)
