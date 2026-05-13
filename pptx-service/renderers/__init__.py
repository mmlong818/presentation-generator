# Renderers are added in Tasks 3-6. Stubs prevent ImportError until then.
from typing import Any, Callable

_stub: Callable = lambda slide, data, t: None

RENDERERS: dict[str, Callable] = {
    "cover": _stub,
    "statement": _stub,
    "argument": _stub,
    "process": _stub,
    "quote": _stub,
    "data": _stub,
    "compare": _stub,
    "checklist": _stub,
    "cta": _stub,
    "timeline": _stub,
    "chart-bar": _stub,
    "kpi-board": _stub,
    "table": _stub,
    "roadmap": _stub,
    "matrix-2x2": _stub,
    "case-study": _stub,
    "causality": _stub,
    "persona": _stub,
    "quadrant": _stub,
    "question": _stub,
    "diagram": _stub,
}
