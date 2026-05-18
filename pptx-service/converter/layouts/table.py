"""Table slide → PPTist elements (rendered as text grid).

Source: { type: 'table', heading, columns, rows, highlightColumn?, source? }
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

    columns: list[dict] = slide.get("columns", [])
    rows: list[dict] = slide.get("rows", [])
    highlight = slide.get("highlightColumn")
    if not columns:
        return elements

    table_x = 140
    table_w = 1640
    table_top = 280
    table_bot = 1000 if slide.get("source") else 1040
    table_h = table_bot - table_top
    header_h = 70
    row_count = max(1, len(rows))
    row_h = min(70, (table_h - header_h) / row_count)
    col_w = table_w / len(columns)

    # Highlight column background
    if highlight:
        try:
            hi_idx = next(i for i, c in enumerate(columns) if c.get("id") == highlight)
            elements.append(rect_shape(
                x=table_x + hi_idx * col_w, y=table_top, w=col_w,
                h=header_h + row_h * len(rows),
                fill=theme.accent, opacity=0.08,
            ))
        except StopIteration:
            pass

    # Header row
    for i, col in enumerate(columns):
        align = col.get("align") or "left"
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(table_x + i * col_w + 16), "top": sy(table_top + 16),
            "width": sx(col_w - 32), "height": sy(header_h - 24),
            "rotate": 0,
            "content": simple(col.get("label", ""), color=theme.accent, font_size_px=sfont(22), bold=True, align=align),
            "defaultFontName": theme.font_body, "defaultColor": theme.accent,
        })
    # Header underline
    elements.append(rect_shape(x=table_x, y=table_top + header_h - 2, w=table_w, h=2, fill=theme.border, opacity=1))

    # Data rows
    for r, row in enumerate(rows):
        cells = row.get("cells", {})
        emph = bool(row.get("emphasis"))
        ry = table_top + header_h + r * row_h
        if emph:
            elements.append(rect_shape(x=table_x, y=ry, w=table_w, h=row_h, fill=theme.paper, opacity=1))
        for i, col in enumerate(columns):
            align = col.get("align") or "left"
            val = cells.get(col.get("id", ""), "")
            elements.append({
                "id": nano(),
                "type": "text",
                "left": sx(table_x + i * col_w + 16), "top": sy(ry + 12),
                "width": sx(col_w - 32), "height": sy(row_h - 24),
                "rotate": 0,
                "content": simple(val, color=theme.text, font_size_px=sfont(22), bold=emph, align=align),
                "defaultFontName": theme.font_body, "defaultColor": theme.text,
            })
        # Row separator
        if r < len(rows) - 1:
            elements.append(rect_shape(x=table_x, y=ry + row_h - 1, w=table_w, h=1, fill=theme.border, opacity=0.5))

    if source := slide.get("source"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(table_x), "top": sy(1020),
            "width": sx(table_w), "height": sy(40),
            "rotate": 0,
            "content": simple(f"来源：{source}", color=theme.muted, font_size_px=sfont(18)),
            "defaultFontName": theme.font_body, "defaultColor": theme.muted,
        })

    return elements
