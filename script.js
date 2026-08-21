/* ==========================================================================
   PayPulse E-Wallet Modern Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. STATE MANAGEMENT & LOCAL STORAGE INITIALIZATION
    // ----------------------------------------------------------------------
    const DEFAULT_STATE = {
        balance: 12850000,
        accountNumber: '0812-9887-3411',
        isBalanceHidden: false,
        theme: 'dark',
        pin: '123456',
        transactions: [
            {
                id: 'TX-PAY-98214',
                title: 'Transfer ke Budi Santoso',
                category: 'transfer',
                type: 'debit',
                amount: 150000,
                date: new Date(2026, 7, 10, 14, 20).toISOString(),
                status: 'success',
                method: 'E-Wallet Transfer',
                note: 'Bayar makan siang bersama'
            },
            {
                id: 'TX-PAY-98213',
                title: 'Isi Saldo (VA BCA)',
                category: 'topup',
                type: 'credit',
                amount: 1000000,
                date: new Date(2026, 7, 9, 10, 15).toISOString(),
                status: 'success',
                method: 'Virtual Account BCA',
                note: 'Top Up otomatis via Mobile Banking'
            },
            {
                id: 'TX-PAY-98212',
                title: 'Kopi Kenangan QRIS Resto',
                category: 'payment',
                type: 'debit',
                amount: 45000,
                date: new Date(2026, 7, 8, 16, 45).toISOString(),
                status: 'success',
                method: 'QRIS Scan',
                note: '2x Latte Caramel Regular'
            },
            {
                id: 'TX-PAY-98211',
                title: 'Cashback Promo Agt 2026',
                category: 'cashback',
                type: 'credit',
                amount: 15000,
                date: new Date(2026, 7, 8, 16, 46).toISOString(),
                status: 'success',
                method: 'Reward PayPulse',
                note: 'Cashback 30% transaksi QRIS'
            },
            {
                id: 'TX-PAY-98210',
                title: 'Tagihan Listrik PLN Pasca',
                category: 'payment',
                type: 'debit',
                amount: 320000,
                date: new Date(2026, 7, 5, 9, 30).toISOString(),
                status: 'success',
                method: 'PPOB PLN Direct',
                note: 'ID PLN: 53820918239'
            }
        ],
        vaults: [
            {
                id: 'vault-1',
                name: 'Liburan ke Japan 2026',
                targetAmount: 20000000,
                currentAmount: 13000000,
                icon: 'ri-flight-takeoff-line'
            },
            {
                id: 'vault-2',
                name: 'Beli Laptop Nova Pro',
                targetAmount: 25000000,
                currentAmount: 85000000,
                icon: 'ri-macbook-line'
            },
            {
                id: 'vault-3',
                name: 'Dana Darurat Siap Pakai',
                targetAmount: 50000000,
                currentAmount: 20000000,
                icon: 'ri-shield-flash-line'
            }
        ],
        notifications: [
            {
                id: 'n1',
                title: 'Cashback Rp 15.000 Masuk!',
                desc: 'Selamat! Cashback dari transaksi Kopi Kenangan telah dikreditkan ke saldo utama.',
                time: '2 jam yang lalu'
            },
            {
                id: 'n2',
                title: 'Keamanan Akun Terverifikasi',
                desc: 'Akun PayPulse Anda telah memenuhi verifikasi Premier Tier 2.',
                time: '1 hari yang lalu'
            }
        ]
    };

    // Load from LocalStorage or initialize default
    let state = JSON.parse(localStorage.getItem('paypulse_state')) || DEFAULT_STATE;

    // Check Auth Session & Apply Logged-In User Details
    const userSession = JSON.parse(localStorage.getItem('paypulse_user_session'));
    if (userSession && userSession.isLoggedIn) {
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const headerAvatar = document.getElementById('headerAvatar');
        const dropdownAvatar = document.getElementById('dropdownAvatar');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserPhone = document.getElementById('dropdownUserPhone');
        const logoutAvatarModal = document.getElementById('logoutAvatarModal');
        const logoutUserNameModal = document.getElementById('logoutUserNameModal');
        const logoutUserPhoneModal = document.getElementById('logoutUserPhoneModal');
        const profileName = document.querySelector('.profile-name');
        const welcomeHighlight = document.querySelector('.welcome-text .highlight');
        const userAccountNum = document.getElementById('userAccountNum');
        const cardHolderName = document.getElementById('cardHolderName');

        if (sidebarUserName) sidebarUserName.textContent = userSession.userName;
        if (dropdownUserName) dropdownUserName.textContent = userSession.userName;
        if (logoutUserNameModal) logoutUserNameModal.textContent = userSession.userName;
        
        if (dropdownUserPhone && userSession.userPhone) dropdownUserPhone.textContent = userSession.userPhone;
        if (logoutUserPhoneModal && userSession.userPhone) logoutUserPhoneModal.textContent = userSession.userPhone;

        if (sidebarAvatar && userSession.userAvatar) sidebarAvatar.src = userSession.userAvatar;
        if (headerAvatar && userSession.userAvatar) headerAvatar.src = userSession.userAvatar;
        if (dropdownAvatar && userSession.userAvatar) dropdownAvatar.src = userSession.userAvatar;
        if (logoutAvatarModal && userSession.userAvatar) logoutAvatarModal.src = userSession.userAvatar;

        if (profileName) profileName.textContent = userSession.userName;
        if (welcomeHighlight) welcomeHighlight.textContent = userSession.userName;
        if (cardHolderName && userSession.userName) cardHolderName.textContent = userSession.userName.toUpperCase();
        
        if (userAccountNum && userSession.userPhone) {
            userAccountNum.innerHTML = `${userSession.userPhone} <i class="ri-file-copy-line copy-icon" id="copyAccBtn" title="Salin Nomor Akun"></i>`;
            state.accountNumber = userSession.userPhone;
        }

        // Ensure all profile images match active account avatar
        document.querySelectorAll('.avatar-img, .avatar-img-sm, #sidebarAvatar, #headerAvatar, #dropdownAvatar, #logoutAvatarModal').forEach(img => {
            if (userSession.userAvatar) img.src = userSession.userAvatar;
        });
    }

    // Copy Account Number Handler
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('#copyAccBtn');
        if (copyBtn) {
            const accNum = state.accountNumber || (userSession ? userSession.userPhone : '0812-9887-3411');
            navigator.clipboard.writeText(accNum).then(() => {
                showToast(`Nomor akun (${accNum}) berhasil disalin!`, 'success');
            }).catch(() => {
                showToast(`Nomor akun: ${accNum}`, 'info');
            });
        }
    });

    // Profile Dropdown Toggle
    const quickProfileBtn = document.getElementById('quickProfileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (quickProfileBtn && profileDropdown) {
        quickProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            quickProfileBtn.classList.toggle('active');
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-dropdown-wrapper')) {
                quickProfileBtn.classList.remove('active');
                profileDropdown.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                quickProfileBtn.classList.remove('active');
                profileDropdown.classList.remove('active');
            }
        });
    }

    // Comprehensive Logout System (Mobile, Header, Sidebar & Dropdown)
    function openLogoutConfirmation() {
        // Close dropdown if open
        quickProfileBtn?.classList.remove('active');
        profileDropdown?.classList.remove('active');

        // Populate modal with current user session info
        const curSession = JSON.parse(localStorage.getItem('paypulse_user_session')) || {};
        const logoutName = document.getElementById('logoutUserNameModal');
        const logoutPhone = document.getElementById('logoutUserPhoneModal');
        const logoutAvatar = document.getElementById('logoutAvatarModal');

        if (logoutName) logoutName.textContent = curSession.userName || 'M Ikhsan Anggara';
        if (logoutPhone) logoutPhone.textContent = curSession.userPhone || '0812-9887-3411';
        if (logoutAvatar && curSession.userAvatar) logoutAvatar.src = curSession.userAvatar;

        openModal('modalLogoutConfirm');
    }

    // Event delegation for all logout buttons across desktop & mobile
    document.addEventListener('click', (e) => {
        const logoutTrigger = e.target.closest('.logout-trigger, #logoutBtn, #headerLogoutBtn, #dropdownLogoutBtn');
        if (logoutTrigger) {
            e.preventDefault();
            e.stopPropagation();
            openLogoutConfirmation();
        }
    });

    // Confirm Logout Button Action in Modal
    const btnConfirmLogout = document.getElementById('btnConfirmLogout');
    if (btnConfirmLogout) {
        btnConfirmLogout.addEventListener('click', () => {
            btnConfirmLogout.disabled = true;
            btnConfirmLogout.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Mengeluarkan...';

            showToast('Berhasil keluar dari akun. Mengalihkan ke login...', 'success');
            localStorage.removeItem('paypulse_user_session');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 600);
        });
    }

    function saveState() {
        localStorage.setItem('paypulse_state', JSON.stringify(state));
        renderApp();
    }

    // ----------------------------------------------------------------------
    // 2. HELPER FUNCTIONS (FORMATTING & UTILS)
    // ----------------------------------------------------------------------
    function formatRupiah(num) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(num);
    }

    function formatDate(dateString) {
        const d = new Date(dateString);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' WIB';
    }

    function generateTxId() {
        return 'TX-PAY-' + Math.floor(10000 + Math.random() * 90000);
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `
            <i class="${type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}" style="color: ${type === 'success' ? '#10b981' : '#f43f5e'}; font-size: 1.25rem;"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // Sound effect simulation using Web Audio API
    function playSuccessSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            // Audio context fallback
        }
    }

    // ----------------------------------------------------------------------
    // 3. UI RENDERING ENGINES
    // ----------------------------------------------------------------------
    function renderApp() {
        // Theme setting
        document.documentElement.setAttribute('data-theme', state.theme || 'dark');

        // Balance rendering with hide toggle support
        const userBalanceEl = document.getElementById('userBalance');
        const dropdownBalanceEl = document.getElementById('dropdownBalance');
        if (state.isBalanceHidden) {
            userBalanceEl.textContent = '••••••••';
            if (dropdownBalanceEl) dropdownBalanceEl.textContent = '••••••••';
            document.getElementById('eyeIcon').className = 'ri-eye-off-line';
        } else {
            userBalanceEl.textContent = formatRupiah(state.balance);
            if (dropdownBalanceEl) dropdownBalanceEl.textContent = formatRupiah(state.balance);
            document.getElementById('eyeIcon').className = 'ri-eye-line';
        }

        renderRecentTransactions();
        renderFullTransactionsTable();
        renderVaults();
        renderAnalytics();
        renderNotifications();
    }

    // Render Recent Transactions on Dashboard
    function renderRecentTransactions() {
        const container = document.getElementById('recentTxList');
        if (!container) return;

        const recent = state.transactions.slice(0, 4);
        if (recent.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-3">Belum ada transaksi.</p>';
            return;
        }

        container.innerHTML = recent.map(tx => {
            const isDebit = tx.type === 'debit';
            const iconClass = tx.category === 'topup' ? 'ri-arrow-down-line tx-icon-topup' :
                              tx.category === 'transfer' ? 'ri-arrow-up-line tx-icon-transfer' :
                              tx.category === 'cashback' ? 'ri-gift-line tx-icon-cashback' :
                              'ri-shopping-bag-line tx-icon-payment';

            return `
                <div class="tx-item" onclick="openReceiptModal('${tx.id}')">
                    <div class="tx-left">
                        <div class="tx-icon-box ${iconClass}">
                            <i class="${iconClass.split(' ')[0]}"></i>
                        </div>
                        <div class="tx-details">
                            <span class="tx-title">${tx.title}</span>
                            <span class="tx-time">${formatDate(tx.date)}</span>
                        </div>
                    </div>
                    <div class="tx-right">
                        <span class="tx-amount ${isDebit ? 'text-danger' : 'text-success'}">
                            ${isDebit ? '-' : '+'}${formatRupiah(tx.amount)}
                        </span>
                        <span class="tx-status-badge badge-success">Sukses</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render Full Transactions View
    function renderFullTransactionsTable() {
        const tbody = document.getElementById('fullTxTableBody');
        if (!tbody) return;

        const searchQuery = (document.getElementById('txSearchInput')?.value || '').toLowerCase();
        const activeCategory = document.querySelector('#txCategoryPills .pill-btn.active')?.dataset.category || 'all';

        const filtered = state.transactions.filter(tx => {
            const matchesSearch = tx.title.toLowerCase().includes(searchQuery) ||
                                  tx.method.toLowerCase().includes(searchQuery) ||
                                  tx.amount.toString().includes(searchQuery);
            const matchesCategory = activeCategory === 'all' || tx.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Tidak ada transaksi yang cocok.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(tx => {
            const isDebit = tx.type === 'debit';
            return `
                <tr>
                    <td>${formatDate(tx.date)}</td>
                    <td><b>${tx.title}</b><br><small class="text-muted">${tx.id}</small></td>
                    <td><span class="month-tag">${tx.category.toUpperCase()}</span></td>
                    <td>${tx.method}</td>
                    <td class="${isDebit ? 'text-danger' : 'text-success'} font-weight-bold">
                        ${isDebit ? '-' : '+'}${formatRupiah(tx.amount)}
                    </td>
                    <td><span class="tx-status-badge badge-success">Sukses</span></td>
                    <td>
                        <button class="btn-table-action" onclick="openReceiptModal('${tx.id}')">Resi</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Render Savings Vaults
    function renderVaults() {
        const miniContainer = document.getElementById('vaultListMini');
        const fullGrid = document.getElementById('fullVaultsGrid');

        // Mini list for dashboard
        if (miniContainer) {
            miniContainer.innerHTML = state.vaults.map(v => {
                const percent = Math.min(100, Math.round((v.currentAmount / v.targetAmount) * 100));
                return `
                    <div class="vault-item-mini">
                        <div class="vault-info-mini">
                            <div class="vault-icon-box"><i class="${v.icon}"></i></div>
                            <div>
                                <div class="vault-name">${v.name}</div>
                                <div class="vault-progress-text">${formatRupiah(v.currentAmount)} / ${formatRupiah(v.targetAmount)}</div>
                            </div>
                        </div>
                        <div class="vault-percent">${percent}%</div>
                    </div>
                `;
            }).join('');
        }

        // Full grid for vaults view
        if (fullGrid) {
            fullGrid.innerHTML = state.vaults.map(v => {
                const percent = Math.min(100, Math.round((v.currentAmount / v.targetAmount) * 100));
                return `
                    <div class="vault-card-full">
                        <div class="vault-header-row">
                            <div class="vault-icon-lg"><i class="${v.icon}"></i></div>
                            <div class="vault-meta">
                                <h4>${v.name}</h4>
                                <span>Target Waktu: Des 2026</span>
                            </div>
                        </div>
                        <div class="vault-numbers">
                            <span>${formatRupiah(v.currentAmount)}</span>
                            <span>Target: ${formatRupiah(v.targetAmount)}</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="vault-actions">
                            <button class="btn-primary w-100" onclick="depositVault('${v.id}')">+ Alokasikan Rp 100.000</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Render Analytics Calculations
    function renderAnalytics() {
        let totalIncome = 0;
        let totalExpense = 0;

        const categoryTotals = { food: 0, bills: 0, shop: 0, other: 0 };

        state.transactions.forEach(tx => {
            if (tx.type === 'credit') {
                totalIncome += tx.amount;
            } else {
                totalExpense += tx.amount;
                if (tx.category === 'payment') categoryTotals.bills += tx.amount;
                else if (tx.category === 'transfer') categoryTotals.other += tx.amount;
                else categoryTotals.food += tx.amount;
            }
        });

        // Dashboard quick analytics
        const dashExpense = document.getElementById('dashTotalExpense');
        const dashIncome = document.getElementById('dashTotalIncome');
        if (dashExpense) dashExpense.textContent = formatRupiah(totalExpense);
        if (dashIncome) dashIncome.textContent = formatRupiah(totalIncome);

        // Full analytics view
        const aIncome = document.getElementById('analyticIncome');
        const aExpense = document.getElementById('analyticExpense');
        const aNet = document.getElementById('analyticNet');

        if (aIncome) aIncome.textContent = formatRupiah(totalIncome);
        if (aExpense) aExpense.textContent = formatRupiah(totalExpense);
        if (aNet) aNet.textContent = formatRupiah(totalIncome - totalExpense);

        // Breakdown progress
        const listEl = document.getElementById('categoryBreakdownList');
        if (listEl) {
            const categories = [
                { name: 'Makanan & Resto (QRIS)', amount: categoryTotals.food || 1200000, color: '#f43f5e' },
                { name: 'Tagihan PPOB & PLN', amount: categoryTotals.bills || 850000, color: '#f59e0b' },
                { name: 'Belanja & E-Commerce', amount: categoryTotals.shop || 650000, color: '#8b5cf6' },
                { name: 'Transfer & Lainnya', amount: categoryTotals.other || 720000, color: '#06b6d4' }
            ];

            const grandTotal = categories.reduce((acc, c) => acc + c.amount, 0) || 1;

            listEl.innerHTML = categories.map(c => {
                const pct = Math.round((c.amount / grandTotal) * 100);
                return `
                    <div class="cat-breakdown-item">
                        <div class="cat-head">
                            <span>${c.name}</span>
                            <span>${formatRupiah(c.amount)} (${pct}%)</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-fill" style="width: ${pct}%; background: ${c.color}"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Render Notifications Drawer
    function renderNotifications() {
        const notifList = document.getElementById('notifList');
        const badge = document.getElementById('notifBadge');
        if (!notifList) return;

        if (state.notifications.length === 0) {
            notifList.innerHTML = '<p class="text-muted text-center py-4">Tidak ada notifikasi baru.</p>';
            if (badge) badge.style.display = 'none';
            return;
        }

        if (badge) badge.style.display = 'block';

        notifList.innerHTML = state.notifications.map(n => `
            <div class="notif-item">
                <i class="ri-notification-3-line notif-icon"></i>
                <div class="notif-content">
                    <h5>${n.title}</h5>
                    <p>${n.desc}</p>
                    <small class="text-muted">${n.time}</small>
                </div>
            </div>
        `).join('');
    }

    // ----------------------------------------------------------------------
    // 4. NAVIGATION & TAB SWITCHING
    // ----------------------------------------------------------------------
    const navLinks = document.querySelectorAll('.nav-link, .view-all-link');
    const views = document.querySelectorAll('.view-content');

    function switchTab(tabId) {
        views.forEach(view => view.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

        const targetView = document.getElementById('view' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
        const targetLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);

        if (targetView) targetView.classList.add('active');
        if (targetLink) targetLink.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');
            if (tab) switchTab(tab);
        });
    });

    // ----------------------------------------------------------------------
    // 5. MODAL SYSTEM HANDLERS
    // ----------------------------------------------------------------------
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-close');
            closeModal(target);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    // ----------------------------------------------------------------------
    // 6. ACTION & TRANSACTION WORKFLOWS
    // ----------------------------------------------------------------------

    // Toggle Balance Visibility
    document.getElementById('toggleBalanceBtn')?.addEventListener('click', () => {
        state.isBalanceHidden = !state.isBalanceHidden;
        saveState();
    });

    // Copy Account Number to Clipboard
    document.getElementById('copyAccBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(state.accountNumber);
        showToast('Nomor Akun E-Wallet berhasil disalin!', 'success');
    });

    // Theme Toggle Handler (Desktop sidebar, Mobile header, and Profile dropdown)
    function handleThemeToggle() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        saveState();
        showToast(`Tema diganti ke mode ${state.theme.toUpperCase()}`, 'success');
    }

    document.getElementById('themeToggleBtn')?.addEventListener('click', handleThemeToggle);
    document.getElementById('headerThemeToggleBtn')?.addEventListener('click', handleThemeToggle);
    document.getElementById('dropdownThemeToggle')?.addEventListener('click', () => {
        quickProfileBtn?.classList.remove('active');
        profileDropdown?.classList.remove('active');
        handleThemeToggle();
    });

    // OPEN MODALS BUTTONS
    document.getElementById('btnOpenTopUp')?.addEventListener('click', () => openModal('modalTopUp'));
    document.getElementById('btnOpenTransfer')?.addEventListener('click', () => openModal('modalTransfer'));
    document.getElementById('btnOpenQRIS')?.addEventListener('click', () => {
        document.getElementById('qrisCheckoutForm')?.classList.add('hidden');
        openModal('modalQRIS');
    });
    document.getElementById('btnOpenWithdraw')?.addEventListener('click', () => {
        showToast('Tarik Tunai dapat dilakukan di Indomaret/ATM terdekat menggunakan Kode Token.', 'success');
    });
    document.getElementById('btnCreateVaultQuick')?.addEventListener('click', () => openModal('modalCreateVault'));
    document.getElementById('btnCreateVaultMain')?.addEventListener('click', () => openModal('modalCreateVault'));

    // Quick Nominal Selector in Topup
    const chipBtns = document.querySelectorAll('.quick-amounts-grid .btn-chip');
    chipBtns.forEach(chip => {
        chip.addEventListener('click', () => {
            chipBtns.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const amount = chip.getAttribute('data-amount');
            document.getElementById('topUpAmountInput').value = amount;
        });
    });

    // PROCESS TOP UP
    document.getElementById('btnSubmitTopUp')?.addEventListener('click', () => {
        const amountInput = parseInt(document.getElementById('topUpAmountInput').value);
        const method = document.getElementById('topUpMethodSelect').value;

        if (isNaN(amountInput) || amountInput < 10000) {
            showToast('Nominal minimum top up adalah Rp 10.000', 'error');
            return;
        }

        // Add Top Up Transaction
        state.balance += amountInput;
        const newTx = {
            id: generateTxId(),
            title: `Isi Saldo (${method})`,
            category: 'topup',
            type: 'credit',
            amount: amountInput,
            date: new Date().toISOString(),
            status: 'success',
            method: method,
            note: 'Top Up sukses'
        };

        state.transactions.unshift(newTx);
        state.notifications.unshift({
            id: 'n-' + Date.now(),
            title: 'Top Up Berhasil!',
            desc: `Saldo sebesar ${formatRupiah(amountInput)} telah masuk via ${method}.`,
            time: 'Baru saja'
        });

        saveState();
        closeModal('modalTopUp');
        playSuccessSound();
        showToast(`Top Up ${formatRupiah(amountInput)} Berhasil!`, 'success');
    });

    // CONTACT PILLS SELECTOR IN TRANSFER
    document.querySelectorAll('.contact-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const phone = pill.getAttribute('data-phone');
            const name = pill.getAttribute('data-name');
            document.getElementById('transferPhoneInput').value = phone;
            document.getElementById('transferNameInput').value = name;
        });
    });

    // PENDING TRANSFER CONTEXT FOR PIN VERIFICATION
    let pendingTx = null;

    document.getElementById('btnProceedTransfer')?.addEventListener('click', () => {
        const name = document.getElementById('transferNameInput').value || 'Penerima';
        const phone = document.getElementById('transferPhoneInput').value;
        const amount = parseInt(document.getElementById('transferAmountInput').value);
        const note = document.getElementById('transferNoteInput').value || 'Transfer E-Wallet';

        if (!phone || isNaN(amount) || amount < 10000) {
            showToast('Lengkapi nomor tujuan dan nominal transfer (min Rp 10.000)', 'error');
            return;
        }

        if (amount > state.balance) {
            showToast('Saldo Anda tidak mencukupi untuk transaksi ini', 'error');
            return;
        }

        pendingTx = {
            title: `Transfer ke ${name}`,
            category: 'transfer',
            type: 'debit',
            amount: amount,
            method: `Transfer (${phone})`,
            note: note,
            recipient: name
        };

        closeModal('modalTransfer');
        resetPinDots();
        openModal('modalPin');
    });

    // QRIS SCAN SIMULATOR
    document.getElementById('btnSimulateScan')?.addEventListener('click', () => {
        document.getElementById('qrisCheckoutForm').classList.remove('hidden');
    });

    document.getElementById('btnPayQRIS')?.addEventListener('click', () => {
        const amount = parseInt(document.getElementById('qrisAmountInput').value) || 75000;
        if (amount > state.balance) {
            showToast('Saldo Anda tidak cukup', 'error');
            return;
        }

        pendingTx = {
            title: 'Kopi Kenangan - Mall Central',
            category: 'payment',
            type: 'debit',
            amount: amount,
            method: 'QRIS Scan Merchant',
            note: 'Pembayaran QRIS'
        };

        closeModal('modalQRIS');
        resetPinDots();
        openModal('modalPin');
    });

    // PPOB BUTTON TRIGGERS
    document.querySelectorAll('.btn-ppob-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const serviceType = btn.getAttribute('data-type');
            document.getElementById('ppobModalTitle').innerHTML = `<i class="ri-flashlight-line"></i> Pembayaran ${serviceType}`;
            document.getElementById('ppobNumLabel').textContent = `Nomor Pelanggan / ID ${serviceType}`;
            openModal('modalPpobCheckout');

            document.getElementById('btnSubmitPpob').onclick = () => {
                const num = document.getElementById('ppobNumberInput').value;
                const price = parseInt(document.getElementById('ppobNominalSelect').value) + 1500;

                if (!num) {
                    showToast('Masukkan nomor pelanggan!', 'error');
                    return;
                }

                if (price > state.balance) {
                    showToast('Saldo tidak mencukupi untuk tagihan PPOB ini', 'error');
                    return;
                }

                pendingTx = {
                    title: `Tagihan ${serviceType}`,
                    category: 'payment',
                    type: 'debit',
                    amount: price,
                    method: `PPOB Direct (${num})`,
                    note: `Pembayaran ${serviceType} No. ${num}`
                };

                closeModal('modalPpobCheckout');
                resetPinDots();
                openModal('modalPin');
            };
        });
    });

    // ----------------------------------------------------------------------
    // 7. PIN KEYPAD & TRANSACTION FINALIZATION
    // ----------------------------------------------------------------------
    let currentPinInput = '';

    function resetPinDots() {
        currentPinInput = '';
        updatePinDotsUI();
    }

    function updatePinDotsUI() {
        const dots = document.querySelectorAll('#pinDots .dot');
        dots.forEach((dot, index) => {
            if (index < currentPinInput.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    document.querySelectorAll('#pinKeypad .key-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-key');
            if (key === 'del') {
                currentPinInput = currentPinInput.slice(0, -1);
                updatePinDotsUI();
            } else if (key && currentPinInput.length < 6) {
                currentPinInput += key;
                updatePinDotsUI();

                if (currentPinInput.length === 6) {
                    setTimeout(verifyPinAndExecute, 200);
                }
            }
        });
    });

    function verifyPinAndExecute() {
        if (currentPinInput === state.pin || currentPinInput === '123456') {
            if (pendingTx) {
                state.balance -= pendingTx.amount;
                const createdTx = {
                    id: generateTxId(),
                    title: pendingTx.title,
                    category: pendingTx.category,
                    type: pendingTx.type,
                    amount: pendingTx.amount,
                    date: new Date().toISOString(),
                    status: 'success',
                    method: pendingTx.method,
                    note: pendingTx.note
                };

                state.transactions.unshift(createdTx);
                saveState();
                closeModal('modalPin');
                playSuccessSound();

                window.openReceiptModal(createdTx.id);
                showToast(`Transaksi ${createdTx.title} Berhasil!`, 'success');
                pendingTx = null;
            }
        } else {
            showToast('PIN yang Anda masukkan salah. Coba lagi (PIN Demo: 123456)', 'error');
            resetPinDots();
        }
    }

    // ----------------------------------------------------------------------
    // 8. RECEIPT / STRUK DISPLAY
    // ----------------------------------------------------------------------
    window.openReceiptModal = function(txId) {
        const tx = state.transactions.find(t => t.id === txId);
        if (!tx) return;

        const receiptBody = document.getElementById('receiptBody');
        receiptBody.innerHTML = `
            <div class="receipt-card">
                <div class="receipt-header">
                    <i class="ri-checkbox-circle-fill receipt-status-icon"></i>
                    <h4>TRANSAKSI BERHASIL</h4>
                    <p>PayPulse E-Wallet Digital</p>
                    <h3 class="receipt-amount-display ${tx.type === 'debit' ? 'text-danger' : 'text-success'}">
                        ${tx.type === 'debit' ? '-' : '+'}${formatRupiah(tx.amount)}
                    </h3>
                </div>
                <div class="receipt-details-list">
                    <div class="receipt-row">
                        <span class="r-label">ID Transaksi</span>
                        <span class="r-val">${tx.id}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="r-label">Deskripsi</span>
                        <span class="r-val">${tx.title}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="r-label">Tanggal & Waktu</span>
                        <span class="r-val">${formatDate(tx.date)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="r-label">Metode Pembayaran</span>
                        <span class="r-val">${tx.method}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="r-label">Catatan</span>
                        <span class="r-val">${tx.note || '-'}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="r-label">Status</span>
                        <span class="r-val text-success">SUKSES (TERVERIFIKASI)</span>
                    </div>
                </div>
            </div>
        `;
        openModal('modalReceipt');
    };

    document.getElementById('btnPrintReceipt')?.addEventListener('click', () => {
        window.print();
    });

    // ----------------------------------------------------------------------
    // 9. VAULTS DEPOSIT & CREATE
    // ----------------------------------------------------------------------
    window.depositVault = function(vaultId) {
        const vault = state.vaults.find(v => v.id === vaultId);
        if (!vault) return;

        if (state.balance < 100000) {
            showToast('Saldo utama tidak mencukupi untuk dialokasikan ke vault.', 'error');
            return;
        }

        state.balance -= 100000;
        vault.currentAmount += 100000;
        state.transactions.unshift({
            id: generateTxId(),
            title: `Alokasi Tabungan: ${vault.name}`,
            category: 'transfer',
            type: 'debit',
            amount: 100000,
            date: new Date().toISOString(),
            status: 'success',
            method: 'Kantong Impian Vault',
            note: 'Tabungan impian'
        });

        saveState();
        playSuccessSound();
        showToast(`Berhasil menambah Rp 100.000 ke ${vault.name}!`, 'success');
    };

    document.getElementById('btnSubmitCreateVault')?.addEventListener('click', () => {
        const name = document.getElementById('vaultNameInput').value;
        const target = parseInt(document.getElementById('vaultTargetInput').value);
        const icon = document.getElementById('vaultIconSelect').value;

        if (!name || isNaN(target) || target < 100000) {
            showToast('Lengkapi nama kantong & target minimal Rp 100.000', 'error');
            return;
        }

        state.vaults.push({
            id: 'vault-' + Date.now(),
            name: name,
            targetAmount: target,
            currentAmount: 0,
            icon: icon
        });

        saveState();
        closeModal('modalCreateVault');
        showToast(`Kantong impian "${name}" berhasil dibuat!`, 'success');
    });

    // ----------------------------------------------------------------------
    // 10. SEARCH & FILTER LISTENERS
    // ----------------------------------------------------------------------
    document.getElementById('txSearchInput')?.addEventListener('input', renderFullTransactionsTable);

    document.querySelectorAll('#txCategoryPills .pill-btn').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#txCategoryPills .pill-btn').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderFullTransactionsTable();
        });
    });

    // Notifications Drawer
    document.getElementById('notifBtn')?.addEventListener('click', () => {
        document.getElementById('drawerNotif').classList.add('active');
    });

    document.getElementById('closeNotifDrawer')?.addEventListener('click', () => {
        document.getElementById('drawerNotif').classList.remove('active');
    });

    // INIT INITIAL APP RENDER
    renderApp();
});
