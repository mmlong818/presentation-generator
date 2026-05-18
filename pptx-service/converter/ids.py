"""nanoid-like short IDs for PPTist elements."""
from __future__ import annotations

import secrets
import string

_ALPHABET = string.ascii_letters + string.digits


def nano(size: int = 10) -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(size))
