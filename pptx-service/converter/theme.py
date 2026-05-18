"""Map source deck theme tokens to PPTist's flat theme model."""
from __future__ import annotations

from dataclasses import dataclass

# Reuse pptx-service's theme palette
from theme import THEMES as _THEMES, ThemeColors


# Cross-platform font stack that prefers a theme's own display/body face but always
# falls back to high-quality CJK + Latin + emoji fonts so any locale renders cleanly.
_CJK_FALLBACK = (
    # zh-CN / zh-TW
    '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Source Han Sans SC", '
    '"Noto Sans CJK SC", "Noto Sans SC", "WenQuanYi Micro Hei", '
    # Japanese
    '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", '
    # Korean
    '"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", '
    # emoji
    '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"'
)


def _stack(face: str | None) -> str:
    """Wrap a primary face with our universal fallback stack."""
    if not face:
        return f'system-ui, -apple-system, "Segoe UI", Roboto, {_CJK_FALLBACK}, sans-serif'
    primary = face.strip()
    if not primary:
        return _stack(None)
    quoted = f'"{primary}"' if (' ' in primary and not primary.startswith('"')) else primary
    return f'{quoted}, system-ui, -apple-system, "Segoe UI", Roboto, {_CJK_FALLBACK}, sans-serif'


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
            font_display=_stack(tc.font_display),
            font_body=_stack(tc.font_body),
            mode=tc.mode,
        )

    def to_pptist_theme(self) -> dict[str, object]:
        return {
            "themeColors": [self.accent, self.muted, self.border, self.text, self.paper, self.bg],
            "fontColor": self.text,
            # font_body already includes the universal CJK + Latin + emoji fallback stack.
            "fontName": self.font_body,
            "backgroundColor": self.bg,
        }
