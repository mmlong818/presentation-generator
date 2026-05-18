"""Per-layout deck → PPTist element[] converters."""
from __future__ import annotations

from typing import Any, Callable

from . import (
    argument,
    case_study,
    causality,
    chart_bar,
    checklist,
    compare,
    cover,
    cta,
    data,
    diagram,
    kpi_board,
    matrix_2x2,
    persona,
    process,
    quadrant,
    question,
    quote,
    roadmap,
    statement,
    table,
    timeline,
)

# Each layout fn: (slide_dict, theme: FlatTheme, n: int, total: int) -> list[dict]
LayoutFn = Callable[..., list[dict[str, Any]]]

LAYOUTS: dict[str, LayoutFn] = {
    "cover": cover.build,
    "statement": statement.build,
    "process": process.build,
    "data": data.build,
    "compare": compare.build,
    "timeline": timeline.build,
    "argument": argument.build,
    "quote": quote.build,
    "diagram": diagram.build,
    "cta": cta.build,
    "checklist": checklist.build,
    "matrix-2x2": matrix_2x2.build,
    "chart-bar": chart_bar.build,
    "kpi-board": kpi_board.build,
    "roadmap": roadmap.build,
    "case-study": case_study.build,
    "table": table.build,
    "causality": causality.build,
    "persona": persona.build,
    "quadrant": quadrant.build,
    "question": question.build,
}
