# Native Editable PPTX Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace screenshot-based PPTX export with a Python FastAPI microservice that generates natively editable `.pptx` files using python-pptx, so every text box and shape is clickable and editable in PowerPoint/WPS.

**Architecture:** Next.js sends the existing `Deck` JSON to a Python FastAPI service (`pptx-service/`). The service maps each of the 21 layout types to python-pptx shapes (real text boxes, rectangles, lines — not images). Theme colors/fonts are mapped from the existing `ThemeTokens` structure. The service runs locally on port 5051 alongside Next.js (dev) and as a Docker container in production (pointed to via `PPTX_SERVICE_URL`).

**Tech Stack:** Python 3.11+, FastAPI, python-pptx, uvicorn · Node concurrently (dev) · Docker (prod)

**Slide dimensions:** 13.333" × 7.5" (standard 16:9 — matches existing pptxgenjs layout)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `pptx-service/main.py` | Create | FastAPI app, `/generate` endpoint, `/health` |
| `pptx-service/models.py` | Create | Pydantic models mirroring TypeScript `Deck` types |
| `pptx-service/theme.py` | Create | Map ThemeId → colors/fonts for python-pptx |
| `pptx-service/builder.py` | Create | Slide builder: dispatch to layout renderers, shared helpers |
| `pptx-service/renderers/cover.py` | Create | CoverSlide renderer |
| `pptx-service/renderers/statement.py` | Create | StatementSlide renderer |
| `pptx-service/renderers/argument.py` | Create | ArgumentSlide renderer |
| `pptx-service/renderers/process.py` | Create | ProcessSlide renderer |
| `pptx-service/renderers/quote.py` | Create | QuoteSlide renderer |
| `pptx-service/renderers/data.py` | Create | DataSlide renderer |
| `pptx-service/renderers/compare.py` | Create | CompareSlide renderer |
| `pptx-service/renderers/checklist.py` | Create | ChecklistSlide renderer |
| `pptx-service/renderers/cta.py` | Create | CTASlide renderer |
| `pptx-service/renderers/timeline.py` | Create | TimelineSlide renderer |
| `pptx-service/renderers/chart_bar.py` | Create | ChartBarSlide renderer |
| `pptx-service/renderers/kpi_board.py` | Create | KpiBoardSlide renderer |
| `pptx-service/renderers/table.py` | Create | TableSlide renderer |
| `pptx-service/renderers/roadmap.py` | Create | RoadmapSlide renderer |
| `pptx-service/renderers/matrix_2x2.py` | Create | Matrix2x2Slide renderer |
| `pptx-service/renderers/case_study.py` | Create | CaseStudySlide renderer |
| `pptx-service/renderers/causality.py` | Create | CausalitySlide renderer |
| `pptx-service/renderers/persona.py` | Create | PersonaSlide renderer |
| `pptx-service/renderers/quadrant.py` | Create | QuadrantSlide renderer |
| `pptx-service/renderers/question.py` | Create | QuestionSlide renderer |
| `pptx-service/renderers/diagram.py` | Create | DiagramSlide renderer (text placeholder) |
| `pptx-service/requirements.txt` | Create | python deps |
| `pptx-service/Dockerfile` | Create | Production container |
| `pptx-service/.env.example` | Create | `PORT=5051` |
| `app/api/export-pptx/route.ts` | Create | Next.js proxy to Python service |
| `lib/export-pdf-pptx.ts` | Modify | Add `exportPPTXNative()` calling the new API route |
| `package.json` | Modify | Add `dev:all` script with concurrently |

---

## Task 1: Python service scaffold

**Files:**
- Create: `pptx-service/requirements.txt`
- Create: `pptx-service/main.py`
- Create: `pptx-service/models.py`

- [ ] **Step 1: Create requirements.txt**

```
fastapi==0.115.5
uvicorn[standard]==0.32.1
python-pptx==1.0.2
pydantic==2.10.3
python-multipart==0.0.17
```

- [ ] **Step 2: Create models.py** — Pydantic models mirroring TypeScript types

```python
# pptx-service/models.py
from __future__ import annotations
from typing import Any, Literal, Optional, Union
from pydantic import BaseModel


class BriefInput(BaseModel):
    topic: str
    audience: str
    goal: str
    durationMin: int
    density: Optional[Literal[1, 2]] = 1
    notes: Optional[str] = None


class BrandOverride(BaseModel):
    accent: Optional[str] = None
    bgImageDataUrl: Optional[str] = None
    logoDataUrl: Optional[str] = None
    logoPlacement: Optional[str] = None
    brandName: Optional[str] = None


class ScriptEntry(BaseModel):
    slideIndex: int
    text: str
    durationSec: int


# ── Slide types ─────────────────────────────────────────────────────────────

class SlideBase(BaseModel):
    type: str
    eyebrow: Optional[str] = None


class CoverSlide(SlideBase):
    type: Literal["cover"]
    title: str
    subtitle: Optional[str] = None
    highlight: Optional[str] = None


class StatementSlide(SlideBase):
    type: Literal["statement"]
    title: str
    highlight: Optional[list[str]] = None
    align: Optional[Literal["center", "left"]] = None


class ProcessStep(BaseModel):
    title: str
    desc: Optional[str] = None


class ProcessSlide(SlideBase):
    type: Literal["process"]
    heading: str
    steps: list[ProcessStep]


class StatPoint(BaseModel):
    value: str
    label: str
    source: Optional[str] = None


class DataSlide(SlideBase):
    type: Literal["data"]
    heading: str
    stats: list[StatPoint]


class CompareColumn(BaseModel):
    title: str
    items: list[str]


class CompareSlide(SlideBase):
    type: Literal["compare"]
    heading: str
    left: CompareColumn
    right: CompareColumn


class TimelineEvent(BaseModel):
    time: str
    title: str
    desc: Optional[str] = None


class TimelineSlide(SlideBase):
    type: Literal["timeline"]
    heading: str
    events: list[TimelineEvent]


class ArgumentSlide(SlideBase):
    type: Literal["argument"]
    heading: str
    highlight: Optional[str] = None
    points: list[str]


class QuoteSlide(SlideBase):
    type: Literal["quote"]
    quote: str
    source: str
    highlight: Optional[str] = None


class DiagramSlide(SlideBase):
    type: Literal["diagram"]
    heading: str
    hint: str


class CTASlide(SlideBase):
    type: Literal["cta"]
    newAction: str
    highlight: Optional[str] = None
    oldQuestion: Optional[str] = None


class ChecklistSlide(SlideBase):
    type: Literal["checklist"]
    heading: str
    items: list[str]


class MatrixCell(BaseModel):
    label: str
    desc: Optional[str] = None
    emphasis: Optional[bool] = None


class MatrixAxes(BaseModel):
    x: dict[str, str]  # {low, high}
    y: dict[str, str]


class Matrix2x2Slide(SlideBase):
    type: Literal["matrix-2x2"]
    heading: str
    axes: MatrixAxes
    cells: list[MatrixCell]  # 4 cells: TL, TR, BL, BR
    takeaway: Optional[str] = None


class ChartBar(BaseModel):
    label: str
    value: float
    note: Optional[str] = None


class ChartBarSlide(SlideBase):
    type: Literal["chart-bar"]
    heading: str
    unit: str
    bars: list[ChartBar]
    highlight: Optional[str] = None
    source: Optional[str] = None


class Kpi(BaseModel):
    label: str
    value: str
    delta: Optional[str] = None
    deltaTone: Optional[Literal["pos", "neg", "flat"]] = None
    hint: Optional[str] = None


class KpiBoardSlide(SlideBase):
    type: Literal["kpi-board"]
    heading: str
    period: str
    kpis: list[Kpi]
    takeaway: Optional[str] = None


class RoadmapMilestone(BaseModel):
    period: str
    span: Optional[int] = 1
    label: str
    emphasis: Optional[bool] = None


class RoadmapLane(BaseModel):
    name: str
    items: list[RoadmapMilestone]


class RoadmapSlide(SlideBase):
    type: Literal["roadmap"]
    heading: str
    periods: list[str]
    lanes: list[RoadmapLane]
    legend: Optional[str] = None


class CaseResult(BaseModel):
    metric: str
    value: str
    delta: Optional[str] = None


class CaseStudySlide(SlideBase):
    type: Literal["case-study"]
    client: str
    clientMeta: Optional[str] = None
    context: str
    challenge: str
    approach: str
    results: list[CaseResult]
    quote: Optional[str] = None
    quoteAttribution: Optional[str] = None


class TableColumn(BaseModel):
    id: str
    label: str
    align: Optional[Literal["left", "right", "center"]] = None


class TableRow(BaseModel):
    cells: dict[str, str]
    emphasis: Optional[bool] = None


class TableSlide(SlideBase):
    type: Literal["table"]
    heading: str
    columns: list[TableColumn]
    rows: list[TableRow]
    highlightColumn: Optional[str] = None
    source: Optional[str] = None


class CausalLink(BaseModel):
    cause: str
    because: Optional[str] = None


class CausalitySlide(SlideBase):
    type: Literal["causality"]
    heading: str
    chain: list[CausalLink]
    conclusion: Optional[str] = None


class PersonaAttr(BaseModel):
    label: str
    value: str


class PersonaSlide(SlideBase):
    type: Literal["persona"]
    name: str
    role: str
    attributes: Optional[list[PersonaAttr]] = None
    quote: Optional[str] = None
    needs: Optional[list[str]] = None
    pains: Optional[list[str]] = None


class QuadrantAxes(BaseModel):
    x: dict[str, str]  # {label, low, high}
    y: dict[str, str]


class QuadrantPoint(BaseModel):
    id: str
    label: str
    gridX: int
    gridY: int


class QuadrantSlide(SlideBase):
    type: Literal["quadrant"]
    heading: str
    axes: QuadrantAxes
    points: list[QuadrantPoint]
    highlight: Optional[str] = None
    source: Optional[str] = None


class QuestionSlide(SlideBase):
    type: Literal["question"]
    question: str
    hints: Optional[list[str]] = None
    invitation: Optional[str] = None


AnySlide = Union[
    CoverSlide, StatementSlide, ProcessSlide, DataSlide, CompareSlide,
    TimelineSlide, ArgumentSlide, QuoteSlide, DiagramSlide, CTASlide,
    ChecklistSlide, Matrix2x2Slide, ChartBarSlide, KpiBoardSlide,
    RoadmapSlide, CaseStudySlide, TableSlide, CausalitySlide,
    PersonaSlide, QuadrantSlide, QuestionSlide,
]


class Deck(BaseModel):
    title: str
    theme: str
    brief: BriefInput
    framework: str
    slides: list[dict[str, Any]]  # parsed individually by type discriminator
    script: list[ScriptEntry] = []
    brand: Optional[BrandOverride] = None


class GenerateRequest(BaseModel):
    deck: Deck
```

