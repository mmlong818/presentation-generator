import logging

from builder import add_bg, add_textbox, add_rect, add_line, contrast_color
from theme import ThemeColors

logger = logging.getLogger(__name__)


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    columns = data.get("columns", [])
    rows = data.get("rows", [])
    highlight_col = data.get("highlightColumn", "")
    source = data.get("source", "")

    add_textbox(slide, 0.83, 0.3, 11.0, 0.9, heading,
                t.font_display, 40, t.text, bold=True)

    if not columns:
        return

    table_x = 0.67
    table_w = 12.0
    table_top = 1.3
    col_w = table_w / len(columns)
    row_h = 0.65
    header_h = 0.7
    header_text = contrast_color(t.accent)

    add_rect(slide, table_x, table_top, table_w, header_h, fill_hex=t.accent)

    for j, col in enumerate(columns):
        cx = table_x + j * col_w
        add_textbox(slide, cx + 0.1, table_top + 0.1, col_w - 0.15,
                    header_h - 0.1, col.get("label", ""),
                    t.font_body, 20, header_text,
                    bold=True, align=col.get("align", "left"))

    if len(rows) > 6:
        logger.warning("table: %d rows provided, displaying first 6", len(rows))
    rows = rows[:6]
    for i, row in enumerate(rows):
        y = table_top + header_h + i * row_h
        is_emphasis = row.get("emphasis", False)
        row_fill = t.paper if i % 2 == 0 else t.bg
        add_rect(slide, table_x, y, table_w, row_h,
                 fill_hex=row_fill, line_hex=t.border, line_width_pt=0.25)

        cells = row.get("cells", {})
        for j, col in enumerate(columns):
            cx = table_x + j * col_w
            col_id = col.get("id", "")
            is_hl = col_id == highlight_col
            color = t.accent if is_hl else t.text
            add_textbox(slide, cx + 0.1, y + 0.1, col_w - 0.15,
                        row_h - 0.1, cells.get(col_id, ""),
                        t.font_body, 20, color,
                        bold=is_hl or is_emphasis,
                        align=col.get("align", "left"))

    if source:
        add_textbox(slide, 0.83, 7.1, 10.0, 0.35, f"Source: {source}",
                    t.font_body, 14, t.muted)
