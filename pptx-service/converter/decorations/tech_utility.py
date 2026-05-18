"""Tech utility: terminal-green console with subtle grid and corner brackets."""
from __future__ import annotations

from ._helpers import corner_brackets, grid_lines, rect

GREEN = "#4ade80"
CYAN = "#38bdf8"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Subtle background grid
    bg.extend(grid_lines(GREEN, spacing=80, opacity=0.04))
    # Corner viewfinder brackets in terminal green
    bg.extend(corner_brackets(GREEN, length=80, thickness=3, inset=40))
    # A cyan accent rule below the heading area (content slides)
    if slide_type not in ("cover", "statement", "quote", "question"):
        bg.append(rect(140, 90, 80, 3, CYAN))
    # Slide counter band bottom-right
    if total > 1:
        bg.append(rect(1720, 1030, 160, 2, GREEN, 0.6))
    return bg + elements
