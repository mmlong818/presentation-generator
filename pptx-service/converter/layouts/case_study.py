"""Case study slide → PPTist elements.

Source: { type: 'case-study', client, clientMeta?, context, challenge, approach,
          results: [{metric, value, delta?}], quote?, quoteAttribution? }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple
from ._common import eyebrow_el, rect_shape


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    if eyebrow := slide.get("eyebrow"):
        elements.append(eyebrow_el(eyebrow, theme))

    # Client + meta
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(120),
        "width": sx(1640), "height": sy(100),
        "rotate": 0,
        "content": simple(slide.get("client", ""), color=theme.text, font_size_px=sfont(64), bold=True),
        "defaultFontName": theme.font_display, "defaultColor": theme.text,
        "lineHeight": 1.2,
    })
    if meta := slide.get("clientMeta"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(230),
            "width": sx(1640), "height": sy(50),
            "rotate": 0,
            "content": simple(meta, color=theme.muted, font_size_px=sfont(24)),
            "defaultFontName": theme.font_body, "defaultColor": theme.muted,
        })

    # Left column: Context / Challenge / Approach
    left_x = 140
    left_w = 980
    left_top = 280
    sections = [
        ("Context", slide.get("context", "")),
        ("Challenge", slide.get("challenge", "")),
        ("Approach", slide.get("approach", "")),
    ]
    section_h = 180
    section_gap = 16
    for i, (label, body) in enumerate(sections):
        y = left_top + i * (section_h + section_gap)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(left_x), "top": sy(y),
            "width": sx(left_w), "height": sy(40),
            "rotate": 0,
            "content": simple(label, color=theme.accent, font_size_px=sfont(22), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.accent,
        })
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(left_x), "top": sy(y + 50),
            "width": sx(left_w), "height": sy(section_h - 50),
            "rotate": 0,
            "content": simple(body, color=theme.text, font_size_px=sfont(22)),
            "defaultFontName": theme.font_body, "defaultColor": theme.text,
            "lineHeight": 1.55,
        })

    # Right column: results panel + optional quote
    right_x = 1180
    right_w = 600
    results = slide.get("results", [])
    rcnt = max(1, len(results))
    r_top = 280
    r_panel_h = 460
    elements.append(rect_shape(x=right_x, y=r_top, w=right_w, h=r_panel_h, fill=theme.accent, opacity=0.08))
    each_r_h = (r_panel_h - 40) / rcnt
    for i, r in enumerate(results):
        y = r_top + 20 + i * each_r_h
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(right_x + 32), "top": sy(y),
            "width": sx(right_w - 64), "height": sy(40),
            "rotate": 0,
            "content": simple(r.get("metric", ""), color=theme.muted, font_size_px=sfont(20), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.muted,
        })
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(right_x + 32), "top": sy(y + 40),
            "width": sx(right_w - 64), "height": sy(70),
            "rotate": 0,
            "content": simple(r.get("value", ""), color=theme.accent, font_size_px=sfont(48), bold=True),
            "defaultFontName": theme.font_display, "defaultColor": theme.accent,
            "lineHeight": 1.1,
        })
        if delta := r.get("delta"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(right_x + 32), "top": sy(y + 110),
                "width": sx(right_w - 64), "height": sy(30),
                "rotate": 0,
                "content": simple(delta, color=theme.muted, font_size_px=sfont(18)),
                "defaultFontName": theme.font_body, "defaultColor": theme.muted,
            })

    if quote := slide.get("quote"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(right_x), "top": sy(880),
            "width": sx(right_w), "height": sy(120),
            "rotate": 0,
            "content": simple(f"“{quote}”", color=theme.text, font_size_px=sfont(22)),
            "defaultFontName": theme.font_body, "defaultColor": theme.text,
            "lineHeight": 1.5,
        })
        if attr := slide.get("quoteAttribution"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(right_x), "top": sy(1000),
                "width": sx(right_w), "height": sy(40),
                "rotate": 0,
                "content": simple(f"— {attr}", color=theme.muted, font_size_px=sfont(18)),
                "defaultFontName": theme.font_body, "defaultColor": theme.muted,
            })

    return elements
