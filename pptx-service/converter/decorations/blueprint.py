"""Blueprint: engineering blueprint with grid + corner labels."""
from __future__ import annotations

from ._helpers import grid_lines, rect

WHITE = "rgba(255,255,255,0.85)"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Heavy blueprint grid
    bg.extend(grid_lines("#ffffff", spacing=40, opacity=0.04))
    # Secondary 200 spacing grid (heavier)
    bg.extend(grid_lines("#ffffff", spacing=200, opacity=0.08))
    # Outer frame (drafting border)
    bg.append(rect(40, 40, 1840, 1, WHITE, 0.55))
    bg.append(rect(40, 1039, 1840, 1, WHITE, 0.55))
    bg.append(rect(40, 40, 1, 1000, WHITE, 0.55))
    bg.append(rect(1879, 40, 1, 1000, WHITE, 0.55))
    return bg + elements