- [ ] **Step 3: Create main.py**

```python
# pptx-service/main.py
import io
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import ValidationError

from models import GenerateRequest
from builder import build_pptx

app = FastAPI(title="PPTX Native Service", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
def generate(req: GenerateRequest):
    try:
        pptx_bytes = build_pptx(req.deck)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    title = req.deck.title or "presentation"
    safe_title = "".join(c for c in title if c.isalnum() or c in " -_").strip()
    filename = f"{safe_title or 'deck'}.pptx"

    return StreamingResponse(
        io.BytesIO(pptx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 5051))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
```

- [ ] **Step 4: Verify Python is available and install deps**

```bash
cd pptx-service
pip install -r requirements.txt
python -c "from pptx import Presentation; print('python-pptx ok')"
```

Expected: `python-pptx ok`

- [ ] **Step 5: Commit**

```bash
git add pptx-service/requirements.txt pptx-service/main.py pptx-service/models.py
git commit -m "feat(pptx-service): scaffold FastAPI service with Pydantic models"
```

---

## Task 2: Theme mapping + shared builder helpers

**Files:**
- Create: `pptx-service/theme.py`
- Create: `pptx-service/builder.py`

- [ ] **Step 1: Create theme.py**

```python
# pptx-service/theme.py
from dataclasses import dataclass


@dataclass
class ThemeColors:
    bg: str           # hex e.g. "#f6f4ef"
    paper: str
    text: str
    muted: str
    accent: str
    border: str
    font_display: str  # family name for python-pptx
    font_body: str
    mode: str          # "light" | "dark"


def _first_font(css_stack: str) -> str:
    """Extract first font name from CSS font-family stack."""
    first = css_stack.split(",")[0].strip().strip('"').strip("'")
    # Map known CJK/display fonts to safe fallbacks python-pptx can embed
    mappings = {
        "Source Han Serif SC": "SimSun",
        "Noto Serif SC": "SimSun",
        "Source Serif 4": "Georgia",
        "Tiempos Headline": "Georgia",
        "Tiempos Text": "Georgia",
        "PingFang SC": "Microsoft YaHei",
        "Helvetica Neue": "Arial",
        "Inter": "Arial",
        "IBM Plex Mono": "Courier New",
        "JetBrains Mono": "Courier New",
        "Space Mono": "Courier New",
        "Space Grotesk": "Arial",
        "DM Sans": "Arial",
        "Plus Jakarta Sans": "Arial",
        "Syne": "Arial",
        "Bebas Neue": "Arial Black",
    }
    return mappings.get(first, first)


THEMES: dict[str, ThemeColors] = {
    "soft-warm": ThemeColors(
        bg="#f6f4ef", paper="#fffdf7", text="#2a2620", muted="#857d6e",
        accent="#c9591f", border="#d6cfbf",
        font_display=_first_font('"Source Han Serif SC","Noto Serif SC",Georgia,serif'),
        font_body=_first_font('"PingFang SC","Helvetica Neue","Inter",sans-serif'),
        mode="light",
    ),
    "editorial-monocle": ThemeColors(
        bg="#faf8f3", paper="#ffffff", text="#0f0f0e", muted="#5e5b54",
        accent="#8a1c1c", border="#0f0f0e",
        font_display="Georgia", font_body="Georgia", mode="light",
    ),
    "modern-minimal": ThemeColors(
        bg="#f5f5f3", paper="#ffffff", text="#111111", muted="#888888",
        accent="#2563eb", border="#e5e5e5",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "tech-utility": ThemeColors(
        bg="#0d1117", paper="#161b22", text="#e6edf3", muted="#8b949e",
        accent="#58a6ff", border="#30363d",
        font_display="Courier New", font_body="Arial", mode="dark",
    ),
    "brutalist-mono": ThemeColors(
        bg="#f0ede8", paper="#ffffff", text="#0a0a0a", muted="#555555",
        accent="#0a0a0a", border="#0a0a0a",
        font_display="Arial Black", font_body="Courier New", mode="light",
    ),
    "academic-paper": ThemeColors(
        bg="#fdfcf7", paper="#ffffff", text="#1a1a1a", muted="#666666",
        accent="#1a3a5c", border="#cccccc",
        font_display="Georgia", font_body="Georgia", mode="light",
    ),
    "midnight-luxe": ThemeColors(
        bg="#0a0a0f", paper="#13131f", text="#f0f0ff", muted="#8888aa",
        accent="#c9a84c", border="#2a2a4a",
        font_display="Georgia", font_body="Arial", mode="dark",
    ),
    "risograph": ThemeColors(
        bg="#f5f0e8", paper="#fffef5", text="#1a1a1a", muted="#666644",
        accent="#e84040", border="#cccc88",
        font_display="Arial Black", font_body="Arial", mode="light",
    ),
    "kraft-paper": ThemeColors(
        bg="#c4a882", paper="#d4b896", text="#2c1a0a", muted="#7a5535",
        accent="#8b2500", border="#a07040",
        font_display="Georgia", font_body="Georgia", mode="light",
    ),
    "broadcast-hud": ThemeColors(
        bg="#040810", paper="#0a1020", text="#00ff88", muted="#00aa55",
        accent="#ff4400", border="#003322",
        font_display="Courier New", font_body="Courier New", mode="dark",
    ),
    # v2 themes — simplified mappings
    "pastel-bauhaus": ThemeColors(
        bg="#f9f7f4", paper="#ffffff", text="#1a1a1a", muted="#888888",
        accent="#e85d26", border="#e0dcd5",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "summer-cocktail": ThemeColors(
        bg="#fff8ee", paper="#ffffff", text="#1a1a1a", muted="#888866",
        accent="#ff6b35", border="#ffe0b2",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "riso-pastel": ThemeColors(
        bg="#f8f4ff", paper="#ffffff", text="#1a1a1a", muted="#8866aa",
        accent="#cc44cc", border="#ddc0ee",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "sunrise-gradient": ThemeColors(
        bg="#fff9f0", paper="#ffffff", text="#1a1a1a", muted="#aa7744",
        accent="#ff6600", border="#ffd0a0",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "playground-block": ThemeColors(
        bg="#f0f8ff", paper="#ffffff", text="#111111", muted="#4466aa",
        accent="#0044ff", border="#aaccee",
        font_display="Arial Black", font_body="Arial", mode="light",
    ),
    "tea-ceremony": ThemeColors(
        bg="#f5f2ec", paper="#faf8f3", text="#2a2419", muted="#7a6e5f",
        accent="#6b8c6b", border="#d4cec4",
        font_display="SimSun", font_body="Microsoft YaHei", mode="light",
    ),
    "paper-collage": ThemeColors(
        bg="#f7f3ed", paper="#ffffff", text="#1a1a1a", muted="#887766",
        accent="#cc5544", border="#e0d0c0",
        font_display="Georgia", font_body="Arial", mode="light",
    ),
    "citrus-grove": ThemeColors(
        bg="#f8fff0", paper="#ffffff", text="#1a2a0a", muted="#668844",
        accent="#88cc00", border="#c8e890",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "minimal-rainbow": ThemeColors(
        bg="#ffffff", paper="#f8f8f8", text="#111111", muted="#666666",
        accent="#4444ff", border="#eeeeee",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "pop-magazine": ThemeColors(
        bg="#ffee00", paper="#ffffff", text="#0a0a0a", muted="#444400",
        accent="#ff0055", border="#0a0a0a",
        font_display="Arial Black", font_body="Arial", mode="light",
    ),
}


def get_theme(theme_id: str) -> ThemeColors:
    return THEMES.get(theme_id, THEMES["modern-minimal"])
```

- [ ] **Step 2: Create builder.py with helpers and dispatcher**

