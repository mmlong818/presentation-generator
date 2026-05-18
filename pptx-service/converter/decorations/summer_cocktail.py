"""Summer cocktail: tropical color blobs (glass-like)."""
from __future__ import annotations

from ._helpers import circle, rect

PINK = "#ff5a8a"
ORANGE = "#ffb85a"
TEAL = "#2a9a7a"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Color blobs (overlapping translucent circles to mimic blur)
    bg.append(circle(200, 200, 240, PINK, 0.22))
    bg.append(circle(1700, 240, 280, ORANGE, 0.22))
    bg.append(circle(1750, 920, 260, TEAL, 0.20))
    bg.append(circle(180, 880, 220, PINK, 0.18))
    # Cover: big central blob
    if slide_type == "cover":
        bg.append(circle(960, 540, 400, ORANGE, 0.12))
    # Thin bottom rule
    bg.append(rect(140, 1050, 1640, 1.5, TEAL, 0.45))
    return bg + elements
