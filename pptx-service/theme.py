from dataclasses import dataclass


@dataclass
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


def _first_font(css_stack: str) -> str:
    first = css_stack.split(",")[0].strip().strip('"').strip("'")
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
