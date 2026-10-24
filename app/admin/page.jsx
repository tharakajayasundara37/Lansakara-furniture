'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
    // EXECUTIVE DASHBOARD DIAGRAMS & ANALYTICS STATE
    // ──────────────────────────────────────────
    const [chartPeriod, setChartPeriod] = useState('ALL'); // 'ALL' | '6M' | '30D'
    const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'volume'
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [dashboardStatusFilter, setDashboardStatusFilter] = useState('all');

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

    
    // ──────────────────────────────────────────
    // REAL-TIME ANALYTICS COMPUTATIONS (100% REAL DATA)
    // ──────────────────────────────────────────
    const realStats = useMemo(() => {
        const validOrders = orders.filter((o) => o.status !== 'cancelled');
        const grossRev = validOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
        const pipelineVal = orders
            .filter((o) => ['pending', 'accepted', 'processing', 'in_production', 'ready'].includes(o.status))
            .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
        const deliveredRev = orders
            .filter((o) => o.status === 'delivered')
            .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
        
        const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
        const pendingCount = orders.filter((o) => o.status === 'pending').length;
        const inProdCount = orders.filter((o) => ['accepted', 'processing', 'in_production', 'ready'].includes(o.status)).length;
        
        const aov = orders.length > 0 ? Math.round(grossRev / orders.length) : 0;
        const fulfillmentRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0;
        
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
            : '5.0';

        return {
            grossRev,
            pipelineVal,
            deliveredRev,
            deliveredCount,
            pendingCount,
            inProdCount,
            aov,
            fulfillmentRate,
            avgRating
        };
    }, [orders, reviews]);

    // Monthly Revenue & Commission Volume Curve Data
    const monthlyTrendData = useMemo(() => {
        const monthMap = {};

        // Populate months from orders or fallback to current & recent months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-US', { month: 'short' });
            monthMap[key] = { key, label, revenue: 0, orderCount: 0 };
        }

        orders.forEach((o) => {
            if (o.status === 'cancelled') return;
            const d = o.createdAt ? new Date(o.createdAt) : new Date();
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-US', { month: 'short' });

            if (!monthMap[key]) {
                monthMap[key] = { key, label, revenue: 0, orderCount: 0 };
            }
            monthMap[key].revenue += Number(o.totalPrice) || 0;
            monthMap[key].orderCount += 1;
        });

        const sortedKeys = Object.keys(monthMap).sort();
        // If '6M', take last 6; if 'ALL', take all
        const filteredKeys = chartPeriod === '6M' ? sortedKeys.slice(-6) : sortedKeys;

        return filteredKeys.map((k) => ({
            ...monthMap[k],
            avgOrderValue: monthMap[k].orderCount > 0 ? Math.round(monthMap[k].revenue / monthMap[k].orderCount) : 0
        }));
    }, [orders, chartPeriod]);

    // Donut Diagram: Order Status Distribution
    const pipelineDonut = useMemo(() => {
        const meta = {
            pending: { label: 'Pending Review', color: '#F59E0B', icon: 'fa-hourglass-half' },
            accepted: { label: 'Artisan Accepted', color: '#3B82F6', icon: 'fa-check' },
            in_production: { label: 'In Production', color: '#60A5FA', icon: 'fa-hammer' },
            processing: { label: 'Wood Seasoning', color: '#818CF8', icon: 'fa-tools' },
            ready: { label: 'Ready for Dispatch', color: '#A855F7', icon: 'fa-box-archive' },
            delivered: { label: 'Delivered', color: '#10B981', icon: 'fa-circle-check' },
            cancelled: { label: 'Cancelled', color: '#EF4444', icon: 'fa-xmark' }
        };

        const counts = {};
        const values = {};
        let total = 0;

        orders.forEach((o) => {
            const st = o.status || 'pending';
            counts[st] = (counts[st] || 0) + 1;
            values[st] = (values[st] || 0) + (Number(o.totalPrice) || 0);
            total += 1;
        });

        let cumulativeAngle = 0;
        const circumference = 2 * Math.PI * 72; // r=72 => ~452.39

        const segments = Object.keys(counts).map((st) => {
            const count = counts[st];
            const val = values[st] || 0;
            const percent = total > 0 ? (count / total) * 100 : 0;
            const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle;
            cumulativeAngle += (percent / 100) * circumference;

            return {
                status: st,
                label: meta[st]?.label || st,
                color: meta[st]?.color || '#D4AF37',
                icon: meta[st]?.icon || 'fa-circle',
                count,
                value: val,
                percent: Math.round(percent),
                strokeDasharray,
                strokeDashoffset
            };
        });

        return { segments, totalOrdersCount: total, circumference };
    }, [orders]);

    // Category Distribution from real products
    const categoryBreakdown = useMemo(() => {
        const map = {};
        let totalValue = 0;

        products.forEach((p) => {
            const cat = (p.category || 'other').toLowerCase();
            const price = Number(p.price) || 0;
            totalValue += price;

            if (!map[cat]) {
                map[cat] = { count: 0, totalValue: 0 };
            }
            map[cat].count += 1;
            map[cat].totalValue += price;
        });

        const list = Object.keys(map).map((cat) => ({
            category: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            count: map[cat].count,
            totalValue: map[cat].totalValue,
            percent: products.length > 0 ? Math.round((map[cat].count / products.length) * 100) : 0
        })).sort((a, b) => b.count - a.count);

        return { list, totalInventoryValue: totalValue };
    }, [products]);

    // Payment Methods Breakdown from real orders
    const paymentMethodsBreakdown = useMemo(() => {
        const meta = {
            card: { label: 'Online Card (Visa/MC)', color: '#10B981', icon: 'fa-credit-card' },
            bank_transfer: { label: 'Direct Bank Wire', color: '#3B82F6', icon: 'fa-building-columns' },
            cod: { label: 'Cash on Delivery (Advance)', color: '#F59E0B', icon: 'fa-hand-holding-dollar' }
        };

        const map = {};
        let totalVal = 0;

        orders.forEach((o) => {
            const method = o.paymentMethod || 'card';
            const price = Number(o.totalPrice) || 0;
            totalVal += price;

            if (!map[method]) {
                map[method] = { count: 0, value: 0 };
            }
            map[method].count += 1;
            map[method].value += price;
        });

        return Object.keys(map).map((m) => {
            const cMeta = meta[m] || { label: m.toUpperCase(), color: '#D4AF37', icon: 'fa-receipt' };
            const count = map[m].count;
            const val = map[m].value;
            const percent = totalVal > 0 ? Math.round((val / totalVal) * 100) : 0;
            return {
                method: m,
                label: cMeta.label,
                color: cMeta.color,
                icon: cMeta.icon,
                count,
                value: val,
                percent
            };
        }).sort((a, b) => b.value - a.value);
    }, [orders]);


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
                            {/* Metric Cards Grid - Real-time & Accurate */}
                            <div className="stats-grid-luxury">
                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Workshop Revenue</span>
                                        <div className="stat-icon-badge stat-icon-gold">
                                            <i className="fas fa-coins"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value highlight-gold">
                                        Rs. {realStats.grossRev.toLocaleString()}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-check-circle" style={{ color: 'var(--emerald)' }}></i>
                                        <span>Verified Customer Billings</span>
                                    </div>
                                </div>

                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Active Pipeline</span>
                                        <div className="stat-icon-badge stat-icon-blue">
                                            <i className="fas fa-hammer"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value" style={{ color: 'var(--gold-light)' }}>
                                        Rs. {realStats.pipelineVal.toLocaleString()}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-boxes-stacked" style={{ color: 'var(--blue)' }}></i>
                                        <span>{realStats.inProdCount + realStats.pendingCount} Commissions in Progress</span>
                                    </div>
                                </div>

                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Bespoke Orders</span>
                                        <div className="stat-icon-badge stat-icon-amber">
                                            <i className="fas fa-clipboard-check"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value">
                                        {orders.length}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-hourglass-half" style={{ color: 'var(--amber)' }}></i>
                                        <span>{realStats.pendingCount} Requires Artisan Review</span>
                                    </div>
                                </div>

                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Avg. Commission (AOV)</span>
                                        <div className="stat-icon-badge stat-icon-emerald">
                                            <i className="fas fa-receipt"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value" style={{ color: 'var(--emerald)' }}>
                                        Rs. {realStats.aov.toLocaleString()}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-chart-line" style={{ color: 'var(--emerald)' }}></i>
                                        <span>Fulfillment Rate: {realStats.fulfillmentRate}%</span>
                                    </div>
                                </div>

                                <div className="stat-card-luxury">
                                    <div className="stat-top-row">
                                        <span className="stat-title">Catalog Pieces</span>
                                        <div className="stat-icon-badge stat-icon-gold">
                                            <i className="fas fa-couch"></i>
                                        </div>
                                    </div>
                                    <div className="stat-number-value">
                                        {products.length}
                                    </div>
                                    <div className="stat-footer-tag">
                                        <i className="fas fa-star" style={{ color: 'var(--gold)' }}></i>
                                        <span>Reviews: {realStats.avgRating} / 5.0 ★</span>
                                    </div>
                                </div>
                            </div>

                            {/* ═════════ REAL-DATA DIAGRAMS SUITE ═════════ */}
                            {/* DIAGRAM ROW 1: Monthly Revenue Timeline & Status Pipeline Donut */}
                            <div className="analytics-grid-two-col">
                                {/* Diagram 1: Monthly Timeline Area Chart */}
                                <div className="chart-panel-card">
                                    <div className="chart-header-row">
                                        <div className="chart-title-group">
                                            <h4>
                                                <i className="fas fa-chart-area" style={{ color: 'var(--gold)' }}></i>
                                                Workshop Revenue & Commission Trajectory
                                            </h4>
                                            <p>Real-time monthly revenue and commissioned volume across all atelier orders</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div className="chart-pills-filter">
                                                <button
                                                    type="button"
                                                    className={`chart-pill-btn ${chartMetric === 'revenue' ? 'active' : ''}`}
                                                    onClick={() => setChartMetric('revenue')}
                                                >
                                                    Revenue (LKR)
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`chart-pill-btn ${chartMetric === 'volume' ? 'active' : ''}`}
                                                    onClick={() => setChartMetric('volume')}
                                                >
                                                    Orders Count
                                                </button>
                                            </div>

                                            <div className="chart-pills-filter">
                                                <button
                                                    type="button"
                                                    className={`chart-pill-btn ${chartPeriod === '6M' ? 'active' : ''}`}
                                                    onClick={() => setChartPeriod('6M')}
                                                >
                                                    6M
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`chart-pill-btn ${chartPeriod === 'ALL' ? 'active' : ''}`}
                                                    onClick={() => setChartPeriod('ALL')}
                                                >
                                                    All Time
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SVG Area & Spline Diagram */}
                                    <div className="chart-svg-container" style={{ position: 'relative' }}>
                                        {(() => {
                                            const data = monthlyTrendData;
                                            const svgW = 620;
                                            const svgH = 220;
                                            const padL = 60;
                                            const padR = 25;
                                            const padT = 20;
                                            const padB = 35;
                                            const plotW = svgW - padL - padR;
                                            const plotH = svgH - padT - padB;

                                            const values = data.map((d) => (chartMetric === 'revenue' ? d.revenue : d.orderCount));
                                            const maxVal = Math.max(...values, chartMetric === 'revenue' ? 200000 : 5);
                                            const stepY = maxVal / 3;

                                            const points = data.map((d, i) => {
                                                const x = padL + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
                                                const val = chartMetric === 'revenue' ? d.revenue : d.orderCount;
                                                const y = padT + plotH - (val / maxVal) * plotH;
                                                return { ...d, x, y, val };
                                            });

                                            // Construct Area Path and Stroke Line Path
                                            const linePath = points.reduce((acc, pt, idx) => {
                                                return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                                            }, '');

                                            const areaPath = points.length > 0
                                                ? `${linePath} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`
                                                : '';

                                            return (
                                                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="chart-svg-elem">
                                                    <defs>
                                                        <linearGradient id="chartGoldGlow" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
                                                            <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.08" />
                                                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                                                        </linearGradient>
                                                        <linearGradient id="chartStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#F4E4BA" />
                                                            <stop offset="50%" stopColor="#D4AF37" />
                                                            <stop offset="100%" stopColor="#C5A880" />
                                                        </linearGradient>
                                                    </defs>

                                                    {/* Y-Axis Gridlines */}
                                                    {[0, 1, 2, 3].map((g) => {
                                                        const y = padT + plotH - (g / 3) * plotH;
                                                        const valLabel = chartMetric === 'revenue'
                                                            ? `Rs. ${Math.round((g * stepY) / 1000)}k`
                                                            : Math.round(g * stepY);
                                                        return (
                                                            <g key={g}>
                                                                <line
                                                                    x1={padL}
                                                                    y1={y}
                                                                    x2={svgW - padR}
                                                                    y2={y}
                                                                    stroke="rgba(255, 255, 255, 0.06)"
                                                                    strokeDasharray="4 4"
                                                                />
                                                                <text
                                                                    x={padL - 10}
                                                                    y={y + 4}
                                                                    textAnchor="end"
                                                                    fontSize="10"
                                                                    fill="var(--text-muted)"
                                                                    fontWeight="600"
                                                                >
                                                                    {valLabel}
                                                                </text>
                                                            </g>
                                                        );
                                                    })}

                                                    {/* Area Fill */}
                                                    {areaPath && (
                                                        <path d={areaPath} fill="url(#chartGoldGlow)" />
                                                    )}

                                                    {/* Stroke Path */}
                                                    {linePath && (
                                                        <path
                                                            d={linePath}
                                                            fill="none"
                                                            stroke="url(#chartStrokeGrad)"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    )}

                                                    {/* Points & X-Labels */}
                                                    {points.map((pt, idx) => (
                                                        <g
                                                            key={idx}
                                                            onMouseEnter={() => setHoveredPoint(pt)}
                                                            onMouseLeave={() => setHoveredPoint(null)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <circle
                                                                cx={pt.x}
                                                                cy={pt.y}
                                                                r={hoveredPoint?.key === pt.key ? 7 : 5}
                                                                fill="#0A0705"
                                                                stroke="#D4AF37"
                                                                strokeWidth={hoveredPoint?.key === pt.key ? 3 : 2}
                                                                style={{ transition: 'all 0.2s ease' }}
                                                            />
                                                            <text
                                                                x={pt.x}
                                                                y={svgH - 12}
                                                                textAnchor="middle"
                                                                fontSize="11"
                                                                fill={hoveredPoint?.key === pt.key ? 'var(--gold-light)' : 'var(--text-secondary)'}
                                                                fontWeight={hoveredPoint?.key === pt.key ? '700' : '500'}
                                                            >
                                                                {pt.label}
                                                            </text>
                                                        </g>
                                                    ))}
                                                </svg>
                                            );
                                        })()}

                                        {/* Floating Glass Tooltip */}
                                        {hoveredPoint && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: Math.max(10, hoveredPoint.y - 85),
                                                    left: Math.min(480, Math.max(30, hoveredPoint.x - 70)),
                                                    background: 'rgba(18, 13, 10, 0.95)',
                                                    border: '1px solid var(--gold)',
                                                    borderRadius: '10px',
                                                    padding: '8px 12px',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                                                    pointerEvents: 'none',
                                                    zIndex: 20,
                                                    minWidth: '150px'
                                                }}
                                            >
                                                <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                                                    {hoveredPoint.label} Performance
                                                </div>
                                                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                                                    Rs. {hoveredPoint.revenue.toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Commissions:</span>
                                                    <span style={{ fontWeight: 700 }}>{hoveredPoint.orderCount} orders</span>
                                                </div>
                                                {hoveredPoint.orderCount > 0 && (
                                                    <div style={{ fontSize: '10.5px', color: 'var(--emerald)', marginTop: '2px' }}>
                                                        AOV: Rs. {hoveredPoint.avgOrderValue.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Diagram 2: Order Lifecycle Donut Diagram */}
                                <div className="chart-panel-card">
                                    <div className="chart-header-row">
                                        <div className="chart-title-group">
                                            <h4>
                                                <i className="fas fa-pie-chart" style={{ color: 'var(--blue)' }}></i>
                                                Production & Order Pipeline
                                            </h4>
                                            <p>Live status distribution across all custom commissions</p>
                                        </div>
                                        <span className="badge-pill-outline" style={{ fontSize: '10.5px' }}>
                                            {orders.length} Total Orders
                                        </span>
                                    </div>

                                    <div className="donut-center-group">
                                        {/* SVG Donut */}
                                        <div className="donut-graphic-col">
                                            <svg width="200" height="200" viewBox="0 0 200 200">
                                                {/* Background Circle */}
                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="72"
                                                    fill="none"
                                                    stroke="rgba(255, 255, 255, 0.05)"
                                                    strokeWidth="20"
                                                />
                                                {/* Donut Segments */}
                                                {pipelineDonut.segments.map((seg, idx) => (
                                                    <circle
                                                        key={idx}
                                                        cx="100"
                                                        cy="100"
                                                        r="72"
                                                        fill="none"
                                                        stroke={seg.color}
                                                        strokeWidth="20"
                                                        strokeDasharray={seg.strokeDasharray}
                                                        strokeDashoffset={seg.strokeDashoffset}
                                                        strokeLinecap={pipelineDonut.segments.length === 1 ? 'butt' : 'round'}
                                                        style={{ transition: 'all 0.5s ease', cursor: 'pointer' }}
                                                        onClick={() => setDashboardStatusFilter(seg.status)}
                                                    />
                                                ))}
                                            </svg>
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center',
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                                    Pipeline Value
                                                </span>
                                                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gold-light)' }}>
                                                    Rs. {Math.round(realStats.pipelineVal / 1000)}k
                                                </span>
                                                <span style={{ fontSize: '10px', color: 'var(--emerald)', fontWeight: 600 }}>
                                                    {realStats.inProdCount + realStats.pendingCount} Active
                                                </span>
                                            </div>
                                        </div>

                                        {/* Interactive Legend Stack */}
                                        <div className="donut-legend-stack">
                                            {pipelineDonut.segments.map((seg) => (
                                                <button
                                                    key={seg.status}
                                                    type="button"
                                                    className="donut-legend-row"
                                                    onClick={() => setDashboardStatusFilter(dashboardStatusFilter === seg.status ? 'all' : seg.status)}
                                                    style={{
                                                        borderColor: dashboardStatusFilter === seg.status ? seg.color : 'rgba(255, 255, 255, 0.04)',
                                                        background: dashboardStatusFilter === seg.status ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.02)'
                                                    }}
                                                >
                                                    <div className="donut-legend-label">
                                                        <span className="donut-legend-dot" style={{ backgroundColor: seg.color }}></span>
                                                        <span>{seg.label}</span>
                                                    </div>
                                                    <div className="donut-legend-val">
                                                        <span>{seg.count}</span>
                                                        <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', marginLeft: '6px' }}>
                                                            ({seg.percent}%)
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                            {pipelineDonut.segments.length === 0 && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '10px' }}>
                                                    No orders recorded yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DIAGRAM ROW 2: Category Distribution, Settlement Channels & Atelier Health */}
                            <div className="analytics-grid-three-col">
                                {/* Diagram 3: Showroom Category & Timber Distribution */}
                                <div className="chart-panel-card">
                                    <div className="chart-header-row">
                                        <div className="chart-title-group">
                                            <h4>
                                                <i className="fas fa-layer-group" style={{ color: 'var(--gold)' }}></i>
                                                Showroom Catalog & Asset Share
                                            </h4>
                                            <p>Real-time breakdown of pieces across luxury timber collections</p>
                                        </div>
                                        <span style={{ fontSize: '11.5px', color: 'var(--gold-light)', fontWeight: 700 }}>
                                            Rs. {categoryBreakdown.totalInventoryValue.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="category-progress-list">
                                        {categoryBreakdown.list.slice(0, 5).map((cat) => (
                                            <div key={cat.category} className="category-progress-item">
                                                <div className="category-item-header">
                                                    <span className="category-name-span">
                                                        {cat.label}
                                                        <span className="category-count-badge">({cat.count} pieces)</span>
                                                    </span>
                                                    <span className="category-value-span">
                                                        Rs. {cat.totalValue.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="category-bar-track">
                                                    <div
                                                        className="category-bar-fill"
                                                        style={{ width: `${Math.max(8, cat.percent)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Timber Heritage Chips */}
                                    <div className="timber-pills-row">
                                        <span className="timber-pill"><i className="fas fa-tree"></i> Solid Teak</span>
                                        <span className="timber-pill"><i className="fas fa-leaf"></i> Suar Slab</span>
                                        <span className="timber-pill"><i className="fas fa-seedling"></i> Ceylon Mahogany</span>
                                        <span className="timber-pill"><i className="fas fa-gem"></i> Rare Nadun</span>
                                    </div>
                                </div>

                                {/* Diagram 4: Payment Settlement Breakdown */}
                                <div className="chart-panel-card">
                                    <div className="chart-header-row">
                                        <div className="chart-title-group">
                                            <h4>
                                                <i className="fas fa-credit-card" style={{ color: 'var(--emerald)' }}></i>
                                                Patron Settlement Channels
                                            </h4>
                                            <p>Real payments received across online & bank wire channels</p>
                                        </div>
                                    </div>

                                    <div className="payment-methods-stack">
                                        {paymentMethodsBreakdown.map((pm) => (
                                            <div key={pm.method} className="payment-method-card">
                                                <div className="payment-method-left">
                                                    <div className="payment-method-icon" style={{ background: `${pm.color}22`, color: pm.color }}>
                                                        <i className={`fas ${pm.icon}`}></i>
                                                    </div>
                                                    <div>
                                                        <div className="payment-method-title">{pm.label}</div>
                                                        <div className="payment-method-sub">{pm.count} transactions settled</div>
                                                    </div>
                                                </div>
                                                <div className="payment-method-right">
                                                    <div className="payment-method-amount">Rs. {pm.value.toLocaleString()}</div>
                                                    <div className="payment-method-percent">{pm.percent}% of gross</div>
                                                </div>
                                            </div>
                                        ))}
                                        {paymentMethodsBreakdown.length === 0 && (
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '14px 0' }}>
                                                Awaiting first verified patron transaction.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Diagram 5: Atelier Health & Key Operational Metrics */}
                                <div className="chart-panel-card">
                                    <div className="chart-header-row">
                                        <div className="chart-title-group">
                                            <h4>
                                                <i className="fas fa-shield-halved" style={{ color: 'var(--amber)' }}></i>
                                                Atelier Health & Benchmarks
                                            </h4>
                                            <p>Real-time operational ratios & craftsmanship quality indicators</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i className="fas fa-truck-ramp-box" style={{ color: 'var(--emerald)' }}></i>
                                                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Fulfillment Rate</span>
                                            </div>
                                            <span style={{ fontWeight: 800, color: 'var(--emerald)', fontSize: '14px' }}>
                                                {realStats.fulfillmentRate}%
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i className="fas fa-star" style={{ color: 'var(--gold)' }}></i>
                                                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Patron Satisfaction</span>
                                            </div>
                                            <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '14px' }}>
                                                {realStats.avgRating} / 5.0 ★
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i className="fas fa-receipt" style={{ color: 'var(--blue)' }}></i>
                                                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Average Ticket Size</span>
                                            </div>
                                            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                                                Rs. {realStats.aov.toLocaleString()}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i className="fas fa-clock" style={{ color: 'var(--amber)' }}></i>
                                                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Action Required</span>
                                            </div>
                                            <span style={{ fontWeight: 800, color: realStats.pendingCount > 0 ? 'var(--amber)' : 'var(--emerald)', fontSize: '13.5px' }}>
                                                {realStats.pendingCount} Pending Orders
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders Overview Card */}
                            <div className="atelier-panel-card">
                                <div className="panel-header-row" style={{ flexWrap: 'wrap', gap: '14px' }}>
                                    <div className="panel-title-group">
                                        <h3 className="panel-title">
                                            Recent Bespoke Patron Commissions
                                            {dashboardStatusFilter !== 'all' && (
                                                <span className="badge-pill-outline" style={{ marginLeft: '10px', fontSize: '11px', color: 'var(--gold-light)' }}>
                                                    Filtered: {dashboardStatusFilter.replace('_', ' ')}
                                                </span>
                                            )}
                                        </h3>
                                        <span className="panel-subtitle">Latest custom furniture orders placed across Sri Lanka</span>
                                    </div>

                                    {/* Quick Status Filter Pills */}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div className="chart-pills-filter">
                                            <button
                                                type="button"
                                                className={`chart-pill-btn ${dashboardStatusFilter === 'all' ? 'active' : ''}`}
                                                onClick={() => setDashboardStatusFilter('all')}
                                            >
                                                All ({orders.length})
                                            </button>
                                            <button
                                                type="button"
                                                className={`chart-pill-btn ${dashboardStatusFilter === 'pending' ? 'active' : ''}`}
                                                onClick={() => setDashboardStatusFilter('pending')}
                                                style={{ color: dashboardStatusFilter === 'pending' ? '#fff' : 'var(--amber)' }}
                                            >
                                                Pending ({realStats.pendingCount})
                                            </button>
                                            <button
                                                type="button"
                                                className={`chart-pill-btn ${['accepted', 'in_production', 'processing'].includes(dashboardStatusFilter) ? 'active' : ''}`}
                                                onClick={() => setDashboardStatusFilter('in_production')}
                                                style={{ color: ['accepted', 'in_production', 'processing'].includes(dashboardStatusFilter) ? '#fff' : 'var(--blue)' }}
                                            >
                                                Production ({realStats.inProdCount})
                                            </button>
                                            <button
                                                type="button"
                                                className={`chart-pill-btn ${dashboardStatusFilter === 'delivered' ? 'active' : ''}`}
                                                onClick={() => setDashboardStatusFilter('delivered')}
                                                style={{ color: dashboardStatusFilter === 'delivered' ? '#fff' : 'var(--emerald)' }}
                                            >
                                                Delivered ({realStats.deliveredCount})
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn-gold-primary"
                                            onClick={() => setActiveSection('orders')}
                                            style={{ padding: '7px 16px', fontSize: '11.5px' }}
                                        >
                                            <span>Full Book</span>
                                            <i className="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
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
                                            {orders
      .filter((o) => dashboardStatusFilter === 'all' || o.status === dashboardStatusFilter || (dashboardStatusFilter === 'in_production' && ['accepted', 'processing', 'in_production', 'ready'].includes(o.status)))
      .slice(0, 8)
      .map((o) => (
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
