import logging

from builder import add_bg, add_textbox, add_rect, add_line, DELTA_COLORS
from theme import ThemeColors

logger = logging.getLogger(__name__)


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    period = data.get("period", "")
    kpis = data.get("kpis", [])
    takeaway = data.get("takeaway", "")

    add_textbox(slide, 0.83, 0.3, 9.0, 0.8, heading,
                t.font_display, 40, t.text, bold=True)
    if period:
        add_textbox(slide, 10.0, 0.3, 3.0, 0.8, period,
                    t.font_body, 20, t.muted, align="right")

    if len(kpis) > 6:
        logger.warning("kpi-board: %d KPIs provided, displaying first 6", len(kpis))
    kpis = kpis[:6]
    n = len(kpis)
    if n == 0:
        return
    cols = 3 if n > 3 else n
    rows = (n + cols - 1) // cols
    cell_w = 12.0 / cols
    cell_h = (5.0 if takeaway else 5.5) / rows

    for i, kpi in enumerate(kpis):
        col = i % cols
        row = i // cols
        x = 0.67 + col * cell_w
        y = 1.3 + row * cell_h

        add_rect(slide, x, y, cell_w - 0.2, cell_h - 0.1,
                 fill_hex=t.paper, line_hex=t.border, line_width_pt=0.5)

        add_textbox(slide, x + 0.15, y + 0.12, cell_w - 0.5, 0.4,
                    kpi.get("label", ""), t.font_body, 18, t.muted)
        add_textbox(slide, x + 0.15, y + 0.5, cell_w - 0.5, 1.0,
                    kpi.get("value", ""), t.font_display, 44, t.text, bold=True)
        delta = kpi.get("delta", "")
        if delta:
            tone = kpi.get("deltaTone", "flat")
            add_textbox(slide, x + 0.15, y + 1.5, cell_w - 0.5, 0.35,
                        delta, t.font_body, 18,
                        DELTA_COLORS.get(tone, t.muted), bold=True)
        hint = kpi.get("hint", "")
        if hint:
            add_textbox(slide, x + 0.15, y + 1.9, cell_w - 0.5, 0.4,
                        hint, t.font_body, 15, t.muted, italic=True)

    if takeaway:
        add_line(slide, 0.83, 6.8, 12.5, 6.8, t.border, 0.5)
        add_textbox(slide, 0.83, 6.9, 11.5, 0.45, takeaway,
                    t.font_body, 20, t.muted, italic=True)
