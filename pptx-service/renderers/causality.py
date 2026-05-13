from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    chain = data.get("chain", [])
    conclusion = data.get("conclusion", "")
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.5, 11.0, 1.0, heading,
                t.font_display, 44, t.text, bold=True)

    chain = chain[:5]
    n = len(chain)
    if n == 0:
        return

    node_w = 12.5 / n
    mid_y = 3.8

    for i, link in enumerate(chain):
        x = 0.42 + i * node_w
        cause = link.get("cause", "")
        because = link.get("because", "")
        is_last = i == n - 1

        add_rect(slide, x, mid_y - 0.6, node_w - 0.25, 1.2,
                 fill_hex=t.paper,
                 line_hex=t.accent if is_last else t.border,
                 line_width_pt=1.5 if is_last else 0.5)
        add_textbox(slide, x + 0.1, mid_y - 0.55, node_w - 0.45, 1.1,
                    cause, t.font_display, 22,
                    t.accent if is_last else t.text,
                    bold=True, align="center", wrap=True)

        if i < n - 1:
            ax = x + node_w - 0.25
            add_line(slide, ax, mid_y, ax + 0.25, mid_y, t.accent, 2.0)

        if because:
            add_textbox(slide, x, mid_y + 0.7, node_w - 0.2, 0.9,
                        because, t.font_body, 17, t.muted,
                        align="center", wrap=True)

    if conclusion:
        add_line(slide, 0.83, 6.5, 12.5, 6.5, t.border, 0.5)
        add_textbox(slide, 0.83, 6.6, 11.5, 0.55,
                    f"→ {conclusion}", t.font_body, 22, t.text, bold=True)
