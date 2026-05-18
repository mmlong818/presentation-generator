"""Shape and echo primitives shared across theme decorations."""
from __future__ import annotations

import copy
import re
from typing import Any

from ..geometry import sx, sy
from ..ids import nano

# Inline-style serializers used by the text helpers in `text.py` produce
# `color: <value>` and `font-size: <px>px` rules. We need to recolor / inspect
# those rules from decoration modules.
_COLOR_RE = re.compile(r"color\s*:\s*[^;\"']+", re.IGNORECASE)
_FONT_SIZE_RE = re.compile(r"font-size\s*:\s*(\d+(?:\.\d+)?)px", re.IGNORECASE)


def rect(
    x: float, y: float, w: float, h: float,
    fill: str, opacity: float = 1.0,
) -> dict[str, Any]:
    """Source-coordinate rectangle (1920x1080) → scaled PPTist shape."""
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


def circle(
    cx: float, cy: float, r: float, fill: str, opacity: float = 1.0,
) -> dict[str, Any]:
    return {
        "id": nano(),
        "type": "shape",
        "left": sx(cx - r), "top": sy(cy - r),
        "width": sx(r * 2), "height": sy(r * 2),
        "rotate": 0,
        "viewBox": [200, 200],
        "path": "M 100 0 A 100 100 0 1 0 100 200 A 100 100 0 1 0 100 0 Z",
        "fixedRatio": True,
        "fill": fill,
        "opacity": opacity,
    }


def triangle(
    x: float, y: float, w: float, h: float,
    fill: str, opacity: float = 1.0, rotate: float = 0,
) -> dict[str, Any]:
    return {
        "id": nano(),
        "type": "shape",
        "left": sx(x), "top": sy(y),
        "width": sx(w), "height": sy(h),
        "rotate": rotate,
        "viewBox": [200, 200],
        "path": "M 100 0 L 200 200 L 0 200 Z",
        "fixedRatio": False,
        "fill": fill,
        "opacity": opacity,
    }


def half_circle(
    cx: float, cy: float, r: float, fill: str,
    side: str = "top", opacity: float = 1.0,
) -> dict[str, Any]:
    """Half-circle facing one of 'top'|'bottom'|'left'|'right'."""
    paths = {
        "top":    "M 0 100 A 100 100 0 0 1 200 100 L 200 100 L 0 100 Z",
        "bottom": "M 0 100 A 100 100 0 0 0 200 100 L 200 100 L 0 100 Z",
        "left":   "M 100 0 A 100 100 0 0 0 100 200 L 100 200 L 100 0 Z",
        "right":  "M 100 0 A 100 100 0 0 1 100 200 L 100 200 L 100 0 Z",
    }
    return {
        "id": nano(),
        "type": "shape",
        "left": sx(cx - r), "top": sy(cy - r),
        "width": sx(r * 2), "height": sy(r * 2),
        "rotate": 0,
        "viewBox": [200, 200],
        "path": paths[side],
        "fixedRatio": True,
        "fill": fill,
        "opacity": opacity,
    }


def line_h(x: float, y: float, w: float, h: float, color: str, opacity: float = 1.0) -> dict[str, Any]:
    """Convenience: thin horizontal bar (uses rect)."""
    return rect(x, y, w, h, color, opacity)


def recolor_html(html: str, new_color: str) -> str:
    """Replace every `color: …` inline style with `color: <new_color>`."""
    return _COLOR_RE.sub(f"color: {new_color}", html)


def max_font_px(html: str) -> float:
    """Largest font-size (in px) found in any inline style of an element body."""
    return max((float(m.group(1)) for m in _FONT_SIZE_RE.finditer(html)), default=0)


def is_heading_text(el: dict[str, Any], threshold: float = 24) -> bool:
    if el.get("type") != "text":
        return False
    content = el.get("content", "")
    if not isinstance(content, str) or not content:
        return False
    return max_font_px(content) >= threshold


def echo(
    el: dict[str, Any], dx: float, dy: float, color: str, opacity: float,
) -> dict[str, Any]:
    """Duplicate a text element shifted by (dx, dy) in scaled coords, recolored."""
    clone = copy.deepcopy(el)
    clone["id"] = nano()
    clone["left"] = round(clone.get("left", 0) + dx, 2)
    clone["top"] = round(clone.get("top", 0) + dy, 2)
    clone["content"] = recolor_html(clone.get("content", ""), color)
    clone["defaultColor"] = color
    clone["opacity"] = opacity
    return clone


def corner_brackets(
    color: str, *,
    length: float = 60, thickness: float = 4, inset: float = 28,
) -> list[dict[str, Any]]:
    """Four `[ ]` viewfinder-style brackets at the slide corners."""
    pieces: list[dict[str, Any]] = []
    # TL
    pieces.append(rect(inset, inset, length, thickness, color))
    pieces.append(rect(inset, inset, thickness, length, color))
    # TR
    pieces.append(rect(1920 - inset - length, inset, length, thickness, color))
    pieces.append(rect(1920 - inset - thickness, inset, thickness, length, color))
    # BL
    pieces.append(rect(inset, 1080 - inset - thickness, length, thickness, color))
    pieces.append(rect(inset, 1080 - inset - length, thickness, length, color))
    # BR
    pieces.append(rect(1920 - inset - length, 1080 - inset - thickness, length, thickness, color))
    pieces.append(rect(1920 - inset - thickness, 1080 - inset - length, thickness, length, color))
    return pieces


def grid_lines(color: str, *, spacing: float = 80, opacity: float = 0.06) -> list[dict[str, Any]]:
    """Thin grid lines covering the slide for blueprint/tech-utility feels."""
    out: list[dict[str, Any]] = []
    # Vertical lines
    x = spacing
    while x < 1920:
        out.append(rect(x, 0, 1, 1080, color, opacity))
        x += spacing
    # Horizontal lines
    y = spacing
    while y < 1080:
        out.append(rect(0, y, 1920, 1, color, opacity))
        y += spacing
    return out


def scan_lines(color: str, *, gap: float = 4, opacity: float = 0.05) -> list[dict[str, Any]]:
    """CRT-style horizontal scan lines (sparse to keep element count down)."""
    out: list[dict[str, Any]] = []
    y = 0
    while y < 1080:
        out.append(rect(0, y, 1920, 1, color, opacity))
        y += gap
    return out
