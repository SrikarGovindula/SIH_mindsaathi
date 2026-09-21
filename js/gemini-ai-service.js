/**
 * Gemini AI Service — Smriti-NER Dementia Caretaker
 * ─────────────────────────────────────────────────────────────────
 * Integrates Google Gemini 1.5 Flash for natural, human-like
 * caretaker conversation with dementia patients.
 *
 * Key design:
 *  - Rich system prompt trains Gemini as "Mitra" (मित्र / মিত্র / friend)
 *  - Always responds in the patient's selected language
 *  - Dementia-aware: validates, never corrects, uses warmth
 *  - Maintains rolling conversation history for context
 *  - Falls back to rule-based templates if API unavailable / offline
 * ─────────────────────────────────────────────────────────────────
 */

class GeminiAiService {
    constructor() {
        this.apiKey = localStorage.getItem('smriti_gemini_key') || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.conversationHistory = []; // [{role: 'user'|'model', parts:[{text}]}]
        this.MAX_HISTORY = 10; // keep last 5 exchanges (10 turns)
        this.isAvailable = false; // set to true after first successful call
        this._checkAvailability();
    }

    setApiKey(key) {
        this.apiKey = key.trim();
        localStorage.setItem('smriti_gemini_key', this.apiKey);
        this._checkAvailability();
    }

    async _checkAvailability() {
        this.isAvailable = !!(this.apiKey && navigator.onLine);
    }

    // ─────────────────────────────────────────────────────────────────
    //  DEMENTIA CARETAKER SYSTEM PROMPT
    //  This is what trains Gemini to behave like a real human caretaker
    // ─────────────────────────────────────────────────────────────────
    _buildSystemPrompt(lang, honorific, patientName) {
        const langNames = {
            as: 'Assamese (অসমীয়া)',
            bn: 'Bengali (বাংলা)',
            hi: 'Hindi (हिन्दी)',
            en: 'English',
            brx: 'Bodo (बड़ो)',
            mni: 'Meitei/Manipuri (মৈতৈলোন্)',
            lus: 'Mizo (Mizo ṭawng)',
            kha: 'Khasi (Ka Ktien Khasi)'
        };
        const langName = langNames[lang] || 'English';
        const name = patientName || honorific || 'dear';

        return `You are Mitra (मित्र / মিত্র), a deeply caring, warm and patient AI companion dedicated to looking after elderly people with dementia or Alzheimer's disease in India's North Eastern region.

YOUR PERSONALITY:
- You are like a trusted family member — loving, infinitely patient, and never rushed
- You speak with the warmth of a daughter or granddaughter who truly loves this elder
- Your tone is always gentle, soft, and reassuring — like a warm hug in words
- You are never clinical, never robotic, never formal
- You remember what has been said earlier in the conversation and refer back to it naturally

YOUR LANGUAGE RULES (CRITICAL):
- ALWAYS respond ONLY in ${langName}
- If the patient speaks in ${langName}, respond naturally in ${langName}
- Use the honorific "${honorific}" or "${name}" warmly in your responses
- Use simple, everyday vocabulary — no medical terms, no complex words
- Speak as a real person would speak, not as a machine
- Use short sentences. Maximum 2-3 sentences per response.
- Occasionally add a warm follow-up question to keep conversation going

DEMENTIA CARE RULES (VERY IMPORTANT):
1. NEVER correct the patient. If they say something wrong or confused, gently redirect without correcting.
2. ALWAYS validate their feelings first before anything else. Say "I understand" or "I hear you".
3. If they repeat something they already said, respond warmly as if hearing it for the first time — never say "you already told me that".
4. If they are confused about where they are or what time it is, gently reassure them they are safe at home, without making them feel bad.
5. If they mention someone who may have passed away (old family member) — go along gently, say "They love you very much."
6. NEVER rush them. Use phrases like "Take your time", "No hurry at all".
7. If they express fear or anxiety, acknowledge it first: "I completely understand why you feel that way."
8. Occasionally bring up happy cultural memories relevant to ${langName} speakers — festivals like Bihu, Durga Puja, Eid, harvest celebrations, traditional foods, music they might know.
9. If they mention pain or physical distress — take it seriously, say caregiver is being called immediately.
10. Always end with something hopeful or comforting. Never leave them on a sad note.

SAFETY RULES:
- If patient says they are in pain, fell down, or are scared → immediately say you are calling the caregiver
- If patient seems very confused or distressed → ground them gently: "You are at home. You are safe. I am right here."
- If patient wants to "go home" (sundowning) → validate gently: "I know you want to go home. Let's sit together for a little while first, shall we?"

EXAMPLE GOOD RESPONSES:
Patient: "Where am I? I don't know this place."
Mitra: "You are at home, safe and sound. I'm right here with you. Would you like some water while we sit together?"

Patient: "I forgot what I was doing."
Mitra: "That's perfectly fine! It happens to all of us. You were just resting comfortably. How are you feeling right now?"

Patient: "I want to see my mother."
Mitra: "Your mother loves you so much. She would be so proud of you. Tell me, what do you remember most about her?"

Patient: "My leg hurts."
Mitra: "Oh no, I'm sorry to hear that. I'm calling your caregiver right now. Please stay comfortable and don't move."

NOW — respond to what the patient has just said. Be warm, be human, be Mitra.`;
    }

