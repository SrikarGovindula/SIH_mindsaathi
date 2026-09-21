/**
 * Game 5 / Module: Monor Xanti (মনৰ শান্তি) — Emotional Well-Being & Breathing Therapy
 * Features:
 * 1. Gentle guided respiration (Breathe in / Breathe out) with expanding lotus visual
 * 2. Harmonic bamboo flute tones using Web Audio API
 * 3. Daily emotional mood check-in logged to caregiver dashboard
 * 4. Regional comforting proverbs & affirmations
 */

class CalmBreathingModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isBreathingActive = false;
        this.breathInterval = null;
        this.breathPhase = 'in'; // 'in' or 'out'
        this.proverbs = [
            "পানী বাঢ়িলে পাৰ ভাঙিব পাৰে, কিন্তু মন স্থিৰ থাকিলে সকলো সহজ হৈ পৰে।",
            "ধীৰে ধীৰে বতাহ বলিলে বাঁহৰ পাতবোৰ যেনেকৈ হালি পৰে, আপোনাৰ মনটোও শান্ত হৈ পৰক।",
            "আপুনি অতি আদৰৰ, আপোনাৰ হাঁহিটোৱে আমাৰ পৰিয়ালটো উজ্জ্বল কৰি ৰাখে।",
            "Brahmaputra's gentle waters bring calm and serenity to your heart."
        ];
    }

    init() {
        this.render();
        if (window.voiceAssistant && window.i18n) {
            window.voiceAssistant.speak(window.i18n.t('game5Title') + ". " + window.i18n.t('game5Desc'));
        }
    }

    render() {
        if (!this.container) return;

        const randomProverb = this.proverbs[Math.floor(Math.random() * this.proverbs.length)];

        this.container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-game-back" onclick="window.appNav.showScreen('games-screen')">← ${window.i18n ? window.i18n.t('backToHome') : 'Back'}</button>
                <div class="game-title-group">
                    <h2>${window.i18n ? window.i18n.t('game5Title') : 'Peaceful Breath'}</h2>
                    <p class="game-inst-text">বাঁহীৰ সুৰ আৰু বতাহৰ লগত শান্তভাৱে উশাহ লওক</p>
                </div>
            </div>

            <div class="calm-screen-container">
                <!-- Mood Check-in Section -->
                <div class="mood-checkin-card">
                    <h3>আজি আপোনাৰ মনটো কেনে লাগিছে? (How are you feeling today?)</h3>
                    <div class="mood-emojis-row">
                        <button class="mood-btn" onclick="window.calmBreathing.logMood('happy', '😊 আনন্দিত')">
                            <span class="mood-face">😊</span>
                            <span class="mood-text">আনন্দিত</span>
                        </button>
                        <button class="mood-btn" onclick="window.calmBreathing.logMood('peaceful', '😌 শান্ত')">
                            <span class="mood-face">😌</span>
                            <span class="mood-text">শান্ত</span>
                        </button>
                        <button class="mood-btn" onclick="window.calmBreathing.logMood('neutral', '😐 সাধাৰণ')">
                            <span class="mood-face">😐</span>
                            <span class="mood-text">সাধাৰণ</span>
                        </button>
                        <button class="mood-btn" onclick="window.calmBreathing.logMood('tired', '😴 ভাগৰুৱা')">
                            <span class="mood-face">😴</span>
                            <span class="mood-text">ভাগৰুৱা</span>
                        </button>
                        <button class="mood-btn" onclick="window.calmBreathing.logMood('confused', '😟 অস্থিৰ')">
                            <span class="mood-face">😟</span>
                            <span class="mood-text">অস্থিৰ</span>
                        </button>
                    </div>
                    <div id="mood-recorded-feedback" class="mood-feedback hidden"></div>
                </div>

                <!-- Guided Breathing Circle -->
                <div class="breathing-circle-wrapper">
                    <div class="breathing-circle" id="breathing-circle">
                        <span class="breathe-flower">🪷</span>
                        <span class="breathe-instruction-text" id="breathe-text">উশাহ লওক<br><small>(Breathe In)</small></span>
                    </div>
                </div>

                <div class="breathing-controls">
                    <button class="btn-primary-action" id="btn-start-breath" onclick="window.calmBreathing.toggleBreathing()">
                        🎶 বাঁহীৰ সুৰেৰে উশাহ-নিশাহ আৰম্ভ কৰক
                    </button>
                </div>

                <!-- Uplifting Comfort Card -->
                <div class="comfort-quote-card">
                    <span class="quote-symbol">🌸</span>
                    <p class="quote-text">${randomProverb}</p>
                </div>
            </div>
        `;
    }

    logMood(moodKey, moodLabel) {
        if (window.voiceAssistant) {
            window.voiceAssistant.playChime('tap');
            window.voiceAssistant.speak(moodLabel + ". আপোনাৰ মনটো সদায় ভালে থাকক।");
        }

        const fb = document.getElementById('mood-recorded-feedback');
        if (fb) {
            fb.textContent = `আপোনাৰ অনুভূতি সংৰক্ষিত হ'ল: ${moodLabel}`;
            fb.classList.remove('hidden');
        }

        if (window.storageDB) {
            window.storageDB.saveReminderLog({
                id: 'mood-' + Date.now(),
                type: 'mood_checkin',
                mood: moodKey,
                label: moodLabel,
                timestamp: Date.now()
            });
        }
    }

    toggleBreathing() {
        if (this.isBreathingActive) {
            this.stopBreathing();
        } else {
            this.startBreathing();
        }
    }

    startBreathing() {
        this.isBreathingActive = true;
        const btn = document.getElementById('btn-start-breath');
        if (btn) btn.textContent = '⏸ জিৰণি লওক (Pause)';

        const circle = document.getElementById('breathing-circle');
        const text = document.getElementById('breathe-text');

        this.breathPhase = 'in';
        if (circle) circle.className = 'breathing-circle breathe-expand';
        if (text) text.innerHTML = 'উশাহ লওক<br><small>(Breathe In)</small>';

        if (window.voiceAssistant) {
            window.voiceAssistant.playChime('flute_breathe');
        }

        this.breathInterval = setInterval(() => {
            if (this.breathPhase === 'in') {
                this.breathPhase = 'out';
                if (circle) circle.className = 'breathing-circle breathe-contract';
                if (text) text.innerHTML = 'উশাহ এৰি দিয়ক<br><small>(Breathe Out)</small>';
            } else {
                this.breathPhase = 'in';
                if (circle) circle.className = 'breathing-circle breathe-expand';
                if (text) text.innerHTML = 'উশাহ লওক<br><small>(Breathe In)</small>';
                if (window.voiceAssistant) {
                    window.voiceAssistant.playChime('flute_breathe');
                }
            }
        }, 4500);
    }

    stopBreathing() {
        this.isBreathingActive = false;
        clearInterval(this.breathInterval);
        const btn = document.getElementById('btn-start-breath');
        if (btn) btn.textContent = '🎶 বাঁহীৰ সুৰেৰে উশাহ-নিশাহ আৰম্ভ কৰক';

        const circle = document.getElementById('breathing-circle');
        const text = document.getElementById('breathe-text');
        if (circle) circle.className = 'breathing-circle';
        if (text) text.innerHTML = 'মন শান্ত হ\'ল<br><small>(Peaceful Mind)</small>';
    }
}

window.CalmBreathingModule = CalmBreathingModule;
