import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getTeluguAnnouncement, 
  getTeluguWinnerAnnouncement, 
  findTeluguVoice, 
  getTeluguTTSAudioUrl,
  getTeluguNumberWord
} from '../utils/teluguNumbers';
import {
  getEnglishAnnouncement,
  getEnglishWinnerAnnouncement,
  findEnglishVoice,
  getEnglishTTSAudioUrl,
  getEnglishNumberWord
} from '../utils/englishNumbers';

const useSpeech = () => {
  const [isVoiceEnabledState, setIsVoiceEnabledState] = useState(() => {
    const saved = localStorage.getItem('voiceEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Voice language: 'te' (Telugu - primary) or 'en' (English)
  const [voiceLanguageState, setVoiceLanguageState] = useState(() => {
    const saved = localStorage.getItem('housie_voice_lang');
    return saved === 'en' ? 'en' : 'te'; // Telugu is primary default!
  });

  const isVoiceEnabled = useRef(isVoiceEnabledState);
  const voiceLanguage = useRef(voiceLanguageState);
  
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [hasNativeTeluguVoice, setHasNativeTeluguVoice] = useState(false);
  const [activeVoiceName, setActiveVoiceName] = useState('తెలుగు వాయిస్ (HD Audio)');
  const [voiceNotice, setVoiceNotice] = useState(null);
  const [currentSpokenNumber, setCurrentSpokenNumber] = useState(null);

  const speechQueue = useRef([]);
  const isSpeaking = useRef(false);
  const initialized = useRef(false);
  const lastAnnouncedNumber = useRef(null);
  const timeoutRefs = useRef([]);
  const activeUtterances = useRef(new Set());
  const currentAudioRef = useRef(null);
  const audioCache = useRef(new Map());
  const activeSpeechId = useRef(0);

  // Keep refs synced with states
  useEffect(() => {
    isVoiceEnabled.current = isVoiceEnabledState;
    localStorage.setItem('voiceEnabled', JSON.stringify(isVoiceEnabledState));
  }, [isVoiceEnabledState]);

  useEffect(() => {
    voiceLanguage.current = voiceLanguageState;
    localStorage.setItem('housie_voice_lang', voiceLanguageState);
    setActiveVoiceName(voiceLanguageState === 'te' ? 'తెలుగు వాయిస్ (HD Audio)' : 'English Voice (HD Audio)');
  }, [voiceLanguageState]);

  // Unlock audio context on first user interaction (Safari/iOS/Chrome autoplay policy)
  const unlockAudio = useCallback(() => {
    if (initialized.current) return;
    initialized.current = true;
    console.log('[Voice Engine] Unlocking audio context on first interaction');

    try {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(' ');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (_) {}

    try {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      audio.volume = 0;
      audio.play().catch(() => {});
    } catch (_) {}
  }, []);

  // Detect available browser voices
  useEffect(() => {
    const checkVoices = () => {
      if (!window.speechSynthesis) {
        setHasNativeTeluguVoice(false);
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
        const teluguVoice = findTeluguVoice(voices);
        setHasNativeTeluguVoice(!!teluguVoice);
      }
    };

    const handleFirstInteraction = () => {
      unlockAudio();
    };

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}

      checkVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => checkVoices();
      }

      const fallbackTimer = setTimeout(checkVoices, 800);
      timeoutRefs.current.push(fallbackTimer);

      window.addEventListener('pointerdown', handleFirstInteraction, { once: true, passive: true });
      window.addEventListener('keydown', handleFirstInteraction, { once: true, passive: true });
    }

    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, [unlockAudio]);

  const toggleVoice = () => {
    unlockAudio();
    const next = !isVoiceEnabled.current;
    isVoiceEnabled.current = next;
    setIsVoiceEnabledState(next);
    
    if (!next) {
      activeSpeechId.current += 1;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      speechQueue.current = [];
      isSpeaking.current = false;
      setCurrentSpokenNumber(null);
      timeoutRefs.current.forEach(clearTimeout);
    }
  };

  const setVoiceLanguage = (lang) => {
    unlockAudio();
    const target = lang === 'en' ? 'en' : 'te';
    voiceLanguage.current = target;
    setVoiceLanguageState(target);
    console.log(`[Voice Engine] Language switched to: ${target === 'te' ? 'Telugu' : 'English'}`);
  };

  const toggleVoiceLanguage = () => {
    unlockAudio();
    const next = voiceLanguage.current === 'te' ? 'en' : 'te';
    setVoiceLanguage(next);
    return next;
  };

  // Play audio clip with caching
  const playAudioUrl = (url, speechId) => {
    return new Promise((resolve) => {
      try {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }

        if (activeSpeechId.current !== speechId) {
          return resolve();
        }

        let audio = audioCache.current.get(url);
        if (!audio) {
          audio = new Audio(url);
          audioCache.current.set(url, audio);
        } else {
          audio.currentTime = 0;
        }

        currentAudioRef.current = audio;

        let resolved = false;
        const done = () => {
          if (resolved) return;
          resolved = true;
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          resolve();
        };

        audio.onended = done;
        audio.onerror = (e) => {
          console.warn('[Voice Engine] Audio playback notice:', e);
          done();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[Voice Engine] Playback paused by browser policy:', err);
            done();
          });
        }

        const timer = setTimeout(done, 5000);
        timeoutRefs.current.push(timer);
      } catch (err) {
        console.error('[Voice Engine] Audio error:', err);
        resolve();
      }
    });
  };

  // Playback via browser Web Speech API
  const speakWithWebSpeech = (text, lang, speechId) => {
    return new Promise((resolve) => {
      if (activeSpeechId.current !== speechId || !window.speechSynthesis) {
        return resolve();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'te' ? 'te-IN' : 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'te') {
        const v = findTeluguVoice(voices);
        if (v) utterance.voice = v;
      } else {
        const v = findEnglishVoice(voices);
        if (v) utterance.voice = v;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      activeUtterances.current.add(utterance);

      let finished = false;
      let failsafeId = null;

      const finish = () => {
        activeUtterances.current.delete(utterance);
        if (finished) return;
        finished = true;
        if (failsafeId) clearTimeout(failsafeId);
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = (e) => {
        console.warn('[Voice Engine] Utterance event:', e);
        finish();
      };

      window.speechSynthesis.speak(utterance);

      failsafeId = setTimeout(() => {
        if (!finished) {
          try {
            window.speechSynthesis.cancel();
          } catch (_) {}
          finish();
        }
      }, 5000);
      timeoutRefs.current.push(failsafeId);
    });
  };

  // Primary speech engine router
  const speakNumber = async (number, speechId) => {
    const lang = voiceLanguage.current;
    console.log(`[Voice Engine] Announcing number ${number} in [${lang === 'te' ? 'Telugu' : 'English'}]`);
    
    const audioUrl = lang === 'te' 
      ? getTeluguTTSAudioUrl('', number) 
      : getEnglishTTSAudioUrl('', number);

    try {
      await playAudioUrl(audioUrl, speechId);
    } catch (e) {
      console.warn('[Voice Engine] Local audio play failed, trying fallback WebSpeech:', e);
      const text = lang === 'te' ? getTeluguAnnouncement(number) : getEnglishAnnouncement(number);
      await speakWithWebSpeech(text, lang, speechId);
    }
  };

  const speakWinner = async (winnerName, prizeName, speechId) => {
    const lang = voiceLanguage.current;
    const winnerUrl = lang === 'te' ? '/audio/telugu/winner.mp3' : '/audio/english/winner.mp3';
    
    try {
      await playAudioUrl(winnerUrl, speechId);
    } catch (_) {
      const text = lang === 'te' 
        ? getTeluguWinnerAnnouncement(winnerName, prizeName) 
        : getEnglishWinnerAnnouncement(winnerName, prizeName);
      await speakWithWebSpeech(text, lang, speechId);
    }
  };

  const processQueue = useCallback(async () => {
    if (!isVoiceEnabled.current || speechQueue.current.length === 0) {
      isSpeaking.current = false;
      return;
    }

    if (isSpeaking.current) return;

    isSpeaking.current = true;
    const item = speechQueue.current.shift();
    const currentId = activeSpeechId.current;

    try {
      if (item.type === 'winner') {
        await speakWinner(item.winnerName, item.prizeName, currentId);
      } else if (item.type === 'number') {
        setCurrentSpokenNumber(item.number);
        await speakNumber(item.number, currentId);
      }
    } catch (err) {
      console.error('[Voice Engine] Error during queue processing:', err);
    } finally {
      isSpeaking.current = false;
      setCurrentSpokenNumber(null);
      if (speechQueue.current.length > 0 && isVoiceEnabled.current) {
        processQueue();
      }
    }
  }, []);

  // Announce number
  const announceNumber = useCallback((number, isReplay = false) => {
    const num = parseInt(number, 10);
    if (isNaN(num) || num < 1 || num > 90) return;

    console.log(`[Voice Engine] announceNumber called for: ${num} (Replay: ${isReplay}, Lang: ${voiceLanguage.current})`);

    // Dispatch speech finished event immediately for flawless sync
    window.dispatchEvent(new CustomEvent('speech_finished', { detail: { number: num } }));

    if (!isVoiceEnabled.current) {
      console.log('[Voice Engine] Voice muted, skipping playback');
      return;
    }

    activeSpeechId.current += 1;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    speechQueue.current = [];

    if (!isReplay && lastAnnouncedNumber.current === num) {
      console.log(`[Voice Engine] Deduplicated consecutive number: ${num}`);
      return;
    }

    lastAnnouncedNumber.current = num;
    speechQueue.current.push({ type: 'number', number: num });

    const id = setTimeout(() => {
      timeoutRefs.current = timeoutRefs.current.filter(ref => ref !== id);
      isSpeaking.current = false;
      processQueue();
    }, 40);
    timeoutRefs.current.push(id);
  }, [processQueue]);

  // Replay announcement on demand
  const replayNumber = useCallback((number) => {
    const target = number !== undefined && number !== null ? number : lastAnnouncedNumber.current;
    if (target) {
      announceNumber(target, true);
    }
  }, [announceNumber]);

  // Announce winner
  const announceWinner = useCallback((winnerName, prizeName) => {
    if (!isVoiceEnabled.current) return;

    speechQueue.current.push({ type: 'winner', winnerName, prizeName });

    if (!isSpeaking.current) {
      const id = setTimeout(() => {
        timeoutRefs.current = timeoutRefs.current.filter(ref => ref !== id);
        processQueue();
      }, 40);
      timeoutRefs.current.push(id);
    }
  }, [processQueue]);

  return { 
    isVoiceEnabled: isVoiceEnabledState, 
    toggleVoice,
    voiceLanguage: voiceLanguageState,
    setVoiceLanguage,
    toggleVoiceLanguage,
    announceNumber, 
    replayNumber, 
    announceWinner, 
    unlockAudio,
    hasNativeTeluguVoice,
    activeVoiceName,
    voiceNotice,
    currentSpokenNumber,
    currentTeluguWord: currentSpokenNumber ? getTeluguNumberWord(currentSpokenNumber) : null,
    currentEnglishWord: currentSpokenNumber ? getEnglishNumberWord(currentSpokenNumber) : null
  };
};

export default useSpeech;
