import { 
  TELUGU_NUMBERS, 
  getTeluguNumberWord, 
  getTeluguAnnouncement, 
  getTeluguWinnerAnnouncement, 
  isTeluguVoiceAvailable, 
  findTeluguVoice, 
  getTeluguTTSAudioUrl 
} from '../src/utils/teluguNumbers.js';

console.log('--- STARTING TELUGU ANNOUNCEMENT SYSTEM VERIFICATION ---\n');

let failed = 0;

// 1. Verify all numbers 1 to 90
console.log('1. Verifying numbers 1 through 90:');
for (let i = 1; i <= 90; i++) {
  const word = getTeluguNumberWord(i);
  if (!word || typeof word !== 'string' || word.trim() === '') {
    console.error(`  FAIL: Missing or empty word for ${i}`);
    failed++;
  } else if (/[a-zA-Z]/.test(word)) {
    console.error(`  FAIL: English characters detected for ${i}: "${word}"`);
    failed++;
  }

  const announcement = getTeluguAnnouncement(i);
  if (!announcement || !announcement.startsWith('సంఖ్య ')) {
    console.error(`  FAIL: Invalid announcement sentence for ${i}: "${announcement}"`);
    failed++;
  }
}
console.log(`  PASSED: All 90 numbers verified in pure Telugu script.\n`);

// 2. Boundary testing (0, 91, invalid)
console.log('2. Verifying out-of-range boundaries (0, 91, negative, NaN):');
if (getTeluguNumberWord(0) !== '') { console.error('  FAIL: 0 returned word'); failed++; }
if (getTeluguNumberWord(91) !== '') { console.error('  FAIL: 91 returned word'); failed++; }
if (getTeluguNumberWord(-5) !== '') { console.error('  FAIL: -5 returned word'); failed++; }
if (getTeluguNumberWord('abc') !== '') { console.error('  FAIL: "abc" returned word'); failed++; }
console.log('  PASSED: Out-of-range handled safely.\n');

// 3. Winner announcements
console.log('3. Verifying Winner announcements:');
const winMsg1 = getTeluguWinnerAnnouncement('రమేష్', 'జల్దీ 5');
if (winMsg1 !== 'అభినందనలు! మీరు జల్దీ 5 గెలుచుకున్నారు!') {
  console.error(`  FAIL: Winner message 1 mismatch: "${winMsg1}"`);
  failed++;
} else {
  console.log(`  PASSED: "${winMsg1}"`);
}

const winMsg2 = getTeluguWinnerAnnouncement('', 'ఫుల్ హౌస్');
if (!winMsg2.includes('ఫుల్ హౌస్ గెలుచుకున్నారు!')) {
  console.error(`  FAIL: Winner message fallback mismatch: "${winMsg2}"`);
  failed++;
} else {
  console.log(`  PASSED: "${winMsg2}"`);
}

// 4. Voice selection & detection
console.log('\n4. Verifying Voice matching & fallback detection:');
const mockVoices = [
  { name: 'Microsoft David', lang: 'en-US' },
  { name: 'Google US English', lang: 'en-US' },
  { name: 'Google తెలుగు', lang: 'te-IN' },
  { name: 'Microsoft Ravi', lang: 'en-IN' }
];

const hasVoice = isTeluguVoiceAvailable(mockVoices);
const bestVoice = findTeluguVoice(mockVoices);
if (!hasVoice || !bestVoice || bestVoice.name !== 'Google తెలుగు') {
  console.error('  FAIL: Telugu voice was not correctly identified from mock voices');
  failed++;
} else {
  console.log(`  PASSED: Correctly identified "${bestVoice.name}" (${bestVoice.lang})`);
}

const emptyVoices = [
  { name: 'Microsoft David', lang: 'en-US' },
  { name: 'Google UK English Female', lang: 'en-GB' }
];
const hasVoice2 = isTeluguVoiceAvailable(emptyVoices);
const bestVoice2 = findTeluguVoice(emptyVoices);
if (hasVoice2 || bestVoice2 !== null) {
  console.error('  FAIL: False positive when no Telugu voice present');
  failed++;
} else {
  console.log('  PASSED: Correctly determined absence of Telugu voice (triggers fallback).');
}

// 5. Audio Fallback URL generation
console.log('\n5. Verifying Audio Fallback URL:');
const testUrl = getTeluguTTSAudioUrl(getTeluguAnnouncement(42), 42);
if (!testUrl || !testUrl.includes('tl=te')) {
  console.error(`  FAIL: Audio URL format unexpected: ${testUrl}`);
  failed++;
} else {
  console.log(`  PASSED: Generated valid audio fallback URL for number 42.`);
}

console.log('\n----------------------------------------------------');
if (failed === 0) {
  console.log('ALL TELUGU VOICE ANNOUNCEMENT TESTS PASSED PERFECTLY!');
} else {
  console.error(`TESTS FAILED: ${failed} errors detected.`);
  process.exit(1);
}
