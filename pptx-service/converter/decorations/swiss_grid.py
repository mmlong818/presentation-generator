"""Swiss grid: minimal red bar + baseline rules."""
from __future__ import annotations

from ._helpers import rect

RED = "#d6001c"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Top red rule (full bleed)
    bg.append(rect(0, 0, 1920, 14, RED))
    # Thin black baseline at bottom
    bg.append(rect(140, 1050, 1640, 2, "#111111"))
    # Cover: left red column
    if slide_type == "cover":
        bg.append(rect(0, 14, 36, 1066, RED))
    return bg + elements
