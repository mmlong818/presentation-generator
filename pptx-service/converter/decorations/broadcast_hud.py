"""Broadcast HUD: corner viewfinders, LIVE marker, status bar."""
from __future__ import annotations

from ._helpers import circle, corner_brackets, rect

YELLOW = "#fbbf24"
RED = "#ef4444"
WHITE = "rgba(255,255,255,0.85)"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Viewfinder brackets (signature HUD chrome)
    bg.extend(corner_brackets(WHITE, length=70, thickness=2, inset=32))
    # Top status bar
    bg.append(rect(0, 0, 1920, 28, "rgba(255,255,255,0.06)"))
    # LIVE marker (top-right)
    bg.append(circle(1800, 14, 6, RED, 1))
    # Bottom yellow accent rule
    bg.append(rect(60, 1058, 240, 2, YELLOW))
    bg.append(rect(60, 1058, 60, 2, RED))
    # Cover: dramatic horizontal sweep
    if slide_type == "cover":
        bg.append(rect(60, 480, 1800, 1, "rgba(255,255,255,0.18)"))
        bg.append(rect(60, 560, 1800, 1, "rgba(255,255,255,0.18)"))
    return bg + elements
