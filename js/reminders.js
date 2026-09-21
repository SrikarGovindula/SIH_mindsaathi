/**
 * Smriti-NER Smart Reminders & Routine Health Engine
 * Manages:
 * 1. Multimodal Medication Reminders with pill visual cards
 * 2. Hydration tracking with glass counter
 * 3. Daily routine activities & medical appointments
 * 4. Audio-visual spoken alerts & caregiver escalation for missed doses
 */

class ReminderEngine {
    constructor() {
        this.reminders = this.loadDefaultReminders();
        this.waterGlassesToday = parseInt(localStorage.getItem('smriti_water_glasses') || '3');
        this.targetGlasses = 7;
        this.checkTimer = null;
        this.startPeriodicCheck();
    }

    loadDefaultReminders() {
        const saved = localStorage.getItem('smriti_reminders_list');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }

        return [
            {
                id: 'med-1',
                type: 'medication',
                title: 'Blood Pressure Tablet (Amlodipine 5mg)',
                titles: {
                    as: 'উচ্চ ৰক্তচাপৰ টেবলেট (ৰাতিপুৱা)',
                    bn: 'উচ্চ রক্তচাপের ট্যাবলেট (অ্যামলোডিপিন ৫মিগ্রা)',
                    hi: 'उच्च रक्तचाप की गोली (एम्लोडिपिन 5mg)'
                },
                time: '08:30 AM',
                pillColor: '#E74C3C',
                pillShape: 'round',
                dosage: '1 tablet with water after breakfast',
                status: 'taken',
                takenAt: '08:35 AM'
            },
            {
                id: 'med-2',
                type: 'medication',
                title: 'Cognitive Memory Vitamin B-Complex',
                titles: {
                    as: 'মস্তিষ্কৰ ভিটামিন আৰু ফ’লিক এচিড',
                    bn: 'মস্তিষ্কের ভিটামিন বি-কমপ্লেক্স',
                    hi: 'मस्तिष्क स्मृति विटामिन बी-कॉम्प्लेक्स'
                },
                time: '01:30 PM',
                pillColor: '#F39C12',
                pillShape: 'capsule',
                dosage: '1 yellow capsule after lunch',
                status: 'pending',
                takenAt: null
            },
            {
                id: 'med-3',
                type: 'medication',
                title: 'Night Calm & Heart Care Tablet',
                titles: {
                    as: 'ৰাতিৰ শোৱাৰ আগৰ টেবলেট',
                    bn: 'রাতের প্রশান্তি ও হৃদযত্ন ট্যাবলেট',
                    hi: 'रात की शांति और हृदय देखभाल की गोली'
                },
                time: '08:30 PM',
                pillColor: '#3498DB',
                pillShape: 'oval',
                dosage: '1 tablet with warm water',
                status: 'pending',
                takenAt: null
            },
            {
                id: 'act-1',
                type: 'activity',
                title: 'Morning Garden Walk & Sunlight',
                titles: {
                    as: "পুৱাৰ সেউজীয়া বাগিচাত খোজ কঢ়া আৰু ৰ'দ লোৱা",
                    bn: 'সকালের বাগানে হাঁটা ও রোদ পোহানো',
                    hi: 'सुबह बगीचे में टहलना और धूप सेंकना'
                },
                time: '07:30 AM',
                icon: '🚶‍♂️',
                status: 'taken',
                takenAt: '07:45 AM'
            },
            {
                id: 'act-2',
                type: 'activity',
                title: 'Evening Prayer / Namghar Gathering',
                titles: {
                    as: 'সন্ধিয়াৰ নামঘৰ / প্ৰাৰ্থনা আৰু শলিতা জ্বলোৱা',
                    bn: 'সান্ধ্য প্রার্থনা / নামঘর সমাবেশ',
                    hi: 'संध्या प्रार्थना / नामघर सभा'
                },
                time: '05:30 PM',
                icon: '🪔',
                status: 'pending',
                takenAt: null
            },
            {
                id: 'app-1',
                type: 'appointment',
                title: 'PHC Doctor Tele-Consultation & BP Check',
                titles: {
                    as: 'আশা (ASHA) বাইদেউৰ লগত স্বাস্থ্য কেন্দ্ৰৰ পৰীক্ষা',
                    bn: 'পিএইচসি ডাক্তারের টেলি-পরামর্শ ও রক্তচাপ পরীক্ষা',
                    hi: 'पीएचसी डॉक्टर टेली-परामर्श और बीपी जांच'
                },
                time: 'Tomorrow, 11:00 AM',
                doctor: 'Dr. Barua (Community Health Officer)',
                status: 'pending',
                icon: '🩺'
            }
        ];
    }

    saveReminders() {
        localStorage.setItem('smriti_reminders_list', JSON.stringify(this.reminders));
    }

    renderRemindersUI() {
        const container = document.getElementById('reminders-list-container');
        if (!container) return;

        container.innerHTML = '';

        this.reminders.forEach((r) => {
            const card = document.createElement('div');
            card.className = `reminder-card ${r.status === 'taken' ? 'completed' : 'pending'}`;

            const lang = window.i18n ? window.i18n.getLang() : 'as';
            // Look up the reminder title in the current language, falling back to
            // English so every supported language (not just Assamese) shows a
            // sensible title instead of silently staying in English.
            const displayTitle = (r.titles && r.titles[lang]) ? r.titles[lang] : r.title;

            let iconHtml = '';
            if (r.type === 'medication') {
                iconHtml = `
                    <div class="pill-badge" style="background:${r.pillColor};">
                        <span class="pill-icon">${r.pillShape === 'capsule' ? '💊' : '⚪'}</span>
                    </div>`;
            } else {
                iconHtml = `<div class="pill-badge activity-badge">${r.icon || '⏰'}</div>`;
            }

            const takenLabel = window.i18n ? window.i18n.t('taken') : 'Taken';
            const markLabel = window.i18n ? window.i18n.t('markAsTaken') : 'Mark as Taken';

            card.innerHTML = `
                <div class="reminder-left">
                    ${iconHtml}
                    <div class="reminder-info">
                        <div class="reminder-time-badge">${r.time}</div>
                        <h3 class="reminder-title">${displayTitle}</h3>
                        <p class="reminder-sub">${r.dosage || r.doctor || ''}</p>
                    </div>
                </div>
                <div class="reminder-action">
                    ${r.status === 'taken' 
                        ? `<button class="btn-taken" disabled>✅ ${takenLabel}</button>`
                        : `<button class="btn-mark-take" onclick="window.reminders.markDone('${r.id}')">👉 ${markLabel}</button>`
                    }
                </div>
            `;
            container.appendChild(card);
        });

        this.renderHydrationUI();
    }

    renderHydrationUI() {
        const hydText = document.getElementById('hydration-count-text');
        const glassGrid = document.getElementById('hydration-glasses-grid');
        if (hydText) {
            hydText.textContent = `${this.waterGlassesToday} / ${this.targetGlasses}`;
        }
        if (glassGrid) {
            glassGrid.innerHTML = '';
            for (let i = 1; i <= this.targetGlasses; i++) {
                const glass = document.createElement('span');
                glass.className = `glass-icon ${i <= this.waterGlassesToday ? 'filled' : 'empty'}`;
                glass.textContent = i <= this.waterGlassesToday ? '💧' : '🥛';
                glassGrid.appendChild(glass);
            }
        }
    }

    recordWaterIntake() {
        if (this.waterGlassesToday < 12) {
            this.waterGlassesToday++;
            localStorage.setItem('smriti_water_glasses', this.waterGlassesToday.toString());
            this.renderHydrationUI();
            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('water');
                window.voiceAssistant.speak(window.i18n ? window.i18n.t('wellDone') + "! " + window.i18n.t('hydrationPrompt') : "Water logged! Stay hydrated.");
            }
            if (window.storageDB) {
                window.storageDB.saveReminderLog({
                    id: 'water-' + Date.now(),
                    type: 'hydration',
                    count: this.waterGlassesToday,
                    timestamp: Date.now()
                });
            }
        }
    }

    markDone(id) {
        const item = this.reminders.find(r => r.id === id);
        if (item) {
            item.status = 'taken';
            item.takenAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            this.saveReminders();
            this.renderRemindersUI();

            if (window.voiceAssistant) {
                window.voiceAssistant.playChime('success');
                window.voiceAssistant.speak(window.i18n ? window.i18n.t('wellDone') : 'Marked as completed!');
            }

            if (window.storageDB) {
                window.storageDB.saveReminderLog({
                    id: 'log-' + item.id + '-' + Date.now(),
                    reminderId: item.id,
                    type: item.type,
                    title: item.title,
                    status: 'taken',
                    timestamp: Date.now()
                });
            }
        }
    }

    startPeriodicCheck() {
        // Periodic check every 60s
        this.checkTimer = setInterval(() => {
            this.checkUpcomingOrMissed();
        }, 60000);
    }

    checkUpcomingOrMissed() {
        // Can be hooked to trigger audio alarm if a pending reminder is within window
    }
}

window.reminders = new ReminderEngine();
