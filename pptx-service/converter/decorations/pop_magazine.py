"""Pop magazine: oversized typography frame, halftone-ish dots, color blocks."""
from __future__ import annotations

from ._helpers import circle, rect

RED = "#ff3a5a"
YELLOW = "#ffd13a"
BLACK = "#1a1a1a"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []

    # Thick black border around the slide (signature magazine frame)
    bg.append(rect(0, 0, 1920, 12, BLACK))
    bg.append(rect(0, 1068, 1920, 12, BLACK))
    bg.append(rect(0, 0, 12, 1080, BLACK))
    bg.append(rect(1908, 0, 12, 1080, BLACK))

    # Big yellow + red color blocks at top-left as a magazine-cover splash
    if slide_type == "cover":
        bg.append(rect(0, 0, 460, 96, YELLOW))
        bg.append(rect(460, 0, 220, 96, RED))

    # Bottom-right: red strip and yellow square (issue marker)
    bg.append(rect(1700, 1020, 160, 36, RED))
    bg.append(rect(1860, 1020, 36, 36, YELLOW))

    # Halftone-ish dot rows behind the title region — sparse for token budget
    if slide_type in ("cover", "statement", "argument", "data"):
        import_x = 1500
        for r, y in enumerate(range(180, 360, 28)):
            for c, x in enumerate(range(import_x, 1880, 28)):
                if (r + c) % 2 == 0:
                    bg.append(circle(x, y, 5, BLACK, 0.25))

    return bg + elements
