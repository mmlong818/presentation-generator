"""Matrix 2x2 slide → PPTist elements.

Source: { type: 'matrix-2x2', heading, axes, cells[4], takeaway? }
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

    # Grid area (leaving room for axis labels)
    grid_x = 240
    grid_y = 280
    grid_w = 1500
    grid_h = 680
    gap = 16
    cell_w = (grid_w - gap) / 2
    cell_h = (grid_h - gap) / 2

    cells = slide.get("cells") or []
    positions = [
        (grid_x, grid_y),                             # top-left
        (grid_x + cell_w + gap, grid_y),              # top-right
        (grid_x, grid_y + cell_h + gap),              # bottom-left
        (grid_x + cell_w + gap, grid_y + cell_h + gap),  # bottom-right
    ]
    for i, (cx, cy) in enumerate(positions):
        if i >= len(cells):
            break
        cell = cells[i]
        emph = bool(cell.get("emphasis"))
        elements.append(rect_shape(
            x=cx, y=cy, w=cell_w, h=cell_h,
            fill=theme.accent if emph else theme.paper,
            opacity=0.15 if emph else 1,
        ))
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(cx + 28), "top": sy(cy + 24),
            "width": sx(cell_w - 56), "height": sy(70),
            "rotate": 0,
            "content": simple(cell.get("label", ""), color=theme.accent if emph else theme.text, font_size_px=sfont(theme.body * 0.95), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.accent if emph else theme.text,
        })
        if desc := cell.get("desc"):
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(cx + 28), "top": sy(cy + 110),
                "width": sx(cell_w - 56), "height": sy(cell_h - 130),
                "rotate": 0,
                "content": simple(desc, color=theme.muted, font_size_px=sfont(theme.caption * 0.9)),
                "defaultFontName": theme.font_body,
                "defaultColor": theme.muted,
                "lineHeight": 1.5,
            })

    # Axis labels
    axes = slide.get("axes") or {}
    x_ax = axes.get("x") or {}
    y_ax = axes.get("y") or {}
    # x low (bottom-left) / x high (bottom-right)
    label_y = grid_y + grid_h - 8
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(grid_x), "top": sy(label_y),
        "width": sx(grid_w / 2), "height": sy(40),
        "rotate": 0,
        "content": simple(x_ax.get("low", ""), color=theme.muted, font_size_px=sfont(theme.caption * 0.9)),
        "defaultFontName": theme.font_body, "defaultColor": theme.muted,
    })
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(grid_x + grid_w / 2), "top": sy(label_y),
        "width": sx(grid_w / 2), "height": sy(40),
        "rotate": 0,
        "content": simple(x_ax.get("high", ""), color=theme.muted, font_size_px=sfont(theme.caption * 0.9), align="right"),
        "defaultFontName": theme.font_body, "defaultColor": theme.muted,
    })
    # y high (top, left of grid) / y low (bottom, left of grid)
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(60), "top": sy(grid_y),
        "width": sx(170), "height": sy(40),
        "rotate": 0,
        "content": simple(y_ax.get("high", ""), color=theme.muted, font_size_px=sfont(theme.caption * 0.9), align="right"),
        "defaultFontName": theme.font_body, "defaultColor": theme.muted,
    })
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(60), "top": sy(grid_y + grid_h - 40),
        "width": sx(170), "height": sy(40),
        "rotate": 0,
        "content": simple(y_ax.get("low", ""), color=theme.muted, font_size_px=sfont(theme.caption * 0.9), align="right"),
        "defaultFontName": theme.font_body, "defaultColor": theme.muted,
    })

    if take := slide.get("takeaway"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(140), "top": sy(1020),
            "width": sx(1640), "height": sy(50),
            "rotate": 0,
            "content": simple(f"→ {take}", color=theme.accent, font_size_px=sfont(theme.caption), bold=True),
            "defaultFontName": theme.font_body, "defaultColor": theme.accent,
        })

    return elements
