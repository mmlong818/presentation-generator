from builder import add_bg, add_textbox, add_eyebrow
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    title = data.get("title", "")
    align = data.get("align", "center")
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)

    x = 0.83 if align == "left" else 1.0
    add_textbox(slide, x, 1.5, 11.5, 5.0, title,
                t.font_display, 72, t.text, bold=True,
                align=align, wrap=True)
