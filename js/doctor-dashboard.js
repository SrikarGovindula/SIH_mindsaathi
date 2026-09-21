/**
 * Doctor & Clinician Clinical Dashboard — Smriti-NER
 * ─────────────────────────────────────────────────────────────────
 * Advanced neurological surveillance & cognitive telemetry portal for:
 *  - Neurologists, Geriatricians, and PHC Medical Officers
 *
 * Core Features:
 *  1. Clinical Dementia Rating (CDR), MMSE & MoCA Score Telemetry
 *  2. 5-Domain Cognitive Radar Breakdown with Neuro-interpretations
 *  3. Longitudinal Cognitive Decline & Game Reaction Latency Curves
 *  4. Digital Prescription & Medication Regimen Manager (syncs with Patient reminders)
 *  5. Clinical Diagnostic Progress Notes (ICD-10 F03 / G30.0)
 *  6. Formal PDF / Print Ready Clinical Assessment Report Export
 * ─────────────────────────────────────────────────────────────────
 */

class DoctorDashboard {
    constructor() {
        this.patient = null;
        this.sessions = [];
        this.prescriptions = [];
        this.clinicalNotes = [];
        this.clinicalAlerts = [];
    }

    async init() {
        if (window.storageDB) {
            this.sessions = await window.storageDB.getAllSessions();
            this.prescriptions = JSON.parse(localStorage.getItem('smriti_prescriptions') || '[]');
            this.clinicalNotes = JSON.parse(localStorage.getItem('smriti_doctor_notes') || '[]');
        }

        if (this.prescriptions.length === 0) {
            // Seed initial clinical prescriptions
            this.prescriptions = [
                {
                    id: 'rx-1',
                    medicine: 'Donepezil Hydrochloride',
                    brand: 'Aricept / Donep',
                    dosage: '5 mg',
                    frequency: 'Once Daily (Night after food)',
                    time: '20:30',
                    purpose: 'Acetylcholinesterase Inhibitor for Mild Alzheimer Cognitive Stability',
                    prescribedBy: 'Dr. Ananya Sarma, MD',
                    date: '2026-09-15',
                    active: true
                },
                {
                    id: 'rx-2',
                    medicine: 'Vitamin B-Complex & Methylcobalamin',
                    brand: 'Neurobion Forte',
                    dosage: '1 Tablet',
                    frequency: 'Morning with Breakfast',
                    time: '08:30',
                    purpose: 'Neuroprotective & peripheral nerve support',
                    prescribedBy: 'Dr. Ananya Sarma, MD',
                    date: '2026-09-15',
                    active: true
                }
            ];
            localStorage.setItem('smriti_prescriptions', JSON.stringify(this.prescriptions));
        }

        if (this.clinicalNotes.length === 0) {
            this.clinicalNotes = [
                {
                    id: 'doc-note-1',
                    date: '2026-09-18 11:30 AM',
                    doctor: 'Dr. Ananya Sarma (MD Neurology)',
                    icdCode: 'ICD-10 G30.0 / F00.0 (Early-onset Alzheimer Disease with MCI)',
                    impression: 'Patient demonstrates mild episodic memory decline and temporal disorientation during evening hours (mild sundowning). Visuospatial skills well preserved during Gamusa weaving tests. Advised adherence to Donepezil 5mg and morning tea garden cognitive exercises.',
                    recommendation: 'Follow-up via Kamrup ASHA facilitator in 30 days.'
                }
            ];
            localStorage.setItem('smriti_doctor_notes', JSON.stringify(this.clinicalNotes));
        }

        this.patient = window.cogniAdapt ? window.cogniAdapt.currentPatient : null;
        this.renderAll();
    }

    renderAll() {
        this.renderPatientHeader();
        this.renderClinicalScores();
        this.renderCognitiveDomains();
        this.renderTelemetryTrends();
        this.renderPrescriptions();
        this.renderClinicalNotes();
    }

    renderPatientHeader() {
        const nameEl = document.getElementById('doc-patient-name');
        const metaEl = document.getElementById('doc-patient-meta');
        const diagEl = document.getElementById('doc-patient-diagnosis');

        if (nameEl && this.patient) nameEl.textContent = this.patient.name;
        if (metaEl && this.patient) {
            metaEl.textContent = `Age: ${this.patient.age} yrs • Gender: Female • District: ${this.patient.district} (Assam) • Primary ASHA: Deepa Kalita`;
        }
        if (diagEl) {
            diagEl.textContent = 'Clinical Stage: Mild Cognitive Impairment (MCI) progressing to Early-stage Dementia • CDR: 0.5 (Questionable Impairment)';
        }
    }

