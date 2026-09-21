/**
 * Game 3: Daily Routine Recall Sequencer (দৈনন্দিন কাম)
 * Culturally tailored for daily life in the North East:
 * Step 1: Morning Lal Chai (ৰাতিপুৱাৰ ৰঙা চাহ)
 * Step 2: Fresh Morning Water & Medicine (পুৱাৰ পানী আৰু দৰব)
 * Step 3: Walking in Garden & Sunshine (বাগিচাত খোজ কঢ়া আৰু ৰ'দ)
 * Step 4: Nutritious Midday Meal (দুপৰীয়াৰ ভাত-আঞ্জা)
 * Step 5: Evening Prayer / Namghar (সন্ধিয়াৰ নামঘৰ বা প্ৰাৰ্থনা)
 * Step 6: Peaceful Night Rest (ৰাতিৰ শান্তিৰ নিদ্ৰা)
 */

class RoutineSequenceGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentSteps = [];
        this.placedSteps = [];
        this.allSteps = [
            { id: 'chai', order: 1, icon: '☕', label: 'ৰাতিপুৱাৰ ৰঙা চাহ', sub: 'Morning Lal Chai' },
            { id: 'medicine', order: 2, icon: '💊', label: 'পুৱাৰ পানী আৰু দৰব', sub: 'Water & Morning Medicine' },
            { id: 'walk', order: 3, icon: '🌱', label: 'বাগিচাত খোজ কঢ়া', sub: 'Garden Walk & Sunlight' },
            { id: 'lunch', order: 4, icon: '🍲', label: 'দুপৰীয়াৰ আহাৰ', sub: 'Midday Meal' },
            { id: 'namghar', order: 5, icon: '🪔', label: 'সন্ধিয়াৰ নামঘৰ / প্ৰাৰ্থনা', sub: 'Evening Prayer' },
            { id: 'sleep', order: 6, icon: '🌙', label: 'ৰাতিৰ শান্তিৰ জিৰণি', sub: 'Night Rest & Sleep' }
        ];
        this.level = 1;
        this.startTime = null;
    }

    init(level = 1) {
        this.level = level;
        this.placedSteps = [];

        // Level 1: 3 steps
        // Level 2: 4 steps
        // Level 3: 5 steps
        const count = level === 1 ? 3 : (level === 2 ? 4 : 5);
        this.currentSteps = this.allSteps.slice(0, count);

        // Scramble available pool
        this.availablePool = [...this.currentSteps].sort(() => 0.5 - Math.random());

        if (window.cogniAdapt) {
            window.cogniAdapt.startSession('routine-sequence', this.level);
        }

        this.renderGame();

        if (window.voiceAssistant && window.i18n) {
            window.voiceAssistant.speak(window.i18n.t('game3Title') + ". " + window.i18n.t('game3Desc'));
        }
    }

    renderGame() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-game-back" onclick="window.appNav.showScreen('games-screen')">← ${window.i18n ? window.i18n.t('backToHome') : 'Back'}</button>
                <div class="game-title-group">
                    <h2>${window.i18n ? window.i18n.t('game3Title') : 'Daily Routine Sequencer'}</h2>
                    <p class="game-inst-text">${window.i18n ? window.i18n.t('game3Desc') : 'Arrange the day activities from morning to evening'}</p>
                </div>
                <button class="btn-audio-guide" onclick="window.routineSequence.readInstructions()">🔊 ${window.i18n ? window.i18n.t('speakInstructions') : 'Listen'}</button>
            </div>

            <div class="routine-game-stage">
                <!-- Timeline Slots -->
                <div class="routine-timeline-slots">
                    ${this.currentSteps.map((step, idx) => `
                        <div class="timeline-slot ${this.placedSteps[idx] ? 'slot-filled' : 'slot-empty'}" id="slot-${idx}">
                            <div class="slot-number-badge">খোজ ${idx + 1}</div>
                            ${this.placedSteps[idx] ? `
                                <div class="placed-card">
                                    <span class="placed-icon">${this.placedSteps[idx].icon}</span>
                                    <span class="placed-title">${this.placedSteps[idx].label}</span>
                                </div>
                            ` : `
                                <div class="slot-placeholder">
                                    <span>👉 পৰৱৰ্তী কামটো ইয়াত বাছক</span>
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>

                <!-- Available Cards to Tap -->
                <div class="routine-choices-header">
                    <h3>তলৰ কামটো বাছি লওক (Tap the next step):</h3>
                </div>
                <div class="routine-choices-grid" id="routine-choices-grid">
                    ${this.availablePool.map((item, idx) => `
                        <button class="routine-choice-btn" id="routine-choice-${idx}" onclick="window.routineSequence.selectChoice(${idx})">
                            <span class="choice-icon">${item.icon}</span>
                            <span class="choice-title">${item.label}</span>
                            <span class="choice-sub">${item.sub}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div id="routine-congrats-modal" class="congrats-banner hidden">
                <div class="congrats-content">
                    <span class="congrats-star">🌅</span>
                    <h3>${window.i18n ? window.i18n.t('wellDone') : 'Well Done!'}</h3>
                    <p>দিনটোৰ কামবোৰ কিমান সুন্দৰকৈ সজাই ল'লে! আপোনাৰ স্মৃতিশক্তি অতি উজ্জ্বল।</p>
                    <button class="btn-next-round" onclick="window.routineSequence.nextRound()">▶ ${window.i18n ? window.i18n.t('navGames') : 'Next'}</button>
                </div>
            </div>
        `;

        this.startTime = Date.now();
    }

    readInstructions() {
        if (window.voiceAssistant && window.i18n) {
            window.voiceAssistant.speak(window.i18n.t('game3Title') + ". " + window.i18n.t('game3Desc'));
        }
    }

    selectChoice(choiceIndex) {
        const item = this.availablePool[choiceIndex];
        if (!item) return;

        const nextSlotIdx = this.placedSteps.length;
        const expectedStep = this.currentSteps[nextSlotIdx];

        const latency = Date.now() - (this.startTime || Date.now());
        this.startTime = Date.now();

        if (item.id === expectedStep.id) {
            // Correct sequential move
            this.placedSteps.push(item);
            this.availablePool.splice(choiceIndex, 1);

            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('success');
                window.voiceAssistant.speak(item.label);
            }

            if (window.cogniAdapt) {
                window.cogniAdapt.recordAction('sequence_step', true, latency, { stepId: item.id, slot: nextSlotIdx });
            }

            this.renderGame();

            if (this.placedSteps.length >= this.currentSteps.length) {
                setTimeout(() => this.celebrateCompletion(), 700);
            }
        } else {
            // Gentle encouragement, no penalty
            const btn = document.getElementById(`routine-choice-${choiceIndex}`);
            if (btn) {
                btn.classList.add('gentle-wobble');
                setTimeout(() => btn.classList.remove('gentle-wobble'), 600);
            }

            if (window.voiceAssistant) {
                window.voiceAssistant.speak(window.i18n ? window.i18n.t('gentleCheer') : "Take your time.");
            }

            if (window.cogniAdapt) {
                window.cogniAdapt.recordAction('sequence_step', false, latency, { tried: item.id, expected: expectedStep.id });
            }
        }
    }

    celebrateCompletion() {
        if (window.cogniAdapt) {
            window.cogniAdapt.finishSession({ stepsCompleted: this.placedSteps.length, level: this.level });
        }

        const banner = document.getElementById('routine-congrats-modal');
        if (banner) {
            banner.classList.remove('hidden');
            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('praise');
            }
        }
    }

    nextRound() {
        const nextLvl = this.level < 3 ? this.level + 1 : 1;
        this.init(nextLvl);
    }
}

window.RoutineSequenceGame = RoutineSequenceGame;
