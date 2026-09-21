/**
 * Game 1: Smriti Mel (স্মৃতি মিল) — Cultural Memory & Reminiscence Match
 * Features:
 * - Traditional North Eastern heritage items
 * - Reminiscence therapy: Voice audio story upon discovery
 * - Adaptive difficulty (2x2 -> 2x3 -> 3x4)
 * - Dignity-first non-punitive feedback
 */

class MemoryMatchGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 3;
        this.level = 1;
        this.isLocked = false;
        this.cardStartTime = null;

        this.culturalItems = [
            { id: 'jaapi', icon: '👒', color: '#D35400', key: 'jaapi' },
            { id: 'dhol', icon: '🥁', color: '#C0392B', key: 'dhol' },
            { id: 'pepa', icon: '🎺', color: '#7D6608', key: 'pepa' },
            { id: 'rhino', icon: '🦏', color: '#27AE60', key: 'rhino' },
            { id: 'gamusa', icon: '🧣', color: '#B03A2E', key: 'gamusa' },
            { id: 'majuli_mask', icon: '🎭', color: '#8E44AD', key: 'majuli_mask' },
            { id: 'tea_leaves', icon: '🍃', color: '#229954', key: 'tea_leaves' },
            { id: 'hornbill', icon: '🦜', color: '#E67E22', key: 'hornbill' },
            { id: 'sangai', icon: '🦌', color: '#2980B9', key: 'sangai' }
        ];
    }

    init(level = 1) {
        this.level = level;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.isLocked = false;

        // Level determines number of pairs:
        // Level 1: 2 pairs (4 cards total, 2x2 grid) - Gentle starter
        // Level 2: 3 pairs (6 cards total, 2x3 grid) - Balanced
        // Level 3: 4 pairs (8 cards total, 2x4 grid) - Advanced
        if (level === 1) this.totalPairs = 2;
        else if (level === 2) this.totalPairs = 3;
        else this.totalPairs = 4;

        if (window.cogniAdapt) {
            window.cogniAdapt.startSession('memory-match', this.level);
        }

        this.renderGame();

        // Speak initial prompt
        if (window.voiceAssistant && window.i18n) {
            window.voiceAssistant.speak(window.i18n.t('game1Title') + ". " + window.i18n.t('takeYourTime'));
        }
    }

    renderGame() {
        if (!this.container) return;

        // Pick random cultural items
        const shuffledPool = [...this.culturalItems].sort(() => 0.5 - Math.random());
        const selected = shuffledPool.slice(0, this.totalPairs);

        // Duplicate for pairs and shuffle
        const cardDeck = [];
        selected.forEach(item => {
            cardDeck.push({ ...item, uid: item.id + '_a' });
            cardDeck.push({ ...item, uid: item.id + '_b' });
        });
        cardDeck.sort(() => 0.5 - Math.random());
        this.cards = cardDeck;

        this.container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-game-back" onclick="window.appNav.showScreen('games-screen')">← ${window.i18n ? window.i18n.t('backToHome') : 'Back'}</button>
                <div class="game-title-group">
                    <h2>${window.i18n ? window.i18n.t('game1Title') : 'Memory Match'}</h2>
                    <p class="game-inst-text">${window.i18n ? window.i18n.t('game1Desc') : 'Match traditional heritage cards'}</p>
                </div>
                <button class="btn-audio-guide" onclick="window.memoryMatch.readInstructions()">🔊 ${window.i18n ? window.i18n.t('speakInstructions') : 'Listen'}</button>
            </div>

            <div class="memory-grid-container grid-pairs-${this.totalPairs}" id="memory-cards-grid">
                ${this.cards.map((card, idx) => `
                    <div class="memory-card" id="card-${idx}" onclick="window.memoryMatch.handleCardClick(${idx})">
                        <div class="card-inner">
                            <div class="card-front">
                                <span class="card-motif">🌸</span>
                            </div>
                            <div class="card-back" style="border-top: 6px solid ${card.color};">
                                <span class="card-icon">${card.icon}</span>
                                <span class="card-name">${window.i18n ? window.i18n.getItem(card.key).name : card.id}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div id="reminiscence-story-box" class="reminiscence-box hidden">
                <div class="reminiscence-inner">
                    <span id="reminiscence-icon" class="story-icon"></span>
                    <div>
                        <h4 id="reminiscence-title" class="story-title"></h4>
                        <p id="reminiscence-text" class="story-desc"></p>
                    </div>
                </div>
            </div>

            <div id="game-congrats-modal" class="congrats-banner hidden">
                <div class="congrats-content">
                    <span class="congrats-star">🌟</span>
                    <h3>${window.i18n ? window.i18n.t('wellDone') : 'Well Done!'}</h3>
                    <p>${window.i18n ? window.i18n.t('takeYourTime') : 'You did wonderfully!'}</p>
                    <button class="btn-next-round" onclick="window.memoryMatch.nextRound()">▶ ${window.i18n ? window.i18n.t('navGames') : 'Play Again'}</button>
                </div>
            </div>
        `;

        this.cardStartTime = Date.now();

        // Hesitation watchdog: if user waits >5 seconds, provide gentle hint
        if (window.cogniAdapt) {
            window.cogniAdapt.resetHesitationWatchdog(() => {
                this.provideGentleHint();
            });
        }
    }

    readInstructions() {
        if (window.voiceAssistant && window.i18n) {
            window.voiceAssistant.speak(window.i18n.t('game1Title') + ". " + window.i18n.t('game1Desc') + ". " + window.i18n.t('takeYourTime'));
        }
    }

    provideGentleHint() {
        // Gently pulse the first unmatched card
        const unmatchedIndex = this.cards.findIndex(c => !c.matched);
        if (unmatchedIndex !== -1) {
            const el = document.getElementById(`card-${unmatchedIndex}`);
            if (el && !el.classList.contains('flipped')) {
                el.classList.add('gentle-pulse');
                setTimeout(() => el.classList.remove('gentle-pulse'), 3000);
            }
        }
    }

    handleCardClick(index) {
        if (this.isLocked) return;

        const cardEl = document.getElementById(`card-${index}`);
        const cardData = this.cards[index];

        if (!cardEl || cardEl.classList.contains('flipped') || cardData.matched) {
            return;
        }

        if (window.voiceAssistant) {
            window.voiceAssistant.playChime('tap');
        }

        const latency = Date.now() - (this.cardStartTime || Date.now());
        this.cardStartTime = Date.now();

        cardEl.classList.add('flipped');
        this.flippedCards.push({ index, data: cardData, element: cardEl });

        if (this.flippedCards.length === 2) {
            this.checkMatch(latency);
        }
    }

    checkMatch(latency) {
        this.isLocked = true;
        const [first, second] = this.flippedCards;
        const isMatch = first.data.id === second.data.id;

        // CogniAdapt telemetry record
        if (window.cogniAdapt) {
            window.cogniAdapt.recordAction('card_flip_pair', isMatch, latency, {
                itemA: first.data.id,
                itemB: second.data.id
            });
        }

        if (isMatch) {
            first.data.matched = true;
            second.data.matched = true;
            first.element.classList.add('matched');
            second.element.classList.add('matched');

            this.matchedPairs++;

            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('success');
            }

            // Trigger Reminiscence Therapy Story for this item!
            this.showReminiscenceStory(first.data.key, first.data.icon);

            this.flippedCards = [];
            this.isLocked = false;

            if (this.matchedPairs >= this.totalPairs) {
                setTimeout(() => this.celebrateCompletion(), 1800);
            }
        } else {
            // Gentle non-punitive flip back after 1.4s
            setTimeout(() => {
                first.element.classList.remove('flipped');
                second.element.classList.remove('flipped');
                this.flippedCards = [];
                this.isLocked = false;
            }, 1400);
        }
    }

    showReminiscenceStory(itemKey, icon) {
        const box = document.getElementById('reminiscence-story-box');
        const iconEl = document.getElementById('reminiscence-icon');
        const titleEl = document.getElementById('reminiscence-title');
        const descEl = document.getElementById('reminiscence-text');

        if (box && window.i18n) {
            const item = window.i18n.getItem(itemKey);
            iconEl.textContent = icon;
            titleEl.textContent = item.name;
            descEl.textContent = item.story;
            box.classList.remove('hidden');
            box.classList.add('fade-in');

            // Read aloud cultural memory story
            if (window.voiceAssistant) {
                window.voiceAssistant.speak(item.name + ". " + item.story);
            }
        }
    }

    celebrateCompletion() {
        if (window.cogniAdapt) {
            window.cogniAdapt.finishSession({ pairsMatched: this.matchedPairs, level: this.level });
        }

        const banner = document.getElementById('game-congrats-modal');
        if (banner) {
            banner.classList.remove('hidden');
            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('praise');
                window.voiceAssistant.speak(window.i18n ? window.i18n.t('wellDone') : "Very well done!");
            }
        }
    }

    nextRound() {
        const nextLvl = this.level < 3 ? this.level + 1 : 1;
        this.init(nextLvl);
    }
}

window.MemoryMatchGame = MemoryMatchGame;