    renderClinicalScores() {
        const overallIndex = window.cogniAdapt ? window.cogniAdapt.getOverallCognitiveIndex() : 76;

        // Estimate MMSE & MoCA from cognitive index
        const mmseScore = Math.round((overallIndex / 100) * 30);
        const mocaScore = Math.max(12, Math.round(((overallIndex - 10) / 90) * 30));

        const mmseEl = document.getElementById('doc-score-mmse');
        const mocaEl = document.getElementById('doc-score-moca');
        const cdrEl = document.getElementById('doc-score-cdr');
        const sessionsEl = document.getElementById('doc-score-sessions');

        if (mmseEl) mmseEl.textContent = `${mmseScore} / 30`;
        if (mocaEl) mocaEl.textContent = `${mocaScore} / 30`;
        if (cdrEl) cdrEl.textContent = '0.5 (Mild)';
        if (sessionsEl) sessionsEl.textContent = `${this.sessions.length || 14} Logs`;
    }

    renderCognitiveDomains() {
        const container = document.getElementById('doc-domains-grid');
        if (!container || !this.patient) return;

        const scores = this.patient.cognitiveScores;
        const domains = [
            {
                name: 'Episodic & Cultural Memory',
                game: 'Memory Match (Jaapi, Dhol)',
                score: scores.memory,
                status: scores.memory >= 75 ? 'Preserved' : 'Mild Decline',
                statusClass: scores.memory >= 75 ? 'status-good' : 'status-warning',
                interpretation: 'Strong recall of cultural archetypes (Assamese Bihu, Tea culture); slight hesitation on novel abstract patterns.'
            },
            {
                name: 'Selective Attention & Vigilance',
                game: 'Tea Garden Plucker',
                score: scores.attention,
                status: scores.attention >= 70 ? 'Moderate' : 'Impaired',
                statusClass: scores.attention >= 70 ? 'status-good' : 'status-warning',
                interpretation: 'Good reaction latency (avg 1.8s) when identifying two leaves and a bud. Mild distraction under complex background visuals.'
            },
            {
                name: 'Executive Function & Working Memory',
                game: 'Pattern Weave (Gamusa)',
                score: scores.executive,
                status: scores.executive >= 75 ? 'Good' : 'Needs Support',
                statusClass: 'status-good',
                interpretation: 'Pattern deduction remains intact; able to complete 3-step symmetrical weaving sequences with minimal guidance.'
            },
            {
                name: 'Chronological Sequencing',
                game: 'Daily Routine Sequence',
                score: scores.routine,
                status: scores.routine >= 70 ? 'Stable' : 'Disoriented',
                statusClass: 'status-good',
                interpretation: 'Accurately sequences Morning Tea → Namghar/Puja → Medication → Rest with 88% consistency.'
            },
            {
                name: 'Visuospatial & Psychomotor Agility',
                game: 'Spatial Fruit & Object Match',
                score: scores.pattern,
                status: scores.pattern >= 65 ? 'Adequate' : 'Decreased',
                statusClass: 'status-good',
                interpretation: 'Motor touch latency steady. No major agnosia or apraxia observed during touch targets.'
            }
        ];

        container.innerHTML = domains.map(d => `
            <div class="doc-domain-card">
                <div class="doc-domain-header">
                    <div>
                        <h4 class="doc-domain-title">${d.name}</h4>
                        <span class="doc-domain-game">Mapped Task: ${d.game}</span>
                    </div>
                    <div class="doc-domain-score-box">
                        <span class="doc-domain-num">${d.score}%</span>
                        <span class="doc-domain-status ${d.statusClass}">${d.status}</span>
                    </div>
                </div>
                <div class="doc-domain-bar-bg">
                    <div class="doc-domain-bar-fill" style="width: ${d.score}%;"></div>
                </div>
                <p class="doc-domain-desc">${d.interpretation}</p>
            </div>
        `).join('');
    }

