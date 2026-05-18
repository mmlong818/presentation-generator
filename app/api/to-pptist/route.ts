import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import path from 'node:path'

export const runtime = 'nodejs'

const SERVICE_DIR = path.join(process.cwd(), 'pptx-service')

interface ConvertResult {
  ok: boolean
  presentation?: unknown
  error?: string
}

function runConverter(deck: unknown): Promise<ConvertResult> {
  return new Promise((resolve) => {
    const proc = spawn(
      'python',
      ['-c', 'import json, sys; from converter import deck_to_pptist; deck = json.load(sys.stdin); print(json.dumps(deck_to_pptist(deck), ensure_ascii=False))'],
      { cwd: SERVICE_DIR, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } },
    )

    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (chunk) => { stdout += chunk.toString('utf-8') })
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString('utf-8') })

    proc.on('error', (err) => {
      resolve({ ok: false, error: `spawn failed: ${err.message}` })
    })
    proc.on('close', (code) => {
      if (code !== 0) {
        resolve({ ok: false, error: stderr || `converter exited ${code}` })
        return
      }
      try {
        const presentation = JSON.parse(stdout)
        resolve({ ok: true, presentation })
      }
      catch (err) {
        resolve({ ok: false, error: `parse failed: ${(err as Error).message}\n${stdout.slice(0, 500)}` })
      }
    })

    proc.stdin.end(JSON.stringify(deck))
  })
}

export async function POST(req: NextRequest) {
  let deck: unknown
  try {
    deck = await req.json()
  }
  catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 })
  }

  const result = await runConverter(deck)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ presentation: result.presentation })
}
