export interface GeminiVoice {
  name: string;
  gender: 'Male' | 'Female';
  tone: string;
  pitch: string;
}

// All 30 Gemini 2.5 Pro TTS voices — ordered as in AI Studio
export const GEMINI_VOICES: GeminiVoice[] = [
  { name: 'Zephyr', gender: 'Female', tone: 'Bright', pitch: 'Higher pitch' },
  { name: 'Puck', gender: 'Male', tone: 'Upbeat', pitch: 'Middle pitch' },
  { name: 'Charon', gender: 'Male', tone: 'Informative', pitch: 'Lower pitch' },
  { name: 'Kore', gender: 'Female', tone: 'Firm', pitch: 'Middle pitch' },
  { name: 'Fenrir', gender: 'Male', tone: 'Excitable', pitch: 'Lower middle pitch' },
  { name: 'Leda', gender: 'Female', tone: 'Youthful', pitch: 'Higher pitch' },
  { name: 'Orus', gender: 'Male', tone: 'Firm', pitch: 'Lower middle pitch' },
  { name: 'Aoede', gender: 'Female', tone: 'Breezy', pitch: 'Middle pitch' },
  { name: 'Callirrhoe', gender: 'Female', tone: 'Easy-going', pitch: 'Middle pitch' },
  { name: 'Autonoe', gender: 'Female', tone: 'Bright', pitch: 'Middle pitch' },
  { name: 'Enceladus', gender: 'Male', tone: 'Breathy', pitch: 'Lower pitch' },
  { name: 'Iapetus', gender: 'Male', tone: 'Clear', pitch: 'Lower middle pitch' },
  { name: 'Umbriel', gender: 'Male', tone: 'Easy-going', pitch: 'Lower middle pitch' },
  { name: 'Algieba', gender: 'Male', tone: 'Smooth', pitch: 'Lower pitch' },
  { name: 'Despina', gender: 'Female', tone: 'Smooth', pitch: 'Middle pitch' },
  { name: 'Erinome', gender: 'Female', tone: 'Clear', pitch: 'Middle pitch' },
  { name: 'Algenib', gender: 'Male', tone: 'Gravelly', pitch: 'Lower pitch' },
  { name: 'Rasalgethi', gender: 'Male', tone: 'Informative', pitch: 'Middle pitch' },
  { name: 'Laomedeia', gender: 'Female', tone: 'Upbeat', pitch: 'Higher pitch' },
  { name: 'Achernar', gender: 'Female', tone: 'Soft', pitch: 'Higher pitch' },
  { name: 'Alnilam', gender: 'Male', tone: 'Firm', pitch: 'Lower middle pitch' },
  { name: 'Schedar', gender: 'Male', tone: 'Even', pitch: 'Lower middle pitch' },
  { name: 'Gacrux', gender: 'Female', tone: 'Mature', pitch: 'Middle pitch' },
  { name: 'Pulcherrima', gender: 'Female', tone: 'Forward', pitch: 'Middle pitch' },
  { name: 'Achird', gender: 'Male', tone: 'Friendly', pitch: 'Lower middle pitch' },
  { name: 'Zubenelgenubi', gender: 'Male', tone: 'Casual', pitch: 'Lower middle pitch' },
  { name: 'Vindemiatrix', gender: 'Female', tone: 'Gentle', pitch: 'Middle pitch' },
  { name: 'Sadachbia', gender: 'Male', tone: 'Lively', pitch: 'Lower pitch' },
  { name: 'Sadaltager', gender: 'Male', tone: 'Knowledgeable', pitch: 'Middle pitch' },
  { name: 'Sulafat', gender: 'Female', tone: 'Warm', pitch: 'Middle pitch' },
];

export const GEMINI_VOICE_MAP = new Map(GEMINI_VOICES.map((v) => [v.name, v]));
