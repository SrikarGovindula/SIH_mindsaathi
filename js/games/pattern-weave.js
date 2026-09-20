/**
 * Game 4: Rong aru Gamusa (ৰং আৰু গামোচা) — Pattern & Object Recognition
 * Focus: Visuospatial processing, indigenous fruit recognition, and North-Eastern textile motifs
 * Features:
 * - Traditional geometric borders (Gamusa red diamond motif, Bodo Dokhna, Mizo Puanchei)
 * - Indigenous NER organic treasures (Kaji Nemu lemon, Ou Tenga, Naga Raja Mirch, Bamboo Shoot)
 */

class PatternWeaveGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentRound = 0;
        this.totalRounds = 3;
        this.score = 0;
        this.level = 1;
        this.currentQuestion = null;
        this.startTime = null;

        this.questionsPool = [
            {
                type: 'weave_pattern',
                title: 'গামোচাৰ ফুলাম নক্সা (Gamusa Diamond Weave)',
                question_as: 'তলৰ কোনটো নক্সা গামোচাৰ লগত মিলিছে?',
                question_en: 'Which diamond motif completes this traditional border?',
                samplePattern: '♦️ 🔹 ♦️ 🔹 [ ? ]',
                options: [
                    { icon: '♦️', label: 'ৰঙা হীৰা নক্সা (Red Diamond)', isCorrect: true },
                    { icon: '🟡', label: 'হালধীয়া বৃত্ত', isCorrect: false },
                    { icon: '⬛', label: "ক'লা চতুৰ্ভুজ", isCorrect: false }
                ]
            },
            {
                type: 'fruit_recognition',
                title: 'অসমৰ কাজি নেমু (Kaji Nemu Assam Lemon)',
                question_as: 'সুগন্ধি কাজি নেমু কোনটো চিনি পাওক:',
                question_en: 'Can you spot our indigenous aromatic Kaji Nemu?',
                samplePattern: '🍋 অসমৰ গৌৰৱ সুগন্ধি কাজি নেমু',
                options: [
                    { icon: '🍋', label: 'কাজি নেমু (Assam Lemon)', isCorrect: true },
                    { icon: '🍎', label: 'আপেল (Apple)', isCorrect: false },
                    { icon: '🥥', label: 'নাৰিকল (Coconut)', isCorrect: false }
                ]
            },
            {
                type: 'weave_pattern',
                title: 'মণিপুৰ আৰু মিজো পুৱানচেই (Traditional Border)',
                question_as: 'ৰঙীন সূতাৰ পৰৱৰ্তী ক্ৰম কি হ\'ব?',
                question_en: 'Which color completes this handloom sequence?',
                samplePattern: '🔴 🟢 🔴 🟢 [ ? ]',
                options: [
                    { icon: '🔴', label: 'ৰঙা সূতা (Red Yarn)', isCorrect: true },
                    { icon: '🟣', label: 'বেঙুনীয়া', isCorrect: false },
                    { icon: '⚪', label: 'বগা সূতা', isCorrect: false }
                ]
            },
            {
                type: 'fruit_recognition',
                title: 'ঔ টেঙা (Elephant Apple / Ou Tenga)',
                question_as: 'মাছৰ জোলৰ প্ৰিয় ঔ টেঙাটো বাছক:',
                question_en: 'Spot our beloved tart fruit Ou Tenga:',
                samplePattern: '🍈 টেঙা আঞ্জাৰ সোৱাদ বঢ়োৱা ফল',
                options: [
                    { icon: '🍈', label: 'ঔ টেঙা (Ou Tenga)', isCorrect: true },
                    { icon: '🍇', label: 'আঙুৰ (Grapes)', isCorrect: false },
                    { icon: '🍌', label: 'কল (Banana)', isCorrect: false }
                ]
            }
        ];
    }

    init(level = 1) {
        this.level = level;
        this.currentRound = 0;
        this.score = 0;
        this.totalRounds = level === 1 ? 2 : 3;

        // Shuffle pool
        this.activePool = [...this.questionsPool].sort(() => 0.5 - Math.random()).slice(0, this.totalRounds);

        if (window.cogniAdapt) {
            window.cogniAdapt.startSession('pattern-weave', this.level);
        }

        this.loadRound(0);
    }

    loadRound(roundIndex) {
        this.currentRound = roundIndex;
        this.currentQuestion = this.activePool[roundIndex];
        this.renderGame();

        if (window.voiceAssistant && window.i18n) {
            const lang = window.i18n.getLang();
            const text = (lang === 'as' && this.currentQuestion.question_as) ? this.currentQuestion.question_as : this.currentQuestion.question_en;
            window.voiceAssistant.speak(this.currentQuestion.title + ". " + text);
        }
    }

    renderGame() {
        if (!this.container || !this.currentQuestion) return;

        const q = this.currentQuestion;
        const lang = window.i18n ? window.i18n.getLang() : 'as';
        const qText = (lang === 'as' && q.question_as) ? q.question_as : q.question_en;

        this.container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-game-back" onclick="window.appNav.showScreen('games-screen')">← ${window.i18n ? window.i18n.t('backToHome') : 'Back'}</button>
                <div class="game-title-group">
                    <h2>${window.i18n ? window.i18n.t('game4Title') : 'Patterns & Heritage'}</h2>
                    <p class="game-inst-text">${qText}</p>
                </div>
                <button class="btn-audio-guide" onclick="window.patternWeave.readInstructions()">🔊 ${window.i18n ? window.i18n.t('speakInstructions') : 'Listen'}</button>
            </div>

            <div class="pattern-game-stage">
                <div class="round-indicator">পৰ্ব ${this.currentRound + 1} / ${this.totalRounds}</div>

                <div class="pattern-display-card">
                    <h3 class="pattern-theme-title">${q.title}</h3>
                    <div class="pattern-sequence-visual">${q.samplePattern}</div>
                </div>

                <div class="pattern-options-grid" id="pattern-options-grid">
                    ${q.options.map((opt, idx) => `
                        <button class="pattern-opt-btn" id="pat-opt-${idx}" onclick="window.patternWeave.selectOption(${idx})">
                            <span class="opt-big-icon">${opt.icon}</span>
                            <span class="opt-label-text">${opt.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div id="pattern-congrats-modal" class="congrats-banner hidden">
                <div class="congrats-content">
                    <span class="congrats-star">🎨</span>
                    <h3>${window.i18n ? window.i18n.t('wellDone') : 'Well Done!'}</h3>
                    <p>নক্সা আৰু স্থানীয় বস্তুবোৰ আপুনি নিখুঁতভাৱে চিনি উলিয়ালে!</p>
                    <button class="btn-next-round" onclick="window.patternWeave.nextRound()">▶ ${window.i18n ? window.i18n.t('navGames') : 'Next'}</button>
                </div>
            </div>
        `;

        this.startTime = Date.now();
    }

    readInstructions() {
        if (window.voiceAssistant && window.i18n) {
            const lang = window.i18n.getLang();
            const text = (lang === 'as' && this.currentQuestion.question_as) ? this.currentQuestion.question_as : this.currentQuestion.question_en;
            window.voiceAssistant.speak(this.currentQuestion.title + ". " + text);
        }
    }

    selectOption(index) {
        const opt = this.currentQuestion.options[index];
        if (!opt) return;

        const latency = Date.now() - (this.startTime || Date.now());
        this.startTime = Date.now();

        if (opt.isCorrect) {
            this.score++;
            const btn = document.getElementById(`pat-opt-${index}`);
            if (btn) btn.classList.add('correct-choice');

            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('success');
                window.voiceAssistant.speak(window.i18n ? window.i18n.t('wellDone') : "Correct!");
            }

            if (window.cogniAdapt) {
                window.cogniAdapt.recordAction('pattern_choice', true, latency, { opt: opt.label });
            }

            setTimeout(() => {
                if (this.currentRound + 1 < this.totalRounds) {
                    this.loadRound(this.currentRound + 1);
                } else {
                    this.celebrateCompletion();
                }
            }, 1200);
        } else {
            const btn = document.getElementById(`pat-opt-${index}`);
            if (btn) {
                btn.classList.add('gentle-wobble');
                setTimeout(() => btn.classList.remove('gentle-wobble'), 600);
            }

            if (window.voiceAssistant) {
                window.voiceAssistant.speak(window.i18n ? window.i18n.t('gentleCheer') : "Try once more calmly.");
            }

            if (window.cogniAdapt) {
                window.cogniAdapt.recordAction('pattern_choice', false, latency, { opt: opt.label });
            }
        }
    }

    celebrateCompletion() {
        if (window.cogniAdapt) {
            window.cogniAdapt.finishSession({ score: this.score, level: this.level });
        }

        const banner = document.getElementById('pattern-congrats-modal');
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

window.PatternWeaveGame = PatternWeaveGame;
