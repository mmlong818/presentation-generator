"""PPTist slide / element shapes (subset used by converter).

Mirrors src/types/slides.ts in github.com/pipipi-pikachu/PPTist.
Only the fields we actually emit are typed; unused optional fields are omitted.
"""
from __future__ import annotations

from typing import Any, Literal, TypedDict


class PPTTextElement(TypedDict, total=False):
    id: str
    type: Literal["text"]
    left: float
    top: float
    width: float
    height: float
    rotate: float
    content: str  # HTML produced by prosemirror schema
    defaultFontName: str
    defaultColor: str
    lineHeight: float
    fill: str
    opacity: float


class PPTShapeElement(TypedDict, total=False):
    id: str
    type: Literal["shape"]
    left: float
    top: float
    width: float
    height: float
    rotate: float
    viewBox: list[float]  # [w, h]
    path: str  # SVG path
    fixedRatio: bool
    fill: str
    opacity: float


class PPTLineElement(TypedDict, total=False):
    id: str
    type: Literal["line"]
    left: float
    top: float
    width: float
    rotate: float
    start: list[float]  # [x, y]
    end: list[float]
    style: Literal["solid", "dashed"]
    color: str
    points: list[str]  # [startStyle, endStyle], e.g. ["", "arrow"]


PPTElement = dict[str, Any]  # Union type; we use plain dict at runtime


class SlideBackgroundSolid(TypedDict):
    type: Literal["solid"]
    color: str


class Slide(TypedDict, total=False):
    id: str
    elements: list[PPTElement]
    background: SlideBackgroundSolid
    remark: str


class Theme(TypedDict, total=False):
    themeColors: list[str]
    fontColor: str
    fontName: str
    backgroundColor: str


class Presentation(TypedDict):
    title: str
    width: int
    height: float
    theme: Theme
    slides: list[Slide]
