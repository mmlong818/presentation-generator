"""Chart bar slide → PPTist elements (horizontal bars rendered as shape rects).

Source: { type: 'chart-bar', heading, unit, bars: [{label, value, note?}], highlight?, source? }

We render with shape rectangles instead of PPTist's native chart, because the chart
element requires d3-compatible series data we can't reliably construct cross-version.
The shape-based render is visually faithful and editable.
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

    bars: list[dict] = slide.get("bars", [])
    if not bars:
        return elements

    unit = slide.get("unit", "")
    highlight = slide.get("highlight")
    max_v = max((b.get("value", 0) for b in bars), default=1) or 1

    chart_x = 140
    chart_top = 300
    chart_bot = 1000 if slide.get("source") else 1040
    chart_h = chart_bot - chart_top
    label_w = 360
    bar_area_x = chart_x + label_w + 20
    bar_area_w = 1920 - 140 - bar_area_x  # leaves right margin
    cnt = len(bars)
    gap = 20
    row_h = (chart_h - gap * (cnt - 1)) / cnt

    bar_h = min(row_h - 12, 64)
    # Reserve right-side space for the value text so bars don't run off canvas
    val_reserve = 140
    bar_area_w_eff = bar_area_w - val_reserve
    right_edge = bar_area_x + bar_area_w  # absolute right boundary for note

    for i, b in enumerate(bars):
        y = chart_top + i * (row_h + gap)
        # Anchor everything to the bar's vertical centerline
        by = y + (row_h - bar_h) / 2
        emph = b.get("label") == highlight

        # Label — same y/height as the bar so they sit on one line
        elements.append({
            "id": nano(), "type": "text",
            "left": sx(chart_x), "top": sy(by),
            "width": sx(label_w), "height": sy(bar_h), "rotate": 0,
            "content": simple(b.get("label", ""), color=theme.accent if emph else theme.text, font_size_px=sfont(28), bold=emph),
            "defaultFontName": theme.font_body, "defaultColor": theme.text,
            "lineHeight": 1.2,
        })

        # Bar
        v = b.get("value", 0)
        bw = bar_area_w_eff * (v / max_v) if max_v else 0
        elements.append(rect_shape(
            x=bar_area_x, y=by, w=max(2, bw), h=bar_h,
            fill=theme.accent if emph else theme.text,
            opacity=1 if emph else 0.6,
        ))

        # Value label — fixed width slot immediately right of bar
        val_text = f"{v}{unit}"
        val_left = bar_area_x + bw + 12
        elements.append({
            "id": nano(), "type": "text",
            "left": sx(val_left), "top": sy(by),
            "width": sx(val_reserve - 12), "height": sy(bar_h), "rotate": 0,
            "content": simple(val_text, color=theme.accent if emph else theme.text, font_size_px=sfont(26), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.text,
            "lineHeight": 1.2,
        })

        # Note — below the bar (full bar width, small caption)
        if note := b.get("note"):
            note_top = by + bar_h + 4
            elements.append({
                "id": nano(), "type": "text",
                "left": sx(bar_area_x), "top": sy(note_top),
                "width": sx(min(bar_area_w_eff, right_edge - bar_area_x)),
                "height": sy(28), "rotate": 0,
                "content": simple(note, color=theme.muted, font_size_px=sfont(16)),
                "defaultFontName": theme.font_body, "defaultColor": theme.muted,
                "lineHeight": 1.2,
            })

    if source := slide.get("source"):
        elements.append({
            "id": nano(), "type": "text",
            "left": sx(140), "top": sy(1020),
            "width": sx(1640), "height": sy(40), "rotate": 0,
            "content": simple(f"来源：{source}", color=theme.muted, font_size_px=sfont(18)),
            "defaultFontName": theme.font_body, "defaultColor": theme.muted,
        })

    return elements
