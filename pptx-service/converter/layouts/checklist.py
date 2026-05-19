"""Checklist slide → PPTist elements.

Source: { type: 'checklist', heading, items: string[] }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple
from ._common import eyebrow_el, heading_el


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    if eyebrow := slide.get("eyebrow"):
        elements.append(eyebrow_el(eyebrow, theme))
    elements.append(heading_el(slide.get("heading", ""), theme))

    items: list[str] = slide.get("items", [])
    cnt = max(1, len(items))
    top = 300
    avail = 1080 - top - 120
    row_h = min(96, (avail - 24 * (cnt - 1)) / cnt) if cnt else 96
    gap = 24

    box = 56
    for i, item in enumerate(items):
        y = top + i * (row_h + gap)
        # Check mark box
        elements.append({
            "id": nano(),
            "type": "shape",
            "left": sx(140), "top": sy(y + (row_h - box) / 2),
            "width": sx(box), "height": sy(box),
            "rotate": 0,
            "viewBox": [200, 200],
            "path": "M 0 0 L 200 0 L 200 200 L 0 200 Z",
            "fixedRatio": True,
            "fill": theme.accent,
            "opacity": 1,
        })
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(y + (row_h - box) / 2),
            "width": sx(box), "height": sy(box),
            "rotate": 0,
            "content": simple("✓", color=theme.bg, font_size_px=sfont(theme.body * 1.15), bold=True, align="center"),
            "defaultFontName": theme.font_display,
            "defaultColor": theme.bg,
            "lineHeight": 1,
        })
        # Label
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140 + box + 32), "top": sy(y),
            "width": sx(1640 - box - 32), "height": sy(row_h),
            "rotate": 0,
            "content": simple(item, color=theme.text, font_size_px=sfont(theme.body)),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.text,
            "lineHeight": 1.5,
        })

    return elements
