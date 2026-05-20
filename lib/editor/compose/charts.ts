// ─── Pure SVG chart builders ────────────────────────────────────────────────
//
// Why hand-rolled and not ECharts:
// 1. ECharts is 1MB+ bundled
// 2. ECharts has its own theme system that fights our 12-theme tokens
// 3. We render once per slide (no interactivity needed in PPT)
// 4. SVG dataUrl flows cleanly into ImageElement → Konva preview / PPTX export / HTML self-contained
// 5. Theme colors / fonts inherit naturally
//
// Each function returns a complete SVG string with viewBox locked to the
// supplied (w, h) so the caller can drop it directly as ImageElement.src.

interface BaseChartOpts {
  w: number              // viewBox width in source px
  h: number              // viewBox height in source px
  accent: string         // primary series color
  text: string           // axis label color
  muted: string          // gridline / secondary color
  fontFamily: string
  /** Optional: highlight this series/slice. Color override applied. */
  highlight?: string
  /** Series colors palette (for multi-series). */
  palette?: string[]
}

// ─── Line chart ─────────────────────────────────────────────────────────────

interface LineChartOpts extends BaseChartOpts {
  xLabels: string[]
  series: Array<{ name: string; values: number[] }>
  unit?: string
}

export function buildLineChartSVG(opts: LineChartOpts): string {
  const { w, h, accent, text, muted, fontFamily, xLabels, series, unit, highlight, palette } = opts
  const pad = { top: 40, right: 60, bottom: 60, left: 70 }
  const plotW = w - pad.left - pad.right
  const plotH = h - pad.top - pad.bottom

  const allVals = series.flatMap(s => s.values)
  const max = Math.max(...allVals, 1)
  const min = Math.min(...allVals, 0)
  const range = max - min || 1
  const minV = min < 0 ? min : 0
  const maxV = max
  const valRange = maxV - minV || 1

  const n = xLabels.length
  const xStep = n > 1 ? plotW / (n - 1) : plotW
  const xAt = (i: number) => pad.left + i * xStep
  const yAt = (v: number) => pad.top + plotH - ((v - minV) / valRange) * plotH

  // 4 horizontal gridlines (incl. 0)
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(t => pad.top + plotH * (1 - t))
  const gridLabels = [0, 0.25, 0.5, 0.75, 1].map(t => formatNum(minV + t * valRange))

  const colors = palette ?? [accent, '#999', '#bbb']

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${escAttr(fontFamily)}">`)

  // Gridlines
  for (const gy of gridYs) {
    parts.push(`<line x1="${pad.left}" y1="${gy}" x2="${pad.left + plotW}" y2="${gy}" stroke="${muted}" stroke-width="1" stroke-opacity="0.35" />`)
  }
  // Y axis labels
  gridYs.forEach((gy, i) => {
    parts.push(`<text x="${pad.left - 12}" y="${gy + 5}" font-size="18" fill="${muted}" text-anchor="end">${escText(gridLabels[i])}</text>`)
  })
  // X axis labels
  xLabels.forEach((lbl, i) => {
    parts.push(`<text x="${xAt(i)}" y="${pad.top + plotH + 28}" font-size="18" fill="${text}" text-anchor="middle">${escText(lbl)}</text>`)
  })

  // Series
  series.forEach((s, si) => {
    const color = (highlight && s.name === highlight) ? accent : colors[si % colors.length]
    const isEmph = !highlight || s.name === highlight
    const sw = isEmph ? 3 : 2
    const opacity = highlight && s.name !== highlight ? 0.45 : 1
    const points = s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')
    parts.push(`<polyline points="${points}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" />`)
    s.values.forEach((v, i) => {
      parts.push(`<circle cx="${xAt(i)}" cy="${yAt(v)}" r="${isEmph ? 5 : 3.5}" fill="${color}" opacity="${opacity}" />`)
    })
  })

  // Legend if multi-series
  if (series.length > 1) {
    let lx = pad.left
    const ly = 18
    series.forEach((s, si) => {
      const color = (highlight && s.name === highlight) ? accent : colors[si % colors.length]
      parts.push(`<circle cx="${lx + 8}" cy="${ly + 2}" r="6" fill="${color}" />`)
      const label = `${s.name}${unit && si === series.length - 1 ? `  (${unit})` : ''}`
      parts.push(`<text x="${lx + 22}" y="${ly + 8}" font-size="18" fill="${text}" font-weight="600">${escText(label)}</text>`)
      lx += 22 + estTextWidth(label, 18) + 24
    })
  } else if (unit) {
    parts.push(`<text x="${pad.left}" y="18" font-size="16" fill="${muted}">${escText(unit)}</text>`)
  }

  parts.push('</svg>')
  return parts.join('')
}