```python
# pptx-service/builder.py
import io
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
from typing import Any

from models import Deck
from theme import ThemeColors, get_theme

# 16:9 slide dimensions
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)


def hex_to_rgb(hex_color: str) -> RGBColor:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return RGBColor(r, g, b)


def add_bg(slide, color: str):
    """Fill slide background with a solid color."""
    from pptx.oxml.ns import qn
    from lxml import etree
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = hex_to_rgb(color)


def add_rect(slide, x, y, w, h, fill_hex: str | None = None,
             line_hex: str | None = None, line_width_pt: float = 0) -> Any:
    """Add a rectangle shape and return it."""
    from pptx.util import Pt
    shape = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE
        Inches(x), Inches(y), Inches(w), Inches(h),
    )
    if fill_hex:
        shape.fill.solid()
        shape.fill.fore_color.rgb = hex_to_rgb(fill_hex)
    else:
        shape.fill.background()
    if line_hex and line_width_pt > 0:
        shape.line.color.rgb = hex_to_rgb(line_hex)
        shape.line.width = Pt(line_width_pt)
    else:
        shape.line.fill.background()
    return shape


def add_textbox(slide, x, y, w, h, text: str, font_name: str,
                font_size_pt: float, color_hex: str,
                bold: bool = False, italic: bool = False,
                align: str = "left", wrap: bool = True) -> Any:
    """Add a text box and return it."""
    from pptx.enum.text import PP_ALIGN
    txBox = slide.shapes.add_textbox(
        Inches(x), Inches(y), Inches(w), Inches(h)
    )
    tf = txBox.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.text = text
    p.alignment = {
        "left": PP_ALIGN.LEFT,
        "center": PP_ALIGN.CENTER,
        "right": PP_ALIGN.RIGHT,
    }.get(align, PP_ALIGN.LEFT)
    run = p.runs[0]
    run.font.name = font_name
    run.font.size = Pt(font_size_pt)
    run.font.color.rgb = hex_to_rgb(color_hex)
    run.font.bold = bold
    run.font.italic = italic
    return txBox


def add_line(slide, x1, y1, x2, y2, color_hex: str, width_pt: float = 1.0):
    """Add a line connector."""
    from pptx.util import Pt
    from pptx.enum.shapes import MSO_SHAPE_TYPE
    connector = slide.shapes.add_connector(
        1,  # MSO_CONNECTOR_TYPE.STRAIGHT
        Inches(x1), Inches(y1), Inches(x2), Inches(y2),
    )
    connector.line.color.rgb = hex_to_rgb(color_hex)
    connector.line.width = Pt(width_pt)
    return connector


def add_eyebrow(slide, text: str, t: ThemeColors,
                x: float = 0.83, y: float = 0.5, w: float = 11.0):
    if not text:
        return
    add_textbox(slide, x, y, w, 0.4, text.upper(),
                t.font_body, 14, t.muted, bold=False)


def render_slide(slide, data: dict, t: ThemeColors):
    """Dispatch to layout renderer."""
    layout_type = data.get("type", "diagram")
    from renderers import RENDERERS
    renderer = RENDERERS.get(layout_type)
    if renderer:
        renderer(slide, data, t)
    else:
        # Fallback: show layout type as placeholder
        add_bg(slide, t.bg)
        add_textbox(slide, 0.83, 2.5, 11.0, 2.0,
                    f"[{layout_type}] — layout not rendered",
                    t.font_body, 28, t.muted, align="center")


def build_pptx(deck: Deck) -> bytes:
    t = get_theme(deck.theme)
    # Apply brand accent override if present
    if deck.brand and deck.brand.accent:
        t.accent = deck.brand.accent

    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H

    blank_layout = prs.slide_layouts[6]  # blank

    for slide_data in deck.slides:
        slide = prs.slides.add_slide(blank_layout)
        render_slide(slide, slide_data, t)

    buf = io.BytesIO()
    prs.save(buf)
    buf.seek(0)
    return buf.read()
```

- [ ] **Step 3: Create renderers package init**

```python
# pptx-service/renderers/__init__.py
from renderers.cover import render as render_cover
from renderers.statement import render as render_statement
from renderers.argument import render as render_argument
from renderers.process import render as render_process
from renderers.quote import render as render_quote
from renderers.data import render as render_data
from renderers.compare import render as render_compare
from renderers.checklist import render as render_checklist
from renderers.cta import render as render_cta
from renderers.timeline import render as render_timeline
from renderers.chart_bar import render as render_chart_bar
from renderers.kpi_board import render as render_kpi_board
from renderers.table import render as render_table
from renderers.roadmap import render as render_roadmap
from renderers.matrix_2x2 import render as render_matrix
from renderers.case_study import render as render_case_study
from renderers.causality import render as render_causality
from renderers.persona import render as render_persona
from renderers.quadrant import render as render_quadrant
from renderers.question import render as render_question
from renderers.diagram import render as render_diagram

RENDERERS = {
    "cover": render_cover,
    "statement": render_statement,
    "argument": render_argument,
    "process": render_process,
    "quote": render_quote,
    "data": render_data,
    "compare": render_compare,
    "checklist": render_checklist,
    "cta": render_cta,
    "timeline": render_timeline,
    "chart-bar": render_chart_bar,
    "kpi-board": render_kpi_board,
    "table": render_table,
    "roadmap": render_roadmap,
    "matrix-2x2": render_matrix,
    "case-study": render_case_study,
    "causality": render_causality,
    "persona": render_persona,
    "quadrant": render_quadrant,
    "question": render_question,
    "diagram": render_diagram,
}
```

- [ ] **Step 4: Smoke test builder with a dummy deck**

```bash
cd pptx-service
python -c "
from models import Deck, BriefInput
from builder import build_pptx
d = Deck(
  title='Test',
  theme='modern-minimal',
  brief=BriefInput(topic='t', audience='a', goal='g', durationMin=5),
  framework='duarte',
  slides=[{'type':'cover','title':'Hello World'}],
)
data = build_pptx(d)
open('/tmp/test.pptx','wb').write(data)
print(f'OK: {len(data)} bytes')
"
```

Expected: `OK: <some number> bytes`

- [ ] **Step 5: Commit**

```bash
git add pptx-service/theme.py pptx-service/builder.py pptx-service/renderers/__init__.py
git commit -m "feat(pptx-service): theme mapping + builder dispatcher"
```

---

## Task 3: Core layout renderers — Group A (cover, statement, argument, quote, cta, question)

**Files:** `pptx-service/renderers/cover.py` through `question.py`

These layouts share a pattern: large heading/title + optional subtext. Implement all 6 in this task.

- [ ] **Step 1: Create cover.py**

```python
# pptx-service/renderers/cover.py
from builder import add_bg, add_textbox, add_rect, add_eyebrow
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    title = data.get("title", "")
    subtitle = data.get("subtitle", "")
    eyebrow = data.get("eyebrow", "")

    # Left accent bar
    add_rect(slide, 0.6, 1.8, 0.08, 3.8, fill_hex=t.accent)

    # Eyebrow
    if eyebrow:
        add_textbox(slide, 0.83, 1.7, 10.0, 0.5, eyebrow.upper(),
                    t.font_body, 16, t.muted)

    # Title
    add_textbox(slide, 0.83, 2.2, 11.0, 3.5, title,
                t.font_display, 80, t.text, bold=True, wrap=True)

    # Subtitle
    if subtitle:
        add_textbox(slide, 0.83, 5.9, 9.0, 0.8, subtitle,
                    t.font_body, 28, t.muted)
```

- [ ] **Step 2: Create statement.py**

```python
# pptx-service/renderers/statement.py
from builder import add_bg, add_textbox, add_eyebrow
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    title = data.get("title", "")
    align = data.get("align", "center")
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)

    # Center large statement
    x = 0.83 if align == "left" else 1.0
    add_textbox(slide, x, 1.5, 11.5, 5.0, title,
                t.font_display, 72, t.text, bold=True,
                align=align, wrap=True)
```

- [ ] **Step 3: Create argument.py**

```python
# pptx-service/renderers/argument.py
from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    points = data.get("points", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)

    # Heading
    add_textbox(slide, 0.83, 0.8, 11.0, 1.5, heading,
                t.font_display, 52, t.text, bold=True, wrap=True)

    # Divider
    add_line(slide, 0.83, 2.5, 12.5, 2.5, t.border, 0.5)

    # Bullet points
    y = 2.7
    for point in points[:6]:
        # Bullet dot
        add_rect(slide, 0.83, y + 0.15, 0.1, 0.1, fill_hex=t.accent)
        add_textbox(slide, 1.1, y, 11.0, 0.65, point,
                    t.font_body, 28, t.text, wrap=True)
        y += 0.75
```

- [ ] **Step 4: Create quote.py**

```python
# pptx-service/renderers/quote.py
from builder import add_bg, add_textbox, add_rect
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    quote = data.get("quote", "")
    source = data.get("source", "")

    # Large quote mark
    add_textbox(slide, 0.7, 0.8, 2.0, 2.5, "“",
                t.font_display, 180, t.accent, bold=True)

    # Quote text
    add_textbox(slide, 1.2, 1.5, 11.0, 4.0, quote,
                t.font_display, 44, t.text, italic=True, wrap=True)

    # Source attribution line
    add_rect(slide, 1.2, 6.1, 1.5, 0.04, fill_hex=t.accent)
    add_textbox(slide, 1.2, 6.2, 8.0, 0.6, f"— {source}",
                t.font_body, 22, t.muted)
```

