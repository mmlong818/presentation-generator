"""Glassmorphism: soft purple/cyan glows on dark base (no real blur in PPTist)."""
from __future__ import annotations

from ._helpers import circle, rect

CYAN = "#7dd3fc"
PURPLE = "#a78bfa"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Two big translucent orbs simulating ambient glow
    bg.append(circle(420, 280, 520, CYAN, 0.10))
    bg.append(circle(1500, 900, 600, PURPLE, 0.09))
    # Subtle accent rules at top + bottom
    bg.append(rect(140, 80, 1640, 1, CYAN, 0.35))
    bg.append(rect(140, 1010, 1640, 1, PURPLE, 0.30))
    return bg + elements
