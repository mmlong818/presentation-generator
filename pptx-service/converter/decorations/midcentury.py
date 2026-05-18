"""Mid-century modern: atomic shapes, half-circles, warm earth palette."""
from __future__ import annotations

from ._helpers import circle, half_circle, rect

GOLD = "#d4902a"
TEAL = "#3a8c8c"
RUST = "#a85a3a"
CREAM = "#f3ead8"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []

    # Atomic half-circle in top-left (signature mid-century motif)
    bg.append(half_circle(160, 80, 120, GOLD, side="bottom", opacity=0.95))
    # Small accent dot bottom-right
    bg.append(circle(1820, 1000, 36, TEAL, 0.9))
    # Thin horizontal rule across the slide bottom (mid-century base line)
    bg.append(rect(140, 1020, 1640, 1, RUST, 0.55))

    # Cover-only: large rust circle on the right side
    if slide_type == "cover":
        bg.append(circle(1650, 540, 260, RUST, 0.85))
        bg.append(half_circle(1650, 540, 180, CREAM, side="right", opacity=1))

    # Content slides get a thin gold left margin rule
    if slide_type not in ("cover", "statement", "quote"):
        bg.append(rect(70, 200, 2, 720, GOLD, 0.6))

    return bg + elements
