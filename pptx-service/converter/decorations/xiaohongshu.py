"""Xiaohongshu (RedNote): warm cream + red dot accent."""
from __future__ import annotations

from ._helpers import circle, rect

RED = "#ff2742"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Signature red dot (top-left of safe area)
    bg.append(circle(108, 138, 18, RED, 0.95))
    # Thin warm rule under heading on content slides
    if slide_type not in ("cover", "statement", "quote"):
        bg.append(rect(140, 280, 90, 4, RED, 0.85))
    # Cover-only red ribbon
    if slide_type == "cover":
        bg.append(rect(120, 980, 280, 8, RED))
    return bg + elements
