"""Quote slide → PPTist elements.

Source: { type: 'quote', quote, source, highlight? }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple, with_highlight


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []

    # Giant decorative quote mark
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(220),
        "width": sx(200), "height": sy(200),
        "rotate": 0,
        "content": simple("“", color=theme.accent, font_size_px=sfont(220), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.accent,
        "lineHeight": 1,
    })

    quote = slide.get("quote", "")
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(360), "top": sy(320),
        "width": sx(1420), "height": sy(440),
        "rotate": 0,
        "content": with_highlight(
            quote,
            slide.get("highlight"),
            base_color=theme.text,
            accent_color=theme.accent,
            font_size_px=sfont(56),
            bold=False,
        ),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.4,
    })

    if source := slide.get("source"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(360), "top": sy(820),
            "width": sx(1420), "height": sy(80),
            "rotate": 0,
            "content": simple(f"— {source}", color=theme.muted, font_size_px=sfont(theme.caption * 1.3)),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.muted,
        })

    return elements
