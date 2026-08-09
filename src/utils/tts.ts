/**
 * 封装 Web Speech API 朗读发音与音频波形控制
 */

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}



export function speakWord(
  text: string,
  accent: 'US' | 'UK' = 'US',
  rate: number = 0.9,
  onEnd?: () => void
): void {
  if (!isTTSSupported()) {
    console.warn('Speech synthesis not supported on this browser');
    if (onEnd) onEnd();
    return;
  }

  // 停止之前的播放
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = accent === 'UK' ? 'en-GB' : 'en-US';

  // 优先选取对应口音的系统语音
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(
    (v) =>
      v.lang.startsWith(accent === 'UK' ? 'en-GB' : 'en-US') ||
      (accent === 'US' ? v.name.includes('US') || v.name.includes('Google') : v.name.includes('UK'))
  );

  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
}
