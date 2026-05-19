// Lightweight i18n without external deps.
//
// Reads locale from URL ?lang=en, localStorage `pg_lang`, or `navigator.language`.
// Exposes a string-keyed dictionary with zh (default) and en. Components call
// `t('common.export')` etc. Falls back to zh if a key is missing in en.

'use client'

import { useEffect, useState } from 'react'

export type Locale = 'zh' | 'en'

const DICT: Record<string, { zh: string; en: string }> = {
  // Common
  'common.export': { zh: '导出', en: 'Export' },
  'common.undo': { zh: '撤销', en: 'Undo' },
  'common.redo': { zh: '重做', en: 'Redo' },
  'common.delete': { zh: '删除', en: 'Delete' },
  'common.cancel': { zh: '取消', en: 'Cancel' },
  'common.save': { zh: '保存', en: 'Save' },
  'common.loading': { zh: '加载中…', en: 'Loading…' },
  'common.error': { zh: '出错', en: 'Error' },
  'common.back': { zh: '返回', en: 'Back' },

  // Deck editor
  'deck.title': { zh: '编辑器', en: 'Editor' },
  'deck.new_slide': { zh: '新增', en: 'New' },
  'deck.new_layout': { zh: '版式', en: 'Layout' },
  'deck.blank': { zh: '空白', en: 'Blank' },
  'deck.duplicate': { zh: '复制', en: 'Duplicate' },
  'deck.change_layout': { zh: '切换版式', en: 'Change Layout' },
  'deck.add_text': { zh: '+ 文本', en: '+ Text' },
  'deck.add_image': { zh: '+ 图片', en: '+ Image' },
  'deck.add_icon': { zh: '+ 图标', en: '+ Icon' },
  'deck.present': { zh: '▶ 演讲', en: '▶ Present' },
  'deck.theme': { zh: '主题', en: 'Theme' },

  // Inspector
  'insp.title': { zh: 'Inspector', en: 'Inspector' },
  'insp.position': { zh: '位置 / 尺寸', en: 'Position / Size' },
  'insp.rotation': { zh: '旋转', en: 'Rotation' },
  'insp.font': { zh: '字体', en: 'Font' },
  'insp.font_size': { zh: '字号', en: 'Size' },
  'insp.color': { zh: '颜色', en: 'Color' },
  'insp.fill': { zh: '填充', en: 'Fill' },
  'insp.stroke': { zh: '描边', en: 'Stroke' },
  'insp.opacity': { zh: '透明度', en: 'Opacity' },
  'insp.animation': { zh: '入场动画 (演讲模式)', en: 'Entry Animation (Present)' },
  'insp.highlight': { zh: '高亮 (跨行整词不断)', en: 'Highlight (no-wrap)' },

  // Animation kinds
  'anim.none': { zh: '无', en: 'None' },
  'anim.fade': { zh: '淡入', en: 'Fade' },
  'anim.slide-up': { zh: '上滑', en: 'Slide Up' },
  'anim.slide-down': { zh: '下滑', en: 'Slide Down' },
  'anim.slide-left': { zh: '左滑', en: 'Slide Left' },
  'anim.slide-right': { zh: '右滑', en: 'Slide Right' },
  'anim.scale': { zh: '缩放', en: 'Scale' },
  'anim.zoom': { zh: '放大', en: 'Zoom' },

  // Present
  'present.next': { zh: '下一张', en: 'Next' },
  'present.notes': { zh: '备注', en: 'Notes' },
  'present.timer': { zh: '计时', en: 'Timer' },
  'present.speaker_view': { zh: '演讲者视图', en: 'Speaker View' },
  'present.fullscreen': { zh: '全屏', en: 'Fullscreen' },
  'present.exit_editor': { zh: '回编辑', en: 'Back to Editor' },
  'present.hint': { zh: '← → 翻页 · F 切换面板 · P 全屏 · Esc 退出', en: '← → Navigate · F Speaker · P Fullscreen · Esc Exit' },

  // Export menu
  'export.pptx': { zh: 'PPTX', en: 'PPTX' },
  'export.html': { zh: 'HTML 自包含', en: 'HTML (self-contained)' },
  'export.pdf': { zh: 'PDF (浏览器打印)', en: 'PDF (browser print)' },
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'
  const url = new URLSearchParams(window.location.search).get('lang') as Locale | null
  if (url === 'en' || url === 'zh') {
    localStorage.setItem('pg_lang', url)
    return url
  }
  const stored = localStorage.getItem('pg_lang') as Locale | null
  if (stored === 'en' || stored === 'zh') return stored
  if (navigator.language?.startsWith('en')) return 'en'
  return 'zh'
}

export function t(key: string, locale: Locale = 'zh'): string {
  const entry = DICT[key]
  if (!entry) return key
  return entry[locale] || entry.zh
}

export function useT(): { t: (key: string) => string; locale: Locale; setLocale: (l: Locale) => void } {
  const [locale, setLocaleState] = useState<Locale>('zh')
  useEffect(() => { setLocaleState(detectLocale()) }, [])
  const setLocale = (l: Locale) => {
    if (typeof window !== 'undefined') localStorage.setItem('pg_lang', l)
    setLocaleState(l)
    // Trigger re-render via reload to refresh server-rendered strings if any.
    // (Most strings are client-only so soft update suffices.)
  }
  return { t: (k: string) => t(k, locale), locale, setLocale }
}
