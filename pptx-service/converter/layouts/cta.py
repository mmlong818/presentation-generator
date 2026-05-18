"""CTA slide → PPTist elements.

Source: { type: 'cta', oldQuestion?, newAction, highlight? }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import TextRun, paragraph, simple, with_highlight
from ._common import eyebrow_el


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    if eyebrow := slide.get("eyebrow"):
        elements.append(eyebrow_el(eyebrow, theme))

    # Optional old question (struck through, muted)
    y = 280
    if old := slide.get("oldQuestion"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(y),
            "width": sx(1640), "height": sy(120),
            "rotate": 0,
            "content": paragraph([
                TextRun(old, color=theme.muted, font_size_px=sfont(44)),
            ]),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.muted,
            "lineHeight": 1.4,
        })
        y += 160

    # New action — large display text
    new_action = slide.get("newAction", "")
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(y),
        "width": sx(1640), "height": sy(480),
        "rotate": 0,
        "content": with_highlight(
            new_action,
            slide.get("highlight"),
            base_color=theme.text,
            accent_color=theme.accent,
            font_size_px=sfont(96),
            bold=True,
        ),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.25,
    })

    return elements
