from renderers.cover import render as render_cover
from renderers.statement import render as render_statement
from renderers.argument import render as render_argument
from renderers.quote import render as render_quote
from renderers.cta import render as render_cta
from renderers.question import render as render_question
from renderers.data import render as render_data
from renderers.compare import render as render_compare
from renderers.checklist import render as render_checklist
from renderers.process import render as render_process
from renderers.timeline import render as render_timeline
from renderers.chart_bar import render as render_chart_bar
from renderers.kpi_board import render as render_kpi_board
from renderers.table import render as render_table
from renderers.matrix_2x2 import render as render_matrix
from renderers.roadmap import render as render_roadmap
from typing import Callable

# Stub for layouts not yet implemented (Task 6)
_stub: Callable = lambda slide, data, t: None

RENDERERS = {
    "cover": render_cover,
    "statement": render_statement,
    "argument": render_argument,
    "quote": render_quote,
    "cta": render_cta,
    "question": render_question,
    "data": render_data,
    "compare": render_compare,
    "checklist": render_checklist,
    "process": render_process,
    "timeline": render_timeline,
    "chart-bar": render_chart_bar,
    "kpi-board": render_kpi_board,
    "table": render_table,
    "roadmap": render_roadmap,
    "matrix-2x2": render_matrix,
    "case-study": _stub,
    "causality": _stub,
    "persona": _stub,
    "quadrant": _stub,
    "diagram": _stub,
}
