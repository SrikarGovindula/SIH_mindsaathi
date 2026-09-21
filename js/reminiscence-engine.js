/**
 * Reminiscence Therapy Engine — Smriti-NER
 * ─────────────────────────────────────────────────────────────────
 * Culturally-grounded memory prompts to trigger positive long-term
 * memories in dementia patients. Each prompt:
 *  - Evokes a specific cultural memory (festival, food, tradition)
 *  - Optionally links to a cognitive game
 *  - Is spoken by the AI caretaker voice
 * ─────────────────────────────────────────────────────────────────
 */

class ReminiscenceEngine {
    constructor() {
        this.usedIndices = {};
        this._buildPrompts();
    }

    _buildPrompts() {
        this.prompts = {
            as: [
                {
                    text: "আইতা, আপুনি বিহুৰ কথা মনত আছে নে? ঢোলৰ মাত, পিঠা আৰু গামোচা... কি সুন্দৰ দিন আছিল!",
                    game: 'memory-match',
                    category: 'festival'
                },
                {
                    text: "চাহ বাগিচাৰ সেউজ পাতবোৰৰ কথা মনত পৰেনে আইতা? দুটি পাত এটি কুঁহিৰ সুৱাস...",
                    game: 'tea-garden',
                    category: 'nature'
                },
                {
                    text: "মাজুলীৰ ভাওনাৰ মুখা চিনে আইতা? সেই ৰঙীন আৰু ধুনীয়া মুখা...",
                    game: 'memory-match',
                    category: 'culture'
                },
                {
                    text: "পুৱাৰ চাহ খোৱাৰ পাছত কি কি কৰিছিলে আইতা? নামঘৰলৈ যাওঁতে...",
                    game: 'routine-sequence',
                    category: 'daily'
                },
                {
                    text: "ফুলাম গামোচাৰ নক্সা বোনাৰ কথা মনত আছে? হাতেৰে বোনা সেই সুন্দৰ ৰঙা-বগা...",
                    game: 'pattern-weave',
                    category: 'craft'
                },
                {
                    text: "ব্ৰহ্মপুত্ৰৰ পাৰত বহিছিলে কেতিয়াবা? নদীৰ শব্দ শুনি মন শান্ত হয় নে?",
                    game: 'calm-breathing',
                    category: 'nature'
                },
                {
                    text: "আইতা, কাজিৰঙাৰ গঁড়ৰ কথা মনত আছে নে? সেই শক্তিশালী আৰু শান্ত গঁড়...",
                    game: 'memory-match',
                    category: 'wildlife'
                }
            ],
            bn: [
                {
                    text: "দিদা, দুর্গাপূজার কথা মনে আছে? ঢাকের শব্দ, আলোর সাজ, মা দুর্গার মূর্তি...",
                    game: 'memory-match',
                    category: 'festival'
                },
                {
                    text: "চা বাগানের সবুজ পাতার কথা মনে পড়ে? দুটি পাতা একটি কুঁড়ি...",
                    game: 'tea-garden',
                    category: 'nature'
                },
                {
                    text: "দিদা, ছোটবেলায় ঠাকুমার কাছে কী গল্প শুনতেন? সেই রাজপুত্রের গল্প...",
                    game: 'memory-match',
                    category: 'family'
                },
                {
                    text: "সকালে উঠে কী করতেন দিদা? পুজো দিয়ে চা খাওয়া, তারপর...",
                    game: 'routine-sequence',
                    category: 'daily'
                },
                {
                    text: "নকশিকাঁথার সুন্দর ডিজাইন মনে আছে? সেই হাতে বোনা...",
                    game: 'pattern-weave',
                    category: 'craft'
                }
            ],
            hi: [
                {
                    text: "अम्माजी, होली की याद है? रंग, गुझिया और ढोल की आवाज़...",
                    game: 'memory-match',
                    category: 'festival'
                },
                {
                    text: "चाय बागान की हरी पत्तियों की खुशबू याद है? दो पत्ती एक कली...",
                    game: 'tea-garden',
                    category: 'nature'
                },
                {
                    text: "अम्माजी, बचपन में दादी के साथ क्या करती थीं? वो पुरानी कहानियाँ...",
                    game: 'memory-match',
                    category: 'family'
                },
                {
                    text: "सुबह की दिनचर्या याद है? चाय पीना, पूजा करना, फिर...",
                    game: 'routine-sequence',
                    category: 'daily'
                },
                {
                    text: "हथकरघे पर बुनाई की याद है? वो सुंदर रंग-बिरंगे धागे...",
                    game: 'pattern-weave',
                    category: 'craft'
                },
                {
                    text: "ब्रह्मपुत्र नदी के किनारे कभी बैठी थीं? उस शांत पानी की आवाज़...",
                    game: 'calm-breathing',
                    category: 'nature'
                }
            ],
            en: [
                {
                    text: "Do you remember the harvest festival? The music, the food, everyone gathered together...",
                    game: 'memory-match',
                    category: 'festival'
                },
                {
                    text: "Do you remember the tea garden? The fresh green leaves, the morning mist...",
                    game: 'tea-garden',
                    category: 'nature'
                },
                {
                    text: "What did you do in the mornings when you were young? Getting up, making tea, then...",
                    game: 'routine-sequence',
                    category: 'daily'
                },
                {
                    text: "Do you remember weaving beautiful patterns? Those colourful threads...",
                    game: 'pattern-weave',
                    category: 'craft'
                },
                {
                    text: "Shall we breathe slowly together and remember peaceful moments?",
                    game: 'calm-breathing',
                    category: 'calm'
                }
            ],
            brx: [
                {
                    text: "আবৈ, বৈশাগু ফেস্টিবেলনি কথা মোন दं? ঢোলনি সুন্দব, খাবার...",
                    game: 'memory-match',
                    category: 'festival'
                },
                {
                    text: "সা বাগাননি সেউজীয়া পাতনি সুন্দব মোন दं? দুটি পাত, এটি কুঁহি...",
                    game: 'tea-garden',
                    category: 'nature'
                },
                {
                    text: "ফুং ফুংনি খামানি মোন दं আবৈ? সানফ্রোমনি চা লোংনায়...",
                    game: 'routine-sequence',
                    category: 'daily'
                }
            ],
            mni: [
                {
                    text: "ইমা, ইমোইনু ফেস্টিবেলনি মতাং মনুপা থোকপা লৈরে? পুং থাবা, থাবল চোংবা...",
                    game: 'memory-match',
                    category: 'festival'
                },
                {
                    text: "চা পাম্বীনি চা মনাগী মতাং মনুপা থোকপা লৈরে? শেংলবা চা মনাশিং...",
                    game: 'tea-garden',
                    category: 'nature'
                },
                {
                    text: "অয়ুক্তা লৈবাক শেংনা লৈতে ইমা? চা থকপা, মাপাল চোংবা, মতম মতমদা...",
                    game: 'routine-sequence',
                    category: 'daily'
                }
            ],
            lus: [
                {
                    text: "Nu, Chapchar Kut hun i hriat em? Lawmna ri mawi, ei mamawh zawng zawng...",
                    game: 'memory-match',
                    category: 'festival'
                },
                {
                    text: "Thingpui huan sla hring nghal hi i ngaih hre em Nu? Zing thlakna...",
                    game: 'tea-garden',
                    category: 'nature'
                },
                {
                    text: "I zing in thuam zawng zawng i hre reng em? Thingpui in, inlam belhna...",
                    game: 'routine-sequence',
                    category: 'daily'
                }
            ],
            kha: [
                {
                    text: "Kong, Ka Nongkrem phon phi kyrteng em? Ka jingthaw mawi, ka dur, ki khana...",
                    game: 'memory-match',
                    category: 'festival'
                },
                {
                    text: "Ka kper sha jong mynstep phi kyrteng em? Ki sla sha ba jyrngam...",
                    game: 'tea-garden',
                    category: 'nature'
                },
                {
                    text: "Mynstep phi la threi engmah nge? Ka sha, ka puja, phi la leh bha...",
                    game: 'routine-sequence',
                    category: 'daily'
                }
            ]
        };
    }

