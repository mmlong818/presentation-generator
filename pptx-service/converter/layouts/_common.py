"""Shared helpers for layout builders."""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import simple


def eyebrow_el(text: str, theme) -> dict[str, Any]:
    return {
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(60),
        "width": sx(1640), "height": sy(40),
        "rotate": 0,
        "content": simple(text, color=theme.accent, font_size_px=sfont(22), bold=True),
        "defaultFontName": theme.font_body,
        "defaultColor": theme.accent,
    }


def heading_el(
    text: str,
    theme,
    *,
    y: float = 120,
    h: float = 140,
    size: float = 72,
) -> dict[str, Any]:
    return {
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(y),
        "width": sx(1640), "height": sy(h),
        "rotate": 0,
        "content": simple(text, color=theme.text, font_size_px=sfont(size), bold=True),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.3,
    }


def text_el(
    text_html: str,
    *,
    x: float,
    y: float,
    w: float,
    h: float,
    font_family: str,
    color: str,
    line_height: float = 1.5,
) -> dict[str, Any]:
    return {
        "id": nano(),
        "type": "text",
        "left": sx(x), "top": sy(y),
        "width": sx(w), "height": sy(h),
        "rotate": 0,
        "content": text_html,
        "defaultFontName": font_family,
        "defaultColor": color,
        "lineHeight": line_height,
    }


def rect_shape(
    *,
    x: float, y: float, w: float, h: float,
    fill: str, opacity: float = 1.0,
) -> dict[str, Any]:
    return {
        "id": nano(),
        "type": "shape",
        "left": sx(x), "top": sy(y),
        "width": sx(w), "height": sy(h),
        "rotate": 0,
        "viewBox": [200, 200],
        "path": "M 0 0 L 200 0 L 200 200 L 0 200 Z",
        "fixedRatio": False,
        "fill": fill,
        "opacity": opacity,
    }
