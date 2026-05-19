from dataclasses import dataclass


@dataclass(frozen=True)
class ThemeColors:
    bg: str
    paper: str
    text: str
    muted: str
    accent: str
    border: str
    font_display: str
    font_body: str
    mode: str
    # ─── Type scale tokens (1920×1080 source px). Layouts derive sizes from these
    # so every theme's hierarchy follows its own intent rather than one default.
    # `hero` is the giant title (cover title, statement, big stat number).
    # `section` is the page heading (argument, data, compare).
    # `body` is normal text (bullets, captions of medium importance).
    # `caption` is the smallest semantic text (eyebrow, source, hint).
    hero: float = 132
    section: float = 72
    body: float = 34
    caption: float = 22
    # `padding` is the safe-area inset used on most non-cover layouts (left/right).
    padding: float = 140


def _first_font(css_stack: str) -> str:
    first = css_stack.split(",")[0].strip().strip('"').strip("'")
    mappings = {
        "Source Han Serif SC": "SimSun",
        "Noto Serif SC": "SimSun",
        "Noto Sans SC": "Microsoft YaHei",
        "Source Serif 4": "Georgia",
        "Tiempos Headline": "Georgia",
        "Tiempos Text": "Georgia",
        "Playfair Display": "Georgia",
        "PingFang SC": "Microsoft YaHei",
        "Helvetica Neue": "Arial",
        "Inter": "Arial",
        "IBM Plex Mono": "Courier New",
        "JetBrains Mono": "Courier New",
        "Space Mono": "Courier New",
        "Space Grotesk": "Arial",
        "Archivo Black": "Arial Black",
        "Outfit": "Arial Black",
        "DM Sans": "Arial",
        "Plus Jakarta Sans": "Arial",
        "Syne": "Arial",
        "Bebas Neue": "Arial Black",
    }
    return mappings.get(first, first)


