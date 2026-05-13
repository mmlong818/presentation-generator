from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    left = data.get("left", {})
    right = data.get("right", {})
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.7, 11.0, 1.0, heading,
                t.font_display, 40, t.text, bold=True)

    add_line(slide, 6.67, 1.8, 6.67, 7.0, t.border, 1.0)

    for side, x_offset in [(left, 0.5), (right, 7.0)]:
        title = side.get("title", "")
        items = side.get("items", [])
        add_textbox(slide, x_offset, 1.9, 5.8, 0.8, title,
                    t.font_display, 32, t.accent, bold=True)
        y = 2.8
        for item in items[:6]:
            add_rect(slide, x_offset, y + 0.15, 0.08, 0.08, fill_hex=t.muted)
            add_textbox(slide, x_offset + 0.25, y, 5.4, 0.6, item,
                        t.font_body, 24, t.text, wrap=True)
            y += 0.68
