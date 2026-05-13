from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors


def _contrast_color(hex_bg: str) -> str:
    h = hex_bg.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255
    luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return "#000000" if luminance > 0.5 else "#ffffff"


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    steps = data.get("steps", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.5, 11.0, 1.2, heading,
                t.font_display, 44, t.text, bold=True)

    steps = steps[:5]
    n = len(steps)
    if n == 0:
        return
    step_w = 12.0 / n
    mid_y = 4.0
    num_text_color = _contrast_color(t.accent)

    for i, step in enumerate(steps):
        x = 0.67 + i * step_w
        cx = x + step_w / 2 - 0.3
        add_rect(slide, cx, mid_y - 0.5, 0.6, 0.6, fill_hex=t.accent)
        add_textbox(slide, cx, mid_y - 0.5, 0.6, 0.6,
                    str(i + 1), t.font_display, 22, num_text_color,
                    bold=True, align="center")
        if i < n - 1:
            add_line(slide, x + step_w * 0.9, mid_y - 0.2,
                     x + step_w + 0.05, mid_y - 0.2, t.border, 1.5)
        add_textbox(slide, x, mid_y + 0.25, step_w - 0.1, 0.8,
                    step.get("title", ""), t.font_display, 24,
                    t.text, bold=True, align="center", wrap=True)
        desc = step.get("desc", "")
        if desc:
            add_textbox(slide, x, mid_y + 1.1, step_w - 0.1, 1.0,
                        desc, t.font_body, 18, t.muted,
                        align="center", wrap=True)
