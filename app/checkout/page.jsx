'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './checkout.css';

const districtDistances = [
    { label: 'Moratuwa / Panadura (Local Workshop Area)', km: 5 },
    { label: 'Colombo / Mount Lavinia / Dehiwala', km: 15 },
    { label: 'Negombo / Gampaha / Wattala', km: 45 },
    { label: 'Galle / Bentota / Southern Coast', km: 90 },
    { label: 'Kandy / Peradeniya / Central Hills', km: 115 },
    { label: 'Kurunegala / North Western', km: 95 },
    { label: 'Ratnapura / Sabaragamuwa', km: 85 },
    { label: 'Matara / Mirissa / Deep South', km: 135 },
    { label: 'Anuradhapura / Cultural Triangle', km: 210 },
    { label: 'Jaffna / Northern Province', km: 395 },
    { label: 'Custom Location / Other Province', km: 25 }
];

function CheckoutContent() {
    const searchParams = useSearchParams();

    // Server Settings
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

    // Product to Order
    const [product, setProduct] = useState({
        name: 'Lansakara Royal Bespoke Chair',
        price: 214500,
        image: '/images/lansakara_royal_chair.jpg',
        specs: 'Solid Hardwood • Live 3D Studio Configuration',
        woodSpec: '',
        fabricSpec: '',
        trimSpec: ''
    });

    // Form inputs
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState(districtDistances[1].label);
    const [deliveryKm, setDeliveryKm] = useState(15);
    const [notes, setNotes] = useState('');

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');

    // Slip upload
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState('');

    // Order status
    const [submitting, setSubmitting] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(null);

    // Load server settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (err) {
                console.warn('Using default checkout settings:', err);
            }
        }
        fetchSettings();
    }, []);

    // Load product from localStorage or query params
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lansakara_checkout_order');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setProduct((prev) => ({ ...prev, ...parsed }));
                    return;
                } catch (e) {}
            }
        }

        const qName = searchParams.get('product');
        const qPrice = searchParams.get('price');
        const qImg = searchParams.get('image');

        if (qName) {
            setProduct((prev) => ({
                ...prev,
                name: decodeURIComponent(qName),
                price: qPrice ? parseFloat(qPrice) : prev.price,
                image: qImg ? decodeURIComponent(qImg) : prev.image
            }));
        }
    }, [searchParams]);

    // Handle District Selection
    const handleDistrictChange = (e) => {
        const val = e.target.value;
        setDistrict(val);
        const match = districtDistances.find((d) => d.label === val);
        if (match) {
            setDeliveryKm(match.km);
        }
    };

    // Handle Receipt Upload
    const handleReceiptChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setReceiptFile(file);
        const reader = new FileReader();
        reader.onload = (evt) => {
            setReceiptPreview(evt.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Calculations
    const subtotal = product.price || 0;
    const km = Math.max(1, parseFloat(deliveryKm) || 15);
    const ratePerKm = settings.deliveryRatePerKm || 100;
    const deliveryFee = km * ratePerKm;

    const cardDiscountPercent = paymentMethod === 'card' ? settings.cardDiscountPercent || 10 : 0;
    const discountAmount = Math.round((subtotal * cardDiscountPercent) / 100);
    const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

    const codAdvancePercent = settings.codAdvancePercent || 20;
    const advanceAmount = paymentMethod === 'cod' ? Math.round((finalTotal * codAdvancePercent) / 100) : finalTotal;
    const remainingBalance = paymentMethod === 'cod' ? finalTotal - advanceAmount : 0;

    // Handle Order Submission
    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (!customerName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
            alert('Please fill in your Name, Phone, Email, and Delivery Address.');
            return;
        }

        let maskedCard = '';
        if (paymentMethod === 'card') {
            const raw = cardNumber.replace(/\s+/g, '');
            if (raw.length < 12) {
                alert('Please enter a valid 16-digit Credit or Debit Card number.');
                return;
            }
            maskedCard = '•••• •••• •••• ' + raw.slice(-4);
        }

        if ((paymentMethod === 'bank_transfer' || paymentMethod === 'cod') && !receiptFile) {
            const proceed = confirm(
                paymentMethod === 'cod'
                    ? `A ${codAdvancePercent}% transport commitment advance is required for bespoke delivery. If you haven't transferred yet, you can send the slip via WhatsApp after placing the order. Proceed?`
                    : 'You have not uploaded the bank deposit slip yet. You can also send it to our artisan team via WhatsApp after placing. Proceed?'
            );
            if (!proceed) return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append('customerName', customerName.trim());
        formData.append('email', email.trim().toLowerCase());
        formData.append('phone', phone.trim());
        formData.append('address', address.trim());
        formData.append('cityDistrict', district);
        formData.append('productName', product.name);
        formData.append('productImage', product.image || '');
        formData.append('woodSpec', product.woodSpec || '');
        formData.append('fabricSpec', product.fabricSpec || '');
        formData.append('trimSpec', product.trimSpec || '');
        formData.append('customMessage', notes.trim());
        formData.append('subtotal', subtotal);
        formData.append('deliveryDistanceKm', km);
        formData.append('deliveryRatePerKm', ratePerKm);
        formData.append('deliveryFee', deliveryFee);
        formData.append('paymentMethod', paymentMethod);
        formData.append('cardDiscountPercent', cardDiscountPercent);
        formData.append('discountAmount', discountAmount);
        formData.append('totalPrice', finalTotal);
        formData.append('advanceAmount', advanceAmount);
        formData.append('remainingBalance', remainingBalance);
        formData.append('maskedCard', maskedCard);

        if (receiptFile) {
            formData.append('receipt', receiptFile);
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to place order');

            const orderIdStr = data.orderId || 'LAN-' + Date.now().toString().slice(-6);

            setOrderConfirmed({
                orderId: orderIdStr,
                productName: product.name,
                totalPrice: finalTotal,
                paymentMethod: paymentMethod,
                customerPhone: phone.trim()
            });

            // Clear draft
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lansakara_checkout_order');
            }
        } catch (err) {
            alert('Order placement error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--wood-dark)', color: 'var(--text)' }}>
            {/* Top Checkout Header */}
            <header className="checkout-nav">
                <Link href="/" className="brand-wrap">
                    <span className="brand-title">LANSAKARA <span>BESPOKE</span></span>
                </Link>
                <div className="concierge-badge">
                    <i className="fas fa-shield-alt" style={{ color: 'var(--gold)' }}></i>
                    <span>Artisan Certified Checkout</span>
                </div>
                <Link href="/" className="back-btn">
                    <i className="fas fa-arrow-left"></i> Return to Gallery
                </Link>
            </header>

            <main className="checkout-container">
                <div className="page-header">
                    <div className="page-eyebrow">Direct Atelier Commission</div>
                    <h1 className="page-heading">Bespoke Order & Secure Payment</h1>
                </div>

                <form onSubmit={handleSubmitOrder}>
                    <div className="checkout-grid">
                        {/* LEFT COLUMN: PRODUCT & SHIPPING */}
                        <div className="left-col">
                            {/* Product Summary */}
                            <div className="c-card">
                                <h3 className="card-title">
                                    <i className="fas fa-couch"></i> Commission Piece
                                </h3>
                                <div className="prod-summary-box">
                                    <div className="prod-img-wrap">
                                        <img
                                            src={product.image || '/images/wood_09.jpg'}
                                            alt={product.name}
                                            onError={(e) => { e.currentTarget.src = '/images/wood_09.jpg'; }}
                                        />
                                    </div>
                                    <div className="prod-meta">
                                        <h4>{product.name}</h4>
                                        <p className="prod-specs-tag">
                                            {product.specs ||
                                                (product.woodSpec
                                                    ? `Wood: ${product.woodSpec} • Fabric: ${product.fabricSpec || 'Linen'} • Trim: ${product.trimSpec || 'Gold'}`
                                                    : 'Solid Timber Handcrafted Masterpiece')}
                                        </p>
                                        <div className="prod-price-tag">
                                            Rs. {(product.price || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client & Delivery Details */}
                            <div className="c-card">
                                <h3 className="card-title">
                                    <i className="fas fa-map-marker-alt"></i> Patron & Delivery Destination
                                </h3>

                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        className="form-input"
                                        required
                                        placeholder="e.g. Deshabandu Gamini Silva"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone / WhatsApp *</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            required
                                            placeholder="+94 77 123 4567"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            required
                                            placeholder="gamini@domain.lk"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Delivery Street Address *</label>
                                    <input
                                        className="form-input"
                                        required
                                        placeholder="House / Villa No, Street Name"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">City / District *</label>
                                        <select
                                            className="form-select"
                                            value={district}
                                            onChange={handleDistrictChange}
                                        >
                                            {districtDistances.map((d, i) => (
                                                <option key={i} value={d.label}>
                                                    {d.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Distance from Moratuwa Atelier (km)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            min="1"
                                            max="600"
                                            value={deliveryKm}
                                            onChange={(e) => setDeliveryKm(parseFloat(e.target.value) || 1)}
                                        />
                                    </div>
                                </div>

                                <div className="delivery-helper">
                                    <i className="fas fa-truck-moving"></i>{' '}
                                    <span>
                                        White-glove delivery: Rs. {ratePerKm.toLocaleString()} per km from Moratuwa Workshop
                                    </span>
                                </div>
                            </div>

                            {/* Bespoke Notes */}
                            <div className="c-card">
                                <h3 className="card-title">
                                    <i className="fas fa-pen-fancy"></i> Custom Requests & Notes
                                </h3>
                                <textarea
                                    className="form-textarea"
                                    rows="2"
                                    placeholder="Room floor level, preferred wood stain adjustments, or delivery timing..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: PAYMENT METHODS & TOTALS */}
                        <div className="right-col">
                            <div className="c-card">
                                <h3 className="card-title">
                                    <i className="fas fa-wallet"></i> Payment Method
                                </h3>

                                <div className="payment-options-grid">
                                    {/* Option 1: Card */}
                                    <div
                                        className={`payment-card-opt ${paymentMethod === 'card' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <div className="p-opt-left">
                                            <div className="p-opt-radio"></div>
                                            <div className="p-opt-text">
                                                <h5>Credit / Debit Card</h5>
                                                <p>Instant secure payment</p>
                                            </div>
                                        </div>
                                        <span className="p-opt-badge badge-discount">
                                            {settings.cardDiscountPercent || 10}% OFF
                                        </span>
                                    </div>

                                    {/* Option 2: Bank Deposit */}
                                    <div
                                        className={`payment-card-opt ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('bank_transfer')}
                                    >
                                        <div className="p-opt-left">
                                            <div className="p-opt-radio"></div>
                                            <div className="p-opt-text">
                                                <h5>Direct Bank Transfer</h5>
                                                <p>Deposit & upload transfer slip</p>
                                            </div>
                                        </div>
                                        <span
                                            className="p-opt-badge badge-advance"
                                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'none' }}
                                        >
                                            Bank Slip
                                        </span>
                                    </div>

                                    {/* Option 3: Cash on Delivery with Advance */}
                                    <div
                                        className={`payment-card-opt ${paymentMethod === 'cod' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('cod')}
                                    >
                                        <div className="p-opt-left">
                                            <div className="p-opt-radio"></div>
                                            <div className="p-opt-text">
                                                <h5>Cash on Delivery (COD)</h5>
                                                <p>{codAdvancePercent}% commitment advance + balance upon delivery</p>
                                            </div>
                                        </div>
                                        <span className="p-opt-badge badge-advance">
                                            {codAdvancePercent}% Advance
                                        </span>
                                    </div>
                                </div>

                                {/* Card Input Form */}
                                {paymentMethod === 'card' && (
                                    <div className="pay-detail-box active" style={{ display: 'block' }}>
                                        <div className="card-icons">
                                            <i className="fab fa-cc-visa"></i>
                                            <i className="fab fa-cc-mastercard"></i>
                                            <i className="fab fa-cc-amex"></i>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Card Number</label>
                                            <input
                                                className="form-input"
                                                placeholder="•••• •••• •••• ••••"
                                                maxLength="19"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Expiry Date</label>
                                                <input
                                                    className="form-input"
                                                    placeholder="MM/YY"
                                                    maxLength="5"
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">CVV / CVC</label>
                                                <input
                                                    className="form-input"
                                                    placeholder="•••"
                                                    maxLength="4"
                                                    value={cardCvv}
                                                    onChange={(e) => setCardCvv(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Cardholder Name</label>
                                            <input
                                                className="form-input"
                                                placeholder="Name as printed on card"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value)}
                                            />
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                                            🔒 256-bit TLS bank-grade encrypted verification.
                                        </p>
                                    </div>
                                )}

                                {/* Bank / COD Slip Upload Area */}
                                {paymentMethod !== 'card' && (
                                    <div className="pay-detail-box active" style={{ display: 'block' }}>
                                        <div className="bank-info-grid">
                                            <div className="bank-info-row">
                                                <span className="lbl">Bank:</span>
                                                <span className="val">{settings.bankDetails?.bankName || 'Commercial Bank of Ceylon'}</span>
                                            </div>
                                            <div className="bank-info-row">
                                                <span className="lbl">Account Name:</span>
                                                <span className="val">{settings.bankDetails?.accountName || 'Lansakara Furniture (Pvt) Ltd'}</span>
                                            </div>
                                            <div className="bank-info-row">
                                                <span className="lbl">Account No:</span>
                                                <span className="val">{settings.bankDetails?.accountNumber || '1000847291'}</span>
                                            </div>
                                            <div className="bank-info-row">
                                                <span className="lbl">Branch:</span>
                                                <span className="val">{settings.bankDetails?.branch || 'Moratuwa Premium Branch'}</span>
                                            </div>
                                        </div>

                                        <label
                                            className="upload-receipt-area"
                                            style={{ display: 'block', cursor: 'pointer' }}
                                        >
                                            <i className="fas fa-file-invoice-dollar"></i>
                                            <p>
                                                {receiptFile
                                                    ? `✓ Attached: ${receiptFile.name}`
                                                    : paymentMethod === 'cod'
                                                        ? `Upload ${codAdvancePercent}% Advance Payment Slip / Transfer Screenshot`
                                                        : 'Upload Bank Deposit / Transfer Slip'}
                                            </p>
                                            <span>JPG, PNG or PDF (Max 12MB)</span>
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                style={{ display: 'none' }}
                                                onChange={handleReceiptChange}
                                            />
                                            {receiptPreview && (
                                                <img
                                                    src={receiptPreview}
                                                    alt="Receipt Preview"
                                                    className="receipt-preview-thumb"
                                                    style={{ display: 'block' }}
                                                />
                                            )}
                                        </label>
                                    </div>
                                )}

                                {/* Price Breakdown */}
                                <div style={{ marginTop: '24px' }}>
                                    <div className="breakdown-row">
                                        <span>Product Subtotal</span>
                                        <span>Rs. {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Delivery Fee ({km} km @ Rs. {ratePerKm})</span>
                                        <span>Rs. {deliveryFee.toLocaleString()}</span>
                                    </div>
                                    {paymentMethod === 'card' && (
                                        <div className="breakdown-row discount-row" style={{ display: 'flex' }}>
                                            <span>Card Payment Privilege ({cardDiscountPercent}%)</span>
                                            <span>-Rs. {discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="breakdown-row total-row">
                                        <span>Total Amount</span>
                                        <span>Rs. {finalTotal.toLocaleString()}</span>
                                    </div>

                                    {paymentMethod === 'cod' && (
                                        <div className="breakdown-row advance-row" style={{ display: 'flex' }}>
                                            <div>
                                                <strong>Advance Required Today ({codAdvancePercent}%):</strong>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    Remaining on Delivery: Rs. {remainingBalance.toLocaleString()}
                                                </div>
                                            </div>
                                            <strong style={{ fontSize: '16px', color: 'var(--gold)' }}>
                                                Rs. {advanceAmount.toLocaleString()}
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit-order"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Registering Bespoke Order...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-lock"></i> Confirm & Place Bespoke Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            {/* ═══════════════ ORDER SUCCESS MODAL ═══════════════ */}
            {orderConfirmed && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="success-card">
                        <div className="success-icon">
                            <i className="fas fa-check"></i>
                        </div>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', color: 'var(--gold)', marginBottom: '6px' }}>
                            Bespoke Order Confirmed!
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Thank you for trusting Lansakara handcrafted excellence. Your order has been registered in our artisan workshop.
                        </p>

                        <div className="order-ref-pill">
                            #{orderConfirmed.orderId}
                        </div>

                        <div
                            style={{
                                fontSize: '13px',
                                color: 'var(--text)',
                                marginBottom: '12px',
                                textAlign: 'left',
                                background: 'var(--wood-deep)',
                                padding: '14px',
                                borderRadius: '8px',
                                border: '1px solid var(--wood-border)'
                            }}
                        >
                            <div style={{ marginBottom: '6px' }}>
                                <strong>Product:</strong> <span>{orderConfirmed.productName}</span>
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <strong>Payment Method:</strong>{' '}
                                <span style={{ textTransform: 'capitalize' }}>
                                    {orderConfirmed.paymentMethod.replace('_', ' ')}
                                </span>
                            </div>
                            <div>
                                <strong>Total Investment:</strong>{' '}
                                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                                    Rs. {orderConfirmed.totalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="success-actions">
                            <a
                                href={`https://wa.me/94771234567?text=Hello%20Lansakara%20Artisans,%20I%20have%20placed%20Bespoke%20Order%20%23${orderConfirmed.orderId}%20for%20${encodeURIComponent(orderConfirmed.productName)}.%20Please%20confirm%20production%20timeline.`}
                                className="btn-whatsapp"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="fab fa-whatsapp" style={{ fontSize: '20px' }}></i> Chat with Artisan on WhatsApp
                            </a>
                            <Link href="/" className="btn-return">
                                Return to Collections Gallery
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <React.Suspense fallback={
            <div style={{ minHeight: '100vh', background: 'var(--wood-dark)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
                <span style={{ marginLeft: '12px', fontSize: '16px' }}>Loading Bespoke Checkout...</span>
            </div>
        }>
            <CheckoutContent />
        </React.Suspense>
    );
}

