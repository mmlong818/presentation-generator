// AI image generation endpoint.
// Accepts { prompt, provider, apiKey, size?, model? } and returns
// { dataUrl, model } or { error }.
//
// Providers (resolved by 'provider' field):
// - 'fal':       fal.ai (recommended)
// - 'openai':    OpenAI Images
// - 'stub':      Returns an SVG placeholder for offline/dev use
//
// All API keys travel from browser → here → upstream. We DO NOT log keys.

import { NextResponse } from 'next/server'

interface Req {
  prompt: string
  provider?: 'fal' | 'openai' | 'stub'
  apiKey?: string
  size?: '1024x1024' | '1024x1536' | '1536x1024'
  model?: string
}

export async function POST(req: Request) {
  let body: Req
  try { body = await req.json() } catch { return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 }) }
  const prompt = (body.prompt || '').trim()
  if (!prompt) return NextResponse.json({ error: 'prompt 必填' }, { status: 400 })

  const provider = body.provider || 'stub'

  try {
    if (provider === 'stub') return NextResponse.json({ dataUrl: stubSvg(prompt), model: 'stub' })

    if (provider === 'fal') {
      if (!body.apiKey) return NextResponse.json({ error: 'fal.ai 需要 apiKey' }, { status: 400 })
      const model = body.model || 'fal-ai/flux/schnell'
      const res = await fetch(`https://fal.run/${model}`, {
        method: 'POST',
        headers: { 'Authorization': `Key ${body.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image_size: 'landscape_16_9' }),
      })
      if (!res.ok) {
        const txt = await res.text()
        return NextResponse.json({ error: `fal.ai: ${res.status} ${txt.slice(0, 200)}` }, { status: 502 })
      }
      const data = await res.json() as { images?: { url: string }[] }
      const url = data.images?.[0]?.url
      if (!url) return NextResponse.json({ error: 'fal.ai 返回空图片列表' }, { status: 502 })
      // Re-fetch and inline as data URL so the deck is self-contained.
      const img = await fetch(url)
      const buf = Buffer.from(await img.arrayBuffer())
      const ct = img.headers.get('content-type') || 'image/jpeg'
      return NextResponse.json({ dataUrl: `data:${ct};base64,${buf.toString('base64')}`, model })
    }

    if (provider === 'openai') {
      if (!body.apiKey) return NextResponse.json({ error: 'OpenAI 需要 apiKey' }, { status: 400 })
      const model = body.model || 'gpt-image-1'
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${body.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, size: body.size || '1536x1024', n: 1 }),
      })
      if (!res.ok) {
        const txt = await res.text()
        return NextResponse.json({ error: `OpenAI: ${res.status} ${txt.slice(0, 200)}` }, { status: 502 })
      }
      const data = await res.json() as { data?: { b64_json?: string; url?: string }[] }
      const item = data.data?.[0]
      if (item?.b64_json) {
        return NextResponse.json({ dataUrl: `data:image/png;base64,${item.b64_json}`, model })
      }
      if (item?.url) {
        const img = await fetch(item.url)
        const buf = Buffer.from(await img.arrayBuffer())
        return NextResponse.json({ dataUrl: `data:image/png;base64,${buf.toString('base64')}`, model })
      }
      return NextResponse.json({ error: 'OpenAI 未返回图片' }, { status: 502 })
    }

    return NextResponse.json({ error: `未知 provider: ${provider}` }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

/** Build a deterministic placeholder SVG so dev workflow doesn't burn quota. */
function stubSvg(prompt: string): string {
  const safe = prompt.replace(/[<>&]/g, '').slice(0, 80)
  const hue = Math.abs(hash(prompt)) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 70%, 60%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 60) % 360}, 70%, 45%)"/>
    </linearGradient></defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <text x="400" y="290" text-anchor="middle" fill="white" font-family="sans-serif" font-size="28" font-weight="700">AI 图片占位</text>
    <text x="400" y="330" text-anchor="middle" fill="white" font-family="sans-serif" font-size="18" opacity="0.85">${safe}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0 }
  return h
}
