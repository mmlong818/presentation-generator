"""Open sticker pop: heavy purple borders + sticker corners."""
from __future__ import annotations

from ._helpers import circle, rect, triangle

PURPLE = "#2d1b4e"
PINK = "#ff4d8d"
YELLOW = "#ffd600"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Sticker-style heavy borders all sides
    bg.append(rect(0, 0, 1920, 10, PURPLE))
    bg.append(rect(0, 1070, 1920, 10, PURPLE))
    bg.append(rect(0, 0, 10, 1080, PURPLE))
    bg.append(rect(1910, 0, 10, 1080, PURPLE))
    # Corner stickers
    bg.append(circle(80, 80, 28, PINK))
    bg.append(circle(80, 80, 16, YELLOW))
    bg.append(triangle(1780, 30, 80, 80, YELLOW))
    bg.append(rect(60, 980, 60, 60, PINK))
    # Cover-only: big bubble
    if slide_type == "cover":
        bg.append(circle(1660, 280, 140, PINK, 0.92))
        bg.append(circle(1660, 280, 80, YELLOW, 0.95))
    return bg + elements