- [ ] **Step 5: Create cta.py**

```python
# pptx-service/renderers/cta.py
from builder import add_bg, add_textbox, add_rect
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.accent)
    action = data.get("newAction", "")

    # Full-bleed accent bg, white/light text
    text_color = "#ffffff" if t.mode == "dark" or t.accent.lower() not in ("#ffffff", "#f5f5f5") else t.text

    add_textbox(slide, 1.0, 2.2, 11.3, 4.0, action,
                t.font_display, 68, text_color, bold=True,
                align="center", wrap=True)
```

- [ ] **Step 6: Create question.py**

```python
# pptx-service/renderers/question.py
from builder import add_bg, add_textbox, add_rect
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    question = data.get("question", "")
    hints = data.get("hints", [])
    invitation = data.get("invitation", "")

    # Giant "?" anchor
    add_textbox(slide, 10.0, 0.5, 3.0, 6.0, "?",
                t.font_display, 360, t.accent, bold=True)

    # Question text
    add_textbox(slide, 0.83, 1.5, 9.5, 4.0, question,
                t.font_display, 56, t.text, bold=True, wrap=True)

    # Hints
    y = 5.8
    for hint in hints[:3]:
        add_textbox(slide, 0.83, y, 9.0, 0.5, f"· {hint}",
                    t.font_body, 22, t.muted)
        y += 0.45

    if invitation:
        add_textbox(slide, 0.83, 6.8, 9.0, 0.5, invitation,
                    t.font_body, 20, t.muted, italic=True)
```

- [ ] **Step 7: Run smoke test for group A**

```bash
cd pptx-service
python -c "
from models import Deck, BriefInput
from builder import build_pptx
slides = [
  {'type':'cover','title':'AI in 2025','subtitle':'A deep dive'},
  {'type':'statement','title':'Everything changes. Adapt or disappear.'},
  {'type':'argument','heading':'Why act now','points':['Market is moving fast','Competitors are ahead','Cost of delay is compounding']},
  {'type':'quote','quote':'The best way to predict the future is to create it.','source':'Alan Kay'},
  {'type':'cta','newAction':'Start your pilot program today'},
  {'type':'question','question':'What would you do with 10x the bandwidth?','hints':['Think infrastructure','Think team size']},
]
d = Deck(title='Test A',theme='modern-minimal',brief=BriefInput(topic='t',audience='a',goal='g',durationMin=5),framework='duarte',slides=slides)
data = build_pptx(d)
open('/tmp/test_group_a.pptx','wb').write(data)
print(f'OK: {len(data)} bytes, {len(slides)} slides')
"
```

Expected: `OK: <N> bytes, 6 slides`

- [ ] **Step 8: Commit**

```bash
git add pptx-service/renderers/
git commit -m "feat(pptx-service): cover/statement/argument/quote/cta/question renderers"
```

---

## Task 4: Layout renderers — Group B (data, compare, checklist, process, timeline)

**Files:** `pptx-service/renderers/data.py`, `compare.py`, `checklist.py`, `process.py`, `timeline.py`

- [ ] **Step 1: Create data.py**

```python
# pptx-service/renderers/data.py
from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    stats = data.get("stats", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.7, 11.0, 1.2, heading,
                t.font_display, 44, t.text, bold=True)
    add_line(slide, 0.83, 1.9, 12.5, 1.9, t.border, 0.5)

    # Distribute stats evenly (up to 4)
    stats = stats[:4]
    n = len(stats)
    col_w = 12.0 / max(n, 1)
    for i, stat in enumerate(stats):
        x = 0.67 + i * col_w
        # Value (big)
        add_textbox(slide, x, 2.2, col_w - 0.2, 2.0, stat.get("value", ""),
                    t.font_display, 80, t.accent, bold=True, align="center")
        # Label
        add_textbox(slide, x, 4.3, col_w - 0.2, 0.7, stat.get("label", ""),
                    t.font_body, 24, t.text, align="center")
        # Source
        src = stat.get("source", "")
        if src:
            add_textbox(slide, x, 5.1, col_w - 0.2, 0.5, src,
                        t.font_body, 16, t.muted, align="center")
        # Vertical divider (not after last)
        if i < n - 1:
            add_line(slide, x + col_w - 0.1, 2.2, x + col_w - 0.1, 5.8,
                     t.border, 0.5)
```

- [ ] **Step 2: Create compare.py**

```python
# pptx-service/renderers/compare.py
from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    left = data.get("left", {})
    right = data.get("right", {})
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.7, 11.0, 1.0, heading,
                t.font_display, 40, t.text, bold=True)

    # Center divider
    add_line(slide, 6.67, 1.8, 6.67, 7.0, t.border, 1.0)

    for side, x_offset, align in [(left, 0.5, "left"), (right, 7.0, "left")]:
        title = side.get("title", "")
        items = side.get("items", [])
        add_textbox(slide, x_offset, 1.9, 5.8, 0.8, title,
                    t.font_display, 32, t.accent, bold=True)
        y = 2.8
        for item in items[:6]:
            add_rect(slide, x_offset, y + 0.15, 0.08, 0.08, fill_hex=t.muted)
            add_textbox(slide, x_offset + 0.25, y, 5.4, 0.6, item,
                        t.font_body, 24, t.text, wrap=True)
            y += 0.68
```

- [ ] **Step 3: Create checklist.py**

```python
# pptx-service/renderers/checklist.py
from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    items = data.get("items", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.7, 11.0, 1.2, heading,
                t.font_display, 48, t.text, bold=True)
    add_line(slide, 0.83, 2.0, 12.5, 2.0, t.border, 0.5)

    y = 2.2
    row_h = 0.75
    items = items[:7]
    for item in items:
        # Checkbox
        add_rect(slide, 0.83, y + 0.05, 0.42, 0.42,
                 fill_hex=None, line_hex=t.accent, line_width_pt=1.5)
        # Check mark (empty box — user fills in PowerPoint)
        add_textbox(slide, 1.4, y, 11.0, 0.6, item,
                    t.font_body, 28, t.text)
        y += row_h
```

- [ ] **Step 4: Create process.py**

```python
# pptx-service/renderers/process.py
from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    steps = data.get("steps", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.5, 11.0, 1.2, heading,
                t.font_display, 44, t.text, bold=True)

    steps = steps[:5]
    n = len(steps)
    step_w = 12.0 / max(n, 1)
    mid_y = 4.0  # vertical center for arrow row

    for i, step in enumerate(steps):
        x = 0.67 + i * step_w
        # Numbered circle
        add_rect(slide, x + step_w / 2 - 0.3, mid_y - 0.5, 0.6, 0.6,
                 fill_hex=t.accent)
        add_textbox(slide, x + step_w / 2 - 0.3, mid_y - 0.5, 0.6, 0.6,
                    str(i + 1), t.font_display, 22, "#ffffff",
                    bold=True, align="center")
        # Connector arrow (not after last)
        if i < n - 1:
            add_line(slide, x + step_w - 0.15, mid_y - 0.2,
                     x + step_w - 0.15, mid_y - 0.2, t.muted, 1.0)
            add_line(slide, x + step_w * 0.9, mid_y - 0.2,
                     x + step_w + 0.05, mid_y - 0.2, t.border, 1.5)
        # Step title
        add_textbox(slide, x, mid_y + 0.25, step_w - 0.1, 0.8,
                    step.get("title", ""), t.font_display, 24,
                    t.text, bold=True, align="center", wrap=True)
        # Step desc
        desc = step.get("desc", "")
        if desc:
            add_textbox(slide, x, mid_y + 1.1, step_w - 0.1, 1.0,
                        desc, t.font_body, 18, t.muted,
                        align="center", wrap=True)
```

- [ ] **Step 5: Create timeline.py**

```python
# pptx-service/renderers/timeline.py
from builder import add_bg, add_textbox, add_rect, add_eyebrow, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    events = data.get("events", [])
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.5, 11.0, 1.0, heading,
                t.font_display, 44, t.text, bold=True)

    # Horizontal timeline spine
    add_line(slide, 0.83, 3.75, 12.5, 3.75, t.accent, 2.0)

    events = events[:5]
    n = len(events)
    gap = 11.7 / max(n, 1)

    for i, event in enumerate(events):
        x = 0.83 + i * gap + gap / 2
        # Node dot
        add_rect(slide, x - 0.12, 3.63, 0.24, 0.24, fill_hex=t.accent)
        # Time label (above spine)
        add_textbox(slide, x - 1.0, 2.9, 2.0, 0.6,
                    event.get("time", ""), t.font_body, 18, t.muted,
                    align="center", bold=True)
        # Event title (below spine)
        add_textbox(slide, x - 1.2, 4.1, 2.4, 0.7,
                    event.get("title", ""), t.font_display, 22,
                    t.text, bold=True, align="center", wrap=True)
        # Desc
        desc = event.get("desc", "")
        if desc:
            add_textbox(slide, x - 1.2, 4.9, 2.4, 1.2,
                        desc, t.font_body, 17, t.muted,
                        align="center", wrap=True)
```

