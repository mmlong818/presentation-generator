"""Roadmap slide → PPTist elements (lanes × periods grid).

Source: { type: 'roadmap', heading, periods[3-4], lanes[2-4], legend? }
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

    periods: list[str] = slide.get("periods", [])
    lanes: list[dict] = slide.get("lanes", [])
    if not periods or not lanes:
        return elements

    grid_x = 140
    grid_top = 280
    bottom = 1000 if slide.get("legend") else 1040
    lane_label_w = 200
    grid_w = 1920 - 280
    period_col_w = (grid_w - lane_label_w) / len(periods)
    header_h = 60
    lane_h = (bottom - grid_top - header_h) / max(1, len(lanes))

    # Period header
    for i, p in enumerate(periods):
        x = grid_x + lane_label_w + i * period_col_w
        elements.append({
            "id": nano(), "type": "text",
            "left": sx(x + 16), "top": sy(grid_top + 12),
            "width": sx(period_col_w - 32), "height": sy(header_h - 24), "rotate": 0,
            "content": simple(p, color=theme.accent, font_size_px=sfont(theme.caption * 1.1), bold=True, align="center"),
            "defaultFontName": theme.font_body, "defaultColor": theme.accent,
        })
    # Header underline
    elements.append(rect_shape(
        x=grid_x, y=grid_top + header_h - 2,
        w=grid_w, h=2, fill=theme.border, opacity=1,
    ))

    period_index = {p: i for i, p in enumerate(periods)}

    # Lanes
    for li, lane in enumerate(lanes):
        ly = grid_top + header_h + li * lane_h
        # Lane label
        elements.append({
            "id": nano(), "type": "text",
            "left": sx(grid_x), "top": sy(ly + lane_h / 2 - 30),
            "width": sx(lane_label_w - 16), "height": sy(60), "rotate": 0,
            "content": simple(lane.get("name", ""), color=theme.text, font_size_px=sfont(theme.caption * 1.1), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.text,
            "lineHeight": 1.3,
        })
        # Lane row separator (top)
        if li > 0:
            elements.append(rect_shape(
                x=grid_x, y=ly, w=grid_w, h=1,
                fill=theme.border, opacity=0.5,
            ))

        for ms in lane.get("items", []):
            pi = period_index.get(ms.get("period", ""))
            if pi is None:
                continue
            span = max(1, int(ms.get("span", 1) or 1))
            span = min(span, len(periods) - pi)
            mx = grid_x + lane_label_w + pi * period_col_w + 12
            mw = period_col_w * span - 24
            mh = min(lane_h - 24, 80)
            my = ly + (lane_h - mh) / 2
            emph = bool(ms.get("emphasis"))
            elements.append(rect_shape(
                x=mx, y=my, w=mw, h=mh,
                fill=theme.accent if emph else theme.paper,
                opacity=1 if emph else 1,
            ))
            elements.append({
                "id": nano(), "type": "text",
                "left": sx(mx + 16), "top": sy(my + 14),
                "width": sx(mw - 32), "height": sy(mh - 28), "rotate": 0,
                "content": simple(
                    ms.get("label", ""),
                    color=theme.bg if emph else theme.text,
                    font_size_px=sfont(theme.caption * 0.9), bold=emph,
                ),
                "defaultFontName": theme.font_body,
                "defaultColor": theme.bg if emph else theme.text,
                "lineHeight": 1.3,
            })

    if legend := slide.get("legend"):
        elements.append({
            "id": nano(), "type": "text",
            "left": sx(140), "top": sy(1020),
            "width": sx(1640), "height": sy(40), "rotate": 0,
            "content": simple(legend, color=theme.muted, font_size_px=sfont(18)),
            "defaultFontName": theme.font_body, "defaultColor": theme.muted,
        })

    return elements