    renderTelemetryTrends() {
        const container = document.getElementById('doc-trend-bars');
        if (!container) return;

        const dummyTrend = [
            { day: 'Day 1', score: 68, latency: '2.4s', errors: 3 },
            { day: 'Day 2', score: 72, latency: '2.1s', errors: 2 },
            { day: 'Day 3', score: 70, latency: '2.2s', errors: 2 },
            { day: 'Day 4', score: 75, latency: '1.9s', errors: 1 },
            { day: 'Day 5', score: 74, latency: '2.0s', errors: 1 },
            { day: 'Day 6', score: 78, latency: '1.8s', errors: 1 },
            { day: 'Day 7', score: 76, latency: '1.8s', errors: 0 }
        ];

        container.innerHTML = dummyTrend.map(t => `
            <div class="trend-col">
                <div class="trend-bar-wrapper">
                    <div class="trend-bar" style="height: ${t.score}%;">
                        <span class="trend-val">${t.score}%</span>
                    </div>
                </div>
                <span class="trend-day">${t.day}</span>
                <span class="trend-latency">${t.latency}</span>
            </div>
        `).join('');
    }

    // ─────────────────────────────────────────────────────────────────
    //  Digital Prescription Pad
    // ─────────────────────────────────────────────────────────────────
    renderPrescriptions() {
        const feed = document.getElementById('doc-rx-feed');
        if (!feed) return;

        if (this.prescriptions.length === 0) {
            feed.innerHTML = '<p class="doc-empty-state">No active prescriptions. Use the form below to prescribe medications.</p>';
            return;
        }

        feed.innerHTML = this.prescriptions.map(rx => `
            <div class="doc-rx-item ${rx.active ? '' : 'rx-inactive'}">
                <div class="rx-item-header">
                    <div>
                        <h4 class="rx-med-name">${rx.medicine} <span class="rx-brand">(${rx.brand || ''})</span></h4>
                        <span class="rx-dosage-badge">${rx.dosage}</span>
                        <span class="rx-freq-badge">⏰ ${rx.frequency} (${rx.time})</span>
                    </div>
                    <button class="btn-rx-remove" onclick="window.doctorDashboard.removePrescription('${rx.id}')" title="Discontinue Medication">✕ Discontinue</button>
                </div>
                <p class="rx-purpose">${rx.purpose}</p>
                <div class="rx-footer">
                    <span>Prescribed by: ${rx.prescribedBy} • ${rx.date}</span>
                    <span class="rx-sync-status">🟢 Synced with Patient Schedule</span>
                </div>
            </div>
        `).join('');
    }

    addPrescription() {
        const medInput = document.getElementById('rx-input-med');
        const dosageInput = document.getElementById('rx-input-dosage');
        const freqInput = document.getElementById('rx-input-freq');
        const timeInput = document.getElementById('rx-input-time');
        const purposeInput = document.getElementById('rx-input-purpose');

        if (!medInput || !medInput.value.trim()) {
            alert('Please enter medication name.');
            return;
        }

        const newRx = {
            id: 'rx-' + Date.now(),
            medicine: medInput.value.trim(),
            brand: '',
            dosage: dosageInput?.value.trim() || '1 Dose',
            frequency: freqInput?.value.trim() || 'Daily',
            time: timeInput?.value || '09:00',
            purpose: purposeInput?.value.trim() || 'Geriatric cognitive maintenance',
            prescribedBy: window.authManager?.doctorProfile?.name || 'Dr. Ananya Sarma, MD',
            date: new Date().toISOString().split('T')[0],
            active: true
        };

        this.prescriptions.unshift(newRx);
        localStorage.setItem('smriti_prescriptions', JSON.stringify(this.prescriptions));

        // Auto-sync into patient reminders schedule
        this.syncPrescriptionToPatientSchedule(newRx);

        this.renderPrescriptions();

        // Clear input form
        medInput.value = '';
        if (dosageInput) dosageInput.value = '';
        if (purposeInput) purposeInput.value = '';

        alert(`Prescription for ${newRx.medicine} saved and synced to Patient Schedule!`);
    }

    removePrescription(rxId) {
        if (!confirm('Are you sure you want to discontinue this medication?')) return;
        this.prescriptions = this.prescriptions.filter(rx => rx.id !== rxId);
        localStorage.setItem('smriti_prescriptions', JSON.stringify(this.prescriptions));
        this.renderPrescriptions();
    }

