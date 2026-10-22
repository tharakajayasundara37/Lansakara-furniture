'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './admin.css';

export default function AdminPage() {
    // ──────────────────────────────────────────
    // AUTH STATE
    // ──────────────────────────────────────────
    const [token, setToken] = useState(null);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    // ──────────────────────────────────────────
    // NAVIGATION & SHELL STATE
    // ──────────────────────────────────────────
    // Active Section: 'dashboard' | 'products' | 'orders' | 'settings' | 'reviews'
    const [activeSection, setActiveSection] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    // ──────────────────────────────────────────
    // DATA STATES
    // ──────────────────────────────────────────
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        inProduction: 0,
        delivered: 0,
        totalRevenue: 0,
        productsCount: 0
    });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [settings, setSettings] = useState({
        cardDiscountPercent: 10,
        deliveryRatePerKm: 100,
        codAdvancePercent: 20,
        bankDetails: {
            bankName: 'Commercial Bank of Ceylon',
            accountName: 'Lansakara Furniture (Pvt) Ltd',
            accountNumber: '1000847291',
            branch: 'Moratuwa Premium Branch'
        }
    });

    // ──────────────────────────────────────────
    // FILTERS & SEARCH
    // ──────────────────────────────────────────
    const [orderFilter, setOrderFilter] = useState('all');
    const [orderSearch, setOrderSearch] = useState('');
    const [productCategoryFilter, setProductCategoryFilter] = useState('all');
    const [productSearch, setProductSearch] = useState('');

    // ──────────────────────────────────────────
    // MODALS & FORMS
    // ──────────────────────────────────────────
    const [slipModalUrl, setSlipModalUrl] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        category: 'dining',
        price: '',
        originalPrice: '',
        shortDescription: '',
        description: '',
        woodType: 'Solid Teak',
        badge: 'New Arrival',
        featured: false,
        inStock: true
    });
    const [productImageFile, setProductImageFile] = useState(null);
    const [savingProduct, setSavingProduct] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsNotice, setSettingsNotice] = useState('');

    // ──────────────────────────────────────────
    // MOUNT & CLOCK EFFECTS
    // ──────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('lansakara_admin_token');
            if (saved) {
                setToken(saved);
            }
        }
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));
        };
        updateClock();
        const interval = setInterval(updateClock, 30000);
        return () => clearInterval(interval);
    }, []);

    // Load data when authenticated
    useEffect(() => {
        if (token) {
            loadDashboardData();
        }
    }, [token]);

    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${token}`
    });

    const loadDashboardData = async () => {
        try {
            // Stats
            const resStats = await fetch('/api/orders/stats/summary', { headers: getAuthHeaders() });
            if (resStats.ok) {
                const sData = await resStats.json();
                setStats((prev) => ({ ...prev, ...sData }));
            }

            // Orders
            const resOrders = await fetch('/api/orders?limit=200', { headers: getAuthHeaders() });
            if (resOrders.ok) {
                const oData = await resOrders.json();
                setOrders(oData.orders || []);
            }

            // Products
            const resProd = await fetch('/api/products?limit=200');
            if (resProd.ok) {
                const pData = await resProd.json();
                setProducts(pData.products || []);
                setStats((prev) => ({ ...prev, productsCount: pData.total || (pData.products || []).length }));
            }

            // Settings
            const resSet = await fetch('/api/settings');
            if (resSet.ok) {
                const setData = await resSet.json();
                setSettings(setData);
            }

            // Reviews
            const resRev = await fetch('/api/reviews?status=all', { headers: getAuthHeaders() });
            if (resRev.ok) {
                const rData = await resRev.json();
                setReviews(rData.reviews || []);
            }
        } catch (err) {
            console.error('Error fetching admin dashboard data:', err);
        }
    };

    // ──────────────────────────────────────────
    // HANDLERS
    // ──────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoggingIn(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: loginUsername.trim(),
                    password: loginPassword.trim()
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setLoginError(data.error || 'Authentication failed. Please verify credentials.');
                setLoggingIn(false);
                return;
            }

            const receivedToken = data.token;
            setToken(receivedToken);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('lansakara_admin_token', receivedToken);
            }
        } catch (err) {
            setLoginError('Network error connecting to backend auth handler.');
        } finally {
            setLoggingIn(false);
        }
    };

    const handleLogout = () => {
        setToken(null);
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('lansakara_admin_token');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
                );
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating status: ' + err.message);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!confirm(`Are you sure you want to permanently delete order #${orderId}?`)) return;

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                setOrders((prev) => prev.filter((o) => o._id !== orderId));
            } else {
                alert('Failed to delete order');
            }
        } catch (err) {
            alert('Error deleting order: ' + err.message);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingsNotice('');

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(settings)
            });

            const data = await res.json();
            if (res.ok) {
                setSettingsNotice('✓ Atelier Settings & Commercial Pricing published successfully!');
                setTimeout(() => setSettingsNotice(''), 3500);
            } else {
                alert(data.error || 'Failed to update settings');
            }
        } catch (err) {
            alert('Error updating settings: ' + err.message);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setSavingProduct(true);

        const formData = new FormData();
        formData.append('name', productForm.name);
        formData.append('category', productForm.category);
        formData.append('price', parseFloat(productForm.price) || 0);
        formData.append('originalPrice', parseFloat(productForm.originalPrice) || 0);
        formData.append('shortDescription', productForm.shortDescription);
        formData.append('description', productForm.description);
        formData.append('woodType', productForm.woodType);
        formData.append('badge', productForm.badge);
        formData.append('featured', productForm.featured);
        formData.append('inStock', productForm.inStock);

        if (productImageFile) {
            formData.append('image', productImageFile);
        }

        try {
            let res;
            if (editingProduct) {
                res = await fetch(`/api/products/${editingProduct._id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: formData
                });
            } else {
                res = await fetch('/api/products', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: formData
                });
            }

            const data = await res.json();
            if (res.ok) {
                setShowProductModal(false);
                setEditingProduct(null);
                setProductImageFile(null);
                loadDashboardData();
            } else {
                alert(data.error || 'Failed to save product');
            }
        } catch (err) {
            alert('Error saving product: ' + err.message);
        } finally {
            setSavingProduct(false);
        }
    };

    const handleDeleteProduct = async (productId, prodName) => {
        if (!confirm(`Are you sure you want to delete "${prodName}" from the catalog?`)) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                setProducts((prev) => prev.filter((p) => p._id !== productId));
            } else {
                alert('Failed to delete product');
            }
        } catch (err) {
            alert('Error deleting product: ' + err.message);
        }
    };

    const handleReviewAction = async (reviewId, action) => {
        try {
            if (action === 'delete') {
                if (!confirm('Permanently delete this patron review?')) return;
                const res = await fetch(`/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    setReviews((prev) => prev.filter((r) => r._id !== reviewId && r.id !== reviewId));
                } else {
                    alert('Could not delete review: ' + (data.error || 'Server error'));
                }
            }
        } catch (err) {
            alert('Error updating review: ' + err.message);
        }
    };

    // Filtered lists
    const filteredOrders = orders.filter((o) => {
        if (orderFilter !== 'all' && o.status !== orderFilter) return false;
        if (orderSearch.trim()) {
            const q = orderSearch.toLowerCase();
            const matchName = (o.customerName || '').toLowerCase().includes(q);
            const matchId = (o._id || '').toLowerCase().includes(q);
            const matchPhone = (o.phone || '').toLowerCase().includes(q);
            const matchProd = (o.productName || '').toLowerCase().includes(q);
            return matchName || matchId || matchPhone || matchProd;
        }
        return true;
    });

    const filteredProducts = products.filter((p) => {
        if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
        if (productSearch.trim()) {
            const q = productSearch.toLowerCase();
            const matchName = (p.name || '').toLowerCase().includes(q);
            const matchWood = (p.woodType || '').toLowerCase().includes(q);
            return matchName || matchWood;
        }
        return true;
    });

    // Helper for initials avatar
    const getInitials = (name) => {
        if (!name) return 'AT';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // ──────────────────────────────────────────
    // IF NOT AUTHENTICATED: RENDER LUXURY LOGIN
    // ──────────────────────────────────────────
    if (!token) {
        return (
            <div id="loginPage">
                <div className="login-overlay"></div>
                <div className="login-card glass-panel">
                    <div className="login-crest">
                        <div className="crest-badge">
                            <i className="fas fa-shield-halved"></i>
                        </div>
                        <span className="crest-tag">MASTER ARTISAN PORTAL</span>
                    </div>

                    <div className="login-header">
                        <h1 className="brand-title">LANSAKARA</h1>
                        <p className="brand-subtitle">Atelier Administration & Control</p>
                    </div>

                    {loginError && (
                        <div className="login-error-alert" role="alert">
                            <i className="fas fa-circle-exclamation"></i>
                            <span>{loginError}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-field-group">
                            <label htmlFor="adminUsername">Artisan ID / Username</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon-box">
                                    <i className="fas fa-user-shield"></i>
                                </span>
                                <input
                                    id="adminUsername"
                                    type="text"
                                    className="glass-input"
                                    placeholder="Enter authorized username"
                                    required
                                    autoComplete="username"
                                    value={loginUsername}
                                    onChange={(e) => setLoginUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="login-field-group">
                            <label htmlFor="adminPassword">Master Passphrase</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon-box">
                                    <i className="fas fa-lock"></i>
                                </span>
                                <input
                                    id="adminPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    className="glass-input"
                                    placeholder="Enter security key"
                                    required
                                    autoComplete="current-password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-login" disabled={loggingIn}>
                            {loggingIn ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Verifying Master Credentials...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In to Portal</span>
                                    <i className="fas fa-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <Link href="/" className="back-atelier-link">
                            <i className="fas fa-arrow-left-long"></i>
                            <span>Return to Lansakara Public Atelier</span>
                        </Link>
                        <div className="security-note">
                            <i className="fas fa-lock"></i>
                            <span>256-Bit Encrypted Master Session</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ──────────────────────────────────────────
    // AUTHENTICATED: RENDER MASTER DASHBOARD
    // ──────────────────────────────────────────
    return (
        <div id="mainApp">
            {/* Mobile Sidebar Backdrop */}
            <div
                className={`sidebar-mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* ─── SIDEBAR ─────────────────────────────────────── */}
            <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-crest-icon">
                        <i className="fas fa-couch"></i>
                    </div>
                    <div className="sidebar-brand-group">
                        <span className="sidebar-brand-name">LANSAKARA</span>
                        <span className="sidebar-brand-sub">Royal Woodcraft Atelier</span>
                    </div>
                </div>

                <div className="sidebar-status-banner">
                    <span className="status-dot-pulse">Workshop Online</span>
                    <span className="status-location-tag">Moratuwa, LK</span>
                </div>

                <div className="sidebar-nav-container">
                    <div className="nav-section-label">Executive Management</div>

                    <button
                        type="button"
                        className={`nav-item-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('dashboard'); setMobileMenuOpen(false); }}
                    >
                        <i className="fas fa-chart-pie"></i>
                        <span>Executive Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className={`nav-item-btn ${activeSection === 'products' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('products'); setMobileMenuOpen(false); }}
                    >
                        <i className="fas fa-chair"></i>
                        <span>Catalog Masterpieces</span>
                        <span className="nav-item-count">{products.length}</span>
                    </button>

                    <button
                        type="button"
                        className={`nav-item-btn ${activeSection === 'orders' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('orders'); setMobileMenuOpen(false); }}
                    >
                        <i className="fas fa-gem"></i>
                        <span>Bespoke Patron Orders</span>
                        {stats.pendingOrders > 0 && (
                            <span className="nav-item-badge">{stats.pendingOrders}</span>
                        )}
                    </button>

                    <div className="nav-section-label">Configuration & Feedback</div>

                    <button
                        type="button"
                        className={`nav-item-btn ${activeSection === 'settings' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('settings'); setMobileMenuOpen(false); }}
                    >
                        <i className="fas fa-sliders"></i>
                        <span>Pricing & Delivery Rules</span>
                    </button>

                    <button
                        type="button"
                        className={`nav-item-btn ${activeSection === 'reviews' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('reviews'); setMobileMenuOpen(false); }}
                    >
                        <i className="fas fa-star"></i>
                        <span>Patron Reflections</span>
                        <span className="nav-item-count">{reviews.length}</span>
                    </button>
                </div>

                <div className="sidebar-footer">
                    <Link href="/" target="_blank" className="btn-sidebar-secondary">
                        <i className="fas fa-arrow-up-right-from-square"></i>
                        <span>View Live Storefront</span>
                    </Link>
                    <button type="button" className="btn-logout-portal" onClick={handleLogout}>
                        <i className="fas fa-right-from-bracket"></i>
                        <span>Sign Out of Portal</span>
                    </button>
                </div>
            </aside>

            {/* ─── WORKSPACE (TOPBAR & CONTENT) ────────────────── */}
            <div className="admin-workspace">
                {/* TOP BAR */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="mobile-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle Navigation Menu"
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className="topbar-title-group">
                            <span className="topbar-page-kicker">LANSAKARA ATELIER ADMINISTRATION</span>
                            <h2 className="topbar-page-title">
                                {activeSection === 'dashboard' && 'Executive Workshop Overview'}
                                {activeSection === 'products' && 'Catalog Masterpieces & Furniture Collection'}
                                {activeSection === 'orders' && 'Bespoke Patron Orders & Inquiries'}
                                {activeSection === 'settings' && 'Delivery, Discounts & Banking Rules'}
                                {activeSection === 'reviews' && 'Patron Reflections & Testimonials'}
                            </h2>
                        </div>
                    </div>

                    <div className="topbar-right">
                        {currentTime && (
                            <div className="live-clock-badge">
                                <i className="far fa-clock" style={{ color: 'var(--gold)' }}></i>
                                <span>{currentTime}</span>
                            </div>
                        )}
                        <div className="admin-profile-pill">
                            <div className="admin-avatar-circle">
                                <span>LA</span>
                            </div>
                            <div className="admin-info">
                                <span className="admin-name">Master Artisan</span>
                                <span className="admin-role">Super Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE BODY */}
                <main className="admin-scroll-body">
                    {/* ═════════ 1. DASHBOARD OVERVIEW ═════════ */}
                    {activeSection === 'dashboard' && (
                        <>
                            {/* Metric Cards Grid */}
                            <div className="stats-grid-luxury">
                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Workshop Revenue</span>
                                        <div className="stat-icon-badge stat-icon-gold">
                                            <i className="fas fa-coins"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value highlight-gold">
                                        Rs. {(stats.totalRevenue || 0).toLocaleString()}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-check-circle" style={{ color: 'var(--emerald)' }}></i>
                                        <span>Verified Customer Billings</span>
                                    </div>
                                </div>

                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Bespoke Orders</span>
                                        <div className="stat-icon-badge stat-icon-blue">
                                            <i className="fas fa-clipboard-check"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value">
                                        {stats.totalOrders || orders.length}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-boxes-stacked" style={{ color: 'var(--blue)' }}></i>
                                        <span>Active Inquiries & Pipeline</span>
                                    </div>
                                </div>

                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Pending Review</span>
                                        <div className="stat-icon-badge stat-icon-amber">
                                            <i className="fas fa-hourglass-half"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value" style={{ color: 'var(--amber)' }}>
                                        {stats.pendingOrders || orders.filter((o) => o.status === 'pending').length}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-bell" style={{ color: 'var(--amber)' }}></i>
                                        <span>Requires Artisan Action</span>
                                    </div>
                                </div>

                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">In Production</span>
                                        <div className="stat-icon-badge stat-icon-blue">
                                            <i className="fas fa-hammer"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value" style={{ color: 'var(--blue)' }}>
                                        {stats.inProduction || orders.filter((o) => o.status === 'in_production').length}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-screwdriver-wrench"></i>
                                        <span>On Carpenter Workbench</span>
                                    </div>
                                </div>

                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Catalog Pieces</span>
                                        <div className="stat-icon-badge stat-icon-emerald">
                                            <i className="fas fa-couch"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value">
                                        {products.length}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-globe" style={{ color: 'var(--emerald)' }}></i>
                                        <span>Published to Showroom</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders Overview Card */}
                            <div className="atelier-panel-card">
                                <div className="panel-header-row">
                                    <div className="panel-title-group">
                                        <h3 className="panel-title">Recent Bespoke Patron Commissions</h3>
                                        <span className="panel-subtitle">Latest custom furniture orders placed across Sri Lanka</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-gold-primary"
                                        onClick={() => setActiveSection('orders')}
                                        style={{ padding: '8px 18px', fontSize: '11.5px' }}
                                    >
                                        <span>View Complete Order Book ({orders.length})</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>

                                <div className="table-responsive-container">
                                    <table className="atelier-data-table">
                                        <thead>
                                            <tr>
                                                <th>Order Ref</th>
                                                <th>Patron</th>
                                                <th>Masterpiece Piece</th>
                                                <th>Total Value</th>
                                                <th>Payment Method</th>
                                                <th>Production Status</th>
                                                <th style={{ textAlign: 'right' }}>Direct Connect</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 6).map((o) => (
                                                <tr key={o._id}>
                                                    <td>
                                                        <span className="ref-hash-pill">
                                                            #{(o._id || '').slice(-6).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="patron-cell-group">
                                                            <div className="patron-avatar-initials">
                                                                {getInitials(o.customerName)}
                                                            </div>
                                                            <div className="patron-details-stack">
                                                                <span className="patron-name">{o.customerName}</span>
                                                                <span className="patron-meta-sub">{o.phone}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{o.productName}</div>
                                                        <span style={{ fontSize: '11px', color: 'var(--gold)' }}>
                                                            {o.woodSpec || 'Solid Hardwood'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: 'var(--gold-light)' }}>
                                                            Rs. {(o.totalPrice || 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="payment-badge-pill">
                                                            <i className="fas fa-credit-card" style={{ fontSize: '10px' }}></i>
                                                            {(o.paymentMethod || 'card').replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill-badge status-${o.status || 'pending'}`}>
                                                            ● {(o.status || 'pending').replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <a
                                                            href={`https://wa.me/${(o.phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(o.customerName)},%20this%20is%20Lansakara%20Artisans%20regarding%20your%20bespoke%20order%20%23${(o._id || '').slice(-6).toUpperCase()}.`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-action-circle btn-action-whatsapp"
                                                            title="Direct WhatsApp with Patron"
                                                        >
                                                            <i className="fab fa-whatsapp"></i>
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr>
                                                    <td colSpan="7">
                                                        <div className="empty-state-luxury">
                                                            <i className="fas fa-inbox empty-state-icon"></i>
                                                            <h4 className="empty-state-title">No Bespoke Orders Yet</h4>
                                                            <p className="empty-state-sub">New commission requests submitted from the atelier will appear here instantly.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═════════ 2. CATALOG PRODUCTS ═════════ */}
                    {activeSection === 'products' && (
                        <div className="atelier-panel-card">
                            <div className="panel-header-row">
                                <div className="panel-title-group">
                                    <h3 className="panel-title">Catalog Masterpieces & Showroom Pieces</h3>
                                    <span className="panel-subtitle">Manage handcrafted timber products with high-resolution imagery and specifications</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-gold-primary"
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setProductForm({
                                            name: '',
                                            category: 'dining',
                                            price: '',
                                            originalPrice: '',
                                            shortDescription: '',
                                            description: '',
                                            woodType: 'Solid Teak',
                                            badge: 'New Arrival',
                                            featured: false,
                                            inStock: true
                                        });
                                        setShowProductModal(true);
                                    }}
                                >
                                    <i className="fas fa-plus"></i>
                                    <span>Add Masterpiece Piece</span>
                                </button>
                            </div>

                            {/* Search & Category Filter Toolbar */}
                            <div className="controls-toolbar">
                                <div className="search-input-box">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        className="search-input-field"
                                        placeholder="Search by piece title or timber species..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                </div>

                                <div className="filter-pills-row">
                                    {['all', 'dining', 'living', 'tables', 'bedroom'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`filter-pill-btn ${productCategoryFilter === cat ? 'active' : ''}`}
                                            onClick={() => setProductCategoryFilter(cat)}
                                        >
                                            <span>{cat === 'all' ? 'All Collections' : cat}</span>
                                            <span className="pill-count-badge">
                                                {cat === 'all'
                                                    ? products.length
                                                    : products.filter((p) => p.category === cat).length}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Products Table */}
                            <div className="table-responsive-container">
                                <table className="atelier-data-table">
                                    <thead>
                                        <tr>
                                            <th>Artwork Preview</th>
                                            <th>Masterpiece Name</th>
                                            <th>Category</th>
                                            <th>Timber Specification</th>
                                            <th>Catalog Price</th>
                                            <th>Badge Pill</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((p) => {
                                            const thumb = p.images && p.images[0] ? p.images[0] : '/images/wood_09.jpg';
                                            return (
                                                <tr key={p._id}>
                                                    <td>
                                                        <img
                                                            src={thumb}
                                                            alt={p.name}
                                                            className="table-product-thumb"
                                                            onError={(e) => { e.currentTarget.src = '/images/wood_09.jpg'; }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                            {p.shortDescription || 'Heirloom Artisan Joinery'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="payment-badge-pill" style={{ textTransform: 'uppercase' }}>
                                                            {p.category}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ color: 'var(--gold-light)' }}>
                                                            {p.woodType || 'Solid Ceylon Hardwood'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: 'var(--gold)' }}>
                                                            Rs. {(p.price || 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {p.badge ? (
                                                            <span style={{
                                                                background: 'rgba(212,175,55,0.15)',
                                                                color: 'var(--gold-light)',
                                                                border: '1px solid var(--gold-border)',
                                                                padding: '3px 8px',
                                                                borderRadius: '8px',
                                                                fontSize: '11px',
                                                                fontWeight: 600
                                                            }}>
                                                                {p.badge}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div className="action-buttons-group">
                                                            <button
                                                                type="button"
                                                                className="btn-action-circle btn-action-delete"
                                                                onClick={() => handleDeleteProduct(p._id, p.name)}
                                                                title={`Delete ${p.name}`}
                                                            >
                                                                <i className="fas fa-trash-can"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredProducts.length === 0 && (
                                            <tr>
                                                <td colSpan="7">
                                                    <div className="empty-state-luxury">
                                                        <i className="fas fa-couch empty-state-icon"></i>
                                                        <h4 className="empty-state-title">No Masterpieces Found</h4>
                                                        <p className="empty-state-sub">Try adjusting your category filter or search query to find showroom furniture.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═════════ 3. BESPOKE ORDERS ═════════ */}
                    {activeSection === 'orders' && (
                        <div className="atelier-panel-card">
                            <div className="panel-header-row">
                                <div className="panel-title-group">
                                    <h3 className="panel-title">Bespoke Patron Orders & Inquiries</h3>
                                    <span className="panel-subtitle">Manage client commissions, update crafting milestones, and verify transfer slips</span>
                                </div>
                            </div>

                            {/* Toolbar: Search & Order Status Tabs */}
                            <div className="controls-toolbar">
                                <div className="search-input-box">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        className="search-input-field"
                                        placeholder="Search by patron name, phone, or order reference..."
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                    />
                                </div>

                                <div className="filter-pills-row">
                                    {['all', 'pending', 'in_production', 'ready_for_delivery', 'delivered', 'cancelled'].map((st) => (
                                        <button
                                            key={st}
                                            type="button"
                                            className={`filter-pill-btn ${orderFilter === st ? 'active' : ''}`}
                                            onClick={() => setOrderFilter(st)}
                                        >
                                            <span>{st.replace(/_/g, ' ')}</span>
                                            <span className="pill-count-badge">
                                                {st === 'all'
                                                    ? orders.length
                                                    : orders.filter((o) => o.status === st).length}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orders Table */}
                            <div className="table-responsive-container">
                                <table className="atelier-data-table">
                                    <thead>
                                        <tr>
                                            <th>Order Ref</th>
                                            <th>Patron Credentials</th>
                                            <th>Piece & Timber</th>
                                            <th>Destination</th>
                                            <th>Total (Rs.)</th>
                                            <th>Payment Method</th>
                                            <th>Workflow Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((o) => (
                                            <tr key={o._id}>
                                                <td>
                                                    <span className="ref-hash-pill">
                                                        #{(o._id || '').slice(-6).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="patron-cell-group">
                                                        <div className="patron-avatar-initials">
                                                            {getInitials(o.customerName)}
                                                        </div>
                                                        <div className="patron-details-stack">
                                                            <span className="patron-name">{o.customerName}</span>
                                                            <span className="patron-meta-sub">{o.phone}</span>
                                                            <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>{o.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{o.productName}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--gold)' }}>
                                                        {o.woodSpec ? `Timber: ${o.woodSpec}` : 'Custom Live-Edge'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{o.cityDistrict || 'Western Province'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.address}</div>
                                                    {o.deliveryDistanceKm > 0 && (
                                                        <span style={{ fontSize: '10.5px', color: 'var(--gold-light)' }}>
                                                            {o.deliveryDistanceKm} km from Moratuwa
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 700, color: 'var(--gold-light)' }}>
                                                        Rs. {(o.totalPrice || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="payment-badge-pill">
                                                        {(o.paymentMethod || 'card').replace('_', ' ')}
                                                    </div>
                                                    {o.receiptUrl && (
                                                        <div>
                                                            <button
                                                                type="button"
                                                                className="slip-trigger-btn"
                                                                onClick={() => setSlipModalUrl(o.receiptUrl)}
                                                            >
                                                                <i className="fas fa-file-invoice"></i>
                                                                <span>View Slip</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <select
                                                        className="table-status-select"
                                                        value={o.status || 'pending'}
                                                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                                                    >
                                                        <option value="pending">● Pending</option>
                                                        <option value="in_production">● In Production</option>
                                                        <option value="ready_for_delivery">● Ready for Delivery</option>
                                                        <option value="delivered">● Delivered</option>
                                                        <option value="cancelled">● Cancelled</option>
                                                    </select>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="action-buttons-group">
                                                        <a
                                                            href={`https://wa.me/${(o.phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(o.customerName)},%20this%20is%20Lansakara%20Artisans%20regarding%20your%20bespoke%20order%20%23${(o._id || '').slice(-6).toUpperCase()}.`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-action-circle btn-action-whatsapp"
                                                            title="WhatsApp Customer"
                                                        >
                                                            <i className="fab fa-whatsapp"></i>
                                                        </a>
                                                        <button
                                                            type="button"
                                                            className="btn-action-circle btn-action-delete"
                                                            onClick={() => handleDeleteOrder(o._id)}
                                                            title="Delete Order Record"
                                                        >
                                                            <i className="fas fa-trash-can"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan="8">
                                                    <div className="empty-state-luxury">
                                                        <i className="fas fa-filter empty-state-icon"></i>
                                                        <h4 className="empty-state-title">No Orders Match Current Filter</h4>
                                                        <p className="empty-state-sub">Try clearing the search box or selecting another order status tab.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═════════ 4. SETTINGS & PRICING ═════════ */}
                    {activeSection === 'settings' && (
                        <div>
                            {settingsNotice && (
                                <div className="settings-toast-banner" role="alert">
                                    <i className="fas fa-circle-check" style={{ fontSize: '18px' }}></i>
                                    <span>{settingsNotice}</span>
                                </div>
                            )}

                            <form onSubmit={handleSaveSettings} className="settings-grid-layout">
                                {/* Card 1: Commercial Rules */}
                                <div className="settings-card-panel">
                                    <h4 className="settings-section-heading">
                                        <i className="fas fa-coins" style={{ color: 'var(--gold)' }}></i>
                                        Commercial & Commission Parameters
                                    </h4>
                                    <p className="settings-section-desc">
                                        Configure store-wide automatic discount rules and customized transport calculations.
                                    </p>

                                    <div className="form-field-stack">
                                        <div className="form-input-group">
                                            <label className="form-label-title">Online Card Payment Discount (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="50"
                                                className="form-control-luxury"
                                                value={settings.cardDiscountPercent}
                                                onChange={(e) => setSettings({ ...settings, cardDiscountPercent: parseFloat(e.target.value) || 0 })}
                                            />
                                            <span className="form-helper-note">Instantly applied at checkout when client selects Credit/Debit card.</span>
                                        </div>

                                        <div className="form-input-group">
                                            <label className="form-label-title">Delivery Rate per Kilometer (Rs.)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control-luxury"
                                                value={settings.deliveryRatePerKm}
                                                onChange={(e) => setSettings({ ...settings, deliveryRatePerKm: parseFloat(e.target.value) || 0 })}
                                            />
                                            <span className="form-helper-note">Computed dynamically from the Moratuwa master workshop.</span>
                                        </div>

                                        <div className="form-input-group">
                                            <label className="form-label-title">Cash-on-Delivery Advance Deposit (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="90"
                                                className="form-control-luxury"
                                                value={settings.codAdvancePercent}
                                                onChange={(e) => setSettings({ ...settings, codAdvancePercent: parseFloat(e.target.value) || 0 })}
                                            />
                                            <span className="form-helper-note">Upfront timber commitment deposit required for COD commissions.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Bank Account Details */}
                                <div className="settings-card-panel">
                                    <h4 className="settings-section-heading">
                                        <i className="fas fa-building-columns" style={{ color: 'var(--gold)' }}></i>
                                        Atelier Bank Wire Details (Public Checkout)
                                    </h4>
                                    <p className="settings-section-desc">
                                        Displayed directly on the customer checkout portal for direct manual wire transfer orders.
                                    </p>

                                    <div className="form-field-stack">
                                        <div className="form-input-group">
                                            <label className="form-label-title">Bank Institution Name</label>
                                            <input
                                                type="text"
                                                className="form-control-luxury"
                                                value={settings.bankDetails?.bankName || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    bankDetails: { ...settings.bankDetails, bankName: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="form-input-group">
                                            <label className="form-label-title">Official Beneficiary Account Name</label>
                                            <input
                                                type="text"
                                                className="form-control-luxury"
                                                value={settings.bankDetails?.accountName || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    bankDetails: { ...settings.bankDetails, accountName: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="form-input-group">
                                            <label className="form-label-title">Account Number</label>
                                            <input
                                                type="text"
                                                className="form-control-luxury"
                                                value={settings.bankDetails?.accountNumber || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    bankDetails: { ...settings.bankDetails, accountNumber: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="form-input-group">
                                            <label className="form-label-title">Branch Location</label>
                                            <input
                                                type="text"
                                                className="form-control-luxury"
                                                value={settings.bankDetails?.branch || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    bankDetails: { ...settings.bankDetails, branch: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div style={{ marginTop: '12px' }}>
                                            <button type="submit" className="btn-gold-primary" disabled={savingSettings}>
                                                <i className="fas fa-floppy-disk"></i>
                                                <span>{savingSettings ? 'Publishing Settings...' : 'Save & Publish Rules'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ═════════ 5. PATRON REVIEWS ═════════ */}
                    {activeSection === 'reviews' && (
                        <div className="atelier-panel-card">
                            <div className="panel-header-row">
                                <div className="panel-title-group">
                                    <h3 className="panel-title">Patron Reflections & Testimonials</h3>
                                    <span className="panel-subtitle">Verified feedback submitted by clients displayed on the public Lansakara homepage slider</span>
                                </div>
                            </div>

                            <div className="table-responsive-container">
                                <table className="atelier-data-table">
                                    <thead>
                                        <tr>
                                            <th>Patron</th>
                                            <th>Star Rating</th>
                                            <th>Location & Piece</th>
                                            <th>Testimonial Reflection</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map((r) => (
                                            <tr key={r._id || r.id}>
                                                <td>
                                                    <div className="patron-cell-group">
                                                        <div className="patron-avatar-initials">
                                                            {getInitials(r.authorName)}
                                                        </div>
                                                        <div className="patron-details-stack">
                                                            <span className="patron-name">{r.authorName}</span>
                                                            <span className="patron-meta-sub">{r.authorEmail}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '14px' }}>
                                                        {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{r.location || 'Colombo, Sri Lanka'}</div>
                                                    <span style={{ fontSize: '11px', color: 'var(--gold-light)' }}>
                                                        {r.productPurchased || 'Bespoke Solid Wood Piece'}
                                                    </span>
                                                </td>
                                                <td style={{ maxWidth: '340px' }}>
                                                    <p style={{ fontStyle: 'italic', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                        “{r.quote}”
                                                    </p>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        type="button"
                                                        className="btn-action-circle btn-action-delete"
                                                        onClick={() => handleReviewAction(r._id || r.id, 'delete')}
                                                        title="Remove Patron Review"
                                                    >
                                                        <i className="fas fa-trash-can"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {reviews.length === 0 && (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="empty-state-luxury">
                                                        <i className="fas fa-star empty-state-icon"></i>
                                                        <h4 className="empty-state-title">No Patron Reflections Yet</h4>
                                                        <p className="empty-state-sub">New feedback submitted on the public atelier will appear here for review.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ═════════ SLIP PREVIEW LIGHTBOX MODAL ═════════ */}
            {slipModalUrl && (
                <div className="modal-overlay-backdrop" onClick={() => setSlipModalUrl(null)}>
                    <div className="modal-window-luxury" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', textAlign: 'center' }}>
                        <div className="modal-header-luxury">
                            <h4 className="modal-title-text">Verified Bank Transfer Slip</h4>
                            <button
                                type="button"
                                className="btn-close-modal"
                                onClick={() => setSlipModalUrl(null)}
                                aria-label="Close Preview"
                            >
                                <i className="fas fa-xmark"></i>
                            </button>
                        </div>
                        <img
                            src={slipModalUrl}
                            alt="Bank Transfer Receipt"
                            style={{
                                width: '100%',
                                maxHeight: '65vh',
                                objectFit: 'contain',
                                borderRadius: '10px',
                                border: '1px solid var(--gold-border)'
                            }}
                        />
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <a
                                href={slipModalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-gold-primary"
                                style={{ padding: '8px 18px', fontSize: '12px' }}
                            >
                                <i className="fas fa-arrow-up-right-from-square"></i>
                                <span>Open Full Resolution</span>
                            </a>
                            <button
                                type="button"
                                className="btn-sidebar-secondary"
                                onClick={() => setSlipModalUrl(null)}
                                style={{ width: 'auto', padding: '8px 18px' }}
                            >
                                <span>Close Lightbox</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════ ADD PRODUCT MODAL ═════════ */}
            {showProductModal && (
                <div className="modal-overlay-backdrop">
                    <div className="modal-window-luxury">
                        <div className="modal-header-luxury">
                            <h3 className="modal-title-text">Publish New Solid Wood Masterpiece</h3>
                            <button
                                type="button"
                                className="btn-close-modal"
                                onClick={() => setShowProductModal(false)}
                                aria-label="Close Modal"
                            >
                                <i className="fas fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="form-field-stack">
                            <div className="form-input-group">
                                <label className="form-label-title">Product Title *</label>
                                <input
                                    type="text"
                                    className="form-control-luxury"
                                    required
                                    placeholder="e.g. Royal Ceylon Dining Suite"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-input-group">
                                    <label className="form-label-title">Collection Category</label>
                                    <select
                                        className="form-control-luxury"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                    >
                                        <option value="dining">Dining & Chairs</option>
                                        <option value="living">Living & Lounges</option>
                                        <option value="tables">Coffee & Accent Tables</option>
                                        <option value="bedroom">Bedrooms & Suites</option>
                                    </select>
                                </div>
                                <div className="form-input-group">
                                    <label className="form-label-title">Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        className="form-control-luxury"
                                        required
                                        placeholder="285000"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-input-group">
                                    <label className="form-label-title">Timber Species</label>
                                    <input
                                        type="text"
                                        className="form-control-luxury"
                                        placeholder="Solid Teak / Red Mahogany"
                                        value={productForm.woodType}
                                        onChange={(e) => setProductForm({ ...productForm, woodType: e.target.value })}
                                    />
                                </div>
                                <div className="form-input-group">
                                    <label className="form-label-title">Badge Tag</label>
                                    <input
                                        type="text"
                                        className="form-control-luxury"
                                        placeholder="New Arrival / Heirloom"
                                        value={productForm.badge}
                                        onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-input-group">
                                <label className="form-label-title">Short Specification Description</label>
                                <input
                                    type="text"
                                    className="form-control-luxury"
                                    placeholder="Hand-Hewn Mortise & Tenon Joinery • Living Edge"
                                    value={productForm.shortDescription}
                                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                                />
                            </div>

                            <div className="form-input-group">
                                <label className="form-label-title">Upload High-Res Photograph</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control-luxury"
                                    onChange={(e) => setProductImageFile(e.target.files[0])}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                                <button
                                    type="button"
                                    className="btn-sidebar-secondary"
                                    style={{ width: 'auto', padding: '10px 20px' }}
                                    onClick={() => setShowProductModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-gold-primary"
                                    disabled={savingProduct}
                                >
                                    {savingProduct ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Adding to Collection...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-plus"></i>
                                            <span>Publish to Catalog</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
