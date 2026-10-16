/**
 * English Number-to-Words & Voice Announcement Utility
 * Provides clear English words and audio URLs for Housie/Tambola (1-90).
 */

export const ENGLISH_NUMBERS = Object.freeze({
  1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
  6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
  11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
  16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
  21: 'Twenty One', 22: 'Twenty Two', 23: 'Twenty Three', 24: 'Twenty Four', 25: 'Twenty Five',
  26: 'Twenty Six', 27: 'Twenty Seven', 28: 'Twenty Eight', 29: 'Twenty Nine', 30: 'Thirty',
  31: 'Thirty One', 32: 'Thirty Two', 33: 'Thirty Three', 34: 'Thirty Four', 35: 'Thirty Five',
  36: 'Thirty Six', 37: 'Thirty Seven', 38: 'Thirty Eight', 39: 'Thirty Nine', 40: 'Forty',
  41: 'Forty One', 42: 'Forty Two', 43: 'Forty Three', 44: 'Forty Four', 45: 'Forty Five',
  46: 'Forty Six', 47: 'Forty Seven', 48: 'Forty Eight', 49: 'Forty Nine', 50: 'Fifty',
  51: 'Fifty One', 52: 'Fifty Two', 53: 'Fifty Three', 54: 'Fifty Four', 55: 'Fifty Five',
  56: 'Fifty Six', 57: 'Fifty Seven', 58: 'Fifty Eight', 59: 'Fifty Nine', 60: 'Sixty',
  61: 'Sixty One', 62: 'Sixty Two', 63: 'Sixty Three', 64: 'Sixty Four', 65: 'Sixty Five',
  66: 'Sixty Six', 67: 'Sixty Seven', 68: 'Sixty Eight', 69: 'Sixty Nine', 70: 'Seventy',
  71: 'Seventy One', 72: 'Seventy Two', 73: 'Seventy Three', 74: 'Seventy Four', 75: 'Seventy Five',
  76: 'Seventy Six', 77: 'Seventy Seven', 78: 'Seventy Eight', 79: 'Seventy Nine', 80: 'Eighty',
  81: 'Eighty One', 82: 'Eighty Two', 83: 'Eighty Three', 84: 'Eighty Four', 85: 'Eighty Five',
  86: 'Eighty Six', 87: 'Eighty Seven', 88: 'Eighty Eight', 89: 'Eighty Nine', 90: 'Ninety'
});

export const getEnglishNumberWord = (num) => {
  const n = parseInt(num, 10);
  if (isNaN(n) || n < 1 || n > 90) return '';
  return ENGLISH_NUMBERS[n] || String(n);
};

export const getEnglishAnnouncement = (num) => {
  const n = parseInt(num, 10);
  if (isNaN(n) || n < 1 || n > 90) return '';
  const word = getEnglishNumberWord(n);
  return `Number ${n}, ${word}`;
};

export const getEnglishWinnerAnnouncement = (winnerName, prizeName) => {
  const prize = (typeof winnerName === 'string' && !prizeName ? winnerName : prizeName) || 'the prize';
  return `Congratulations! You won ${prize}!`;
};

export const getEnglishTTSAudioUrl = (text, number = null) => {
  if (number !== null) {
    return `/audio/english/${number}.mp3`;
  }
  const encoded = encodeURIComponent(text);
  const apiUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  return `${apiUrl}/api/tts?lang=en&text=${encoded}`;
};

export const findEnglishVoice = (voices = []) => {
  if (!voices || voices.length === 0) return null;
  // Look for English natural or high quality voice
  const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
  if (enVoices.length === 0) return null;
  const best = enVoices.find(v => 
    v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')
  );
  return best || enVoices[0];
};
