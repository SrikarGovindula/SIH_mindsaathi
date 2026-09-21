// Small, presentation-only helpers. All gameplay truth (correct answers,
// scoring, adaptive difficulty) lives in Django — this file never
// duplicates that logic.

export function pickEmojiForActivity(name) {
  const key = (name || '').toLowerCase();
  const map = {
    'wake up': '🌅',
    'drink water': '💧',
    'brush teeth': '🪥',
    'get dressed': '👕',
    'eat breakfast': '🍳',
    'take medicine': '💊',
    'medicine if scheduled': '💊',
    'wear shoes': '👟',
    'take water': '🚰',
    'take keys': '🔑',
    'go outside': '🚪',
    'walk': '🚶',
    'get ready': '🧴',
    'take documents': '📄',
    'take medicine list': '📋',
    'travel': '🚗',
    'meet doctor': '🩺',
    'dinner': '🍽️',
    'change clothes': '👔',
    'go to bed': '🛏️',
    'take cup': '☕',
    'prepare tea': '🫖',
    'add milk': '🥛',
    'sit down': '🪑',
    'drink tea': '🍵',
  };
  return map[key] || '⭐';
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    return false;
  }
}

export function formatSeconds(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return '--';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
