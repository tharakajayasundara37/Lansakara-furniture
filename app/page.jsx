'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChairConfigurator from '@/components/ChairConfigurator';

const heroSlides = [
    { src: '/images/wood_28.jpg', caption: 'Executive Solid Timber Desk', alt: 'Minimalist Solid Wood Desk' },
    { src: '/images/wood_22.jpg', caption: 'Curved Minimalist Timber Sofa', alt: 'Organic Wood Living Lounge' },
    { src: '/images/wood_10.jpg', caption: 'Handcrafted Live Edge Dining Table', alt: 'Handcrafted Live Edge Table' },
    { src: '/images/wood_12.jpg', caption: 'Exotic Handcrafted Living Suites', alt: 'Luxury Exotic Wood Furniture' },
    { src: '/images/wood_24.jpg', caption: 'Timeless Natural Teak Architecture', alt: 'Timeless Wooden Craftsmanship' }
];

const initialProducts = [
    {
        id: 'prod_001',
        name: 'Live Edge Dining Table',
        category: 'dining',
        img: '/images/wood_09.jpg',
        badge: 'Exclusive',
        spec: 'Natural Suar Solid Slab • 8-10 Seater',
        price: 285000
    },
    {
        id: 'prod_002',
        name: 'Aurelin Organic Sofa',
        category: 'living',
        img: '/images/wood_04.jpg',
        badge: 'Sculptural',
        spec: 'Solid Teak Wood Base • 96"W x 24"D x 16"H',
        price: 340000
    },
    {
        id: 'prod_003',
        name: 'Wabi Sabi Timber Table',
        category: 'dining',
        img: '/images/wood_27.jpg',
        badge: 'Wabi Sabi',
        spec: 'Deep Walnut Finish • 72"W x 40"D x 30"H',
        price: 245000
    },
    {
        id: 'prod_004',
        name: 'Noverra Sculpted Table',
        category: 'tables',
        img: '/images/wood_19.jpg',
        badge: 'Artisan',
        spec: 'Solid Teak Monolith • 48"W x 24"D x 16"H',
        price: 165000
    },
    {
        id: 'prod_005',
        name: 'Solid Wood Artisan Bed',
        category: 'bedroom',
        img: '/images/wood_14.jpg',
        badge: 'Signature',
        spec: 'Upholstered Linen & Solid Teak • King Size',
        price: 389000
    },
    {
        id: 'prod_006',
        name: 'Royal Carved Vanity Table',
        category: 'bedroom',
        img: '/images/wood_20.jpg',
        badge: 'Master Carving',
        spec: 'Ornate Floral Carvings • Vintage Warm Finish',
        price: 219000
    },
    {
        id: 'prod_007',
        name: 'Tharvane Solid Coffee Table',
        category: 'tables',
        img: '/images/wood_23.jpg',
        badge: 'Minimalist',
        spec: 'Solid Teak Architecture • 30"W x 18"D x 16"H',
        price: 115000
    },
    {
        id: 'prod_008',
        name: 'Rustic Timber Log Sofa',
        category: 'living',
        img: '/images/wood_05.jpg',
        badge: 'Rustic',
        spec: 'Natural Tree Log Construction • Linen Cushions',
        price: 298000
    },
    {
        id: 'prod_009',
        name: 'Barnwood Farmhouse Vanity',
        category: 'bedroom',
        img: '/images/wood_21.jpg',
        badge: 'Farmhouse',
        spec: 'Reclaimed Timber • Stone Basin Ready',
        price: 179000
    }
];

