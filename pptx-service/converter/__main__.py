"""CLI: `python -m converter <deck.json> [out.json]` → writes PPTist JSON.

Run from `pptx-service/` directory. Always writes UTF-8 (Windows-safe).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from . import deck_to_pptist


def main(argv: list[str] | None = None) -> int:
    argv = argv or sys.argv[1:]
    if not argv:
        sys.stderr.write("Usage: python -m converter <deck.json> [out.json]\n")
        return 1
    src = Path(argv[0])
    if not src.exists():
        sys.stderr.write(f"File not found: {src}\n")
        return 1
    deck = json.loads(src.read_text(encoding="utf-8"))
    out = deck_to_pptist(deck)
    text = json.dumps(out, ensure_ascii=False, indent=2)
    if len(argv) >= 2:
        Path(argv[1]).write_text(text, encoding="utf-8")
        sys.stderr.write(f"wrote {len(text):,} bytes to {argv[1]}\n")
    else:
        # write raw bytes to stdout buffer to bypass console codec
        sys.stdout.buffer.write(text.encode("utf-8"))
        sys.stdout.buffer.write(b"\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
