'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState(''); // '' | 'success' | 'error'

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!newsletterEmail || !newsletterEmail.includes('@')) {
            setNewsletterStatus('error');
            return;
        }
        setNewsletterStatus('success');
        setNewsletterEmail('');
    };

    return (
        <footer className="footer-luxury" id="footer">
            {/* ═══════════════════════════════════════════════════════════
                1. VIP PRIVATE CLIENT NEWSLETTER DISPATCH
            ═══════════════════════════════════════════════════════════ */}
            <div className="footer-vip-banner">
                <div className="footer-vip-inner">
                    <div className="footer-vip-text">
                        <span className="footer-vip-badge">⚜ Private Client Register</span>
                        <h3 className="footer-vip-title">
                            Receive Artisanal Dispatches & <span className="gold-italic">Private Previews</span>
                        </h3>
                        <p className="footer-vip-desc">
                            Gain privileged first access to newly seasoned Ceylon timber log allocations, private showroom exhibitions, and bespoke commissions before public release.
                        </p>
                    </div>

                    <div className="footer-vip-form-wrap">
                        {newsletterStatus === 'success' ? (
                            <div className="footer-vip-success">
                                <i className="fas fa-certificate"></i>
                                <div>
                                    <strong>Invitation Confirmed</strong>
                                    <span>Welcome to the Lansakara Private Registry. An artisanal welcome dispatch will arrive in your inbox.</span>
                                </div>
                            </div>
                        ) : (
                            <form className="footer-vip-form" onSubmit={handleNewsletterSubmit}>
                                <div className="footer-vip-input-group">
                                    <i className="far fa-envelope footer-vip-icon"></i>
                                    <input
                                        type="email"
                                        placeholder="Enter your private or corporate email address..."
                                        value={newsletterEmail}
                                        onChange={(e) => {
                                            setNewsletterEmail(e.target.value);
                                            if (newsletterStatus) setNewsletterStatus('');
                                        }}
                                        required
                                        className="footer-vip-input"
                                    />
                                    <button type="submit" className="footer-vip-btn">
                                        Request Access →
                                    </button>
                                </div>
                                {newsletterStatus === 'error' && (
                                    <p className="footer-vip-error">Please provide a valid email address.</p>
                                )}
                                <span className="footer-vip-note">
                                    🔒 Strict privacy honored. Zero spam. Unsubscribe at any time.
                                </span>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                2. MAIN 4-COLUMN LUXURY FOOTER GRID
            ═══════════════════════════════════════════════════════════ */}
            <div className="footer-luxury-container">
                <div className="footer-luxury-grid">
                    {/* COL 1: MAISON & HERITAGE */}
                    <div className="footer-col-brand">
                        <div className="footer-luxury-logo">
                            Lansakara <span className="gold-serif">Furniture</span>
                        </div>
                        <div className="footer-brand-crest">
                            <span>⚜ EST. CEYLON 1994 ⚜</span>
                        </div>
                        <p className="footer-brand-bio">
                            Dedicated to the sacred art of living Sri Lankan timber. Hand-sculpted, slow-seasoned across years, and bound with ancestral mortise-and-tenon joinery for discerning residences worldwide.
                        </p>

                        <div className="footer-cert-tags">
                            <span className="footer-cert-pill">
                                <i className="fas fa-leaf"></i> 100% Plantation Timber
                            </span>
                            <span className="footer-cert-pill">
                                <i className="fas fa-shield-alt"></i> Lifetime Joinery Warranty
                            </span>
                        </div>

                        {/* Social Presence */}
                        <div className="footer-social-row">
                            <span className="footer-social-label">Follow the Atelier:</span>
                            <div className="footer-social-icons">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-pill-btn instagram">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="social-pill-btn pinterest">
                                    <i className="fab fa-pinterest-p"></i>
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-pill-btn facebook">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-pill-btn youtube">
                                    <i className="fab fa-youtube"></i>
                                </a>
                                <a href="https://wa.me/94743153951" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Concierge" className="social-pill-btn whatsapp">
                                    <i className="fab fa-whatsapp"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* COL 2: MASTER COLLECTIONS */}
                    <div className="footer-luxury-col">
                        <h4 className="footer-col-title">Master Collections</h4>
                        <ul className="footer-nav-list">
                            <li><a href="#products"><i className="fas fa-angle-right"></i> Live Edge Dining Tables</a></li>
                            <li><a href="#3d-chair"><i className="fas fa-angle-right"></i> 3D Royal Bespoke Armchairs</a></li>
                            <li><a href="#products"><i className="fas fa-angle-right"></i> Sculptural Living Room Suites</a></li>
                            <li><a href="#products"><i className="fas fa-angle-right"></i> Heirloom Upholstered Beds</a></li>
                            <li><a href="#products"><i className="fas fa-angle-right"></i> Hand-Carved Royal Vanities</a></li>
                            <li><a href="#materials"><i className="fas fa-angle-right"></i> Ceylon Rare Timber Gallery</a></li>
                            <li><a href="#products"><i className="fas fa-angle-right"></i> Solid Teak Slabs & Slabs</a></li>
                        </ul>
                    </div>

                    {/* COL 3: ATELIER & CRAFTSMANSHIP */}
                    <div className="footer-luxury-col">
                        <h4 className="footer-col-title">Atelier & Joinery</h4>
                        <ul className="footer-nav-list">
                            <li><a href="#about"><i className="fas fa-angle-right"></i> Ancestral Ceylon Wood Heritage</a></li>
                            <li><a href="#materials"><i className="fas fa-angle-right"></i> The Kiln-Drying & Seasoning Art</a></li>
                            <li><a href="#about"><i className="fas fa-angle-right"></i> Mortise & Tenon Architecture</a></li>
                            <li><a href="#features"><i className="fas fa-angle-right"></i> Organic Beeswax & Oil Finishes</a></li>
                            <li><a href="#gallery"><i className="fas fa-angle-right"></i> Curated Residence Showcase</a></li>
                            <li><a href="#testimonials"><i className="fas fa-angle-right"></i> Patron Reviews & Testimonials</a></li>
                            <li><Link href="/checkout"><i className="fas fa-angle-right"></i> Bespoke Commission Checkout</Link></li>
                        </ul>
                    </div>

                    {/* COL 4: CONCIERGE & SHOWROOM */}
                    <div className="footer-luxury-col">
                        <h4 className="footer-col-title">Atelier Concierge</h4>
                        <div className="footer-concierge-card">
                            <div className="concierge-item">
                                <i className="fas fa-map-marker-alt concierge-icon"></i>
                                <div>
                                    <strong>Flagship Atelier & Gallery</strong>
                                    <span>Kirimetiyawa, Ambanpola</span>
                                </div>
                            </div>

                            <div className="concierge-item">
                                <i className="far fa-clock concierge-icon"></i>
                                <div>
                                    <strong>Atelier Salon Hours</strong>
                                    <span>Monday – Saturday: 9:00 AM – 6:30 PM</span>
                                    <span className="salon-sub">Sunday: Private Viewings by Prior RSVP</span>
                                </div>
                            </div>

                            <div className="concierge-item">
                                <i className="fas fa-phone-alt concierge-icon"></i>
                                <div>
                                    <strong>Direct Concierge Desk</strong>
                                    <a href="tel:0743153951" className="concierge-phone-link">0743153951</a>
                                </div>
                            </div>

                            <div className="concierge-item">
                                <i className="far fa-envelope concierge-icon"></i>
                                <div>
                                    <strong>Bespoke Inquiries</strong>
                                    <a href="mailto:tharakajayasundara37@gmail.com" className="concierge-email-link">
                                        tharakajayasundara37@gmail.com
                                    </a>
                                </div>
                            </div>

                            <a
                                href="https://wa.me/94743153951?text=Hello%20Lansakara%20Furniture,%20I%20would%20like%20to%20inquire%20about%20a%20bespoke%20commission."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-wa-btn"
                            >
                                <i className="fab fa-whatsapp"></i>
                                <span>Direct WhatsApp Concierge (0743153951) →</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    3. TRUST GUARANTEES & ARTISANAL PLEDGES RIBBON
                ═══════════════════════════════════════════════════════════ */}
                <div className="footer-trust-ribbon">
                    <div className="footer-trust-item">
                        <div className="trust-icon-box">
                            <i className="fas fa-gem"></i>
                        </div>
                        <div className="trust-text">
                            <strong>Lifetime Structural Warranty</strong>
                            <span>Mortise & tenon joints guaranteed against warping or structural fatigue.</span>
                        </div>
                    </div>

                    <div className="footer-trust-item">
                        <div className="trust-icon-box">
                            <i className="fas fa-truck-moving"></i>
                        </div>
                        <div className="trust-text">
                            <strong>White-Glove Islandwide Delivery</strong>
                            <span>Careful residential placement and precision assembly by master joiners.</span>
                        </div>
                    </div>

                    <div className="footer-trust-item">
                        <div className="trust-icon-box">
                            <i className="fas fa-seedling"></i>
                        </div>
                        <div className="trust-text">
                            <strong>100% Plantation-Grown Timber</strong>
                            <span>Strict zero-deforestation pledge from certified sustainable Ceylon estates.</span>
                        </div>
                    </div>

                    <div className="footer-trust-item">
                        <div className="trust-icon-box">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <div className="trust-text">
                            <strong>Bank-Grade Secure Settlement</strong>
                            <span>Encrypted 256-bit transactions with instant booking confirmation receipts.</span>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    4. BOTTOM LEGAL, PAYMENT BADGES & COPYRIGHT
                ═══════════════════════════════════════════════════════════ */}
                <div className="footer-bottom-bar">
                    <div className="footer-bottom-row">
                        <div className="footer-copyright">
                            &copy; {new Date().getFullYear()} Lansakara Furniture Ceylon (Pvt) Ltd. All Rights Reserved. Hand-sculpted with reverence for nature.
                        </div>

                        {/* Payment Partner Badges */}
                        <div className="footer-payments-row">
                            <span className="payment-label">Accepted Settlements:</span>
                            <div className="payment-badges-dock">
                                <span className="payment-badge" title="Visa Card"><i className="fab fa-cc-visa"></i> Visa</span>
                                <span className="payment-badge" title="Mastercard"><i className="fab fa-cc-mastercard"></i> Mastercard</span>
                                <span className="payment-badge" title="American Express"><i className="fab fa-cc-amex"></i> Amex</span>
                                <span className="payment-badge" title="Apple Pay"><i className="fab fa-apple-pay"></i> Pay</span>
                                <span className="payment-badge" title="Bank Wire / Transfer"><i className="fas fa-university"></i> Bank Wire</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-legal-links">
                        <a href="#about">Terms of Commission</a>
                        <span className="dot">•</span>
                        <a href="#features">Timber Sustainability Charter</a>
                        <span className="dot">•</span>
                        <a href="#about">Warranty & Authenticity Certificate</a>
                        <span className="dot">•</span>
                        <a href="#checkout">White-Glove Shipping Policy</a>
                        <span className="dot">•</span>
                        <Link href="/admin">Artisan Portal Login</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
