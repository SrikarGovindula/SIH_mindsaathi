/**
 * AI Caretaker Response Dictionary — Smriti-NER
 * 8 Languages × 10 Intents × 3-5 response variants
 * 
 * Designed following dementia care best practices:
 *  - Validation not correction
 *  - Short simple sentences
 *  - Warm, familiar honorifics per culture
 *  - Gentle redirections, not commands
 *  - Never argue with confused patient
 */

const CARETAKER_RESPONSES = {

    // ─────────────────────────────────────────────
    //  ASSAMESE (as)
    // ─────────────────────────────────────────────
    as: {
        honorific: "আইতা",  // Grandmother / respected elder
        greeting: [
            "নমস্কাৰ আইতা! আপুনি কেনে আছে আজি? আমি আপোনাৰ লগতে আছোঁ।",
            "শুভ দিন আইতা! আপোনাক আজি সুন্দৰ দেখিছে।",
            "নমস্কাৰ! আপুনি আহিলে আমাৰ মন ভাল হয়।",
            "আইতা, আপোনাক ভালোবাসোঁ। আজি কেনে লাগিছে?"
        ],
        confusion: [
            "এইটো ঠিকেই আছে আইতা, আমি ইয়াতেই আছোঁ। কোনো চিন্তা নকৰিব।",
            "আইতা, আপুনি নিৰাপদ আছে। মই আপোনাৰ সহযোগী। আমি একেলগে আছোঁ।",
            "অলপ অস্থিৰ লাগিছে নে? শান্তিকৈ উশাহ লওক। মই ইয়াতেই আছোঁ।",
            "এইটো স্বাভাৱিক আইতা। আপুনি ভাল মানুহ, আপুনি নিৰাপদ।"
        ],
        pain: [
            "আইতা, আপুনি ক'ত বিষ পাইছে? মই এখনেই কেয়াৰগিভাৰক মাতোঁ।",
            "বিষ লাগিছে নে? কেয়াৰগিভাৰক মাতিছোঁ এতিয়াই। আপুনি শুই থাকক।",
            "আপোনাৰ যন্ত্ৰণা বুজিছোঁ আইতা। সহায়ৰ বাবে মাতিছোঁ।"
        ],
        hunger: [
            "খাদ্যৰ কথা ভাবিছে? আজিৰ আহাৰৰ সময় হ'ল। কেয়াৰগিভাৰে আহিব।",
            "আইতা, ভোক লাগিছে নে? এইটো বহুত ভাল কথা। আহাৰ প্ৰস্তুত।",
            "খোৱা সময় হ'ল! আপোনাৰ প্ৰিয় ভোজন তৈয়াৰ হৈছে।"
        ],
        medicine: [
            "আইতা, দৰবৰ সময় হৈছে। আপোনাৰ স্বাস্থ্যৰ বাবে ইয়া খুব দৰকাৰী।",
            "দৰব খোৱাৰ সময় হ'ল। পানীৰ সৈতে লৈ লওক আইতা।",
            "আপোনাৰ দৰব তৈয়াৰ আছে। এইটো খালে ভাল থাকিব।"
        ],
        toilet: [
            "বাথৰুমলৈ যাব লাগে নে? মই সহায় কৰিবলৈ আছোঁ আইতা।",
            "সাৱধানে যাওক আইতা। সহায় লাগিলে মাতিব।",
            "এতিয়াই যোৱা ভাল। মই ইয়াতেই অপেক্ষা কৰিছোঁ।"
        ],
        family: [
            "আপোনাৰ পৰিয়ালে আপোনাক বহুত ভালপায়। তেওঁলোক শীঘ্ৰেই আহিব।",
            "আপোনাৰ জীয়েক আজি ফোন কৰিছিল। আপোনাৰ কথা সোধিলে।",
            "আপোনাৰ নাতি-নাতিনীসকলে আপোনাক মনত পেলাইছে।"
        ],
        memory_lapse: [
            "আইতা, এইটো স্বাভাৱিক। আপুনি ইয়াতে আছে, নিৰাপদ আছে। আমি একেলগে আছোঁ।",
            "মনত নাথাকিলেও চিন্তা নাই। আমি একেলগে মনত পেলাম।",
            "আজি আপুনি বহুত কাম কৰিলে। অলপ জিৰণি লওক।"
        ],
        game_help: [
            "এই খেলটো খেলিম নে আইতা? এইটো আমাৰ মনক সতেজ কৰে।",
            "আহক, একেলগে এই সুন্দৰ খেলটো খেলোঁ। কোনো খৰখেদা নাই।",
            "খেলিবলৈ মন আছে নে? মই সহায় কৰিম।"
        ],
        calm_request: [
            "শান্তিকৈ উশাহ লওক আইতা। এইদৰে... ধীৰে ধীৰে... ভালেই আছে।",
            "আহক বাঁহীৰ সুৰ শুনোঁ। মন শান্ত হ'ব।",
            "সবকিছু ঠিক আছে। আপুনি নিৰাপদ। শান্তিকৈ থাকক।"
        ],
        unknown: [
            "আইতা, আপোনাৰ কথা শুনিছোঁ। আকৌ এবাৰ কওক, মই বুজিবলৈ চেষ্টা কৰিম।",
            "আপুনি কি লাগে? আমি একেলগে বিচাৰি ল'ম।",
            "ঠিকেই আছে আইতা। আপুনি কি ক'ব বিচাৰিছে?"
        ]
    },

    // ─────────────────────────────────────────────
    //  BENGALI (bn)
    // ─────────────────────────────────────────────
    bn: {
        honorific: "দিদা",
        greeting: [
            "নমস্কার দিদা! আজকে কেমন আছেন? আমি আপনার পাশেই আছি।",
            "শুভ দিন দিদা! আপনাকে আজকে খুব সুন্দর দেখাচ্ছে।",
            "দিদা, আপনি এলে আমার মন ভালো হয়ে যায়।",
            "নমস্কার! আজকে কেমন লাগছে আপনার?"
        ],
        confusion: [
            "দিদা, সব ঠিক আছে। আমি এখানেই আছি। কোনো চিন্তা করবেন না।",
            "আপনি নিরাপদ আছেন। আমরা একসাথে আছি।",
            "একটু অস্থির লাগছে? ধীরে শ্বাস নিন। আমি পাশেই আছি।",
            "এটা স্বাভাবিক দিদা। আপনি ভালো মানুষ, নিরাপদ আছেন।"
        ],
        pain: [
            "দিদা, কোথায় ব্যথা লাগছে? এখনই পরিচর্যাকারীকে ডাকছি।",
            "ব্যথা লাগছে? সাথে সাথে সাহায্য আসছে। শুয়ে থাকুন।",
            "আপনার কষ্ট বুঝতে পারছি। সাহায্যের জন্য ডাকছি।"
        ],
        hunger: [
            "খেতে ইচ্ছে হচ্ছে? খাবারের সময় হয়েছে। পরিচর্যাকারী আসবেন।",
            "দিদা, ক্ষুধা লেগেছে? খুব ভালো কথা। খাবার তৈরি।",
            "খাওয়ার সময় হল! আপনার পছন্দের খাবার তৈরি আছে।"
        ],
        medicine: [
            "দিদা, ওষুধ খাওয়ার সময় হয়েছে। স্বাস্থ্যের জন্য খুব দরকারি।",
            "ওষুধ খাওয়ার সময় হল। জলের সাথে নিন দিদা।",
            "আপনার ওষুধ তৈরি আছে। এটা খেলে ভালো থাকবেন।"
        ],
        toilet: [
            "বাথরুমে যেতে হবে? আমি সাহায্য করতে আছি দিদা।",
            "সাবধানে যান দিদা। সাহায্য লাগলে ডাকবেন।",
            "এখনই যাওয়া ভালো। আমি এখানেই অপেক্ষা করছি।"
        ],
        family: [
            "আপনার পরিবার আপনাকে অনেক ভালোবাসে। তারা শীঘ্রই আসবে।",
            "আপনার মেয়ে আজকে ফোন করেছিল। আপনার কথা জিজ্ঞেস করল।",
            "আপনার নাতি-নাতনিরা আপনাকে মনে করছে।"
        ],
        memory_lapse: [
            "দিদা, এটা স্বাভাবিক। আপনি এখানে আছেন, নিরাপদ আছেন।",
            "মনে না থাকলেও চিন্তা নেই। আমরা একসাথে মনে করব।",
            "আজকে অনেক কিছু করলেন। একটু বিশ্রাম নিন।"
        ],
        game_help: [
            "একটু খেলব দিদা? এটা আমাদের মন তাজা করে।",
            "চলুন একসাথে এই সুন্দর খেলাটা খেলি। কোনো তাড়া নেই।",
            "খেলতে ইচ্ছে হচ্ছে? আমি সাহায্য করব।"
        ],
        calm_request: [
            "ধীরে শ্বাস নিন দিদা। এইভাবে... আস্তে আস্তে... ভালোই আছে।",
            "চলুন বাঁশির সুর শুনি। মন শান্ত হবে।",
            "সব ঠিক আছে। আপনি নিরাপদ। শান্তিতে থাকুন।"
        ],
        unknown: [
            "দিদা, আপনার কথা শুনছি। আবার বলুন, আমি বোঝার চেষ্টা করব।",
            "আপনার কি দরকার? আমরা একসাথে খুঁজে নেব।",
            "ঠিক আছে দিদা। আপনি কী বলতে চাইছেন?"
        ]
    },

    // ─────────────────────────────────────────────
    //  HINDI (hi)
    // ─────────────────────────────────────────────
    hi: {
        honorific: "अम्माजी",
        greeting: [
            "नमस्ते अम्माजी! आज आप कैसी हैं? मैं आपके पास ही हूँ।",
            "शुभ दिन अम्माजी! आज आप बहुत अच्छी लग रही हैं।",
            "अम्माजी, आप आईं तो मन खुश हो गया।",
            "नमस्ते! आज कैसा महसूस हो रहा है आपको?"
        ],
        confusion: [
            "अम्माजी, सब ठीक है। मैं यहीं हूँ। कोई चिंता मत करिए।",
            "आप बिल्कुल सुरक्षित हैं। हम साथ हैं।",
            "थोड़ी बेचैनी हो रही है? धीरे-धीरे साँस लीजिए। मैं पास हूँ।",
            "यह स्वाभाविक है अम्माजी। आप अच्छी इंसान हैं, सुरक्षित हैं।"
        ],
        pain: [
            "अम्माजी, कहाँ दर्द हो रहा है? अभी देखभालकर्ता को बुलाती हूँ।",
            "दर्द है? तुरंत मदद आ रही है। आप लेटी रहिए।",
            "आपका दर्द समझ रही हूँ। मदद के लिए बुला रही हूँ।"
        ],
        hunger: [
            "खाना खाने का मन है? खाने का समय हो गया है। देखभालकर्ता आएंगे।",
            "अम्माजी, भूख लगी है? बहुत अच्छी बात है। खाना तैयार है।",
            "खाने का समय हो गया! आपकी पसंद का खाना बना है।"
        ],
        medicine: [
            "अम्माजी, दवाई लेने का समय हो गया है। सेहत के लिए बहुत ज़रूरी है।",
            "दवाई का समय हुआ। पानी के साथ लीजिए अम्माजी।",
            "आपकी दवाई तैयार है। यह लेने से अच्छा रहेंगे।"
        ],
        toilet: [
            "बाथरूम जाना है? मैं मदद करने के लिए हूँ अम्माजी।",
            "सावधानी से जाइए अम्माजी। मदद चाहिए तो बुलाइए।",
            "अभी जाना अच्छा रहेगा। मैं यहीं इंतज़ार करती हूँ।"
        ],
        family: [
            "आपका परिवार आपसे बहुत प्यार करता है। वे जल्द आएंगे।",
            "आपकी बेटी ने आज फ़ोन किया था। आपके बारे में पूछ रही थी।",
            "आपके पोते-पोतियाँ आपको याद कर रहे हैं।"
        ],
        memory_lapse: [
            "अम्माजी, यह स्वाभाविक है। आप यहाँ हैं, सुरक्षित हैं। हम साथ हैं।",
            "याद न आए तो चिंता नहीं। हम मिलकर याद करेंगे।",
            "आज बहुत काम किया आपने। थोड़ा आराम कीजिए।"
        ],
        game_help: [
            "थोड़ा खेलें अम्माजी? यह हमारा मन तरोताज़ा करता है।",
            "आइए मिलकर यह सुंदर खेल खेलें। कोई जल्दी नहीं।",
            "खेलने का मन है? मैं मदद करूँगी।"
        ],
        calm_request: [
            "धीरे-धीरे साँस लीजिए अम्माजी। ऐसे... आहिस्ता... बहुत अच्छा।",
            "आइए बाँसुरी की धुन सुनें। मन शांत हो जाएगा।",
            "सब ठीक है। आप सुरक्षित हैं। शांति से रहिए।"
        ],
        unknown: [
            "अम्माजी, आपकी बात सुन रही हूँ। एक बार फिर बताइए, मैं समझने की कोशिश करूँगी।",
            "आपको क्या चाहिए? हम मिलकर ढूँढेंगे।",
            "ठीक है अम्माजी। आप क्या कहना चाहती हैं?"
        ]
    },

    // ─────────────────────────────────────────────
    //  ENGLISH (en)
    // ─────────────────────────────────────────────
    en: {
        honorific: "dear",
        greeting: [
            "Hello dear! How are you feeling today? I'm right here with you.",
            "Good day! You're looking lovely today.",
            "Hello! I'm so happy to see you. How are you doing?",
            "Good to see you today! How are you feeling?"
        ],
        confusion: [
            "It's okay dear, I'm right here with you. There's nothing to worry about.",
            "You are safe. We are together. Everything is alright.",
            "Feeling a little unsettled? Let's breathe slowly together. I'm right here.",
            "This is perfectly normal. You are a wonderful person and you are safe."
        ],
        pain: [
            "Where does it hurt? I'm calling your caregiver right away.",
            "You're in pain? Help is coming right now. Please stay comfortable.",
            "I understand you're hurting. I'm getting help for you."
        ],
        hunger: [
            "Feeling hungry? It's meal time. Your caregiver will bring your food.",
            "You're hungry? Wonderful. Your meal is ready.",
            "Time to eat! Your favourite food has been prepared."
        ],
        medicine: [
            "It's time for your medicine dear. It's very important for your health.",
            "Medicine time! Please take it with some water.",
            "Your medicine is ready. This will help you feel well."
        ],
        toilet: [
            "Need to use the bathroom? I'm here to help.",
            "Please go carefully dear. Call me if you need help.",
            "That's a good idea to go now. I'll wait right here."
        ],
        family: [
            "Your family loves you very much. They'll be here soon.",
            "Your daughter called today. She was asking about you.",
            "Your grandchildren are thinking of you."
        ],
        memory_lapse: [
            "That's perfectly okay. You're here, you're safe. We're together.",
            "No need to remember everything. We'll figure it out together.",
            "You've done so much today. Let's have a little rest."
        ],
        game_help: [
            "Shall we play a game? It helps keep our mind fresh.",
            "Let's play this lovely game together. There's no rush at all.",
            "Would you like to play? I'll help you along the way."
        ],
        calm_request: [
            "Let's breathe slowly together dear. Like this... in and out... very good.",
            "Let's listen to the flute music. It will calm your mind.",
            "Everything is fine. You are safe. Please relax."
        ],
        unknown: [
            "I'm listening dear. Could you say that again? I want to understand you.",
            "What do you need? Let's figure it out together.",
            "That's alright dear. What would you like to say?"
        ]
    },

    // ─────────────────────────────────────────────
    //  BODO (brx)
    // ─────────────────────────────────────────────
    brx: {
        honorific: "आबै",
        greeting: [
            "नमस्कार आबै! दिनै नोंथाङा बे मोजां दं? मो नोंथांखौ हेफाजाब दाहाना थानाय।",
            "मोजां फुंनि समाव आबै! नोंथांखौ मोजां नागिरनाय।",
            "आबै, नोंथाङा आनो मोनाबिलिनि सानावनो गोसो फोसांनाय।",
            "नमस्कार! दिनै नोंथाङा बेरे लाबाय?"
        ],
        confusion: [
            "आबै, जेबो थाब खालामनाङा। मो बेयो थानाय। चिन्ता खालामनाङा।",
            "नोंथाङा गोख्रों दं। आमि इसे-इसे थानाय।",
            "अस्थिर लाबाय? लासैनि हां ला। मो बेयो थानाय।",
            "बे स्वाभाविक आबै। नोंथाङा मोजां मानसि, गोख्रों दं।"
        ],
        pain: [
            "आबै, नोंथांनि बेजा ग'? मो एखोनेइ हेफाजाबगिरिखौ आसोम खालामोन।",
            "बिजाब लाबाय? हेफाजाब फैनाय। हानजानाव था।",
            "नोंथांनि बिजाब बुजिनाय। हेफाजाबखौ मातोन।"
        ],
        hunger: [
            "खाबाr मन दं? खानाय सम जादों। हेफाजाबगिरि फैब।",
            "आबै, भोक लाबाय? बे मोजां कथा। खाबार थैनाय।",
            "खानाय सम जादों! नोंथांनि मोजाव खाबार थैनाय।"
        ],
        medicine: [
            "आबै, औशद लोंनाय सम जादों। नोंथांनि देहानि थाखाय जरुरी।",
            "औशद लोंनाय सम। दैजों लोंना लादो आबै।",
            "नोंथांनि औशद थैनाय। बे लोंनायनो मोजां थाब।"
        ],
        toilet: [
            "बाथरुमआव थांनो नांगौ? मो हेफाजाब खालामनाय आबै।",
            "गोख्रोंनि थांदो आबै। हेफाजाब नांगौसो मातो।",
            "बेयोनो थांनाय मोजां। मो बेयो गाबखि थानाय।"
        ],
        family: [
            "नोंथांनि मुलुगसिंआ नोंथांखौ जोबोद मोजाव सान्थिगासिनो थानाय। तखो फैनाय।",
            "नोंथांनि जिउ-बिनि रंजिनाव फन खालामदों। नोंथांनि बिसोरबो दं।",
            "नोंथांनि बि-हिनिफ्राइसिंआ नोंथांखौ मोन लागासिनो थानाय।"
        ],
        memory_lapse: [
            "आबै, बे स्वाभाविक। नोंथाङा बेयो दं, गोख्रों दं। आमि इसे थानाय।",
            "मोन नाथाङोसो चिन्ता खालामनाङा। आमि इसे-इसे मोन गियाव लोमोन।",
            "दिनैयाव जोबोद खामानि मावदों। इसेल' गाब लाना लादो।"
        ],
        game_help: [
            "गेले खालामोन आबै? बेयो गोसो फोसांनाय।",
            "आनो बे मोजां गेले इसे-इसे खेलोन। थाब-थाब खालामनाङा।",
            "खेलनो मन दं? मो हेफाजाब खालामोन।"
        ],
        calm_request: [
            "लासैनि हां लादो आबै। बेरेबो... लासैनि... मोजां।",
            "आनो सिफुंनि सुंदोब खोनासोन। गोसो सान्ति जाब।",
            "जेबो थाब आसे। नोंथाङा गोख्रों। सान्तियाव था।"
        ],
        unknown: [
            "आबै, नोंथांनि गाव खोनासोन। एबारायनो थां, मो बुजिनाय थाखाय।",
            "नोंथांखौ बे नांगौ? आमि इसे-इसे सोमोन।",
            "थाबेई दं आबै। नोंथाङा बे थांनाय?"
        ]
    },

    // ─────────────────────────────────────────────
    //  MANIPURI / MEITEI (mni)
    // ─────────────────────────────────────────────
    mni: {
        honorific: "ইমা",
        greeting: [
            "নমস্কার ইমা! ঙসিদি নহাক্না কনা লৈরি? ঐ নহাক্কী মপাক্তা লৈরি।",
            "য়াইফপাউজেল ইমা! ঙসিদি নহাক্না য়াম্না ফরে।",
            "ইমা, নহাক পুখ্রে চাদুনা ঐগী মনাও নুংঙাইজে।",
            "নমস্কার! ঙসিদি কনা চাদুনা লৈরি?"
        ],
        confusion: [
            "ইমা, মতৌ থম্বিরে। ঐ বেযো লৈরি। ৱাবা পোকপীনু।",
            "নহাক শেংনা লৈরি। ঐখোয় লোয়ননা লৈরি।",
            "খর ওজা লৈতে? তপ্না ঈশাবা থাবিযু। ঐ মপাক্তা লৈরি।",
            "মতৌ মতৌ ইমা। নহাক ফরিবা মীওই, শেংনা লৈরি।"
        ],
        pain: [
            "ইমা, কনা থবিরে? ঙানি য়েংশিনবীরিবগী মতেং পাংবিরি।",
            "নাবা লৈরে? মতেং পাংবা লাকপা ঙম্মি। পীথোকপা থাবিযু।",
            "নহাকপু নাবিরিবা বুঝিজি। মতেং পাংবীগুমক মাতিরি।"
        ],
        hunger: [
            "চাবা মনুং দুনা থবক্তুরে? চাবগী মতম ওইখ্রে। য়েংশিনবী লাকপা ঙম্মি।",
            "ইমা, অদোম্না চাদে? য়াম্না ফরে। চানবীরিবা থৈরে।",
            "চাবগী মতম ওইখ্রে! অদোমগী মনপাল চানা থৈরে।"
        ],
        medicine: [
            "ইমা, হিদাক চাবগী মতম ওইখ্রে। হকশেলদা য়াম্না থৌদাং লৈ।",
            "হিদাক মতম ওইখ্রে। ঈশিংনা চাবিযু ইমা।",
            "নহাকপী হিদাক থৈরে। হিদাক চারকপনা হকশেল ফৈ।"
        ],
        toilet: [
            "থোংনবা চৎপা মনুং দুনা থবক্তুরে? ঐ মতেং পাংবিরি ইমা।",
            "চুম্নমক চৎবিযু ইমা। মতেং পাংবা নাকথোকপগুম্ব মাতবিযু।",
            "ঙানি চৎপা ফরে। ঐ বেযো ঙাকথোকপা থাবিরি।"
        ],
        family: [
            "নহাকপী অমুক্তাগী মীওইশিংনা নহাকপু য়াম্না নুংঙাইরি। তখোনা লাকপা ঙম্মি।",
            "নহাকপী ইচেনা ঙসিদি ফোন তৌখ্রে। নহাকপী মতাং পানখ্রে।",
            "নহাকপী ইপুশিং/ইচেশিংনা নহাকপু মোন লৈরি।"
        ],
        memory_lapse: [
            "ইমা, মতৌ মতৌ। নহাক বেযো লৈরি, শেংনা লৈরি। ঐখোয় লোয়ননা লৈরি।",
            "মনুপা না থোকপা নত্রগা ৱাবা পোকপীনু। ঐখোয় পুম্নমক লোয়ননা অতৌবা চিন্থোকপা ঙম্মি।",
            "ঙসিদি য়াম্না থবক তৌখ্রে। খর থোকচিন্নবিযু।"
        ],
        game_help: [
            "শান্নপোৎ শানবিম ইমা? অদুনা ঐখোয়গী মনাও শেং ওই।",
            "আহানবদা শান্নপোৎ শানবিম। থৌরাং য়াওদে।",
            "শানবা মনুং দুনা থবক্তুরে? ঐ মতেং পাংবিরি।"
        ],
        calm_request: [
            "তপ্না ঈশাবা থাবিযু ইমা। অদুনা... তপ্না... য়াম্না ফরে।",
            "বাংশী খোন্থোক্কা ঙাকথোকপা থাবিম। মনাও শান্তি ওই।",
            "মতৌ ওইরে। নহাক শেংনা লৈরি। শান্তিনা থাবিযু।"
        ],
        unknown: [
            "ইমা, নহাকপী ৱারোল মীৎয়েংনা ঙাকখ্রে। অমক পান্নবিযু, বুঝবা মপাং চিন্থোকপা ঙম্মি।",
            "নহাকপী করিগুম্ব মনুং দুনা থবক্তুরে? ঐখোয় লোয়ননা লাউথোকপা ঙম্মি।",
            "মতৌ মতৌ ইমা। নহাক করি পানবা মপাং চিন্থোকপা ঙম্মি?"
        ]
    },

    // ─────────────────────────────────────────────
    //  MIZO (lus)
    // ─────────────────────────────────────────────
    lus: {
        honorific: "Nu",
        greeting: [
            "Chibai Nu! Vawiin i hrisel em? Ka in lama ka nei reng che.",
            "Zing chibai Nu! Vawiin i ropuia a lang.",
            "Nu, i lo kal chuan ka lawm a.",
            "Chibai! Vawiin i zia leh i ti chhuak tur engmah hian a ngai lo."
        ],
        confusion: [
            "Nu, thil zawng zawng a ṭha tawh. Hei hian kan nei bik a. Hmanhmawh suh.",
            "I hmuhnawh lo. Kan inkhawm reng a ni.",
            "A ngaihawm deuh em? Hahdam takin thawk la. Ka in lama ka nei.",
            "A normal a ni Nu. I chhia lo, i hmuhnawh lo."
        ],
        pain: [
            "Nu, engtin nge i na? Kan enkawltu chu ṭhla in a ko ang.",
            "I na em? Hmalak takin mipui lam in a lo thleng ang. I thlakin awm rawh.",
            "I na tih hi kan hria. Enkawltu ko turin inbuatsaih a ni."
        ],
        hunger: [
            "Ei duh maw? Ei hun a thleng tawh. Enkawltu in i ei lam a thawn ang.",
            "Nu, i rilru in a duh em? A ṭha hle. Ei a inbuatsaih tawh.",
            "Ei hun a thleng tawh! I ngah ber ei a siamsak tawh."
        ],
        medicine: [
            "Nu, damdawi ei hun a thleng tawh. I taksa hriselna tur a pawimawh.",
            "Damdawi ei hun a ni. Tui nen ei rawh Nu.",
            "I damdawi a lo inbuatsaih tawh. Hei hi ei a, i hrisel ang."
        ],
        toilet: [
            "Toilet lam pan tur em? Ka lo puih ang che Nu.",
            "Hahdam takin kal rawh Nu. Kan mipui lam in i pui ang.",
            "A ṭha ber mai lo kal rawh. Hei ah hian ka kanna ang."
        ],
        family: [
            "I chhungkua in a hmangaih aiin i hmangaih zawk. An lo kal dang ang.",
            "I nau chuan vawiin ṭheuh a ziak. I bula i buaipui dan a zawt.",
            "I fate leh i tlaangval te chuan i ngaithla an nei reng."
        ],
        memory_lapse: [
            "Nu, a normal a ni. Hei ah hian i awm reng, i hmuhnawh lo. Kan inkhawm.",
            "A hriat duh loh pawhin a harsa lo. Kan zawh leh bawk ang.",
            "Vawiin i thil tam tak a tih tawh. Hahdam takin thlamuang rawh."
        ],
        game_help: [
            "Infiamna hmang a beisei em Nu? Thluak ṭha taka awm duh nan a pawimawh.",
            "Hei infiamna hi inkhawm taka ti kan tum ang. Hmanhmawh a ngai lo.",
            "Infiamna duh em? Ka lo puih ang che."
        ],
        calm_request: [
            "Hahdam takin thawk la Nu. Hei... a ṭha ber mai... a ṭha hle.",
            "Rawrawt tum ri kan la ngen ang. Rilru a thlamuang ang.",
            "Thil zawng zawng a ṭha tawh. I hmuhnawh lo. Hahdam takin awm rawh."
        ],
        unknown: [
            "Nu, i biak hian ka lo ngaihthlak. A tawi tak lamah chuan lo biak leh rawh.",
            "I duhdan engmah nge a ni? Inkhawm taka kan zawh ang.",
            "A ṭha ber mai Nu. I tih duh engmah nge a ni?"
        ]
    },

    // ─────────────────────────────────────────────
    //  KHASI (kha)
    // ─────────────────────────────────────────────
    kha: {
        honorific: "Kong",
        greeting: [
            "Khublei Kong! Mynta phi kynmaw bha? Nga don ha ka por phi.",
            "Khublei shibun Kong! Mynta phi lah bha.",
            "Kong, phi la wan, ka jingsngewthuh jong nga la bha.",
            "Khublei! Mynta phi zia bha?"
        ],
        confusion: [
            "Kong, ki jinglong kynthup. Nga don bha. Wat syndet.",
            "Phi hmuhnawh. Ngi don lungrang.",
            "Ka jingkyllong la dei em? Dih khyndiat maw chym mynhynniew. Nga don bha.",
            "Ka jinglong bha a ni Kong. Phi don bha, phi hmuhnawh."
        ],
        pain: [
            "Kong, katno nge phi na? Nga ban khot ia u nongsumar mynhynniew.",
            "Phi na em? Ka mphaw la wanhi mynhynniew. Phi iau ngut.",
            "Nga thongsim ia ka jingna jong phi. Nga ban khot ia ka mphaw."
        ],
        hunger: [
            "Phi duh dep em? Ka por dep la wanhi. Ka nongsumar ban thong ia ka dep.",
            "Kong, phi bam duh em? Ka jinglong bha. Ka dep la sngap.",
            "Ka por dep la wanhi! Ka dep ba phi duh tam tam la sngap."
        ],
        medicine: [
            "Kong, ka por dih dawai la wanhi. Ka jinglong bha bha a ba pawmawh.",
            "Ka por dih dawai la ni. Dih naka um Kong.",
            "Ka dawai jong phi la sngap. Dih phi dawai, phi ban lah bha."
        ],
        toilet: [
            "Phi duh leh sha ka kynmaw bathroom em? Nga ban ïarap ia phi Kong.",
            "Leit suki suki Kong. Leit ka mphaw lada phi duh ïarap.",
            "Leit mynhynniew a bha. Nga ban iau phi bynta hei."
        ],
        family: [
            "Ka chnong jong phi la nyngkong ia phi hoi. Kini ban leit wan.",
            "Ka ichai jong phi la khot mynta. Ka la ñiuh ia phi.",
            "Ki lakha jong phi la kynmaw ia phi."
        ],
        memory_lapse: [
            "Kong, ka jinglong bha a ni. Phi don hei, phi hmuhnawh. Ngi don lungrang.",
            "Lada phi khlem kyrteng, wat ïeid. Ngi ban ïarap long.",
            "Mynta phi la trei shongkynmaw. Iau shibun."
        ],
        game_help: [
            "Ngi ban khelh em Kong? Heiwei ban sngap ka jingmut jong ngi.",
            "Bynta ïa ka jingkhelh mynhynniew. Ki jing eiei ym don.",
            "Phi duh khelh em? Nga ban ïarap ia phi."
        ],
        calm_request: [
            "Chym mynhynniew maw ïa ka sngew Kong. Heiwei... khyndiat khyndiat... bha shibun.",
            "Ngi la la ngaiñiuh ïa ka ri. Ka jingmut ban bha.",
            "Ki jinglong kynthup. Phi hmuhnawh. Iau suki suki."
        ],
        unknown: [
            "Kong, nga la ngiñiuh ia phi. Ong leh shibun, nga ban pynsyiem.",
            "Phi duh engmah em? Ngi ban la long.",
            "Ka jinglong bha a ni Kong. Phi duh ong engmah em?"
        ]
    }
};

