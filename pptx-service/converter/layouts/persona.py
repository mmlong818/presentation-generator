"""Persona slide → PPTist elements.

Source: { type: 'persona', name, role, attributes?, quote?, needs?, pains? }
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

    name: str = slide.get("name", "")
    initial = (name[:1] or "?").upper()
    avatar = 280
    avatar_x, avatar_y = 140, 160
    # Circle background
    elements.append({
        "id": nano(),
        "type": "shape",
        "left": sx(avatar_x), "top": sy(avatar_y),
        "width": sx(avatar), "height": sy(avatar),
        "rotate": 0,
        "viewBox": [200, 200],
        "path": "M 100 0 A 100 100 0 1 0 100 200 A 100 100 0 1 0 100 0 Z",
        "fixedRatio": True,
        "fill": theme.accent,
        "opacity": 1,
    })
    # Initial
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(avatar_x), "top": sy(avatar_y + 60),
        "width": sx(avatar), "height": sy(160),
        "rotate": 0,
        "content": simple(initial, color=theme.bg, font_size_px=sfont(140), bold=True, align="center"),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.bg,
        "lineHeight": 1,
    })

    # Name + role (right of avatar)
    info_x = avatar_x + avatar + 60
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(info_x), "top": sy(160),
        "width": sx(1920 - info_x - 140), "height": sy(120),
        "rotate": 0,
        "content": simple(name, color=theme.text, font_size_px=sfont(72), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.2,
    })
    elements.append({
        "id": nano(),
        "type": "text",
        "left": sx(info_x), "top": sy(280),
        "width": sx(1920 - info_x - 140), "height": sy(60),
        "rotate": 0,
        "content": simple(slide.get("role", ""), color=theme.accent, font_size_px=sfont(28), bold=True),
        "defaultFontName": theme.font_body,
        "defaultColor": theme.accent,
    })

    # Attributes (table-like 2-col)
    attrs: list[dict] = slide.get("attributes") or []
    if attrs:
        html_lines = "".join(
            f"<p><strong>{a.get('label','')}: </strong>{a.get('value','')}</p>"
            for a in attrs
        )
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(info_x), "top": sy(360),
            "width": sx(1920 - info_x - 140), "height": sy(180),
            "rotate": 0,
            "content": html_lines,
            "defaultFontName": theme.font_body,
            "defaultColor": theme.text,
            "lineHeight": 1.5,
        })

    # Needs / Pains as two columns at bottom
    bottom_y = 640
    bottom_h = 360
    col_w = (1920 - 280 - 40) / 2

    def _col(x: float, title: str, items: list[str], color: str) -> None:
        elements.append(rect_shape(x=x, y=bottom_y, w=col_w, h=bottom_h, fill=theme.paper, opacity=1))
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x + 32), "top": sy(bottom_y + 24),
            "width": sx(col_w - 64), "height": sy(50),
            "rotate": 0,
            "content": simple(title, color=color, font_size_px=sfont(24), bold=True),
            "defaultFontName": theme.font_body,
            "defaultColor": color,
        })
        items_html = "".join(f"<p>· {it}</p>" for it in items)
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(x + 32), "top": sy(bottom_y + 84),
            "width": sx(col_w - 64), "height": sy(bottom_h - 100),
            "rotate": 0,
            "content": items_html,
            "defaultFontName": theme.font_body,
            "defaultColor": theme.text,
            "lineHeight": 1.6,
        })

    needs = slide.get("needs") or []
    pains = slide.get("pains") or []
    if needs:
        _col(140, "Needs", needs, theme.accent)
    if pains:
        _col(140 + col_w + 40, "Pains", pains, theme.muted)

    # Quote (small, top-right corner if present)
    if quote := slide.get("quote"):
        elements.append({
            "id": nano(),
            "type": "text",
            "left": sx(info_x), "top": sy(550),
            "width": sx(1920 - info_x - 140), "height": sy(60),
            "rotate": 0,
            "content": simple(f"“{quote}”", color=theme.muted, font_size_px=sfont(22)),
            "defaultFontName": theme.font_body,
            "defaultColor": theme.muted,
        })

    return elements
