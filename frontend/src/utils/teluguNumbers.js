/**
 * Telugu Number-to-Words & Voice Announcement Utility
 * Provides 100% accurate, natural Telugu words in Telugu script for Housie/Tambola (1-90).
 */

export const TELUGU_NUMBERS = Object.freeze({
  1: 'ఒకటి',
  2: 'రెండు',
  3: 'మూడు',
  4: 'నాలుగు',
  5: 'ఐదు',
  6: 'ఆరు',
  7: 'ఏడు',
  8: 'ఎనిమిది',
  9: 'తొమ్మిది',
  10: 'పది',
  11: 'పదకొండు',
  12: 'పన్నెండు',
  13: 'పదమూడు',
  14: 'పద్నాలుగు',
  15: 'పదిహేను',
  16: 'పదహారు',
  17: 'పదిహేడు',
  18: 'పద్దెనిమిది',
  19: 'పందొమ్మిది',
  20: 'ఇరవై',
  21: 'ఇరవై ఒకటి',
  22: 'ఇరవై రెండు',
  23: 'ఇరవై మూడు',
  24: 'ఇరవై నాలుగు',
  25: 'ఇరవై ఐదు',
  26: 'ఇరవై ఆరు',
  27: 'ఇరవై ఏడు',
  28: 'ఇరవై ఎనిమిది',
  29: 'ఇరవై తొమ్మిది',
  30: 'ముప్పై',
  31: 'ముప్పై ఒకటి',
  32: 'ముప్పై రెండు',
  33: 'ముప్పై మూడు',
  34: 'ముప్పై నాలుగు',
  35: 'ముప్పై ఐదు',
  36: 'ముప్పై ఆరు',
  37: 'ముప్పై ఏడు',
  38: 'ముప్పై ఎనిమిది',
  39: 'ముప్పై తొమ్మిది',
  40: 'నలభై',
  41: 'నలభై ఒకటి',
  42: 'నలభై రెండు',
  43: 'నలభై మూడు',
  44: 'నలభై నాలుగు',
  45: 'నలభై ఐదు',
  46: 'నలభై ఆరు',
  47: 'నలభై ఏడు',
  48: 'నలభై ఎనిమిది',
  49: 'నలభై తొమ్మిది',
  50: 'యాభై',
  51: 'యాభై ఒకటి',
  52: 'యాభై రెండు',
  53: 'యాభై మూడు',
  54: 'యాభై నాలుగు',
  55: 'యాభై ఐదు',
  56: 'యాభై ఆరు',
  57: 'యాభై ఏడు',
  58: 'యాభై ఎనిమిది',
  59: 'యాభై తొమ్మిది',
  60: 'అరవై',
  61: 'అరవై ఒకటి',
  62: 'అరవై రెండు',
  63: 'అరవై మూడు',
  64: 'అరవై నాలుగు',
  65: 'అరవై ఐదు',
  66: 'అరవై ఆరు',
  67: 'అరవై ఏడు',
  68: 'అరవై ఎనిమిది',
  69: 'అరవై తొమ్మిది',
  70: 'డెబ్బై',
  71: 'డెబ్బై ఒకటి',
  72: 'డెబ్బై రెండు',
  73: 'డెబ్బై మూడు',
  74: 'డెబ్బై నాలుగు',
  75: 'డెబ్బై ఐదు',
  76: 'డెబ్బై ఆరు',
  77: 'డెబ్బై ఏడు',
  78: 'డెబ్బై ఎనిమిది',
  79: 'డెబ్బై తొమ్మిది',
  80: 'ఎనభై',
  81: 'ఎనభై ఒకటి',
  82: 'ఎనభై రెండు',
  83: 'ఎనభై మూడు',
  84: 'ఎనభై నాలుగు',
  85: 'ఎనభై ఐదు',
  86: 'ఎనభై ఆరు',
  87: 'ఎనభై ఏడు',
  88: 'ఎనభై ఎనిమిది',
  89: 'ఎనభై తొమ్మిది',
  90: 'తొంభై'
});

