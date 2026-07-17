import { describe, expect, it } from 'vitest'
import { composeSlide } from '@/lib/editor/compose/layouts'
import { resolveTheme } from '@/lib/editor/theme'
import { CANVAS_W, type EllipseElement, type TextElement } from '@/lib/editor/types'
import type { DataSlide, ProcessSlide } from '@/lib/types'

const theme = resolveTheme('modern-minimal')

describe('priority layout composition', () => {
  it('gives the first of three data points clear visual priority', () => {
    const slide: DataSlide = {
      type: 'data',
      heading: '关键指标',
      stats: [
        { value: '85%', label: '用户留存率' },
        { value: '3.2×', label: '效率提升' },
        { value: '¥120万', label: '年度节省' },
      ],
    }

    const heroes = composeSlide(slide, theme, 1, 1)
      .filter((element): element is TextElement => element.type === 'text' && element.role === 'hero')

    expect(heroes.map(element => element.text)).toEqual(['85%', '3.2×', '¥120万'])
    expect(heroes[0].color).toBe(theme.accent)
    expect(heroes[0].fontSize).toBeGreaterThan(heroes[1].fontSize)
    expect(heroes[1].color).toBe(theme.text)
    expect(heroes[2].color).toBe(theme.text)
  })

  it('keeps the adaptive grid for five data points', () => {
    const slide: DataSlide = {
      type: 'data',
      heading: '五项指标',
      stats: Array.from({ length: 5 }, (_, index) => ({ value: `${index + 1}0%`, label: `指标 ${index + 1}` })),
    }

    const heroes = composeSlide(slide, theme, 1, 1)
      .filter((element): element is TextElement => element.type === 'text' && element.role === 'hero')

    expect(heroes).toHaveLength(5)
    expect(new Set(heroes.map(element => element.fontSize)).size).toBe(1)
  })

  it('uses a connected rail instead of step cards for process slides', () => {
    const slide: ProcessSlide = {
      type: 'process',
      heading: '从想法到落地',
      steps: Array.from({ length: 6 }, (_, index) => ({
        title: `步骤 ${index + 1}`,
        desc: `完成第 ${index + 1} 个动作`,
      })),
    }

    const elements = composeSlide(slide, theme, 1, 1)
    const markers = elements.filter((element): element is EllipseElement => element.type === 'ellipse')
    const rails = elements.filter(element => element.type === 'line')

    expect(markers).toHaveLength(6)
    expect(rails).toHaveLength(1)
    expect(new Set(markers.map(marker => marker.y)).size).toBe(1)
    expect(markers.every(marker => marker.stroke === theme.accent)).toBe(true)
    expect(markers.every(marker => marker.x >= 0 && marker.x + marker.w <= CANVAS_W)).toBe(true)
    expect(elements.some(element => element.type === 'rect')).toBe(false)
  })
})
