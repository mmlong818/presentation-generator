"""Quadrant slide → PPTist elements (5x5 grid scatter).

Source: { type: 'quadrant', heading, axes, points[5..10], highlight?, source? }
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

    plot_x, plot_y = 280, 280
    plot_w, plot_h = 1200, 680

    # Plot background
    elements.append(rect_shape(x=plot_x, y=plot_y, w=plot_w, h=plot_h, fill=theme.paper, opacity=1))
    # Axes lines (mid)
    elements.append(rect_shape(x=plot_x, y=plot_y + plot_h / 2 - 1, w=plot_w, h=2, fill=theme.border, opacity=1))
    elements.append(rect_shape(x=plot_x + plot_w / 2 - 1, y=plot_y, w=2, h=plot_h, fill=theme.border, opacity=1))

    axes = slide.get("axes") or {}
    x_ax = axes.get("x") or {}
    y_ax = axes.get("y") or {}

    # Axis labels (low/high)
    elements.append({
        "id": nano(), "type": "text",
        "left": sx(plot_x), "top": sy(plot_y + plot_h + 12),
        "width": sx(plot_w / 2), "height": sy(40), "rotate": 0,
        "content": simple(x_ax.get("low", ""), color=theme.muted, font_size_px=sfont(18)),
        "defaultFontName": theme.font_body, "defaultColor": theme.muted,
    })
    elements.append({
        "id": nano(), "type": "text",
        "left": sx(plot_x + plot_w / 2), "top": sy(plot_y + plot_h + 12),
        "width": sx(plot_w / 2), "height": sy(40), "rotate": 0,
        "content": simple(x_ax.get("high", ""), color=theme.muted, font_size_px=sfont(18), align="right"),
        "defaultFontName": theme.font_body, "defaultColor": theme.muted,
    })
    elements.append({
        "id": nano(), "type": "text",
        "left": sx(plot_x + plot_w + 16), "top": sy(plot_y),
        "width": sx(200), "height": sy(40), "rotate": 0,
        "content": simple(y_ax.get("high", ""), color=theme.muted, font_size_px=sfont(18)),
        "defaultFontName": theme.font_body, "defaultColor": theme.muted,
    })
    elements.append({
        "id": nano(), "type": "text",
        "left": sx(plot_x + plot_w + 16), "top": sy(plot_y + plot_h - 40),
        "width": sx(200), "height": sy(40), "rotate": 0,
        "content": simple(y_ax.get("low", ""), color=theme.muted, font_size_px=sfont(18)),
        "defaultFontName": theme.font_body, "defaultColor": theme.muted,
    })
    # Axis name labels
    elements.append({
        "id": nano(), "type": "text",
        "left": sx(plot_x), "top": sy(plot_y + plot_h + 60),
        "width": sx(plot_w), "height": sy(40), "rotate": 0,
        "content": simple(x_ax.get("label", ""), color=theme.text, font_size_px=sfont(theme.caption), bold=True, align="center"),
        "defaultFontName": theme.font_body, "defaultColor": theme.text,
    })

    # Plot points; grid coords 0..4 → cell centers
    highlight = slide.get("highlight")
    points: list[dict] = slide.get("points", [])
    cell_w = plot_w / 5
    cell_h = plot_h / 5
    dot_r = 28
    for p in points:
        gx = max(0, min(4, int(p.get("gridX", 2))))
        gy = max(0, min(4, int(p.get("gridY", 2))))
        # Higher gridY = higher on chart = smaller y
        cx = plot_x + (gx + 0.5) * cell_w
        cy = plot_y + (4 - gy + 0.5) * cell_h
        emph = p.get("id") == highlight
        fill = theme.accent if emph else theme.text
        elements.append({
            "id": nano(), "type": "shape",
            "left": sx(cx - dot_r), "top": sy(cy - dot_r),
            "width": sx(dot_r * 2), "height": sy(dot_r * 2),
            "rotate": 0,
            "viewBox": [200, 200],
            "path": "M 100 0 A 100 100 0 1 0 100 200 A 100 100 0 1 0 100 0 Z",
            "fixedRatio": True,
            "fill": fill,
            "opacity": 1 if emph else 0.7,
        })
        elements.append({
            "id": nano(), "type": "text",
            "left": sx(cx + dot_r + 8), "top": sy(cy - 20),
            "width": sx(220), "height": sy(40), "rotate": 0,
            "content": simple(p.get("label", ""), color=theme.accent if emph else theme.text, font_size_px=sfont(18), bold=emph),
            "defaultFontName": theme.font_body, "defaultColor": theme.text,
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
