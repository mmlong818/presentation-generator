from builder import add_bg, add_textbox
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.accent)
    action = data.get("newAction", "")

    text_color = "#ffffff"
    add_textbox(slide, 1.0, 2.2, 11.3, 4.0, action,
                t.font_display, 68, text_color, bold=True,
                align="center", wrap=True)
