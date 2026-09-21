/**
 * AI Caretaker Brain — Smriti-NER
 * ─────────────────────────────────────────────────────────────────
 * Dementia-aware multilingual conversational AI assistant.
 * Fully offline rule-based NLP — no API keys required.
 * 
 * Features:
 *  - Intent classification (10 categories)
 *  - Emotional tone detection from patient speech text
 *  - Multi-turn context memory (last 5 exchanges)
 *  - Safety escalation (pain / distress / sundowning)
 *  - Repetition handling (patient repeats → AI varies response)
 *  - Time-aware greeting personalisation
 *  - Cultural reminiscence triggers
 * ─────────────────────────────────────────────────────────────────
 */

class AiCaretaker {
    constructor() {
        // Rolling context: last 5 exchanges [{role, text, intent, ts}]
        this.context = [];
        this.MAX_CONTEXT = 5;

        // Prevent same response repeating consecutively
        this.lastResponseIndex = {};

        // Track last intent to detect loops / repetition
        this.lastIntent = null;
        this.intentRepeatCount = 0;

        // Escalation state
        this.escalationTriggered = false;

        // Current emotional state for TTS tuning
        this.currentEmotion = 'neutral'; // neutral | confused | distressed | happy | calm

        // Intent keyword maps per language
        this._buildIntentMaps();
    }

    // ─────────────────────────────────────────────────────────────────
    //  Core Entry Point
    // ─────────────────────────────────────────────────────────────────
    /**
     * Process patient speech and return AI caretaker response.
     * @param {string} userText — transcribed speech
     * @param {string} lang — current language code (as|bn|hi|en|brx|mni|lus|kha)
     * @returns {{ text: string, intent: string, emotion: string, escalate: boolean }}
     */
    processInput(userText, lang) {
        const text = (userText || '').toLowerCase().trim();
        if (!text) return null;

        // 1. Store in context
        this._addContext('patient', userText);

        // 2. Detect intent
        const intent = this._classifyIntent(text, lang);

        // 3. Detect emotion from text
        const emotion = this._detectEmotion(text, lang, intent);
        this.currentEmotion = emotion;

        // 4. Safety check — escalate immediately if needed
        const escalate = this._checkEscalation(text, lang, intent);

        // 5. Pick response
        const responseText = this._pickResponse(intent, lang);

        // 6. Update context
        this._addContext('ai', responseText, intent);

        // 7. Track intent repetition
        if (intent === this.lastIntent) {
            this.intentRepeatCount++;
        } else {
            this.intentRepeatCount = 0;
        }
        this.lastIntent = intent;

        return {
            text: responseText,
            intent,
            emotion,
            escalate,
            honorific: (window.CARETAKER_RESPONSES[lang] || window.CARETAKER_RESPONSES['en']).honorific
        };
    }

    // ─────────────────────────────────────────────────────────────────
    //  Intent Classification
    // ─────────────────────────────────────────────────────────────────
    _classifyIntent(text, lang) {
        const maps = this.intentMaps;

        // Check each intent in priority order
        const priorityOrder = [
            'pain', 'toilet', 'medicine', 'hunger', 'calm_request',
            'confusion', 'family', 'memory_lapse', 'game_help', 'greeting'
        ];

        for (const intent of priorityOrder) {
            const keywords = [
                ...(maps[intent]?.universal || []),
                ...(maps[intent]?.[lang] || [])
            ];
            if (keywords.some(kw => text.includes(kw))) {
                return intent;
            }
        }

        // Fallback: if only short utterance or repeated, return confusion
        if (text.length < 8 || this.intentRepeatCount > 2) {
            return 'confusion';
        }

        return 'unknown';
    }

