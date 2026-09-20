/**
 * Voice Assistant ("Aai / Baideo Companion") & Harmonic Audio Synthesizer
 * Provides:
 * 1. Multilingual Speech Synthesis for instructions, reminiscence stories & reminders
 * 2. Voice command recognition (hands-free navigation)
 * 3. 100% Offline Web Audio API synthesis:
 *    - Bamboo Flute meditative tones
 *    - Warm gentle bell chime for correct actions
 *    - Gentle water drop chime
 *    - Traditional soothing dhol rhythm pulse
 */

class VoiceAssistant {
    constructor() {
        this.synth = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.audioCtx = null;
        this.soundEnabled = true;
        this.currentUtterance = null;
        this.initRecognition();
    }

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

    initRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            this.recognition = new SpeechRec();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript.toLowerCase();
                console.log("Voice command detected:", text);
                this.handleVoiceCommand(text);
                this.setListeningState(false);
            };

            this.recognition.onerror = (e) => {
                console.warn("Speech recognition notice:", e.error);
                this.setListeningState(false);
            };

            this.recognition.onend = () => {
                this.setListeningState(false);
            };
        }
    }

    toggleListening() {
        if (!this.recognition) {
            this.speak("Voice recognition is not supported in this browser, but you can tap the big buttons.");
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            this.setListeningState(false);
        } else {
            const lang = window.i18n ? window.i18n.getLang() : 'as';
            const langCodeMap = {
                as: 'as-IN', bn: 'bn-IN', hi: 'hi-IN', en: 'en-IN',
                mni: 'mni-IN', brx: 'hi-IN', lus: 'en-IN', kha: 'en-IN'
            };
            this.recognition.lang = langCodeMap[lang] || 'en-IN';
            try {
                this.recognition.start();
                this.setListeningState(true);
                this.playChime('listen');
            } catch (err) {
                console.warn("Recognition start err:", err);
            }
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

    handleVoiceCommand(cmd) {
        // Simple natural language matching across languages
        if (cmd.includes('home') || cmd.includes('ঘৰ') || cmd.includes('घर') || cmd.includes('in lam')) {
            window.appNav && window.appNav.showScreen('home-screen');
            this.speak("Going home.");
        } else if (cmd.includes('game') || cmd.includes('খেল') || cmd.includes('খেলা') || cmd.includes('खेल') || cmd.includes('infiam')) {
            window.appNav && window.appNav.showScreen('games-screen');
            this.speak("Opening cognitive games.");
        } else if (cmd.includes('water') || cmd.includes('পানী') || cmd.includes('জল') || cmd.includes('पानी') || cmd.includes('tui')) {
            window.reminders && window.reminders.recordWaterIntake();
            this.speak("Recorded water intake. Stay hydrated!");
        } else if (cmd.includes('medicine') || cmd.includes('দৰব') || cmd.includes('ওষুধ') || cmd.includes('दवा') || cmd.includes('damdawi')) {
            window.appNav && window.appNav.showScreen('reminders-screen');
            this.speak("Opening medication schedule.");
        } else if (cmd.includes('calm') || cmd.includes('শান্তি') || cmd.includes('शांति') || cmd.includes('breathe')) {
            window.appNav && window.appNav.showScreen('wellness-screen');
            this.speak("Let's take a calm breath together.");
        } else {
            this.speak("I heard you. How can I help you, Aita?");
        }
    }

    speak(text, onComplete) {
        if (!this.synth) return;

        // Cancel previous speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const lang = window.i18n ? window.i18n.getLang() : 'as';
        const langMap = {
            as: 'as-IN', bn: 'bn-IN', hi: 'hi-IN', en: 'en-IN',
            brx: 'hi-IN', mni: 'bn-IN', lus: 'en-IN', kha: 'en-IN'
        };

        utterance.lang = langMap[lang] || 'en-IN';
        utterance.rate = 0.88; // Gentle, slower tempo for elderly dementia patients
        utterance.pitch = 1.05; // Warm, friendly pitch

        if (onComplete) {
            utterance.onend = onComplete;
        }

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    stopSpeaking() {
        if (this.synth) {
            this.synth.cancel();
        }
    }

    // ==========================================
    // Web Audio Harmonic Sound Generator
    // ==========================================

    playChime(type) {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;

            if (type === 'success' || type === 'praise') {
                // Warm celebratory pentatonic harmony (G4 - B4 - D5)
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
                // Gentle wooden click
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.09);
            } else if (type === 'water') {
                // Soothing water drop frequency swoop
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);

                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.36);
            } else if (type === 'flute_breathe') {
                // Deep resonant bamboo flute meditative tone (E4 / 329.6 Hz with gentle vibrato)
                const osc = ctx.createOscillator();
                const vibrato = ctx.createOscillator();
                const vibratoGain = ctx.createGain();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(329.63, now);

                vibrato.frequency.setValueAtTime(4.5, now); // 4.5Hz gentle vibrato
                vibratoGain.gain.setValueAtTime(4, now);

                vibrato.connect(osc.frequency);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.18, now + 1.2);
                gain.gain.linearRampToValueAtTime(0.18, now + 3.0);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

                osc.connect(gain);
                gain.connect(ctx.destination);

                vibrato.start(now);
                osc.start(now);
                osc.stop(now + 4.6);
                vibrato.stop(now + 4.6);
            } else if (type === 'listen') {
                // Soft double notification tone
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.12);

                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.32);
            }
        } catch (e) {
            console.warn("Audio chime context notice:", e);
        }
    }
}

window.voiceAssistant = new VoiceAssistant();
