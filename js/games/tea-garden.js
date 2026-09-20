/**
 * Game 2: Cha Bagan Tapping (চা বাগান) — Attention & Concentration Game
 * Theme: Lush tea gardens of Assam, Tripura & North-East
 * Task: Sustained visual attention — identify and gently tap the golden fresh tea buds
 * Non-punitive: no countdown timer, gentle tea-basket filling mechanic
 */

class TeaGardenGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.pluckedCount = 0;
        this.targetCount = 5;
        this.level = 1;
        this.bushes = [];
        this.startTime = null;
    }

    init(level = 1) {
        this.level = level;
        this.pluckedCount = 0;
        this.targetCount = level === 1 ? 4 : (level === 2 ? 6 : 8);

        if (window.cogniAdapt) {
            window.cogniAdapt.startSession('tea-garden', this.level);
        }

        this.renderGame();

        if (window.voiceAssistant && window.i18n) {
            window.voiceAssistant.speak(window.i18n.t('game2Title') + ". " + window.i18n.t('game2Desc'));
        }
    }

    renderGame() {
        if (!this.container) return;

        // Generate tea bushes with targets and gentle distractors
        const totalItems = this.level === 1 ? 6 : (this.level === 2 ? 8 : 10);
        const bushItems = [];

        for (let i = 0; i < this.targetCount; i++) {
            bushItems.push({ type: 'golden_bud', icon: '🌱', label: 'সোণালী কুঁহি', isTarget: true, id: 'bud_' + i });
        }
        for (let i = bushItems.length; i < totalItems; i++) {
            bushItems.push({ type: 'dry_leaf', icon: '🍂', label: 'শুকান পাত', isTarget: false, id: 'dry_' + i });
        }
        bushItems.sort(() => 0.5 - Math.random());
        this.bushes = bushItems;

        this.container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-game-back" onclick="window.appNav.showScreen('games-screen')">← ${window.i18n ? window.i18n.t('backToHome') : 'Back'}</button>
                <div class="game-title-group">
                    <h2>${window.i18n ? window.i18n.t('game2Title') : 'Tea Garden'}</h2>
                    <p class="game-inst-text">${window.i18n ? window.i18n.t('game2Desc') : 'Gently pluck the tender golden buds'}</p>
                </div>
                <button class="btn-audio-guide" onclick="window.teaGarden.readInstructions()">🔊 ${window.i18n ? window.i18n.t('speakInstructions') : 'Listen'}</button>
            </div>

            <div class="tea-garden-stage">
                <div class="tea-garden-basket-bar">
                    <span class="basket-icon">🧺</span>
                    <span class="basket-title">ডলা / খৰাহী (Tea Basket):</span>
                    <span class="basket-score" id="tea-basket-score">${this.pluckedCount} / ${this.targetCount}</span>
                </div>

                <div class="tea-bushes-grid" id="tea-bushes-grid">
                    ${this.bushes.map((item, idx) => `
                        <button class="tea-bush-card ${item.isTarget ? 'target-bud' : 'distractor'}" 
                                id="tea-item-${idx}" 
                                onclick="window.teaGarden.handlePluck(${idx})"
                                aria-label="${item.isTarget ? 'Fresh tea bud' : 'Dry leaf'}">
                            <span class="tea-item-emoji">${item.icon}</span>
                            <span class="tea-item-sub">${item.isTarget ? 'দুটি পাত এটি কুঁহি' : 'জিৰণি'}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div id="tea-congrats-modal" class="congrats-banner hidden">
                <div class="congrats-content">
                    <span class="congrats-star">🍃</span>
                    <h3>${window.i18n ? window.i18n.t('wellDone') : 'Well Done!'}</h3>
                    <p>চা বাগানৰ খৰাহী ভৰি পৰিল! আপুনি বৰ সুন্দৰকৈ মনোযোগ দিলে।</p>
                    <button class="btn-next-round" onclick="window.teaGarden.nextRound()">▶ ${window.i18n ? window.i18n.t('navGames') : 'Next'}</button>
                </div>
            </div>
        `;

        this.startTime = Date.now();
    }

    readInstructions() {
        if (window.voiceAssistant && window.i18n) {
            window.voiceAssistant.speak(window.i18n.t('game2Title') + ". " + window.i18n.t('game2Desc') + ". " + window.i18n.t('takeYourTime'));
        }
    }

    handlePluck(index) {
        const item = this.bushes[index];
        const btn = document.getElementById(`tea-item-${index}`);
        if (!item || !btn || btn.classList.contains('plucked')) return;

        const latency = Date.now() - (this.startTime || Date.now());
        this.startTime = Date.now();

        if (item.isTarget) {
            btn.classList.add('plucked');
            this.pluckedCount++;

            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('tap');
            }

            const scoreEl = document.getElementById('tea-basket-score');
            if (scoreEl) {
                scoreEl.textContent = `${this.pluckedCount} / ${this.targetCount}`;
            }

            if (window.cogniAdapt) {
                window.cogniAdapt.recordAction('tea_bud_pluck', true, latency, { budId: item.id });
            }

            if (this.pluckedCount >= this.targetCount) {
                setTimeout(() => this.celebrateCompletion(), 800);
            }
        } else {
            // Gentle cue, no red buzzer or penalty
            btn.classList.add('gentle-wobble');
            setTimeout(() => btn.classList.remove('gentle-wobble'), 600);

            if (window.cogniAdapt) {
                window.cogniAdapt.recordAction('tea_bud_pluck', false, latency, { leafId: item.id });
            }
        }
    }

    celebrateCompletion() {
        if (window.cogniAdapt) {
            window.cogniAdapt.finishSession({ plucked: this.pluckedCount, level: this.level });
        }

        const banner = document.getElementById('tea-congrats-modal');
        if (banner) {
            banner.classList.remove('hidden');
            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('praise');
                window.voiceAssistant.speak(window.i18n ? window.i18n.t('wellDone') : "Well done!");
            }
        }
    }

    nextRound() {
        const nextLvl = this.level < 3 ? this.level + 1 : 1;
        this.init(nextLvl);
    }
}

window.TeaGardenGame = TeaGardenGame;
