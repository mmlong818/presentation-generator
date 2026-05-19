#!/usr/bin/env node
// presgen — CLI for the presentation-generator.
//
// Usage:
//   presgen render <input.md> [--theme=modern-minimal] [--out=deck.pptx] [--format=pptx|html|json]
//   presgen render --stdin --theme=editorial-monocle --out=deck.pptx < notes.md
//   presgen render --remote http://localhost:3000 < notes.md > deck.pptx
//
// Modes:
//   - Default uses the running Next.js dev/prod server's /api/render endpoint.
//   - If --offline (no server) is set, performs local conversion via dynamic
//     imports of the project modules (requires the repo as cwd).

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, basename } from 'node:path'

const args = process.argv.slice(2)
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printHelp()
  process.exit(0)
}

const cmd = args.shift()
if (cmd !== 'render') {
  console.error(`未知命令: ${cmd}`)
  printHelp()
  process.exit(2)
}

const opts = {
  input: null,
  stdin: false,
  theme: 'modern-minimal',
  out: null,
  format: 'pptx',
  remote: 'http://localhost:3000',
  offline: false,
}
for (const a of args) {
  if (a === '--stdin') opts.stdin = true
  else if (a === '--offline') opts.offline = true
  else if (a.startsWith('--theme=')) opts.theme = a.slice(8)
  else if (a.startsWith('--out=')) opts.out = a.slice(6)
  else if (a.startsWith('--format=')) opts.format = a.slice(9)
  else if (a.startsWith('--remote=')) opts.remote = a.slice(9)
  else if (!a.startsWith('--')) opts.input = a
}

let md
if (opts.stdin) {
  md = readFileSync(0, 'utf-8')
} else if (opts.input) {
  md = readFileSync(resolve(opts.input), 'utf-8')
} else {
  console.error('需要 <input.md> 或 --stdin')
  process.exit(2)
}

const outFile = opts.out ?? defaultOutName(opts.input, opts.format)

if (opts.offline) {
  await renderOffline(md, opts.theme, opts.format, outFile)
} else {
  await renderViaServer(md, opts.theme, opts.format, opts.remote, outFile)
}

async function renderViaServer(markdown, theme, format, remote, out) {
  const url = `${remote.replace(/\/$/, '')}/api/render`
  console.error(`POST ${url}  (format=${format}, theme=${theme})`)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown, theme, format }),
  })
  if (!res.ok) {
    const txt = await res.text()
    console.error(`HTTP ${res.status}: ${txt.slice(0, 400)}`)
    process.exit(1)
  }
  if (format === 'json') {
    const txt = await res.text()
    if (out === '-') process.stdout.write(txt)
    else writeFileSync(out, txt)
  } else if (format === 'html') {
    const txt = await res.text()
    if (out === '-') process.stdout.write(txt)
    else writeFileSync(out, txt)
  } else {
    const buf = Buffer.from(await res.arrayBuffer())
    if (out === '-') process.stdout.write(buf)
    else writeFileSync(out, buf)
  }
  if (out !== '-') console.error(`→ wrote ${out}`)
}

async function renderOffline(markdown, theme, format, out) {
  console.error(`Offline mode (theme=${theme}, format=${format})`)
  const { parseMarkdownDeck } = await import('../lib/markdown-deck.ts')
  const { deckToEditor } = await import('../lib/editor/compose/index.ts')
  const deck = parseMarkdownDeck(markdown, { theme })
  if (format === 'json') {
    const txt = JSON.stringify(deck, null, 2)
    if (out === '-') process.stdout.write(txt)
    else writeFileSync(out, txt)
  } else if (format === 'html') {
    const { exportHTML } = await import('../lib/editor/export/html.ts')
    const html = exportHTML(deckToEditor(deck))
    if (out === '-') process.stdout.write(html)
    else writeFileSync(out, html)
  } else if (format === 'pptx') {
    const { buildPPTX } = await import('../lib/editor/export/pptx-node.ts')
    const buf = await buildPPTX(deckToEditor(deck))
    if (out === '-') process.stdout.write(buf)
    else writeFileSync(out, buf)
  }
  if (out !== '-') console.error(`→ wrote ${out}`)
}

function defaultOutName(input, format) {
  const base = input ? basename(input).replace(/\.md$/, '') : 'deck'
  const ext = format === 'json' ? 'json' : format === 'html' ? 'html' : 'pptx'
  return `${base}.${ext}`
}

function printHelp() {
  console.log(`presgen — presentation-generator CLI

  presgen render <input.md> [opts]
  presgen render --stdin [opts]

Options:
  --theme=<id>      Theme id (default modern-minimal)
  --out=<path>      Output path (use '-' for stdout). Auto: <input>.<ext>
  --format=<fmt>    pptx | html | json (default pptx)
  --remote=<url>    Server endpoint (default http://localhost:3000)
  --offline         Build locally (requires tsx in this repo)

Example:
  presgen render talk.md --theme=editorial-monocle --out=talk.pptx
  echo "# Hi\\n\\n## Why\\n- one\\n- two" | presgen render --stdin --out=-
`)
}
