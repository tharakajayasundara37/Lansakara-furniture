'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChairConfigurator from '@/components/ChairConfigurator';

const heroSlides = [
    {
        image: '/images/wood_01.jpg',
        title: 'Timeless Ceylon Heritage Handcrafted in Solid Timber',
        subtitle: 'Living grain, mortise-and-tenon heirloom joinery, and bespoke architectural commissions crafted by Moratuwa master artisans.'
    },
    {
        image: '/images/wood_02.jpg',
        title: 'Sculpted from Aged Ceylon Teak & Rich Red Mahogany',
        subtitle: 'Each slab is kiln-dried to 8% moisture and finished with botanical organic beeswaxes for a century of living elegance.'
    },
    {
        image: '/images/wood_03.jpg',
        title: 'Interactive 3D Bespoke Studio & Tailored Commissioning',
        subtitle: 'Configure your royal dining chairs and architectural suites in real-time 3D with custom timber, fabrics, and 24K gold accents.'
    }
];

export default function HomePage() {
    const router = useRouter();

    // Hero state
    const [heroIndex, setHeroIndex] = useState(0);

    // Products state
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ average: 5.0, total: 3 });
    const [activeReviewIdx, setActiveReviewIdx] = useState(0);
    const [hasReviewed, setHasReviewed] = useState(false);

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewForm, setReviewForm] = useState({
        name: '',
        email: '',
        location: '',
        product: '',
        quote: ''
    });
    const [reviewAlert, setReviewAlert] = useState({ type: '', message: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Commission Form State
    const [commissionForm, setCommissionForm] = useState({
        name: '',
        phone: '',
        email: '',
        interest: 'Royal Dining Suite',
        message: ''
    });
    const [commissionSubmitted, setCommissionSubmitted] = useState(false);

    // Hero slider interval
    useEffect(() => {
        const timer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 7000);
        return () => clearInterval(timer);
    }, []);

    // Check localStorage for prior review
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const reviewed = localStorage.getItem('lansakara_reviewed_email');
            if (reviewed) setHasReviewed(true);
        }
    }, []);

    // Fetch Products
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products?limit=200');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (err) {
                console.error('Failed to load products:', err);
            } finally {
                setLoadingProducts(false);
            }
        }
        fetchProducts();
    }, []);

    // Fetch Reviews
    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch('/api/reviews?status=approved');
                if (res.ok) {
                    const data = await res.json();
                    const list = data.reviews || [];
                    setReviews(list);
                    setReviewStats({
                        average: data.averageRating || 5.0,
                        total: data.total || list.length
                    });
                }
            } catch (err) {
                console.error('Failed to load reviews:', err);
            }
        }
        fetchReviews();
    }, []);

    // Reviews auto-slide
    useEffect(() => {
        if (reviews.length <= 1) return;
        const timer = setInterval(() => {
            setActiveReviewIdx((prev) => (prev + 1) % reviews.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [reviews.length]);

    // Handle Category Filter
    const getFilterCat = (cat, name) => {
        const c = (cat || '').toLowerCase();
        const n = (name || '').toLowerCase();
        if (c === 'chairs' || c === 'dining' || n.includes('dining') || n.includes('chair')) return 'dining';
        if (c === 'sofas' || c === 'living' || n.includes('sofa') || n.includes('lounge')) return 'living';
        if (c === 'tables' || n.includes('coffee') || n.includes('table')) return 'tables';
        if (c === 'beds' || c === 'bedroom' || c === 'vanity' || n.includes('bed') || n.includes('vanity')) return 'bedroom';
        return 'dining';
    };

    const filteredProducts = products.filter((p) => {
        if (selectedCategory === 'all') return true;
        const cat = getFilterCat(p.category, p.name);
        return cat === selectedCategory;
    });

    // Handle Order Bespoke Navigation
    const handleOrderProduct = (prod) => {
        const orderDraft = {
            name: prod.name,
            price: prod.price || 250000,
            image: prod.images && prod.images[0] ? prod.images[0] : '/images/wood_09.jpg',
            specs: prod.shortDescription || prod.woodType || 'Solid Timber Handcrafted Masterpiece'
        };
        if (typeof window !== 'undefined') {
            localStorage.setItem('lansakara_checkout_order', JSON.stringify(orderDraft));
        }
        router.push(`/checkout?product=${encodeURIComponent(prod.name)}&price=${prod.price}`);
    };

    // Open Review Modal
    const handleOpenReviewModal = () => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('lansakara_reviewed_email');
            if (email) {
                alert(`You have already shared a verified patron review (${email}). Each patron is permitted one review. Thank you for your patronage!`);
                return;
            }
        }
        setReviewAlert({ type: '', message: '' });
        setIsReviewModalOpen(true);
    };

    // Submit Review
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setReviewAlert({ type: '', message: '' });
        setSubmittingReview(true);

        const email = reviewForm.email.trim().toLowerCase();

        try {
            // First check if email has already submitted
            const checkRes = await fetch(`/api/reviews/check?email=${encodeURIComponent(email)}`);
            const checkData = await checkRes.json();
            if (checkData.hasReviewed) {
                setReviewAlert({
                    type: 'error',
                    message: `An authentic review has already been registered for ${email}. Each customer is permitted one review.`
                });
                setSubmittingReview(false);
                return;
            }

            // Submit
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authorName: reviewForm.name.trim(),
                    authorEmail: email,
                    location: reviewForm.location.trim() || 'Sri Lanka',
                    productPurchased: reviewForm.product.trim() || 'Bespoke Timber Commission',
                    rating: reviewRating,
                    quote: reviewForm.quote.trim()
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setReviewAlert({ type: 'error', message: data.error || 'Failed to submit review' });
                setSubmittingReview(false);
                return;
            }

            // Success
            localStorage.setItem('lansakara_reviewed_email', email);
            setHasReviewed(true);
            setReviewAlert({
                type: 'success',
                message: 'Thank you! Your verified patron review has been recorded and will appear after moderation.'
            });

            setTimeout(() => {
                setIsReviewModalOpen(false);
                setReviewForm({ name: '', email: '', location: '', product: '', quote: '' });
                setSubmittingReview(false);
            }, 2000);
        } catch (err) {
            setReviewAlert({ type: 'error', message: 'Network error. Please try again.' });
            setSubmittingReview(false);
        }
    };

    // Handle Commission Form Submit
    const handleCommissionSubmit = (e) => {
        e.preventDefault();
        const msg = `Hello Lansakara Artisans, I would like to commission a bespoke piece:%0A%0AName: ${encodeURIComponent(commissionForm.name)}%0APhone: ${encodeURIComponent(commissionForm.phone)}%0AInterest: ${encodeURIComponent(commissionForm.interest)}%0ANotes: ${encodeURIComponent(commissionForm.message)}`;
        window.open(`https://wa.me/94771234567?text=${msg}`, '_blank');
        setCommissionSubmitted(true);
    };

    const ratingDescriptions = {
        1: '1 Star — Needs Improvement',
        2: '2 Stars — Acceptable',
        3: '3 Stars — Good Craftsmanship',
        4: '4 Stars — Highly Impressed',
        5: '5 Stars — Exceptional Masterpiece'
    };

    return (
        <div className="page-wrapper">
            {/* ═══════════════ NAVIGATION HEADER ═══════════════ */}
            <header className="navbar" id="navbar">
                <div className="nav-container">
                    <Link href="/" className="nav-logo">
                        <span className="logo-text">LANSAKARA</span>
                        <span className="logo-tagline">ROYAL CEYLON WOODCRAFT</span>
                    </Link>

                    <nav className="nav-links">
                        <a href="#heritage" className="nav-link">Heritage</a>
                        <a href="#products" className="nav-link">Collections</a>
                        <a href="#3d-chair" className="nav-link">3D Studio</a>
                        <a href="#reviews" className="nav-link">Reflections</a>
                        <a href="#contact" className="nav-link">Commission</a>
                        <Link href="/admin" className="nav-link admin-pill">
                            <i className="fas fa-lock"></i> Admin
                        </Link>
                    </nav>

                    <div className="nav-actions">
                        <a
                            href="https://wa.me/94771234567?text=Hello%20Lansakara%20Artisans,%20I%20am%20in的双quired%20about%20a%20bespoke%20timber%20commission."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-consultation"
                        >
                            <i className="fab fa-whatsapp"></i> Artisan Concierge
                        </a>
                    </div>
                </div>
            </header>

            {/* ═══════════════ HERO BANNER ═══════════════ */}
            <section className="hero" id="home">
                {heroSlides.map((slide, idx) => (
                    <div
                        key={idx}
                        className={`hero-slide ${idx === heroIndex ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="hero-overlay"></div>
                    </div>
                ))}

                <div className="hero-content">
                    <div className="hero-badge">
                        <span>⚜</span> 100% Solid Ceylon Teak, Mahogany & Walnut
                    </div>
                    <h1 className="hero-title">{heroSlides[heroIndex].title}</h1>
                    <p className="hero-subtitle">{heroSlides[heroIndex].subtitle}</p>

                    <div className="hero-cta-group">
                        <a href="#products" className="btn-primary">
                            <span>⚜</span> Explore Masterworks
                        </a>
                        <a href="#3d-chair" className="btn-secondary">
                            <span>✦</span> Open 3D Bespoke Studio
                        </a>
                    </div>

                    <div className="hero-features-bar">
                        <div className="hero-feat-item">
                            <i className="fas fa-truck"></i>
                            <div>
                                <strong>Islandwide Delivery</strong>
                                <span>Rs. 100 per km white-glove transport</span>
                            </div>
                        </div>
                        <div className="hero-feat-item">
                            <i className="fas fa-percentage"></i>
                            <div>
                                <strong>10% Card Discount</strong>
                                <span>Instant privilege on online cards</span>
                            </div>
                        </div>
                        <div className="hero-feat-item">
                            <i className="fas fa-shield-alt"></i>
                            <div>
                                <strong>Generational Warranty</strong>
                                <span>Lifetime structural guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Slide Controls */}
                <div className="hero-controls">
                    <button
                        className="hero-arrow"
                        onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                    >
                        ❮
                    </button>
                    <div className="hero-dots">
                        {heroSlides.map((_, i) => (
                            <div
                                key={i}
                                className={`hero-dot ${i === heroIndex ? 'active' : ''}`}
                                onClick={() => setHeroIndex(i)}
                            ></div>
                        ))}
                    </div>
                    <button
                        className="hero-arrow"
                        onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                    >
                        ❯
                    </button>
                </div>
            </section>

            {/* ═══════════════ HERITAGE SECTION ═══════════════ */}
            <section className="section heritage" id="heritage">
                <div className="section-container">
                    <div className="heritage-grid">
                        <div className="heritage-text">
                            <span className="section-label">Since 1974</span>
                            <h2 className="section-title">
                                Five Decades of <br />
                                <em>Ceylon Timber Mastery</em>
                            </h2>
                            <p className="body-lead">
                                Rooted in the legendary woodcraft quarter of Moratuwa, Lansakara creates hand-chiseled furniture that bridges ancestral royal Ceylon techniques with modern architectural residences.
                            </p>
                            <p>
                                We work exclusively with mature timber harvested under sustainable forestry charters—Ceylon Golden Teak, deep Red Mahogany, and Mara—allowing each piece to breathe, mature, and acquire a rich natural patina across generations.
                            </p>

                            <div className="heritage-stats">
                                <div className="stat-block">
                                    <span className="stat-number">50+</span>
                                    <span className="stat-label">Years of Craft</span>
                                </div>
                                <div className="stat-block">
                                    <span className="stat-number">100%</span>
                                    <span className="stat-label">Solid Hardwood</span>
                                </div>
                                <div className="stat-block">
                                    <span className="stat-number">3,800+</span>
                                    <span className="stat-label">Homes Graced</span>
                                </div>
                            </div>
                        </div>

                        <div className="heritage-image-stack">
                            <div className="img-frame frame-main">
                                <img src="/images/wood_02.jpg" alt="Artisan hand plane woodcraft" />
                            </div>
                            <div className="img-frame frame-sub">
                                <img src="/images/wood_03.jpg" alt="Mortise and tenon joinery detail" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ 3D CHAIR CONFIGURATOR STUDIO ═══════════════ */}
            <ChairConfigurator />

            {/* ═══════════════ PRODUCT CATALOG ═══════════════ */}
            <section className="section products-section" id="products">
                <div className="section-container">
                    <div className="section-header reveal active">
                        <span className="section-label">Handcrafted Collection</span>
                        <h2 className="section-title">Heirloom Timber Suites</h2>
                        <p className="section-desc">
                            Each masterwork is individually sculpted by our resident artisans. Select any item to order with custom dimensions, wood finishes, and white-glove transport.
                        </p>

                        <div className="filter-bar">
                            {[
                                { key: 'all', label: 'All Pieces' },
                                { key: 'dining', label: 'Dining & Chairs' },
                                { key: 'living', label: 'Living & Lounges' },
                                { key: 'tables', label: 'Coffee & Tables' },
                                { key: 'bedroom', label: 'Bedrooms' }
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    className={`filter-btn ${selectedCategory === f.key ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(f.key)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingProducts ? (
                        <div className="loading-spinner-box">
                            <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--gold)' }}></i>
                            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Curating heirloom pieces...</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map((p) => {
                                const imgSrc = p.images && p.images[0] ? p.images[0] : '/images/wood_09.jpg';
                                const priceNum = p.price || 0;
                                return (
                                    <div key={p._id} className="product-card">
                                        <div className="product-thumb">
                                            <img
                                                src={imgSrc}
                                                alt={p.name}
                                                onError={(e) => { e.currentTarget.src = '/images/wood_09.jpg'; }}
                                            />
                                            {p.badge && <div className="product-badge-tag">{p.badge}</div>}
                                            <div className="product-overlay-action">
                                                <button
                                                    className="product-quick-btn"
                                                    onClick={() => handleOrderProduct(p)}
                                                >
                                                    Order Bespoke
                                                </button>
                                            </div>
                                        </div>
                                        <div className="product-details">
                                            <span className="product-category">
                                                {p.category ? p.category.toUpperCase() : 'SOLID TIMBER'}
                                            </span>
                                            <h3 className="product-title">{p.name}</h3>
                                            <p className="product-spec">
                                                {p.shortDescription || p.woodType || 'Solid Ceylon Hardwood'}
                                            </p>
                                            <div className="product-footer">
                                                <span className="product-price">Rs. {priceNum.toLocaleString()}</span>
                                                <button
                                                    className="product-inquire"
                                                    onClick={() => handleOrderProduct(p)}
                                                >
                                                    Order Bespoke →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════ PATRON REFLECTIONS & REVIEWS ═══════════════ */}
            <section className="section reviews-section" id="reviews">
                <div className="section-container">
                    <div className="section-header reveal active">
                        <span className="section-label">Patron Reflections</span>
                        <h2 className="section-title">Words from Our Patrons</h2>
                        <div className="reviews-summary-bar">
                            <span className="stars-gold">
                                {'★'.repeat(Math.round(reviewStats.average))}
                                {'☆'.repeat(5 - Math.round(reviewStats.average))}
                            </span>
                            <strong>{reviewStats.average.toFixed(1)} / 5.0 Rating</strong>
                            <span>· {reviewStats.total} Verified Patrons</span>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <button
                                className={`btn-write-review ${hasReviewed ? 'submitted' : ''}`}
                                onClick={handleOpenReviewModal}
                            >
                                <i className="fas fa-feather-alt"></i>{' '}
                                {hasReviewed ? '✓ Review Shared' : 'Share Your Experience'}
                            </button>
                        </div>
                    </div>

                    {/* Testimonials Slider */}
                    {reviews.length > 0 && (
                        <div className="testimonial-slider-container">
                            <div
                                className="testimonial-track"
                                style={{ transform: `translateX(-${activeReviewIdx * 100}%)` }}
                            >
                                {reviews.map((r, i) => (
                                    <div key={r._id || i} className="testimonial-item">
                                        <div className="testimonial-stars">
                                            {'★'.repeat(r.rating || 5)}
                                            {'☆'.repeat(5 - (r.rating || 5))}
                                        </div>
                                        <p className="testimonial-quote">“{r.quote}”</p>
                                        <div className="testimonial-author">{r.authorName}</div>
                                        <div className="testimonial-location">
                                            {r.location || 'Sri Lanka'}
                                            {r.productPurchased && (
                                                <span style={{ color: 'var(--gold)' }}> · {r.productPurchased}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="testimonial-dots-bar">
                                {reviews.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`test-dot ${i === activeReviewIdx ? 'active' : ''}`}
                                        onClick={() => setActiveReviewIdx(i)}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════ REVIEW SUBMISSION MODAL ═══════════════ */}
            {isReviewModalOpen && (
                <div className="review-modal-overlay open">
                    <div className="review-modal">
                        <button className="review-modal-close" onClick={() => setIsReviewModalOpen(false)}>
                            &times;
                        </button>
                        <div className="review-modal-title">Share Your Experience</div>
                        <div className="review-modal-sub">
                            Each patron is invited to share one authentic review of their Lansakara bespoke timber piece.
                        </div>

                        {reviewAlert.message && (
                            <div className={`review-alert ${reviewAlert.type}`} style={{ display: 'block' }}>
                                {reviewAlert.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmitReview}>
                            <div className="review-form-group">
                                <label>Overall Rating *</label>
                                <div className="review-star-selector">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                            key={star}
                                            className={`fas fa-star star-btn ${reviewRating >= star ? 'active' : ''}`}
                                            onClick={() => setReviewRating(star)}
                                        ></i>
                                    ))}
                                    <span className="star-label-desc">{ratingDescriptions[reviewRating]}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="review-form-group">
                                    <label>Your Full Name *</label>
                                    <input
                                        type="text"
                                        className="review-form-input"
                                        placeholder="e.g. Priyantha Jayasuriya"
                                        required
                                        value={reviewForm.name}
                                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="review-form-group">
                                    <label>Email Address * (1 Review Per Patron)</label>
                                    <input
                                        type="email"
                                        className="review-form-input"
                                        placeholder="e.g. priyantha@gmail.com"
                                        required
                                        value={reviewForm.email}
                                        onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="review-form-group">
                                    <label>City / Location</label>
                                    <input
                                        type="text"
                                        className="review-form-input"
                                        placeholder="e.g. Colombo 07, Kandy, Galle"
                                        value={reviewForm.location}
                                        onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                                    />
                                </div>
                                <div className="review-form-group">
                                    <label>Furniture Piece Commissioned</label>
                                    <input
                                        type="text"
                                        className="review-form-input"
                                        placeholder="e.g. Royal Dining Table or 3D Chair"
                                        value={reviewForm.product}
                                        onChange={(e) => setReviewForm({ ...reviewForm, product: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="review-form-group">
                                <label>Your Review & Impressions *</label>
                                <textarea
                                    className="review-form-textarea"
                                    rows="4"
                                    placeholder="Describe the woodwork quality, timber grain, and bespoke delivery experience..."
                                    required
                                    value={reviewForm.quote}
                                    onChange={(e) => setReviewForm({ ...reviewForm, quote: e.target.value })}
                                ></textarea>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="btn-write-review"
                                    style={{ background: '#2C1E12', color: '#A89A8E' }}
                                    onClick={() => setIsReviewModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-write-review"
                                    disabled={submittingReview}
                                >
                                    {submittingReview ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane"></i> Publish Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════ BESPOKE COMMISSION SECTION ═══════════════ */}
            <section className="section contact-section" id="contact">
                <div className="section-container">
                    <div className="contact-grid">
                        <div className="contact-info">
                            <span className="section-label">Architectural Commissions</span>
                            <h2 className="section-title">Create Your Heirloom Piece</h2>
                            <p>
                                Whether you require a monolithic live-edge table for an oceanfront villa or an entire bespoke dining suite, our master joiners provide complimentary design consultations and wood sample curation.
                            </p>
                            <div className="contact-meta-list">
                                <div className="meta-item">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <strong>Artisan Workshop</strong>
                                        <span>Old Galle Road, Moratuwa, Sri Lanka</span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <i className="fas fa-phone-alt"></i>
                                    <div>
                                        <strong>Artisan Hotline</strong>
                                        <span>+94 (0) 77 123 4567 / +94 (0) 11 265 4321</span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <i className="fas fa-envelope"></i>
                                    <div>
                                        <strong>Concierge Inquiries</strong>
                                        <span>concierge@lansakara-furniture.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form-card">
                            <form onSubmit={handleCommissionSubmit}>
                                <div className="form-group">
                                    <label>Your Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Dr. Kanishka Wickramasinghe"
                                        value={commissionForm.name}
                                        onChange={(e) => setCommissionForm({ ...commissionForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone / WhatsApp *</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+94 77 ..."
                                            value={commissionForm.phone}
                                            onChange={(e) => setCommissionForm({ ...commissionForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="you@domain.lk"
                                            value={commissionForm.email}
                                            onChange={(e) => setCommissionForm({ ...commissionForm, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Commission Type</label>
                                    <select
                                        value={commissionForm.interest}
                                        onChange={(e) => setCommissionForm({ ...commissionForm, interest: e.target.value })}
                                    >
                                        <option value="Royal Dining Suite">Royal Dining Suite (10-14 Seater)</option>
                                        <option value="Live Edge Monolith">Live Edge Monolithic Table</option>
                                        <option value="3D Royal Bespoke Chair">3D Royal Bespoke Chair</option>
                                        <option value="Full Architectural Residence">Full Architectural Villa Suite</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Specifications / Preferred Timber</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Room dimensions, solid wood species preference, delivery target date..."
                                        value={commissionForm.message}
                                        onChange={(e) => setCommissionForm({ ...commissionForm, message: e.target.value })}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                    <i className="fab fa-whatsapp"></i> Inquire Directly via WhatsApp
                                </button>
                                {commissionSubmitted && (
                                    <p style={{ marginTop: '10px', color: 'var(--green)', fontSize: '13px' }}>
                                        ✓ WhatsApp inquiry window opened. Our master artisan will respond shortly.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FOOTER ═══════════════ */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-col brand-col">
                        <span className="footer-brand">LANSAKARA</span>
                        <p className="footer-desc">
                            Handcrafting Ceylon royal solid wood furniture since 1974. Living timber art sculpted to endure generations.
                        </p>
                        <div className="footer-socials">
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-facebook-f"></i></a>
                            <a href="#"><i className="fab fa-whatsapp"></i></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Navigation</h4>
                        <ul>
                            <li><a href="#heritage">Artisan Heritage</a></li>
                            <li><a href="#products">Timber Collections</a></li>
                            <li><a href="#3d-chair">3D Bespoke Studio</a></li>
                            <li><a href="#reviews">Patron Reflections</a></li>
                            <li><a href="#contact">Custom Commission</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Client Privileges</h4>
                        <ul>
                            <li><Link href="/checkout">Bespoke Checkout</Link></li>
                            <li><a href="#products">10% Card Discount</a></li>
                            <li><a href="#contact">White-Glove Delivery (Rs. 100/km)</a></li>
                            <li><a href="#reviews">Authentic Patron Reviews</a></li>
                            <li><Link href="/admin">Artisan Admin Portal</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Sri Lanka Atelier</h4>
                        <p>Old Galle Road, Moratuwa, Sri Lanka</p>
                        <p>Hotline: +94 (0) 77 123 4567</p>
                        <p>Hours: Mon–Sat, 9:00 AM – 6:30 PM</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Lansakara Royal Furniture (Pvt) Ltd. All rights reserved.</p>
                    <p>Handcrafted with Ceylon Solid Hardwood • Moratuwa Woodcraft Guild</p>
                </div>
            </footer>
        </div>
    );
}
