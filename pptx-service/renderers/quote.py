from builder import add_bg, add_textbox, add_rect
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    quote = data.get("quote", "")
    source = data.get("source", "")

    add_textbox(slide, 0.7, 0.8, 2.0, 2.5, "“",
                t.font_display, 180, t.accent, bold=True)

    add_textbox(slide, 1.2, 1.5, 11.0, 4.0, quote,
                t.font_display, 44, t.text, italic=True, wrap=True)

    add_rect(slide, 1.2, 6.1, 1.5, 0.04, fill_hex=t.accent)
    add_textbox(slide, 1.2, 6.2, 8.0, 0.6, f"— {source}",
                t.font_body, 22, t.muted)