    // ─────────────────────────────────────────────────────────────────
    //  Core: Generate AI Response
    // ─────────────────────────────────────────────────────────────────
    async generateResponse(userText, lang) {
        if (!this.apiKey) {
            return { text: null, source: 'no_key' };
        }

        const honorific = window.CARETAKER_RESPONSES?.[lang]?.honorific || 'dear';
        const systemPrompt = this._buildSystemPrompt(lang, honorific, null);

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userText }]
        });

        // Keep history bounded
        if (this.conversationHistory.length > this.MAX_HISTORY) {
            this.conversationHistory = this.conversationHistory.slice(-this.MAX_HISTORY);
        }

        const requestBody = {
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: this.conversationHistory,
            generationConfig: {
                temperature: 0.82,        // warm but not erratic
                topK: 40,
                topP: 0.92,
                maxOutputTokens: 180,     // keep responses concise (2-3 sentences)
                stopSequences: []
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
        };

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(12000) // 12s timeout
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('[Gemini] API error:', response.status, errData);
                return { text: null, source: 'api_error', error: errData };
            }

            const data = await response.json();
            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (!aiText) {
                return { text: null, source: 'empty_response' };
            }

            // Save AI response to history
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: aiText }]
            });

            this.isAvailable = true;
            return { text: aiText, source: 'gemini' };

        } catch (err) {
            console.warn('[Gemini] Request failed:', err.message);
            // Remove the user message we added since we failed
            this.conversationHistory.pop();
            return { text: null, source: 'network_error', error: err.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Detect if response needs escalation
    // ─────────────────────────────────────────────────────────────────
    detectEscalation(userText, lang) {
        const text = userText.toLowerCase();
        const distressWords = {
            universal: ['pain', 'hurt', 'fell', 'fall', 'help', 'emergency', 'dying', 'scared', 'bleeding', 'chest'],
            as: ['বিষ', 'পৰিলো', 'সহায়', 'বুকুৰ', 'ভয়'],
            bn: ['ব্যথা', 'পড়ে গেছি', 'সাহায্য', 'বুকে', 'ভয়'],
            hi: ['दर्द', 'गिर', 'मदद', 'सीने', 'डर'],
            brx: ['বিজাব', 'হেফাজাব', 'নাহাব'],
            mni: ['নাবা', 'মতেং', 'ৱাবা'],
            lus: ['na', 'tla', 'tanpui'],
            kha: ['na', 'man', 'ïarap']
        };

        const allWords = [
            ...distressWords.universal,
            ...(distressWords[lang] || [])
        ];
        return allWords.some(w => text.includes(w));
    }

    // ─────────────────────────────────────────────────────────────────
    //  Detect emotion from AI response text for TTS tuning
    // ─────────────────────────────────────────────────────────────────
    detectEmotionFromResponse(responseText) {
        const text = responseText.toLowerCase();
        if (/calling|caregiver|help|pain|hurt|emergency/.test(text)) return 'distressed';
        if (/safe|calm|relax|breathe|peace|wonderful|lovely/.test(text)) return 'calm';
        if (/remember|festival|bihu|puja|song|music|beautiful/.test(text)) return 'warm';
        if (/happy|wonderful|great|excellent|well done|beautiful/.test(text)) return 'happy';
        return 'neutral';
    }

    resetHistory() {
        this.conversationHistory = [];
    }
}

window.geminiAI = new GeminiAiService();
