// Devanagari numeral map
const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

export function devanagariToArabic(str: string): string {
  return str.replace(/[०-९]/g, (ch) => DEVANAGARI_DIGITS[ch] ?? ch);
}

// Chapter: प्रकरण १: Title
export const CHAPTER_PATTERN = /^प्रकरण\s+([०-९\d]+):\s*(.+)$/;

// Characters section header
export const CHARACTERS_HEADER = /^पात्रे:\s*$/;

// Scene header: दृश्य १: Title
export const SCENE_HEADER = /^दृश्य\s+([०-९\d]+):\s*(.+)$/;

// SFX or BGM block: [SFX: ...] or [BGM: ...]
export const AUDIO_BLOCK = /^\[(SFX|BGM):\s*(.+)\]$/;

// Pause block: [PAUSE: 1.5s]
export const PAUSE_BLOCK = /^\[PAUSE:\s*([\d.]+)s\]$/;

// Fields inside audio blocks
export const DURATION_PATTERN = /Duration:\s*([\d.]+)s/;
export const FADE_IN_PATTERN = /Fade-in:\s*([\d.]+)s/;
export const FADE_OUT_PATTERN = /Fade-out:\s*([\d.]+)s/;

// Modifiers like "Very faint", "Loud", etc. — extracted as the last sentence fragment
// that doesn't match Duration/Fade patterns
export const MODIFIER_PATTERN = /\.\s*([A-Z][a-z][\w\s]+)$/;

// Stage direction in parentheses at start of dialogue
export const STAGE_DIRECTION = /^\(([^)]+)\)\s*/;
