/**
 * Role-Based Authorization & Session Manager — Smriti-NER
 * ─────────────────────────────────────────────────────────────────
 * Handles authentication, PIN protection, and role permissions for:
 *  1. Patient   — 1-tap direct access (no barriers for elderly)
 *  2. Caretaker — 4-digit PIN (default: 1234) for family & ASHA workers
 *  3. Doctor    — Clinician PIN (default: 9999) + Medical Reg credentials
 * ─────────────────────────────────────────────────────────────────
 */

class AuthManager {
    constructor() {
        this.ROLES = {
            PATIENT: 'patient',
            CARETAKER: 'caretaker',
            DOCTOR: 'doctor'
        };

        this.ROLE_CONFIG = {
            patient: {
                name: 'Patient View',
                nameRegional: {
                    as: 'ৰোগীৰ দৃশ্য (Patient)',
                    bn: 'রোগীর দৃশ্য (Patient)',
                    hi: 'मरीज दृश्य (Patient)',
                    en: 'Patient Mode'
                },
                icon: '👴',
                badgeClass: 'role-patient',
                requiresPin: false,
                defaultScreen: 'home-screen',
                allowedScreens: ['home-screen', 'games-screen', 'reminders-screen', 'wellness-screen']
            },
            caretaker: {
                name: 'Caretaker & ASHA Portal',
                nameRegional: {
                    as: 'কেয়াৰগিভাৰ পৰ্টেল (Caretaker)',
                    bn: 'কেয়ারগিভার পোর্টাল (Caretaker)',
                    hi: 'देखभालकर्ता पोर्टल (Caretaker)',
                    en: 'Caretaker & ASHA Mode'
                },
                icon: '🧑‍⚕️',
                badgeClass: 'role-caretaker',
                requiresPin: true,
                defaultPin: '1234',
                defaultScreen: 'caregiver-screen',
                allowedScreens: ['caregiver-screen', 'home-screen', 'games-screen', 'reminders-screen', 'wellness-screen']
            },
            doctor: {
                name: 'Doctor Clinical Portal',
                nameRegional: {
                    as: 'চিকিৎসক পৰ্টেল (Doctor)',
                    bn: 'ডাক্তার পোর্টাল (Doctor)',
                    hi: 'चिकित्सक पोर्टल (Doctor)',
                    en: 'Doctor Clinical Mode'
                },
                icon: '🩺',
                badgeClass: 'role-doctor',
                requiresPin: true,
                defaultPin: '9999',
                defaultScreen: 'doctor-screen',
                allowedScreens: ['doctor-screen', 'caregiver-screen', 'home-screen', 'games-screen', 'reminders-screen', 'wellness-screen']
            }
        };

        // Load active role from storage or default to 'patient'
        this.currentRole = localStorage.getItem('smriti_user_role') || this.ROLES.PATIENT;
        this.doctorProfile = JSON.parse(localStorage.getItem('smriti_doctor_profile') || JSON.stringify({
            name: 'Dr. Ananya Sarma, MD (Neurology)',
            regNo: 'NMC-AS-84920',
            hospital: 'Gauhati Medical College & Hospital (GMCH) / Kamrup PHC',
            department: 'Geriatric Cognitive Disorders & Memory Clinic'
        }));

        this.caretakerProfile = JSON.parse(localStorage.getItem('smriti_caretaker_profile') || JSON.stringify({
            name: 'Deepa Kalita (ASHA Facilitator)',
            phone: '+91 94350-12345',
            relation: 'Primary Caregiver & Village Health Worker',
            phc: 'Kamrup Rural Health Center'
        }));
    }

    getCurrentRole() {
        return this.currentRole;
    }

    getRoleConfig(role = this.currentRole) {
        return this.ROLE_CONFIG[role] || this.ROLE_CONFIG.patient;
    }

    getSavedPin(role) {
        const key = `smriti_pin_${role}`;
        return localStorage.getItem(key) || this.ROLE_CONFIG[role]?.defaultPin || '1234';
    }

    setCustomPin(role, newPin) {
        if (newPin && newPin.length >= 4) {
            localStorage.setItem(`smriti_pin_${role}`, newPin);
            return true;
        }
        return false;
    }

    /**
     * Request a role switch. If role requires PIN, triggers PIN modal.
     * @param {string} targetRole — 'patient' | 'caretaker' | 'doctor'
     */
    requestRoleSwitch(targetRole) {
        if (targetRole === this.currentRole) return;

        const config = this.ROLE_CONFIG[targetRole];
        if (!config) return;

        if (!config.requiresPin) {
            // Patient needs no PIN — instant switch
            this.setRole(targetRole);
        } else {
            // Caretaker or Doctor requires PIN
            this.showPinModal(targetRole);
        }
    }

