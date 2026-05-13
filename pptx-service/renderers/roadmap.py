from builder import add_bg, add_textbox, add_rect, add_line
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
    periods = data.get("periods", [])
    lanes = data.get("lanes", [])

    add_textbox(slide, 0.83, 0.2, 11.0, 0.9, heading,
                t.font_display, 40, t.text, bold=True)

    if not periods:
        return

    table_x = 1.8
    table_w = 11.0
    table_top = 1.2
    period_w = table_w / len(periods)
    lane_h = (6.0 - table_top) / max(len(lanes), 1) if lanes else 1.0
    accent_text = _contrast_color(t.accent)
    muted_text = _contrast_color(t.muted)

    for j, period in enumerate(periods):
        px = table_x + j * period_w
        add_rect(slide, px, table_top, period_w - 0.05, 0.55,
                 fill_hex=t.paper, line_hex=t.border, line_width_pt=0.5)
        add_textbox(slide, px, table_top + 0.05, period_w - 0.05, 0.45,
                    period, t.font_body, 18, t.text, bold=True, align="center")

    period_index = {p: i for i, p in enumerate(periods)}

    for i, lane in enumerate(lanes):
        ly = table_top + 0.6 + i * lane_h
        add_textbox(slide, 0.1, ly + lane_h / 2 - 0.3, 1.6, 0.6,
                    lane.get("name", ""), t.font_body, 16, t.muted,
                    align="right", bold=True)
        add_rect(slide, table_x, ly, table_w, lane_h - 0.08,
                 fill_hex=t.paper if i % 2 == 0 else t.bg,
                 line_hex=t.border, line_width_pt=0.25)

        for milestone in lane.get("items", []):
            p = milestone.get("period", "")
            span = milestone.get("span", 1) or 1
            label = milestone.get("label", "")
            is_em = milestone.get("emphasis", False)
            pi = period_index.get(p, 0)
            mx = table_x + pi * period_w + 0.05
            mw = period_w * span - 0.1
            bar_fill = t.accent if is_em else t.muted
            bar_text = accent_text if is_em else muted_text
            add_rect(slide, mx, ly + 0.1, mw, lane_h - 0.28, fill_hex=bar_fill)
            add_textbox(slide, mx + 0.08, ly + 0.15, mw - 0.1,
                        lane_h - 0.3, label,
                        t.font_body, 16, bar_text, bold=is_em, wrap=True)
