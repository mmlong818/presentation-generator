"""Memphis 80s: confetti geometric shapes in primary palette."""
from __future__ import annotations

from ._helpers import circle, rect, triangle

PALETTE = ["#ff3d8b", "#3d8bff", "#ffe800", "#00c9a7", "#ff6b35", "#a855f7"]


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []

    # Confetti corners — different geometry per corner
    bg.append(circle(80, 80, 30, PALETTE[0], 1))
    bg.append(triangle(1780, 30, 90, 90, PALETTE[2], 1))
    bg.append(rect(60, 980, 70, 70, PALETTE[1], 1))
    bg.append(circle(1820, 1020, 40, PALETTE[3], 1))

    # A few scattered medium dots along edges
    bg.append(circle(220, 60, 12, PALETTE[5], 0.85))
    bg.append(rect(1650, 130, 18, 70, PALETTE[4], 0.85))
    bg.append(circle(160, 1010, 14, PALETTE[2], 0.85))
    bg.append(triangle(1480, 980, 50, 50, PALETTE[5], 0.85))

    # Cover: oversized accent shapes for energy
    if slide_type == "cover":
        bg.append(circle(140, 380, 96, PALETTE[2], 0.95))
        bg.append(rect(1660, 320, 18, 220, PALETTE[0]))
        bg.append(triangle(1500, 700, 110, 110, PALETTE[1], 0.9))

    return bg + elements
