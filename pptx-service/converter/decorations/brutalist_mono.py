"""Brutalist mono: heavy black borders, sharp side bar, bold rules."""
from __future__ import annotations

from ._helpers import rect

BLACK = "#000000"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []

    # Thick black left side bar (signature brutalist accent)
    bg.append(rect(0, 0, 14, 1080, BLACK))

    # Full-bleed top + bottom heavy rules
    bg.append(rect(0, 0, 1920, 8, BLACK))
    bg.append(rect(0, 1072, 1920, 8, BLACK))

    # Page-number block bottom-left (inverted color block)
    if total > 1:
        bg.append(rect(28, 1010, 96, 50, BLACK))

    # Cover: a large black block behind the title area
    if slide_type == "cover":
        bg.append(rect(0, 360, 720, 360, BLACK, 0.06))

    return bg + elements
