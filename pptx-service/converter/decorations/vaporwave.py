"""Vaporwave: purple/pink + cyan, retro grid floor, neon sun."""
from __future__ import annotations

from typing import Any

from ._helpers import circle, half_circle, rect

PINK = "#ff6ec7"
CYAN = "#00e5ff"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []

    # Floor: retro grid lines in the bottom 30% of the slide, faded toward horizon
    floor_top = 760
    bg.append(rect(0, floor_top, 1920, 1, PINK, 0.6))
    for i, y in enumerate(range(820, 1080, 36)):
        bg.append(rect(0, y, 1920, 1, PINK, 0.4 - i * 0.04))
    # vertical converging-ish lines (just regular spaced — approximation)
    for x in range(0, 1920, 80):
        bg.append(rect(x, floor_top, 1, 320, PINK, 0.18))

    # Neon sun (huge half-circle behind everything) — only on cover & statement
    if slide_type in ("cover", "statement", "question"):
        bg.append(half_circle(960, 760, 320, PINK, side="top", opacity=0.85))
        bg.append(half_circle(960, 760, 230, CYAN, side="top", opacity=0.55))
        # Sun stripe cuts
        for sy in range(420, 760, 28):
            bg.append(rect(640, sy, 640, 8, theme.bg, 1))

    # Cyan accent bar top-right
    bg.append(rect(1620, 60, 220, 4, CYAN, 0.85))
    bg.append(rect(1620, 70, 140, 2, PINK, 0.65))

    return bg + elements
