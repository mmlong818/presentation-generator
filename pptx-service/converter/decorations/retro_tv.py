"""Retro TV: scanlines + warm orange corner band."""
from __future__ import annotations

from ._helpers import circle, rect, scan_lines

ORANGE = "#e67e14"
WARM_BG = "rgba(230,126,20,0.08)"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # CRT scan lines
    bg.extend(scan_lines("#000000", gap=8, opacity=0.04))
    # Top + bottom warm bands
    bg.append(rect(0, 0, 1920, 18, ORANGE))
    bg.append(rect(0, 1062, 1920, 18, ORANGE, 0.6))
    # Tuning knob indicator (bottom-right)
    bg.append(circle(1840, 1030, 14, ORANGE, 0.85))
    # Cover: extra warm vignette square top-left
    if slide_type == "cover":
        bg.append(rect(80, 80, 320, 80, WARM_BG))
    return bg + elements
