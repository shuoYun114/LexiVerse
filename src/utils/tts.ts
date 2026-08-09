/**
 * 封装 Web Speech API 朗读发音与音频波形控制
 */

export type AccentType = 'US' | 'UK' | 'ES';

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * 判断单词是否为西班牙语词汇，自动匹配 Spanish (es-ES) 西语原生弹舌音
 */
export function getWordAccent(wordObjOrId?: { id?: string; tags?: string[] } | string): AccentType {
  if (!wordObjOrId) return 'US';
  if (typeof wordObjOrId === 'string') {
    if (wordObjOrId.startsWith('es-') || /[¡¿]/.test(wordObjOrId)) return 'ES';
    return 'US';
  }
  if (wordObjOrId.id?.startsWith('es-') || wordObjOrId.tags?.some((t) => t.includes('西班牙语'))) {
    return 'ES';
  }
  return 'US';
}

export function speakWord(
  text: string,
  accent: AccentType = 'US',
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

  if (accent === 'ES') {
    utterance.lang = 'es-ES';
  } else if (accent === 'UK') {
    utterance.lang = 'en-GB';
  } else {
    utterance.lang = 'en-US';
  }

  // 优先选取对应口音与语种的系统本地原生语音（西班牙语原生语音具备标准弹舌音）
  const voices = window.speechSynthesis.getVoices();
  let targetVoice: SpeechSynthesisVoice | undefined;

  if (accent === 'ES') {
    targetVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('es') ||
        v.name.includes('Spanish') ||
        v.name.includes('Helena') ||
        v.name.includes('Sabina') ||
        v.name.includes('Laura') ||
        v.name.includes('Pablo') ||
        v.name.includes('Dalia') ||
        v.name.includes('Jorge')
    );
  } else {
    targetVoice = voices.find(
      (v) =>
        v.lang.startsWith(accent === 'UK' ? 'en-GB' : 'en-US') ||
        (accent === 'US' ? v.name.includes('US') || v.name.includes('Google') : v.name.includes('UK'))
    );
  }

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
