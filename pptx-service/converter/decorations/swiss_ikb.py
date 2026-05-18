"""Swiss IKB: full-height IKB-blue left bar + thin right rule."""
from __future__ import annotations

from ._helpers import rect

IKB = "#002FA7"


def decorate(slide_type: str, theme, elements: list[dict], n: int, total: int) -> list[dict]:
    bg: list[dict] = []
    # Signature: full-height IKB blue left margin
    bg.append(rect(0, 0, 36, 1080, IKB))
    # Bottom rule
    bg.append(rect(80, 1058, 1840, 2, "#0a0a0a"))
    # Cover-only: large IKB block behind title
    if slide_type == "cover":
        bg.append(rect(36, 720, 600, 280, IKB, 0.08))
    return bg + elements