// Dementia-specific safety escalation keywords — per language
const DISTRESS_KEYWORDS = {
    as: ['বিষ', 'বেজা', 'ভয়', 'সহায়', 'পৰিব', 'পৰিছে', 'লুটি', 'মাতক', 'যাব'],
    bn: ['ব্যথা', 'কষ্ট', 'ভয়', 'সাহায্য', 'পড়ে', 'পড়িছি', 'ডাকো', 'যাব'],
    hi: ['दर्द', 'चोट', 'डर', 'मदद', 'गिर', 'गिरा', 'बुलाओ', 'जाना'],
    en: ['pain', 'hurt', 'fell', 'fall', 'scared', 'help', 'emergency', 'dying', 'gone', 'lost'],
    brx: ['बिजाब', 'बि जाब', 'नाहाय', 'हेफाजाब', 'मात', 'थांनो'],
    mni: ['নাবা', 'নাবি', 'ৱাবা', 'মতেং', 'চাদুনা', 'চৎপা'],
    lus: ['na', 'tla', 'hmusit', 'ṭha lo', 'pawl', 'tanpui', 'kal'],
    kha: ['na', 'man', 'shuh', 'mphaw', 'ïarap', 'leit']
};

// Sundowning / late-day confusion markers
const SUNDOWNING_PHRASES = {
    as: ['ঘৰলৈ যাব', 'ঘৰ বিচাৰি', 'আমাৰ ঘৰ', 'মোৰ মা', 'মোক ল'],
    bn: ['বাড়ি যাব', 'বাড়ি খুঁজি', 'আমাদের বাড়ি', 'আমার মা', 'নিয়ে যাও'],
    hi: ['घर जाना', 'घर ढूंढ', 'हमारा घर', 'मेरी माँ', 'ले जाओ'],
    en: ['go home', 'find home', 'my home', 'my mother', 'take me', 'i want to leave'],
    brx: ["\u09a8\u09cb \u09a5\u09be\u0902\u09a8\u09cb", "\u0997\u09be\u09ae \u09a5\u09be\u0902\u09a8\u09cb"],
    mni: ["\u09af\u09bc\u09c1\u09ae \u099a\u09ce\u09aa\u09be", "\u09af\u09bc\u09c1\u09ae \u09b2\u09c7\u09aa\u09aa\u09be"],
    lus: ['in pan', 'in kal', 'in duh'],
    kha: ['leit sha ing', 'ing ñiuh']
};

// Export globals
window.CARETAKER_RESPONSES = CARETAKER_RESPONSES;
window.DISTRESS_KEYWORDS = DISTRESS_KEYWORDS;
window.SUNDOWNING_PHRASES = SUNDOWNING_PHRASES;
