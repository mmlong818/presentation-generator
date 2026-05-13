from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    axes = data.get("axes", {})
    points = data.get("points", [])
    highlight = data.get("highlight", "")
    source = data.get("source", "")

    add_textbox(slide, 0.83, 0.2, 11.0, 0.9, heading,
                t.font_display, 40, t.text, bold=True)

    px, py, pw, ph = 1.5, 1.2, 10.5, 5.7
    add_line(slide, px, py + ph / 2, px + pw, py + ph / 2, t.border, 1.0)
    add_line(slide, px + pw / 2, py, px + pw / 2, py + ph, t.border, 1.0)

    x_axis = axes.get("x", {})
    y_axis = axes.get("y", {})
    add_textbox(slide, px, py + ph + 0.05, pw / 2, 0.4,
                x_axis.get("low", ""), t.font_body, 14, t.muted)
    add_textbox(slide, px + pw / 2, py + ph + 0.05, pw / 2, 0.4,
                x_axis.get("high", ""), t.font_body, 14, t.muted, align="right")
    add_textbox(slide, 0.1, py, 1.2, 0.5,
                y_axis.get("high", ""), t.font_body, 14, t.muted)
    add_textbox(slide, 0.1, py + ph - 0.4, 1.2, 0.5,
                y_axis.get("low", ""), t.font_body, 14, t.muted)

    cell_w = pw / 5
    cell_h = ph / 5

    for pt in points:
        gx = max(0, min(4, pt.get("gridX", 2)))
        gy = max(0, min(4, pt.get("gridY", 2)))
        label = pt.get("label", "")
        pid = pt.get("id", "")
        is_hl = pid == highlight

        cx = px + gx * cell_w + cell_w / 2
        cy = py + (4 - gy) * cell_h + cell_h / 2

        dot_size = 0.18 if is_hl else 0.13
        add_rect(slide, cx - dot_size / 2, cy - dot_size / 2,
                 dot_size, dot_size,
                 fill_hex=t.accent if is_hl else t.muted)
        add_textbox(slide, cx - 0.6, cy + dot_size / 2 + 0.02, 1.2, 0.35,
                    label, t.font_body, 13,
                    t.accent if is_hl else t.text,
                    bold=is_hl, align="center")

    if source:
        add_textbox(slide, px, 7.1, pw, 0.35, f"Source: {source}",
                    t.font_body, 14, t.muted)