    _buildIntentMaps() {
        this.intentMaps = {
            greeting: {
                universal: ['hello', 'hi', 'namaste', 'namaskar', 'good morning', 'good evening'],
                as: ['নমস্কাৰ', 'ৰাতিপুৱা', 'সন্ধিয়া', 'আহিছোঁ'],
                bn: ['নমস্কার', 'সুপ্রভাত', 'শুভ সন্ধ্যা', 'এসেছি'],
                hi: ['नमस्ते', 'नमस्कार', 'सुप्रभात', 'शुभ सन्ध्या'],
                brx: ['नमस्कार', 'मोजां फुं', 'मोनाबिलि'],
                mni: ['নমস্কার', 'য়াইফ', 'ফজব'],
                lus: ['chibai', 'zing', 'chawhnu'],
                kha: ['khublei', 'shibun', 'mynstep']
            },
            pain: {
                universal: ['pain', 'hurt', 'ache', 'fell', 'fall', 'injured', 'sore', 'burning'],
                as: ['বিষ', 'বেজা', 'ব্যথা', 'পৰি', 'জ্বলে', 'জ্বলিছে', 'কষ্ট', 'আঘাত'],
                bn: ['ব্যথা', 'কষ্ট', 'বিষ', 'পড়ে', 'জ্বালা', 'আঘাত'],
                hi: ['दर्द', 'चोट', 'जल', 'तकलीफ', 'गिर', 'लगी'],
                brx: ['বিজাব', 'বিসার', 'পৰিব'],
                mni: ['নাবা', 'নাবি', 'চাবিদা'],
                lus: ['na', 'tla', 'hmusit'],
                kha: ['na', 'man', 'ïeid']
            },
            hunger: {
                universal: ['hungry', 'food', 'eat', 'meal', 'rice', 'bread', 'snack', 'thirsty'],
                as: ['ভোক', 'খাব', 'ভাত', 'খাদ্য', 'ৰুটি', 'পিয়াহ'],
                bn: ['ক্ষুধা', 'খাব', 'ভাত', 'খাওয়া', 'পিপাসা', 'তৃষ্ণা'],
                hi: ['भूख', 'खाना', 'भात', 'रोटी', 'प्यास'],
                brx: ['ভোক', 'খাবার', 'দাই'],
                mni: ['চাবা', 'চানবা', 'মনুং'],
                lus: ['ei', 'bel', 'ei duh'],
                kha: ['bam', 'dep', 'bam duh']
            },
            medicine: {
                universal: ['medicine', 'tablet', 'pill', 'drug', 'dose', 'injection'],
                as: ['দৰব', 'ঔষধ', 'বড়ি', 'টেবলেট'],
                bn: ['ওষুধ', 'বড়ি', 'ট্যাবলেট', 'দাওয়াই'],
                hi: ['दवा', 'दवाई', 'गोली', 'टैबलेट'],
                brx: ['ওশোদ', 'বড়ি', 'দওয়াই'],
                mni: ['হিদাক', 'বড়ি'],
                lus: ['damdawi', 'bial'],
                kha: ['dawai', 'dih']
            },
            toilet: {
                universal: ['toilet', 'bathroom', 'washroom', 'restroom', 'pee', 'potty'],
                as: ['বাথৰুম', 'শৌচালয়', 'প্ৰস্ৰাৱ', 'পায়খানা'],
                bn: ['বাথরুম', 'শৌচাগার', 'পেশাব', 'পায়খানা'],
                hi: ['बाथरूम', 'शौचालय', 'पेशाब', 'पैखाना'],
                brx: ['বাথরুম', 'শৌচালয়'],
                mni: ['থোংনবা', 'বাথরুম'],
                lus: ['toilet', 'bathroom'],
                kha: ['toilet', 'bathroom', 'kynmaw']
            },
            confusion: {
                universal: ['where am i', 'who are you', 'what is this', 'i dont know', "don't know", 'confused', 'lost'],
                as: ["মই ক'ত", 'তুমি কোন', 'এইটো কি', 'নাজানো', 'হেৰাই'],
                bn: ['আমি কোথায়', 'তুমি কে', 'এটা কি', 'জানি না', 'হারিয়ে'],
                hi: ['मैं कहाँ', 'तुम कौन', 'यह क्या', 'नहीं जानता', 'खो गया'],
                brx: ['মও কথায়', 'ন জানো'],
                mni: ['ঐ কনা', 'নহাক কোইনু', 'করি নো'],
                lus: ['ka awm', 'ka hre lo'],
                kha: ['nga don', 'nga shym hre']
            },
            family: {
                universal: ['son', 'daughter', 'wife', 'husband', 'child', 'family', 'mother', 'father', 'grandchild'],
                as: ["ল'ৰা", 'ছোৱালী', 'পুত্ৰ', 'কন্যা', 'মা', 'দেউতা', 'নাতি', 'পৰিয়াল'],
                bn: ['ছেলে', 'মেয়ে', 'মা', 'বাবা', 'নাতি', 'পরিবার'],
                hi: ['बेटा', 'बेटी', 'माँ', 'पिता', 'पोता', 'परिवार'],
                brx: ['जों', 'आबै', 'माव', 'मুलুগ'],
                mni: ['ইচেনা', 'ইমা', 'মপা', 'অমুক্তা'],
                lus: ['nau', 'nu', 'pa', 'chhungkua'],
                kha: ['nau', 'mei', 'pa', 'chnong']
            },
            memory_lapse: {
                universal: ['forgot', 'forget', 'remember', 'recall', "can't remember", 'memory', 'what was'],
                as: ['পাহৰি', 'মনত নাই', 'মনত নপৰে', 'স্মৃতি', 'ভুলি'],
                bn: ['ভুলে', 'মনে নেই', 'মনে পড়ছে না', 'স্মৃতি', 'ভুলি'],
                hi: ['भूल', 'याद नहीं', 'याद नहीं है', 'भूल गया', 'स्मृति'],
                brx: ['মোন নাই', 'পাহৰি'],
                mni: ['মনুপা নাই', 'থৌরাং'],
                lus: ['hriat duh lo', 'en tawh lo'],
                kha: ['khlem kyrteng', 'shym hre']
            },
            game_help: {
                universal: ['game', 'play', 'puzzle', 'match', 'activity', 'bored'],
                as: ['খেল', 'খেলিব', 'পাজল', 'মিল', 'বিষণ্ণ'],
                bn: ['খেলা', 'খেলব', 'পাজল', 'মেলানো'],
                hi: ['खेल', 'खेलना', 'पहेली', 'मिलान'],
                brx: ['গেলে', 'খেলনায়'],
                mni: ['শান্নপোৎ', 'শানবা'],
                lus: ['infiam', 'khelh'],
                kha: ['khelh', 'jingkhelh']
            },
            calm_request: {
                universal: ['calm', 'breathe', 'relax', 'peace', 'quiet', 'rest', 'anxious', 'worried', 'stress'],
                as: ['শান্তি', 'জিৰণি', 'উশাহ', 'বিশ্ৰাম', 'চিন্তা', 'অস্থিৰ'],
                bn: ['শান্তি', 'বিশ্রাম', 'শ্বাস', 'চিন্তা', 'অস্থির'],
                hi: ['शांति', 'आराम', 'सांस', 'चिंता', 'घबराहट'],
                brx: ['গোশো শান্তি', 'গাব লানাই'],
                mni: ['শান্তি', 'ঈশাবা'],
                lus: ['thlamuang', 'thawk la'],
                kha: ['jingsuk', 'chym']
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────
    //  Emotion Detection
    // ─────────────────────────────────────────────────────────────────
    _detectEmotion(text, lang, intent) {
        if (intent === 'pain') return 'distressed';
        if (intent === 'confusion' || intent === 'memory_lapse') return 'confused';
        if (intent === 'calm_request') return 'anxious';
        if (intent === 'greeting' || intent === 'game_help') return 'happy';
        if (intent === 'calm_request') return 'calm';

        // Check for distress keywords
        const distressKws = window.DISTRESS_KEYWORDS?.[lang] || [];
        if (distressKws.some(kw => text.includes(kw))) return 'distressed';

        // Sundowning check
        const sundownKws = window.SUNDOWNING_PHRASES?.[lang] || [];
        if (sundownKws.some(kw => text.includes(kw))) return 'confused';

        return 'neutral';
    }

    // ─────────────────────────────────────────────────────────────────
    //  Safety Escalation
    // ─────────────────────────────────────────────────────────────────
    _checkEscalation(text, lang, intent) {
        if (intent === 'pain') return true;

        const distressKws = window.DISTRESS_KEYWORDS?.[lang] || [];
        if (distressKws.some(kw => text.includes(kw))) return true;

        const sundownKws = window.SUNDOWNING_PHRASES?.[lang] || [];
        if (sundownKws.some(kw => text.includes(kw))) {
            // Sundowning is a caregiver alert but not an emergency
            return 'sundowning';
        }

        return false;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Response Picker — avoids consecutive repeats
    // ─────────────────────────────────────────────────────────────────
    _pickResponse(intent, lang) {
        const langData = window.CARETAKER_RESPONSES?.[lang] || window.CARETAKER_RESPONSES?.['en'];
        if (!langData) return "I'm here with you.";

        const variants = langData[intent] || langData['unknown'];
        if (!variants || variants.length === 0) return langData['unknown']?.[0] || "I'm here with you.";

        const key = `${lang}_${intent}`;
        let lastIdx = this.lastResponseIndex[key] ?? -1;

        // Pick next index that differs from last
        let idx = (lastIdx + 1) % variants.length;
        this.lastResponseIndex[key] = idx;
        return variants[idx];
    }

    // ─────────────────────────────────────────────────────────────────
    //  Context Memory
    // ─────────────────────────────────────────────────────────────────
    _addContext(role, text, intent = null) {
        this.context.push({ role, text, intent, ts: Date.now() });
        if (this.context.length > this.MAX_CONTEXT * 2) {
            this.context = this.context.slice(-this.MAX_CONTEXT * 2);
        }
    }

    getContextSummary() {
        return this.context.slice(-4).map(c => `${c.role}: ${c.text}`).join('\n');
    }

    resetContext() {
        this.context = [];
        this.lastIntent = null;
        this.intentRepeatCount = 0;
        this.escalationTriggered = false;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Proactive Prompts — called externally on timers
    // ─────────────────────────────────────────────────────────────────
    /**
     * Get a proactive check-in message (called every ~15 min by scheduler)
     */
    getProactiveCheckIn(lang) {
        const langData = window.CARETAKER_RESPONSES?.[lang] || window.CARETAKER_RESPONSES?.['en'];
        const honorific = langData?.honorific || 'dear';
        const hour = new Date().getHours();

        const checkIns = {
            as: [
                `আইতা, আপুনি কেনে আছে? পানী এঢোক খাইছে নে?`,
                `আইতা, অলপ জিৰণি ল'লে নে?`,
                `মই আপোনাৰ লগতে আছোঁ। কিবা লাগে নে?`
            ],
            bn: [
                `দিদা, কেমন আছেন? একটু জল খেয়েছেন?`,
                `দিদা, একটু বিশ্রাম নিলেন?`,
                `আমি আপনার পাশে আছি। কিছু লাগবে?`
            ],
            hi: [
                `अम्माजी, कैसी हैं? थोड़ा पानी पिया?`,
                `अम्माजी, थोड़ा आराम किया?`,
                `मैं यहाँ हूँ। कुछ चाहिए?`
            ],
            en: [
                `How are you doing dear? Have you had some water?`,
                `Did you get some rest?`,
                `I'm right here. Do you need anything?`
            ],
            brx: [`আবৈ, নোংথাঙা বে মোজাং দং? দৈ ইচেলো লোংবায়?`],
            mni: [`ইমা, নহাক কনা লৈরি? ঈশিং থকখ্রে?`],
            lus: [`Nu, i hrisel em? Tui in tawh em?`],
            kha: [`Kong, phi kynmaw bha? Phi la dih um?`]
        };

        const msgs = checkIns[lang] || checkIns['en'];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }

    /**
     * Get a reminiscence therapy prompt in the selected language
     */
    getReminiscencePrompt(lang) {
        return window.reminiscenceEngine ? window.reminiscenceEngine.getRandomPrompt(lang) : null;
    }
}

// Singleton
window.aiCaretaker = new AiCaretaker();
