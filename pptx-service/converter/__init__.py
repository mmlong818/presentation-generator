"""Convert a source `Deck` (semantic, 1920x1080) → PPTist presentation JSON (1000x562.5)."""
from __future__ import annotations

from typing import Any

from .decorations import decorate as _decorate
from .geometry import PPTIST_H, PPTIST_W
from .ids import nano
from .layouts import LAYOUTS
from .theme import FlatTheme


def deck_to_pptist(deck: dict[str, Any]) -> dict[str, Any]:
    """Top-level converter.

    Args:
        deck: A `Deck` dict matching `lib/types.ts:Deck`.

    Returns:
        A PPTist-compatible presentation JSON dict.
    """
    theme_id = deck.get("theme", "modern-minimal")
    theme = FlatTheme.from_theme_id(theme_id)
    bg = {"type": "solid", "color": theme.bg}
    slides_in: list[dict] = deck.get("slides", [])
    slides_out: list[dict] = []
    total = len(slides_in)
    script_by_index = {e["slideIndex"]: e for e in deck.get("script", [])}

    for n, s in enumerate(slides_in, start=1):
        layout_type = s.get("type", "")
        fn = LAYOUTS.get(layout_type)
        content_elements = fn(s, theme, n, total) if fn else _unknown(s, theme, n, total)
        # Decorations may prepend background shapes AND splice heading echoes.
        decorated = _decorate(theme_id, layout_type, theme, content_elements, n, total)
        slide: dict[str, Any] = {
            "id": nano(),
            "elements": decorated,
            "background": bg,
        }
        if (entry := script_by_index.get(n)) and (text := entry.get("text")):
            slide["remark"] = text
        slides_out.append(slide)

    return {
        "title": deck.get("title", "Untitled"),
        "width": PPTIST_W,
        "height": PPTIST_H,
        "theme": theme.to_pptist_theme(),
        "slides": slides_out,
    }


def _unknown(slide: dict, theme: FlatTheme, n: int, total: int) -> list[dict]:
    """Placeholder for layouts not yet implemented."""
    from .geometry import sfont, sx, sy
    from .text import simple

    return [{
        "id": nano(),
        "type": "text",
        "left": sx(140), "top": sy(480),
        "width": sx(1640), "height": sy(120),
        "rotate": 0,
        "content": simple(
            f"[未实现版式: {slide.get('type', '?')}]",
            color=theme.muted,
            font_size_px=sfont(40),
        ),
        "defaultFontName": theme.font_body,
        "defaultColor": theme.muted,
    }]
