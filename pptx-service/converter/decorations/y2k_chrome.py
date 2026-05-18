"""Y2K chrome: chrome gradient simulated as layered tonal rectangles."""
from __future__ import annotations

from ._helpers import circle, rect

PURPLE = "#8a5cff"
BLUE = "#4ab8ff"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Chrome gradient band (top) — stacked rects with decreasing opacity
    for i in range(8):
        bg.append(rect(0, i * 8, 1920, 8, BLUE, 0.16 - i * 0.018))
    # Bottom mirror
    for i in range(8):
        bg.append(rect(0, 1080 - (i + 1) * 8, 1920, 8, PURPLE, 0.18 - i * 0.02))
    # Shiny corner orbs
    bg.append(circle(80, 80, 32, PURPLE, 0.5))
    bg.append(circle(80, 80, 20, BLUE, 0.5))
    bg.append(circle(1840, 1000, 32, BLUE, 0.5))
    bg.append(circle(1840, 1000, 20, PURPLE, 0.5))
    return bg + elements