    /**
     * Verify PIN and switch role if correct
     */
    verifyAndSwitch(targetRole, enteredPin) {
        const expectedPin = this.getSavedPin(targetRole);
        if (enteredPin === expectedPin) {
            this.setRole(targetRole);
            this.hidePinModal();
            return { success: true };
        } else {
            return {
                success: false,
                message: `Incorrect PIN for ${this.ROLE_CONFIG[targetRole]?.name}. (Default is ${expectedPin})`
            };
        }
    }

    setRole(role) {
        this.currentRole = role;
        localStorage.setItem('smriti_user_role', role);

        // Update UI badges
        this.updateRoleUI();

        // Dispatch global event
        window.dispatchEvent(new CustomEvent('roleChanged', {
            detail: { role, config: this.getRoleConfig(role) }
        }));

        // Navigate to appropriate default screen for role
        const targetScreen = this.ROLE_CONFIG[role]?.defaultScreen || 'home-screen';
        if (window.appNav) {
            window.appNav.showScreen(targetScreen);
        }
    }

    updateRoleUI() {
        const config = this.getRoleConfig();
        const roleBadge = document.getElementById('top-role-badge');
        const roleText = document.getElementById('top-role-text');
        const roleIcon = document.getElementById('top-role-icon');

        const lang = window.i18n ? window.i18n.getLang() : 'en';
        const localizedName = config.nameRegional[lang] || config.name;

        if (roleBadge) {
            roleBadge.className = `role-badge-btn ${config.badgeClass}`;
        }
        if (roleText) {
            roleText.textContent = localizedName;
        }
        if (roleIcon) {
            roleIcon.textContent = config.icon;
        }

        // Show/hide bottom nav buttons based on role
        this.applyNavigationPermissions();
    }

    applyNavigationPermissions() {
        const role = this.currentRole;
        const config = this.getRoleConfig(role);

        const doctorNavBtn = document.getElementById('bottom-nav-doctor');
        const caregiverNavBtn = document.getElementById('bottom-nav-caregiver');

        if (doctorNavBtn) {
            doctorNavBtn.style.display = (role === 'doctor') ? 'flex' : 'none';
        }
        if (caregiverNavBtn) {
            caregiverNavBtn.style.display = (role === 'caretaker' || role === 'doctor') ? 'flex' : 'none';
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  PIN Authentication Modal
    // ─────────────────────────────────────────────────────────────────
    showPinModal(targetRole) {
        let modal = document.getElementById('auth-pin-modal');
        if (!modal) {
            this.createPinModalDOM();
            modal = document.getElementById('auth-pin-modal');
        }

        const config = this.ROLE_CONFIG[targetRole];
        const titleEl = document.getElementById('pin-modal-role-title');
        const descEl = document.getElementById('pin-modal-role-desc');
        const defaultHintEl = document.getElementById('pin-default-hint');
        const pinInput = document.getElementById('auth-pin-input');
        const errorEl = document.getElementById('pin-modal-error');

        if (titleEl) titleEl.textContent = `${config.icon} Access ${config.name}`;
        if (descEl) descEl.textContent = targetRole === 'doctor'
            ? 'Authorized Clinicians & Neurologists Only. Enter your Doctor PIN.'
            : 'Caregivers & ASHA Health Workers. Enter your 4-digit PIN.';
        if (defaultHintEl) {
            defaultHintEl.textContent = `Default demo PIN: ${config.defaultPin}`;
        }
        if (errorEl) errorEl.textContent = '';
        if (pinInput) {
            pinInput.value = '';
            pinInput.dataset.targetRole = targetRole;
            setTimeout(() => pinInput.focus(), 150);
        }

        modal.classList.remove('hidden');
    }

    hidePinModal() {
        const modal = document.getElementById('auth-pin-modal');
        if (modal) modal.classList.add('hidden');
    }

    createPinModalDOM() {
        const div = document.createElement('div');
        div.id = 'auth-pin-modal';
        div.className = 'auth-modal-overlay hidden';
        div.innerHTML = `
            <div class="auth-modal-card">
                <button class="auth-modal-close" onclick="window.authManager.hidePinModal()">✕</button>
                <div class="auth-modal-icon">🔒</div>
                <h3 id="pin-modal-role-title" class="auth-modal-title">Enter Access PIN</h3>
                <p id="pin-modal-role-desc" class="auth-modal-desc"></p>
                <div class="pin-input-container">
                    <input type="password" id="auth-pin-input" class="auth-pin-input" maxlength="6" placeholder="••••" autocomplete="off" inputmode="numeric">
                </div>
                <div id="pin-modal-error" class="auth-pin-error"></div>
                <div class="auth-pin-keypad">
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('1')">1</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('2')">2</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('3')">3</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('4')">4</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('5')">5</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('6')">6</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('7')">7</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('8')">8</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('9')">9</button>
                    <button class="keypad-btn keypad-clear" onclick="window.authManager.clearPin()">C</button>
                    <button class="keypad-btn" onclick="window.authManager.appendPinDigit('0')">0</button>
                    <button class="keypad-btn keypad-backspace" onclick="window.authManager.backspacePin()">⌫</button>
                </div>
                <button class="auth-btn-submit" onclick="window.authManager.submitPin()">Unlock Access</button>
                <p id="pin-default-hint" class="auth-modal-hint"></p>
            </div>
        `;
        document.body.appendChild(div);

        // Add Enter key event listener
        const input = div.querySelector('#auth-pin-input');
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.submitPin();
        });
    }