// ─── Pie chart ──────────────────────────────────────────────────────────────

interface PieChartOpts extends BaseChartOpts {
  slices: Array<{ label: string; value: number }>
  centerLabel?: string
}

export function buildPieChartSVG(opts: PieChartOpts): string {
  const { w, h, accent, text, muted, fontFamily, slices, centerLabel, highlight, palette } = opts
  const cx = w * 0.38
  const cy = h / 2
  const r = Math.min(cx, cy) - 30
  const rInner = r * 0.55  // donut hole for label
  const total = slices.reduce((a, s) => a + s.value, 0) || 1
  const colors = palette ?? [accent, '#737373', '#a3a3a3', '#d4d4d4', '#262626', '#525252']

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${escAttr(fontFamily)}">`)

  // Donut slices
  let acc = 0
  slices.forEach((s, i) => {
    const startA = (acc / total) * Math.PI * 2 - Math.PI / 2
    acc += s.value
    const endA = (acc / total) * Math.PI * 2 - Math.PI / 2
    const x1 = cx + Math.cos(startA) * r
    const y1 = cy + Math.sin(startA) * r
    const x2 = cx + Math.cos(endA) * r
    const y2 = cy + Math.sin(endA) * r
    const x3 = cx + Math.cos(endA) * rInner
    const y3 = cy + Math.sin(endA) * rInner
    const x4 = cx + Math.cos(startA) * rInner
    const y4 = cy + Math.sin(startA) * rInner
    const largeArc = endA - startA > Math.PI ? 1 : 0
    const isEmph = !highlight || s.label === highlight
    const color = (highlight && s.label === highlight) ? accent : colors[i % colors.length]
    const opacity = highlight && s.label !== highlight ? 0.4 : 1
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`
    parts.push(`<path d="${d}" fill="${color}" opacity="${opacity}" />`)
  })

  // Center label
  if (centerLabel) {
    parts.push(`<text x="${cx}" y="${cy + 12}" font-size="42" font-weight="700" fill="${text}" text-anchor="middle">${escText(centerLabel)}</text>`)
  }

  // Legend (right side)
  const legendX = cx + r + 60
  let legendY = cy - (slices.length * 36) / 2
  slices.forEach((s, i) => {
    const pct = ((s.value / total) * 100).toFixed(s.value / total >= 0.1 ? 0 : 1)
    const color = (highlight && s.label === highlight) ? accent : colors[i % colors.length]
    const isEmph = !highlight || s.label === highlight
    const weight = isEmph ? 700 : 500
    parts.push(`<rect x="${legendX}" y="${legendY}" width="22" height="22" fill="${color}" rx="3" />`)
    parts.push(`<text x="${legendX + 34}" y="${legendY + 17}" font-size="20" font-weight="${weight}" fill="${text}">${escText(s.label)}</text>`)
    parts.push(`<text x="${legendX + 34}" y="${legendY + 42}" font-size="16" fill="${muted}">${pct}%</text>`)
    legendY += 60
  })

  parts.push('</svg>')
  return parts.join('')
}

// ─── Stacked area chart ─────────────────────────────────────────────────────

interface AreaChartOpts extends BaseChartOpts {
  xLabels: string[]
  series: Array<{ name: string; values: number[] }>
  unit?: string
}

export function buildAreaChartSVG(opts: AreaChartOpts): string {
  const { w, h, accent, text, muted, fontFamily, xLabels, series, unit, highlight, palette } = opts
  const pad = { top: 40, right: 60, bottom: 60, left: 70 }
  const plotW = w - pad.left - pad.right
  const plotH = h - pad.top - pad.bottom

  const n = xLabels.length
  // Stacked: sum across series at each x
  const stacked = xLabels.map((_, i) => series.reduce((a, s) => a + (s.values[i] ?? 0), 0))
  const max = Math.max(...stacked, 1)

  const xStep = n > 1 ? plotW / (n - 1) : plotW
  const xAt = (i: number) => pad.left + i * xStep
  const yAt = (v: number) => pad.top + plotH - (v / max) * plotH

  const colors = palette ?? [accent, '#737373', '#a3a3a3']

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${escAttr(fontFamily)}">`)

  // Gridlines
  ;[0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const gy = pad.top + plotH * (1 - t)
    parts.push(`<line x1="${pad.left}" y1="${gy}" x2="${pad.left + plotW}" y2="${gy}" stroke="${muted}" stroke-width="1" stroke-opacity="0.35" />`)
    parts.push(`<text x="${pad.left - 12}" y="${gy + 5}" font-size="18" fill="${muted}" text-anchor="end">${escText(formatNum(t * max))}</text>`)
  })

  // X labels
  xLabels.forEach((lbl, i) => {
    parts.push(`<text x="${xAt(i)}" y="${pad.top + plotH + 28}" font-size="18" fill="${text}" text-anchor="middle">${escText(lbl)}</text>`)
  })

  // Stacked paths, bottom-up
  const cumulative = xLabels.map(() => 0)
  series.forEach((s, si) => {
    const isEmph = !highlight || s.name === highlight
    const color = (highlight && s.name === highlight) ? accent : colors[si % colors.length]
    const opacity = highlight && s.name !== highlight ? 0.35 : 0.75
    const topPath: string[] = []
    const bottomPath: string[] = []
    s.values.forEach((v, i) => {
      const yTop = yAt(cumulative[i] + v)
      const yBottom = yAt(cumulative[i])
      topPath.push(`${xAt(i)},${yTop}`)
      bottomPath.unshift(`${xAt(i)},${yBottom}`)
      cumulative[i] += v
    })
    const d = `M ${topPath[0]} L ${topPath.slice(1).join(' L ')} L ${bottomPath.join(' L ')} Z`
    parts.push(`<path d="${d}" fill="${color}" opacity="${opacity}" stroke="${color}" stroke-width="${isEmph ? 2 : 1}" />`)
  })

  // Legend
  if (series.length > 1) {
    let lx = pad.left
    const ly = 18
    series.forEach((s, si) => {
      const color = (highlight && s.name === highlight) ? accent : colors[si % colors.length]
      parts.push(`<rect x="${lx}" y="${ly - 6}" width="14" height="14" fill="${color}" rx="2" opacity="0.85" />`)
      parts.push(`<text x="${lx + 22}" y="${ly + 6}" font-size="18" fill="${text}" font-weight="600">${escText(s.name)}</text>`)
      lx += 22 + estTextWidth(s.name, 18) + 24
    })
  } else if (unit) {
    parts.push(`<text x="${pad.left}" y="18" font-size="16" fill="${muted}">${escText(unit)}</text>`)
  }

  parts.push('</svg>')
  return parts.join('')
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(1)
}

function estTextWidth(s: string, fontSize: number): number {
  // CJK ≈ 1.0 × fontSize, Latin ≈ 0.55
  const cjk = (s.match(/[㐀-鿿぀-ヿ가-힯，。！？]/g) || []).length
  return cjk * fontSize + (s.length - cjk) * fontSize * 0.55
}

function escText(s: string): string {
  return s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!))
}

function escAttr(s: string): string {
  return s.replace(/[<>&"']/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[ch]!))
}

/**
 * Wrap SVG as data URL suitable for <img src> / ImageElement.src.
 * Use base64 (not percent-encoded) so pptxgenjs `addImage` correctly embeds
 * the bytes; browsers handle both.
 */
export function svgToDataUrl(svg: string): string {
  // Node and modern browsers both support btoa via global or Buffer.
  const base64 = typeof Buffer !== 'undefined'
    ? Buffer.from(svg, 'utf-8').toString('base64')
    : btoa(unescape(encodeURIComponent(svg)))
  return `data:image/svg+xml;base64,${base64}`
}
