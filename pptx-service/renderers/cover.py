from builder import add_bg, add_textbox, add_rect, add_eyebrow
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    title = data.get("title", "")
    subtitle = data.get("subtitle", "")
    eyebrow = data.get("eyebrow", "")

    add_rect(slide, 0.6, 1.8, 0.08, 3.8, fill_hex=t.accent)

    if eyebrow:
        add_eyebrow(slide, eyebrow, t, y=1.7)

    add_textbox(slide, 0.83, 2.2, 11.0, 3.5, title,
                t.font_display, 80, t.text, bold=True, wrap=True)

    if subtitle:
        add_textbox(slide, 0.83, 5.9, 9.0, 0.8, subtitle,
                    t.font_body, 28, t.muted)
