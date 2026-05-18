"""KPI board slide → PPTist elements.

Source: { type: 'kpi-board', heading, period, kpis[4|6], takeaway? }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple
from ._common import eyebrow_el, rect_shape


_TONE_COLOR = {
    "pos": "#22c55e",
    "neg": "#ef4444",
    "flat": None,  # falls back to muted
}


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    elements: list[dict] = []
    if eyebrow := slide.get("eyebrow"):
        elements.append(eyebrow_el(eyebrow, theme))

    # Heading + period on same band
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(120),
        "width": sx(1200), "height": sy(120),
        "rotate": 0,
        "content": simple(slide.get("heading", ""), color=theme.text, font_size_px=sfont(64), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.2,
    })
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(1340), "top": sy(160),
        "width": sx(440), "height": sy(60),
        "rotate": 0,
        "content": simple(slide.get("period", ""), color=theme.muted, font_size_px=sfont(28), align="right"),
        "defaultFontName": theme.font_body,
        "defaultColor": theme.muted,
    })

    kpis: list[dict] = slide.get("kpis", [])
    cnt = len(kpis)
    cols = 3 if cnt == 6 else 2 if cnt == 4 else min(4, max(1, cnt))
    rows = (cnt + cols - 1) // cols if cnt else 1
    gap = 24
    grid_top = 300
    grid_h = 1080 - grid_top - 140
    cell_w = (1920 - 280 - gap * (cols - 1)) / cols
    cell_h = (grid_h - gap * (rows - 1)) / rows if rows else grid_h

    for i, kpi in enumerate(kpis):
        r = i // cols
        c = i % cols
        x = 140 + c * (cell_w + gap)
        y = grid_top + r * (cell_h + gap)
        elements.append(rect_shape(x=x, y=y, w=cell_w, h=cell_h, fill=theme.paper, opacity=1))

        # Label (top)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x + 32), "top": sy(y + 24),
            "width": sx(cell_w - 64), "height": sy(50),
            "rotate": 0,
            "content": simple(kpi.get("label", ""), color=theme.muted, font_size_px=sfont(22), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.muted,
        })
        # Value (huge)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x + 32), "top": sy(y + 90),
            "width": sx(cell_w - 64), "height": sy(120),
            "rotate": 0,
            "content": simple(kpi.get("value", ""), color=theme.text, font_size_px=sfont(72), bold=True),
            "defaultFontName": theme.font_display, "defaultColor": theme.text,
            "lineHeight": 1.1,
        })
        # Delta
        if delta := kpi.get("delta"):
            tone = kpi.get("deltaTone", "flat")
            color = _TONE_COLOR.get(tone) or theme.muted
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(x + 32), "top": sy(y + 220),
                "width": sx(cell_w - 64), "height": sy(50),
                "rotate": 0,
                "content": simple(delta, color=color, font_size_px=sfont(26), bold=True),
                "defaultFontName": theme.font_body, "defaultColor": color,
            })
        # Hint
        if hint := kpi.get("hint"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(x + 32), "top": sy(y + cell_h - 60),
                "width": sx(cell_w - 64), "height": sy(40),
                "rotate": 0,
                "content": simple(hint, color=theme.muted, font_size_px=sfont(18)),
                "defaultFontName": theme.font_body, "defaultColor": theme.muted,
            })

    if take := slide.get("takeaway"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(1000),
            "width": sx(1640), "height": sy(60),
            "rotate": 0,
            "content": simple(f"→ {take}", color=theme.accent, font_size_px=sfont(24), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.accent,
        })

    return elements
