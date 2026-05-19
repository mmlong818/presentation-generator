"""Theme-specific slide decorations.

Each theme module exports a `decorate(slide_type, theme, elements, n, total)
-> list[dict]` function. It receives the layout's elements (read-only) and
returns the FULL replacement element list — typically prepending background
shapes, optionally injecting echoes (e.g. risograph offset duplicates of
headings), and appending top-level accents.

If a theme has no entry here, the layout elements pass through unchanged.
"""
from __future__ import annotations

from typing import Any, Callable

from . import (
    blueprint,
    broadcast_hud,
    brutalist_mono,
    cyberpunk_neon,
    glassmorphism,
    memphis_pop,
    midcentury,
    midnight_luxe,
    open_sticker_pop,
    pastel_bauhaus,
    pop_magazine,
    retro_tv,
    risograph,
    summer_cocktail,
    swiss_grid,
    swiss_ikb,
    tech_utility,
    tokyo_night,
    vaporwave,
    xiaohongshu,
    y2k_chrome,
)

DecorateFn = Callable[..., list[dict[str, Any]]]

# Decorations are intentionally disabled. The earlier overlay approach (random
# corner shapes, scan lines, halftone dots) didn't produce coherent theming —
# real "21-theme distinctness" requires layout-aware decoration which doesn't
# fit the converter's one-shot shape-prepend model. We focus on type-scale and
# palette tokens for now; decoration modules remain available below for future
# per-layout integration but the registry returns no entries.
DECORATIONS: dict[str, DecorateFn] = {}


def decorate(
    theme_id: str,
    slide_type: str,
    theme,
    elements: list[dict[str, Any]],
    n: int,
    total: int,
) -> list[dict[str, Any]]:
    fn = DECORATIONS.get(theme_id)
    if fn is None:
        return elements
    return fn(slide_type, theme, elements, n, total)
