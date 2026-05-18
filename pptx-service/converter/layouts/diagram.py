"""Diagram slide → PPTist elements (placeholder rendering).

Source: { type: 'diagram', heading, hint }
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

    # Hint area — placeholder canvas
    elements.append(rect_shape(x=140, y=280, w=1640, h=680, fill=theme.paper, opacity=1))
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(590),
        "width": sx(1640), "height": sy(100),
        "rotate": 0,
        "content": simple(slide.get("hint", ""), color=theme.muted, font_size_px=sfont(32), align="center"),
        "defaultFontName": theme.font_body,
        "defaultColor": theme.muted,
        "lineHeight": 1.5,
    })

    return elements
