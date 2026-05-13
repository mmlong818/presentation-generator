from builder import add_bg, add_textbox, add_rect, add_line, contrast_color
from theme import ThemeColors

OPEN_QUOTE = "“"
CLOSE_QUOTE = "”"


def render(slide, data: dict, t: ThemeColors) -> None:
    add_bg(slide, t.bg)
    name = data.get("name", "")
    role = data.get("role", "")
    attributes = data.get("attributes", []) or []
    quote = data.get("quote", "")
    needs = data.get("needs", []) or []
    pains = data.get("pains", []) or []

    initials = name[0].upper() if name else "?"
    avatar_text = contrast_color(t.accent)
    add_rect(slide, 0.5, 0.5, 2.0, 2.0, fill_hex=t.accent)
    add_textbox(slide, 0.5, 0.9, 2.0, 1.2, initials,
                t.font_display, 80, avatar_text, bold=True, align="center")

    add_textbox(slide, 2.8, 0.6, 9.5, 0.9, name,
                t.font_display, 48, t.text, bold=True)
    add_textbox(slide, 2.8, 1.5, 9.5, 0.5, role,
                t.font_body, 24, t.muted)

    add_line(slide, 0.5, 2.7, 12.8, 2.7, t.border, 0.5)

    y = 2.9
    for attr in attributes[:4]:
        add_textbox(slide, 0.5, y, 2.5, 0.45,
                    attr.get("label", "") + ":", t.font_body, 17, t.muted, bold=True)
        add_textbox(slide, 3.0, y, 9.8, 0.45,
                    attr.get("value", ""), t.font_body, 17, t.text)
        y += 0.5

    if needs or pains:
        add_line(slide, 6.67, 4.8, 6.67, 7.3, t.border, 0.5)

        add_textbox(slide, 0.5, 4.8, 5.8, 0.5, "NEEDS",
                    t.font_body, 14, t.muted, bold=True)
        ny = 5.3
        for n_item in needs[:3]:
            add_textbox(slide, 0.5, ny, 5.8, 0.5,
                        f"+ {n_item}", t.font_body, 18, t.text, wrap=True)
            ny += 0.5

        add_textbox(slide, 7.0, 4.8, 5.8, 0.5, "PAIN POINTS",
                    t.font_body, 14, t.muted, bold=True)
        py2 = 5.3
        for p_item in pains[:3]:
            add_textbox(slide, 7.0, py2, 5.8, 0.5,
                        f"- {p_item}", t.font_body, 18, t.text, wrap=True)
            py2 += 0.5

    if quote:
        add_line(slide, 0.5, 6.8, 12.8, 6.8, t.border, 0.3)
        add_textbox(slide, 0.5, 6.9, 12.0, 0.55,
                    OPEN_QUOTE + quote + CLOSE_QUOTE,
                    t.font_body, 18, t.muted, italic=True)
