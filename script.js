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
    // 12. GLOBAL SEARCH & FILTER LISTENERS
    // ----------------------------------------------------------------------
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            const q = e.target.value.trim().toLowerCase();
            if (q.length > 0) {
                switchTab('transactions');
                const txInput = document.getElementById('txSearchInput');
                if (txInput) {
                    txInput.value = q;
                    renderFullTransactionsTable();
                }
            }
        });
    }

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
