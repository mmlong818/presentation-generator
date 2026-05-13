from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    items = data.get("items", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.7, 11.0, 1.2, heading,
                t.font_display, 48, t.text, bold=True)
    add_line(slide, 0.83, 2.0, 12.5, 2.0, t.border, 0.5)

    y = 2.2
    for item in items[:7]:
        add_rect(slide, 0.83, y + 0.05, 0.42, 0.42,
                 line_hex=t.accent, line_width_pt=1.5)
        add_textbox(slide, 1.4, y, 11.0, 0.6, item,
                    t.font_body, 28, t.text)
        y += 0.75