export default function HomePage() {
    const router = useRouter();

    // Preloader State
    const [preloaderHidden, setPreloaderHidden] = useState(false);

    // Hero Carousel
    const [heroIndex, setHeroIndex] = useState(0);
    const [heroKey, setHeroKey] = useState(0);

    // Products Filtering & Dynamic Sync
    const [activeCategory, setActiveCategory] = useState('all');
    const [adminProducts, setAdminProducts] = useState([]);

    // Reviews & Slider
    const [reviews, setReviews] = useState([
        {
            _id: 'default_1',
            rating: 5,
            quote: 'The live-edge dining table is the emotional center of our house. Everyone who visits can’t stop tracing their fingers along the smooth organic edge. Truly museum-grade craftsmanship.',
            authorName: 'Dilshan & Chamari Senanayake',
            location: 'Architectural Villa, Colombo 07',
            productPurchased: 'Live Edge Suar Dining Table'
        }
    ]);
    const [activeReviewIdx, setActiveReviewIdx] = useState(0);
    const [reviewsScore, setReviewsScore] = useState({ average: 5.0, total: 3 });

    // Review Modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewName, setReviewName] = useState('');
    const [reviewEmail, setReviewEmail] = useState('');
    const [reviewLocation, setReviewLocation] = useState('');
    const [reviewProduct, setReviewProduct] = useState('');
    const [reviewQuote, setReviewQuote] = useState('');
    const [reviewAlert, setReviewAlert] = useState({ type: '', text: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    // Contact Form
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        productType: '',
        message: ''
    });
    const [contactSuccess, setContactSuccess] = useState(false);

    // Mobile Menu & Scroll
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // ─── EFFECTS ──────────────────────────────────────────

    // 1. Preloader Auto-dismiss
    useEffect(() => {
        const timer = setTimeout(() => {
            setPreloaderHidden(true);
        }, 1300);
        return () => clearTimeout(timer);
    }, []);

    // 2. Custom Cursor Tracking (Direct DOM + Spring Lag RAF for silky 120fps performance)
    useEffect(() => {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        if (!dot || !ring) return;

        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        let animId;

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        };
        window.addEventListener('mousemove', handleMouseMove);

        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            animId = requestAnimationFrame(animateRing);
        };
        animId = requestAnimationFrame(animateRing);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animId);
        };
    }, []);

    // 3. Navbar scroll & back to top
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60);
            const btt = document.getElementById('backToTop');
            if (btt) {
                if (window.scrollY > 400) {
                    btt.classList.add('visible');
                } else {
                    btt.classList.remove('visible');
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 4. Floating Golden Particles Generator (35 Golden Particles)
    useEffect(() => {
        const container = document.getElementById('heroParticles');
        if (container && container.childElementCount === 0) {
            for (let i = 0; i < 35; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                particle.style.left = Math.random() * 100 + '%';
                const size = Math.random() * 4 + 2;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.animationDelay = (Math.random() * 8) + 's';
                particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
                container.appendChild(particle);
            }
        }
    }, []);

    // 5. Hero 10-Second Countdown Carousel Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroSlides.length);
            setHeroKey((prev) => prev + 1);
        }, 10000);
        return () => clearInterval(timer);
    }, [heroKey]);

    // 6. Scroll Reveal Observer (Slide & Fade in elements as user scrolls)
    useEffect(() => {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('active');
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach((el) => revealObserver.observe(el));
        return () => revealObserver.disconnect();
    }, [adminProducts]);

    // 7. Stats Counter Animation (Counts up from 0 to target when scrolled into view)
    useEffect(() => {
        const statNumbers = document.querySelectorAll('.stat-number');
        let counted = false;
        const statsObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !counted) {
                        counted = true;
                        statNumbers.forEach((num) => {
                            const target = parseInt(num.getAttribute('data-target') || '0', 10);
                            if (!target) return;
                            let current = 0;
                            const step = Math.ceil(target / 60);
                            const interval = setInterval(() => {
                                current += step;
                                if (current >= target) {
                                    num.textContent = target.toLocaleString() + (target >= 100 && target !== 100 ? '+' : (target === 100 ? '%' : '+'));
                                    clearInterval(interval);
                                } else {
                                    num.textContent = current.toLocaleString();
                                }
                            }, 25);
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        statNumbers.forEach((s) => statsObserver.observe(s));
        return () => statsObserver.disconnect();
    }, []);

    // Check localStorage for prior review
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lansakara_reviewed_email');
            if (saved) setHasReviewed(true);
        }
    }, []);

    // Load dynamic products from backend
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products?limit=200');
                if (res.ok) {
                    const data = await res.json();
                    const allProds = data.products || [];
                    const initialIds = new Set(['prod_001', 'prod_002', 'prod_003', 'prod_004', 'prod_005', 'prod_006', 'prod_007', 'prod_008', 'prod_009']);
                    const newlyAdded = allProds.filter((p) => !initialIds.has(p._id));
                    setAdminProducts(newlyAdded);
                }
            } catch (e) {
                console.warn('Could not load dynamic products:', e);
            }
        }
        fetchProducts();
    }, []);

    // Load public reviews from backend
    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch('/api/reviews?status=approved');
                if (res.ok) {
                    const data = await res.json();
                    const list = data.reviews || [];
                    if (list.length > 0) {
                        setReviews(list);
                        setReviewsScore({
                            average: data.averageRating || 5.0,
                            total: data.total || list.length
                        });
                    }
                }
            } catch (e) {
                console.warn('Could not load reviews:', e);
            }
        }
        fetchReviews();
    }, []);

    // Testimonials auto-slide
    useEffect(() => {
        if (reviews.length <= 1) return;
        const timer = setInterval(() => {
            setActiveReviewIdx((prev) => (prev + 1) % reviews.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [reviews.length]);

    // ─── ACTIONS ──────────────────────────────────────────

    const nextHeroSlide = () => {
        setHeroIndex((prev) => (prev + 1) % heroSlides.length);
        setHeroKey((prev) => prev + 1);
    };

    const prevHeroSlide = () => {
        setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
        setHeroKey((prev) => prev + 1);
    };

    const setHeroSlide = (idx) => {
        setHeroIndex(idx);
        setHeroKey((prev) => prev + 1);
    };

    const filterCategory = (cat) => {
        setActiveCategory(cat);
    };

    const inquireProduct = (productName, price, img) => {
        let prodPrice = price;
        let prodImg = img;

        const matchInitial = initialProducts.find((p) => p.name === productName);
        if (matchInitial) {
            prodPrice = matchInitial.price;
            prodImg = matchInitial.img;
        }

        const matchAdmin = adminProducts.find((p) => p.name === productName);
        if (matchAdmin) {
            prodPrice = matchAdmin.price;
            prodImg = matchAdmin.images && matchAdmin.images[0] ? matchAdmin.images[0] : '/images/wood_09.jpg';
        }

        const orderDraft = {
            name: productName,
            price: prodPrice || 250000,
            image: prodImg || '/images/wood_09.jpg',
            specs: 'Solid Timber Handcrafted Masterpiece'
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('lansakara_checkout_order', JSON.stringify(orderDraft));
        }
        router.push(`/checkout?product=${encodeURIComponent(productName)}&price=${prodPrice || 250000}`);
    };

    const openReviewModal = () => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('lansakara_reviewed_email');
            if (email) {
                alert(`You have already submitted an authentic review for Lansakara Furniture (${email}). Each customer is permitted one review. Thank you for your wonderful patronage!`);
                return;
            }
        }
        setReviewAlert({ type: '', text: '' });
        setIsReviewModalOpen(true);
    };

    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewAlert({ type: '', text: '' });
        setSubmittingReview(true);

        const email = reviewEmail.trim().toLowerCase();

        try {
            const checkRes = await fetch(`/api/reviews/check?email=${encodeURIComponent(email)}`);
            const checkData = await checkRes.json();
            if (checkData.hasReviewed || checkData.alreadyReviewed) {
                setReviewAlert({
                    type: 'error',
                    text: `An authentic review has already been submitted with this email (${email}). Each customer is permitted only one review.`
                });
                setSubmittingReview(false);
                return;
            }

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authorName: reviewName.trim(),
                    authorEmail: email,
                    location: reviewLocation.trim() || 'Sri Lanka',
                    productPurchased: reviewProduct.trim() || 'Bespoke Timber Piece',
                    rating: reviewRating,
                    quote: reviewQuote.trim()
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setReviewAlert({ type: 'error', text: data.error || 'Failed to submit review' });
                setSubmittingReview(false);
                return;
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('lansakara_reviewed_email', email);
            }
            setHasReviewed(true);
            setReviewAlert({
                type: 'success',
                text: '✓ Thank you! Your authentic review has been recorded. It will appear on our homepage.'
            });

            setTimeout(() => {
                closeReviewModal();
                setReviewName('');
                setReviewEmail('');
                setReviewLocation('');
                setReviewProduct('');
                setReviewQuote('');
                setReviewRating(5);
                setSubmittingReview(false);
            }, 2200);
        } catch (err) {
            setReviewAlert({ type: 'error', text: 'Network connection issue. Please try again.' });
            setSubmittingReview(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const text = `Hello Lansakara Artisans,%0A%0AI would like to commission a bespoke piece:%0A- Name: ${encodeURIComponent(contactForm.name)}%0A- Email: ${encodeURIComponent(contactForm.email)}%0A- Phone: ${encodeURIComponent(contactForm.phone)}%0A- Furniture Type: ${encodeURIComponent(contactForm.productType)}%0A- Notes: ${encodeURIComponent(contactForm.message)}`;
        window.open(`https://wa.me/94771234567?text=${text}`, '_blank');
        setContactSuccess(true);
    };

    const getFilterCat = (cat, name) => {
        const c = (cat || '').toLowerCase();
        const n = (name || '').toLowerCase();
        if (c === 'chairs' || c === 'dining' || n.includes('dining') || n.includes('chair')) return 'dining';
        if (c === 'sofas' || c === 'living' || n.includes('sofa') || n.includes('lounge')) return 'living';
        if (c === 'tables' || n.includes('coffee') || n.includes('table')) return 'tables';
        if (c === 'beds' || c === 'bedroom' || c === 'vanity' || n.includes('bed') || n.includes('vanity')) return 'bedroom';
        return 'dining';
    };

    const roundedStars = Math.round(reviewsScore.average);
    const starStr = '★'.repeat(roundedStars) + '☆'.repeat(5 - roundedStars);

    return (
        <div>
            {/* Preloader */}
            <div className={`preloader ${preloaderHidden ? 'hidden' : ''}`} id="preloader">
                <div className="preloader-logo">Lansakara</div>
                <div className="preloader-sub">Bespoke Furniture Artistry</div>
                <div className="preloader-bar"></div>
            </div>

            {/* Custom Cursor */}
            <div className="cursor-dot" id="cursorDot"></div>
            <div className="cursor-ring" id="cursorRing"></div>

            {/* Top Navigation */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
                <div className="navbar-container">
                    <a href="#home" className="nav-logo">
                        <span className="logo-icon">⚜</span>
                        Lansakara <span>Furniture</span>
                    </a>
                    <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="navLinks">
                        <li><a href="#home" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</a></li>
                        <li><a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Story</a></li>
                        <li><a href="#3d-chair" className="nav-link nav-highlight" onClick={() => setMobileMenuOpen(false)}>🪑 3D Studio</a></li>
                        <li><a href="#products" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Products</a></li>
                        <li><a href="#gallery" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Art Gallery</a></li>
                        <li><a href="#testimonials" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Reviews</a></li>
                        <li><Link href="/checkout" className="nav-link">Checkout</Link></li>
                        <li><Link href="/admin" className="nav-link" style={{ color: 'var(--gold)' }}>Admin</Link></li>
                        <li className="mobile-only">
                            <a href="#contact" className="nav-cta-mobile" onClick={() => setMobileMenuOpen(false)}>
                                Custom Order
                            </a>
                        </li>
                    </ul>
                    <div className="nav-actions">
                        <a href="#contact" className="nav-cta-btn">Custom Order</a>
                        <button
                            className="menu-toggle"
                            id="menuToggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation"
                        >
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section (Crisp 10-Second Carousel, HD Non-Blur) */}
            <section className="hero" id="home">
                <div className="hero-slides-wrapper" id="heroSlidesWrapper">
                    {heroSlides.map((slide, idx) => (
                        <div
                            key={idx}
                            className={`hero-slide ${idx === heroIndex ? 'active' : ''}`}
                            data-caption={slide.caption}
                        >
                            <img
                                src={slide.src}
                                alt={slide.alt}
                                loading={idx === 0 ? 'eager' : 'lazy'}
                            />
                        </div>
                    ))}
                </div>

                <div className="hero-scrim"></div>
                <div className="hero-vignette"></div>
                <div className="hero-particles" id="heroParticles"></div>

                <div className="hero-content">
                    <div className="hero-badge">Master Woodworkers & Artisans</div>
                    <h1 className="hero-title">
                        Crafted by Nature,<br />
                        <span className="accent">Perfected by Hand</span>
                    </h1>
                    <p className="hero-subtitle">
                        Transforming centuries-old reclaimed teak, mahogany, and live-edge timbers into heirloom furniture pieces designed for timeless luxury.
                    </p>
                    <div className="hero-buttons">
                        <a href="#products" className="btn-primary">
                            <span>Explore Masterpieces</span>
                        </a>
                        <a href="#gallery" className="btn-outline">View Art Gallery</a>
                    </div>
                </div>

                {/* Animated Scroll Indicator */}
                <div
                    className="scroll-indicator"
                    onClick={() => {
                        const el = document.getElementById('about');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <span>Scroll</span>
                    <div className="scroll-line"></div>
                </div>

                {/* 10-Second Countdown Carousel Navigation */}
                <div className="hero-carousel-nav">
                    <button className="hero-slide-btn" onClick={prevHeroSlide} title="Previous Slide">‹</button>
                    <div className="hero-progress-bars" id="heroProgressBars">
                        {heroSlides.map((_, i) => (
                            <div
                                key={i}
                                className={`hero-progress-pill ${i === heroIndex ? 'active' : ''}`}
                                onClick={() => setHeroSlide(i)}
                            >
                                <div
                                    key={`${i}-${i === heroIndex ? heroKey : 'idle'}`}
                                    className="hero-progress-fill"
                                ></div>
                            </div>
                        ))}
                    </div>
                    <button className="hero-slide-btn" onClick={nextHeroSlide} title="Next Slide">›</button>
                    <div className="hero-caption-pill" id="heroCaptionPill">
                        {heroSlides[heroIndex].caption}
                    </div>
                </div>
            </section>

            {/* About Section with Collage */}
            <section className="section about" id="about">
                <div className="about-grid">
                    <div className="about-collage reveal-left">
                        <div className="about-collage-img tall">
                            <img src="/images/wood_15.jpg" alt="Modern Wooden Wall Panel Architecture" />
                        </div>
                        <div className="about-collage-img short">
                            <img src="/images/wood_07.jpg" alt="Intricate Carved Wooden Coffee Table" />
                        </div>
                        <div className="about-collage-img short">
                            <img src="/images/wood_11.jpg" alt="Live Edge Coffee Table" />
                        </div>
                        <div className="about-badge-floating">
                            <div className="number">28+</div>
                            <div className="label">Years of Mastery</div>
                        </div>
                    </div>

                    <div className="about-text reveal-right">
                        <div className="section-label">Heritage & Mastery</div>
                        <h3>The Living Art of <span style={{ color: 'var(--wood-amber)', fontStyle: 'italic' }}>Bespoke Woodworking</span></h3>
                        <p>
                            Every slab of wood possesses an innate story etched through decades of grain, moisture, and sunlight. At Lansakara, we do not simply cut wood — we listen to its character, respecting natural curves, knots, and live edges.
                        </p>
                        <p>
                            From organic flow sofas and sculptured dining tables to intricate hand-carved coffee tables, our master craftsmen combine ancestral joinery with contemporary wabi-sabi aesthetics.
                        </p>

                        <div className="about-highlights">
                            <div className="highlight-item">
                                <strong>100% Solid Hardwoods</strong>
                                <span>Teak, Mahogany, Walnut & Cedar</span>
                            </div>
                            <div className="highlight-item">
                                <strong>Artisan Joinery</strong>
                                <span>Traditional Mortise & Tenon joints</span>
                            </div>
                            <div className="highlight-item">
                                <strong>Non-Toxic Oils</strong>
                                <span>Natural organic beeswaxes & eco finishes</span>
                            </div>
                            <div className="highlight-item">
                                <strong>Custom Commission</strong>
                                <span>Tailored to your architectural spaces</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Real-Time Interactive Three.js 3D Bespoke Chair Configurator */}
            <ChairConfigurator />

            {/* Products Section (Filterable Showcase) */}
            <section className="section products" id="products">
                <div className="section-header reveal">
                    <div className="section-label">Signature Creations</div>
                    <h2 className="section-title">Handcrafted Wood Collection</h2>
                    <p className="section-desc">
                        Select pieces handcrafted from sustainably harvested timbers, finished with botanical oils that highlight natural grains.
                    </p>
                </div>

                <div className="products-filter reveal">
                    <button
                        className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => filterCategory('all')}
                    >
                        All Masterpieces
                    </button>
                    <button
                        className={`filter-btn ${activeCategory === 'dining' ? 'active' : ''}`}
                        onClick={() => filterCategory('dining')}
                    >
                        Dining & Desks
                    </button>
                    <button
                        className={`filter-btn ${activeCategory === 'living' ? 'active' : ''}`}
                        onClick={() => filterCategory('living')}
                    >
                        Living & Sofas
                    </button>
                    <button
                        className={`filter-btn ${activeCategory === 'tables' ? 'active' : ''}`}
                        onClick={() => filterCategory('tables')}
                    >
                        Coffee Tables
                    </button>
                    <button
                        className={`filter-btn ${activeCategory === 'bedroom' ? 'active' : ''}`}
                        onClick={() => filterCategory('bedroom')}
                    >
                        Bed & Vanity
                    </button>
                </div>

                <div className="products-grid" id="productsGrid">
                    {/* Render Initial Catalog Products */}
                    {initialProducts.map((p) => {
                        const show = activeCategory === 'all' || p.category === activeCategory;
                        if (!show) return null;
                        return (
                            <div key={p.id} className="product-card reveal" data-category={p.category}>
                                <div className="product-thumb">
                                    <img src={p.img} alt={p.name} />
                                    {p.badge && <div className="product-badge-tag">{p.badge}</div>}
                                    <div className="product-overlay-action">
                                        <button
                                            className="product-quick-btn"
                                            onClick={() => inquireProduct(p.name, p.price, p.img)}
                                        >
                                            Order Bespoke
                                        </button>
                                    </div>
                                </div>
                                <div className="product-details">
                                    <span className="product-category">
                                        {p.category.toUpperCase()}
                                    </span>
                                    <h3 className="product-title">{p.name}</h3>
                                    <p className="product-spec">{p.spec}</p>
                                    <div className="product-footer">
                                        <span className="product-price">Rs. {p.price.toLocaleString()}</span>
                                        <button
                                            className="product-inquire"
                                            onClick={() => inquireProduct(p.name, p.price, p.img)}
                                        >
                                            Inquire →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Render Dynamic Admin Added Products */}
                    {adminProducts.map((p) => {
                        const cat = getFilterCat(p.category, p.name);
                        const show = activeCategory === 'all' || cat === activeCategory;
                        if (!show) return null;
                        const img = p.images && p.images[0] ? p.images[0] : '/images/wood_09.jpg';
                        const specText = p.shortDescription || p.woodType || p.dimensions || p.category || 'Handcrafted Solid Timber';
                        const priceNum = p.price || 0;
                        return (
                            <div key={p._id} className="product-card reveal" data-category={cat}>
                                <div className="product-thumb">
                                    <img
                                        src={img}
                                        alt={p.name}
                                        onError={(e) => { e.currentTarget.src = '/images/wood_09.jpg'; }}
                                    />
                                    {p.badge && <div className="product-badge-tag">{p.badge}</div>}
                                    <div className="product-overlay-action">
                                        <button
                                            className="product-quick-btn"
                                            onClick={() => inquireProduct(p.name, priceNum, img)}
                                        >
                                            Order Bespoke
                                        </button>
                                    </div>
                                </div>
                                <div className="product-details">
                                    <span className="product-category">
                                        {(p.category || 'Handcrafted').toUpperCase()}
                                    </span>
                                    <h3 className="product-title">{p.name}</h3>
                                    <p className="product-spec">{specText}</p>
                                    <div className="product-footer">
                                        <span className="product-price">Rs. {priceNum.toLocaleString()}</span>
                                        <button
                                            className="product-inquire"
                                            onClick={() => inquireProduct(p.name, priceNum, img)}
                                        >
                                            Inquire →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Parallax Craft Banner */}
            <section className="craft-banner">
                <div className="craft-banner-bg">
                    <img src="/images/wood_24.jpg" alt="Craftsmanship Texture" />
                </div>
                <div className="craft-banner-content reveal">
                    <div className="section-label" style={{ color: 'var(--gold)' }}>Uncompromising Passion</div>
                    <h2>Every Piece Tells a Century-Old Tale</h2>
                    <p>
                        From sustainable forestry to slow natural seasoning, our wood matures gracefully over decades so your furniture remains a treasured family heirloom for generations.
                    </p>
                    <a href="#contact" className="btn-primary">Commission a Custom Work</a>
                </div>
            </section>

            {/* Masonry Art Gallery (Artwork & Details) */}
            <section className="section gallery" id="gallery">
                <div className="section-header reveal">
                    <div className="section-label">Visual Inspiration</div>
                    <h2 className="section-title">The Artistry of Grain & Form</h2>
                    <p className="section-desc">
                        An artistic retrospective of our custom installations, live edge coffee tables, and contemporary wood sculptures.
                    </p>
                </div>

                <div className="masonry-grid">
                    <div className="masonry-item w-2 h-2 reveal">
                        <img src="/images/wood_06.jpg" alt="Organic Table Creations" />
                        <div className="masonry-overlay">
                            <h4>Organic Table Creations</h4>
                            <p>Fluid Form live edge sculptures</p>
                        </div>
                    </div>
                    <div className="masonry-item h-2 reveal">
                        <img src="/images/wood_02.jpg" alt="Sculpted Monolith Bench" />
                        <div className="masonry-overlay">
                            <h4>Monolithic Timber Bench</h4>
                            <p>Hand-carved organic contours</p>
                        </div>
                    </div>
                    <div className="masonry-item reveal">
                        <img src="/images/wood_16.jpg" alt="Live Edge Rustic Centerpiece" />
                        <div className="masonry-overlay">
                            <h4>Reclaimed Centerpiece</h4>
                            <p>Farmhouse natural wood art</p>
                        </div>
                    </div>
                    <div className="masonry-item reveal">
                        <img src="/images/wood_08.jpg" alt="Elvarenne Black Solid Wood Table" />
                        <div className="masonry-overlay">
                            <h4>Elvarenne Charcoal Table</h4>
                            <p>Sumi-e inspired finish</p>
                        </div>
                    </div>
                    <div className="masonry-item w-2 reveal">
                        <img src="/images/wood_26.jpg" alt="Timeless Honest Materials" />
                        <div className="masonry-overlay">
                            <h4>Honest Raw Materials</h4>
                            <p>Subtle grain textures and oil finish</p>
                        </div>
                    </div>
                    <div className="masonry-item reveal">
                        <img src="/images/wood_18.jpg" alt="Rustic Eco Tables" />
                        <div className="masonry-overlay">
                            <h4>Eco-Friendly Rustic</h4>
                            <p>Sustainably reclaimed timber</p>
                        </div>
                    </div>
                    <div className="masonry-item reveal">
                        <img src="/images/wood_29.jpg" alt="Decor Stand Pedestal" />
                        <div className="masonry-overlay">
                            <h4>Minimalist Timber Pedestal</h4>
                            <p>Geometric live edge sculpture</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Us & Features */}
            <section className="section features" id="features">
                <div className="section-header reveal">
                    <div className="section-label">The Lansakara Standard</div>
                    <h2 className="section-title">Why Connoisseurs Choose Us</h2>
                    <p className="section-desc">
                        We believe true luxury is built slowly with honest materials, master craftsmanship, and timeless design.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card reveal">
                        <div className="feature-icon">🌳</div>
                        <h4>Sustainably Sourced</h4>
                        <p>Only aged, reclaimed, or certified timber from responsibly managed forests.</p>
                    </div>
                    <div className="feature-card reveal">
                        <div className="feature-icon">📐</div>
                        <h4>Bespoke Tailoring</h4>
                        <p>Every dimension, edge profile, and wood tone tailored precisely to your floor plan.</p>
                    </div>
                    <div className="feature-card reveal">
                        <div className="feature-icon">🛡️</div>
                        <h4>Lifetime Guarantee</h4>
                        <p>Heirloom-grade craftsmanship backed by our multigenerational warranty.</p>
                    </div>
                    <div className="feature-card reveal">
                        <div className="feature-icon">🚚</div>
                        <h4>White Glove Delivery</h4>
                        <p>Direct doorstep placement and installation by our experienced in-house crew.</p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats">
                <div className="stats-grid">
                    <div className="stat-item reveal">
                        <div className="stat-number" data-target="3200">0</div>
                        <div className="stat-label">Bespoke Works Crafted</div>
                    </div>
                    <div className="stat-item reveal">
                        <div className="stat-number" data-target="28">0</div>
                        <div className="stat-label">Years of Heritage</div>
                    </div>
                    <div className="stat-item reveal">
                        <div className="stat-number" data-target="100">0</div>
                        <div className="stat-label">Solid Hardwood</div>
                    </div>
                    <div className="stat-item reveal">
                        <div className="stat-number" data-target="24">0</div>
                        <div className="stat-label">Design Accolades</div>
                    </div>
                </div>
            </section>

            {/* Testimonials Slider & Patron Reviews */}
            <section className="section testimonials" id="testimonials">
                <div className="section-header reveal">
                    <div className="section-label">Patron Reflections</div>
                    <h2 className="section-title">Treasured in Every Home</h2>
                    <div className="reviews-summary-bar" id="reviewsSummaryBar">
                        <div className="reviews-score-pill">
                            <span className="gold-stars" id="headerGoldStars">{starStr}</span>
                            <span id="headerRatingText">{reviewsScore.average.toFixed(1)} / 5.0 Rating</span>
                            <span style={{ color: 'var(--text-light)', fontWeight: 400 }} id="headerReviewsCount">
                                · {reviewsScore.total} Verified Patrons
                            </span>
                        </div>
                        <button
                            className={`btn-write-review ${hasReviewed ? 'submitted' : ''}`}
                            id="openReviewModalBtn"
                            onClick={openReviewModal}
                        >
                            <i className="fas fa-feather-alt"></i>{' '}
                            {hasReviewed ? '✓ Review Shared' : 'Share Your Review'}
                        </button>
                    </div>
                </div>

                <div className="slider-controls-wrap reveal">
                    <button
                        className="slider-arrow-btn slider-arrow-prev"
                        onClick={() => setActiveReviewIdx((prev) => (prev - 1 + reviews.length) % reviews.length)}
                        aria-label="Previous Review"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                        className="slider-arrow-btn slider-arrow-next"
                        onClick={() => setActiveReviewIdx((prev) => (prev + 1) % reviews.length)}
                        aria-label="Next Review"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>

                    <div className="testimonials-slider">
                        <div
                            className="testimonials-track"
                            id="testimonialsTrack"
                            style={{ transform: `translateX(-${activeReviewIdx * 100}%)` }}
                        >
                            {reviews.map((r, i) => (
                                <div key={r._id || i} className="testimonial-item">
                                    <div className="testimonial-stars">
                                        {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
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

                        <div className="testimonials-dots" id="testimonialDots">
                            {reviews.map((_, i) => (
                                <div
                                    key={i}
                                    className={`test-dot ${i === activeReviewIdx ? 'active' : ''}`}
                                    onClick={() => setActiveReviewIdx(i)}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ PATRON REVIEW SUBMISSION MODAL ═══ */}
            {isReviewModalOpen && (
                <div className="review-modal-overlay open" id="reviewModalOverlay">
                    <div className="review-modal">
                        <button className="review-modal-close" onClick={closeReviewModal}>&times;</button>
                        <div className="review-modal-title">Share Your Experience</div>
                        <div className="review-modal-sub">
                            Each patron is invited to share one authentic review of their Lansakara bespoke timber piece.
                        </div>

                        {reviewAlert.text && (
                            <div className={`review-alert ${reviewAlert.type}`} style={{ display: 'block' }}>
                                {reviewAlert.text}
                            </div>
                        )}

                        <form id="patronReviewForm" onSubmit={handleReviewSubmit}>
                            <div className="review-form-group">
                                <label>Overall Rating *</label>
                                <div className="review-star-selector" id="starSelector">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                            key={star}
                                            className={`fas fa-star star-btn ${reviewRating >= star ? 'active' : ''}`}
                                            data-rating={star}
                                            onClick={() => setReviewRating(star)}
                                        ></i>
                                    ))}
                                    <span className="star-label-desc" id="starLabelDesc">
                                        {reviewRating === 5 && '5 Stars — Exceptional'}
                                        {reviewRating === 4 && '4 Stars — Highly Impressed'}
                                        {reviewRating === 3 && '3 Stars — Good Craftsmanship'}
                                        {reviewRating === 2 && '2 Stars — Acceptable'}
                                        {reviewRating === 1 && '1 Star — Needs Improvement'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="review-form-group">
                                    <label>Your Full Name *</label>
                                    <input
                                        type="text"
                                        className="review-form-input"
                                        id="revName"
                                        placeholder="e.g. Priyantha Jayasuriya"
                                        required
                                        value={reviewName}
                                        onChange={(e) => setReviewName(e.target.value)}
                                    />
                                </div>
                                <div className="review-form-group">
                                    <label>Email Address * (1 Review Per Patron)</label>
                                    <input
                                        type="email"
                                        className="review-form-input"
                                        id="revEmail"
                                        placeholder="e.g. priyantha@gmail.com"
                                        required
                                        value={reviewEmail}
                                        onChange={(e) => setReviewEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="review-form-group">
                                    <label>City / Location</label>
                                    <input
                                        type="text"
                                        className="review-form-input"
                                        id="revLocation"
                                        placeholder="e.g. Colombo 07, Kandy, Galle"
                                        value={reviewLocation}
                                        onChange={(e) => setReviewLocation(e.target.value)}
                                    />
                                </div>
                                <div className="review-form-group">
                                    <label>Furniture Piece Commissioned</label>
                                    <input
                                        type="text"
                                        className="review-form-input"
                                        id="revProduct"
                                        placeholder="e.g. Royal Dining Table or 3D Chair"
                                        value={reviewProduct}
                                        onChange={(e) => setReviewProduct(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="review-form-group">
                                <label>Your Review & Impressions *</label>
                                <textarea
                                    className="review-form-textarea"
                                    id="revQuote"
                                    rows="4"
                                    placeholder="Describe the woodwork quality, finishing, timber grain, and your bespoke experience..."
                                    required
                                    value={reviewQuote}
                                    onChange={(e) => setReviewQuote(e.target.value)}
                                ></textarea>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="btn-write-review"
                                    style={{ background: '#2C1E12', color: '#A89A8E' }}
                                    onClick={closeReviewModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-write-review"
                                    id="submitReviewBtn"
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

            {/* Contact & Bespoke Commission Form */}
            <section className="section contact" id="contact">
                <div className="section-header reveal">
                    <div className="section-label">Commission Your Piece</div>
                    <h2 className="section-title">Let’s Create Something Eternal</h2>
                    <p className="section-desc">
                        Have a bespoke design in mind or want to customize one of our signature works? Our artisan team is ready to assist.
                    </p>
                </div>

                <div className="contact-grid">
                    <div className="contact-info reveal-left">
                        <h3>Visit Our Studio Workshop</h3>
                        <p>
                            Walk through our workshop, smell the fragrant sawdust of natural teak and cedar, and select the exact timber slab for your custom masterpiece.
                        </p>

                        <div className="contact-detail">
                            <div className="icon">📍</div>
                            <div className="text">
                                <strong>Studio & Showroom</strong>
                                <span>42 Timber Artisans Way, Colombo 07, Sri Lanka</span>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <div className="icon">📞</div>
                            <div className="text">
                                <strong>Direct Consultations</strong>
                                <span>+94 11 234 5678 / +94 77 123 4567</span>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <div className="icon">✉️</div>
                            <div className="text">
                                <strong>Artisan Concierge</strong>
                                <span>bespoke@lansakara-furniture.com</span>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <div className="icon">🕒</div>
                            <div className="text">
                                <strong>Opening Hours</strong>
                                <span>Mon – Sat: 9:00 AM – 6:30 PM (Private appointments welcomed)</span>
                            </div>
                        </div>
                    </div>

                    <form className="contact-form reveal-right" id="bespokeForm" onSubmit={handleFormSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="custName"
                                    placeholder="Your Name"
                                    required
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    id="custEmail"
                                    placeholder="Your Email"
                                    required
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="tel"
                                    id="custPhone"
                                    placeholder="Phone / WhatsApp"
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <select
                                    id="custProductType"
                                    value={contactForm.productType}
                                    onChange={(e) => setContactForm({ ...contactForm, productType: e.target.value })}
                                >
                                    <option value="">Select Furniture Type</option>
                                    <option value="Lansakara Royal Bespoke Chair">Lansakara Royal Bespoke Chair (3D Studio)</option>
                                    <option value="Live Edge Dining Table">Live Edge Dining Table</option>
                                    <option value="Organic Wood Sofa">Organic Wood Sofa / Lounge</option>
                                    <option value="Sculpted Coffee Table">Sculpted Coffee Table</option>
                                    <option value="Solid Wood Bed">Bedroom Suite / Bed Frame</option>
                                    <option value="Royal Carved Vanity">Vanity / Dressing Table</option>
                                    <option value="Custom Architecture">Wall Panels & Architectural Wood</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <textarea
                                id="custMessage"
                                placeholder="Tell us about your space, dimensions, preferred wood species, or custom ideas..."
                                required
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            ></textarea>
                        </div>

                        <button type="submit" className="form-submit-btn" id="submitBtn">
                            Send Custom Inquiry
                        </button>
                        {contactSuccess && (
                            <div
                                id="orderSuccessMsg"
                                style={{
                                    display: 'block',
                                    marginTop: '16px',
                                    padding: '16px 20px',
                                    background: 'rgba(39, 174, 96, 0.15)',
                                    border: '1px solid #27ae60',
                                    borderRadius: '6px',
                                    color: '#2ecc71',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6'
                                }}
                            >
                                ✓ Thank you! Your custom commission inquiry has been sent to our master artisan via WhatsApp.
                            </div>
                        )}
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">Lansakara <span>Furniture</span></div>
                        <p>
                            Dedicated to the pure art of handcrafted solid wood furniture. Hand-carved, slow-seasoned, and lovingly finished for discerning homeowners worldwide.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Collections</h4>
                        <ul>
                            <li><a href="#products">Live Edge Dining</a></li>
                            <li><a href="#products">Organic Flow Sofas</a></li>
                            <li><a href="#products">Sculpted Coffee Tables</a></li>
                            <li><a href="#products">Heirloom Beds</a></li>
                            <li><a href="#products">Hand-Carved Vanities</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Craftsmanship</h4>
                        <ul>
                            <li><a href="#about">Our Wood Heritage</a></li>
                            <li><a href="#gallery">Art Gallery</a></li>
                            <li><a href="#features">Sustainable Forestry</a></li>
                            <li><a href="#about">Mortise & Tenon Joinery</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Navigation & Privileges</h4>
                        <ul>
                            <li><Link href="/checkout">Bespoke Checkout (10% Card Off)</Link></li>
                            <li><Link href="/admin">Master Artisan Admin</Link></li>
                            <li><a href="#testimonials">Verified Patron Reviews</a></li>
                            <li><a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer">WhatsApp Concierge</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 Lansakara Furniture Ceylon. All rights reserved. Handcrafted with reverence for nature.</p>
                </div>
            </footer>

            {/* Back to top button */}
            <button
                className="back-to-top"
                id="backToTop"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                ↑
            </button>
        </div>
    );
}
