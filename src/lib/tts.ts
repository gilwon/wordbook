export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Preferred voices per language, in priority order.
// Chrome/macOS: "Google US English" is high-quality neural voice.
// Safari/macOS: "Samantha", "Alex" are system voices.
const PREFERRED_VOICES: Record<string, string[]> = {
  'en-US': ['Google US English', 'Samantha', 'Alex', 'Karen', 'Microsoft Zira Desktop'],
  'es-ES': ['Google español', 'Google español de Estados Unidos', 'Mónica', 'Monica', 'Microsoft Helena Desktop'],
  'pt-BR': ['Google português do Brasil', 'Luciana', 'Microsoft Daniel Desktop'],
};

function getBestVoice(languageCode: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
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

export function speakText(text: string, languageCode: string): boolean {
  if (!isTTSSupported()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageCode;
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  const voice = getBestVoice(languageCode);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return true;
}
