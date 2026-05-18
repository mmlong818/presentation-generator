"""Midnight luxe: thin gold rules + corner ornaments."""
from __future__ import annotations

from ._helpers import rect

GOLD = "#c8a96a"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Inner gold frame — very thin, very luxurious
    inset = 80
    bg.append(rect(inset, inset, 1920 - 2 * inset, 0.6, GOLD, 0.55))
    bg.append(rect(inset, 1080 - inset, 1920 - 2 * inset, 0.6, GOLD, 0.55))
    bg.append(rect(inset, inset, 0.6, 1080 - 2 * inset, GOLD, 0.55))
    bg.append(rect(1920 - inset, inset, 0.6, 1080 - 2 * inset, GOLD, 0.55))
    # Subtle gold corner ornament dots
    for cx, cy in [(inset - 8, inset - 8), (1920 - inset, inset - 8),
                    (inset - 8, 1080 - inset), (1920 - inset, 1080 - inset)]:
        bg.append(rect(cx, cy, 8, 8, GOLD, 0.85))
    # Cover gets a centered gold hairline above the title
    if slide_type == "cover":
        bg.append(rect(860, 320, 200, 1.5, GOLD))
    return bg + elements
