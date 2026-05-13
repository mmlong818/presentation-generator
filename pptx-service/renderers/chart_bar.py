from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    unit = data.get("unit", "")
    bars = data.get("bars", [])
    highlight = data.get("highlight", "")
    source = data.get("source", "")

    add_textbox(slide, 0.83, 0.4, 11.0, 1.0, heading,
                t.font_display, 44, t.text, bold=True)
    if unit:
        add_textbox(slide, 0.83, 1.3, 4.0, 0.4, f"Unit: {unit}",
                    t.font_body, 16, t.muted)

    bars = bars[:8]
    if not bars:
        return
    max_val = max((b.get("value", 0) for b in bars), default=1)
    if max_val == 0:
        max_val = 1

    chart_x = 2.0
    chart_w = 10.5
    chart_top = 1.8
    chart_h = 5.0
    bar_h = chart_h / len(bars) * 0.65
    gap_h = chart_h / len(bars) * 0.35

    for i, bar in enumerate(bars):
        y = chart_top + i * (bar_h + gap_h)
        val = bar.get("value", 0)
        label = bar.get("label", "")
        is_highlight = label == highlight
        fill = t.accent if is_highlight else t.muted
        pct = val / max_val
        bar_w = max(chart_w * pct, 0.05)

        add_textbox(slide, 0.2, y, 1.7, bar_h, label,
                    t.font_body, 18,
                    t.text if is_highlight else t.muted,
                    bold=is_highlight, align="right")
        add_rect(slide, chart_x, y, bar_w, bar_h, fill_hex=fill)
        add_textbox(slide, chart_x + bar_w + 0.08, y, 1.5, bar_h,
                    f"{val:g}", t.font_body, 18, t.text)

    if source:
        add_textbox(slide, 0.83, 7.1, 10.0, 0.35, f"Source: {source}",
                    t.font_body, 14, t.muted)
