export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Priority order: Neural/Online (best) → Google (good) → System (fallback)
const PREFERRED_VOICES: Record<string, string[]> = {
  'en-US': [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Davis Online (Natural) - English (United States)',
    'Microsoft Guy Online (Natural) - English (United States)',
    'Microsoft Ana Online (Natural) - English (United States)',
    'Google US English',
    'Samantha', 'Alex', 'Karen',
    'Microsoft Zira Desktop', 'Microsoft David Desktop',
  ],
  'es-ES': [
    'Microsoft Elvira Online (Natural) - Spanish (Spain)',
    'Microsoft Alvaro Online (Natural) - Spanish (Spain)',
    'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
    'Microsoft Jorge Online (Natural) - Spanish (Mexico)',
    'Google español', 'Google español de Estados Unidos',
    'Mónica', 'Monica',
    'Microsoft Helena Desktop', 'Microsoft Pablo Desktop',
  ],
  'pt-BR': [
    'Microsoft Francisca Online (Natural) - Portuguese (Brazil)',
    'Microsoft Antonio Online (Natural) - Portuguese (Brazil)',
    'Google português do Brasil',
    'Luciana',
    'Microsoft Daniel Desktop',
  ],
};

let cachedVoices: SpeechSynthesisVoice[] = [];
// Tracks the one pending voiceschanged handler to prevent accumulation on rapid clicks
let pendingVoicesHandler: (() => void) | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) cachedVoices = voices;
  return cachedVoices;
}

function getBestVoice(languageCode: string): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;

  const preferred = PREFERRED_VOICES[languageCode] ?? [];
  for (const name of preferred) {
    const voice = voices.find((v) => v.name === name);
    if (voice) return voice;
  }

  return (
    voices.find((v) => v.lang === languageCode) ??
    voices.find((v) => v.lang.startsWith(languageCode.split('-')[0])) ??
    null
  );
}

function doSpeak(text: string, languageCode: string): void {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageCode;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  const voice = getBestVoice(languageCode);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function speakText(text: string, languageCode: string): boolean {
  if (!isTTSSupported()) return false;

  const voices = loadVoices();
  if (voices.length) {
    doSpeak(text, languageCode);
  } else {
    // Cancel any existing pending handler so rapid clicks don't stack
    if (pendingVoicesHandler) {
      window.speechSynthesis.removeEventListener('voiceschanged', pendingVoicesHandler);
      pendingVoicesHandler = null;
    }
    const handler = () => {
      loadVoices();
      doSpeak(text, languageCode);
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      pendingVoicesHandler = null;
    };
    pendingVoicesHandler = handler;
    window.speechSynthesis.addEventListener('voiceschanged', handler);
  }

  return true;
}
