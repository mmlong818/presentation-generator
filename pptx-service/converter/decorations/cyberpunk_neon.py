"""Cyberpunk neon: black bg, magenta + cyan glows, scanlines, glitch echoes."""
from __future__ import annotations

from ._helpers import circle, echo, is_heading_text, rect, scan_lines

MAGENTA = "#ff2bd6"
CYAN = "#00e5ff"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []

    # Soft scan lines across the slide
    bg.extend(scan_lines(MAGENTA, gap=6, opacity=0.04))

    # Corner neon brackets — magenta TL+BR, cyan TR+BL for two-tone glow
    bg.append(rect(60, 60, 90, 3, MAGENTA, 0.9))
    bg.append(rect(60, 60, 3, 90, MAGENTA, 0.9))
    bg.append(rect(1770, 60, 90, 3, CYAN, 0.9))
    bg.append(rect(1857, 60, 3, 90, CYAN, 0.9))
    bg.append(rect(60, 1017, 3, 90, CYAN, 0.9))
    bg.append(rect(60, 1017, 90, 3, CYAN, 0.9))
    bg.append(rect(1770, 1017, 90, 3, MAGENTA, 0.9))
    bg.append(rect(1857, 1017, 3, 90, MAGENTA, 0.9))

    # Slide number badge top-right
    if total > 1:
        bg.append(rect(1700, 60, 160, 36, "#0a0a14", 0.9))
        bg.append(rect(1700, 60, 4, 36, CYAN))

    # Cover: large diagonal accent bar
    if slide_type == "cover":
        bg.append(rect(60, 480, 720, 8, MAGENTA))
        bg.append(rect(60, 500, 480, 4, CYAN, 0.75))

    out: list[dict] = list(bg)
    # Glitch-style 2px magenta+cyan echoes on big headings (cyber chromatic aberration)
    for el in elements:
        if is_heading_text(el, threshold=40):
            out.append(echo(el, -2, 0, CYAN, 0.55))
            out.append(echo(el, 2, 0, MAGENTA, 0.55))
        out.append(el)
    return out
