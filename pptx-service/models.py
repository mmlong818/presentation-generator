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
    x: dict[str, str]
    y: dict[str, str]


class Matrix2x2Slide(SlideBase):
    type: Literal["matrix-2x2"]
    heading: str
    axes: MatrixAxes
    cells: list[MatrixCell]
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
    x: dict[str, str]
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


class Deck(BaseModel):
    title: str
    theme: str
    brief: BriefInput
    framework: str
    slides: list[dict[str, Any]]
    script: list[ScriptEntry] = []
    brand: Optional[BrandOverride] = None


class GenerateRequest(BaseModel):
    deck: Deck
