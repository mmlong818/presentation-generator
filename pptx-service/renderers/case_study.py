import logging
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

logger = logging.getLogger(__name__)

OPEN_QUOTE = "“"
CLOSE_QUOTE = "”"
EM_DASH = "—"


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    client = data.get("client", "")
    client_meta = data.get("clientMeta", "")
    context = data.get("context", "")
    challenge = data.get("challenge", "")
    approach = data.get("approach", "")
    results = data.get("results", [])
    quote = data.get("quote", "")
    quote_attr = data.get("quoteAttribution", "")

    from builder import contrast_color
    badge_text = contrast_color(t.accent)

    add_rect(slide, 0.5, 0.3, 3.5, 0.8, fill_hex=t.accent)
    add_textbox(slide, 0.55, 0.35, 3.4, 0.7, client,
                t.font_display, 28, badge_text, bold=True)
    if client_meta:
        add_textbox(slide, 4.2, 0.3, 8.0, 0.8, client_meta,
                    t.font_body, 18, t.muted)

    add_line(slide, 0.5, 1.2, 12.8, 1.2, t.border, 0.5)

    for label, val, y_label, y_val in [
        ("CONTEXT", context, 1.35, 1.75),
        ("CHALLENGE", challenge, 2.95, 3.35),
        ("APPROACH", approach, 4.55, 4.95),
    ]:
        add_textbox(slide, 0.5, y_label, 5.8, 0.4, label,
                    t.font_body, 12, t.muted, bold=True)
        add_textbox(slide, 0.5, y_val, 5.8, 1.1, val,
                    t.font_body, 18, t.text, wrap=True)

    add_line(slide, 6.67, 1.2, 6.67, 7.2, t.border, 0.5)

    add_textbox(slide, 7.0, 1.35, 5.8, 0.4, "RESULTS",
                t.font_body, 12, t.muted, bold=True)
    y = 1.75
    if len(results) > 3:
        logger.warning("case-study: %d results, displaying first 3", len(results))
    for result in results[:3]:
        add_textbox(slide, 7.0, y, 5.8, 0.65,
                    result.get("value", ""), t.font_display, 36,
                    t.accent, bold=True)
        add_textbox(slide, 7.0, y + 0.65, 5.8, 0.4,
                    result.get("metric", ""), t.font_body, 17, t.text)
        delta = result.get("delta", "")
        if delta:
            add_textbox(slide, 7.0, y + 1.05, 5.8, 0.35,
                        delta, t.font_body, 15, t.muted)
        y += 1.5

    if quote:
        add_line(slide, 7.0, 6.3, 12.8, 6.3, t.border, 0.3)
        add_textbox(slide, 7.0, 6.4, 5.8, 0.55,
                    OPEN_QUOTE + quote + CLOSE_QUOTE, t.font_body, 16, t.muted,
                    italic=True, wrap=True)
        if quote_attr:
            add_textbox(slide, 7.0, 6.95, 5.8, 0.35,
                        EM_DASH + " " + quote_attr, t.font_body, 14, t.muted)
