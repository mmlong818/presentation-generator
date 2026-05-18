"""Tokyo night: subtle dark gradient glow + accent code-bar."""
from __future__ import annotations

from ._helpers import circle, rect

BLUE = "#7aa2f7"
PURPLE = "#bb9af7"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Two big soft glows (simulated with semi-transparent circles)
    bg.append(circle(280, 200, 600, BLUE, 0.06))
    bg.append(circle(1640, 880, 700, PURPLE, 0.05))
    # Left accent bar (code editor gutter style)
    bg.append(rect(0, 0, 6, 1080, BLUE, 0.55))
    # Cover: small command-line prompt marker
    if slide_type == "cover":
        bg.append(rect(60, 990, 12, 24, PURPLE))
        bg.append(rect(86, 990, 4, 24, BLUE, 0.7))
    return bg + elements
