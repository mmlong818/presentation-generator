"""Timeline slide → PPTist elements.

Source: { type: 'timeline', heading, events: [{ time, title, desc? }] }
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

    events: list[dict] = slide.get("events", [])
    cnt = max(1, len(events))
    total_w = 1920 - 280
    gap = 24
    each_w = (total_w - gap * (cnt - 1)) / cnt

    rail_y = 380
    rail_h = 4
    # Horizontal rail
    elements.append(rect_shape(x=140, y=rail_y, w=total_w, h=rail_h, fill=theme.border, opacity=1))

    node = 24
    for i, ev in enumerate(events):
        x = 140 + i * (each_w + gap)
        col_cx = x + each_w / 2
        # Node dot
        elements.append({
            "id": nano(),
            "type": "shape",
            "left": sx(col_cx - node / 2), "top": sy(rail_y + rail_h / 2 - node / 2),
            "width": sx(node), "height": sy(node),
            "rotate": 0,
            "viewBox": [200, 200],
            "path": "M 100 0 A 100 100 0 1 0 100 200 A 100 100 0 1 0 100 0 Z",
            "fixedRatio": True,
            "fill": theme.accent,
            "opacity": 1,
        })
        # Time (above rail)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x), "top": sy(rail_y - 100),
            "width": sx(each_w), "height": sy(60),
            "rotate": 0,
            "content": simple(ev.get("time", ""), color=theme.accent, font_size_px=sfont(theme.caption * 1.3), bold=True, align="center"),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.accent,
        })
        # Title (below rail)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x), "top": sy(rail_y + 60),
            "width": sx(each_w), "height": sy(100),
            "rotate": 0,
            "content": simple(ev.get("title", ""), color=theme.text, font_size_px=sfont(theme.caption * 1.3), bold=True, align="center"),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.text,
            "lineHeight": 1.4,
        })
        # Desc
        if desc := ev.get("desc"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(x), "top": sy(rail_y + 180),
                "width": sx(each_w), "height": sy(200),
                "rotate": 0,
                "content": simple(desc, color=theme.muted, font_size_px=sfont(theme.caption * 0.9), align="center"),
                "defaultFontName": theme.font_body,
                "defaultColor": theme.muted,
                "lineHeight": 1.5,
            })

    return elements
