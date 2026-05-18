"""Risograph: red/blue mis-registered double-print double-print."""
from __future__ import annotations

from typing import Any

from ._helpers import echo, is_heading_text, rect

RED = "#ff5a5f"
BLUE = "#3858bd"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Corner registration marks
    bg.append(rect(40, 40, 28, 28, BLUE))
    bg.append(rect(34, 34, 28, 28, RED, 0.85))
    bg.append(rect(1852, 1012, 28, 28, BLUE))
    bg.append(rect(1858, 1018, 28, 28, RED, 0.85))
    # Top double-rule (content slides only)
    if slide_type not in ("cover", "statement", "question", "quote", "cta"):
        bg.append(rect(140, 92, 1640, 4, BLUE))
        bg.append(rect(144, 96, 1640, 4, RED, 0.9))
    # Cover banner
    if slide_type == "cover":
        bg.append(rect(116, 544, 1688, 14, BLUE))
        bg.append(rect(122, 550, 1688, 14, RED, 0.85))

    out: list[dict] = list(bg)
    for el in elements:
        if is_heading_text(el):
            out.append(echo(el, 2.6, 2.6, BLUE, 0.65))
            out.append(echo(el, -1.6, -1.6, RED, 0.55))
        out.append(el)
    return out