THEMES: dict[str, ThemeColors] = {
    "editorial-monocle": ThemeColors(
        bg="#faf8f3", paper="#ffffff", text="#0f0f0e", muted="#5e5b54",
        accent="#8a1c1c", border="#0f0f0e",
        font_display="Georgia", font_body="Georgia", mode="light",
        hero=140,
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
        hero=200, section=100, body=36, caption=24, padding=100,
    ),
    "academic-paper": ThemeColors(
        bg="#fdfcf7", paper="#ffffff", text="#1a1a1a", muted="#666666",
        accent="#1a3a5c", border="#cccccc",
        font_display="Georgia", font_body="Georgia", mode="light",
        hero=116, section=60, body=32, caption=22, padding=160,
    ),
    "midnight-luxe": ThemeColors(
        bg="#0a0a0f", paper="#13131f", text="#f0f0ff", muted="#8888aa",
        accent="#c9a84c", border="#2a2a4a",
        font_display="Georgia", font_body="Arial", mode="dark",
        hero=156, section=72, padding=160,
    ),
    "risograph": ThemeColors(
        bg="#f5f0e8", paper="#fffef5", text="#1a1a1a", muted="#666644",
        accent="#e84040", border="#cccc88",
        font_display="Arial Black", font_body="Arial", mode="light",
        hero=156, section=84,
    ),
    "broadcast-hud": ThemeColors(
        bg="#040810", paper="#0a1020", text="#00ff88", muted="#00aa55",
        accent="#ff4400", border="#003322",
        font_display="Courier New", font_body="Courier New", mode="dark",
        hero=156, section=76, padding=160,
    ),
    "pastel-bauhaus": ThemeColors(
        bg="#f9f7f4", paper="#ffffff", text="#1a1a1a", muted="#888888",
        accent="#e85d26", border="#e0dcd5",
        font_display="Arial", font_body="Arial", mode="light",
        hero=156, section=80,
    ),
    "summer-cocktail": ThemeColors(
        bg="#fff8ee", paper="#ffffff", text="#1a1a1a", muted="#888866",
        accent="#ff6b35", border="#ffe0b2",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "pop-magazine": ThemeColors(
        bg="#f0e8d4", paper="#ffffff", text="#1a1a1a", muted="#5a5550",
        accent="#ff3a5a", border="#1a1a1a",
        font_display="Arial Black", font_body="Arial", mode="light",
        hero=220, section=96, body=36, caption=24, padding=160,
    ),

    "blueprint": ThemeColors(
        bg="#0b3a6f", paper="#0a3260", text="#e8f3ff", muted="#7da8cf",
        accent="#ffffff", border="#3a6090",
        font_display="Courier New", font_body="Courier New", mode="dark",
        hero=120, section=60, body=30, caption=20,
    ),
    "cyberpunk-neon": ThemeColors(
        bg="#000000", paper="#0f0f1a", text="#f5f7ff", muted="#6b6e8a",
        accent="#ff2bd6", border="#1a0a20",
        font_display="Courier New", font_body="Arial", mode="dark",
        hero=144,
    ),
    "glassmorphism": ThemeColors(
        bg="#0b1024", paper="#0e1530", text="#f2f4ff", muted="#8287a8",
        accent="#7dd3fc", border="#1a2040",
        font_display="Arial", font_body="Arial", mode="dark",
        hero=144,
    ),
    "memphis-pop": ThemeColors(
        bg="#fef6e8", paper="#ffffff", text="#111111", muted="#666666",
        accent="#ff3d8b", border="#111111",
        font_display="Arial Black", font_body="Arial", mode="light",
        hero=156, section=80,
    ),
    "midcentury": ThemeColors(
        bg="#f3ead8", paper="#f9f2e0", text="#201810", muted="#9a8868",
        accent="#d4902a", border="#8c7050",
        font_display="Georgia", font_body="Arial", mode="light",
    ),
    "minimal-white": ThemeColors(
        bg="#ffffff", paper="#fafafa", text="#0c0d10", muted="#9ca1b0",
        accent="#111216", border="#e0e0e2",
        font_display="Arial", font_body="Arial", mode="light",
        hero=132, section=64, body=36, padding=160,
    ),
    "pitch-deck-vc": ThemeColors(
        bg="#ffffff", paper="#fafbfc", text="#0b0d12", muted="#8b93a8",
        accent="#0070f3", border="#e0e4eb",
        font_display="Arial", font_body="Arial", mode="light",
        hero=144, body=36,
    ),
    "retro-tv": ThemeColors(
        bg="#f5ecd7", paper="#fbf5e2", text="#2a1a08", muted="#a68656",
        accent="#e67e14", border="#c09060",
        font_display="Georgia", font_body="Arial", mode="light",
    ),
    "swiss-grid": ThemeColors(
        bg="#ffffff", paper="#f4f4f4", text="#111111", muted="#888888",
        accent="#d6001c", border="#111111",
        font_display="Arial", font_body="Arial", mode="light",
        hero=144,
    ),
    "tokyo-night": ThemeColors(
        bg="#1a1b26", paper="#24283b", text="#c0caf5", muted="#565f89",
        accent="#7aa2f7", border="#2f334d",
        font_display="Arial", font_body="Arial", mode="dark",
    ),
    "vaporwave": ThemeColors(
        bg="#1a0938", paper="#261050", text="#fdf0ff", muted="#8a6ba8",
        accent="#ff6ec7", border="#2a1050",
        font_display="Arial", font_body="Arial", mode="dark",
        hero=144,
    ),
    "xiaohongshu": ThemeColors(
        bg="#fffdfb", paper="#ffffff", text="#1a1210", muted="#a08d85",
        accent="#ff2742", border="#e8d8d0",
        font_display=_first_font('"Noto Serif SC","Playfair Display",serif'),
        font_body="Microsoft YaHei", mode="light",
    ),
    "y2k-chrome": ThemeColors(
        bg="#dfe4ec", paper="#eef1f6", text="#1a1f2e", muted="#8590a6",
        accent="#8a5cff", border="#a0aabf",
        font_display="Arial", font_body="Arial", mode="light",
    ),

    "swiss-ikb": ThemeColors(
        bg="#fafaf8", paper="#ffffff", text="#0a0a0a", muted="#737373",
        accent="#002FA7", border="#d4d4d2",
        font_display="Arial", font_body="Arial", mode="light",
        hero=144,
    ),


    "open-sticker-pop": ThemeColors(
        bg="#fff2e8", paper="#ffe6d3", text="#2d1b4e", muted="#9a8aa8",
        accent="#ff4d8d", border="#2d1b4e",
        font_display="Arial Black", font_body="Arial", mode="light",
        hero=156, section=80, padding=120,
    ),
}


def get_theme(theme_id: str) -> ThemeColors:
    return THEMES.get(theme_id, THEMES["modern-minimal"])
