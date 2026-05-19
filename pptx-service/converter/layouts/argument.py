"""Argument slide → PPTist elements.

Source: { type: 'argument', heading, highlight?, points: string[] }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple, with_highlight


HEADING_Y = 120
POINTS_TOP = 320
POINT_GAP = 28


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    pad = theme.padding
    inner_w = 1920 - 2 * pad

    if eyebrow := slide.get("eyebrow"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(pad), "top": sy(60),
            "width": sx(inner_w), "height": sy(40),
            "rotate": 0,
            "content": simple(eyebrow, color=theme.accent, font_size_px=sfont(theme.caption), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.accent,
        })

    heading = slide.get("heading", "")
    heading_size = theme.section * 1.1
    heading_h = max(160, heading_size * 1.6)
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(pad), "top": sy(HEADING_Y),
        "width": sx(inner_w), "height": sy(heading_h),
        "rotate": 0,
        "content": with_highlight(
            heading,
            slide.get("highlight"),
            base_color=theme.text,
            accent_color=theme.accent,
            font_size_px=sfont(heading_size),
            bold=True,
        ),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.25,
    })

    points: list[str] = slide.get("points", [])
    point_count = max(1, len(points))
    points_top = HEADING_Y + heading_h + 40
    available_h = 1080 - points_top - 100
    each_h = (available_h - POINT_GAP * (point_count - 1)) / point_count
    for i, p in enumerate(points):
        y = points_top + i * (each_h + POINT_GAP)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(pad), "top": sy(y),
            "width": sx(inner_w), "height": sy(each_h),
            "rotate": 0,
            "content": simple(p, color=theme.muted, font_size_px=sfont(theme.body)),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.muted,
            "lineHeight": 1.5,
        })

    return elements
