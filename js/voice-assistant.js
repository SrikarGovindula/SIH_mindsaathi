/**
 * Voice Assistant (AI Caretaker Edition) — Smriti-NER
 * ─────────────────────────────────────────────────────────────────
 * Upgraded from basic keyword matcher to full AI caretaker voice.
 *
 * New capabilities:
 *  1. AI-driven conversation via AiCaretaker engine
 *  2. Emotional TTS (pitch/rate tuned per detected emotion)
 *  3. Auto-relisten cycle (AI speaks → waits → listens again)
 *  4. Conversation chat panel (floating bubble UI)
 *  5. Escalation alerts to caregiver
 *  6. Proactive check-in scheduler (every 15 min)
 *  7. Language-locked STT matching UI language
 *  8. Multilingual TTS with graceful fallbacks for rare scripts
 * ─────────────────────────────────────────────────────────────────
 */

class VoiceAssistant {
    constructor() {
        this.synth = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.audioCtx = null;
        this.soundEnabled = true;
        this.currentUtterance = null;

        // AI conversation mode — auto-listens after AI speaks
        this.conversationMode = false;
        this.autoListenTimeout = null;

        // Chat UI state
        this.chatOpen = false;
        this.chatMessages = []; // [{role, text, icon, ts}]

        // Proactive check-in timer handle
        this.checkInInterval = null;

        // TTS voice cache per language
        this._voiceCache = {};
        this._voicesLoaded = false;

        this.initRecognition();
        this._cacheVoices();
        this._startProactiveCheckIn();
    }

