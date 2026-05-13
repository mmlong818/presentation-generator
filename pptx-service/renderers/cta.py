from builder import add_bg, add_textbox
from theme import ThemeColors


def _contrast_color(hex_bg: str) -> str:
    """Return black or white based on perceived luminance of hex_bg."""
    h = hex_bg.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255
    luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return "#000000" if luminance > 0.5 else "#ffffff"


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.accent)
    action = data.get("newAction", "")
    text_color = _contrast_color(t.accent)
    add_textbox(slide, 1.0, 2.2, 11.3, 4.0, action,
                t.font_display, 68, text_color, bold=True,
                align="center", wrap=True)
