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
    pad = theme.padding
    inner_w = 1920 - 2 * pad

    if eyebrow := slide.get("eyebrow"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(pad), "top": sy(180),
            "width": sx(inner_w), "height": sy(60),
            "rotate": 0,
            "content": simple(eyebrow, color=theme.accent, font_size_px=sfont(theme.caption), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.accent,
        })

    title = slide.get("title", "")
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(pad), "top": sy(360),
        "width": sx(inner_w), "height": sy(380),
        "rotate": 0,
        "content": with_highlight(
            title,
            slide.get("highlight"),
            base_color=theme.text,
            accent_color=theme.accent,
            font_size_px=sfont(theme.hero),
            bold=True,
        ),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.15,
    })

    if subtitle := slide.get("subtitle"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(pad), "top": sy(770),
            "width": sx(inner_w), "height": sy(100),
            "rotate": 0,
            "content": simple(subtitle, color=theme.muted, font_size_px=sfont(theme.body * 0.95)),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.muted,
            "lineHeight": 1.4,
        })

    return elements
