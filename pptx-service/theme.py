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
    "minimal-rainbow": ThemeColors(
        bg="#ffffff", paper="#f8f8f8", text="#111111", muted="#666666",
        accent="#4444ff", border="#eeeeee",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "pop-magazine": ThemeColors(
        bg="#f0e8d4", paper="#ffffff", text="#1a1a1a", muted="#5a5550",
        accent="#ff3a5a", border="#1a1a1a",
        font_display="Arial Black", font_body="Arial", mode="light",
        hero=220, section=96, body=36, caption=24, padding=160,
    ),

    # ── html-ppt-skill ────────────────────────────────────────────────────────
    "arctic-cool": ThemeColors(
        bg="#f2f6fb", paper="#ffffff", text="#0e1f33", muted="#6b819b",
        accent="#1e6fb0", border="#ccd8ea",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "aurora-borealis": ThemeColors(
        bg="#06091c", paper="#0a1130", text="#e8f0ff", muted="#6a7a9e",
        accent="#5ef2c6", border="#1a2040",
        font_display="Arial", font_body="Arial", mode="dark",
    ),
    "blueprint": ThemeColors(
        bg="#0b3a6f", paper="#0a3260", text="#e8f3ff", muted="#7da8cf",
        accent="#ffffff", border="#3a6090",
        font_display="Courier New", font_body="Courier New", mode="dark",
        hero=120, section=60, body=30, caption=20,
    ),
    "catppuccin-latte": ThemeColors(
        bg="#eff1f5", paper="#ffffff", text="#4c4f69", muted="#9ca0b0",
        accent="#8839ef", border="#c5c8d1",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "catppuccin-mocha": ThemeColors(
        bg="#1e1e2e", paper="#313244", text="#cdd6f4", muted="#7f849c",
        accent="#cba6f7", border="#45475a",
        font_display="Arial", font_body="Arial", mode="dark",
    ),
    "corporate-clean": ThemeColors(
        bg="#ffffff", paper="#f5f7fa", text="#0a2540", muted="#8898aa",
        accent="#1d4ed8", border="#dde3ea",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "cyberpunk-neon": ThemeColors(
        bg="#000000", paper="#0f0f1a", text="#f5f7ff", muted="#6b6e8a",
        accent="#ff2bd6", border="#1a0a20",
        font_display="Courier New", font_body="Arial", mode="dark",
        hero=144,
    ),
    "dracula": ThemeColors(
        bg="#282a36", paper="#343746", text="#f8f8f2", muted="#6272a4",
        accent="#bd93f9", border="#44475a",
        font_display="Arial", font_body="Arial", mode="dark",
    ),
    "engineering-whiteprint": ThemeColors(
        bg="#ffffff", paper="#f8fafc", text="#0a1e46", muted="#8090a8",
        accent="#1e5ac4", border="#0a1e46",
        font_display="Courier New", font_body="Arial", mode="light",
    ),
    "glassmorphism": ThemeColors(
        bg="#0b1024", paper="#0e1530", text="#f2f4ff", muted="#8287a8",
        accent="#7dd3fc", border="#1a2040",
        font_display="Arial", font_body="Arial", mode="dark",
        hero=144,
    ),
    "gruvbox-dark": ThemeColors(
        bg="#282828", paper="#3c3836", text="#ebdbb2", muted="#928374",
        accent="#fabd2f", border="#504945",
        font_display="Arial", font_body="Arial", mode="dark",
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
    "nord": ThemeColors(
        bg="#2e3440", paper="#3b4252", text="#eceff4", muted="#7b8394",
        accent="#88c0d0", border="#434c5e",
        font_display="Arial", font_body="Arial", mode="dark",
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
    "rose-pine": ThemeColors(
        bg="#191724", paper="#26233a", text="#e0def4", muted="#6e6a86",
        accent="#ebbcba", border="#2a2740",
        font_display="Arial", font_body="Arial", mode="dark",
    ),
    "sharp-mono": ThemeColors(
        bg="#ffffff", paper="#ffffff", text="#000000", muted="#4a4a4a",
        accent="#000000", border="#000000",
        font_display="Arial Black", font_body="Arial Black", mode="light",
    ),
    "soft-pastel": ThemeColors(
        bg="#fdf7fb", paper="#ffffff", text="#3a1f33", muted="#a28a99",
        accent="#f49bb8", border="#d8c0d0",
        font_display="Arial", font_body="Arial", mode="light",
    ),
    "solarized-light": ThemeColors(
        bg="#fdf6e3", paper="#ffffff", text="#073642", muted="#93a1a1",
        accent="#268bd2", border="#c0c8c0",
        font_display="Arial", font_body="Arial", mode="light",
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

    # ── guizang-ppt-skill (电子杂志 × 电子墨水) ───────────────────────────────
    "guizang-dune": ThemeColors(
        bg="#f0e6d2", paper="#f8f0e0", text="#1f1a14", muted="#706050",
        accent="#1f1a14", border="#c8baa8",
        font_display="Georgia", font_body="Georgia", mode="light",
    ),
    "swiss-ikb": ThemeColors(
        bg="#fafaf8", paper="#ffffff", text="#0a0a0a", muted="#737373",
        accent="#002FA7", border="#d4d4d2",
        font_display="Arial", font_body="Arial", mode="light",
        hero=144,
    ),
    "swiss-lemon": ThemeColors(
        bg="#fafaf8", paper="#ffffff", text="#0a0a0a", muted="#737373",
        accent="#FFD500", border="#d4d4d2",
        font_display="Arial", font_body="Arial", mode="light",
        hero=144,
    ),
    "swiss-neon-green": ThemeColors(
        bg="#fafaf8", paper="#ffffff", text="#0a0a0a", muted="#737373",
        accent="#C5E803", border="#d4d4d2",
        font_display="Arial", font_body="Arial", mode="light",
        hero=144,
    ),
    "swiss-orange": ThemeColors(
        bg="#fafaf8", paper="#ffffff", text="#0a0a0a", muted="#737373",
        accent="#FF6B35", border="#d4d4d2",
        font_display="Arial", font_body="Arial", mode="light",
        hero=144,
    ),

    "guizang-slate": ThemeColors(
        bg="#f0f2f4", paper="#e4e8ec", text="#1c2330", muted="#6b7a8d",
        accent="#4a6fa5", border="#c8d0da",
        font_display="Georgia", font_body="Arial", mode="light",
    ),
    "guizang-amber": ThemeColors(
        bg="#1c1608", paper="#2a2010", text="#f5ead0", muted="#a09060",
        accent="#f4a100", border="#3d3010",
        font_display="Georgia", font_body="Arial", mode="dark",
    ),
    "guizang-teal": ThemeColors(
        bg="#f0f6f5", paper="#e0eeec", text="#0d2b28", muted="#5a8a85",
        accent="#00897b", border="#b8d8d5",
        font_display="Georgia", font_body="Arial", mode="light",
    ),

    # ── open-slide ────────────────────────────────────────────────────────────
    "open-aurora": ThemeColors(
        bg="#0E0E0E", paper="#161616", text="#F5F5F5", muted="#8B8B8B",
        accent="#A78BFA", border="#2A2A2A",
        font_display="Arial", font_body="Arial", mode="dark",
    ),
    "open-bright-sans": ThemeColors(
        bg="#ffffff", paper="#f7f9fc", text="#202124", muted="#5f6368",
        accent="#1a73e8", border="#e8eaed",
        font_display="Arial", font_body="Arial", mode="light",
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
