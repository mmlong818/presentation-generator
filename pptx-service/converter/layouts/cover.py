"""Cover slide → PPTist elements.

Source: { type: 'cover', title, subtitle?, highlight?, eyebrow? }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple, with_highlight


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    # eyebrow (top-left, small accent)
    if eyebrow := slide.get("eyebrow"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(180),
            "width": sx(1640), "height": sy(60),
            "rotate": 0,
            "content": simple(eyebrow, color=theme.accent, font_size_px=sfont(22), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.accent,
        })

    # title (large display, vertical center area)
    title = slide.get("title", "")
    title_fs = sfont(120)
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(360),
        "width": sx(1640), "height": sy(360),
        "rotate": 0,
        "content": with_highlight(
            title,
            slide.get("highlight"),
            base_color=theme.text,
            accent_color=theme.accent,
            font_size_px=title_fs,
            bold=True,
        ),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.2,
    })

    # subtitle (below title)
    if subtitle := slide.get("subtitle"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(760),
            "width": sx(1640), "height": sy(100),
            "rotate": 0,
            "content": simple(subtitle, color=theme.muted, font_size_px=sfont(32)),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.muted,
            "lineHeight": 1.4,
        })

    return elements
