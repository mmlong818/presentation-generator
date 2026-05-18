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

DECORATIONS: dict[str, DecorateFn] = {
    "blueprint": blueprint.decorate,
    "broadcast-hud": broadcast_hud.decorate,
    "brutalist-mono": brutalist_mono.decorate,
    "cyberpunk-neon": cyberpunk_neon.decorate,
    "glassmorphism": glassmorphism.decorate,
    "memphis-pop": memphis_pop.decorate,
    "midcentury": midcentury.decorate,
    "midnight-luxe": midnight_luxe.decorate,
    "open-sticker-pop": open_sticker_pop.decorate,
    "pastel-bauhaus": pastel_bauhaus.decorate,
    "pop-magazine": pop_magazine.decorate,
    "retro-tv": retro_tv.decorate,
    "risograph": risograph.decorate,
    "summer-cocktail": summer_cocktail.decorate,
    "swiss-grid": swiss_grid.decorate,
    "swiss-ikb": swiss_ikb.decorate,
    "tech-utility": tech_utility.decorate,
    "tokyo-night": tokyo_night.decorate,
    "vaporwave": vaporwave.decorate,
    "xiaohongshu": xiaohongshu.decorate,
    "y2k-chrome": y2k_chrome.decorate,
}


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
