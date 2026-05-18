"""Coordinate scaling from source deck (1920x1080) to PPTist (1000x562.5)."""
from __future__ import annotations

SOURCE_W = 1920
SOURCE_H = 1080
PPTIST_W = 1000
PPTIST_H = 562.5
SCALE = PPTIST_W / SOURCE_W  # 0.5208333...


def sx(v: float) -> float:
    """Scale x or width."""
    return round(v * SCALE, 2)


def sy(v: float) -> float:
    """Scale y or height (same factor)."""
    return round(v * SCALE, 2)


def sfont(px: float) -> float:
    """Scale font sizes from source px to PPTist px."""
    return round(px * SCALE, 1)
