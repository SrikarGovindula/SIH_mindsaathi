/**
 * Smriti-NER Master Application Coordinator
 * Handles:
 * - Elderly-friendly Screen Routing
 * - Accessibility Controls (Font Size, High Contrast, Audio)
 * - Multilingual Language Switcher
 * - Time & Greeting Updates
 */

class AppNavigator {
    constructor() {
        this.currentScreen = 'home-screen';
        this.fontSizeLevel = parseInt(localStorage.getItem('smriti_font_size') || '1'); // 1 = Normal, 2 = Large, 3 = Extra Large
        this.highContrast = localStorage.getItem('smriti_high_contrast') === 'true';
    }

    init() {
        this.applyAccessibilitySettings();
        this.updateHeaderTimeAndGreeting();
        this.bindEvents();

        // Check if caregiver screen was requested via URL hash or default
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            this.showScreen(hash);
        } else {
            this.showScreen('home-screen');
        }

        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }

        // Initial voice greeting
        setTimeout(() => {
            if (window.voiceAssistant && window.i18n) {
                const greeting = this.getGreetingText();
                window.voiceAssistant.speak(greeting);
            }
        }, 800);
    }

    bindEvents() {
        // Language selector change
        const langSelect = document.getElementById('lang-selector');
        if (langSelect) {
            langSelect.value = window.i18n ? window.i18n.getLang() : 'as';
            langSelect.addEventListener('change', (e) => {
                if (window.i18n) {
                    window.i18n.setLanguage(e.target.value);
                }
            });
        }

        window.addEventListener('languageChanged', () => {
            this.updateHeaderTimeAndGreeting();
            if (window.reminders) {
                window.reminders.renderRemindersUI();
            }
            if (window.caregiverDashboard) {
                window.caregiverDashboard.renderCognitiveRadar();
            }
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));

        // Show target screen
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('fade-in');
            this.currentScreen = screenId;
            window.location.hash = screenId;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Screen-specific hooks
            if (screenId === 'reminders-screen' && window.reminders) {
                window.reminders.renderRemindersUI();
            } else if (screenId === 'caregiver-screen' && window.caregiverDashboard) {
                window.caregiverDashboard.init();
            } else if (screenId === 'wellness-screen' && window.calmBreathing) {
                window.calmBreathing.init();
            }
        }
    }

    launchGame(gameKey) {
        this.showScreen('game-active-container');
        const container = document.getElementById('game-active-container');
        if (!container) return;

        container.innerHTML = '';

        if (gameKey === 'memory-match') {
            window.memoryMatch = new MemoryMatchGame('game-active-container');
            window.memoryMatch.init(1);
        } else if (gameKey === 'tea-garden') {
            window.teaGarden = new TeaGardenGame('game-active-container');
            window.teaGarden.init(1);
        } else if (gameKey === 'routine-sequence') {
            window.routineSequence = new RoutineSequenceGame('game-active-container');
            window.routineSequence.init(1);
        } else if (gameKey === 'pattern-weave') {
            window.patternWeave = new PatternWeaveGame('game-active-container');
            window.patternWeave.init(1);
        } else if (gameKey === 'calm-breathing') {
            window.calmBreathing = new CalmBreathingModule('game-active-container');
            window.calmBreathing.init();
        }
    }

    cycleFontSize() {
        this.fontSizeLevel = (this.fontSizeLevel % 3) + 1;
        localStorage.setItem('smriti_font_size', this.fontSizeLevel);
        this.applyAccessibilitySettings();
        if (window.voiceAssistant) {
            const labels = { 1: "Regular size", 2: "Large font size", 3: "Extra large font size" };
            window.voiceAssistant.speak(labels[this.fontSizeLevel]);
        }
    }

    toggleHighContrast() {
        this.highContrast = !this.highContrast;
        localStorage.setItem('smriti_high_contrast', this.highContrast);
        this.applyAccessibilitySettings();
        if (window.voiceAssistant) {
            window.voiceAssistant.speak(this.highContrast ? "High contrast on" : "Normal contrast on");
        }
    }

    applyAccessibilitySettings() {
        const body = document.body;

        // Font size classes
        body.classList.remove('font-size-1', 'font-size-2', 'font-size-3');
        body.classList.add(`font-size-${this.fontSizeLevel}`);

        // High contrast class
        if (this.highContrast) {
            body.classList.add('high-contrast-mode');
        } else {
            body.classList.remove('high-contrast-mode');
        }

        const contrastBtn = document.getElementById('btn-contrast-toggle');
        if (contrastBtn) {
            contrastBtn.setAttribute('aria-pressed', this.highContrast.toString());
        }
    }

    getGreetingText() {
        const hour = new Date().getHours();
        if (hour < 12) {
            return window.i18n ? window.i18n.t('greetingMorning') : 'Good morning!';
        } else if (hour < 17) {
            return window.i18n ? window.i18n.t('greetingAfternoon') : 'Good afternoon!';
        } else {
            return window.i18n ? window.i18n.t('greetingEvening') : 'Good evening!';
        }
    }

    updateHeaderTimeAndGreeting() {
        const greetingEl = document.getElementById('header-greeting-text');
        const dateEl = document.getElementById('header-date-text');

        if (greetingEl) {
            greetingEl.textContent = this.getGreetingText();
        }

        if (dateEl) {
            const now = new Date();
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            const dateStr = now.toLocaleDateString(undefined, options);
            dateEl.textContent = dateStr;
        }
    }

    emergencyCaregiverCall() {
        if (window.voiceAssistant) {
            window.voiceAssistant.playChime('praise');
            window.voiceAssistant.speak("Calling your caregiver now, Aita. Please stay comfortable.");
        }
        alert("📞 Calling Primary Caregiver / Village ASHA Worker (+91 94350-XXXXX)... Alert notification sent!");
    }
}

window.appNav = new AppNavigator();

document.addEventListener('DOMContentLoaded', () => {
    window.appNav.init();
});
