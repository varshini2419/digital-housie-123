import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getTeluguAnnouncement, 
  getTeluguWinnerAnnouncement, 
  findTeluguVoice, 
  isTeluguVoiceAvailable, 
  getTeluguTTSAudioUrl,
  getTeluguNumberWord
} from '../utils/teluguNumbers';

const useSpeech = () => {
  const [isVoiceEnabledState, setIsVoiceEnabledState] = useState(() => {
    const saved = localStorage.getItem('voiceEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Ref for socket listeners & async loops to avoid stale closures
  const isVoiceEnabled = useRef(isVoiceEnabledState);
  
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [hasNativeTeluguVoice, setHasNativeTeluguVoice] = useState(false);
  const [activeVoiceName, setActiveVoiceName] = useState('');
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

  // Unlock audio context on user interaction (Safari / iOS & mobile browsers)
  const unlockAudio = useCallback(() => {
    if (initialized.current) return;
    initialized.current = true;
    console.log('[Telugu Voice] Unlocking audio context on first interaction');

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

  // Detect and configure voices (handling asynchronous load in Chrome/Edge/Safari/Firefox)
  useEffect(() => {
    let resolved = false;

    const checkVoices = (isFinalAttempt = false) => {
      if (!window.speechSynthesis) {
        setHasNativeTeluguVoice(false);
        setActiveVoiceName('తెలుగు ఆడియో ఫాల్‌బ్యాక్');
        setVoiceNotice('పరికరంలో బ్రౌజర్ స్పీచ్ సపోర్ట్ లేదు. ఆన్‌లైన్ ఆడియో ద్వారా స్వచ్ఛమైన తెలుగులో పలకబడుతోంది.');
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 || isFinalAttempt) {
        setVoicesLoaded(true);
        resolved = true;
        const teluguVoice = findTeluguVoice(voices);
        if (teluguVoice) {
          setHasNativeTeluguVoice(true);
          setActiveVoiceName(teluguVoice.name);
          setVoiceNotice(null);
          console.log(`[Telugu Voice] Detected native Telugu voice: ${teluguVoice.name} (${teluguVoice.lang})`);
        } else {
          setHasNativeTeluguVoice(false);
          setActiveVoiceName('తెలుగు ఆడియో ఫాల్‌బ్యాక్ (Online Audio Fallback)');
          setVoiceNotice('పరికరంలో స్థానిక తెలుగు వాయిస్ లేదు. హై-క్వాలిటీ ఆడియో ఫాల్‌బ్యాక్ ద్వారా స్వచ్ఛమైన తెలుగులో పలకబడుతోంది.');
          console.log('[Telugu Voice] Native Telugu voice not installed. High-fidelity audio fallback ready.');
        }
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

      // Fallback timer for browsers where onvoiceschanged may not fire
      const fallbackTimer = setTimeout(() => {
        if (!resolved) {
          checkVoices(true);
        }
      }, 800);
      timeoutRefs.current.push(fallbackTimer);

      window.addEventListener('pointerdown', handleFirstInteraction, { once: true, passive: true });
      window.addEventListener('keydown', handleFirstInteraction, { once: true, passive: true });
    } else {
      checkVoices(true);
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

  // Persist mute/unmute preference
  useEffect(() => {
    localStorage.setItem('voiceEnabled', JSON.stringify(isVoiceEnabledState));
  }, [isVoiceEnabledState]);

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

  // Playback via high-quality HTML5 Audio fallback (with in-memory cache)
  const speakWithAudioFallback = (text, number = null, speechId) => {
    return new Promise((resolve) => {
      try {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }

        if (activeSpeechId.current !== speechId) {
          return resolve();
        }

        const url = getTeluguTTSAudioUrl(text, number);
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
          console.warn('[Telugu Voice] Fallback audio playback notice:', e);
          done();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[Telugu Voice] Audio play paused by browser autoplay policy:', err);
            done();
          });
        }

        // Failsafe timeout in case audio stalls
        const timer = setTimeout(done, 5500);
        timeoutRefs.current.push(timer);
      } catch (err) {
        console.error('[Telugu Voice] Fallback audio error:', err);
        resolve();
      }
    });
  };

  // Playback via browser Web Speech API (with verified te-IN voice)
  const speakWithWebSpeech = (text, voice, speechId) => {
    return new Promise((resolve) => {
      if (activeSpeechId.current !== speechId) {
        return resolve();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'te-IN';
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.88;
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
        console.warn('[Telugu Voice] Web Speech utterance event:', e);
        finish();
      };

      window.speechSynthesis.speak(utterance);

      // Failsafe for stuck speech engine
      failsafeId = setTimeout(() => {
        if (!finished) {
          console.warn('[Telugu Voice] Speech utterance failsafe triggered');
          try {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            window.speechSynthesis.cancel();
          } catch (_) {}
          finish();
        }
      }, 5500);
      timeoutRefs.current.push(failsafeId);
    });
  };

  // Primary speech engine router: chooses native Telugu TTS voice or audio fallback
  const speakTeluguText = async (text, number = null, speechId) => {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const teluguVoice = findTeluguVoice(voices);

    if (teluguVoice && window.speechSynthesis) {
      await speakWithWebSpeech(text, teluguVoice, speechId);
    } else {
      await speakWithAudioFallback(text, number, speechId);
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
        await speakTeluguText(item.text, null, currentId);
      } else if (item.type === 'number') {
        setCurrentSpokenNumber(item.number);
        const announcement = getTeluguAnnouncement(item.number);
        console.log(`[Telugu Voice] Announcing: "${announcement}" (Number ${item.number})`);
        await speakTeluguText(announcement, item.number, currentId);
      }
    } catch (err) {
      console.error('[Telugu Voice] Error during queue processing:', err);
    } finally {
      isSpeaking.current = false;
      setCurrentSpokenNumber(null);
      if (speechQueue.current.length > 0 && isVoiceEnabled.current) {
        processQueue();
      }
    }
  }, []);

  // Announce number in pure Telugu
  const announceNumber = useCallback((number, isReplay = false) => {
    const num = parseInt(number, 10);
    if (isNaN(num) || num < 1 || num > 90) return;

    console.log(`[Telugu Voice] announceNumber called for: ${num} (Replay: ${isReplay})`);

    // START COUNTDOWN INSTANTLY! Preserves admin sync and countdown loop
    window.dispatchEvent(new CustomEvent('speech_finished', { detail: { number: num } }));

    if (!isVoiceEnabled.current) {
      console.log('[Telugu Voice] Voice muted, skipping playback');
      return;
    }

    // Cancel any previous speech or audio when a new number arrives (prevents overlapping speech)
    activeSpeechId.current += 1;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    speechQueue.current = [];

    // Strict deduplication check: never repeat consecutive number unless explicitly requested via replay
    if (!isReplay && lastAnnouncedNumber.current === num) {
      console.log(`[Telugu Voice] Deduplicated consecutive number: ${num}`);
      return;
    }

    lastAnnouncedNumber.current = num;
    speechQueue.current.push({ type: 'number', number: num });

    // Schedule processing with minimal debounce to let cancel finish cleanly
    const id = setTimeout(() => {
      timeoutRefs.current = timeoutRefs.current.filter(ref => ref !== id);
      isSpeaking.current = false;
      processQueue();
    }, 40);
    timeoutRefs.current.push(id);
  }, [processQueue]);

  // Replay announcement on demand (manual or player replay button)
  const replayNumber = useCallback((number) => {
    const target = number !== undefined && number !== null ? number : lastAnnouncedNumber.current;
    if (target) {
      console.log(`[Telugu Voice] Replaying announcement for: ${target}`);
      announceNumber(target, true);
    }
  }, [announceNumber]);

  // Announce winner in pure Telugu
  const announceWinner = useCallback((winnerName, prizeName) => {
    if (!isVoiceEnabled.current) return;

    const teluguText = typeof winnerName === 'string' && !prizeName 
      ? winnerName // direct string if preformatted
      : getTeluguWinnerAnnouncement(winnerName, prizeName);

    speechQueue.current.push({ type: 'winner', text: teluguText });

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
    announceNumber, 
    replayNumber, 
    announceWinner, 
    unlockAudio,
    hasNativeTeluguVoice,
    activeVoiceName,
    voiceNotice,
    currentSpokenNumber,
    currentTeluguWord: currentSpokenNumber ? getTeluguNumberWord(currentSpokenNumber) : null
  };
};

export default useSpeech;
