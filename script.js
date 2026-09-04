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
                    <div class="vault-item-mini" onclick="switchTab('vaults')" style="cursor: pointer;" title="Buka detail kantong impian">
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
                            <button class="btn-primary" onclick="depositVault('${v.id}')" title="Alokasikan Rp 100.000 ke kantong ini"><i class="ri-add-line"></i> Alokasi 100k</button>
                            <button class="btn-vault-withdraw" onclick="openWithdrawVaultModal('${v.id}')" title="Tarik saldo kantong ke saldo utama"><i class="ri-hand-coin-line"></i> Tarik Saldo</button>
                            <button class="btn-icon-danger-sm" onclick="deleteVault('${v.id}')" title="Tutup / Hapus Kantong"><i class="ri-delete-bin-line"></i></button>
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
        if (modal) {
            modal.classList.add('active');
            if (modalId === 'modalQRIS') {
                startQRISCamera();
            }
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            if (modalId === 'modalQRIS') {
                stopQRISCamera();
            }
        }
    }

    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-close');
            closeModal(target);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                if (overlay.id === 'modalQRIS') {
                    stopQRISCamera();
                }
            }
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
    document.getElementById('btnCreateVaultQuick')?.addEventListener('click', () => openModal('modalCreateVault'));
    document.getElementById('btnCreateVaultMain')?.addEventListener('click', () => openModal('modalCreateVault'));

    // Quick Nominal Selector in Topup
    const chipBtns = document.querySelectorAll('.quick-amounts-grid .btn-chip');
    chipBtns.forEach(chip => {
        chip.addEventListener('click', () => {
            const parent = chip.closest('.quick-amounts-grid');
            if (parent && (parent.id === 'vaultWithdrawChips' || parent.id === 'cashOutAmountsGrid')) return;
            chipBtns.forEach(c => {
                if (c.closest('.quick-amounts-grid') === parent) c.classList.remove('active');
            });
            chip.classList.add('active');
            const amount = chip.getAttribute('data-amount');
            const topUpInput = document.getElementById('topUpAmountInput');
            if (topUpInput && amount) topUpInput.value = amount;
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

    // ----------------------------------------------------------------------
    // 6D. LIVE QRIS CAMERA & SCANNER SYSTEM
    // ----------------------------------------------------------------------
    let qrisMediaStream = null;
    let qrisFacingMode = 'environment';
    let isTorchActive = false;
    let qrScanInterval = null;

    async function startQRISCamera() {
        const videoEl = document.getElementById('qrisVideoFeed');
        const placeholderEl = document.getElementById('qrisCameraPlaceholder');
        const statusText = document.getElementById('cameraStatusText');
        const badgeEl = document.getElementById('cameraLiveBadge');
        const badgeText = document.getElementById('cameraBadgeText');
        const torchBtn = document.getElementById('btnToggleTorch');

        if (statusText) statusText.textContent = 'Mengakses Kamera Handphone...';
        if (badgeText) badgeText.textContent = 'Menghubungkan Kamera...';
        if (placeholderEl) placeholderEl.classList.remove('hidden');
        if (videoEl) videoEl.classList.add('hidden');

        stopQRISCamera();

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('WebRTC / Kamera tidak didukung pada browser ini.');
            }

            const constraints = {
                video: {
                    facingMode: { ideal: qrisFacingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            qrisMediaStream = stream;

            if (videoEl) {
                videoEl.srcObject = stream;
                await videoEl.play();
                videoEl.classList.remove('hidden');
            }

            if (placeholderEl) placeholderEl.classList.add('hidden');
            if (badgeEl) badgeEl.style.display = 'inline-flex';
            if (badgeText) {
                const isBack = qrisFacingMode === 'environment';
                badgeText.textContent = `Kamera ${isBack ? 'Belakang' : 'Depan'} Aktif`;
            }

            // Check torch support
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities ? track.getCapabilities() : {};
            if (torchBtn) {
                if (capabilities.torch) {
                    torchBtn.style.display = 'flex';
                } else {
                    torchBtn.style.opacity = '0.5';
                }
            }

            // Start scanning detection
            startQRScanningLoop();

        } catch (err) {
            console.warn('QRIS Camera Access Notice:', err);
            if (placeholderEl) placeholderEl.classList.remove('hidden');
            if (videoEl) videoEl.classList.add('hidden');
            if (statusText) {
                statusText.innerHTML = 'Kamera tidak dapat diakses langsung.<br><small style="opacity:0.85">Gunakan Simulasi Scan atau Unggah QR dari Galeri di bawah.</small>';
            }
            if (badgeText) badgeText.textContent = 'Simulasi Scanner Siap';
        }
    }

    function stopQRISCamera() {
        if (qrisMediaStream) {
            qrisMediaStream.getTracks().forEach(track => {
                try { track.stop(); } catch (e) {}
            });
            qrisMediaStream = null;
        }

        if (qrScanInterval) {
            clearInterval(qrScanInterval);
            qrScanInterval = null;
        }

        const videoEl = document.getElementById('qrisVideoFeed');
        if (videoEl) {
            videoEl.srcObject = null;
            videoEl.classList.add('hidden');
        }

        isTorchActive = false;
        const torchBtn = document.getElementById('btnToggleTorch');
        if (torchBtn) torchBtn.classList.remove('active');
    }

    function startQRScanningLoop() {
        if (qrScanInterval) clearInterval(qrScanInterval);

        if ('BarcodeDetector' in window) {
            try {
                const detector = new BarcodeDetector({ formats: ['qr_code'] });
                const videoEl = document.getElementById('qrisVideoFeed');

                qrScanInterval = setInterval(async () => {
                    if (!videoEl || videoEl.readyState < 2 || !qrisMediaStream) return;
                    try {
                        const barcodes = await detector.detect(videoEl);
                        if (barcodes && barcodes.length > 0) {
                            handleQRScannedSuccess('Merchant QRIS Resmi Terverifikasi', 75000);
                        }
                    } catch (e) {}
                }, 400);
                return;
            } catch (e) {}
        }
    }

    function handleQRScannedSuccess(merchantName = 'Kopi Kenangan Mantan - Mall Central', defaultNominal = 75000) {
        if (qrScanInterval) {
            clearInterval(qrScanInterval);
            qrScanInterval = null;
        }

        playSuccessSound();
        const formEl = document.getElementById('qrisCheckoutForm');
        const merchantEl = document.getElementById('qrisMerchantName');
        const inputEl = document.getElementById('qrisAmountInput');

        if (merchantEl) merchantEl.textContent = merchantName;
        if (inputEl) inputEl.value = defaultNominal;
        if (formEl) {
            formEl.classList.remove('hidden');
            formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        showToast(`QR Merchant "${merchantName}" Berhasil Terpindai!`, 'success');
    }

    // Toggle Torch / Flashlight
    document.getElementById('btnToggleTorch')?.addEventListener('click', async () => {
        if (!qrisMediaStream) {
            showToast('Nyalakan kamera terlebih dahulu.', 'warning');
            return;
        }

        const track = qrisMediaStream.getVideoTracks()[0];
        if (!track) return;

        try {
            const capabilities = track.getCapabilities ? track.getCapabilities() : {};
            if (!capabilities.torch) {
                showToast('Fitur lampu senter/flash tidak didukung pada kamera perangkat ini.', 'info');
                return;
            }

            isTorchActive = !isTorchActive;
            await track.applyConstraints({ advanced: [{ torch: isTorchActive }] });
            const torchBtn = document.getElementById('btnToggleTorch');
            if (torchBtn) torchBtn.classList.toggle('active', isTorchActive);
            showToast(`Lampu senter ${isTorchActive ? 'dinyalakan' : 'dimatikan'}`, 'success');
        } catch (err) {
            showToast('Tidak dapat mengubah status lampu senter.', 'error');
        }
    });

    // Switch Camera (Front <-> Back)
    document.getElementById('btnSwitchCamera')?.addEventListener('click', () => {
        qrisFacingMode = qrisFacingMode === 'environment' ? 'user' : 'environment';
        startQRISCamera();
        showToast(`Beralih ke kamera ${qrisFacingMode === 'environment' ? 'belakang' : 'depan'}...`, 'info');
    });

    // Upload QR Code Image from Gallery
    const qrisFileInput = document.getElementById('qrisFileInput');
    document.getElementById('btnUploadQRImage')?.addEventListener('click', () => {
        qrisFileInput?.click();
    });

    qrisFileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
            showToast('Memproses gambar QR Code dari galeri...', 'info');
            setTimeout(() => {
                handleQRScannedSuccess('Resto Padang Sederhana - QRIS UMKM', 50000);
            }, 700);
        }
    });

    // Viewfinder click trigger
    document.getElementById('qrisViewfinder')?.addEventListener('click', () => {
        const formEl = document.getElementById('qrisCheckoutForm');
        if (formEl && formEl.classList.contains('hidden')) {
            handleQRScannedSuccess('Kopi Kenangan Mantan - Mall Central', 75000);
        }
    });

    // QRIS SCAN SIMULATOR
    document.getElementById('btnSimulateScan')?.addEventListener('click', () => {
        handleQRScannedSuccess('Kopi Kenangan Mantan - Mall Central', 75000);
    });

    document.getElementById('btnPayQRIS')?.addEventListener('click', () => {
        const amount = parseInt(document.getElementById('qrisAmountInput').value) || 75000;
        if (amount > state.balance) {
            showToast('Saldo Anda tidak cukup', 'error');
            return;
        }

        const merchantName = document.getElementById('qrisMerchantName')?.textContent || 'Merchant QRIS';

        pendingTx = {
            title: merchantName,
            category: 'payment',
            type: 'debit',
            amount: amount,
            method: 'QRIS Scan Merchant',
            note: 'Pembayaran QRIS Merchant'
        };

        stopQRISCamera();
        closeModal('modalQRIS');
        resetPinDots();
        openModal('modalPin');
    });

    // ----------------------------------------------------------------------
    // 6. COMPREHENSIVE PPOB ENGINE (PULSA, PLN, PDAM, BPJS, GAMES, EMONEY, INTERNET)
    // ----------------------------------------------------------------------
    const PPOB_CATALOG = {
        pulsa: {
            title: 'Pulsa & Paket Data',
            icon: 'ri-smartphone-line',
            subtitle: 'Isi ulang pulsa reguler & kuota internet semua operator',
            inputLabel: 'Nomor Handphone',
            inputPlaceholder: '08xx-xxxx-xxxx',
            inputIcon: 'ri-phone-line',
            hasSubtabs: true,
            subtab1: 'Pulsa Reguler',
            subtab2: 'Paket Data Kuota',
            providers: [
                { id: 'telkomsel', name: 'Telkomsel (SimPATI / By.U)' },
                { id: 'indosat', name: 'Indosat Ooredoo Hutchison' },
                { id: 'xl', name: 'XL Axiata' },
                { id: 'tri', name: 'Tri Indonesia (3)' },
                { id: 'smartfren', name: 'Smartfren 4G LTE' },
                { id: 'axis', name: 'Axis Hitz' }
            ],
            packages: {
                main: [
                    { id: 'p10', title: 'Pulsa Rp 10.000', desc: 'Masa aktif +15 hari', price: 11500, amount: 10000 },
                    { id: 'p25', title: 'Pulsa Rp 25.000', desc: 'Masa aktif +30 hari', price: 26000, amount: 25000 },
                    { id: 'p50', title: 'Pulsa Rp 50.000', desc: 'Masa aktif +45 hari', price: 51000, amount: 50000, badge: 'FAVORIT' },
                    { id: 'p100', title: 'Pulsa Rp 100.000', desc: 'Masa aktif +60 hari', price: 100500, amount: 100000, badge: 'PROMO' },
                    { id: 'p150', title: 'Pulsa Rp 150.000', desc: 'Masa aktif +90 hari', price: 150500, amount: 150000 },
                    { id: 'p200', title: 'Pulsa Rp 200.000', desc: 'Masa aktif +120 hari', price: 199000, amount: 200000, badge: 'CASHBACK' }
                ],
                secondary: [
                    { id: 'd5', title: 'Kuota 5 GB (7 Hari)', desc: 'Full 24 Jam Semua Jaringan', price: 25000, amount: 25000 },
                    { id: 'd12', title: 'Kuota 12 GB (30 Hari)', desc: '10GB Utama + 2GB YouTube', price: 50000, amount: 50000, badge: 'BESTSELLER' },
                    { id: 'd25', title: 'Kuota 25 GB (30 Hari)', desc: '20GB Utama + 5GB Apps Chat', price: 85000, amount: 85000 },
                    { id: 'd50', title: 'Kuota 50 GB Max (30 Hari)', desc: 'Full Kuota Utama Non-Stop', price: 125000, amount: 125000, badge: 'HEMAT' },
                    { id: 'd100', title: 'Kuota 100 GB Jumbo (30 Hari)', desc: 'Streaming & Gaming Bebas', price: 180000, amount: 180000 },
                    { id: 'd_unli', title: 'Unlimited Turbo (30 Hari)', desc: 'FUP 3GB/Hari + Free WA/IG', price: 95000, amount: 95000 }
                ]
            }
        },
        pln: {
            title: 'Token & Tagihan Listrik PLN',
            icon: 'ri-flashlight-line',
            subtitle: 'Beli token listrik prabayar & bayar tagihan pascabayar PLN',
            inputLabel: 'Nomor Meter / ID Pelanggan PLN',
            inputPlaceholder: 'Contoh: 5382 0918 2390',
            inputIcon: 'ri-flashlight-fill',
            hasSubtabs: true,
            subtab1: 'Token Listrik (Prabayar)',
            subtab2: 'Tagihan Listrik (Pascabayar)',
            providers: [
                { id: 'pln_pre', name: 'PLN Prabayar (Token)' },
                { id: 'pln_post', name: 'PLN Pascabayar (Tagihan)' }
            ],
            packages: {
                main: [
                    { id: 'pln20', title: 'Token PLN 20.000', desc: 'Estimasi ~ 13.5 kWh', price: 21500, amount: 20000 },
                    { id: 'pln50', title: 'Token PLN 50.000', desc: 'Estimasi ~ 33.8 kWh', price: 51500, amount: 50000, badge: 'POPULER' },
                    { id: 'pln100', title: 'Token PLN 100.000', desc: 'Estimasi ~ 67.5 kWh', price: 101500, amount: 100000 },
                    { id: 'pln200', title: 'Token PLN 200.000', desc: 'Estimasi ~ 135.0 kWh', price: 201500, amount: 200000 },
                    { id: 'pln500', title: 'Token PLN 500.000', desc: 'Estimasi ~ 337.5 kWh', price: 501500, amount: 500000 },
                    { id: 'pln1000', title: 'Token PLN 1.000.000', desc: 'Estimasi ~ 675.0 kWh', price: 1001500, amount: 1000000 }
                ],
                secondary: []
            },
            inquiry: {
                name: 'BAMBANG SUDIBYO',
                tarif: 'R1M / 900 VA',
                amount: 145000,
                admin: 1500
            }
        },
        pdam: {
            title: 'Pembayaran Air PDAM',
            icon: 'ri-drop-line',
            subtitle: 'Cek tagihan & bayar PDAM seluruh wilayah Indonesia',
            inputLabel: 'Nomor Sambungan / No. Pelanggan PDAM',
            inputPlaceholder: 'Contoh: 1002938481',
            inputIcon: 'ri-drop-fill',
            hasSubtabs: false,
            providers: [
                { id: 'pdam_jkt', name: 'PAM JAYA DKI Jakarta' },
                { id: 'pdam_bdg', name: 'PDAM Tirtawening Kota Bandung' },
                { id: 'pdam_sby', name: 'PDAM Surya Sembada Kota Surabaya' },
                { id: 'pdam_smg', name: 'PDAM Tirta Moedal Kota Semarang' },
                { id: 'pdam_grs', name: 'PDAM Giri Tirta Gresik' },
                { id: 'pdam_dps', name: 'PDAM Kota Denpasar Bali' },
                { id: 'pdam_mdn', name: 'PDAM Tirtanadi Sumatera Utara' },
                { id: 'pdam_bgr', name: 'PDAM Tirta Pakuan Kota Bogor' }
            ],
            packages: { main: [] },
            inquiry: {
                name: 'HENDRA WIJAYA',
                tarif: 'Rumah Tangga A2 (Pemakaian: 22 m³)',
                amount: 92500,
                admin: 1500
            }
        },
        bpjs: {
            title: 'Iuran BPJS Kesehatan',
            icon: 'ri-heart-pulse-line',
            subtitle: 'Bayar iuran BPJS Kesehatan keluarga tepat waktu',
            inputLabel: 'Nomor Kartu BPJS / NIK (13-16 digit)',
            inputPlaceholder: '0001234567890',
            inputIcon: 'ri-id-card-line',
            hasSubtabs: false,
            providers: [
                { id: 'bpjs_kes', name: 'BPJS Kesehatan Mandiri / Perorangan' }
            ],
            packages: {
                main: [
                    { id: 'bpjs_1m', title: 'Bayar 1 Bulan', desc: 'Kelas 2 (3 Jiwa)', price: 105000, amount: 105000 },
                    { id: 'bpjs_2m', title: 'Bayar 2 Bulan', desc: 'Periode 2 Bulan Lunas', price: 210000, amount: 210000 },
                    { id: 'bpjs_3m', title: 'Bayar 3 Bulan', desc: 'Periode 3 Bulan Lunas', price: 315000, amount: 315000, badge: 'PRAKTIS' },
                    { id: 'bpjs_6m', title: 'Bayar 6 Bulan', desc: 'Bebas Khawatir 6 Bulan', price: 630000, amount: 630000 },
                    { id: 'bpjs_12m', title: 'Bayar 12 Bulan (1 Tahun)', desc: 'Perlindungan Setahun Penuh', price: 1260000, amount: 1260000, badge: 'HEMAT' }
                ]
            },
            inquiry: {
                name: 'KELUARGA M IKHSAN ANGGARA',
                tarif: 'Kelas 2 Mandiri (3 Peserta Aktif)',
                amount: 105000,
                admin: 1500
            }
        },
        games: {
            title: 'Top Up Voucher Game',
            icon: 'ri-gamepad-line',
            subtitle: 'Top up diamond & voucher game favorit instan 24 jam',
            inputLabel: 'User ID Game',
            inputPlaceholder: 'Contoh: 12345678',
            inputIcon: 'ri-gamepad-fill',
            hasSubtabs: false,
            hasZoneId: true,
            providers: [
                { id: 'mlbb', name: 'Mobile Legends: Bang Bang (MLBB)' },
                { id: 'ff', name: 'Free Fire (Garena)' },
                { id: 'val', name: 'Valorant Points (Riot Games)' },
                { id: 'genshin', name: 'Genshin Impact (Genesis Crystals)' },
                { id: 'roblox', name: 'Roblox (Robux)' },
                { id: 'pubg', name: 'PUBG Mobile (UC)' },
                { id: 'steam', name: 'Steam Wallet Code IDR' }
            ],
            packages: {
                main: [
                    { id: 'g_ml86', title: '86 Diamonds', desc: 'Bonus 8 Diamonds', price: 20000, amount: 20000 },
                    { id: 'g_ml172', title: '172 Diamonds', desc: 'Bonus 16 Diamonds', price: 40000, amount: 40000 },
                    { id: 'g_ml257', title: '257 Diamonds', desc: 'Bonus 25 Diamonds', price: 60000, amount: 60000, badge: 'POPULER' },
                    { id: 'g_ml706', title: '706 Diamonds', desc: 'Bonus 64 Diamonds', price: 160000, amount: 160000 },
                    { id: 'g_ml_wdp', title: 'Weekly Diamond Pass', desc: 'Total 220 Diamonds (7 Hari)', price: 28000, amount: 28000, badge: 'TERLARIS' },
                    { id: 'g_ml_twi', title: 'Twilight Pass', desc: 'Hero Skin & Rewards Eksklusif', price: 145000, amount: 145000 }
                ]
            }
        },
        emoney: {
            title: 'Top Up Saldo E-Money & Dompet',
            icon: 'ri-bank-card-2-line',
            subtitle: 'Top up instan GoPay, OVO, DANA, ShopeePay, & Kartu Tol',
            inputLabel: 'Nomor HP Akun / Nomor Kartu E-Money',
            inputPlaceholder: '08xx-xxxx-xxxx atau 16 digit nomor kartu',
            inputIcon: 'ri-bank-card-line',
            hasSubtabs: false,
            providers: [
                { id: 'gopay', name: 'GoPay (Customer / Driver)' },
                { id: 'ovo', name: 'OVO Cash' },
                { id: 'dana', name: 'DANA Dompet Digital' },
                { id: 'shopeepay', name: 'ShopeePay' },
                { id: 'linkaja', name: 'LinkAja' },
                { id: 'mandiri_emoney', name: 'Mandiri e-Money (NFC)' },
                { id: 'flazz_bca', name: 'Flazz BCA' },
                { id: 'brizzi', name: 'BRI Brizzi' }
            ],
            packages: {
                main: [
                    { id: 'em20', title: 'Saldo Rp 20.000', desc: 'Biaya admin Rp 1.000', price: 21000, amount: 20000 },
                    { id: 'em50', title: 'Saldo Rp 50.000', desc: 'Biaya admin Rp 1.000', price: 51000, amount: 50000, badge: 'FAVORIT' },
                    { id: 'em100', title: 'Saldo Rp 100.000', desc: 'Biaya admin Rp 1.000', price: 101000, amount: 100000 },
                    { id: 'em200', title: 'Saldo Rp 200.000', desc: 'Biaya admin Rp 1.000', price: 201000, amount: 200000 },
                    { id: 'em500', title: 'Saldo Rp 500.000', desc: 'Bebas biaya admin', price: 500000, amount: 500000, badge: 'FREE ADMIN' },
                    { id: 'em1000', title: 'Saldo Rp 1.000.000', desc: 'Bebas biaya admin', price: 1000000, amount: 1000000 }
                ]
            }
        },
        internet: {
            title: 'Internet & TV Kabel',
            icon: 'ri-wifi-line',
            subtitle: 'Bayar tagihan IndiHome, Biznet, First Media, & MyRepublic',
            inputLabel: 'Nomor Pelanggan / ID Billing Internet',
            inputPlaceholder: 'Contoh: 12209384711',
            inputIcon: 'ri-router-line',
            hasSubtabs: false,
            providers: [
                { id: 'indihome', name: 'IndiHome Telkom Fiber' },
                { id: 'firstmedia', name: 'First Media Cable & Broadband' },
                { id: 'biznet', name: 'Biznet Home' },
                { id: 'myrepublic', name: 'MyRepublic Ultra Internet' },
                { id: 'mncplay', name: 'MNC Play' },
                { id: 'xlsatu', name: 'XL SATU Fiber' },
                { id: 'transvision', name: 'Transvision' },
                { id: 'kvision', name: 'K-Vision / Nex Parabola' }
            ],
            packages: { main: [] },
            inquiry: {
                name: 'M IKHSAN ANGGARA',
                tarif: 'Paket Fiber 50 Mbps + TV 88 Channel',
                amount: 345000,
                admin: 2500
            }
        },
        education: {
            title: 'Tagihan Pendidikan & Kampus',
            icon: 'ri-graduation-cap-line',
            subtitle: 'Bayar biaya SPP, UKT, & Uang Gedung Sekolah / Universitas',
            inputLabel: 'Nomor Induk Mahasiswa (NIM) / No. Siswa (NIS)',
            inputPlaceholder: 'Contoh: 1301204019 atau No. Virtual Account',
            inputIcon: 'ri-graduation-cap-fill',
            hasSubtabs: false,
            providers: [
                { id: 'ui', name: 'Universitas Indonesia (UI)' },
                { id: 'itb', name: 'Institut Teknologi Bandung (ITB)' },
                { id: 'ugm', name: 'Universitas Gadjah Mada (UGM)' },
                { id: 'unair', name: 'Universitas Airlangga (UNAIR)' },
                { id: 'ub', name: 'Universitas Brawijaya (UB)' },
                { id: 'undip', name: 'Universitas Diponegoro (UNDIP)' },
                { id: 'telkom_univ', name: 'Telkom University' },
                { id: 'binus', name: 'Binus University' },
                { id: 'al_azhar', name: 'Yayasan Pesantren Islam Al-Azhar' },
                { id: 'penabur', name: 'BPK Penabur' },
                { id: 'ruangguru', name: 'Ruangguru Academy & Bimbel' }
            ],
            packages: { main: [] },
            inquiry: {
                name: 'M IKHSAN ANGGARA',
                tarif: 'UKT Semester Ganjil 2026/2027 (Fakultas Teknik)',
                amount: 4500000,
                admin: 2500
            }
        },
        installment: {
            title: 'Tagihan Cicilan & Multifinance',
            icon: 'ri-hand-coin-line',
            subtitle: 'Bayar angsuran kredit motor, mobil, elektronik, & paylater',
            inputLabel: 'Nomor Kontrak / No. Perjanjian Kredit',
            inputPlaceholder: 'Contoh: 829103948571',
            inputIcon: 'ri-file-list-3-fill',
            hasSubtabs: false,
            providers: [
                { id: 'fif', name: 'FIFGROUP (Astra Credit)' },
                { id: 'adira', name: 'Adira Finance' },
                { id: 'baf', name: 'BAF (Bussan Auto Finance - Yamaha)' },
                { id: 'wom', name: 'WOM Finance' },
                { id: 'maf', name: 'Mega Auto Finance (MAF)' },
                { id: 'hci', name: 'Home Credit Indonesia (HCI)' },
                { id: 'kredivo', name: 'Kredivo Paylater & Cicilan' },
                { id: 'akulaku', name: 'Akulaku Finance' },
                { id: 'bca_finance', name: 'BCA Finance' },
                { id: 'oto', name: 'OTO Multiartha Kredit Mobil' }
            ],
            packages: { main: [] },
            inquiry: {
                name: 'M IKHSAN ANGGARA',
                tarif: 'Angsuran Ke-7 dari 24 Bulan (Honda Vario 160)',
                amount: 875000,
                admin: 2500
            }
        }
    };

    let currentPpobServiceKey = 'pulsa';
    let currentPpobSubtab = 'main';
    let currentPpobSelectedPackage = null;
    let currentPpobInquiryData = null;

    // Open PPOB Checkout Modal
    window.openPpobModal = function(serviceKey) {
        // Normalize key
        let key = (serviceKey || 'pulsa').toLowerCase().trim();
        if (key === 'voucher game' || key === 'game' || key === 'games') key = 'games';
        if (key === 'e-money' || key === 'emoney') key = 'emoney';
        if (key === 'tv' || key === 'internet tv' || key === 'internet & tv') key = 'internet';
        if (key === 'pendidikan' || key === 'spp' || key === 'ukt' || key === 'kuliah') key = 'education';
        if (key === 'cicilan' || key === 'kredit' || key === 'angsuran' || key === 'multifinance') key = 'installment';

        const config = PPOB_CATALOG[key] || PPOB_CATALOG.pulsa;
        currentPpobServiceKey = key;
        currentPpobSubtab = 'main';
        currentPpobSelectedPackage = null;
        currentPpobInquiryData = null;

        // UI Header Updates
        const iconBadge = document.getElementById('ppobIconBadge');
        const modalTitle = document.getElementById('ppobModalTitle');
        const modalSubtitle = document.getElementById('ppobModalSubtitle');
        const numLabel = document.getElementById('ppobNumLabel');
        const numInput = document.getElementById('ppobNumberInput');
        const inputIcon = document.getElementById('ppobInputIcon');
        const subtabsRow = document.getElementById('ppobSubtabsRow');
        const subtabMain = document.getElementById('ppobSubtabMain');
        const subtabSec = document.getElementById('ppobSubtabSecondary');
        const providerSelect = document.getElementById('ppobProviderSelect');
        const groupZoneId = document.getElementById('groupPpobZoneId');
        const inquiryCard = document.getElementById('ppobInquiryCard');
        const groupPackages = document.getElementById('groupPpobPackages');

        if (iconBadge) iconBadge.innerHTML = `<i class="${config.icon}"></i>`;
        if (modalTitle) modalTitle.textContent = config.title;
        if (modalSubtitle) modalSubtitle.textContent = config.subtitle;
        if (numLabel) numLabel.textContent = config.inputLabel;
        if (numInput) {
            numInput.placeholder = config.inputPlaceholder;
            numInput.value = (key === 'pulsa' || key === 'emoney') ? (state.accountNumber.replace(/-/g, '')) : '';
        }
        if (inputIcon) inputIcon.className = `${config.inputIcon} left-icon`;

        // Subtabs Handling
        if (config.hasSubtabs && subtabsRow) {
            subtabsRow.classList.remove('hidden');
            if (subtabMain) subtabMain.querySelector('span').textContent = config.subtab1;
            if (subtabSec) subtabSec.querySelector('span').textContent = config.subtab2;
            document.querySelectorAll('.ppob-subtab').forEach(t => {
                t.classList.toggle('active', t.getAttribute('data-subtab') === 'main');
            });
        } else if (subtabsRow) {
            subtabsRow.classList.add('hidden');
        }

        // Zone ID (Games only)
        if (groupZoneId) {
            groupZoneId.classList.toggle('hidden', !config.hasZoneId);
        }

        // Providers Dropdown
        if (providerSelect && config.providers) {
            providerSelect.innerHTML = config.providers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }

        // Inquiry vs Packages Grid
        if (config.inquiry && config.packages.main.length === 0) {
            // Postpaid Mode (PDAM, Internet, BPJS option)
            if (groupPackages) groupPackages.classList.add('hidden');
            if (inquiryCard) {
                inquiryCard.classList.remove('hidden');
                currentPpobInquiryData = config.inquiry;
                renderPpobInquiryUI(config.inquiry);
            }
        } else {
            // Prepaid / Package Mode
            if (inquiryCard) inquiryCard.classList.add('hidden');
            if (groupPackages) groupPackages.classList.remove('hidden');
            renderPpobPackageChips();
        }

        updatePpobSummaryUI();
        openModal('modalPpobCheckout');
    };

    function renderPpobInquiryUI(inq) {
        const custName = document.getElementById('inquiryCustName');
        const tarif = document.getElementById('inquiryTarif');
        const baseAmt = document.getElementById('inquiryBaseAmount');
        const adminVal = document.getElementById('summaryAdminVal');

        if (custName) custName.textContent = inq.name;
        if (tarif) tarif.textContent = inq.tarif;
        if (baseAmt) baseAmt.textContent = formatRupiah(inq.amount);
        if (adminVal) adminVal.textContent = formatRupiah(inq.admin || 1500);

        currentPpobSelectedPackage = {
            title: `Tagihan ${PPOB_CATALOG[currentPpobServiceKey].title}`,
            price: inq.amount + (inq.admin || 1500),
            amount: inq.amount,
            admin: inq.admin || 1500
        };
        updatePpobSummaryUI();
    }

    function renderPpobPackageChips() {
        const config = PPOB_CATALOG[currentPpobServiceKey];
        const grid = document.getElementById('ppobPackagesGrid');
        if (!grid || !config) return;

        const pkgs = (config.packages && config.packages[currentPpobSubtab]) || config.packages?.main || [];

        if (pkgs.length === 0) {
            grid.innerHTML = '<p class="text-muted col-span-2 text-center py-3">Pilih opsi atau masukkan nomor ID Anda.</p>';
            return;
        }

        // Default to first package
        currentPpobSelectedPackage = pkgs[0];

        grid.innerHTML = pkgs.map((pkg, idx) => `
            <div class="ppob-pkg-chip ${idx === 0 ? 'active' : ''}" data-pkg-id="${pkg.id}">
                ${pkg.badge ? `<span class="ppob-pkg-badge">${pkg.badge}</span>` : ''}
                <div class="ppob-pkg-title">${pkg.title}</div>
                <div class="ppob-pkg-desc">${pkg.desc}</div>
                <div class="ppob-pkg-price">${formatRupiah(pkg.price)}</div>
            </div>
        `).join('');

        grid.querySelectorAll('.ppob-pkg-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                grid.querySelectorAll('.ppob-pkg-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const pkgId = chip.getAttribute('data-pkg-id');
                currentPpobSelectedPackage = pkgs.find(p => p.id === pkgId);
                updatePpobSummaryUI();
            });
        });
    }

    function updatePpobSummaryUI() {
        const summaryLabel = document.getElementById('summaryProductLabel');
        const summaryVal = document.getElementById('summaryProductVal');
        const totalPay = document.getElementById('ppobTotalPay');

        if (!currentPpobSelectedPackage) {
            if (summaryVal) summaryVal.textContent = '-';
            if (totalPay) totalPay.textContent = 'Rp 0';
            return;
        }

        if (summaryLabel) summaryLabel.textContent = currentPpobSelectedPackage.title;
        if (summaryVal) summaryVal.textContent = formatRupiah(currentPpobSelectedPackage.amount || currentPpobSelectedPackage.price);
        if (totalPay) totalPay.textContent = formatRupiah(currentPpobSelectedPackage.price);
    }

    // Subtab switch event
    document.querySelectorAll('.ppob-subtab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            const sub = tabBtn.getAttribute('data-subtab');
            currentPpobSubtab = sub;
            document.querySelectorAll('.ppob-subtab').forEach(t => t.classList.remove('active'));
            tabBtn.classList.add('active');

            const config = PPOB_CATALOG[currentPpobServiceKey];
            const groupPackages = document.getElementById('groupPpobPackages');
            const inquiryCard = document.getElementById('ppobInquiryCard');

            if (currentPpobServiceKey === 'pln' && sub === 'secondary') {
                // PLN Pascabayar Tagihan
                if (groupPackages) groupPackages.classList.add('hidden');
                if (inquiryCard) {
                    inquiryCard.classList.remove('hidden');
                    currentPpobInquiryData = config.inquiry;
                    renderPpobInquiryUI(config.inquiry);
                }
            } else {
                if (inquiryCard) inquiryCard.classList.add('hidden');
                if (groupPackages) groupPackages.classList.remove('hidden');
                renderPpobPackageChips();
            }

            updatePpobSummaryUI();
        });
    });

    // PPOB Submit Checkout -> Open PIN Verification
    document.getElementById('btnSubmitPpob')?.addEventListener('click', () => {
        const num = document.getElementById('ppobNumberInput')?.value.trim();
        const config = PPOB_CATALOG[currentPpobServiceKey];

        if (!num) {
            showToast(`Mohon masukkan ${config.inputLabel}!`, 'error');
            return;
        }

        if (!currentPpobSelectedPackage) {
            showToast('Silakan pilih salah satu nominal atau paket produk.', 'error');
            return;
        }

        const finalPrice = currentPpobSelectedPackage.price;

        if (state.balance < finalPrice) {
            showToast('Saldo Dompet tidak mencukupi untuk transaksi ini.', 'error');
            return;
        }

        const providerSelect = document.getElementById('ppobProviderSelect');
        const providerName = providerSelect ? providerSelect.options[providerSelect.selectedIndex]?.text : config.title;

        // Close PPOB modal and open PIN Modal
        closeModal('modalPpobCheckout');

        openPinModal(`Pembayaran ${config.title} (${currentPpobSelectedPackage.title})`, finalPrice, (enteredPin) => {
            processPpobPaymentSuccess(finalPrice, num, providerName);
        });
    });

    // Execute PPOB Success
    function processPpobPaymentSuccess(finalPrice, customerNumber, providerName) {
        state.balance -= finalPrice;
        const txId = generateTxId();
        const config = PPOB_CATALOG[currentPpobServiceKey];
        const pkg = currentPpobSelectedPackage;
        
        // Generate Token SN / Serial Number
        let serialNumber = '';
        if (currentPpobServiceKey === 'pln' && currentPpobSubtab === 'main') {
            // PLN Token: 20 digits format (4-4-4-4-4)
            serialNumber = `TOKEN LISTRIK: ${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}`;
        } else {
            serialNumber = `SN: 98${Math.floor(10000000+Math.random()*90000000)} / REF: KLP${Date.now().toString().slice(-6)}`;
        }

        const newTx = {
            id: txId,
            title: `${config.title} - ${pkg.title}`,
            category: 'payment',
            type: 'debit',
            amount: finalPrice,
            date: new Date().toISOString(),
            status: 'success',
            method: `${providerName} (${customerNumber})`,
            note: `${serialNumber}`
        };

        state.transactions.unshift(newTx);
        state.notifications.unshift({
            id: 'n-' + Date.now(),
            title: `Pembayaran ${config.title} Berhasil!`,
            desc: `Transaksi sebesar ${formatRupiah(finalPrice)} untuk ${customerNumber} telah sukses diproses. ${serialNumber}`,
            time: 'Baru saja'
        });

        saveState();
        playSuccessSound();
        showToast(`Pembayaran ${config.title} Berhasil! 🎉`, 'success');

        // Open Receipt Modal
        openReceiptModal(txId);
    }

    // Attach Click Handlers to all PPOB Action Buttons & Services Grid
    document.querySelectorAll('.btn-ppob-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceType = btn.getAttribute('data-type');
            openPpobModal(serviceType);
        });
    });

    document.querySelectorAll('[data-service]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceKey = item.getAttribute('data-service');
            if (serviceKey === 'more') {
                switchTab('ppob');
            } else if (serviceKey === 'invest') {
                switchTab('invest');
                if (typeof switchInvestCategory === 'function') switchInvestCategory('stocks');
            } else if (serviceKey === 'crypto') {
                switchTab('invest');
                if (typeof switchInvestCategory === 'function') switchInvestCategory('crypto');
            } else {
                openPpobModal(serviceKey);
            }
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
        if (currentPinInput === state.pin || currentPinInput === '123456' || currentPinInput === '451441') {
            if (pendingTx) {
                // If this is a Cash Out transaction
                if (pendingTx.isCashOut || pendingTx.type === 'cashout') {
                    state.balance -= pendingTx.amount;
                    const createdTx = {
                        id: generateTxId(),
                        title: pendingTx.title,
                        category: 'payment',
                        type: 'debit',
                        amount: pendingTx.amount,
                        date: new Date().toISOString(),
                        status: 'success',
                        method: pendingTx.method,
                        note: `Penarikan Tunai via ${pendingTx.channel}`
                    };

                    state.transactions.unshift(createdTx);
                    saveState();
                    closeModal('modalPin');
                    playSuccessSound();

                    generateCashOutToken({ ...pendingTx, id: createdTx.id });
                    showToast(`Token Tarik Tunai Berhasil Dibuat!`, 'success');
                    pendingTx = null;
                    return;
                }

                // Standard Debit Transactions (Transfer, QRIS, PPOB)
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
            showToast('PIN yang Anda masukkan salah. Coba lagi (PIN Demo: 123456 atau 451441)', 'error');
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
    // 9. VAULTS DEPOSIT, WITHDRAW, DELETE & CREATE
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

    // Open Withdraw Vault Modal
    window.openWithdrawVaultModal = function(vaultId) {
        const vault = state.vaults.find(v => v.id === vaultId);
        if (!vault) return;

        if (vault.currentAmount <= 0) {
            showToast(`Kantong "${vault.name}" belum memiliki saldo tersimpan.`, 'error');
            return;
        }

        document.getElementById('withdrawVaultId').value = vault.id;
        document.getElementById('withdrawVaultName').textContent = vault.name;
        document.getElementById('withdrawVaultAvailable').textContent = formatRupiah(vault.currentAmount);
        document.getElementById('withdrawVaultIconBox').innerHTML = `<i class="${vault.icon}"></i>`;
        
        const defaultAmt = Math.min(100000, vault.currentAmount);
        document.getElementById('withdrawVaultAmountInput').value = defaultAmt;
        document.getElementById('withdrawVaultAmountInput').max = vault.currentAmount;

        openModal('modalWithdrawVault');
    };

    // Quick nominal selector for vault withdrawal
    document.querySelectorAll('#vaultWithdrawChips .btn-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#vaultWithdrawChips .btn-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            const vaultId = document.getElementById('withdrawVaultId').value;
            const vault = state.vaults.find(v => v.id === vaultId);
            const maxAmt = vault ? vault.currentAmount : 0;
            
            const amt = chip.getAttribute('data-amount');
            if (amt === 'all') {
                document.getElementById('withdrawVaultAmountInput').value = maxAmt;
            } else {
                document.getElementById('withdrawVaultAmountInput').value = Math.min(parseInt(amt), maxAmt);
            }
        });
    });

    // Process Vault Withdrawal
    document.getElementById('btnSubmitWithdrawVault')?.addEventListener('click', () => {
        const vaultId = document.getElementById('withdrawVaultId').value;
        const vault = state.vaults.find(v => v.id === vaultId);
        const amount = parseInt(document.getElementById('withdrawVaultAmountInput').value);

        if (!vault) {
            showToast('Kantong impian tidak ditemukan', 'error');
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            showToast('Masukkan nominal penarikan yang valid!', 'error');
            return;
        }

        if (amount > vault.currentAmount) {
            showToast(`Saldo kantong tidak mencukupi (Tersedia: ${formatRupiah(vault.currentAmount)})`, 'error');
            return;
        }

        vault.currentAmount -= amount;
        state.balance += amount;

        const newTx = {
            id: generateTxId(),
            title: `Pencairan: ${vault.name}`,
            category: 'transfer',
            type: 'credit',
            amount: amount,
            date: new Date().toISOString(),
            status: 'success',
            method: 'Kantong Impian Vault',
            note: 'Pencairan tabungan impian ke saldo utama'
        };

        state.transactions.unshift(newTx);
        state.notifications.unshift({
            id: 'n-' + Date.now(),
            title: 'Pencairan Kantong Berhasil!',
            desc: `Dana ${formatRupiah(amount)} dari "${vault.name}" telah masuk kembali ke saldo utama.`,
            time: 'Baru saja'
        });

        saveState();
        closeModal('modalWithdrawVault');
        playSuccessSound();
        showToast(`Berhasil mencairkan ${formatRupiah(amount)} ke saldo utama!`, 'success');
    });

    // Delete or Close Vault
    window.deleteVault = function(vaultId) {
        const vaultIdx = state.vaults.findIndex(v => v.id === vaultId);
        if (vaultIdx === -1) return;

        const vault = state.vaults[vaultIdx];
        if (confirm(`Apakah Anda yakin ingin menutup kantong "${vault.name}"? Saldo tersisa (${formatRupiah(vault.currentAmount)}) akan otomatis dikembalikan ke saldo utama.`)) {
            if (vault.currentAmount > 0) {
                state.balance += vault.currentAmount;
                state.transactions.unshift({
                    id: generateTxId(),
                    title: `Tutup Kantong: ${vault.name}`,
                    category: 'transfer',
                    type: 'credit',
                    amount: vault.currentAmount,
                    date: new Date().toISOString(),
                    status: 'success',
                    method: 'Kantong Impian Vault',
                    note: 'Pengembalian seluruh dana penutupan kantong'
                });
            }
            state.vaults.splice(vaultIdx, 1);
            saveState();
            playSuccessSound();
            showToast(`Kantong "${vault.name}" berhasil ditutup.`, 'success');
        }
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
    // 10. TARIK TUNAI (CASH OUT) FLOW & 6-DIGIT TOKEN
    // ----------------------------------------------------------------------
    let selectedCashOutChannel = 'Indomaret';
    let cashOutCountdownInterval = null;
    let activeCashOutTokenData = null;

    // Open Cash Out Modal
    document.getElementById('btnOpenWithdraw')?.addEventListener('click', () => {
        document.getElementById('cashOutFormStep')?.classList.remove('hidden');
        document.getElementById('cashOutTokenStep')?.classList.add('hidden');
        
        selectedCashOutChannel = 'Indomaret';
        document.querySelectorAll('#cashOutChannelGrid .channel-card').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-channel') === 'Indomaret');
        });
        const defaultAmt = Math.min(100000, state.balance);
        const inputEl = document.getElementById('cashOutCustomInput');
        if (inputEl) inputEl.value = defaultAmt > 0 ? defaultAmt : 50000;
        
        openModal('modalCashOut');
    });

    // Channel Selection Handler
    document.querySelectorAll('#cashOutChannelGrid .channel-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#cashOutChannelGrid .channel-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedCashOutChannel = card.getAttribute('data-channel') || 'Indomaret';
        });
    });

    // Cash Out Amount Chips
    document.querySelectorAll('#cashOutAmountsGrid .btn-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#cashOutAmountsGrid .btn-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const amt = chip.getAttribute('data-amount');
            const inputEl = document.getElementById('cashOutCustomInput');
            if (inputEl) inputEl.value = amt;
        });
    });

    // Proceed to PIN
    document.getElementById('btnProceedCashOut')?.addEventListener('click', () => {
        const amount = parseInt(document.getElementById('cashOutCustomInput').value);

        if (isNaN(amount) || amount < 50000) {
            showToast('Nominal minimum tarik tunai adalah Rp 50.000', 'error');
            return;
        }

        if (amount > state.balance) {
            showToast('Saldo Anda tidak mencukupi untuk tarik tunai!', 'error');
            return;
        }

        pendingTx = {
            isCashOut: true,
            title: `Tarik Tunai (${selectedCashOutChannel})`,
            category: 'payment',
            type: 'debit',
            amount: amount,
            channel: selectedCashOutChannel,
            method: `Mitra ${selectedCashOutChannel}`,
            note: `Kode Token Tarik Tunai Mandiri`
        };

        closeModal('modalCashOut');
        resetPinDots();
        openModal('modalPin');
    });

    function startCashOutCountdown(durationSeconds = 900) {
        if (cashOutCountdownInterval) clearInterval(cashOutCountdownInterval);
        
        let remaining = durationSeconds;
        const timerEl = document.getElementById('tokenCountdownTimer');

        function updateDisplay() {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            if (timerEl) {
                timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            if (remaining <= 0) {
                clearInterval(cashOutCountdownInterval);
                if (activeCashOutTokenData) {
                    showToast('Waktu token tarik tunai telah berakhir. Saldo telah dikembalikan.', 'info');
                    cancelCashOutToken(true);
                }
            }
            remaining--;
        }

        updateDisplay();
        cashOutCountdownInterval = setInterval(updateDisplay, 1000);
    }

    function generateCashOutToken(tx) {
        const part1 = Math.floor(100 + Math.random() * 900);
        const part2 = Math.floor(100 + Math.random() * 900);
        const tokenString = `${part1} ${part2}`;

        activeCashOutTokenData = {
            code: tokenString,
            amount: tx.amount,
            channel: tx.channel,
            txId: tx.id
        };

        // Populate step 2
        const chEl = document.getElementById('activeTokenChannel');
        const codeEl = document.getElementById('activeTokenCode');
        const amtEl = document.getElementById('tokenAmountDisplay');

        if (chEl) chEl.textContent = tx.channel;
        if (codeEl) codeEl.textContent = tokenString;
        if (amtEl) amtEl.textContent = formatRupiah(tx.amount);

        // Switch to Step 2
        document.getElementById('cashOutFormStep')?.classList.add('hidden');
        document.getElementById('cashOutTokenStep')?.classList.remove('hidden');

        startCashOutCountdown(900);
        openModal('modalCashOut');
    }

    // Copy Token Code
    document.getElementById('btnCopyCashOutToken')?.addEventListener('click', () => {
        const code = activeCashOutTokenData ? activeCashOutTokenData.code.replace(/\s+/g, '') : '849201';
        navigator.clipboard.writeText(code).then(() => {
            showToast(`Kode token (${code}) berhasil disalin!`, 'success');
        });
    });

    // Complete Cash Out Flow
    document.getElementById('btnCompleteCashOut')?.addEventListener('click', () => {
        if (cashOutCountdownInterval) clearInterval(cashOutCountdownInterval);
        const txId = activeCashOutTokenData?.txId;
        activeCashOutTokenData = null;

        closeModal('modalCashOut');
        playSuccessSound();
        showToast('Penarikan uang tunai berhasil diselesaikan!', 'success');

        if (txId) {
            window.openReceiptModal(txId);
        }
    });

    // Cancel Cash Out Token & Auto Refund
    function cancelCashOutToken(autoExpired = false) {
        if (!activeCashOutTokenData) return;

        if (cashOutCountdownInterval) clearInterval(cashOutCountdownInterval);

        const refundAmt = activeCashOutTokenData.amount;
        state.balance += refundAmt;

        const refundTx = {
            id: generateTxId(),
            title: `Batal Tarik Tunai (Refund)`,
            category: 'topup',
            type: 'credit',
            amount: refundAmt,
            date: new Date().toISOString(),
            status: 'success',
            method: 'Sistem Refund My Klepeh',
            note: autoExpired ? 'Token kadaluarsa (Refund otomatis)' : 'Pembatalan token tarik tunai oleh pengguna'
        };

        state.transactions.unshift(refundTx);
        activeCashOutTokenData = null;

        saveState();
        closeModal('modalCashOut');
        showToast(`Token dibatalkan. Dana ${formatRupiah(refundAmt)} telah dikembalikan ke dompet!`, 'success');
    }

    document.getElementById('btnCancelCashOutToken')?.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin membatalkan token penarikan ini? Saldo akan langsung dikembalikan ke dompet.')) {
            cancelCashOutToken(false);
        }
    });

    // ----------------------------------------------------------------------
    // 11. MINTA SALDO / RECEIVE MONEY QR CODE FLOW
    // ----------------------------------------------------------------------
    document.getElementById('btnOpenReceive')?.addEventListener('click', () => {
        const curSession = JSON.parse(localStorage.getItem('paypulse_user_session')) || {};
        const userName = curSession.userName || 'M Ikhsan Anggara';
        const userPhone = curSession.userPhone || state.accountNumber || '0812-9887-3411';
        const userAvatar = curSession.userAvatar || 'sasuke.jpg';

        const rName = document.getElementById('receiveUserName');
        const rPhone = document.getElementById('receiveUserPhone');
        const rAvatar = document.getElementById('receiveAvatar');
        const rInput = document.getElementById('receiveAmountInput');
        const rBadge = document.getElementById('receiveAmountBadge');

        if (rName) rName.textContent = userName;
        if (rPhone) rPhone.textContent = userPhone;
        if (rAvatar) rAvatar.src = userAvatar;
        if (rInput) rInput.value = '';
        if (rBadge) rBadge.innerHTML = '<span>Nominal: Bebas Masukkan</span>';

        openModal('modalReceiveQR');
    });

    // Dynamic nominal input listener
    document.getElementById('receiveAmountInput')?.addEventListener('input', (e) => {
        const amt = parseInt(e.target.value);
        const badge = document.getElementById('receiveAmountBadge');
        if (badge) {
            if (!isNaN(amt) && amt > 0) {
                badge.innerHTML = `<span>Permintaan Transfer: <b>${formatRupiah(amt)}</b></span>`;
            } else {
                badge.innerHTML = '<span>Nominal: Bebas Masukkan</span>';
            }
        }
    });

    // Copy Account Number
    document.getElementById('btnCopyReceiveAcc')?.addEventListener('click', () => {
        const phone = document.getElementById('receiveUserPhone')?.textContent || state.accountNumber;
        navigator.clipboard.writeText(phone).then(() => {
            showToast(`Nomor akun (${phone}) berhasil disalin!`, 'success');
        });
    });

    // Copy Payment Link
    document.getElementById('btnCopyPayLink')?.addEventListener('click', () => {
        const phone = document.getElementById('receiveUserPhone')?.textContent || state.accountNumber;
        const amt = document.getElementById('receiveAmountInput')?.value;
        const link = `https://klepeh.id/pay/${phone.replace(/[^0-9]/g, '')}${amt ? '?amount=' + amt : ''}`;
        navigator.clipboard.writeText(link).then(() => {
            showToast(`Tautan bayar (${link}) berhasil disalin!`, 'success');
        });
    });

    // Share via WhatsApp
    document.getElementById('btnShareWhatsApp')?.addEventListener('click', () => {
        const curSession = JSON.parse(localStorage.getItem('paypulse_user_session')) || {};
        const userName = curSession.userName || 'M Ikhsan Anggara';
        const phone = document.getElementById('receiveUserPhone')?.textContent || state.accountNumber;
        const amt = document.getElementById('receiveAmountInput')?.value;
        
        let msg = `Halo, silakan transfer ke akun My Klepeh saya (${userName} - ${phone})`;
        if (amt && parseInt(amt) > 0) {
            msg += ` sebesar ${formatRupiah(parseInt(amt))}`;
        }
        msg += `. Terima kasih!`;

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    });

    // Download QR Code simulation
    document.getElementById('btnDownloadQR')?.addEventListener('click', () => {
        playSuccessSound();
        showToast('Gambar QR Code Minta Saldo berhasil diunduh ke perangkat!', 'success');
    });

    // ----------------------------------------------------------------------
    // 13. TRAVEL & BOOKING HUB ENGINE (PESAWAT, KERETA, BUS, HOTEL)
    // ----------------------------------------------------------------------
    const TRAVEL_DATA = {
        flight: {
            origins: [
                { code: 'CGK', name: 'Jakarta (Soekarno-Hatta - CGK)' },
                { code: 'DPS', name: 'Bali / Denpasar (Ngurah Rai - DPS)' },
                { code: 'SUB', name: 'Surabaya (Juanda - SUB)' },
                { code: 'YIA', name: 'Yogyakarta (YIA)' },
                { code: 'KNO', name: 'Medan (Kualanamu - KNO)' },
                { code: 'UPG', name: 'Makassar (Sultan Hasanuddin - UPG)' },
                { code: 'LBJ', name: 'Labuan Bajo (Komodo - LBJ)' }
            ],
            destinations: [
                { code: 'DPS', name: 'Bali / Denpasar (Ngurah Rai - DPS)' },
                { code: 'CGK', name: 'Jakarta (Soekarno-Hatta - CGK)' },
                { code: 'SUB', name: 'Surabaya (Juanda - SUB)' },
                { code: 'YIA', name: 'Yogyakarta (YIA)' },
                { code: 'KNO', name: 'Medan (Kualanamu - KNO)' },
                { code: 'LBJ', name: 'Labuan Bajo (Komodo - LBJ)' },
                { code: 'LOP', name: 'Lombok (ZAM - LOP)' }
            ],
            items: [
                {
                    id: 'FL-GA402',
                    operator: 'Garuda Indonesia',
                    code: 'GA-402',
                    category: 'flight',
                    logoClass: 'flight-logo',
                    icon: 'ri-flight-takeoff-line',
                    originCode: 'CGK',
                    originCity: 'Jakarta',
                    originStation: 'Soekarno-Hatta T3',
                    destCode: 'DPS',
                    destCity: 'Bali',
                    destStation: 'Ngurah Rai',
                    departTime: '08:30',
                    arriveTime: '11:20',
                    duration: '1j 50m',
                    travelClass: 'Ekonomi',
                    priceOriginal: 1850000,
                    price: 1450000,
                    seatsLeft: 5,
                    gate: 'GATE 4B',
                    rating: 4.9,
                    facilities: ['Bagasi 20kg', 'Makan Siang', 'In-flight Wifi', 'Entertainment']
                },
                {
                    id: 'FL-QG680',
                    operator: 'Citilink',
                    code: 'QG-680',
                    category: 'flight',
                    logoClass: 'flight-logo',
                    icon: 'ri-flight-takeoff-line',
                    originCode: 'CGK',
                    originCity: 'Jakarta',
                    originStation: 'Soekarno-Hatta T2',
                    destCode: 'DPS',
                    destCity: 'Bali',
                    destStation: 'Ngurah Rai',
                    departTime: '09:45',
                    arriveTime: '12:35',
                    duration: '1j 50m',
                    travelClass: 'Ekonomi',
                    priceOriginal: 1200000,
                    price: 980000,
                    seatsLeft: 8,
                    gate: 'GATE 2E',
                    rating: 4.7,
                    facilities: ['Bagasi 20kg', 'Snack Box', 'Free Kabin 7kg']
                },
                {
                    id: 'FL-ID6512',
                    operator: 'Batik Air',
                    code: 'ID-6512',
                    category: 'flight',
                    logoClass: 'flight-logo',
                    icon: 'ri-flight-takeoff-line',
                    originCode: 'CGK',
                    originCity: 'Jakarta',
                    originStation: 'Soekarno-Hatta T2',
                    destCode: 'SUB',
                    destCity: 'Surabaya',
                    destStation: 'Juanda T1',
                    departTime: '13:15',
                    arriveTime: '14:45',
                    duration: '1j 30m',
                    travelClass: 'Bisnis',
                    priceOriginal: 2100000,
                    price: 1750000,
                    seatsLeft: 4,
                    gate: 'GATE 3A',
                    rating: 4.8,
                    facilities: ['Lounge Access', 'Bagasi 30kg', 'Hot Meal', 'Priority Boarding']
                },
                {
                    id: 'FL-IU724',
                    operator: 'Super Air Jet',
                    code: 'IU-724',
                    category: 'flight',
                    logoClass: 'flight-logo',
                    icon: 'ri-flight-takeoff-line',
                    originCode: 'CGK',
                    originCity: 'Jakarta',
                    originStation: 'Soekarno-Hatta T1',
                    destCode: 'YIA',
                    destCity: 'Yogyakarta',
                    destStation: 'YIA International',
                    departTime: '07:00',
                    arriveTime: '08:15',
                    duration: '1j 15m',
                    travelClass: 'Ekonomi',
                    priceOriginal: 850000,
                    price: 675000,
                    seatsLeft: 12,
                    gate: 'GATE 1C',
                    rating: 4.6,
                    facilities: ['Bagasi 20kg', 'Free Entertainment App', 'Kabin 7kg']
                },
                {
                    id: 'FL-GA704',
                    operator: 'Garuda Indonesia',
                    code: 'GA-704',
                    category: 'flight',
                    logoClass: 'flight-logo',
                    icon: 'ri-flight-takeoff-line',
                    originCode: 'DPS',
                    originCity: 'Bali',
                    originStation: 'Ngurah Rai',
                    destCode: 'LBJ',
                    destCity: 'Labuan Bajo',
                    destStation: 'Komodo Airport',
                    departTime: '11:00',
                    arriveTime: '12:15',
                    duration: '1j 15m',
                    travelClass: 'Eksekutif',
                    priceOriginal: 1950000,
                    price: 1650000,
                    seatsLeft: 3,
                    gate: 'GATE 6',
                    rating: 4.9,
                    facilities: ['Bagasi 20kg', 'Scenic Flight View', 'Premium Snacks']
                },
                {
                    id: 'FL-JT330',
                    operator: 'Lion Air',
                    code: 'JT-330',
                    category: 'flight',
                    logoClass: 'flight-logo',
                    icon: 'ri-flight-takeoff-line',
                    originCode: 'CGK',
                    originCity: 'Jakarta',
                    originStation: 'Soekarno-Hatta T1',
                    destCode: 'KNO',
                    destCity: 'Medan',
                    destStation: 'Kualanamu',
                    departTime: '15:20',
                    arriveTime: '17:40',
                    duration: '2j 20m',
                    travelClass: 'Ekonomi',
                    priceOriginal: 1350000,
                    price: 1050000,
                    seatsLeft: 9,
                    gate: 'GATE 1B',
                    rating: 4.5,
                    facilities: ['Bagasi 20kg', 'Kabin 7kg']
                }
            ]
        },
        train: {
            origins: [
                { code: 'GMR', name: 'Jakarta (Stasiun Gambir - GMR)' },
                { code: 'PSE', name: 'Jakarta (Pasar Senen - PSE)' },
                { code: 'BD', name: 'Bandung (Stasiun Bandung - BD)' },
                { code: 'YK', name: 'Yogyakarta (Tugu Yogyakarta - YK)' },
                { code: 'SGU', name: 'Surabaya (Gubeng - SGU)' },
                { code: 'SLO', name: 'Solo (Solo Balapan - SLO)' },
                { code: 'SMT', name: 'Semarang (Tawang - SMT)' }
            ],
            destinations: [
                { code: 'YK', name: 'Yogyakarta (Tugu Yogyakarta - YK)' },
                { code: 'SGU', name: 'Surabaya (Gubeng - SGU)' },
                { code: 'GMR', name: 'Jakarta (Stasiun Gambir - GMR)' },
                { code: 'BD', name: 'Bandung (Stasiun Bandung - BD)' },
                { code: 'SLO', name: 'Solo (Solo Balapan - SLO)' },
                { code: 'SMT', name: 'Semarang (Tawang - SMT)' }
            ],
            items: [
                {
                    id: 'TR-TAKSAKA',
                    operator: 'KAI Taksaka Panoramic',
                    code: 'KA-68',
                    category: 'train',
                    logoClass: 'train-logo',
                    icon: 'ri-train-line',
                    originCode: 'GMR',
                    originCity: 'Jakarta',
                    originStation: 'Gambir',
                    destCode: 'YK',
                    destCity: 'Yogyakarta',
                    destStation: 'Tugu Yogya',
                    departTime: '09:20',
                    arriveTime: '15:35',
                    duration: '6j 15m',
                    travelClass: 'Eksekutif',
                    priceOriginal: 650000,
                    price: 520000,
                    seatsLeft: 6,
                    gate: 'JALUR 3',
                    rating: 4.9,
                    facilities: ['Kaca Panoramic View', 'Reclining Seat 140°', 'Free Wifi', 'Colokan Charger', 'Restorasi']
                },
                {
                    id: 'TR-ARGOBROMO',
                    operator: 'KAI Argo Bromo Anggrek',
                    code: 'KA-2',
                    category: 'train',
                    logoClass: 'train-logo',
                    icon: 'ri-train-line',
                    originCode: 'GMR',
                    originCity: 'Jakarta',
                    originStation: 'Gambir',
                    destCode: 'SGU',
                    destCity: 'Surabaya',
                    destStation: 'Surabaya Pasarturi',
                    departTime: '08:20',
                    arriveTime: '16:30',
                    duration: '8j 10m',
                    travelClass: 'Eksekutif',
                    priceOriginal: 820000,
                    price: 690000,
                    seatsLeft: 10,
                    gate: 'JALUR 2',
                    rating: 4.9,
                    facilities: ['Luxury Seat', 'Makan Siang Restorasi', 'Bantal & Selimut', 'Stopkontak']
                },
                {
                    id: 'TR-PARAHYANGAN',
                    operator: 'KAI Argo Parahyangan',
                    code: 'KA-40',
                    category: 'train',
                    logoClass: 'train-logo',
                    icon: 'ri-train-line',
                    originCode: 'GMR',
                    originCity: 'Jakarta',
                    originStation: 'Gambir',
                    destCode: 'BD',
                    destCity: 'Bandung',
                    destStation: 'Stasiun Bandung',
                    departTime: '06:30',
                    arriveTime: '09:15',
                    duration: '2j 45m',
                    travelClass: 'Ekonomi',
                    priceOriginal: 180000,
                    price: 150000,
                    seatsLeft: 14,
                    gate: 'JALUR 1',
                    rating: 4.7,
                    facilities: ['AC Dingin', 'Stopkontak', 'Kursi 2-2 Nyaman']
                },
                {
                    id: 'TR-LODAYA',
                    operator: 'KAI Lodaya',
                    code: 'KA-92',
                    category: 'train',
                    logoClass: 'train-logo',
                    icon: 'ri-train-line',
                    originCode: 'BD',
                    originCity: 'Bandung',
                    originStation: 'Bandung',
                    destCode: 'SLO',
                    destCity: 'Solo',
                    destStation: 'Solo Balapan',
                    departTime: '07:05',
                    arriveTime: '15:40',
                    duration: '8j 35m',
                    travelClass: 'Eksekutif',
                    priceOriginal: 480000,
                    price: 395000,
                    seatsLeft: 7,
                    gate: 'JALUR 4',
                    rating: 4.8,
                    facilities: ['Reclining Seat', 'AC', 'Pemandangan Pegunungan']
                }
            ]
        },
        bus: {
            origins: [
                { code: 'JKT', name: 'Jakarta (Pulo Gebang / Kp Rambutan)' },
                { code: 'BDG', name: 'Bandung (Leuwi Panjang / Pasteur)' },
                { code: 'YOG', name: 'Yogyakarta (Giwangan / Jombor)' },
                { code: 'SBY', name: 'Surabaya (Purabaya / Bungurasih)' },
                { code: 'SMG', name: 'Semarang (Terboyo / Kalibanteng)' }
            ],
            destinations: [
                { code: 'YOG', name: 'Yogyakarta (Giwangan / Jombor)' },
                { code: 'SBY', name: 'Surabaya (Purabaya / Bungurasih)' },
                { code: 'JKT', name: 'Jakarta (Pulo Gebang / Kp Rambutan)' },
                { code: 'DPS', name: 'Bali / Denpasar (Mengwi)' },
                { code: 'MLG', name: 'Malang (Arjosari)' }
            ],
            items: [
                {
                    id: 'BUS-SINARJAYA',
                    operator: 'Sinar Jaya Suites Class',
                    code: 'SJ-Sleeper',
                    category: 'bus',
                    logoClass: 'bus-logo',
                    icon: 'ri-bus-fill',
                    originCode: 'JKT',
                    originCity: 'Jakarta',
                    originStation: 'Terminal Pulo Gebang',
                    destCode: 'YOG',
                    destCity: 'Yogyakarta',
                    destStation: 'Terminal Giwangan',
                    departTime: '18:30',
                    arriveTime: '04:15',
                    duration: '9j 45m',
                    travelClass: 'Eksekutif',
                    priceOriginal: 380000,
                    price: 310000,
                    seatsLeft: 4,
                    gate: 'PERON 5',
                    rating: 4.9,
                    facilities: ['Private Sleeper Bed', 'Personal TV (AVOD)', 'Bantal Selimut', 'Snack & Air Mineral', 'USB Charger']
                },
                {
                    id: 'BUS-ROSALIA',
                    operator: 'Rosalia Indah Double Decker',
                    code: 'RI-DD102',
                    category: 'bus',
                    logoClass: 'bus-logo',
                    icon: 'ri-bus-fill',
                    originCode: 'JKT',
                    originCity: 'Jakarta',
                    originStation: 'Terminal Kalideres',
                    destCode: 'SBY',
                    destCity: 'Surabaya',
                    destStation: 'Terminal Bungurasih',
                    departTime: '17:00',
                    arriveTime: '05:30',
                    duration: '12j 30m',
                    travelClass: 'Eksekutif',
                    priceOriginal: 450000,
                    price: 375000,
                    seatsLeft: 6,
                    gate: 'PERON 2',
                    rating: 4.8,
                    facilities: ['First Class Reclining', 'Prasmanan Makan Malam', 'Pramugari Bus', 'Toilet Bersih']
                },
                {
                    id: 'BUS-JURAGAN99',
                    operator: 'Juragan 99 Trans Luxury',
                    code: 'J99-08',
                    category: 'bus',
                    logoClass: 'bus-logo',
                    icon: 'ri-bus-fill',
                    originCode: 'JKT',
                    originCity: 'Jakarta',
                    originStation: 'Pondok Pinang',
                    destCode: 'MLG',
                    destCity: 'Malang',
                    destStation: 'Terminal Arjosari',
                    departTime: '19:00',
                    arriveTime: '06:45',
                    duration: '11j 45m',
                    travelClass: 'Bisnis',
                    priceOriginal: 550000,
                    price: 460000,
                    seatsLeft: 3,
                    gate: 'PERON 1',
                    rating: 4.9,
                    facilities: ['Sleeper Capsule', 'Air Purifier', 'Coffee & Tea Maker', 'Wifi High Speed']
                }
            ]
        },
        hotel: {
            items: [
                {
                    id: 'HT-MULIA-BALI',
                    name: 'The Mulia Resort & Villas',
                    category: 'hotel',
                    city: 'Bali',
                    location: 'Nusa Dua, Bali',
                    stars: 5,
                    rating: 4.9,
                    ratingCount: 1420,
                    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=600',
                    priceOriginal: 3800000,
                    price: 2850000,
                    roomsLeft: 3,
                    roomType: 'Mulia Grandeur Suite (Ocean View)',
                    amenities: ['Infinity Pool', 'Sarapan Buffet', 'Spa & Sauna', 'Free WiFi', 'Pantai Privat'],
                    roomOptions: [
                        { name: 'Mulia Grandeur (King Bed)', extra: 0 },
                        { name: 'Ocean View Suite (King + Balkon)', extra: 450000 },
                        { name: 'Private Pool Villa (1 Bedroom)', extra: 1200000 }
                    ]
                },
                {
                    id: 'HT-HYATT-JKT',
                    name: 'Grand Hyatt Jakarta',
                    category: 'hotel',
                    city: 'Jakarta',
                    location: 'Bundaran HI, Jakarta Pusat',
                    stars: 5,
                    rating: 4.8,
                    ratingCount: 980,
                    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
                    priceOriginal: 2700000,
                    price: 2150000,
                    roomsLeft: 5,
                    roomType: 'Grand Deluxe King Bed',
                    amenities: ['Akses Langsung Plaza Indonesia', 'Sarapan Mewah', 'Gym & Kolam', 'City View'],
                    roomOptions: [
                        { name: 'Grand Deluxe Room (City View)', extra: 0 },
                        { name: 'Club Executive Room (Lounge)', extra: 500000 },
                        { name: 'Presidential Suite', extra: 2500000 }
                    ]
                },
                {
                    id: 'HT-TENTREM-YOG',
                    name: 'Hotel Tentrem Yogyakarta',
                    category: 'hotel',
                    city: 'Yogyakarta',
                    location: 'Jl. P. Mangkubumi, Yogyakarta',
                    stars: 5,
                    rating: 4.9,
                    ratingCount: 2100,
                    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600',
                    priceOriginal: 1650000,
                    price: 1280000,
                    roomsLeft: 6,
                    roomType: 'Deluxe Room Twin Bed',
                    amenities: ['Gaharu Spa', 'Resto Tradisional & Western', 'Kids Playground', 'Kolam Renang'],
                    roomOptions: [
                        { name: 'Deluxe Room (Twin / King)', extra: 0 },
                        { name: 'Premier Room (Balkon Merapi View)', extra: 300000 },
                        { name: 'Executive Suite', extra: 850000 }
                    ]
                },
                {
                    id: 'HT-PADMA-BDG',
                    name: 'Padma Hotel Bandung',
                    category: 'hotel',
                    city: 'Bandung',
                    location: 'Ciumbuleuit, Bandung',
                    stars: 5,
                    rating: 4.9,
                    ratingCount: 1850,
                    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600',
                    priceOriginal: 2200000,
                    price: 1750000,
                    roomsLeft: 4,
                    roomType: 'Premier Room (Hill View)',
                    amenities: ['Pemandangan Lembah Hijau', 'Heated Pool', 'Afternoon Tea', 'Mini Zoo'],
                    roomOptions: [
                        { name: 'Premier Room (Mountain View)', extra: 0 },
                        { name: 'Hillside Studio Suite', extra: 400000 },
                        { name: 'Gallery Suite Jacuzzi', extra: 950000 }
                    ]
                },
                {
                    id: 'HT-AYANA-LBJ',
                    name: 'AYANA Komodo Waecicu Beach',
                    category: 'hotel',
                    city: 'Labuan Bajo',
                    location: 'Pantai Waecicu, Labuan Bajo',
                    stars: 5,
                    rating: 4.9,
                    ratingCount: 760,
                    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=600',
                    priceOriginal: 4500000,
                    price: 3600000,
                    roomsLeft: 2,
                    roomType: 'Full Ocean View Suite',
                    amenities: ['Dermaga Privat Sunset', 'Private Yacht Tour', 'Rooftop Bar', 'Infinity Pool'],
                    roomOptions: [
                        { name: 'Full Ocean View Room', extra: 0 },
                        { name: 'Deluxe Ocean View (High Floor)', extra: 550000 },
                        { name: 'Ocean Suite (Sunset Front)', extra: 1500000 }
                    ]
                },
                {
                    id: 'HT-MARRIOTT-SBY',
                    name: 'JW Marriott Hotel Surabaya',
                    category: 'hotel',
                    city: 'Surabaya',
                    location: 'Jl. Embong Malang, Surabaya',
                    stars: 5,
                    rating: 4.8,
                    ratingCount: 1100,
                    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=600',
                    priceOriginal: 1900000,
                    price: 1450000,
                    roomsLeft: 7,
                    roomType: 'Deluxe Executive King',
                    amenities: ['Oasis Pool', 'JW Lounge', 'Pusat Kota', 'Spa Bintang 5'],
                    roomOptions: [
                        { name: 'Deluxe King / Twin', extra: 0 },
                        { name: 'Executive Suite Lounge', extra: 450000 }
                    ]
                }
            ]
        }
    };

    let currentTravelCat = 'flight';
    let currentSelectedTravelItem = null;
    let selectedSeatNumber = '2A';
    let selectedRoomExtra = 0;
    let selectedRoomName = '';
    let currentTravelDiscount = 0;
    let appliedPromoCode = '';

    // Initialize Dropdowns for Category
    function populateTravelDropdowns(cat) {
        const originSelect = document.getElementById('travelOriginInput');
        const destSelect = document.getElementById('travelDestInput');
        const transportFields = document.getElementById('transportFields');
        const hotelFields = document.getElementById('hotelFields');
        const groupTravelClass = document.getElementById('groupTravelClass');
        const labelPassengerCount = document.getElementById('labelPassengerCount');
        const labelDate = document.getElementById('labelDate');
        const resultsTitle = document.getElementById('resultsTitle');

        if (cat === 'hotel') {
            if (transportFields) transportFields.classList.add('hidden');
            if (hotelFields) hotelFields.classList.remove('hidden');
            if (groupTravelClass) groupTravelClass.classList.add('hidden');
            if (labelPassengerCount) labelPassengerCount.textContent = 'Jumlah Tamu & Kamar';
            if (labelDate) labelDate.textContent = 'Tanggal Check-in';
            if (resultsTitle) resultsTitle.textContent = 'Pilihan Hotel & Resort Mewah';
            return;
        }

        if (transportFields) transportFields.classList.remove('hidden');
        if (hotelFields) hotelFields.classList.add('hidden');
        if (groupTravelClass) groupTravelClass.classList.remove('hidden');
        if (labelPassengerCount) labelPassengerCount.textContent = 'Jumlah Penumpang';
        if (labelDate) labelDate.textContent = 'Tanggal Berangkat';

        const data = TRAVEL_DATA[cat];
        if (!data || !originSelect || !destSelect) return;

        originSelect.innerHTML = data.origins.map(o => `<option value="${o.code}">${o.name}</option>`).join('');
        destSelect.innerHTML = data.destinations.map(d => `<option value="${d.code}">${d.name}</option>`).join('');

        // Adjust labels
        const labelOrigin = document.getElementById('labelOrigin');
        const labelDest = document.getElementById('labelDest');
        if (cat === 'flight') {
            if (labelOrigin) labelOrigin.textContent = 'Bandara Asal';
            if (labelDest) labelDest.textContent = 'Bandara Tujuan';
            if (resultsTitle) resultsTitle.textContent = 'Pilihan Tiket Pesawat Tersedia';
        } else if (cat === 'train') {
            if (labelOrigin) labelOrigin.textContent = 'Stasiun Asal';
            if (labelDest) labelDest.textContent = 'Stasiun Tujuan';
            if (resultsTitle) resultsTitle.textContent = 'Jadwal Kereta Api KAI';
        } else if (cat === 'bus') {
            if (labelOrigin) labelOrigin.textContent = 'Terminal / Titik Keberangkatan';
            if (labelDest) labelDest.textContent = 'Terminal / Titik Turun';
            if (resultsTitle) resultsTitle.textContent = 'Pilihan Bus & Travel Antar Kota';
        }
    }

    // Switch Travel Category Sub-tab
    function switchTravelCategory(cat) {
        currentTravelCat = cat;
        document.querySelectorAll('.travel-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-travel-cat') === cat);
        });

        populateTravelDropdowns(cat);
        renderTravelResults();
    }

    // Filter & Sort Travel Results
    function getFilteredTravelItems() {
        const sortMode = document.getElementById('travelSortSelect')?.value || 'cheapest';

        if (currentTravelCat === 'hotel') {
            const locFilter = document.getElementById('hotelLocationInput')?.value || 'all';
            let list = [...TRAVEL_DATA.hotel.items];

            if (locFilter !== 'all') {
                list = list.filter(h => h.city.toLowerCase() === locFilter.toLowerCase());
            }

            if (sortMode === 'cheapest') list.sort((a, b) => a.price - b.price);
            else if (sortMode === 'rating') list.sort((a, b) => b.rating - a.rating);

            return list;
        }

        const originVal = document.getElementById('travelOriginInput')?.value;
        const destVal = document.getElementById('travelDestInput')?.value;
        const classVal = document.getElementById('travelClassInput')?.value || 'all';

        let list = [...(TRAVEL_DATA[currentTravelCat]?.items || [])];

        // Soft filter: prioritize matched origin/dest, keep list robust
        if (originVal && destVal) {
            const exactMatches = list.filter(i => i.originCode === originVal && i.destCode === destVal);
            if (exactMatches.length > 0) list = exactMatches;
        }

        if (classVal !== 'all') {
            const classMatches = list.filter(i => i.travelClass.toLowerCase() === classVal.toLowerCase());
            if (classMatches.length > 0) list = classMatches;
        }

        if (sortMode === 'cheapest') list.sort((a, b) => a.price - b.price);
        else if (sortMode === 'rating') list.sort((a, b) => b.rating - a.rating);
        else if (sortMode === 'earliest') list.sort((a, b) => a.departTime.localeCompare(b.departTime));

        return list;
    }

    // Render Travel Listing
    function renderTravelResults() {
        const container = document.getElementById('travelCardsContainer');
        const countBadge = document.getElementById('resultsCountBadge');
        if (!container) return;

        const items = getFilteredTravelItems();
        if (countBadge) countBadge.textContent = `${items.length} Pilihan Tersedia`;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card text-center py-5">
                    <i class="ri-search-eye-line text-muted" style="font-size: 3rem;"></i>
                    <h4 class="mt-2">Rute atau Hotel Belum Tersedia</h4>
                    <p class="text-secondary">Coba ubah kota asal, tujuan, atau pilih tanggal keberangkatan lain.</p>
                </div>
            `;
            return;
        }

        if (currentTravelCat === 'hotel') {
            container.innerHTML = `
                <div class="hotels-cards-grid">
                    ${items.map(h => `
                        <div class="hotel-card">
                            <div class="hotel-thumbnail-box">
                                <img src="${h.image}" alt="${h.name}" class="hotel-img" loading="lazy">
                                <div class="hotel-rating-tag">
                                    <i class="ri-star-fill"></i> ${h.rating} <small>(${h.ratingCount})</small>
                                </div>
                                <div class="hotel-star-stars">
                                    ${'<i class="ri-star-fill"></i>'.repeat(h.stars)}
                                </div>
                            </div>
                            <div class="hotel-content-body">
                                <div class="hotel-title-meta">
                                    <h4>${h.name}</h4>
                                    <span class="hotel-location"><i class="ri-map-pin-2-line text-primary"></i> ${h.location}</span>
                                </div>
                                <div class="hotel-amenities-row">
                                    ${h.amenities.slice(0, 3).map(a => `<span class="facility-chip"><i class="ri-check-line"></i> ${a}</span>`).join('')}
                                </div>
                                <div class="hotel-card-footer">
                                    <div class="hotel-price-text">
                                        <span class="per-night">Mulai dari / malam</span>
                                        <div class="nightly-rate">${formatRupiah(h.price)}</div>
                                    </div>
                                    <button class="btn-primary btn-book-travel" onclick="openTravelBookingModal('${h.id}', 'hotel')">
                                        Pesan Kamar
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            return;
        }

        // Render Transport Tickets (Flight, Train, Bus)
        container.innerHTML = items.map(item => `
            <div class="ticket-card">
                <div class="ticket-operator-col">
                    <div class="operator-logo-box ${item.logoClass}">
                        <i class="${item.icon}"></i>
                    </div>
                    <div class="operator-meta">
                        <h4>${item.operator}</h4>
                        <span class="vehicle-code">${item.code}</span>
                        <div><span class="badge-class">${item.travelClass}</span></div>
                    </div>
                </div>

                <div class="ticket-timeline-col">
                    <div class="timeline-points-row">
                        <div class="point-time-box">
                            <div class="time">${item.departTime}</div>
                            <div class="city">${item.originCity} (${item.originCode})</div>
                            <div class="station">${item.originStation}</div>
                        </div>

                        <div class="timeline-track">
                            <span class="timeline-duration">${item.duration}</span>
                            <div class="timeline-graphic">
                                <div class="timeline-line"></div>
                                <div class="timeline-icon-box"><i class="${item.icon}"></i></div>
                                <div class="timeline-line"></div>
                            </div>
                            <span class="timeline-tag"><i class="ri-checkbox-circle-fill"></i> Langsung</span>
                        </div>

                        <div class="point-time-box text-right">
                            <div class="time">${item.arriveTime}</div>
                            <div class="city">${item.destCity} (${item.destCode})</div>
                            <div class="station">${item.destStation}</div>
                        </div>
                    </div>

                    <div class="facilities-tags-row">
                        ${item.facilities.map(f => `<span class="facility-chip"><i class="ri-checkbox-circle-line"></i> ${f}</span>`).join('')}
                    </div>
                </div>

                <div class="ticket-price-col">
                    <div class="price-meta">
                        <span class="original-price">${formatRupiah(item.priceOriginal)}</span>
                        <div class="final-price">${formatRupiah(item.price)}</div>
                        <div class="seat-remains"><i class="ri-fire-line"></i> Sisa ${item.seatsLeft} kursi!</div>
                    </div>
                    <button class="btn-primary btn-book-travel" onclick="openTravelBookingModal('${item.id}', '${item.category}')">
                        Pilih & Pesan
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Interactive Seat Matrix Generator
    function renderSeatMatrix(category) {
        const matrixContainer = document.getElementById('seatGridMatrix');
        if (!matrixContainer) return;

        let rows = 6;
        let cols = ['A', 'B', 'C', 'D', 'E', 'F'];
        let aisleIndex = 3;

        if (category === 'train') {
            rows = 6;
            cols = ['A', 'B', 'C', 'D'];
            aisleIndex = 2;
        } else if (category === 'bus') {
            rows = 5;
            cols = ['A', 'B', 'C'];
            aisleIndex = 2;
        }

        const occupiedSeats = ['1B', '2C', '3A', '4D', '5B', '6E'];

        matrixContainer.innerHTML = Array.from({ length: rows }, (_, r) => {
            const rowNum = r + 1;
            const seatBtns = cols.map((col, cIdx) => {
                const seatId = `${rowNum}${col}`;
                const isOccupied = occupiedSeats.includes(seatId);
                const isSelected = selectedSeatNumber === seatId;
                const statusClass = isOccupied ? 'occupied' : (isSelected ? 'selected' : 'available');
                
                let html = `<button type="button" class="seat-item ${statusClass}" data-seat="${seatId}" ${isOccupied ? 'disabled' : ''}>${seatId}</button>`;
                
                if (cIdx + 1 === aisleIndex) {
                    html += `<div class="seat-aisle"><i class="ri-more-2-fill"></i></div>`;
                }
                return html;
            }).join('');

            return `
                <div class="seat-row">
                    <span class="row-label">R${rowNum}</span>
                    ${seatBtns}
                </div>
            `;
        }).join('');

        // Attach seat click listener
        matrixContainer.querySelectorAll('.seat-item:not(.occupied)').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedSeatNumber = btn.getAttribute('data-seat');
                matrixContainer.querySelectorAll('.seat-item').forEach(s => {
                    if (!s.classList.contains('occupied')) s.classList.remove('selected');
                });
                btn.classList.add('selected');
                const badge = document.getElementById('selectedSeatNumber');
                if (badge) badge.textContent = selectedSeatNumber;
            });
        });
    }

    // Open Booking Confirmation Modal
    window.openTravelBookingModal = function(itemId, category) {
        let item = null;
        if (category === 'hotel') {
            item = TRAVEL_DATA.hotel.items.find(h => h.id === itemId);
        } else {
            item = (TRAVEL_DATA[category]?.items || []).find(i => i.id === itemId);
        }

        if (!item) return;
        currentSelectedTravelItem = item;
        selectedSeatNumber = '2A';
        selectedRoomExtra = 0;
        selectedRoomName = '';
        currentTravelDiscount = 0;
        appliedPromoCode = '';

        // Reset promo alert
        const promoAlert = document.getElementById('promoAppliedAlert');
        const promoInput = document.getElementById('travelPromoCode');
        const discountRow = document.getElementById('priceRowDiscount');
        if (promoAlert) promoAlert.classList.add('hidden');
        if (promoInput) promoInput.value = '';
        if (discountRow) discountRow.classList.add('hidden');

        // Populate summary card
        const summaryCard = document.getElementById('bookingSummaryCard');
        const modalTitle = document.getElementById('bookingModalTitle');
        const seatWrapper = document.getElementById('seatSelectionWrapper');
        const hotelWrapper = document.getElementById('hotelRoomSelectionWrapper');
        const priceLabelBase = document.getElementById('priceLabelBase');

        if (category === 'hotel') {
            if (modalTitle) modalTitle.innerHTML = `<i class="ri-hotel-bed-line"></i> Konfirmasi Reservasi Kamar Hotel`;
            if (seatWrapper) seatWrapper.classList.add('hidden');
            if (hotelWrapper) hotelWrapper.classList.remove('hidden');
            if (priceLabelBase) priceLabelBase.textContent = 'Tarif Kamar per Malam';

            if (summaryCard) {
                summaryCard.innerHTML = `
                    <div class="travel-summary-header">
                        <span class="badge-status badge-success"><i class="ri-hotel-line"></i> Hotel Bintang ${item.stars}</span>
                        <strong class="text-primary">${item.city}</strong>
                    </div>
                    <div class="travel-summary-route">
                        <div>
                            <h4>${item.name}</h4>
                            <small class="text-secondary">${item.location}</small>
                        </div>
                    </div>
                `;
            }

            // Render hotel room options
            const roomGrid = document.getElementById('roomOptionsGrid');
            if (roomGrid && item.roomOptions) {
                selectedRoomName = item.roomOptions[0].name;
                roomGrid.innerHTML = item.roomOptions.map((opt, idx) => `
                    <div class="room-option-card ${idx === 0 ? 'active' : ''}" data-extra="${opt.extra}" data-room-name="${opt.name}">
                        <div>
                            <strong>${opt.name}</strong>
                            <div><small class="text-secondary">${opt.extra === 0 ? 'Termasuk paket dasar' : '+ ' + formatRupiah(opt.extra) + ' / malam'}</small></div>
                        </div>
                        <i class="ri-checkbox-circle-fill text-primary" style="${idx === 0 ? '' : 'opacity: 0.2'}"></i>
                    </div>
                `).join('');

                roomGrid.querySelectorAll('.room-option-card').forEach(card => {
                    card.addEventListener('click', () => {
                        roomGrid.querySelectorAll('.room-option-card').forEach(c => {
                            c.classList.remove('active');
                            const icon = c.querySelector('i');
                            if (icon) icon.style.opacity = '0.2';
                        });
                        card.classList.add('active');
                        const icon = card.querySelector('i');
                        if (icon) icon.style.opacity = '1';
                        selectedRoomExtra = parseInt(card.getAttribute('data-extra')) || 0;
                        selectedRoomName = card.getAttribute('data-room-name');
                        updateBookingPriceCalculation();
                    });
                });
            }
        } else {
            if (modalTitle) modalTitle.innerHTML = `<i class="${item.icon}"></i> Konfirmasi Pemesanan Tiket & Pilih Kursi`;
            if (seatWrapper) seatWrapper.classList.remove('hidden');
            if (hotelWrapper) hotelWrapper.classList.add('hidden');
            if (priceLabelBase) priceLabelBase.textContent = `Harga Tiket (${item.travelClass})`;

            const seatClassBadge = document.getElementById('selectedSeatClass');
            if (seatClassBadge) seatClassBadge.textContent = item.travelClass;

            if (summaryCard) {
                summaryCard.innerHTML = `
                    <div class="travel-summary-header">
                        <span class="badge-status badge-success">${item.operator} (${item.code})</span>
                        <strong class="text-primary">${item.travelClass} Class</strong>
                    </div>
                    <div class="travel-summary-route">
                        <div>
                            <h4>${item.originCity} (${item.originCode})</h4>
                            <small class="text-secondary">${item.departTime} WIB</small>
                        </div>
                        <i class="ri-arrow-right-line text-primary" style="font-size: 1.35rem;"></i>
                        <div class="text-right">
                            <h4>${item.destCity} (${item.destCode})</h4>
                            <small class="text-secondary">${item.arriveTime} WIB</small>
                        </div>
                    </div>
                `;
            }

            renderSeatMatrix(category);
        }

        updateBookingPriceCalculation();
        openModal('modalTravelBooking');
    };

    function updateBookingPriceCalculation() {
        if (!currentSelectedTravelItem) return;

        const basePrice = currentSelectedTravelItem.price + selectedRoomExtra;
        const total = Math.max(0, basePrice - currentTravelDiscount);

        const valBase = document.getElementById('priceValBase');
        const valDiscount = document.getElementById('priceValDiscount');
        const valTotal = document.getElementById('priceValTotal');

        if (valBase) valBase.textContent = formatRupiah(basePrice);
        if (valDiscount) valDiscount.textContent = `- ${formatRupiah(currentTravelDiscount)}`;
        if (valTotal) valTotal.textContent = formatRupiah(total);
    }

    // Apply Promo Code
    document.getElementById('btnApplyTravelPromo')?.addEventListener('click', () => {
        const input = document.getElementById('travelPromoCode');
        const code = input ? input.value.trim().toUpperCase() : '';
        const alertBox = document.getElementById('promoAppliedAlert');
        const promoNameEl = document.getElementById('appliedPromoName');
        const promoDiscEl = document.getElementById('appliedPromoDiscount');
        const discountRow = document.getElementById('priceRowDiscount');

        if (code === 'KLEPEHTRAVEL' || code === 'LIBURANSERU' || code === 'KLEPEHPROMO') {
            currentTravelDiscount = code === 'LIBURANSERU' ? 100000 : 50000;
            appliedPromoCode = code;

            if (alertBox) alertBox.classList.remove('hidden');
            if (promoNameEl) promoNameEl.textContent = code;
            if (promoDiscEl) promoDiscEl.textContent = formatRupiah(currentTravelDiscount);
            if (discountRow) discountRow.classList.remove('hidden');

            playSuccessSound();
            showToast(`Promo ${code} berhasil diterapkan! Hemat ${formatRupiah(currentTravelDiscount)}`, 'success');
            updateBookingPriceCalculation();
        } else {
            showToast('Kode promo tidak valid atau telah kadaluarsa.', 'error');
        }
    });

    // Confirm Pay Travel -> Open PIN Verification
    document.getElementById('btnConfirmPayTravel')?.addEventListener('click', () => {
        if (!currentSelectedTravelItem) return;

        const guestName = document.getElementById('travelGuestName')?.value.trim();
        const guestId = document.getElementById('travelGuestId')?.value.trim();
        const guestPhone = document.getElementById('travelGuestPhone')?.value.trim();

        if (!guestName || !guestId || !guestPhone) {
            showToast('Mohon lengkapi seluruh data identitas penumpang / tamu.', 'error');
            return;
        }

        const basePrice = currentSelectedTravelItem.price + selectedRoomExtra;
        const finalPrice = Math.max(0, basePrice - currentTravelDiscount);

        if (state.balance < finalPrice) {
            showToast('Saldo Dompet tidak mencukupi untuk melakukan pemesanan ini.', 'error');
            return;
        }

        // Close booking modal and open PIN Modal
        closeModal('modalTravelBooking');

        openPinModal(`Pembelian ${currentSelectedTravelItem.category === 'hotel' ? 'Reservasi Hotel' : 'Tiket'} ${currentSelectedTravelItem.name || currentSelectedTravelItem.operator}`, finalPrice, (enteredPin) => {
            processTravelBookingSuccess(finalPrice, guestName);
        });
    });

    // Execute Balance Deduction & Generate E-Ticket
    function processTravelBookingSuccess(finalPrice, guestName) {
        state.balance -= finalPrice;
        const txId = generateTxId();
        const item = currentSelectedTravelItem;
        const pnrCode = 'KLP-' + Math.floor(1000 + Math.random() * 9000);

        const txTitle = item.category === 'hotel'
            ? `Reservasi ${item.name} (${item.city})`
            : `Tiket ${item.operator} (${item.originCode} - ${item.destCode})`;

        const newTx = {
            id: txId,
            title: txTitle,
            category: 'payment',
            type: 'debit',
            amount: finalPrice,
            date: new Date().toISOString(),
            status: 'success',
            method: 'My Klepeh E-Wallet',
            note: `Booking PNR: ${pnrCode} | Penumpang: ${guestName}`
        };

        state.transactions.unshift(newTx);
        state.notifications.unshift({
            id: 'n-' + Date.now(),
            title: `E-Ticket ${item.name || item.operator} Berhasil Terbit!`,
            desc: `Pembayaran sebesar ${formatRupiah(finalPrice)} sukses. Kode PNR: ${pnrCode}. Siap digunakan untuk perjalanan Anda.`,
            time: 'Baru saja'
        });

        saveState();
        playSuccessSound();
        showToast('Pembayaran Sukses! Tiket / Voucher Resmi Berhasil Diterbitkan 🎉', 'success');

        renderETicket(item, guestName, pnrCode);
        openModal('modalETicket');
    }

    // Render Digital E-Ticket & Boarding Pass
    function renderETicket(item, guestName, pnrCode) {
        const bpLogoBox = document.getElementById('bpLogoBox');
        const bpOperatorName = document.getElementById('bpOperatorName');
        const bpSubCategory = document.getElementById('bpSubCategory');
        const bpOriginCode = document.getElementById('bpOriginCode');
        const bpOriginCity = document.getElementById('bpOriginCity');
        const bpDepartTime = document.getElementById('bpDepartTime');
        const bpDestCode = document.getElementById('bpDestCode');
        const bpDestCity = document.getElementById('bpDestCity');
        const bpArrivalTime = document.getElementById('bpArrivalTime');
        const bpDuration = document.getElementById('bpDuration');
        const bpRouteIcon = document.getElementById('bpRouteIcon');
        const bpPassengerName = document.getElementById('bpPassengerName');
        const bpBookingCode = document.getElementById('bpBookingCode');
        const bpTravelClass = document.getElementById('bpTravelClass');
        const bpGateNumber = document.getElementById('bpGateNumber');
        const bpBarcodeNumeric = document.getElementById('bpBarcodeNumeric');

        if (bpPassengerName) bpPassengerName.textContent = (guestName || 'M IKHSAN ANGGARA').toUpperCase();
        if (bpBookingCode) bpBookingCode.textContent = pnrCode;
        if (bpBarcodeNumeric) bpBarcodeNumeric.textContent = `9823 ${Math.floor(1000 + Math.random() * 9000)} ${pnrCode.replace('-', '')} 0019`;

        if (item.category === 'hotel') {
            if (bpLogoBox) bpLogoBox.innerHTML = '<i class="ri-hotel-bed-line"></i>';
            if (bpOperatorName) bpOperatorName.textContent = item.name;
            if (bpSubCategory) bpSubCategory.textContent = `Voucher Hotel Bintang ${item.stars} • ${item.city}`;
            if (bpOriginCode) bpOriginCode.textContent = 'CHECK-IN';
            if (bpOriginCity) bpOriginCity.textContent = '14:00 WIB';
            if (bpDepartTime) bpDepartTime.textContent = '05 Sep 2026';
            if (bpDestCode) bpDestCode.textContent = 'CHECK-OUT';
            if (bpDestCity) bpDestCity.textContent = '12:00 WIB';
            if (bpArrivalTime) bpArrivalTime.textContent = '06 Sep 2026';
            if (bpDuration) bpDuration.textContent = '1 Malam';
            if (bpRouteIcon) bpRouteIcon.className = 'ri-hotel-line flight-plane-icon';
            if (bpTravelClass) bpTravelClass.textContent = selectedRoomName || item.roomType;
            if (bpGateNumber) bpGateNumber.textContent = 'RESEPSIONIS';
        } else {
            if (bpLogoBox) bpLogoBox.innerHTML = `<i class="${item.icon}"></i>`;
            if (bpOperatorName) bpOperatorName.textContent = item.operator;
            if (bpSubCategory) bpSubCategory.textContent = `${item.category.toUpperCase()} • ${item.code}`;
            if (bpOriginCode) bpOriginCode.textContent = item.originCode;
            if (bpOriginCity) bpOriginCity.textContent = `${item.originCity} (${item.originStation})`;
            if (bpDepartTime) bpDepartTime.textContent = `${item.departTime} WIB`;
            if (bpDestCode) bpDestCode.textContent = item.destCode;
            if (bpDestCity) bpDestCity.textContent = `${item.destCity} (${item.destStation})`;
            if (bpArrivalTime) bpArrivalTime.textContent = `${item.arriveTime} WIB`;
            if (bpDuration) bpDuration.textContent = item.duration;
            if (bpRouteIcon) bpRouteIcon.className = `${item.icon} flight-plane-icon`;
            if (bpTravelClass) bpTravelClass.textContent = `${item.travelClass} (Seat ${selectedSeatNumber})`;
            if (bpGateNumber) bpGateNumber.textContent = item.gate;
        }
    }

    // Print E-Ticket Handler
    document.getElementById('btnPrintETicket')?.addEventListener('click', () => {
        window.print();
    });

    // Share E-Ticket Handler
    document.getElementById('btnShareETicket')?.addEventListener('click', () => {
        const pnr = document.getElementById('bpBookingCode')?.textContent || 'KLP-8942';
        const op = document.getElementById('bpOperatorName')?.textContent || 'Tiket Travel';
        const msg = `Halo, ini E-Ticket resmi ${op} saya di My Klepeh E-Wallet. Kode Booking PNR: ${pnr}.`;
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    });

    // Listeners for Travel Sub-tabs & Forms
    document.querySelectorAll('.travel-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-travel-cat');
            if (cat) switchTravelCategory(cat);
        });
    });

    // Shortcut Click from Dashboard Services Grid
    document.querySelectorAll('[data-travel]').forEach(el => {
        el.addEventListener('click', () => {
            const travelType = el.getAttribute('data-travel');
            switchTab('travel');
            if (travelType) switchTravelCategory(travelType);
        });
    });

    // Swap Route Button
    document.getElementById('btnSwapRoute')?.addEventListener('click', () => {
        const originSelect = document.getElementById('travelOriginInput');
        const destSelect = document.getElementById('travelDestInput');
        if (originSelect && destSelect) {
            const temp = originSelect.value;
            originSelect.value = destSelect.value;
            destSelect.value = temp;
            renderTravelResults();
        }
    });

    // Search Form Submit
    document.getElementById('travelSearchForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        renderTravelResults();
        showToast('Memperbarui jadwal dan harga tiket...', 'success');
    });

    document.getElementById('travelSortSelect')?.addEventListener('change', renderTravelResults);
    document.getElementById('hotelLocationInput')?.addEventListener('change', renderTravelResults);
    document.getElementById('travelClassInput')?.addEventListener('change', renderTravelResults);

    // ----------------------------------------------------------------------
    // 14. INVESTASI SAHAM IDX, REKSA DANA BIBIT & KRIPTO PINTU
    // ----------------------------------------------------------------------
    const INVEST_DATA = {
        stocks: [
            {
                id: 'ST-BBCA',
                ticker: 'BBCA',
                name: 'Bank Central Asia Tbk',
                sector: 'Perbankan (Bluechip)',
                type: 'stock',
                iconClass: 'stock-bank',
                iconLetter: 'BCA',
                price: 10250,
                changeAmt: 185,
                changePercent: 1.84,
                isUp: true,
                per: '21.4x',
                pbv: '4.8x',
                dividendYield: '2.8%',
                marketCap: 'Rp 1.263 T',
                lotMin: 1
            },
            {
                id: 'ST-BBRI',
                ticker: 'BBRI',
                name: 'Bank Rakyat Indonesia Tbk',
                sector: 'Perbankan Mikro & UMKM',
                type: 'stock',
                iconClass: 'stock-bank',
                iconLetter: 'BRI',
                price: 5250,
                changeAmt: 125,
                changePercent: 2.44,
                isUp: true,
                per: '13.5x',
                pbv: '2.4x',
                dividendYield: '5.8%',
                marketCap: 'Rp 795 T',
                lotMin: 1
            },
            {
                id: 'ST-BMRI',
                ticker: 'BMRI',
                name: 'Bank Mandiri (Persero) Tbk',
                sector: 'Perbankan BUMN',
                type: 'stock',
                iconClass: 'stock-bank',
                iconLetter: 'BMRI',
                price: 6850,
                changeAmt: 75,
                changePercent: 1.11,
                isUp: true,
                per: '11.2x',
                pbv: '2.1x',
                dividendYield: '4.9%',
                marketCap: 'Rp 639 T',
                lotMin: 1
            },
            {
                id: 'ST-TLKM',
                ticker: 'TLKM',
                name: 'Telkom Indonesia Tbk',
                sector: 'Telekomunikasi & Digital Infra',
                type: 'stock',
                iconClass: 'stock-telecom',
                iconLetter: 'TLK',
                price: 3120,
                changeAmt: 30,
                changePercent: 0.97,
                isUp: true,
                per: '14.8x',
                pbv: '2.3x',
                dividendYield: '5.2%',
                marketCap: 'Rp 309 T',
                lotMin: 1
            },
            {
                id: 'ST-ASII',
                ticker: 'ASII',
                name: 'Astra International Tbk',
                sector: 'Otomotif & Konglomerasi',
                type: 'stock',
                iconClass: 'stock-consumer',
                iconLetter: 'ASI',
                price: 5050,
                changeAmt: 75,
                changePercent: 1.51,
                isUp: true,
                per: '7.2x',
                pbv: '1.0x',
                dividendYield: '8.4%',
                marketCap: 'Rp 204 T',
                lotMin: 1
            },
            {
                id: 'ST-ICBP',
                ticker: 'ICBP',
                name: 'Indofood CBP Sukses Makmur',
                sector: 'Consumer Goods & F&B',
                type: 'stock',
                iconClass: 'stock-consumer',
                iconLetter: 'ICB',
                price: 11450,
                changeAmt: 75,
                changePercent: 0.66,
                isUp: true,
                per: '15.0x',
                pbv: '2.8x',
                dividendYield: '3.1%',
                marketCap: 'Rp 133 T',
                lotMin: 1
            },
            {
                id: 'ST-GOTO',
                ticker: 'GOTO',
                name: 'GoTo Gojek Tokopedia Tbk',
                sector: 'Teknologi & On-Demand',
                type: 'stock',
                iconClass: 'stock-tech',
                iconLetter: 'GTO',
                price: 65,
                changeAmt: 4,
                changePercent: 6.56,
                isUp: true,
                per: 'N/A',
                pbv: '0.8x',
                dividendYield: '0.0%',
                marketCap: 'Rp 78 T',
                lotMin: 1
            },
            {
                id: 'ST-AMMN',
                ticker: 'AMMN',
                name: 'Amman Mineral Internasional',
                sector: 'Pertambangan Tembaga & Emas',
                type: 'stock',
                iconClass: 'stock-energy',
                iconLetter: 'AMM',
                price: 9800,
                changeAmt: 300,
                changePercent: 3.16,
                isUp: true,
                per: '32.1x',
                pbv: '5.6x',
                dividendYield: '1.2%',
                marketCap: 'Rp 710 T',
                lotMin: 1
            },
            {
                id: 'ST-BREN',
                ticker: 'BREN',
                name: 'Barito Renewables Energy',
                sector: 'Energi Terbarukan (Geothermal)',
                type: 'stock',
                iconClass: 'stock-energy',
                iconLetter: 'BRE',
                price: 8950,
                changeAmt: 250,
                changePercent: 2.87,
                isUp: true,
                per: '84.0x',
                pbv: '18.2x',
                dividendYield: '0.9%',
                marketCap: 'Rp 1.197 T',
                lotMin: 1
            }
        ],
        crypto: [
            {
                id: 'CR-BTC',
                ticker: 'BTC',
                symbol: 'BTC',
                name: 'Bitcoin',
                sector: 'Digital Gold • Layer-1 (Pintu)',
                type: 'crypto',
                iconClass: 'stock-crypto-btc',
                iconLetter: '₿',
                price: 1045000000,
                changeAmt: 48500000,
                changePercent: 4.85,
                isUp: true,
                earnRate: '4.0% / thn (Bunga Tiap Jam)',
                vol24h: 'Rp 2.45 Triliun',
                marketCap: 'Rp 20.800 Triliun',
                minBuy: 11000
            },
            {
                id: 'CR-ETH',
                ticker: 'ETH',
                symbol: 'ETH',
                name: 'Ethereum',
                sector: 'Smart Contracts & DeFi (Pintu)',
                type: 'crypto',
                iconClass: 'stock-crypto-eth',
                iconLetter: 'Ξ',
                price: 54200000,
                changeAmt: 1680000,
                changePercent: 3.20,
                isUp: true,
                earnRate: '3.8% / thn (Staking)',
                vol24h: 'Rp 1.12 Triliun',
                marketCap: 'Rp 6.510 Triliun',
                minBuy: 11000
            },
            {
                id: 'CR-SOL',
                ticker: 'SOL',
                symbol: 'SOL',
                name: 'Solana',
                sector: 'High-Speed Blockchain (Pintu)',
                type: 'crypto',
                iconClass: 'stock-crypto-sol',
                iconLetter: 'SOL',
                price: 2450000,
                changeAmt: 165000,
                changePercent: 7.15,
                isUp: true,
                earnRate: '6.5% / thn',
                vol24h: 'Rp 680 Miliar',
                marketCap: 'Rp 1.150 Triliun',
                minBuy: 11000
            },
            {
                id: 'CR-PTU',
                ticker: 'PTU',
                symbol: 'PTU',
                name: 'Pintu Token',
                sector: 'Ekosistem Resmi Aplikasi PINTU',
                type: 'crypto',
                iconClass: 'stock-crypto-ptu',
                iconLetter: 'PTU',
                price: 8500,
                changeAmt: 450,
                changePercent: 5.59,
                isUp: true,
                earnRate: '12.0% / thn (VIP Level)',
                vol24h: 'Rp 45 Miliar',
                marketCap: 'Rp 850 Miliar',
                minBuy: 11000
            },
            {
                id: 'CR-USDT',
                ticker: 'USDT',
                symbol: 'USDT',
                name: 'Tether USD',
                sector: 'USD Stablecoin 1:1 (Pintu Earn)',
                type: 'crypto',
                iconClass: 'stock-crypto-usdt',
                iconLetter: '₮',
                price: 16250,
                changeAmt: 25,
                changePercent: 0.15,
                isUp: true,
                earnRate: '8.5% / thn (Bunga Tertinggi)',
                vol24h: 'Rp 3.85 Triliun',
                marketCap: 'Rp 1.950 Triliun',
                minBuy: 11000
            },
            {
                id: 'CR-BNB',
                ticker: 'BNB',
                symbol: 'BNB',
                name: 'Binance Coin',
                sector: 'BNB Chain Network (Pintu)',
                type: 'crypto',
                iconClass: 'stock-crypto-btc',
                iconLetter: 'BNB',
                price: 9350000,
                changeAmt: 195000,
                changePercent: 2.10,
                isUp: true,
                earnRate: '3.0% / thn',
                vol24h: 'Rp 410 Miliar',
                marketCap: 'Rp 1.420 Triliun',
                minBuy: 11000
            },
            {
                id: 'CR-DOGE',
                ticker: 'DOGE',
                symbol: 'DOGE',
                name: 'Dogecoin',
                sector: 'Meme & Payment Currency (Pintu)',
                type: 'crypto',
                iconClass: 'stock-crypto-btc',
                iconLetter: 'Ð',
                price: 2450,
                changeAmt: 120,
                changePercent: 5.15,
                isUp: true,
                earnRate: '2.5% / thn',
                vol24h: 'Rp 320 Miliar',
                marketCap: 'Rp 355 Triliun',
                minBuy: 11000
            }
        ],
        mutualfunds: [
            {
                id: 'MF-SUCOR-PU',
                ticker: 'SUCOR-PU',
                name: 'Sucorinvest Sharia Money Market Fund',
                sector: 'Reksa Dana Pasar Uang (Syariah)',
                type: 'mutualfund',
                iconClass: 'stock-energy',
                iconLetter: 'SPU',
                price: 1540,
                cagr: '+6.45% / thn',
                riskLevel: 'Rendah (Paling Aman)',
                aum: 'Rp 3.8 Triliun',
                minBuy: 10000,
                isUp: true
            },
            {
                id: 'MF-MANULIFE-OBL',
                ticker: 'MANU-OBL',
                name: 'Manulife Obligasi Unggulan Kelas A',
                sector: 'Reksa Dana Pendapatan Tetap',
                type: 'mutualfund',
                iconClass: 'stock-bank',
                iconLetter: 'MOU',
                price: 3280,
                cagr: '+8.82% / thn',
                riskLevel: 'Sedang (Stabil Menguntungkan)',
                aum: 'Rp 5.2 Triliun',
                minBuy: 50000,
                isUp: true
            },
            {
                id: 'MF-BATAVIA-EQ',
                ticker: 'BATAV-EQ',
                name: 'Batavia Dana Saham Optimal',
                sector: 'Reksa Dana Saham (Equity)',
                type: 'mutualfund',
                iconClass: 'stock-tech',
                iconLetter: 'BDS',
                price: 4920,
                cagr: '+14.20% / thn',
                riskLevel: 'Tinggi (Pertumbuhan Maksimal)',
                aum: 'Rp 2.4 Triliun',
                minBuy: 100000,
                isUp: true
            },
            {
                id: 'MF-BNP-SYARIAH',
                ticker: 'BNP-SYR',
                name: 'BNP Paribas Pesona Syariah',
                sector: 'Reksa Dana Saham Syariah',
                type: 'mutualfund',
                iconClass: 'stock-consumer',
                iconLetter: 'BPS',
                price: 2750,
                cagr: '+12.75% / thn',
                riskLevel: 'Tinggi (Prinsip Syariah)',
                aum: 'Rp 1.9 Triliun',
                minBuy: 50000,
                isUp: true
            }
        ],
        robo: [
            {
                id: 'ROBO-AGGRESSIVE',
                ticker: 'ROBO-8',
                name: 'Portofolio Robo Bibit - Profil Agresif',
                sector: 'Alokasi Cerdas Otomatis (Skor 8/10)',
                type: 'robo',
                iconClass: 'stock-tech',
                iconLetter: 'R-8',
                price: 100000,
                cagr: '+13.50% / thn',
                allocation: 'Saham 60% • Obligasi 30% • Pasar Uang 10%',
                riskLevel: 'Pertumbuhan Agresif Jangka Panjang',
                minBuy: 100000,
                isUp: true
            },
            {
                id: 'ROBO-MODERATE',
                ticker: 'ROBO-5',
                name: 'Portofolio Robo Bibit - Profil Moderat',
                sector: 'Alokasi Cerdas Otomatis (Skor 5/10)',
                type: 'robo',
                iconClass: 'stock-bank',
                iconLetter: 'R-5',
                price: 100000,
                cagr: '+9.25% / thn',
                allocation: 'Obligasi 50% • Saham 30% • Pasar Uang 20%',
                riskLevel: 'Keseimbangan Risiko & Imbal Hasil',
                minBuy: 50000,
                isUp: true
            },
            {
                id: 'ROBO-CONSERVATIVE',
                ticker: 'ROBO-3',
                name: 'Portofolio Robo Bibit - Profil Konservatif',
                sector: 'Alokasi Cerdas Otomatis (Skor 3/10)',
                type: 'robo',
                iconClass: 'stock-energy',
                iconLetter: 'R-3',
                price: 100000,
                cagr: '+6.80% / thn',
                allocation: 'Pasar Uang 60% • Obligasi 35% • Saham 5%',
                riskLevel: 'Prioritas Keamanan Dana',
                minBuy: 10000,
                isUp: true
            }
        ]
    };

    let currentInvestCategory = 'stocks';
    let currentInvestSelectedItem = null;

    function renderInvestCards() {
        const container = document.getElementById('investCardsContainer');
        if (!container) return;

        const items = INVEST_DATA[currentInvestCategory] || [];
        if (items.length === 0) {
            container.innerHTML = `<div class="empty-state">Tidak ada instrumen investasi tersedia.</div>`;
            return;
        }

        container.innerHTML = items.map(item => {
            if (currentInvestCategory === 'stocks') {
                return `
                    <div class="stock-card">
                        <div>
                            <div class="stock-card-top">
                                <div class="stock-brand-meta">
                                    <div class="stock-icon-avatar ${item.iconClass}">${item.iconLetter}</div>
                                    <div class="stock-title-info">
                                        <h4>${item.ticker}</h4>
                                        <span>${item.name}</span>
                                    </div>
                                </div>
                                <span class="stock-sector-tag">${item.sector.split(' ')[0]}</span>
                            </div>

                            <div class="stock-price-box mt-3">
                                <div>
                                    <span class="price-lbl">Harga / Lembar</span>
                                    <div class="stock-price-val">${formatRupiah(item.price)}</div>
                                </div>
                                <div class="stock-change-badge text-success">
                                    <i class="ri-arrow-up-line"></i> +${formatRupiah(item.changeAmt)} (+${item.changePercent}%)
                                </div>
                            </div>

                            <div class="stock-stats-row mt-3">
                                <div class="stock-stats-item">
                                    <span>P/E Ratio</span>
                                    <strong>${item.per}</strong>
                                </div>
                                <div class="stock-stats-item">
                                    <span>P/B Ratio</span>
                                    <strong>${item.pbv}</strong>
                                </div>
                                <div class="stock-stats-item">
                                    <span>Div. Yield</span>
                                    <strong class="text-success">${item.dividendYield}</strong>
                                </div>
                                <div class="stock-stats-item">
                                    <span>Market Cap</span>
                                    <strong>${item.marketCap}</strong>
                                </div>
                            </div>
                        </div>

                        <button class="btn-primary btn-buy-invest mt-3" onclick="window.openInvestOrderModal('${item.id}', 'stocks')">
                            <i class="ri-shopping-cart-2-line"></i> Beli Saham (${item.ticker})
                        </button>
                    </div>
                `;
            } else if (currentInvestCategory === 'crypto') {
                return `
                    <div class="stock-card">
                        <div>
                            <div class="stock-card-top">
                                <div class="stock-brand-meta">
                                    <div class="stock-icon-avatar ${item.iconClass}">${item.iconLetter}</div>
                                    <div class="stock-title-info">
                                        <h4>${item.name} (${item.ticker})</h4>
                                        <span>${item.sector}</span>
                                    </div>
                                </div>
                                <span class="stock-sector-tag" style="background: rgba(2, 132, 199, 0.15); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);">
                                    <i class="ri-door-lock-line"></i> PINTU
                                </span>
                            </div>

                            <div class="stock-price-box mt-3">
                                <div>
                                    <span class="price-lbl">Harga Live (IDR)</span>
                                    <div class="stock-price-val font-weight-bold" style="font-size: 1.25rem;">${formatRupiah(item.price)}</div>
                                </div>
                                <div class="stock-change-badge text-success font-weight-bold">
                                    <i class="ri-arrow-up-line"></i> +${item.changePercent}%
                                </div>
                            </div>

                            <div class="stock-stats-row mt-3">
                                <div class="stock-stats-item" style="grid-column: span 2;">
                                    <span>Pintu Earn (Bunga Pasif)</span>
                                    <strong class="text-success"><i class="ri-flashlight-line"></i> ${item.earnRate}</strong>
                                </div>
                                <div class="stock-stats-item">
                                    <span>Volume 24 Jam</span>
                                    <strong>${item.vol24h}</strong>
                                </div>
                                <div class="stock-stats-item">
                                    <span>Min. Beli</span>
                                    <strong class="text-primary">${formatRupiah(item.minBuy)}</strong>
                                </div>
                            </div>
                        </div>

                        <button class="btn-pintu btn-buy-invest mt-3" onclick="window.openInvestOrderModal('${item.id}', 'crypto')">
                            <i class="ri-bit-coin-line"></i> Beli ${item.ticker} via Pintu
                        </button>
                    </div>
                `;
            } else if (currentInvestCategory === 'mutualfunds') {
                return `
                    <div class="stock-card">
                        <div>
                            <div class="stock-card-top">
                                <div class="stock-brand-meta">
                                    <div class="stock-icon-avatar ${item.iconClass}"><i class="ri-funds-box-line"></i></div>
                                    <div class="stock-title-info">
                                        <h4>${item.name}</h4>
                                        <span>${item.sector}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="stock-price-box mt-3">
                                <div>
                                    <span class="price-lbl">Imbal Hasil 1 Thn</span>
                                    <div class="stock-price-val text-success font-weight-bold">${item.cagr}</div>
                                </div>
                                <div class="text-right">
                                    <span class="price-lbl">NAV / Unit</span>
                                    <strong class="text-primary">${formatRupiah(item.price)}</strong>
                                </div>
                            </div>

                            <div class="stock-stats-row mt-3">
                                <div class="stock-stats-item">
                                    <span>Tingkat Risiko</span>
                                    <strong>${item.riskLevel}</strong>
                                </div>
                                <div class="stock-stats-item">
                                    <span>Dana Kelolaan (AUM)</span>
                                    <strong>${item.aum}</strong>
                                </div>
                                <div class="stock-stats-item" style="grid-column: span 2;">
                                    <span>Min. Pembelian</span>
                                    <strong class="text-primary">${formatRupiah(item.minBuy)}</strong>
                                </div>
                            </div>
                        </div>

                        <button class="btn-primary btn-buy-invest mt-3" onclick="window.openInvestOrderModal('${item.id}', 'mutualfunds')">
                            <i class="ri-leaf-line"></i> Beli Reksa Dana Bibit
                        </button>
                    </div>
                `;
            } else {
                // Robo-Advisor Cards
                return `
                    <div class="stock-card">
                        <div>
                            <div class="stock-card-top">
                                <div class="stock-brand-meta">
                                    <div class="stock-icon-avatar ${item.iconClass}"><i class="ri-robot-2-line"></i></div>
                                    <div class="stock-title-info">
                                        <h4>${item.name}</h4>
                                        <span>${item.sector}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="stock-price-box mt-3">
                                <div>
                                    <span class="price-lbl">Histori Imbal Hasil</span>
                                    <div class="stock-price-val text-success font-weight-bold">${item.cagr}</div>
                                </div>
                                <div class="text-right">
                                    <span class="price-lbl">Mitra KSEI</span>
                                    <strong class="text-success"><i class="ri-shield-check-line"></i> OJK / Bibit</strong>
                                </div>
                            </div>

                            <div class="stock-stats-row mt-3">
                                <div class="stock-stats-item" style="grid-column: span 2;">
                                    <span>Alokasi Aset Otomatis</span>
                                    <strong class="text-cyan">${item.allocation}</strong>
                                </div>
                                <div class="stock-stats-item" style="grid-column: span 2;">
                                    <span>Karakteristik</span>
                                    <strong>${item.riskLevel}</strong>
                                </div>
                            </div>
                        </div>

                        <button class="btn-primary btn-buy-invest mt-3" onclick="window.openInvestOrderModal('${item.id}', 'robo')">
                            <i class="ri-robot-2-line"></i> Investasi Robo Bibit
                        </button>
                    </div>
                `;
            }
        }).join('');
    }

    function switchInvestCategory(cat) {
        currentInvestCategory = cat;
        document.querySelectorAll('.invest-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-invest-cat') === cat);
        });
        renderInvestCards();
    }

    window.openInvestOrderModal = function(itemId, category) {
        const list = INVEST_DATA[category] || [];
        const item = list.find(i => i.id === itemId);
        if (!item) return;

        currentInvestSelectedItem = { ...item, categoryType: category };

        const titleEl = document.getElementById('investOrderModalTitle');
        const subEl = document.getElementById('investOrderSubtitle');
        const priceEl = document.getElementById('investCurrentPrice');
        const changeEl = document.getElementById('investPriceChange');
        const badgeEl = document.getElementById('investOrderLogoBadge');
        const groupLot = document.getElementById('groupInvestLot');
        const groupNominal = document.getElementById('groupInvestNominal');
        const nominalLbl = document.getElementById('investNominalLabel');
        const cryptoEst = document.getElementById('cryptoEstBadge');
        const earnBox = document.getElementById('pintuEarnBox');
        const earnRateEl = document.getElementById('pintuEarnRate');
        const autoTitle = document.getElementById('autoInvestTitle');
        const autoSub = document.getElementById('autoInvestSub');
        const feeLbl = document.getElementById('investFeeLabel');

        if (category === 'stocks') {
            if (titleEl) titleEl.textContent = `Beli Saham ${item.ticker}`;
            if (subEl) subEl.textContent = `${item.name} • ${item.sector}`;
            if (priceEl) priceEl.textContent = `${formatRupiah(item.price)} / lembar`;
            if (changeEl) changeEl.innerHTML = `+${formatRupiah(item.changeAmt)} (+${item.changePercent}%)`;
            if (badgeEl) badgeEl.innerHTML = `<i class="ri-line-chart-line"></i>`;

            if (groupLot) groupLot.classList.remove('hidden');
            if (groupNominal) groupNominal.classList.add('hidden');
            if (cryptoEst) cryptoEst.classList.add('hidden');
            if (earnBox) earnBox.classList.add('hidden');

            if (autoTitle) autoTitle.textContent = 'Nabung Rutin Tiap Bulan (Auto-Invest Saham)';
            if (autoSub) autoSub.textContent = 'Otomatis alokasikan dari saldo My Klepeh tiap tanggal 25';
            if (feeLbl) feeLbl.textContent = 'Biaya KSEI & Broker Bibit';

            const lotInput = document.getElementById('investLotInput');
            if (lotInput) lotInput.value = 1;
        } else if (category === 'crypto') {
            if (titleEl) titleEl.textContent = `Beli ${item.name} (${item.ticker})`;
            if (subEl) subEl.textContent = `${item.sector} • Pintu Kripto & Bappebti`;
            if (priceEl) priceEl.textContent = `${formatRupiah(item.price)}`;
            if (changeEl) changeEl.innerHTML = `<span class="text-success font-weight-bold">+${item.changePercent}% (24 Jam)</span>`;
            if (badgeEl) badgeEl.innerHTML = `<i class="ri-bit-coin-line"></i>`;

            if (groupLot) groupLot.classList.add('hidden');
            if (groupNominal) groupNominal.classList.remove('hidden');
            if (cryptoEst) cryptoEst.classList.remove('hidden');
            if (earnBox) earnBox.classList.remove('hidden');
            if (earnRateEl) earnRateEl.textContent = `APY: ${item.earnRate}`;

            if (nominalLbl) nominalLbl.textContent = `Nominal Pembelian ${item.ticker} (Rp)`;
            if (autoTitle) autoTitle.textContent = `Pintu Auto-DCA (${item.ticker} Nabung Rutin Mingguan)`;
            if (autoSub) autoSub.textContent = 'Otomatis beli secara berkala dengan strategi Dollar Cost Averaging';
            if (feeLbl) feeLbl.textContent = 'Biaya Transaksi PINTU & PPN CFX';

            const nomInput = document.getElementById('investNominalInput');
            if (nomInput) {
                nomInput.value = item.minBuy || 50000;
                nomInput.min = item.minBuy || 11000;
            }
        } else {
            // Mutual funds & Robo
            if (titleEl) titleEl.textContent = `Beli ${item.name}`;
            if (subEl) subEl.textContent = `${item.sector} • Reksa Dana Bibit`;
            if (priceEl) priceEl.textContent = `NAV: ${formatRupiah(item.price)}`;
            if (changeEl) changeEl.innerHTML = `<span class="text-success font-weight-bold">${item.cagr}</span>`;
            if (badgeEl) badgeEl.innerHTML = category === 'robo' ? `<i class="ri-robot-2-line"></i>` : `<i class="ri-funds-box-line"></i>`;

            if (groupLot) groupLot.classList.add('hidden');
            if (groupNominal) groupNominal.classList.remove('hidden');
            if (cryptoEst) cryptoEst.classList.add('hidden');
            if (earnBox) earnBox.classList.add('hidden');

            if (nominalLbl) nominalLbl.textContent = 'Nominal Investasi Reksa Dana (Rp)';
            if (autoTitle) autoTitle.textContent = 'Nabung Rutin Tiap Bulan (Auto-Invest Bibit)';
            if (autoSub) autoSub.textContent = 'Otomatis alokasikan dari saldo My Klepeh tiap tanggal 25';
            if (feeLbl) feeLbl.textContent = 'Biaya KSEI & Manajer Investasi';

            const nomInput = document.getElementById('investNominalInput');
            if (nomInput) {
                nomInput.value = item.minBuy || 100000;
                nomInput.min = item.minBuy || 10000;
            }
        }

        updateInvestSummaryCheckout();
        openModal('modalInvestOrder');
    };

    function updateInvestSummaryCheckout() {
        if (!currentInvestSelectedItem) return;

        let totalAmount = 0;
        if (currentInvestSelectedItem.categoryType === 'stocks') {
            const lots = parseInt(document.getElementById('investLotInput')?.value) || 1;
            const pricePerShare = currentInvestSelectedItem.price;
            totalAmount = lots * 100 * pricePerShare;
        } else {
            totalAmount = parseInt(document.getElementById('investNominalInput')?.value) || 50000;
            
            // Calculate Crypto coin estimate if in crypto mode
            if (currentInvestSelectedItem.categoryType === 'crypto') {
                const coinPrice = currentInvestSelectedItem.price;
                const estCoin = (totalAmount / coinPrice).toFixed(7);
                const estEl = document.getElementById('cryptoEstCoinVal');
                if (estEl) estEl.textContent = `${estCoin} ${currentInvestSelectedItem.ticker}`;
            }
        }

        const subEl = document.getElementById('investSummarySubtotal');
        const totEl = document.getElementById('investSummaryTotal');

        if (subEl) subEl.textContent = formatRupiah(totalAmount);
        if (totEl) totEl.textContent = formatRupiah(totalAmount);
    }

    // Input listeners for order modal
    document.getElementById('investLotInput')?.addEventListener('input', updateInvestSummaryCheckout);
    document.getElementById('investNominalInput')?.addEventListener('input', updateInvestSummaryCheckout);

    // Confirm Buy Investment Click -> Open PIN Modal
    document.getElementById('btnConfirmBuyInvest')?.addEventListener('click', () => {
        if (!currentInvestSelectedItem) return;

        let totalAmount = 0;
        let orderDesc = '';
        const isAutoInvest = document.getElementById('checkAutoInvest')?.checked;

        if (currentInvestSelectedItem.categoryType === 'stocks') {
            const lots = parseInt(document.getElementById('investLotInput')?.value) || 1;
            totalAmount = lots * 100 * currentInvestSelectedItem.price;
            orderDesc = `Beli ${lots} Lot Saham ${currentInvestSelectedItem.ticker}`;
        } else if (currentInvestSelectedItem.categoryType === 'crypto') {
            totalAmount = parseInt(document.getElementById('investNominalInput')?.value) || 50000;
            const coinPrice = currentInvestSelectedItem.price;
            const estCoin = (totalAmount / coinPrice).toFixed(6);
            orderDesc = `Beli ${estCoin} ${currentInvestSelectedItem.name} (${currentInvestSelectedItem.ticker})`;
        } else {
            totalAmount = parseInt(document.getElementById('investNominalInput')?.value) || 100000;
            orderDesc = `Investasi ${currentInvestSelectedItem.name}`;
        }

        if (isNaN(totalAmount) || totalAmount <= 0) {
            showToast('Masukkan jumlah lot atau nominal yang valid!', 'error');
            return;
        }

        if (totalAmount > state.balance) {
            showToast(`Saldo My Klepeh Anda (${formatRupiah(state.balance)}) tidak mencukupi untuk investasi ini!`, 'error');
            return;
        }

        const methodDesc = currentInvestSelectedItem.categoryType === 'crypto'
            ? 'Saldo Klepeh (Pintu CFX-88192)'
            : 'Saldo Klepeh (KSEI / Bibit IDN-99214)';

        pendingTx = {
            title: orderDesc,
            category: 'payment',
            type: 'debit',
            amount: totalAmount,
            method: methodDesc,
            note: `${orderDesc}${isAutoInvest ? ' (Auto-Invest / DCA Aktif)' : ''} via ${currentInvestSelectedItem.categoryType === 'crypto' ? 'Pintu Terintegrasi' : 'Bibit Terintegrasi'}`
        };

        closeModal('modalInvestOrder');
        resetPinDots();
        openModal('modalPin');
    });

    // Deep link / Open Bibit Web & App
    document.getElementById('btnOpenBibitApp')?.addEventListener('click', () => {
        playSuccessSound();
        showToast('Membuka Portal Resmi Aplikasi Bibit...', 'success');
        window.open('https://app.bibit.id', '_blank');
    });

    // Deep link / Open Pintu Web & App
    document.getElementById('btnOpenPintuApp')?.addEventListener('click', () => {
        playSuccessSound();
        showToast('Membuka Portal Resmi Aplikasi PINTU Kripto...', 'success');
        window.open('https://pintu.co.id', '_blank');
    });

    // Sync Portfolio Handler
    document.getElementById('btnSyncBibitPorto')?.addEventListener('click', () => {
        const syncBtn = document.getElementById('btnSyncBibitPorto');
        if (syncBtn) {
            syncBtn.disabled = true;
            syncBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Menyinkronkan...`;
        }

        setTimeout(() => {
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.innerHTML = `<i class="ri-refresh-line"></i> Sinkronkan Portofolio`;
            }
            playSuccessSound();
            showToast('Portofolio Saham Bibit & Kripto Pintu berhasil disinkronkan! 📈', 'success');
        }, 1200);
    });

    // Tab Listeners for Invest Subtabs
    document.querySelectorAll('.invest-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-invest-cat');
            if (cat) switchInvestCategory(cat);
        });
    });

    // Initial render for Invest
    renderInvestCards();

    // Initial populate for travel dropdowns & results
    populateTravelDropdowns('flight');
    renderTravelResults();

    // INIT INITIAL APP RENDER
    renderApp();
});


