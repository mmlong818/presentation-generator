"""Build prosemirror-style HTML for PPTist text elements.

PPTist uses prosemirror; its serialization produces:
- `<p>...</p>` for paragraphs (optionally with `style="text-align: center;"`)
- `<strong>` for bold, `<em>` for italic
- `<span style="color: #xxx;">` for foreground color
- `<span style="font-size: NNpx;">` for size
- `<span style="font-family: ...;">` for face
"""
from __future__ import annotations

import html
from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class TextRun:
    """Inline run of styled text."""

    text: str
    bold: bool = False
    italic: bool = False
    color: str | None = None
    font_size_px: float | None = None
    font_family: str | None = None


def _wrap_run(run: TextRun) -> str:
    inner = html.escape(run.text)
    styles: list[str] = []
    if run.color:
        styles.append(f"color: {run.color}")
    if run.font_size_px is not None:
        styles.append(f"font-size: {run.font_size_px}px")
    if run.font_family:
        styles.append(f"font-family: {run.font_family}")
    if styles:
        inner = f'<span style="{"; ".join(styles)};">{inner}</span>'
    if run.bold:
        inner = f"<strong>{inner}</strong>"
    if run.italic:
        inner = f"<em>{inner}</em>"
    return inner


def paragraph(
    runs: Iterable[TextRun] | str,
    align: str = "left",
) -> str:
    """Build a single `<p>` paragraph from runs or a plain string."""
    if isinstance(runs, str):
        runs = [TextRun(runs)]
    body = "".join(_wrap_run(r) for r in runs)
    if align != "left":
        return f'<p style="text-align: {align};">{body}</p>'
    return f"<p>{body}</p>"


def simple(text: str, *, bold: bool = False, color: str | None = None, font_size_px: float | None = None, align: str = "left") -> str:
    """Convenience: single-run paragraph."""
    return paragraph([TextRun(text, bold=bold, color=color, font_size_px=font_size_px)], align=align)


def with_highlight(
    text: str,
    highlight: str | None,
    *,
    base_color: str,
    accent_color: str,
    font_size_px: float | None = None,
    bold: bool = False,
    align: str = "left",
) -> str:
    """Build a paragraph where a substring is colored with accent color."""
    if not highlight or highlight not in text:
        return simple(text, bold=bold, color=base_color, font_size_px=font_size_px, align=align)
    idx = text.index(highlight)
    runs = [
        TextRun(text[:idx], bold=bold, color=base_color, font_size_px=font_size_px),
        TextRun(highlight, bold=bold, color=accent_color, font_size_px=font_size_px),
        TextRun(text[idx + len(highlight):], bold=bold, color=base_color, font_size_px=font_size_px),
    ]
    runs = [r for r in runs if r.text]
    return paragraph(runs, align=align)
