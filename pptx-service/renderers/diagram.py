from builder import add_bg, add_textbox, add_rect
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    hint = data.get("hint", "")

    add_textbox(slide, 0.83, 0.7, 11.0, 1.2, heading,
                t.font_display, 48, t.text, bold=True)

    add_rect(slide, 1.5, 2.2, 10.3, 4.5,
             line_hex=t.border, line_width_pt=1.0)
    add_textbox(slide, 1.5, 4.0, 10.3, 1.2, f"[Diagram: {hint}]",
                t.font_body, 28, t.muted, align="center", italic=True)
