"""Pastel bauhaus: large geometric primaries (circle, triangle, square)."""
from __future__ import annotations

from ._helpers import circle, rect, triangle

# Soft bauhaus primaries
RED = "#d65a3a"
BLUE = "#a4d8e8"
YELLOW = "#ffe7a4"
GREEN = "#c8e0a4"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Cover: oversized primary shapes filling the slide
    if slide_type == "cover":
        bg.append(circle(280, 720, 260, BLUE, 0.85))
        bg.append(triangle(1380, 280, 440, 440, YELLOW, 0.9))
        bg.append(rect(1480, 760, 320, 240, RED, 0.85))
    else:
        # Smaller corner accents
        bg.append(circle(120, 120, 56, BLUE, 0.6))
        bg.append(triangle(1700, 60, 140, 140, YELLOW, 0.7))
        bg.append(rect(60, 940, 100, 100, RED, 0.55))
    return bg + elements
