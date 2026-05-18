"""Question slide → PPTist elements.

Source: { type: 'question', question, hints?: string[], invitation? }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple
from ._common import eyebrow_el


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    if eyebrow := slide.get("eyebrow"):
        elements.append(eyebrow_el(eyebrow, theme))

    # Giant ? anchor (left side)
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(220),
        "width": sx(400), "height": sy(500),
        "rotate": 0,
        "content": simple("?", color=theme.accent, font_size_px=sfont(400), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.accent,
        "lineHeight": 1,
    })

    # Question body
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(580), "top": sy(280),
        "width": sx(1200), "height": sy(260),
        "rotate": 0,
        "content": simple(slide.get("question", ""), color=theme.text, font_size_px=sfont(60), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.3,
    })

    # Hints
    hints: list[str] = slide.get("hints") or []
    if hints:
        hints_html = "".join(f"<p>· {h}</p>" for h in hints)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(580), "top": sy(560),
            "width": sx(1200), "height": sy(280),
            "rotate": 0,
            "content": hints_html,
            "defaultFontName": theme.font_body,
            "defaultColor": theme.muted,
            "lineHeight": 1.6,
        })

    # Invitation (footer)
    if inv := slide.get("invitation"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(580), "top": sy(880),
            "width": sx(1200), "height": sy(80),
            "rotate": 0,
            "content": simple(inv, color=theme.accent, font_size_px=sfont(28), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.accent,
        })

    return elements
