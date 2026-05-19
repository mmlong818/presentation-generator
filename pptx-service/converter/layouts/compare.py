"""Compare slide → PPTist elements.

Source: { type: 'compare', heading, left: {title, items[]}, right: {title, items[]} }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple


PANEL_TOP = 280
PANEL_H = 700
PANEL_PAD = 40
GUTTER = 40


def _panel(
    x: float, w: float, top: float, h: float,
    data: dict[str, Any], theme, accent: bool,
) -> list[dict]:
    out: list[dict] = []
    # Panel background rectangle
    out.append({
        "id": nano(),
        "type": "shape",
        "left": sx(x), "top": sy(top),
        "width": sx(w), "height": sy(h),
        "rotate": 0,
        "viewBox": [200, 200],
        "path": "M 0 0 L 200 0 L 200 200 L 0 200 Z",
        "fixedRatio": False,
        "fill": theme.paper if not accent else theme.accent,
        "opacity": 1 if not accent else 0.08,
    })
    # Title
    out.append({
        "id": nano(),
        "type": "text",
        "left": sx(x + PANEL_PAD), "top": sy(top + PANEL_PAD),
        "width": sx(w - 2 * PANEL_PAD), "height": sy(60),
        "rotate": 0,
        "content": simple(
            data.get("title", ""),
            color=theme.accent if accent else theme.muted,
            font_size_px=sfont(theme.caption * 1.3),
            bold=True,
        ),
        "defaultFontName": theme.font_body,
        "defaultColor": theme.accent if accent else theme.muted,
    })
    # Items as bullet paragraphs (one text element with multiple <p>)
    items: list[str] = data.get("items", [])
    items_html = "".join(
        f'<p>• {item}</p>' for item in items
    )
    if items_html:
        out.append({
            "id": nano(),
            "type": "text",
            "left": sx(x + PANEL_PAD), "top": sy(top + PANEL_PAD + 80),
            "width": sx(w - 2 * PANEL_PAD), "height": sy(h - PANEL_PAD * 2 - 80),
            "rotate": 0,
            "content": items_html,
            "defaultFontName": theme.font_body,
            "defaultColor": theme.text,
            "lineHeight": 1.7,
        })
    return out


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    # eyebrow
    if eyebrow := slide.get("eyebrow"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(60),
            "width": sx(1640), "height": sy(40),
            "rotate": 0,
            "content": simple(eyebrow, color=theme.accent, font_size_px=sfont(theme.caption), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.accent,
        })

    # heading
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(120),
        "width": sx(1640), "height": sy(140),
        "rotate": 0,
        "content": simple(slide.get("heading", ""), color=theme.text, font_size_px=sfont(theme.section), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.3,
    })

    # Two panels side by side
    total_w = 1920 - 280  # 140 each side
    panel_w = (total_w - GUTTER) / 2
    elements.extend(_panel(140, panel_w, PANEL_TOP, PANEL_H, slide.get("left", {}), theme, accent=False))
    elements.extend(_panel(140 + panel_w + GUTTER, panel_w, PANEL_TOP, PANEL_H, slide.get("right", {}), theme, accent=True))

    return elements