- [ ] **Step 6: Smoke test group B**

```bash
cd pptx-service
python -c "
from models import Deck, BriefInput
from builder import build_pptx
slides = [
  {'type':'data','heading':'Key Metrics','stats':[{'value':'42%','label':'Growth'},{'value':'\$2.1M','label':'ARR'},{'value':'98%','label':'Retention'}]},
  {'type':'compare','heading':'Before vs After','left':{'title':'Before','items':['Manual process','3-day turnaround','High error rate']},'right':{'title':'After','items':['Automated','Same-day','Near-zero errors']}},
  {'type':'checklist','heading':'Launch Checklist','items':['Security audit complete','Load testing passed','Docs published','Team trained']},
  {'type':'process','heading':'Onboarding in 3 Steps','steps':[{'title':'Sign Up','desc':'Create account in 60s'},{'title':'Connect','desc':'Link your data source'},{'title':'Launch','desc':'Go live instantly'}]},
  {'type':'timeline','heading':'Product Roadmap','events':[{'time':'Q1','title':'MVP'},{'time':'Q2','title':'Beta','desc':'50 users'},{'time':'Q3','title':'Launch'},{'time':'Q4','title':'Scale'}]},
]
d = Deck(title='Test B',theme='soft-warm',brief=BriefInput(topic='t',audience='a',goal='g',durationMin=5),framework='duarte',slides=slides)
data = build_pptx(d)
open('/tmp/test_group_b.pptx','wb').write(data)
print(f'OK: {len(data)} bytes, {len(slides)} slides')
"
```

Expected: `OK: <N> bytes, 5 slides`

- [ ] **Step 7: Commit**

```bash
git add pptx-service/renderers/
git commit -m "feat(pptx-service): data/compare/checklist/process/timeline renderers"
```

---

## Task 5: Layout renderers — Group C (chart-bar, kpi-board, table, matrix-2x2, roadmap)

**Files:** `chart_bar.py`, `kpi_board.py`, `table.py`, `matrix_2x2.py`, `roadmap.py`

- [ ] **Step 1: Create chart_bar.py**

```python
# pptx-service/renderers/chart_bar.py
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    unit = data.get("unit", "")
    bars = data.get("bars", [])
    highlight = data.get("highlight", "")
    source = data.get("source", "")

    add_textbox(slide, 0.83, 0.4, 11.0, 1.0, heading,
                t.font_display, 44, t.text, bold=True)
    if unit:
        add_textbox(slide, 0.83, 1.3, 4.0, 0.4, f"Unit: {unit}",
                    t.font_body, 16, t.muted)

    bars = bars[:8]
    if not bars:
        return
    max_val = max(b.get("value", 0) for b in bars)
    if max_val == 0:
        max_val = 1

    chart_x = 2.0
    chart_w = 10.5
    chart_top = 1.8
    chart_h = 5.0
    bar_h = chart_h / len(bars) * 0.65
    gap_h = chart_h / len(bars) * 0.35

    for i, bar in enumerate(bars):
        y = chart_top + i * (bar_h + gap_h)
        val = bar.get("value", 0)
        label = bar.get("label", "")
        note = bar.get("note", "")
        pct = val / max_val
        bar_w = chart_w * pct

        is_highlight = label == highlight
        fill = t.accent if is_highlight else t.muted

        # Label column
        add_textbox(slide, 0.2, y, 1.7, bar_h, label,
                    t.font_body, 18, t.text if is_highlight else t.muted,
                    bold=is_highlight, align="right")
        # Bar
        add_rect(slide, chart_x, y, bar_w, bar_h, fill_hex=fill)
        # Value text
        add_textbox(slide, chart_x + bar_w + 0.08, y, 1.5, bar_h,
                    f"{val:g}", t.font_body, 18, t.text)

    if source:
        add_textbox(slide, 0.83, 7.1, 10.0, 0.35, f"Source: {source}",
                    t.font_body, 14, t.muted)
```

- [ ] **Step 2: Create kpi_board.py**

```python
# pptx-service/renderers/kpi_board.py
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

DELTA_COLORS = {"pos": "#22c55e", "neg": "#ef4444", "flat": "#888888"}

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    period = data.get("period", "")
    kpis = data.get("kpis", [])
    takeaway = data.get("takeaway", "")

    add_textbox(slide, 0.83, 0.3, 9.0, 0.8, heading,
                t.font_display, 40, t.text, bold=True)
    if period:
        add_textbox(slide, 10.0, 0.3, 3.0, 0.8, period,
                    t.font_body, 20, t.muted, align="right")

    kpis = kpis[:6]
    n = len(kpis)
    cols = 3 if n > 3 else n
    rows = (n + cols - 1) // cols
    cell_w = 12.0 / cols
    cell_h = (5.5 if not takeaway else 5.0) / rows

    for i, kpi in enumerate(kpis):
        col = i % cols
        row = i // cols
        x = 0.67 + col * cell_w
        y = 1.3 + row * cell_h

        # Card background
        add_rect(slide, x, y, cell_w - 0.2, cell_h - 0.1,
                 fill_hex=t.paper, line_hex=t.border, line_width_pt=0.5)

        label = kpi.get("label", "")
        value = kpi.get("value", "")
        delta = kpi.get("delta", "")
        tone = kpi.get("deltaTone", "flat")
        hint = kpi.get("hint", "")

        add_textbox(slide, x + 0.15, y + 0.12, cell_w - 0.5, 0.4,
                    label, t.font_body, 18, t.muted)
        add_textbox(slide, x + 0.15, y + 0.5, cell_w - 0.5, 1.0,
                    value, t.font_display, 44, t.text, bold=True)
        if delta:
            add_textbox(slide, x + 0.15, y + 1.5, cell_w - 0.5, 0.35,
                        delta, t.font_body, 18, DELTA_COLORS.get(tone, t.muted),
                        bold=True)
        if hint:
            add_textbox(slide, x + 0.15, y + 1.9, cell_w - 0.5, 0.4,
                        hint, t.font_body, 15, t.muted, italic=True)

    if takeaway:
        add_line(slide, 0.83, 6.8, 12.5, 6.8, t.border, 0.5)
        add_textbox(slide, 0.83, 6.9, 11.5, 0.45, takeaway,
                    t.font_body, 20, t.muted, italic=True)
```

- [ ] **Step 3: Create table.py**

```python
# pptx-service/renderers/table.py
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
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

    # Header row background
    add_rect(slide, table_x, table_top, table_w, header_h,
             fill_hex=t.accent)

    for j, col in enumerate(columns):
        cx = table_x + j * col_w
        add_textbox(slide, cx + 0.1, table_top + 0.1, col_w - 0.15, header_h - 0.1,
                    col.get("label", ""), t.font_body, 20, "#ffffff",
                    bold=True, align=col.get("align", "left"))

    for i, row in enumerate(rows[:6]):
        y = table_top + header_h + i * row_h
        is_emphasis = row.get("emphasis", False)
        row_fill = t.paper if i % 2 == 0 else t.bg
        if is_emphasis:
            row_fill = t.accent + "22"  # 13% opacity tint
        add_rect(slide, table_x, y, table_w, row_h,
                 fill_hex=row_fill, line_hex=t.border, line_width_pt=0.25)

        cells = row.get("cells", {})
        for j, col in enumerate(columns):
            cx = table_x + j * col_w
            is_hl = col.get("id") == highlight_col
            color = t.accent if is_hl else (t.text if not is_emphasis else t.accent)
            add_textbox(slide, cx + 0.1, y + 0.1, col_w - 0.15, row_h - 0.1,
                        cells.get(col.get("id", ""), ""),
                        t.font_body, 20, color,
                        bold=is_hl or is_emphasis,
                        align=col.get("align", "left"))

    if source:
        add_textbox(slide, 0.83, 7.1, 10.0, 0.35, f"Source: {source}",
                    t.font_body, 14, t.muted)
```

- [ ] **Step 4: Create matrix_2x2.py**

