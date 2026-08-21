/* ==========================================================================
   PayPulse / My Klepeh E-Wallet - Interactive Login & Auth Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. STATE & AUDIO SYNTHESIZER
    // ----------------------------------------------------------------------
    let enteredPin = [];
    let qrTimerInterval = null;
    let qrTimeLeft = 45;

    let activeAccount = {
        phone: '0812-9887-3411',
        name: 'M Ikhsan Anggara',
        avatar: 'sasuke.jpg'
    };

    // Web Audio API for interactive sound feedback
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new AudioCtx();
        }
    }

    function playKeyTone(freq = 440, type = 'sine', duration = 0.08) {
        try {
            initAudio();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Audio context fallback
        }
    }

    function playKeypadSound() {
        playKeyTone(620, 'sine', 0.06);
    }

    function playSuccessChime() {
        try {
            initAudio();
            const now = audioCtx.currentTime;
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.08);

                gain.gain.setValueAtTime(0.15, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 0.3);
            });
        } catch (e) { }
    }

    // ----------------------------------------------------------------------
    // 2. THEME CONTROLLER & INITIALIZATION
    // ----------------------------------------------------------------------
    const htmlElem = document.documentElement;
    const authThemeToggleBtn = document.getElementById('authThemeToggle');
    const lightIcon = authThemeToggleBtn.querySelector('.light-icon');
    const darkIcon = authThemeToggleBtn.querySelector('.dark-icon');

    const savedTheme = localStorage.getItem('paypulse_theme') || 'dark';
    applyTheme(savedTheme);

    function applyTheme(theme) {
        htmlElem.setAttribute('data-theme', theme);
        localStorage.setItem('paypulse_theme', theme);
        if (theme === 'light') {
            lightIcon.style.display = 'inline-block';
            darkIcon.style.display = 'none';
        } else {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline-block';
        }
    }

    authThemeToggleBtn.addEventListener('click', () => {
        const current = htmlElem.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        playKeyTone(800, 'sine', 0.05);
    });

    // ----------------------------------------------------------------------
    // 3. QUICK ACCOUNT SWITCHER CHIPS
    // ----------------------------------------------------------------------
    // Account Chips Click & Drag Scroll
    const accountChipsContainer = document.getElementById('accountChips');

    if (accountChipsContainer) {
        let isDown = false;
        let startX;
        let scrollLeft;

        accountChipsContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - accountChipsContainer.offsetLeft;
            scrollLeft = accountChipsContainer.scrollLeft;
        });

        accountChipsContainer.addEventListener('mouseleave', () => { isDown = false; });
        accountChipsContainer.addEventListener('mouseup', () => { isDown = false; });

        accountChipsContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - accountChipsContainer.offsetLeft;
            const walk = (x - startX) * 2;
            accountChipsContainer.scrollLeft = scrollLeft - walk;
        });
    }

    // Delegated click listener for dynamic chips
    if (accountChipsContainer) {
        accountChipsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.account-chip');
            if (!chip) return;

            document.querySelectorAll('.account-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const phone = chip.dataset.phone;
            const name = chip.dataset.name;
            const avatar = chip.dataset.avatar;

            if (phone) {
                inputPhone.value = phone;
                inputOtpPhone.value = phone;
                activeAccount = { phone, name, avatar };
            } else {
                inputPhone.value = '';
                inputOtpPhone.value = '';
                inputPhone.focus();
                activeAccount = { phone: '', name: 'Pengguna Baru', avatar: '' };
            }
            playKeyTone(700, 'sine', 0.05);
        });
    }

    // ----------------------------------------------------------------------
    // 4. AUTH NAV TABS SWITCHER
    // ----------------------------------------------------------------------
    const authTabs = document.querySelectorAll('.auth-tab');
    const authPanes = document.querySelectorAll('.auth-pane');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            authPanes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetPaneId = tab.dataset.tab;
            const targetPane = document.getElementById(targetPaneId);
            if (targetPane) {
                targetPane.classList.add('active');
            }

            if (targetPaneId === 'pane-qr') {
                startQrCountdown();
            } else {
                stopQrCountdown();
            }

            playKeyTone(550, 'sine', 0.05);
        });
    });

    // ----------------------------------------------------------------------
    // 5. VIRTUAL KEYPAD & PIN DISPLAY LOGIC
    // ----------------------------------------------------------------------
    const pinDots = document.querySelectorAll('.pin-dot');
    const keypadGrid = document.getElementById('keypadGrid');
    const keypadClearBtn = document.getElementById('keypadClearBtn');
    const keypadBackspaceBtn = document.getElementById('keypadBackspaceBtn');
    const scrambleKeypadBtn = document.getElementById('scrambleKeypadBtn');
    const virtualKeypad = document.getElementById('virtualKeypad');
    const toggleVirtualKeypadBtn = document.getElementById('toggleVirtualKeypadBtn');

    toggleVirtualKeypadBtn.addEventListener('click', () => {
        if (virtualKeypad.style.display === 'none') {
            virtualKeypad.style.display = 'block';
        } else {
            virtualKeypad.style.display = 'none';
        }
    });

    function updatePinDots() {
        pinDots.forEach((dot, index) => {
            if (index < enteredPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    function addPinDigit(digit) {
        if (enteredPin.length < 6) {
            enteredPin.push(digit);
            updatePinDots();
            playKeypadSound();
            
            // Auto submit if 6 digits entered
            if (enteredPin.length === 6) {
                setTimeout(() => {
                    executeLogin();
                }, 250);
            }
        }
    }

    function removePinDigit() {
        if (enteredPin.length > 0) {
            enteredPin.pop();
            updatePinDots();
            playKeypadSound();
        }
    }

    function clearPin() {
        enteredPin = [];
        updatePinDots();
        playKeypadSound();
    }

    // Keypad Button Click Handlers
    keypadGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.keypad-btn');
        if (!btn) return;

        if (btn.dataset.key !== undefined) {
            addPinDigit(btn.dataset.key);
        } else if (btn.id === 'keypadClearBtn') {
            clearPin();
        } else if (btn.id === 'keypadBackspaceBtn' || btn.querySelector('.ri-backspace-line')) {
            removePinDigit();
        }
    });

    // Scramble Keypad Function (Anti-Keylogger)
    scrambleKeypadBtn.addEventListener('click', () => {
        const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        // Shuffle array
        for (let i = digits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [digits[i], digits[j]] = [digits[j], digits[i]];
        }

        const numBtns = keypadGrid.querySelectorAll('.keypad-btn[data-key]');
        numBtns.forEach((btn, index) => {
            if (index < digits.length) {
                btn.dataset.key = digits[index];
                btn.textContent = digits[index];
            }
        });

        playKeyTone(900, 'sine', 0.07);
    });

    // Physical Keyboard Listener
    document.addEventListener('keydown', (e) => {
        const activePane = document.querySelector('.auth-pane.active');
        if (!activePane || activePane.id !== 'pane-pin') return;

        if (e.key >= '0' && e.key <= '9') {
            addPinDigit(e.key);
        } else if (e.key === 'Backspace') {
            removePinDigit();
        } else if (e.key === 'Escape') {
            clearPin();
        }
    });

    // Form Submit (PIN Login)
    const loginPinForm = document.getElementById('loginPinForm');
    loginPinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (enteredPin.length < 6) {
            showToastNotice('Masukkan 6-digit PIN Keamanan kamu.', 'warning');
            return;
        }
        executeLogin();
    });

    // ----------------------------------------------------------------------
    // 6. QR CODE BIOMETRIC SCANNER SIMULATION
    // ----------------------------------------------------------------------
    const qrCountdownSec = document.getElementById('qrCountdownSec');
    const simulatedQrApproveBtn = document.getElementById('simulatedQrApproveBtn');

    function startQrCountdown() {
        stopQrCountdown();
        qrTimeLeft = 45;
        qrCountdownSec.textContent = qrTimeLeft;
        qrTimerInterval = setInterval(() => {
            qrTimeLeft--;
            qrCountdownSec.textContent = qrTimeLeft;
            if (qrTimeLeft <= 0) {
                qrTimeLeft = 45;
            }
        }, 1000);
    }

    function stopQrCountdown() {
        if (qrTimerInterval) {
            clearInterval(qrTimerInterval);
            qrTimerInterval = null;
        }
    }

    simulatedQrApproveBtn.addEventListener('click', () => {
        showToastNotice('Memverifikasi Biometrik QR...', 'info');
        setTimeout(() => {
            executeLogin('QR Biometric Scan');
        }, 800);
    });

    // ----------------------------------------------------------------------
    // 7. PASSWORDLESS OTP MODAL FLOW
    // ----------------------------------------------------------------------
    const requestOtpBtn = document.getElementById('requestOtpBtn');
    const otpModal = document.getElementById('otpModal');
    const modalOtpPhoneDisplay = document.getElementById('modalOtpPhoneDisplay');
    const otpBoxes = document.querySelectorAll('.otp-box');
    const cancelOtpBtn = document.getElementById('cancelOtpBtn');
    const submitOtpVerifyBtn = document.getElementById('submitOtpVerifyBtn');
    const autoFillOtpBtn = document.getElementById('autoFillOtpBtn');

    requestOtpBtn.addEventListener('click', () => {
        const phoneVal = inputOtpPhone.value.trim();
        if (!phoneVal) {
            showToastNotice('Masukkan nomor telepon valid.', 'warning');
            return;
        }
        modalOtpPhoneDisplay.textContent = phoneVal;
        otpModal.classList.add('active');
        otpBoxes[0].focus();
        playKeyTone(650, 'sine', 0.08);
    });

    cancelOtpBtn.addEventListener('click', () => {
        otpModal.classList.remove('active');
    });

    // Auto-advance OTP Input Boxes
    otpBoxes.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.length === 1 && index < otpBoxes.length - 1) {
                otpBoxes[index + 1].focus();
            }
            playKeypadSound();
        });

        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !box.value && index > 0) {
                otpBoxes[index - 1].focus();
            }
        });
    });

    autoFillOtpBtn.addEventListener('click', () => {
        const dummyOtp = ['8', '8', '8', '9', '9', '9'];
        otpBoxes.forEach((box, i) => {
            box.value = dummyOtp[i];
        });
        playKeyTone(880, 'sine', 0.08);
    });

    submitOtpVerifyBtn.addEventListener('click', () => {
        let code = '';
        otpBoxes.forEach(b => code += b.value);
        if (code.length < 6) {
            showToastNotice('Masukkan 6-digit kode OTP dengan lengkap.', 'warning');
            return;
        }
        otpModal.classList.remove('active');
        executeLogin('WhatsApp OTP Verified');
    });

    // ----------------------------------------------------------------------
    // 8. LOGIN EXECUTION & DASHBOARD REDIRECT
    // ----------------------------------------------------------------------
    function executeLogin(authMethod = 'PIN Keamanan') {
        playSuccessChime();

        const submitBtn = document.getElementById('submitPinLoginBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Autentikasi Berhasil...`;
        }

        // Get accurate entered phone number
        const enteredPhone = (inputPhone && inputPhone.value.trim()) || (inputOtpPhone && inputOtpPhone.value.trim()) || activeAccount.phone || '0812-9887-3411';

        // Prepare User Session Payload
        const userSession = {
            isLoggedIn: true,
            userName: activeAccount.name || 'M Ikhsan Anggara',
            userPhone: enteredPhone,
            userAvatar: activeAccount.avatar || 'sasuke.jpg',
            authMethod: authMethod,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('paypulse_user_session', JSON.stringify(userSession));

        showToastNotice(`Selamat datang, ${userSession.userName}! Mengalihkan ke Dashboard...`, 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);
    }

    // Floating Toast Notice Helper
    function showToastNotice(message, type = 'info') {
        const existing = document.querySelector('.auth-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `auth-toast toast-${type}`;
        
        let iconClass = 'ri-information-line';
        if (type === 'success') iconClass = 'ri-checkbox-circle-line';
        if (type === 'warning') iconClass = 'ri-error-warning-line';

        toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
        
        // Inline toast style
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid var(--border-color);
            border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#06b6d4'};
            color: #fff;
            padding: 0.75rem 1.25rem;
            border-radius: var(--radius-md);
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.875rem;
            font-weight: 600;
            z-index: 2000;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
});
