"""Argument slide → PPTist elements.

Source: { type: 'argument', heading, highlight?, points: string[] }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple, with_highlight


HEADING_Y = 120
HEADING_H = 200
POINTS_TOP = 320
POINT_GAP = 32
POINT_H = 100


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
            "content": simple(eyebrow, color=theme.accent, font_size_px=sfont(22), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.accent,
        })

    # heading
    heading = slide.get("heading", "")
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(HEADING_Y),
        "width": sx(1640), "height": sy(HEADING_H),
        "rotate": 0,
        "content": with_highlight(
            heading,
            slide.get("highlight"),
            base_color=theme.text,
            accent_color=theme.accent,
            font_size_px=sfont(80),
            bold=True,
        ),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.3,
    })

    # points
    points: list[str] = slide.get("points", [])
    point_count = max(1, len(points))
    available_h = 1080 - POINTS_TOP - 120  # 120 footer reserve
    each_h = min(POINT_H, (available_h - POINT_GAP * (point_count - 1)) / point_count)
    for i, p in enumerate(points):
        y = POINTS_TOP + i * (each_h + POINT_GAP)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(y),
            "width": sx(1640), "height": sy(each_h),
            "rotate": 0,
            "content": simple(p, color=theme.muted, font_size_px=sfont(36)),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.muted,
            "lineHeight": 1.5,
        })

    return elements