```python
# pptx-service/renderers/matrix_2x2.py
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    axes = data.get("axes", {})
    cells = data.get("cells", [{}, {}, {}, {}])
    takeaway = data.get("takeaway", "")

    add_textbox(slide, 0.83, 0.2, 11.0, 0.9, heading,
                t.font_display, 40, t.text, bold=True)

    # Grid bounds
    gx, gy, gw, gh = 1.2, 1.2, 11.0, 5.8

    # Axis labels
    x_axis = axes.get("x", {})
    y_axis = axes.get("y", {})
    add_textbox(slide, gx, gy + gh + 0.05, gw / 2, 0.35,
                x_axis.get("low", ""), t.font_body, 15, t.muted)
    add_textbox(slide, gx + gw / 2, gy + gh + 0.05, gw / 2, 0.35,
                x_axis.get("high", ""), t.font_body, 15, t.muted, align="right")
    add_textbox(slide, 0.1, gy + gh / 2, 0.9, 1.0,
                y_axis.get("low", ""), t.font_body, 14, t.muted)
    add_textbox(slide, 0.1, gy, 0.9, 1.0,
                y_axis.get("high", ""), t.font_body, 14, t.muted)

    # Crosshairs
    add_line(slide, gx, gy + gh / 2, gx + gw, gy + gh / 2, t.border, 1.0)
    add_line(slide, gx + gw / 2, gy, gx + gw / 2, gy + gh, t.border, 1.0)

    # Cells: TL=0, TR=1, BL=2, BR=3
    positions = [
        (gx, gy),
        (gx + gw / 2, gy),
        (gx, gy + gh / 2),
        (gx + gw / 2, gy + gh / 2),
    ]
    cell_w = gw / 2 - 0.15
    cell_h = gh / 2 - 0.15

    for i, (cx, cy) in enumerate(positions):
        cell = cells[i] if i < len(cells) else {}
        is_em = cell.get("emphasis", False)
        fill = t.accent + "1a" if is_em else None  # 10% tint
        add_rect(slide, cx + 0.1, cy + 0.1, cell_w, cell_h,
                 fill_hex=fill if fill else t.bg,
                 line_hex=None)
        add_textbox(slide, cx + 0.2, cy + 0.25, cell_w - 0.2, 0.7,
                    cell.get("label", ""), t.font_display, 22,
                    t.accent if is_em else t.text, bold=True, wrap=True)
        desc = cell.get("desc", "")
        if desc:
            add_textbox(slide, cx + 0.2, cy + 1.0, cell_w - 0.2, 1.5,
                        desc, t.font_body, 17, t.muted, wrap=True)

    if takeaway:
        add_textbox(slide, gx, 7.05, gw, 0.4, f"Takeaway: {takeaway}",
                    t.font_body, 18, t.muted, italic=True)
```

- [ ] **Step 5: Create roadmap.py**

```python
# pptx-service/renderers/roadmap.py
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    periods = data.get("periods", [])
    lanes = data.get("lanes", [])

    add_textbox(slide, 0.83, 0.2, 11.0, 0.9, heading,
                t.font_display, 40, t.text, bold=True)

    if not periods:
        return

    table_x = 1.8
    table_w = 11.0
    table_top = 1.2
    period_w = table_w / len(periods)
    lane_h = (6.2 - table_top) / max(len(lanes), 1) if lanes else 1.0

    # Period headers
    for j, period in enumerate(periods):
        px = table_x + j * period_w
        add_rect(slide, px, table_top, period_w - 0.05, 0.55,
                 fill_hex=t.paper, line_hex=t.border, line_width_pt=0.5)
        add_textbox(slide, px, table_top + 0.05, period_w - 0.05, 0.45,
                    period, t.font_body, 18, t.text, bold=True, align="center")

    period_index = {p: i for i, p in enumerate(periods)}

    # Lane rows
    for i, lane in enumerate(lanes):
        ly = table_top + 0.6 + i * lane_h
        # Lane name
        add_textbox(slide, 0.1, ly + lane_h / 2 - 0.3, 1.6, 0.6,
                    lane.get("name", ""), t.font_body, 16, t.muted,
                    align="right", bold=True)
        # Row bg
        add_rect(slide, table_x, ly, table_w, lane_h - 0.08,
                 fill_hex=t.paper if i % 2 == 0 else t.bg,
                 line_hex=t.border, line_width_pt=0.25)

        for milestone in lane.get("items", []):
            p = milestone.get("period", "")
            span = milestone.get("span", 1)
            label = milestone.get("label", "")
            is_em = milestone.get("emphasis", False)
            pi = period_index.get(p, 0)
            mx = table_x + pi * period_w + 0.05
            mw = period_w * span - 0.1
            bar_fill = t.accent if is_em else t.muted
            add_rect(slide, mx, ly + 0.1, mw, lane_h - 0.28,
                     fill_hex=bar_fill)
            add_textbox(slide, mx + 0.08, ly + 0.15, mw - 0.1, lane_h - 0.3,
                        label, t.font_body, 16, "#ffffff", bold=is_em, wrap=True)
```

- [ ] **Step 6: Smoke test group C**

```bash
cd pptx-service
python -c "
from models import Deck, BriefInput
from builder import build_pptx
slides = [
  {'type':'chart-bar','heading':'Revenue by Region','unit':'M USD','bars':[{'label':'APAC','value':42},{'label':'EMEA','value':31,'note':'YoY +12%'},{'label':'AMER','value':55}],'highlight':'AMER'},
  {'type':'kpi-board','heading':'Q3 Performance','period':'Jul–Sep 2025','kpis':[{'label':'ARR','value':'\$2.1M','delta':'+18%','deltaTone':'pos'},{'label':'Churn','value':'1.2%','delta':'-0.3pp','deltaTone':'pos'},{'label':'NPS','value':'72','delta':'+5','deltaTone':'pos'}]},
  {'type':'table','heading':'Pricing Comparison','columns':[{'id':'plan','label':'Plan'},{'id':'price','label':'Price'},{'id':'users','label':'Users'}],'rows':[{'cells':{'plan':'Starter','price':'\$29','users':'5'}},{'cells':{'plan':'Pro','price':'\$99','users':'20'},'emphasis':True},{'cells':{'plan':'Enterprise','price':'Custom','users':'∞'}}],'highlightColumn':'plan'},
  {'type':'matrix-2x2','heading':'Priority Matrix','axes':{'x':{'low':'Low Effort','high':'High Effort'},'y':{'low':'Low Impact','high':'High Impact'}},'cells':[{'label':'Quick Wins','emphasis':True},{'label':'Big Bets'},{'label':'Fill-ins'},{'label':'Time Sinks'}]},
  {'type':'roadmap','heading':'2025 Roadmap','periods':['Q1','Q2','Q3','Q4'],'lanes':[{'name':'Product','items':[{'period':'Q1','label':'Beta launch'},{'period':'Q2','label':'GA','span':2,'emphasis':True}]},{'name':'Sales','items':[{'period':'Q2','label':'Hire AEs'},{'period':'Q3','label':'Enterprise push','span':2}]}]},
]
d = Deck(title='Test C',theme='midnight-luxe',brief=BriefInput(topic='t',audience='a',goal='g',durationMin=5),framework='duarte',slides=slides)
data = build_pptx(d)
open('/tmp/test_group_c.pptx','wb').write(data)
print(f'OK: {len(data)} bytes, {len(slides)} slides')
"
```

Expected: `OK: <N> bytes, 5 slides`

- [ ] **Step 7: Commit**

```bash
git add pptx-service/renderers/
git commit -m "feat(pptx-service): chart-bar/kpi-board/table/matrix-2x2/roadmap renderers"
```

---

## Task 6: Layout renderers — Group D (case-study, causality, persona, quadrant, diagram)

**Files:** `case_study.py`, `causality.py`, `persona.py`, `quadrant.py`, `diagram.py`

- [ ] **Step 1: Create case_study.py**

```python
# pptx-service/renderers/case_study.py
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    client = data.get("client", "")
    client_meta = data.get("clientMeta", "")
    context = data.get("context", "")
    challenge = data.get("challenge", "")
    approach = data.get("approach", "")
    results = data.get("results", [])
    quote = data.get("quote", "")
    quote_attr = data.get("quoteAttribution", "")

    # Client badge
    add_rect(slide, 0.5, 0.3, 3.5, 0.8, fill_hex=t.accent)
    add_textbox(slide, 0.55, 0.35, 3.4, 0.7, client,
                t.font_display, 28, "#ffffff", bold=True)
    if client_meta:
        add_textbox(slide, 4.2, 0.3, 8.0, 0.8, client_meta,
                    t.font_body, 18, t.muted)

    add_line(slide, 0.5, 1.2, 12.8, 1.2, t.border, 0.5)

    # Left column: context + challenge + approach
    add_textbox(slide, 0.5, 1.35, 0.8, 0.4, "CONTEXT",
                t.font_body, 12, t.muted, bold=True)
    add_textbox(slide, 0.5, 1.75, 5.8, 1.1, context,
                t.font_body, 18, t.text, wrap=True)

    add_textbox(slide, 0.5, 2.95, 0.9, 0.4, "CHALLENGE",
                t.font_body, 12, t.muted, bold=True)
    add_textbox(slide, 0.5, 3.35, 5.8, 1.1, challenge,
                t.font_body, 18, t.text, wrap=True)

    add_textbox(slide, 0.5, 4.55, 0.9, 0.4, "APPROACH",
                t.font_body, 12, t.muted, bold=True)
    add_textbox(slide, 0.5, 4.95, 5.8, 1.1, approach,
                t.font_body, 18, t.text, wrap=True)

    # Vertical divider
    add_line(slide, 6.67, 1.2, 6.67, 7.2, t.border, 0.5)

    # Right column: results
    add_textbox(slide, 7.0, 1.35, 5.8, 0.4, "RESULTS",
                t.font_body, 12, t.muted, bold=True)
    y = 1.75
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

    # Quote at bottom
    if quote:
        add_line(slide, 7.0, 6.3, 12.8, 6.3, t.border, 0.3)
        add_textbox(slide, 7.0, 6.4, 5.8, 0.55,
                    f"“{quote}”", t.font_body, 16, t.muted,
                    italic=True, wrap=True)
        if quote_attr:
            add_textbox(slide, 7.0, 6.95, 5.8, 0.35,
                        f"— {quote_attr}", t.font_body, 14, t.muted)
```

- [ ] **Step 2: Create causality.py**

