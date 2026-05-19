import { describe, expect, it } from 'vitest'
import { buildBrandKit, brandKitToOverride, parseBrandKit, serializeBrandKit } from '@/lib/brandkit'

describe('brandkit', () => {
  it('build → serialize → parse roundtrip', () => {
    const kit = buildBrandKit({
      name: 'Acme 2026',
      theme: 'modern-minimal',
      brand: { accent: '#7c3aed', brandName: 'Acme', logoPlacement: 'cover-only' },
    })
    const json = serializeBrandKit(kit)
    const parsed = parseBrandKit(json)
    expect(parsed.accent).toBe('#7c3aed')
    expect(parsed.theme).toBe('modern-minimal')
    expect(parsed.logoPlacement).toBe('cover-only')
  })

  it('parseBrandKit rejects unknown version', () => {
    expect(() => parseBrandKit(JSON.stringify({ version: 99, name: 'x', theme: 'modern-minimal' }))).toThrow(/版本/)
  })

  it('parseBrandKit rejects missing theme', () => {
    expect(() => parseBrandKit(JSON.stringify({ version: 1, name: 'x' }))).toThrow(/theme/)
  })

  it('brandKitToOverride drops kit-only fields', () => {
    const kit = buildBrandKit({ name: 'n', theme: 'modern-minimal', brand: { accent: '#fff' }, fontDisplay: 'X' })
    const o = brandKitToOverride(kit)
    expect((o as any).fontDisplay).toBeUndefined()
    expect(o.accent).toBe('#fff')
  })
})
