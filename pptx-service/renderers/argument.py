from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    points = data.get("points", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)

    add_textbox(slide, 0.83, 0.8, 11.0, 1.5, heading,
                t.font_display, 52, t.text, bold=True, wrap=True)

    add_line(slide, 0.83, 2.5, 12.5, 2.5, t.border, 0.5)

    y = 2.7
    for point in points[:6]:
        add_rect(slide, 0.83, y + 0.15, 0.1, 0.1, fill_hex=t.accent)
        add_textbox(slide, 1.1, y, 11.0, 0.65, point,
                    t.font_body, 28, t.text, wrap=True)
        y += 0.75