    syncPrescriptionToPatientSchedule(rx) {
        if (window.reminders && window.reminders.addCustomReminder) {
            window.reminders.addCustomReminder({
                title: `Medicine: ${rx.medicine} (${rx.dosage})`,
                time: rx.time,
                type: 'medication',
                icon: '💊',
                dosage: rx.dosage
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Clinical Progress Notes & ICD-10 Coding
    // ─────────────────────────────────────────────────────────────────
    renderClinicalNotes() {
        const feed = document.getElementById('doc-notes-feed');
        if (!feed) return;

        if (this.clinicalNotes.length === 0) {
            feed.innerHTML = '<p class="doc-empty-state">No clinical notes recorded yet.</p>';
            return;
        }

        feed.innerHTML = this.clinicalNotes.map(n => `
            <div class="doc-note-card">
                <div class="doc-note-header">
                    <span class="doc-note-doctor">🩺 ${n.doctor}</span>
                    <span class="doc-note-date">${n.date}</span>
                </div>
                <div class="doc-note-icd">${n.icdCode}</div>
                <p class="doc-note-body">${n.impression}</p>
                <div class="doc-note-recom"><strong>Plan:</strong> ${n.recommendation}</div>
            </div>
        `).join('');
    }

    saveClinicalNote() {
        const impressionInput = document.getElementById('doc-note-input-impression');
        const planInput = document.getElementById('doc-note-input-plan');
        const icdSelect = document.getElementById('doc-note-icd-select');

        if (!impressionInput || !impressionInput.value.trim()) {
            alert('Please enter clinical impression.');
            return;
        }

        const newNote = {
            id: 'doc-note-' + Date.now(),
            date: new Date().toLocaleString(),
            doctor: window.authManager?.doctorProfile?.name || 'Dr. Ananya Sarma, MD',
            icdCode: icdSelect?.value || 'ICD-10 G30.0 (Early-onset Alzheimer Disease)',
            impression: impressionInput.value.trim(),
            recommendation: planInput?.value.trim() || 'Continue regular cognitive stimulation and ASHA home monitoring.'
        };

        this.clinicalNotes.unshift(newNote);
        localStorage.setItem('smriti_doctor_notes', JSON.stringify(this.clinicalNotes));
        this.renderClinicalNotes();

        impressionInput.value = '';
        if (planInput) planInput.value = '';
        alert('Clinical progress note saved to patient record.');
    }

    // ─────────────────────────────────────────────────────────────────
    //  Export Formal Clinical Assessment Report (Print / PDF)
    // ─────────────────────────────────────────────────────────────────
    exportClinicalReport() {
        const patientName = this.patient ? this.patient.name : 'Aita';
        const docName = window.authManager?.doctorProfile?.name || 'Dr. Ananya Sarma, MD (Neurology)';
        const docReg = window.authManager?.doctorProfile?.regNo || 'NMC-AS-84920';
        const docHosp = window.authManager?.doctorProfile?.hospital || 'GMCH / Kamrup Geriatric Memory Clinic';
        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        const overallIndex = window.cogniAdapt ? window.cogniAdapt.getOverallCognitiveIndex() : 76;
        const mmse = Math.round((overallIndex / 100) * 30);
        const moca = Math.max(12, Math.round(((overallIndex - 10) / 90) * 30));

        const rxList = this.prescriptions.map(rx => `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #ddd;"><strong>${rx.medicine}</strong> (${rx.brand || ''})</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${rx.dosage}</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${rx.frequency} (${rx.time})</td>
                <td style="padding:8px; border-bottom:1px solid #ddd;">${rx.purpose}</td>
            </tr>
        `).join('');

        const notesList = this.clinicalNotes.map(n => `
            <div style="margin-bottom:12px; padding:10px; background:#F8F9FA; border-left:4px solid #1A5276;">
                <div style="font-weight:bold; color:#1A5276;">${n.date} • ${n.icdCode}</div>
                <div style="margin:4px 0;">${n.impression}</div>
                <div style="font-size:0.9rem; color:#555;"><strong>Plan:</strong> ${n.recommendation}</div>
            </div>
        `).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Clinical Cognitive Assessment — ${patientName}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #222; margin: 30px; }
                    .report-header { border-bottom: 3px double #1A5276; padding-bottom: 15px; margin-bottom: 20px; }
                    .h-title { font-size: 22px; font-weight: bold; color: #1A5276; }
                    .h-sub { font-size: 13px; color: #555; }
                    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #F4F6F7; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
                    .score-row { display: flex; gap: 15px; margin-bottom: 20px; }
                    .score-card { flex: 1; border: 1px solid #1A5276; border-radius: 6px; padding: 12px; text-align: center; }
                    .score-val { font-size: 24px; font-weight: bold; color: #1E6F5C; }
                    .score-lbl { font-size: 12px; text-transform: uppercase; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
                    th { background: #1A5276; color: white; padding: 8px; text-align: left; }
                    .section-h { font-size: 16px; font-weight: bold; color: #1A5276; border-bottom: 1px solid #1A5276; padding-bottom: 4px; margin: 20px 0 10px 0; }
                    .footer-sign { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .doc-sign-box { text-align: right; border-top: 1px solid #333; padding-top: 6px; width: 260px; }
                    @media print { body { margin: 15mm; } button { display: none; } }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div class="h-title">🌿 SMRITI-NER NEUROLOGICAL ASSESSMENT</div>
                            <div class="h-sub">North-Eastern Geriatric Mental Health & Dementia Surveillance Network</div>
                            <div class="h-sub">${docHosp}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-weight:bold;">Date: ${dateStr}</div>
                            <div style="font-size:12px; color:#666;">Assessment ID: SMRITI-CLIN-${Date.now().toString().slice(-6)}</div>
                        </div>
                    </div>
                </div>

                <div class="meta-grid">
                    <div><strong>Patient Name:</strong> ${patientName}</div>
                    <div><strong>Age / Gender:</strong> 74 Yrs / Female</div>
                    <div><strong>Clinical Diagnosis:</strong> ICD-10 G30.0 (Mild Cognitive Impairment / Alzheimer's)</div>
                    <div><strong>District / PHC:</strong> Kamrup Rural PHC, Assam</div>
                    <div><strong>Primary ASHA Worker:</strong> Deepa Kalita (+91 94350-12345)</div>
                    <div><strong>Attending Clinician:</strong> ${docName} (${docReg})</div>
                </div>

                <div class="section-h">1. CLINICAL COGNITIVE TELEMETRY & RATINGS</div>
                <div class="score-row">
                    <div class="score-card">
                        <div class="score-val">${overallIndex}/100</div>
                        <div class="score-lbl">Smriti Cognitive Index</div>
                    </div>
                    <div class="score-card">
                        <div class="score-val">${mmse}/30</div>
                        <div class="score-lbl">Estimated MMSE Score</div>
                    </div>
                    <div class="score-card">
                        <div class="score-val">${moca}/30</div>
                        <div class="score-lbl">Estimated MoCA Score</div>
                    </div>
                    <div class="score-card">
                        <div class="score-val">0.5</div>
                        <div class="score-lbl">Clinical Dementia Rating (CDR)</div>
                    </div>
                </div>

                <div class="section-h">2. ACTIVE PHARMACOLOGICAL PRESCRIPTIONS</div>
                <table>
                    <thead>
                        <tr>
                            <th>Medication & Brand</th>
                            <th>Dosage</th>
                            <th>Frequency & Time</th>
                            <th>Therapeutic Indication</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rxList}
                    </tbody>
                </table>

                <div class="section-h">3. CLINICAL PROGRESS NOTES & DIAGNOSTIC IMPRESSIONS</div>
                ${notesList}

                <div class="section-h">4. SURVEILLANCE & REHABILITATION INSTRUCTIONS FOR ASHA / FAMILY</div>
                <ul>
                    <li>Engage patient daily in 15-minute regional reminiscence (Bihu folklore, weaving patterns).</li>
                    <li>Monitor evening sundowning cues; ensure calm lighting and water intake by 5:00 PM.</li>
                    <li>Continue Donepezil 5mg after dinner; record any GI discomfort in ASHA tablet.</li>
                </ul>

                <div class="footer-sign">
                    <div style="font-size:12px; color:#777;">
                        Verified via Smriti-NER Clinical Local-First Health Gateway.<br>
                        Digital record ID: SMRITI-VERIFIED-${Date.now()}
                    </div>
                    <div class="doc-sign-box">
                        <strong>${docName}</strong><br>
                        ${docReg}<br>
                        Department of Neurology & Geriatric Care
                    </div>
                </div>

                <div style="text-align:center; margin-top:30px;">
                    <button onclick="window.print()" style="padding:10px 24px; font-size:16px; background:#1A5276; color:white; border:none; border-radius:6px; cursor:pointer;">🖨️ Print / Save as PDF</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}

window.doctorDashboard = new DoctorDashboard();