/**
 * Returns the pure Telugu word for a number between 1 and 90.
 * @param {number|string} num 
 * @returns {string} Telugu word in Telugu script
 */
export const getTeluguNumberWord = (num) => {
  const n = parseInt(num, 10);
  if (isNaN(n) || n < 1 || n > 90) return '';
  return TELUGU_NUMBERS[n] || '';
};

/**
 * Returns the natural Telugu announcement sentence for Housie.
 * e.g., 42 -> "సంఖ్య నలభై రెండు"
 * @param {number|string} num 
 * @returns {string}
 */
export const getTeluguAnnouncement = (num) => {
  const word = getTeluguNumberWord(num);
  if (!word) return '';
  return `సంఖ్య ${word}`;
};

/**
 * Returns a natural Telugu announcement for a prize winner.
 * @param {string} winnerName 
 * @param {string} prizeName 
 * @returns {string}
 */
export const getTeluguWinnerAnnouncement = (winnerName, prizeName) => {
  const name = winnerName || 'విజేత';
  const prize = prizeName || 'బహుమతి';
  return `${name} గారు ${prize} గెలుచుకున్నారు!`;
};

/**
 * Checks whether an actual Telugu TTS voice exists in the provided voices list.
 * @param {SpeechSynthesisVoice[]} voices 
 * @returns {boolean}
 */
export const isTeluguVoiceAvailable = (voices = []) => {
  return voices.some(v => 
    (v.lang && (v.lang.toLowerCase().startsWith('te-') || v.lang.toLowerCase() === 'te' || v.lang.toLowerCase() === 'te_in')) ||
    (v.name && v.name.toLowerCase().includes('telugu'))
  );
};

/**
 * Finds the highest quality Telugu voice available in the browser.
 * @param {SpeechSynthesisVoice[]} voices 
 * @returns {SpeechSynthesisVoice|null}
 */
export const findTeluguVoice = (voices = []) => {
  const teluguVoices = voices.filter(v => 
    (v.lang && (v.lang.toLowerCase().startsWith('te-') || v.lang.toLowerCase() === 'te' || v.lang.toLowerCase() === 'te_in')) ||
    (v.name && v.name.toLowerCase().includes('telugu'))
  );

  if (teluguVoices.length === 0) return null;

  // Prioritize Indian Telugu locale and natural/Google/online voices if present
  const best = teluguVoices.find(v => 
    (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Online')) &&
    v.lang.toLowerCase().includes('in')
  );

  return best || teluguVoices[0];
};

/**
 * Configurable Audio Provider options for Telugu voice announcements.
 * Allows seamless switching between:
 * - 'google-tts': Google Translate TTS fallback (free, no API key required)
 * - 'local-clips': Prerecorded local MP3 files in /audio/telugu/{num}.mp3
 * - 'custom': Custom TTS provider endpoint
 */
let audioConfig = {
  provider: 'google-tts', // 'google-tts' | 'local-clips' | 'custom'
  localClipsPath: '/audio/telugu',
  customUrlBuilder: null
};

/**
 * Configure audio provider settings for Telugu announcements.
 * @param {Object} config 
 */
export const configureTeluguAudio = (config = {}) => {
  audioConfig = { ...audioConfig, ...config };
};

/**
 * Generates an audio URL for Telugu TTS or prerecorded clips.
 * Used when the host OS/browser lacks an installed Telugu speech synthesizer.
 * @param {string} text Telugu announcement text
 * @param {number|null} number Optional number (1-90) for local clip lookup
 * @returns {string} Audio URL
 */
export const getTeluguTTSAudioUrl = (text, number = null) => {
  if (audioConfig.provider === 'local-clips' && number !== null) {
    return `${audioConfig.localClipsPath}/${number}.mp3`;
  }

  if (audioConfig.provider === 'custom' && typeof audioConfig.customUrlBuilder === 'function') {
    return audioConfig.customUrlBuilder(text, number);
  }

  // Default: Google Translate TTS keyless fallback
  const encoded = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=te&client=tw-ob&q=${encoded}`;
};

