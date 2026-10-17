'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
    // Auth State
    const [token, setToken] = useState(null);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    // Active Section: 'dashboard' | 'products' | 'orders' | 'settings' | 'reviews'
    const [activeSection, setActiveSection] = useState('dashboard');

    // Data States
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

    // Orders Filter
    const [orderFilter, setOrderFilter] = useState('all');
    const [orderSearch, setOrderSearch] = useState('');

    // Modals
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
        badge: '',
        featured: false,
        inStock: true
    });
    const [productImageFile, setProductImageFile] = useState(null);
    const [savingProduct, setSavingProduct] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsNotice, setSettingsNotice] = useState('');

    // Check token on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('lansakara_admin_token');
            if (saved) {
                setToken(saved);
            }
        }
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

    // Handle Login
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

    // Handle Logout
    const handleLogout = () => {
        setToken(null);
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('lansakara_admin_token');
        }
    };

    // Update Order Status
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

    // Delete Order
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

    // Save Settings
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
                setSettingsNotice('✓ Settings & Pricing successfully updated!');
                setTimeout(() => setSettingsNotice(''), 3000);
            } else {
                alert(data.error || 'Failed to update settings');
            }
        } catch (err) {
            alert('Error updating settings: ' + err.message);
        } finally {
            setSavingSettings(false);
        }
    };

    // Save Product (Create or Edit)
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

    // Delete Product
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

    // Review Actions
    const handleReviewAction = async (reviewId, action) => {
        try {
            if (action === 'delete') {
                if (!confirm('Permanently delete this patron review?')) return;
                const res = await fetch(`/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (res.ok) {
                    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                }
            } else {
                // In dual storage, delete or update status
                const res = await fetch(`/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (res.ok) {
                    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                }
            }
        } catch (err) {
            alert('Error updating review: ' + err.message);
        }
    };

    // Filtered orders
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

    // ──────────────────────────────────────────
    // IF NOT AUTHENTICATED: RENDER LOGIN SCREEN
    // ──────────────────────────────────────────
    if (!token) {
        return (
            <div id="loginPage" style={{ display: 'flex' }}>
                <div className="login-card">
                    <div className="login-logo">
                        <div className="brand">LANSAKARA</div>
                        <div className="sub">Artisan Admin Portal</div>
                    </div>

                    {loginError && <div className="login-error" style={{ display: 'block' }}>{loginError}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter admin username"
                                required
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                required
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-login" disabled={loggingIn}>
                            {loggingIn ? 'Authenticating...' : 'Sign In to Portal'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link href="/" style={{ fontSize: '12px', color: 'var(--gold)', textDecoration: 'none' }}>
                            ← Back to Lansakara Public Atelier
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ──────────────────────────────────────────
    // AUTHENTICATED: RENDER FULL ADMIN DASHBOARD
    // ──────────────────────────────────────────
    return (
        <div id="mainApp" style={{ display: 'flex' }}>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">LANSAKARA</div>
                    <div className="sidebar-sub">Royal Woodcraft Admin</div>
                </div>

                <div className="sidebar-nav">
                    <div className="nav-label">Management</div>

                    <div
                        className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveSection('dashboard')}
                    >
                        <i className="fas fa-th-large"></i> Dashboard
                    </div>

                    <div
                        className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveSection('products')}
                    >
                        <i className="fas fa-couch"></i> Catalog Products
                    </div>

                    <div
                        className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveSection('orders')}
                    >
                        <i className="fas fa-clipboard-list"></i> Bespoke Orders
                        {stats.pendingOrders > 0 && (
                            <span className="badge" style={{ display: 'inline-block' }}>
                                {stats.pendingOrders}
                            </span>
                        )}
                    </div>

                    <div
                        className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('settings')}
                    >
                        <i className="fas fa-sliders-h"></i> Settings & Pricing
                    </div>

                    <div
                        className={`nav-item ${activeSection === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveSection('reviews')}
                    >
                        <i className="fas fa-star"></i> Patron Reviews
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="btn-logout" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout Portal
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {/* Top Bar */}
                <div className="top-bar">
                    <h2 className="page-title" style={{ textTransform: 'capitalize' }}>
                        {activeSection === 'dashboard' && 'Executive Workshop Overview'}
                        {activeSection === 'products' && 'Catalog & Masterwork Collection'}
                        {activeSection === 'orders' && 'Bespoke Patron Orders'}
                        {activeSection === 'settings' && 'Delivery, Discounts & Bank Settings'}
                        {activeSection === 'reviews' && 'Patron Reviews & Reflections'}
                    </h2>
                    <div className="top-bar-right">
                        <Link href="/" target="_blank" className="nav-item" style={{ fontSize: '12px' }}>
                            <i className="fas fa-external-link-alt"></i> View Live Atelier
                        </Link>
                        <div className="admin-badge">
                            <i className="fas fa-user-shield" style={{ color: 'var(--gold)', marginRight: '6px' }}></i>
                            <span>Master Artisan</span>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
                    {/* ═════════ SECTION 1: DASHBOARD ═════════ */}
                    {activeSection === 'dashboard' && (
                        <div>
                            {/* Stats Cards */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '20px',
                                    marginBottom: '32px'
                                }}
                            >
                                <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</div>
                                    <div style={{ fontSize: '24px', color: 'var(--gold)', fontWeight: 700, marginTop: '8px' }}>
                                        Rs. {(stats.totalRevenue || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bespoke Orders</div>
                                    <div style={{ fontSize: '24px', color: 'var(--text)', fontWeight: 700, marginTop: '8px' }}>
                                        {stats.totalOrders || orders.length}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Review</div>
                                    <div style={{ fontSize: '24px', color: 'var(--orange)', fontWeight: 700, marginTop: '8px' }}>
                                        {stats.pendingOrders || orders.filter(o => o.status === 'pending').length}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Production</div>
                                    <div style={{ fontSize: '24px', color: 'var(--blue)', fontWeight: 700, marginTop: '8px' }}>
                                        {stats.inProduction || orders.filter(o => o.status === 'in_production').length}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Catalog Pieces</div>
                                    <div style={{ fontSize: '24px', color: 'var(--text)', fontWeight: 700, marginTop: '8px' }}>
                                        {products.length}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders Overview */}
                            <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: 'var(--gold)' }}>
                                        Recent Bespoke Inquiries & Orders
                                    </h3>
                                    <button
                                        onClick={() => setActiveSection('orders')}
                                        style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        View All ({orders.length}) →
                                    </button>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                                <th style={{ padding: '12px 16px' }}>Order ID</th>
                                                <th style={{ padding: '12px 16px' }}>Patron</th>
                                                <th style={{ padding: '12px 16px' }}>Product</th>
                                                <th style={{ padding: '12px 16px' }}>Total (Rs.)</th>
                                                <th style={{ padding: '12px 16px' }}>Method</th>
                                                <th style={{ padding: '12px 16px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map((o) => (
                                                <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 600 }}>
                                                        #{(o._id || '').slice(-6).toUpperCase()}
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }}>{o.customerName}</td>
                                                    <td style={{ padding: '12px 16px' }}>{o.productName}</td>
                                                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                                                        Rs. {(o.totalPrice || 0).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                                                        {o.paymentMethod || 'card'}
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <span
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '12px',
                                                                fontSize: '11px',
                                                                textTransform: 'uppercase',
                                                                background:
                                                                    o.status === 'delivered'
                                                                        ? 'rgba(76,175,80,0.15)'
                                                                        : o.status === 'in_production'
                                                                            ? 'rgba(66,165,245,0.15)'
                                                                            : 'rgba(255,152,0,0.15)',
                                                                color:
                                                                    o.status === 'delivered'
                                                                        ? 'var(--green)'
                                                                        : o.status === 'in_production'
                                                                            ? 'var(--blue)'
                                                                            : 'var(--orange)'
                                                            }}
                                                        >
                                                            {(o.status || 'pending').replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        No orders received yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═════════ SECTION 2: PRODUCTS ═════════ */}
                    {activeSection === 'products' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                    Manage solid wood products displayed on the public catalog with full CRUD & image uploads.
                                </p>
                                <button
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
                                    style={{
                                        background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                                        color: '#000',
                                        border: 'none',
                                        padding: '10px 18px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fas fa-plus"></i> Add New Masterpiece
                                </button>
                            </div>

                            <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--dark-4)' }}>
                                            <th style={{ padding: '14px 18px' }}>Thumbnail</th>
                                            <th style={{ padding: '14px 18px' }}>Product Name</th>
                                            <th style={{ padding: '14px 18px' }}>Category</th>
                                            <th style={{ padding: '14px 18px' }}>Timber Spec</th>
                                            <th style={{ padding: '14px 18px' }}>Price (Rs.)</th>
                                            <th style={{ padding: '14px 18px' }}>Badge</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => {
                                            const thumb = p.images && p.images[0] ? p.images[0] : '/images/wood_09.jpg';
                                            return (
                                                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <img
                                                            src={thumb}
                                                            alt={p.name}
                                                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                                                            onError={(e) => { e.currentTarget.src = '/images/wood_09.jpg'; }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>{p.name}</td>
                                                    <td style={{ padding: '14px 18px', textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                        {p.category}
                                                    </td>
                                                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                                                        {p.woodType || p.shortDescription}
                                                    </td>
                                                    <td style={{ padding: '14px 18px', color: 'var(--gold)', fontWeight: 600 }}>
                                                        Rs. {(p.price || 0).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '14px 18px' }}>
                                                        {p.badge && (
                                                            <span style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', padding: '3px 8px', borderRadius: '10px', fontSize: '11px' }}>
                                                                {p.badge}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => handleDeleteProduct(p._id, p.name)}
                                                            style={{ background: 'rgba(239,83,80,0.15)', border: '1px solid rgba(239,83,80,0.3)', color: '#EF9A9A', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                                        >
                                                            <i className="fas fa-trash"></i> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═════════ SECTION 3: ORDERS ═════════ */}
                    {activeSection === 'orders' && (
                        <div>
                            {/* Filter bar */}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search by patron name, phone, order ID..."
                                    style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '8px', color: '#fff', minWidth: '260px' }}
                                    value={orderSearch}
                                    onChange={(e) => setOrderSearch(e.target.value)}
                                />

                                {['all', 'pending', 'in_production', 'ready_for_delivery', 'delivered', 'cancelled'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setOrderFilter(st)}
                                        style={{
                                            background: orderFilter === st ? 'rgba(201,168,76,0.2)' : 'var(--dark-3)',
                                            color: orderFilter === st ? 'var(--gold)' : 'var(--text-muted)',
                                            border: '1px solid var(--border)',
                                            padding: '8px 14px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {st.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>

                            {/* Orders Table */}
                            <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--dark-4)' }}>
                                            <th style={{ padding: '14px 18px' }}>Order Ref</th>
                                            <th style={{ padding: '14px 18px' }}>Patron</th>
                                            <th style={{ padding: '14px 18px' }}>Piece & Details</th>
                                            <th style={{ padding: '14px 18px' }}>Delivery Destination</th>
                                            <th style={{ padding: '14px 18px' }}>Total (Rs.)</th>
                                            <th style={{ padding: '14px 18px' }}>Payment</th>
                                            <th style={{ padding: '14px 18px' }}>Status Update</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((o) => (
                                            <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '14px 18px', color: 'var(--gold)', fontWeight: 600 }}>
                                                    #{(o._id || '').slice(-6).toUpperCase()}
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.phone}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{o.email}</div>
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontWeight: 500 }}>{o.productName}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                        {o.woodSpec ? `Wood: ${o.woodSpec}` : ''}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div>{o.cityDistrict}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.address}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--gold)' }}>{o.deliveryDistanceKm} km</div>
                                                </td>
                                                <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                                                    Rs. {(o.totalPrice || 0).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <span style={{ textTransform: 'capitalize' }}>
                                                        {(o.paymentMethod || 'card').replace('_', ' ')}
                                                    </span>
                                                    {o.receiptUrl && (
                                                        <div style={{ marginTop: '4px' }}>
                                                            <button
                                                                onClick={() => setSlipModalUrl(o.receiptUrl)}
                                                                style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                                                            >
                                                                <i className="fas fa-file-invoice"></i> View Slip
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <select
                                                        value={o.status || 'pending'}
                                                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                                                        style={{ background: 'var(--dark-4)', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in_production">In Production</option>
                                                        <option value="ready_for_delivery">Ready for Delivery</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                    <a
                                                        href={`https://wa.me/${(o.phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(o.customerName)},%20this%20is%20Lansakara%20Artisans%20regarding%20your%20bespoke%20order%20%23${(o._id || '').slice(-6).toUpperCase()}.`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)', padding: '6px 10px', borderRadius: '6px', marginRight: '6px', textDecoration: 'none', display: 'inline-block', fontSize: '12px' }}
                                                    >
                                                        <i className="fab fa-whatsapp"></i>
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteOrder(o._id)}
                                                        style={{ background: 'rgba(239,83,80,0.15)', border: '1px solid rgba(239,83,80,0.3)', color: '#EF9A9A', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═════════ SECTION 4: SETTINGS & PRICING ═════════ */}
                    {activeSection === 'settings' && (
                        <div style={{ maxWidth: '800px', background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--gold)', marginBottom: '16px' }}>
                                Store Pricing & Commission Configurations
                            </h3>

                            {settingsNotice && (
                                <div style={{ background: 'rgba(76,175,80,0.2)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                                    {settingsNotice}
                                </div>
                            )}

                            <form onSubmit={handleSaveSettings}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Online Card Discount (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            className="form-control"
                                            value={settings.cardDiscountPercent}
                                            onChange={(e) => setSettings({ ...settings, cardDiscountPercent: parseFloat(e.target.value) || 0 })}
                                        />
                                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                                            Applied immediately upon selecting Credit/Debit Card.
                                        </span>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Delivery Rate per km (Rs.)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            value={settings.deliveryRatePerKm}
                                            onChange={(e) => setSettings({ ...settings, deliveryRatePerKm: parseFloat(e.target.value) || 0 })}
                                        />
                                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                                            Charged per kilometer from the Moratuwa atelier.
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        COD Advance Deposit (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="90"
                                        className="form-control"
                                        value={settings.codAdvancePercent}
                                        onChange={(e) => setSettings({ ...settings, codAdvancePercent: parseFloat(e.target.value) || 0 })}
                                    />
                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                                        Minimum upfront transfer required for Cash-on-Delivery bespoke commissions.
                                    </span>
                                </div>

                                <h4 style={{ color: 'var(--gold)', fontSize: '15px', marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                    Bank Transfer Details (Displayed on Checkout)
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Bank Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={settings.bankDetails?.bankName || ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                bankDetails: { ...settings.bankDetails, bankName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Account Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={settings.bankDetails?.accountName || ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                bankDetails: { ...settings.bankDetails, accountName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Account Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={settings.bankDetails?.accountNumber || ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                bankDetails: { ...settings.bankDetails, accountNumber: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Branch</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={settings.bankDetails?.branch || ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                bankDetails: { ...settings.bankDetails, branch: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    style={{
                                        background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                                        color: '#000',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {savingSettings ? 'Saving...' : 'Save & Publish Settings'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ═════════ SECTION 5: REVIEWS ═════════ */}
                    {activeSection === 'reviews' && (
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                                Verified patron reflections submitted from the public homepage. Each patron is limited to 1 review.
                            </p>

                            <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--dark-4)' }}>
                                            <th style={{ padding: '14px 18px' }}>Patron</th>
                                            <th style={{ padding: '14px 18px' }}>Rating</th>
                                            <th style={{ padding: '14px 18px' }}>Location & Piece</th>
                                            <th style={{ padding: '14px 18px' }}>Review Quote</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map((r) => (
                                            <tr key={r._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontWeight: 600 }}>{r.authorName}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.authorEmail}</div>
                                                </td>
                                                <td style={{ padding: '14px 18px', color: 'var(--gold)' }}>
                                                    {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div>{r.location || 'Sri Lanka'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--gold)' }}>{r.productPurchased}</div>
                                                </td>
                                                <td style={{ padding: '14px 18px', maxWidth: '300px' }}>
                                                    “{r.quote}”
                                                </td>
                                                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleReviewAction(r._id, 'delete')}
                                                        style={{ background: 'rgba(239,83,80,0.15)', border: '1px solid rgba(239,83,80,0.3)', color: '#EF9A9A', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        <i className="fas fa-trash"></i> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {reviews.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No patron reviews registered yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ═════════ SLIP PREVIEW MODAL ═════════ */}
            {slipModalUrl && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.85)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px'
                    }}
                    onClick={() => setSlipModalUrl(null)}
                >
                    <div
                        style={{
                            background: 'var(--dark-3)',
                            padding: '24px',
                            borderRadius: '12px',
                            maxWidth: '700px',
                            width: '100%',
                            textAlign: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 style={{ color: 'var(--gold)', marginBottom: '16px' }}>Attached Transfer Receipt Slip</h4>
                        <img
                            src={slipModalUrl}
                            alt="Slip Preview"
                            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
                        />
                        <div style={{ marginTop: '16px' }}>
                            <button
                                onClick={() => setSlipModalUrl(null)}
                                style={{ background: 'var(--dark-4)', color: '#fff', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════ ADD PRODUCT MODAL ═════════ */}
            {showProductModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.85)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px'
                    }}
                >
                    <div
                        style={{
                            background: 'var(--dark-3)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            maxWidth: '650px',
                            width: '100%',
                            padding: '32px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: 'var(--gold)', marginBottom: '20px' }}>
                            Add New Solid Wood Piece
                        </h3>

                        <form onSubmit={handleSaveProduct}>
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    placeholder="e.g. Royal Ceylon Dining Table"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        className="form-control"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                    >
                                        <option value="dining">Dining & Chairs</option>
                                        <option value="living">Living & Lounges</option>
                                        <option value="tables">Coffee & Accent Tables</option>
                                        <option value="bedroom">Bedrooms & Suites</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        required
                                        placeholder="285000"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Timber Species</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Solid Teak / Red Mahogany"
                                        value={productForm.woodType}
                                        onChange={(e) => setProductForm({ ...productForm, woodType: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Badge Tag</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="New Arrival / Heirloom"
                                        value={productForm.badge}
                                        onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Short Description</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Master Carving • Traditional Mortise Joinery"
                                    value={productForm.shortDescription}
                                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Upload Product Photograph</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={(e) => setProductImageFile(e.target.files[0])}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowProductModal(false)}
                                    style={{ background: 'var(--dark-4)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProduct}
                                    style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    {savingProduct ? 'Adding Piece...' : 'Publish to Catalog'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