    // ─────────────────────────────────────────────────────────────────
    //  TTS Voice Management
    // ─────────────────────────────────────────────────────────────────
    _cacheVoices() {
        const tryCache = () => {
            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                this._voiceCache = {};
                voices.forEach(v => {
                    if (!this._voiceCache[v.lang]) {
                        this._voiceCache[v.lang] = v;
                    }
                });
                this._voicesLoaded = true;
            }
        };
        tryCache();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = tryCache;
        }
    }

    /**
     * Find best available TTS voice for a language with fallback chain
     */
    _getBestVoice(langCode) {
        // Direct match
        if (this._voiceCache[langCode]) return this._voiceCache[langCode];

        // Fallback chains for regional languages
        const fallbackChain = {
            'as-IN':  ['bn-IN', 'hi-IN', 'en-IN'],
            'brx-IN': ['hi-IN', 'en-IN'],
            'mni-IN': ['bn-IN', 'hi-IN', 'en-IN'],
            'lus-IN': ['en-IN', 'en-GB'],
            'kha-IN': ['en-IN', 'en-GB'],
            'bn-IN':  ['hi-IN', 'en-IN'],
            'hi-IN':  ['en-IN'],
            'en-IN':  ['en-GB', 'en-US']
        };

        const chain = fallbackChain[langCode] || ['en-IN', 'en-US'];
        for (const fallback of chain) {
            if (this._voiceCache[fallback]) return this._voiceCache[fallback];
        }

        // Last resort: any English voice
        const voices = this.synth.getVoices();
        return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
    }

    _getLangTTSCode(lang) {
        return {
            as: 'as-IN', bn: 'bn-IN', hi: 'hi-IN', en: 'en-IN',
            brx: 'brx-IN', mni: 'mni-IN', lus: 'lus-IN', kha: 'kha-IN'
        }[lang] || 'en-IN';
    }

    _getLangSTTCode(lang) {
        return {
            as: 'as-IN', bn: 'bn-IN', hi: 'hi-IN', en: 'en-IN',
            brx: 'hi-IN',  // closest STT for Bodo
            mni: 'bn-IN',  // closest STT for Manipuri
            lus: 'en-IN',  // closest STT for Mizo
            kha: 'en-IN'   // closest STT for Khasi
        }[lang] || 'en-IN';
    }

    // ─────────────────────────────────────────────────────────────────
    //  Speech Recognition
    // ─────────────────────────────────────────────────────────────────
    initRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) return;

        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;

        this.recognition.onstart = () => {
            this._updatePanelStatus('listening');
        };

        this.recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            // Show interim transcript live in panel
            if (interim) this._showInterimText(interim);

            if (final) {
                const text = final.trim();
                console.log('[VoiceAssistant] Heard:', text);
                this._handleAiConversation(text);
                this.setListeningState(false);
            }
        };

        this.recognition.onerror = (e) => {
            console.warn('[VoiceAssistant] STT error:', e.error);
            if (e.error !== 'no-speech') {
                this.setListeningState(false);
                this._updatePanelStatus('idle');
            }
        };

        this.recognition.onend = () => {
            this.setListeningState(false);
            this._updatePanelStatus('idle');
        };
    }

    toggleListening() {
        if (!this.recognition) {
            this.speak("Voice recognition is not supported in this browser.");
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            this.conversationMode = false;
            this.setListeningState(false);
            clearTimeout(this.autoListenTimeout);
        } else {
            this._startListening();
        }

        // Open chat panel if not open
        if (!this.chatOpen) {
            this.toggleChatPanel(true);
        }
    }

    _startListening() {
        const lang = window.i18n ? window.i18n.getLang() : 'en';
        this.recognition.lang = this._getLangSTTCode(lang);

        try {
            this.recognition.start();
            this.setListeningState(true);
            this.conversationMode = true;
            this.playChime('listen');
            this._updatePanelStatus('listening');
        } catch (err) {
            console.warn('[VoiceAssistant] Recognition start error:', err);
        }
    }

    setListeningState(listening) {
        this.isListening = listening;
        const btn = document.getElementById('voice-assistant-mic-btn');
        if (btn) {
            if (listening) {
                btn.classList.add('mic-active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('mic-active');
                btn.setAttribute('aria-pressed', 'false');
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  AI Conversation Handler — Gemini primary, rule-based fallback
    // ─────────────────────────────────────────────────────────────────
    async _handleAiConversation(userText) {
        const lang = window.i18n ? window.i18n.getLang() : 'en';

        // Add patient bubble immediately
        this.addChatBubble('patient', userText, '🙂');

        // Show "thinking" while AI generates
        this._updatePanelStatus('thinking');

        let responseText = null;
        let emotion = 'neutral';
        let source = 'fallback';

        // ── Try Gemini AI first ───────────────────────────────────────
        if (window.geminiAI && window.geminiAI.apiKey) {
            try {
                const result = await window.geminiAI.generateResponse(userText, lang);
                if (result.text) {
                    responseText = result.text;
                    emotion = window.geminiAI.detectEmotionFromResponse(responseText);
                    source = 'gemini';
                } else if (result.source === 'no_key') {
                    this._showApiKeyPrompt();
                }
            } catch (err) {
                console.warn('[VoiceAssistant] Gemini call failed, using fallback:', err);
            }
        }

        // ── Fallback: rule-based template ─────────────────────────────
        if (!responseText) {
            const ruleResult = window.aiCaretaker
                ? window.aiCaretaker.processInput(userText, lang)
                : null;
            if (ruleResult) {
                responseText = ruleResult.text;
                emotion = ruleResult.emotion || 'neutral';
            } else {
                // Last resort hardcoded multilingual response
                const lastResort = {
                    as: 'আপোনাৰ কথা শুনিছোঁ আইতা। আকৌ এবাৰ কওক।',
                    bn: 'আপনার কথা শুনছি দিদা। আবার বলুন।',
                    hi: 'आपकी बात सुन रही हूँ। दोबारा बताइए।',
                    en: "I'm listening dear. Could you say that again?",
                    brx: 'নোংথাংনি গাব খোনাসোন আবৈ।',
                    mni: 'নহাকপী ৱারোল ঙাকখ্রে ইমা।',
                    lus: 'Ka ngaihthlak Nu.',
                    kha: 'Nga ngiñiuh Kong.'
                };
                responseText = lastResort[lang] || lastResort['en'];
            }
        }

        // ── Safety escalation check ───────────────────────────────────
        const shouldEscalate = window.geminiAI
            ? window.geminiAI.detectEscalation(userText, lang)
            : false;

        if (shouldEscalate) {
            this._triggerCaregiverAlert(userText, 'distress', lang);
        }

        // ── Speak and display the response ────────────────────────────
        const sourceIcon = source === 'gemini' ? '🤗' : '🌿';
        this.addChatBubble('ai', responseText, sourceIcon);
        this.speakWithEmotion(responseText, emotion, () => {
            this._updatePanelStatus('idle');
            // Auto-relisten if in conversation mode
            if (this.conversationMode) {
                this.autoListenTimeout = setTimeout(() => {
                    if (this.conversationMode && !this.isListening) {
                        this._startListening();
                    }
                }, 2200);
            }
        });
    }

    _navigateByIntent(intent) {
        // Soft navigation suggestions after AI responds
        const navMap = {
            medicine: () => {
                setTimeout(() => {
                    if (window.appNav) window.appNav.showScreen('reminders-screen');
                }, 3500);
            },
            game_help: () => {
                setTimeout(() => {
                    if (window.appNav) window.appNav.showScreen('games-screen');
                }, 3500);
            },
            calm_request: () => {
                setTimeout(() => {
                    if (window.appNav) window.appNav.showScreen('wellness-screen');
                }, 3500);
            }
        };
        navMap[intent]?.();
    }

    // ─────────────────────────────────────────────────────────────────
    //  API Key Setup Prompt & Banner Management
    // ─────────────────────────────────────────────────────────────────
    _showApiKeyPrompt() {
        const modal = document.getElementById('gemini-key-modal');
        const input = document.getElementById('gemini-key-input');
        if (input) {
            const savedKey = window.geminiAI?.apiKey || localStorage.getItem('smriti_gemini_key') || '';
            input.value = savedKey;
        }
        if (modal) {
            modal.classList.remove('hidden');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    updateApiKeyUI() {
        const hasKey = !!(window.geminiAI?.apiKey || localStorage.getItem('smriti_gemini_key'));
        const banner = document.getElementById('ai-key-notice-bar');
        const topBtn = document.getElementById('btn-top-ai-key');
        
        if (banner) {
            if (hasKey) {
                banner.classList.add('hidden');
            } else {
                banner.classList.remove('hidden');
            }
        }
        if (topBtn) {
            if (hasKey) {
                topBtn.innerHTML = '<span>🤖</span> <span>AI Active 🟢</span>';
                topBtn.classList.add('ai-active');
            } else {
                topBtn.innerHTML = '<span>🤖</span> <span>AI Key ⚠️</span>';
                topBtn.classList.remove('ai-active');
            }
        }
    }

    saveApiKey() {
        const input = document.getElementById('gemini-key-input');
        if (input && input.value.trim()) {
            const key = input.value.trim();
            window.geminiAI.setApiKey(key);
            const modal = document.getElementById('gemini-key-modal');
            if (modal) modal.classList.add('hidden');
            
            this.updateApiKeyUI();

            // Add confirmation bubble
            const lang = window.i18n ? window.i18n.getLang() : 'en';
            const confirmMsgs = {
                as: 'AI সংযোগ সফল হৈছে! এতিয়া মই আপোনাৰ সৈতে প্ৰকৃত মানুহৰ দৰে কথা পাতিব পাৰিম।',
                bn: 'AI সংযোগ সফল! এখন আমি আপনার সাথে একজন সত্যিকারের মানুষের মতো কথা বলতে পারব।',
                hi: 'AI कनेक्शन सक्रिय! अब मैं एक सच्चे देखभालकर्ता की तरह आपसे बात करूँगी।',
                en: 'AI Caretaker connected! I will now talk with you naturally like a real human caretaker.',
                brx: 'AI जोड़ सफल! इसोनो मो नोंथांजों मोजां गाव थाव दांगोन।',
                mni: 'AI লোয়ননবা ফল। ঙানি ঐ নহাকপা লোয়ননা ৱারোল পানবা ঙম্মি।',
                lus: 'AI inkhawmpui a ṭha! Ka inpui thei ta ang.',
                kha: 'AI kyndon bha! Nga lah long ban ïap ia phi mynhynniew.'
            };
            this.addChatBubble('ai', confirmMsgs[lang] || confirmMsgs['en'], '✅');
            this.speakWithEmotion(confirmMsgs[lang] || confirmMsgs['en'], 'happy');
        } else {
            alert('Please paste a valid Gemini API key (starts with AIza...)');
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Emotionally Tuned TTS
    // ─────────────────────────────────────────────────────────────────
    /**
     * Speak text with emotion-specific voice tuning
     * @param {string} text
     * @param {string} emotion — neutral|happy|confused|distressed|anxious|warm|calm
     * @param {Function} onComplete
     */
    speakWithEmotion(text, emotion = 'neutral', onComplete) {
        if (!this.synth || !text) return;
        this.synth.cancel();

        const lang = window.i18n ? window.i18n.getLang() : 'en';
        const ttsLang = this._getLangTTSCode(lang);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = ttsLang;

        // Assign best available voice
        const voice = this._getBestVoice(ttsLang);
        if (voice) utterance.voice = voice;

        // Emotion → prosody mapping
        const prosody = {
            neutral:    { rate: 0.88, pitch: 1.05, volume: 1.0 },
            happy:      { rate: 0.90, pitch: 1.15, volume: 1.0 },
            confused:   { rate: 0.80, pitch: 1.00, volume: 0.95 },
            distressed: { rate: 0.85, pitch: 0.95, volume: 1.0 },
            anxious:    { rate: 0.78, pitch: 1.00, volume: 0.9  },
            warm:       { rate: 0.82, pitch: 1.10, volume: 1.0  },
            calm:       { rate: 0.75, pitch: 1.05, volume: 0.9  }
        };

        const p = prosody[emotion] || prosody.neutral;
        utterance.rate   = p.rate;
        utterance.pitch  = p.pitch;
        utterance.volume = p.volume;

        if (onComplete) utterance.onend = onComplete;

        this.currentUtterance = utterance;
        this._updatePanelStatus('speaking');
        this.synth.speak(utterance);
    }

    /** Legacy speak() — wraps speakWithEmotion for backward compatibility */
    speak(text, onComplete) {
        this.speakWithEmotion(text, 'neutral', onComplete);
    }

    stopSpeaking() {
        if (this.synth) {
            this.synth.cancel();
            this._updatePanelStatus('idle');
        }
        clearTimeout(this.autoListenTimeout);
        this.conversationMode = false;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Caregiver Alert System
    // ─────────────────────────────────────────────────────────────────
    _triggerCaregiverAlert(patientText, intent, lang) {
        console.warn('[Caretaker] ESCALATION triggered:', intent, patientText);
        this.playChime('alert');

        // Log to caregiver dashboard
        if (window.caregiverDashboard?.addAlert) {
            window.caregiverDashboard.addAlert({
                type: 'distress',
                message: `Patient said: "${patientText}" (Intent: ${intent})`,
                ts: new Date().toISOString()
            });
        }

        // Visual notification
        const banner = document.getElementById('ai-alert-banner');
        if (banner) {
            banner.textContent = '⚠️ Patient needs attention — Caregiver notified';
            banner.classList.remove('hidden');
            setTimeout(() => banner.classList.add('hidden'), 8000);
        }
    }

    _triggerSundowningAlert(lang) {
        console.warn('[Caretaker] Sundowning behaviour detected');
        if (window.caregiverDashboard?.addAlert) {
            window.caregiverDashboard.addAlert({
                type: 'sundowning',
                message: 'Patient showing sundowning cues (wanting to "go home")',
                ts: new Date().toISOString()
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Proactive Check-In Scheduler
    // ─────────────────────────────────────────────────────────────────
    _startProactiveCheckIn() {
        // Every 15 minutes, give a gentle check-in if not in active conversation
        this.checkInInterval = setInterval(() => {
            if (!this.isListening && !this.synth.speaking) {
                const lang = window.i18n ? window.i18n.getLang() : 'en';
                const msg = window.aiCaretaker?.getProactiveCheckIn(lang);
                if (msg) {
                    this.addChatBubble('ai', msg, '🌿');
                    this.speakWithEmotion(msg, 'warm');
                }
            }
        }, 15 * 60 * 1000); // 15 minutes
    }

    // ─────────────────────────────────────────────────────────────────
    //  Chat Panel UI
    // ─────────────────────────────────────────────────────────────────
    /**
     * Open or close the floating conversation panel
     */
    toggleChatPanel(forceOpen = null) {
        const panel = document.getElementById('ai-chat-panel');
        if (!panel) return;

        this.chatOpen = forceOpen !== null ? forceOpen : !this.chatOpen;

        if (this.chatOpen) {
            panel.classList.remove('panel-hidden');
            panel.classList.add('panel-visible');
            this._scrollChatToBottom();
        } else {
            panel.classList.remove('panel-visible');
            panel.classList.add('panel-hidden');
            this.stopSpeaking();
        }
    }

    /**
     * Add a chat bubble to the conversation panel
     * @param {string} role — 'patient' | 'ai'
     * @param {string} text
     * @param {string} icon — emoji
     */
    addChatBubble(role, text, icon = '') {
        const lang = window.i18n ? window.i18n.getLang() : 'en';
        const honorific = window.CARETAKER_RESPONSES?.[lang]?.honorific || '';

        this.chatMessages.push({ role, text, icon, ts: Date.now() });
        if (this.chatMessages.length > 20) this.chatMessages.shift();

        const feed = document.getElementById('ai-chat-feed');
        if (!feed) return;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble chat-bubble-${role}`;

        const iconEl = document.createElement('span');
        iconEl.className = 'bubble-icon';
        iconEl.textContent = role === 'ai' ? '🤗' : '🙂';

        const textEl = document.createElement('div');
        textEl.className = 'bubble-text';
        textEl.textContent = text;

        const timeEl = document.createElement('div');
        timeEl.className = 'bubble-time';
        timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        bubble.appendChild(iconEl);
        bubble.appendChild(textEl);
        bubble.appendChild(timeEl);

        feed.appendChild(bubble);
        this._scrollChatToBottom();

        // Remove interim text if present
        const interim = document.getElementById('ai-interim-text');
        if (interim) interim.textContent = '';
    }

    _showInterimText(text) {
        const interim = document.getElementById('ai-interim-text');
        if (interim) interim.textContent = '🎙️ ' + text;
    }

    _scrollChatToBottom() {
        const feed = document.getElementById('ai-chat-feed');
        if (feed) {
            setTimeout(() => { feed.scrollTop = feed.scrollHeight; }, 50);
        }
    }

    _updatePanelStatus(status) {
        // status: idle | listening | thinking | speaking
        const statusEl = document.getElementById('ai-panel-status');
        const micBtn = document.getElementById('voice-assistant-mic-btn');

        const statusConfig = {
            idle:      { text: '',              class: 'status-idle',      icon: '🎙️' },
            listening: { text: 'Listening...',  class: 'status-listening', icon: '🔴' },
            thinking:  { text: 'Thinking...',   class: 'status-thinking',  icon: '💭' },
            speaking:  { text: 'Speaking...',   class: 'status-speaking',  icon: '🔊' }
        };

        const cfg = statusConfig[status] || statusConfig.idle;

        if (statusEl) {
            statusEl.textContent = cfg.text;
            statusEl.className = `ai-panel-status ${cfg.class}`;
        }

        if (micBtn) {
            const iconSpan = micBtn.querySelector('.mic-icon');
            if (iconSpan) iconSpan.textContent = cfg.icon;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Reminiscence Trigger (accessible from UI button)
    // ─────────────────────────────────────────────────────────────────
    triggerReminiscence() {
        const lang = window.i18n ? window.i18n.getLang() : 'en';
        if (window.reminiscenceEngine) {
            if (!this.chatOpen) this.toggleChatPanel(true);
            window.reminiscenceEngine.triggerReminiscence(lang, false);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Web Audio Harmonic Sound Generator (preserved from original)
    // ─────────────────────────────────────────────────────────────────
    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    playChime(type) {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;

            if (type === 'success' || type === 'praise') {
                const freqs = [392.00, 493.88, 587.33];
                freqs.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                    gain.gain.setValueAtTime(0, now + idx * 0.12);
                    gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.12);
                    osc.stop(now + idx * 0.12 + 0.65);
                });
            } else if (type === 'tap' || type === 'select') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.09);
            } else if (type === 'water') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.36);
            } else if (type === 'flute_breathe') {
                const osc = ctx.createOscillator();
                const vibrato = ctx.createOscillator();
                const vibratoGain = ctx.createGain();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(329.63, now);
                vibrato.frequency.setValueAtTime(4.5, now);
                vibratoGain.gain.setValueAtTime(4, now);
                vibrato.connect(osc.frequency);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.18, now + 1.2);
                gain.gain.linearRampToValueAtTime(0.18, now + 3.0);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
                osc.connect(gain); gain.connect(ctx.destination);
                vibrato.start(now); osc.start(now);
                osc.stop(now + 4.6); vibrato.stop(now + 4.6);
            } else if (type === 'listen') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.12);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.32);
            } else if (type === 'alert') {
                // Two-tone alert for escalation
                [440, 550].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, now + i * 0.25);
                    gain.gain.setValueAtTime(0.12, now + i * 0.25);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.22);
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.start(now + i * 0.25); osc.stop(now + i * 0.25 + 0.23);
                });
            }
        } catch (e) {
            console.warn('[VoiceAssistant] Audio error:', e);
        }
    }
}

window.voiceAssistant = new VoiceAssistant();

window.showGeminiKeyModal = function() {
    if (window.voiceAssistant) {
        window.voiceAssistant._showApiKeyPrompt();
    } else {
        const modal = document.getElementById('gemini-key-modal');
        if (modal) modal.classList.remove('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistant?.updateApiKeyUI();
});

