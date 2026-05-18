"""Process slide → PPTist elements.

Source: { type: 'process', heading, steps: [{ title, desc? }] }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple
from ._common import eyebrow_el, heading_el, rect_shape


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    if eyebrow := slide.get("eyebrow"):
        elements.append(eyebrow_el(eyebrow, theme))
    elements.append(heading_el(slide.get("heading", ""), theme))

    steps: list[dict] = slide.get("steps", [])
    cnt = max(1, len(steps))
    total_w = 1920 - 280
    gap = 32
    each_w = (total_w - gap * (cnt - 1)) / cnt
    top = 300
    height = 600

    for i, step in enumerate(steps):
        x = 140 + i * (each_w + gap)
        # Card background
        elements.append(rect_shape(x=x, y=top, w=each_w, h=height, fill=theme.paper, opacity=1))
        # Step number
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x + 32), "top": sy(top + 24),
            "width": sx(each_w - 64), "height": sy(80),
            "rotate": 0,
            "content": simple(f"{i + 1:02d}", color=theme.accent, font_size_px=sfont(56), bold=True),
            "defaultFontName": theme.font_display,
            "defaultColor": theme.accent,
            "lineHeight": 1,
        })
        # Title
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x + 32), "top": sy(top + 130),
            "width": sx(each_w - 64), "height": sy(120),
            "rotate": 0,
            "content": simple(step.get("title", ""), color=theme.text, font_size_px=sfont(34), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.text,
            "lineHeight": 1.3,
        })
        # Desc
        if desc := step.get("desc"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(x + 32), "top": sy(top + 260),
                "width": sx(each_w - 64), "height": sy(180),
                "rotate": 0,
                "content": simple(desc, color=theme.muted, font_size_px=sfont(22)),
                "defaultFontName": theme.font_body,
                "defaultColor": theme.muted,
                "lineHeight": 1.5,
            })

    return elements
