"""Statement slide → PPTist elements.

Source: { type: 'statement', title, highlight?: string[], align?: 'center'|'left' }
"""
from __future__ import annotations

from typing import Any

from ..geometry import sfont, sx, sy
from ..ids import nano
from ..text import TextRun, paragraph


def build(slide: dict[str, Any], theme, n: int, total: int) -> list[dict]:
    title: str = slide.get("title", "")
    align = slide.get("align", "center")
    highlights: list[str] = slide.get("highlight") or []
    pad = theme.padding
    inner_w = 1920 - 2 * pad

    # Build runs honoring multiple highlight substrings (first-match each)
    runs: list[TextRun] = []
    # Statement is the most emotionally weighted slide — push beyond hero.
    fs = sfont(theme.hero * 1.05)
    if not highlights:
        runs = [TextRun(title, bold=True, color=theme.text, font_size_px=fs)]
    else:
        remaining = title
        for hl in highlights:
            i = remaining.find(hl)
            if i == -1:
                continue
            if i > 0:
                runs.append(TextRun(remaining[:i], bold=True, color=theme.text, font_size_px=fs))
            runs.append(TextRun(hl, bold=True, color=theme.accent, font_size_px=fs))
            remaining = remaining[i + len(hl):]
        if remaining:
            runs.append(TextRun(remaining, bold=True, color=theme.text, font_size_px=fs))

    return [{
        "id": nano(),
        "type": "text",
        "left": sx(pad), "top": sy(360),
        "width": sx(inner_w), "height": sy(360),
        "rotate": 0,
        "content": paragraph(runs, align=align),
        "defaultFontName": theme.font_display,
        "defaultColor": theme.text,
        "lineHeight": 1.15,
    }]