```python
# pptx-service/renderers/causality.py
from builder import add_bg, add_textbox, add_rect, add_line, add_eyebrow
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    chain = data.get("chain", [])
    conclusion = data.get("conclusion", "")
    eyebrow = data.get("eyebrow", "")

    if eyebrow:
        add_eyebrow(slide, eyebrow, t)
    add_textbox(slide, 0.83, 0.5, 11.0, 1.0, heading,
                t.font_display, 44, t.text, bold=True)

    chain = chain[:5]
    n = len(chain)
    if n == 0:
        return

    node_w = 12.5 / n
    mid_y = 3.8

    for i, link in enumerate(chain):
        x = 0.42 + i * node_w
        cause = link.get("cause", "")
        because = link.get("because", "")

        # Node box
        add_rect(slide, x, mid_y - 0.6, node_w - 0.25, 1.2,
                 fill_hex=t.paper, line_hex=t.accent if i == n - 1 else t.border,
                 line_width_pt=1.5 if i == n - 1 else 0.5)
        add_textbox(slide, x + 0.1, mid_y - 0.55, node_w - 0.45, 1.1,
                    cause, t.font_display, 22,
                    t.accent if i == n - 1 else t.text,
                    bold=True, align="center", wrap=True)

        # Arrow between nodes
        if i < n - 1:
            ax = x + node_w - 0.25
            add_line(slide, ax, mid_y, ax + 0.25, mid_y, t.accent, 2.0)

        # "Because" annotation
        if because:
            add_textbox(slide, x, mid_y + 0.7, node_w - 0.2, 0.9,
                        because, t.font_body, 17, t.muted,
                        align="center", wrap=True)

    if conclusion:
        add_line(slide, 0.83, 6.5, 12.5, 6.5, t.border, 0.5)
        add_textbox(slide, 0.83, 6.6, 11.5, 0.55,
                    f"→ {conclusion}", t.font_body, 22, t.text,
                    bold=True)
```

- [ ] **Step 3: Create persona.py**

```python
# pptx-service/renderers/persona.py
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    name = data.get("name", "")
    role = data.get("role", "")
    attributes = data.get("attributes", [])
    quote = data.get("quote", "")
    needs = data.get("needs", [])
    pains = data.get("pains", [])

    # Avatar circle (first letter)
    initials = name[0].upper() if name else "?"
    add_rect(slide, 0.5, 0.5, 2.0, 2.0, fill_hex=t.accent)
    add_textbox(slide, 0.5, 0.9, 2.0, 1.2, initials,
                t.font_display, 80, "#ffffff", bold=True, align="center")

    # Name + role
    add_textbox(slide, 2.8, 0.6, 9.5, 0.9, name,
                t.font_display, 48, t.text, bold=True)
    add_textbox(slide, 2.8, 1.5, 9.5, 0.5, role,
                t.font_body, 24, t.muted)

    add_line(slide, 0.5, 2.7, 12.8, 2.7, t.border, 0.5)

    # Attributes
    y = 2.9
    for attr in (attributes or [])[:4]:
        add_textbox(slide, 0.5, y, 2.5, 0.45,
                    attr.get("label", "") + ":", t.font_body, 17, t.muted, bold=True)
        add_textbox(slide, 3.0, y, 9.8, 0.45,
                    attr.get("value", ""), t.font_body, 17, t.text)
        y += 0.5

    # Needs & Pains columns
    if needs or pains:
        add_line(slide, 6.67, 4.8, 6.67, 7.3, t.border, 0.5)

        add_textbox(slide, 0.5, 4.8, 5.8, 0.5, "NEEDS",
                    t.font_body, 14, t.muted, bold=True)
        ny = 5.3
        for n_item in (needs or [])[:3]:
            add_textbox(slide, 0.5, ny, 5.8, 0.5,
                        f"+ {n_item}", t.font_body, 18, t.text, wrap=True)
            ny += 0.5

        add_textbox(slide, 7.0, 4.8, 5.8, 0.5, "PAIN POINTS",
                    t.font_body, 14, t.muted, bold=True)
        py2 = 5.3
        for p_item in (pains or [])[:3]:
            add_textbox(slide, 7.0, py2, 5.8, 0.5,
                        f"- {p_item}", t.font_body, 18, t.text, wrap=True)
            py2 += 0.5

    # Quote
    if quote:
        add_line(slide, 0.5, 6.8, 12.8, 6.8, t.border, 0.3)
        add_textbox(slide, 0.5, 6.9, 12.0, 0.55,
                    f"“{quote}”", t.font_body, 18, t.muted, italic=True)
```

- [ ] **Step 4: Create quadrant.py**

```python
# pptx-service/renderers/quadrant.py
from builder import add_bg, add_textbox, add_rect, add_line
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    axes = data.get("axes", {})
    points = data.get("points", [])
    highlight = data.get("highlight", "")
    source = data.get("source", "")

    add_textbox(slide, 0.83, 0.2, 11.0, 0.9, heading,
                t.font_display, 40, t.text, bold=True)

    # Plot area
    px, py, pw, ph = 1.5, 1.2, 10.5, 5.7
    # Axes
    add_line(slide, px, py + ph / 2, px + pw, py + ph / 2, t.border, 1.0)
    add_line(slide, px + pw / 2, py, px + pw / 2, py + ph, t.border, 1.0)

    x_axis = axes.get("x", {})
    y_axis = axes.get("y", {})
    add_textbox(slide, px, py + ph + 0.05, pw / 2, 0.4,
                x_axis.get("low", ""), t.font_body, 14, t.muted)
    add_textbox(slide, px + pw / 2, py + ph + 0.05, pw / 2, 0.4,
                x_axis.get("high", ""), t.font_body, 14, t.muted, align="right")
    add_textbox(slide, 0.1, py, 1.2, 0.5,
                y_axis.get("high", ""), t.font_body, 14, t.muted)
    add_textbox(slide, 0.1, py + ph - 0.4, 1.2, 0.5,
                y_axis.get("low", ""), t.font_body, 14, t.muted)

    # Plot points on 5×5 grid
    cell_w = pw / 5
    cell_h = ph / 5

    for pt in points:
        gx = pt.get("gridX", 2)
        gy = pt.get("gridY", 2)
        label = pt.get("label", "")
        pid = pt.get("id", "")
        is_hl = pid == highlight

        # Map grid (0-4) to canvas coords; Y inverted (0=top in grid, so flip)
        cx = px + gx * cell_w + cell_w / 2
        cy = py + (4 - gy) * cell_h + cell_h / 2

        dot_size = 0.18 if is_hl else 0.13
        add_rect(slide, cx - dot_size / 2, cy - dot_size / 2,
                 dot_size, dot_size,
                 fill_hex=t.accent if is_hl else t.muted)
        add_textbox(slide, cx - 0.6, cy + dot_size / 2 + 0.02, 1.2, 0.35,
                    label, t.font_body, 13,
                    t.accent if is_hl else t.text,
                    bold=is_hl, align="center")

    if source:
        add_textbox(slide, px, 7.1, pw, 0.35, f"Source: {source}",
                    t.font_body, 14, t.muted)
```

- [ ] **Step 5: Create diagram.py**

```python
# pptx-service/renderers/diagram.py
from builder import add_bg, add_textbox, add_rect
from theme import ThemeColors

def render(slide, data: dict, t: ThemeColors):
    """Diagram is a placeholder layout — renders heading + hint text."""
    add_bg(slide, t.bg)
    heading = data.get("heading", "")
    hint = data.get("hint", "")

    add_textbox(slide, 0.83, 0.7, 11.0, 1.2, heading,
                t.font_display, 48, t.text, bold=True)

    # Dashed placeholder box
    add_rect(slide, 1.5, 2.2, 10.3, 4.5,
             fill_hex=None, line_hex=t.border, line_width_pt=1.0)
    add_textbox(slide, 1.5, 4.0, 10.3, 1.2, f"[Diagram: {hint}]",
                t.font_body, 28, t.muted, align="center", italic=True)
```

- [ ] **Step 6: Final smoke test — all 21 layouts**