    appendPinDigit(digit) {
        const input = document.getElementById('auth-pin-input');
        if (input && input.value.length < 6) {
            input.value += digit;
        }
    }

    clearPin() {
        const input = document.getElementById('auth-pin-input');
        if (input) input.value = '';
    }

    backspacePin() {
        const input = document.getElementById('auth-pin-input');
        if (input) input.value = input.value.slice(0, -1);
    }

    submitPin() {
        const input = document.getElementById('auth-pin-input');
        const errorEl = document.getElementById('pin-modal-error');
        if (!input) return;

        const targetRole = input.dataset.targetRole;
        const enteredPin = input.value.trim();

        const result = this.verifyAndSwitch(targetRole, enteredPin);
        if (!result.success) {
            if (errorEl) {
                errorEl.textContent = result.message;
                errorEl.classList.add('shake-anim');
                setTimeout(() => errorEl.classList.remove('shake-anim'), 500);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Role Switcher Selection Modal
    // ─────────────────────────────────────────────────────────────────
    showRolePickerModal() {
        let modal = document.getElementById('role-picker-modal');
        if (!modal) {
            this.createRolePickerModalDOM();
            modal = document.getElementById('role-picker-modal');
        }
        modal.classList.remove('hidden');
    }

    hideRolePickerModal() {
        const modal = document.getElementById('role-picker-modal');
        if (modal) modal.classList.add('hidden');
    }

    createRolePickerModalDOM() {
        const div = document.createElement('div');
        div.id = 'role-picker-modal';
        div.className = 'auth-modal-overlay hidden';
        div.innerHTML = `
            <div class="auth-modal-card role-picker-card">
                <button class="auth-modal-close" onclick="window.authManager.hideRolePickerModal()">✕</button>
                <div class="auth-modal-icon">👥</div>
                <h2 class="auth-modal-title">Select User Role & Portal</h2>
                <p class="auth-modal-desc">Switch between tailored interfaces for Patient, Caretaker, or Clinician.</p>
                
                <div class="role-cards-container">
                    <div class="role-select-card card-patient" onclick="window.authManager.hideRolePickerModal(); window.authManager.requestRoleSwitch('patient')">
                        <div class="role-card-icon">👴</div>
                        <div class="role-card-body">
                            <h3>Patient Mode</h3>
                            <p>Elderly-friendly interface with large controls, AI Voice Assistant Mitra, cognitive reminiscence games & calm breathing.</p>
                            <span class="role-card-badge badge-free">1-Tap Instant Access</span>
                        </div>
                    </div>

                    <div class="role-select-card card-caretaker" onclick="window.authManager.hideRolePickerModal(); window.authManager.requestRoleSwitch('caretaker')">
                        <div class="role-card-icon">🧑‍⚕️</div>
                        <div class="role-card-body">
                            <h3>Caretaker & ASHA Portal</h3>
                            <p>Medication schedule management, distress incident log, behavioral & sundowning tracker, observation notes.</p>
                            <span class="role-card-badge badge-pin">PIN Protected (1234)</span>
                        </div>
                    </div>

                    <div class="role-select-card card-doctor" onclick="window.authManager.hideRolePickerModal(); window.authManager.requestRoleSwitch('doctor')">
                        <div class="role-card-icon">🩺</div>
                        <div class="role-card-body">
                            <h3>Doctor Clinical Portal</h3>
                            <p>MMSE / MoCA cognitive radar, longitudinal reaction latency decline curves, digital prescription generator, clinical reports.</p>
                            <span class="role-card-badge badge-pin">Clinician PIN (9999)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    }
}

window.authManager = new AuthManager();
