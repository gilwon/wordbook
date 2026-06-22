export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(text: string, languageCode: string): boolean {
  if (!isTTSSupported()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageCode;
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
  return true;
}
