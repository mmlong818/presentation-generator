"""Map source deck theme tokens to PPTist's flat theme model."""
from __future__ import annotations

from dataclasses import dataclass

# Reuse pptx-service's theme palette
from theme import THEMES as _THEMES, ThemeColors


@dataclass(frozen=True)
class FlatTheme:
    """A flattened theme suitable for PPTist's theme model."""

    bg: str
    text: str
    muted: str
    accent: str
    border: str
    paper: str
    font_display: str
    font_body: str
    mode: str

    @classmethod
    def from_theme_id(cls, theme_id: str) -> "FlatTheme":
        tc: ThemeColors = _THEMES.get(theme_id) or _THEMES["modern-minimal"]
        return cls(
            bg=tc.bg,
            text=tc.text,
            muted=tc.muted,
            accent=tc.accent,
            border=tc.border,
            paper=tc.paper,
            font_display=tc.font_display,
            font_body=tc.font_body,
            mode=tc.mode,
        )

    def to_pptist_theme(self) -> dict[str, object]:
        return {
            "themeColors": [self.accent, self.muted, self.border, self.text, self.paper, self.bg],
            "fontColor": self.text,
            "fontName": self.font_body,
            "backgroundColor": self.bg,
        }
