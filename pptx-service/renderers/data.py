from builder import add_bg, add_textbox, add_line, add_eyebrow
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    stats = data.get("stats", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)

    add_textbox(slide, 0.83, 0.7, 11.0, 1.2, heading,
                t.font_display, 44, t.text, bold=True)
    add_line(slide, 0.83, 1.9, 12.5, 1.9, t.border, 0.5)

    stats = stats[:4]
    n = len(stats)
    if n == 0:
        return
    col_w = 12.0 / n
    for i, stat in enumerate(stats):
        x = 0.67 + i * col_w
        add_textbox(slide, x, 2.2, col_w - 0.2, 2.0,
                    stat.get("value", ""),
                    t.font_display, 80, t.accent, bold=True, align="center")
        add_textbox(slide, x, 4.3, col_w - 0.2, 0.7,
                    stat.get("label", ""),
                    t.font_body, 24, t.text, align="center")
        src = stat.get("source", "")
        if src:
            add_textbox(slide, x, 5.1, col_w - 0.2, 0.5, src,
                        t.font_body, 16, t.muted, align="center")
        if i < n - 1:
            add_line(slide, x + col_w - 0.1, 2.2,
                     x + col_w - 0.1, 5.8, t.border, 0.5)
