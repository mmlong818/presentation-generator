from builder import add_bg, add_textbox
from theme import ThemeColors


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    question = data.get("question", "")
    hints = data.get("hints", [])
    invitation = data.get("invitation", "")

    add_textbox(slide, 10.0, 0.5, 3.0, 6.0, "?",
                t.font_display, 360, t.accent, bold=True)

    add_textbox(slide, 0.83, 1.5, 9.5, 4.0, question,
                t.font_display, 56, t.text, bold=True, wrap=True)

    y = 5.8
    for hint in (hints or [])[:3]:
        add_textbox(slide, 0.83, y, 9.0, 0.5, f"· {hint}",
                    t.font_body, 22, t.muted)
        y += 0.45

    if invitation:
        add_textbox(slide, 0.83, 6.8, 9.0, 0.5, invitation,
                    t.font_body, 20, t.muted, italic=True)
