"""Data slide → PPTist elements.

Source: { type: 'data', heading, stats: [{ value, label, source? }] }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple


GUTTER = 60


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

    heading_size = theme.section * 1.05
    heading_h = max(160, heading_size * 1.6)
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(pad), "top": sy(120),
        "width": sx(inner_w), "height": sy(heading_h),
        "rotate": 0,
        "content": simple(slide.get("heading", ""), color=theme.text, font_size_px=sfont(heading_size), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.25,
    })

    stats: list[dict] = slide.get("stats", [])
    cnt = max(1, len(stats))
    each_w = (inner_w - GUTTER * (cnt - 1)) / cnt
    stats_top = 120 + heading_h + 60
    value_h = theme.hero * 1.5
    label_size = theme.body
    for i, s in enumerate(stats):
        x = pad + i * (each_w + GUTTER)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x), "top": sy(stats_top),
            "width": sx(each_w), "height": sy(value_h),
            "rotate": 0,
            "content": simple(s.get("value", "—"), color=theme.accent, font_size_px=sfont(theme.hero), bold=True),
            "defaultFontName": theme.font_display,
            "defaultColor": theme.accent,
            "lineHeight": 1.05,
        })
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x), "top": sy(stats_top + value_h + 16),
            "width": sx(each_w), "height": sy(label_size * 2.2),
            "rotate": 0,
            "content": simple(s.get("label", ""), color=theme.text, font_size_px=sfont(label_size), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.text,
            "lineHeight": 1.5,
        })
        if source := s.get("source"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(x), "top": sy(stats_top + value_h + label_size * 2.2 + 24),
                "width": sx(each_w), "height": sy(theme.caption * 2.4),
                "rotate": 0,
                "content": simple(source, color=theme.muted, font_size_px=sfont(theme.caption)),
                "defaultFontName": theme.font_body,
                "defaultColor": theme.muted,
                "lineHeight": 1.5,
            })

    return elements