    /**
     * Get a random (non-repeating) reminiscence prompt for the given language
     */
    getRandomPrompt(lang) {
        const pool = this.prompts[lang] || this.prompts['en'];
        const usedKey = `used_${lang}`;
        if (!this.usedIndices[usedKey]) {
            this.usedIndices[usedKey] = [];
        }

        let available = pool.map((_, i) => i).filter(i => !this.usedIndices[usedKey].includes(i));
        if (available.length === 0) {
            // Reset when all used
            this.usedIndices[usedKey] = [];
            available = pool.map((_, i) => i);
        }

        const idx = available[Math.floor(Math.random() * available.length)];
        this.usedIndices[usedKey].push(idx);
        return pool[idx];
    }

    /**
     * Trigger reminiscence — speaks the prompt, then optionally launches a game
     * @param {string} lang
     * @param {boolean} autoLaunchGame — whether to navigate to the game after speaking
     */
    triggerReminiscence(lang, autoLaunchGame = false) {
        const prompt = this.getRandomPrompt(lang);
        if (!prompt) return;

        if (window.voiceAssistant) {
            window.voiceAssistant.speakWithEmotion(prompt.text, 'warm', () => {
                if (autoLaunchGame && prompt.game && window.appNav) {
                    setTimeout(() => {
                        window.appNav.launchGame(prompt.game);
                    }, 1000);
                }
            });
        }

        // Update chat panel with reminiscence bubble
        if (window.voiceAssistant?.addChatBubble) {
            window.voiceAssistant.addChatBubble('ai', prompt.text, '🌸');
        }

        return prompt;
    }
}

window.reminiscenceEngine = new ReminiscenceEngine();
