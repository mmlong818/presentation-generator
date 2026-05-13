from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    axes = data.get("axes", {})
    cells = data.get("cells", [{}, {}, {}, {}])
    takeaway = data.get("takeaway", "")

    add_textbox(slide, 0.83, 0.2, 11.0, 0.9, heading,
                t.font_display, 40, t.text, bold=True)

    gx, gy, gw, gh = 1.2, 1.2, 11.0, 5.8

    x_axis = axes.get("x", {})
    y_axis = axes.get("y", {})
    add_textbox(slide, gx, gy + gh + 0.05, gw / 2, 0.35,
                x_axis.get("low", ""), t.font_body, 15, t.muted)
    add_textbox(slide, gx + gw / 2, gy + gh + 0.05, gw / 2, 0.35,
                x_axis.get("high", ""), t.font_body, 15, t.muted, align="right")
    add_textbox(slide, 0.1, gy, 0.9, 1.0,
                y_axis.get("high", ""), t.font_body, 14, t.muted)
    add_textbox(slide, 0.1, gy + gh / 2, 0.9, 1.0,
                y_axis.get("low", ""), t.font_body, 14, t.muted)

    add_line(slide, gx, gy + gh / 2, gx + gw, gy + gh / 2, t.border, 1.0)
    add_line(slide, gx + gw / 2, gy, gx + gw / 2, gy + gh, t.border, 1.0)

    positions = [
        (gx, gy),
        (gx + gw / 2, gy),
        (gx, gy + gh / 2),
        (gx + gw / 2, gy + gh / 2),
    ]
    cell_w = gw / 2 - 0.15
    cell_h = gh / 2 - 0.15

    for i, (cx, cy) in enumerate(positions):
        cell = cells[i] if i < len(cells) else {}
        is_em = cell.get("emphasis", False)
        add_textbox(slide, cx + 0.2, cy + 0.25, cell_w - 0.2, 0.7,
                    cell.get("label", ""), t.font_display, 22,
                    t.accent if is_em else t.text, bold=True, wrap=True)
        desc = cell.get("desc", "")
        if desc:
            add_textbox(slide, cx + 0.2, cy + 1.0, cell_w - 0.2, 1.5,
                        desc, t.font_body, 17, t.muted, wrap=True)

    if takeaway:
        add_textbox(slide, gx, 7.05, gw, 0.4, f"Takeaway: {takeaway}",
                    t.font_body, 18, t.muted, italic=True)
