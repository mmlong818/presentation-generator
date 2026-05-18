"""Data slide → PPTist elements.

Source: { type: 'data', heading, stats: [{ value, label, source? }] }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple


STATS_TOP = 320
STATS_H = 480
GUTTER = 60


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
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(120),
        "width": sx(1640), "height": sy(180),
        "rotate": 0,
        "content": simple(slide.get("heading", ""), color=theme.text, font_size_px=sfont(80), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.3,
    })

    stats: list[dict] = slide.get("stats", [])
    cnt = max(1, len(stats))
    total_w = 1920 - 280
    each_w = (total_w - GUTTER * (cnt - 1)) / cnt
    for i, s in enumerate(stats):
        x = 140 + i * (each_w + GUTTER)
        # value (huge number)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x), "top": sy(STATS_TOP),
            "width": sx(each_w), "height": sy(180),
            "rotate": 0,
            "content": simple(s.get("value", "—"), color=theme.accent, font_size_px=sfont(120), bold=True),
            "defaultFontName": theme.font_display,
            "defaultColor": theme.accent,
            "lineHeight": 1.05,
        })
        # label
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x), "top": sy(STATS_TOP + 200),
            "width": sx(each_w), "height": sy(80),
            "rotate": 0,
            "content": simple(s.get("label", ""), color=theme.text, font_size_px=sfont(34), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.text,
            "lineHeight": 1.5,
        })
        # source (italic, small)
        if source := s.get("source"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(x), "top": sy(STATS_TOP + 300),
                "width": sx(each_w), "height": sy(60),
                "rotate": 0,
                "content": simple(source, color=theme.muted, font_size_px=sfont(22)),
                "defaultFontName": theme.font_body,
                "defaultColor": theme.muted,
                "lineHeight": 1.5,
            })

    return elements
