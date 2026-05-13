from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    events = data.get("events", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.5, 11.0, 1.0, heading,
                t.font_display, 44, t.text, bold=True)

    add_line(slide, 0.83, 3.75, 12.5, 3.75, t.accent, 2.0)

    events = events[:5]
    n = len(events)
    if n == 0:
        return
    gap = 11.7 / n

    for i, event in enumerate(events):
        x = 0.83 + i * gap + gap / 2
        add_rect(slide, x - 0.12, 3.63, 0.24, 0.24, fill_hex=t.accent)
        add_textbox(slide, x - 1.0, 2.9, 2.0, 0.6,
                    event.get("time", ""), t.font_body, 18, t.muted,
                    align="center", bold=True)
        add_textbox(slide, x - 1.2, 4.1, 2.4, 0.7,
                    event.get("title", ""), t.font_display, 22,
                    t.text, bold=True, align="center", wrap=True)
        desc = event.get("desc", "")
        if desc:
            add_textbox(slide, x - 1.2, 4.9, 2.4, 1.2,
                        desc, t.font_body, 17, t.muted,
                        align="center", wrap=True)