```bash
cd pptx-service
python -c "
from models import Deck, BriefInput
from builder import build_pptx

slides = [
  {'type':'cover','title':'Full Deck Test','subtitle':'All 21 layouts'},
  {'type':'statement','title':'One sentence that changes everything.'},
  {'type':'argument','heading':'Three Reasons','points':['Speed','Cost','Quality']},
  {'type':'quote','quote':'Done is better than perfect.','source':'Mark Zuckerberg'},
  {'type':'cta','newAction':'Book your demo today'},
  {'type':'question','question':'What would you build with unlimited compute?'},
  {'type':'data','heading':'By the Numbers','stats':[{'value':'10x','label':'Faster'},{'value':'50%','label':'Cheaper'}]},
  {'type':'compare','heading':'Old vs New','left':{'title':'Before','items':['Slow','Expensive']},'right':{'title':'After','items':['Fast','Affordable']}},
  {'type':'checklist','heading':'Pre-Launch','items':['Tests passing','Docs ready','Team briefed']},
  {'type':'process','heading':'3-Step Process','steps':[{'title':'Discover'},{'title':'Build'},{'title':'Launch'}]},
  {'type':'timeline','heading':'Journey','events':[{'time':'2023','title':'Founded'},{'time':'2024','title':'Beta'},{'time':'2025','title':'GA'}]},
  {'type':'chart-bar','heading':'Revenue','unit':'K','bars':[{'label':'Q1','value':120},{'label':'Q2','value':180},{'label':'Q3','value':240,'note':'Record'}],'highlight':'Q3'},
  {'type':'kpi-board','heading':'Dashboard','period':'2025','kpis':[{'label':'MRR','value':'\$85K','delta':'+22%','deltaTone':'pos'},{'label':'Users','value':'4,200','delta':'+15%','deltaTone':'pos'}]},
  {'type':'table','heading':'Plans','columns':[{'id':'n','label':'Name'},{'id':'p','label':'Price'}],'rows':[{'cells':{'n':'Starter','p':'\$29'}},{'cells':{'n':'Pro','p':'\$99'},'emphasis':True}]},
  {'type':'roadmap','heading':'Roadmap','periods':['Q1','Q2','Q3'],'lanes':[{'name':'Dev','items':[{'period':'Q1','label':'v1'},{'period':'Q2','label':'v2','emphasis':True}]}]},
  {'type':'matrix-2x2','heading':'Priorities','axes':{'x':{'low':'Easy','high':'Hard'},'y':{'low':'Low','high':'High'}},'cells':[{'label':'Do First','emphasis':True},{'label':'Plan'},{'label':'Delegate'},{'label':'Avoid'}]},
  {'type':'case-study','client':'Acme Corp','context':'Legacy system','challenge':'Slow pipelines','approach':'Re-architected','results':[{'metric':'Deploy time','value':'10min','delta':'was 4hrs'}]},
  {'type':'causality','heading':'Root Cause','chain':[{'cause':'Poor data'},{'cause':'Bad model','because':'Garbage in'},{'cause':'Wrong decisions'}]},
  {'type':'persona','name':'Sarah Chen','role':'Product Manager','needs':['Fast insights'],'pains':['Too many dashboards'],'quote':'I need one source of truth.'},
  {'type':'quadrant','heading':'Market Map','axes':{'x':{'label':'Price','low':'Low','high':'High'},'y':{'label':'Quality','low':'Low','high':'High'}},'points':[{'id':'us','label':'Us','gridX':3,'gridY':4},{'id':'comp','label':'Competitor','gridX':4,'gridY':2}],'highlight':'us'},
  {'type':'diagram','heading':'System Architecture','hint':'Draw your diagram in PowerPoint'},
]

d = Deck(title='Full Test',theme='modern-minimal',brief=BriefInput(topic='t',audience='a',goal='g',durationMin=10),framework='duarte',slides=slides)
data = build_pptx(d)
open('/tmp/test_all_layouts.pptx','wb').write(data)
print(f'OK: {len(data)} bytes, {len(slides)} slides')
"
```

Expected: `OK: <N> bytes, 21 slides`

- [ ] **Step 7: Commit**

```bash
git add pptx-service/renderers/
git commit -m "feat(pptx-service): case-study/causality/persona/quadrant/diagram renderers — all 21 layouts complete"
```

---

## Task 7: FastAPI server + Docker

**Files:**
- Create: `pptx-service/Dockerfile`
- Create: `pptx-service/.env.example`

- [ ] **Step 1: Start the service and verify /health**

```bash
cd pptx-service
python main.py &
sleep 2
curl http://localhost:5051/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 2: Test /generate via curl**

```bash
curl -s -X POST http://localhost:5051/generate \
  -H "Content-Type: application/json" \
  -d '{"deck":{"title":"Hello","theme":"modern-minimal","brief":{"topic":"t","audience":"a","goal":"g","durationMin":5},"framework":"duarte","slides":[{"type":"cover","title":"Hello World"}]}}' \
  -o /tmp/curl_test.pptx
ls -la /tmp/curl_test.pptx
```

Expected: file exists, size > 5000 bytes

- [ ] **Step 3: Create .env.example**

```bash
# pptx-service/.env.example
PORT=5051
```

- [ ] **Step 4: Create Dockerfile**

```dockerfile
# pptx-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5051
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5051"]
```

- [ ] **Step 5: Commit**

```bash
git add pptx-service/Dockerfile pptx-service/.env.example
git commit -m "feat(pptx-service): Dockerfile + env config"
```

---

## Task 8: Next.js integration

**Files:**
- Create: `app/api/export-pptx/route.ts`
- Modify: `lib/export-pdf-pptx.ts`
- Modify: `package.json`

- [ ] **Step 1: Create Next.js proxy route**

```typescript
// app/api/export-pptx/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PPTX_SERVICE_URL = process.env.PPTX_SERVICE_URL ?? 'http://localhost:5051';

export async function POST(req: NextRequest) {
  const body = await req.json();

  let res: Response;
  try {
    res = await fetch(`${PPTX_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'PPTX service unavailable. Start pptx-service/main.py on port 5051.' },
      { status: 503 }
    );
  }

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const pptxBuffer = await res.arrayBuffer();
  const contentDisposition = res.headers.get('content-disposition') ?? 'attachment; filename="deck.pptx"';

  return new NextResponse(pptxBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': contentDisposition,
    },
  });
}
```

- [ ] **Step 2: Add exportPPTXNative to lib/export-pdf-pptx.ts**

Add after line 87 (after `exportPPTX` function), before the closing utilities:

```typescript
// ─── Native editable PPTX (via Python pptx-service) ──────────────────────────
export async function exportPPTXNative(deck: Deck, filename: string): Promise<void> {
  const res = await fetch('/api/export-pptx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'PPTX export failed');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.pptx`;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 3: Update package.json scripts**

Replace the `"scripts"` block:

```json
"scripts": {
  "dev": "next dev",
  "dev:pptx": "cd pptx-service && python main.py",
  "dev:all": "concurrently -n next,pptx -c cyan,yellow \"pnpm dev\" \"pnpm dev:pptx\"",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 4: Install concurrently**

```bash
pnpm add -D concurrently
```

- [ ] **Step 5: Add PPTX_SERVICE_URL to .env.example**

Append to `.env.example`:

```bash
# URL of the Python pptx-service (default: http://localhost:5051)
# In production, set to your deployed service URL
PPTX_SERVICE_URL=http://localhost:5051
```

- [ ] **Step 6: Verify TypeScript builds cleanly**

```bash
pnpm typecheck
```

Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add app/api/export-pptx/route.ts lib/export-pdf-pptx.ts package.json .env.example pnpm-lock.yaml
git commit -m "feat: Next.js proxy route + exportPPTXNative + dev:all script"
```

---

## Task 9: Wire up the UI export button

**Files:**
- Modify: `app/deck/page.tsx` (find the existing PPTX export button and add native option)

- [ ] **Step 1: Read the current deck page export button**

Read `app/deck/page.tsx` and locate the `exportPPTX` call site.

- [ ] **Step 2: Add native export button alongside existing button**

Find the existing export button that calls `exportPPTX(...)`. Add a second button next to it:

```tsx
import { exportPPTXNative } from '@/lib/export-pdf-pptx';

// Add state for native export loading
const [exportingNative, setExportingNative] = useState(false);
const [nativeError, setNativeError] = useState<string | null>(null);

async function handleExportNative() {
  if (!deck) return;
  setExportingNative(true);
  setNativeError(null);
  try {
    await exportPPTXNative(deck, deck.title || 'deck');
  } catch (err) {
    setNativeError(err instanceof Error ? err.message : 'Export failed');
  } finally {
    setExportingNative(false);
  }
}

// Button JSX (place next to existing PPTX button):
<button
  onClick={handleExportNative}
  disabled={exportingNative}
  className="..."  // match existing button style
>
  {exportingNative ? '生成中…' : '下载可编辑 PPTX ✦'}
</button>
{nativeError && (
  <p className="text-red-500 text-sm mt-1">{nativeError}</p>
)}
```

- [ ] **Step 3: Run dev:all and test end-to-end**

```bash
pnpm dev:all
```

1. Open http://localhost:3000
2. Generate a deck (any topic)
3. Click "下载可编辑 PPTX ✦"
4. Open the downloaded .pptx in PowerPoint/WPS
5. Verify: click on any text box → it is editable

- [ ] **Step 4: Commit**

```bash
git add app/deck/page.tsx
git commit -m "feat(ui): add native editable PPTX export button"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Python service scaffold (Task 1)
- ✅ Theme mapping (Task 2)
- ✅ All 21 layout renderers (Tasks 3–6)
- ✅ FastAPI server + Docker (Task 7)
- ✅ Next.js proxy route (Task 8)
- ✅ UI button (Task 9)
- ✅ Local dev with concurrently (Task 8, Step 3)
- ✅ Production via `PPTX_SERVICE_URL` env var (Task 8, Step 1)

**Placeholder scan:** No TBD or TODO in code steps. All functions defined before use. Types consistent across tasks.

**Type consistency:**
- `build_pptx(deck: Deck)` defined in Task 2, called in Tasks 3–6 smoke tests ✅
- `add_bg`, `add_textbox`, `add_rect`, `add_line`, `add_eyebrow` defined in Task 2 `builder.py`, used in all renderers ✅
- `exportPPTXNative` defined in Task 8, imported in Task 9 ✅
- `RENDERERS` dict in `__init__.py` (Task 2) maps all 21 types; all renderers added by Task 6 ✅
