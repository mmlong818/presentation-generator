"""Causality chain slide → PPTist elements.

Source: { type: 'causality', heading, chain: [{cause, because?}], conclusion? }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple
from ._common import eyebrow_el, heading_el, rect_shape


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    if eyebrow := slide.get("eyebrow"):
        elements.append(eyebrow_el(eyebrow, theme))
    elements.append(heading_el(slide.get("heading", ""), theme))

    chain: list[dict] = slide.get("chain", [])
    cnt = max(1, len(chain))
    arrow_w = 60
    total_w = 1920 - 280
    node_w = (total_w - arrow_w * (cnt - 1)) / cnt
    top = 300
    node_h = 520

    for i, link in enumerate(chain):
        x = 140 + i * (node_w + arrow_w)
        elements.append(rect_shape(x=x, y=top, w=node_w, h=node_h, fill=theme.paper, opacity=1))
        # Cause label
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x + 24), "top": sy(top + 32),
            "width": sx(node_w - 48), "height": sy(160),
            "rotate": 0,
            "content": simple(link.get("cause", ""), color=theme.text, font_size_px=sfont(theme.caption * 1.3), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.text,
            "lineHeight": 1.35,
        })
        if because := link.get("because"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(x + 24), "top": sy(top + 210),
                "width": sx(node_w - 48), "height": sy(150),
                "rotate": 0,
                "content": simple(f"∵ {because}", color=theme.muted, font_size_px=sfont(theme.caption * 0.9)),
                "defaultFontName": theme.font_body, "defaultColor": theme.muted,
                "lineHeight": 1.5,
            })
        # Arrow between nodes
        if i < cnt - 1:
            ax = x + node_w
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(ax), "top": sy(top + node_h / 2 - 40),
                "width": sx(arrow_w), "height": sy(80),
                "rotate": 0,
                "content": simple("→", color=theme.accent, font_size_px=sfont(theme.section * 0.85), bold=True, align="center"),
                "defaultFontName": theme.font_display, "defaultColor": theme.accent,
                "lineHeight": 1,
            })

    if conclusion := slide.get("conclusion"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(top + node_h + 40),
            "width": sx(1640), "height": sy(80),
            "rotate": 0,
            "content": simple(f"∴ {conclusion}", color=theme.accent, font_size_px=sfont(theme.caption * 1.3), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.accent,
            "lineHeight": 1.4,
        })

    return elements
