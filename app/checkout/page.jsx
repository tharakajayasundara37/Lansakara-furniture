'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './checkout.css';

const districtDistances = [
    { label: 'Moratuwa / Panadura (Workshop Hub)', km: 5, time: '24–48 Hours' },
    { label: 'Colombo (Col 01–15) / Suburbs', km: 15, time: '1–2 Days' },
    { label: 'Mount Lavinia / Dehiwala / Ratmalana', km: 10, time: '1–2 Days' },
    { label: 'Negombo / Gampaha / Wattala / Ja-Ela', km: 45, time: '2–3 Days' },
    { label: 'Kalutara / Wadduwa / Beruwala / Aluthgama', km: 38, time: '2–3 Days' },
    { label: 'Galle / Bentota / Hikkaduwa / Unawatuna', km: 90, time: '3–4 Days' },
    { label: 'Matara / Mirissa / Weligama / Deep South', km: 135, time: '3–5 Days' },
    { label: 'Hambantota / Tangalle / Southern Port', km: 180, time: '4–5 Days' },
    { label: 'Kandy / Peradeniya / Gampola / Central Hills', km: 115, time: '3–4 Days' },
    { label: 'Kurunegala / Ambanpola / North Western', km: 95, time: '2–4 Days' },
    { label: 'Ratnapura / Kegalle / Sabaragamuwa', km: 85, time: '3–4 Days' },
    { label: 'Nuwara Eliya / Hatton / Hill Country', km: 160, time: '4–5 Days' },
    { label: 'Badulla / Bandarawela / Ella / Uva', km: 195, time: '4–6 Days' },
    { label: 'Anuradhapura / Cultural Triangle', km: 210, time: '4–6 Days' },
    { label: 'Puttalam / Chilaw / Wennappuwa', km: 110, time: '3–4 Days' },
    { label: 'Batticaloa / Trincomalee / Eastern Coast', km: 280, time: '5–7 Days' },
    { label: 'Jaffna / Kilinochchi / Northern Province', km: 395, time: '5–7 Days' },
    { label: 'Island-Wide Custom Address / Site Survey', km: 30, time: 'Coordinated by Concierge' }
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

    // Quantity
    const [quantity, setQuantity] = useState(1);

    // Form inputs
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [altPhone, setAltPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState(districtDistances[1].label);
    const [deliveryKm, setDeliveryKm] = useState(15);
    const [deliveryTimeframe, setDeliveryTimeframe] = useState('Standard (5–7 Business Days)');
    const [landmark, setLandmark] = useState('');
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

    // 1-Click Copy state
    const [copiedKey, setCopiedKey] = useState('');
    const [copiedInvoice, setCopiedInvoice] = useState(false);

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
        const qWood = searchParams.get('wood');

        if (qName) {
            setProduct((prev) => ({
                ...prev,
                name: decodeURIComponent(qName),
                price: qPrice ? parseFloat(qPrice) : prev.price,
                image: qImg ? decodeURIComponent(qImg) : prev.image,
                woodSpec: qWood ? decodeURIComponent(qWood) : prev.woodSpec
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

    // Card Input Formatters
    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 2) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setCardExpiry(val);
    };

    const handleCvvChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCardCvv(val);
    };

    const getCardBrand = () => {
        const raw = cardNumber.replace(/\s+/g, '');
        if (raw.startsWith('4')) return 'visa';
        if (/^(5[1-5]|2[2-7])/.test(raw)) return 'mastercard';
        if (/^3[47]/.test(raw)) return 'amex';
        return 'generic';
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

    const removeReceipt = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setReceiptFile(null);
        setReceiptPreview('');
    };

    // 1-Click Copy Function
    const handleCopy = (text, key) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(''), 2500);
        }
    };

    // Calculations
    const unitPrice = product.price || 0;
    const subtotal = unitPrice * quantity;
    const km = Math.max(1, parseFloat(deliveryKm) || 15);
    const ratePerKm = settings.deliveryRatePerKm || 100;
    const deliveryFee = km * ratePerKm;

    const cardDiscountPercent = paymentMethod === 'card' ? settings.cardDiscountPercent || 10 : 0;
    const discountAmount = Math.round((subtotal * cardDiscountPercent) / 100);
    const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

    const codAdvancePercent = settings.codAdvancePercent || 20;
    const advanceAmount = paymentMethod === 'cod' ? Math.round((finalTotal * codAdvancePercent) / 100) : finalTotal;
    const remainingBalance = paymentMethod === 'cod' ? finalTotal - advanceAmount : 0;

    const currentDistrictInfo = districtDistances.find((d) => d.label === district) || districtDistances[1];

    // Handle Order Submission
    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (!customerName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
            alert('Please fill in your Name, Primary Phone/WhatsApp, Email, and Delivery Address.');
            return;
        }

        let maskedCard = '';
        if (paymentMethod === 'card') {
            const raw = cardNumber.replace(/\s+/g, '');
            if (raw.length < 15) {
                alert('Please enter a valid 16-digit Credit or Debit Card number.');
                return;
            }
            maskedCard = '•••• •••• •••• ' + raw.slice(-4);
        }

        if ((paymentMethod === 'bank_transfer' || paymentMethod === 'cod') && !receiptFile) {
            const proceed = confirm(
                paymentMethod === 'cod'
                    ? `A ${codAdvancePercent}% transport commitment advance is standard for bespoke furniture delivery. You can easily share the deposit slip via WhatsApp (0743153951) after submitting. Would you like to proceed?`
                    : 'You haven’t uploaded the bank deposit slip yet. You can submit the order now and send the slip directly to our workshop on WhatsApp (0743153951). Proceed?'
            );
            if (!proceed) return;
        }

        setSubmitting(true);

        const customMessageCompiled = [
            notes.trim() ? `Notes: ${notes.trim()}` : '',
            landmark.trim() ? `Landmark: ${landmark.trim()}` : '',
            altPhone.trim() ? `Alt Phone: ${altPhone.trim()}` : '',
            `Timeframe: ${deliveryTimeframe}`,
            quantity > 1 ? `Quantity: ${quantity} units` : ''
        ].filter(Boolean).join(' | ');

        const formData = new FormData();
        formData.append('customerName', customerName.trim());
        formData.append('email', email.trim().toLowerCase());
        formData.append('phone', phone.trim());
        formData.append('address', address.trim());
        formData.append('cityDistrict', district);
        formData.append('productName', quantity > 1 ? `${product.name} (Qty: ${quantity})` : product.name);
        formData.append('productImage', product.image || '');
        formData.append('woodSpec', product.woodSpec || '');
        formData.append('fabricSpec', product.fabricSpec || '');
        formData.append('trimSpec', product.trimSpec || '');
        formData.append('customMessage', customMessageCompiled);
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
            const orderDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const orderTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const invoiceNum = 'LBA-INV-' + Date.now().toString().slice(-6);
            const certNum = 'PVN-' + Math.floor(100000 + Math.random() * 900000);

            setOrderConfirmed({
                orderId: orderIdStr,
                invoiceNo: invoiceNum,
                certificateNo: certNum,
                orderDate: orderDateStr,
                orderTime: orderTimeStr,
                productName: product.name,
                productImage: product.image || '',
                specs: product.specs || 'Solid Hardwood • Mastercraft Specification',
                woodSpec: product.woodSpec || 'Certified Kiln-Dried Ceylon Hardwood',
                fabricSpec: product.fabricSpec || 'Natural Linen / Full-Grain Leather',
                trimSpec: product.trimSpec || 'Satin Brass Hardware & Beeswax Patina',
                unitPrice: unitPrice,
                quantity: quantity,
                subtotal: subtotal,
                deliveryKm: km,
                deliveryRatePerKm: ratePerKm,
                deliveryFee: deliveryFee,
                deliveryTimeframe: deliveryTimeframe,
                cardDiscountPercent: cardDiscountPercent,
                discountAmount: discountAmount,
                totalPrice: finalTotal,
                advanceAmount: advanceAmount,
                remainingBalance: remainingBalance,
                paymentMethod: paymentMethod,
                maskedCard: maskedCard,
                customerName: customerName.trim(),
                customerPhone: phone.trim(),
                altPhone: altPhone.trim(),
                customerEmail: email.trim().toLowerCase(),
                address: address.trim(),
                district: district,
                landmark: landmark.trim(),
                notes: notes.trim()
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

    const handlePrintInvoice = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const handleCopyInvoice = () => {
        if (!orderConfirmed) return;
        const summaryText = `⚜ LANSAKARA BESPOKE ATELIER ⚜
OFFICIAL COMMISSION INVOICE & PROVENANCE CERTIFICATE
────────────────────────────────────────
Invoice No     : ${orderConfirmed.invoiceNo}
Order Ref      : #${orderConfirmed.orderId}
Provenance No  : ${orderConfirmed.certificateNo}
Date & Time    : ${orderConfirmed.orderDate} at ${orderConfirmed.orderTime}

PATRON DOSSIER:
Patron         : ${orderConfirmed.customerName}
Phone / WA     : ${orderConfirmed.customerPhone}${orderConfirmed.altPhone ? ` (Alt: ${orderConfirmed.altPhone})` : ''}
Email          : ${orderConfirmed.customerEmail}
Delivery Place : ${orderConfirmed.address}, ${orderConfirmed.district}
Transit Time   : ${orderConfirmed.deliveryTimeframe} (~${orderConfirmed.deliveryKm} km White-Glove Route)

COMMISSION SPECIFICATIONS:
Piece          : ${orderConfirmed.productName}
Timber         : ${orderConfirmed.woodSpec}
Upholstery/Trim: ${orderConfirmed.fabricSpec} • ${orderConfirmed.trimSpec}
Quantity       : ${orderConfirmed.quantity} Unit(s)
Unit Rate      : Rs. ${Number(orderConfirmed.unitPrice).toLocaleString()}

FINANCIAL SUMMARY:
Subtotal       : Rs. ${Number(orderConfirmed.subtotal).toLocaleString()}
White-Glove Fee: Rs. ${Number(orderConfirmed.deliveryFee).toLocaleString()}
${orderConfirmed.discountAmount > 0 ? `Privilege Disc : -Rs. ${Number(orderConfirmed.discountAmount).toLocaleString()} (${orderConfirmed.cardDiscountPercent}% Card Benefit)\n` : ''}TOTAL DUE      : Rs. ${Number(orderConfirmed.totalPrice).toLocaleString()}
Payment Method : ${orderConfirmed.paymentMethod.toUpperCase().replace('_', ' ')}${orderConfirmed.maskedCard ? ` (${orderConfirmed.maskedCard})` : ''}
${orderConfirmed.paymentMethod === 'cod' ? `Advance Paid   : Rs. ${Number(orderConfirmed.advanceAmount).toLocaleString()}\nBalance on Del : Rs. ${Number(orderConfirmed.remainingBalance).toLocaleString()}\n` : ''}
MASTER TIMBER & CRAFT GUARANTEE:
• 100% Sustainably Seasoned Hardwood (Kiln-Dried 8-10% EMC)
• Traditional Hand-Cut Mortise & Tenon Joinery
• 10-Year Mastercraft Structural Warranty
• Endorsed by Tharaka Jayasundara (Chief Master Craftsman)

Workshop: Kirimetiyawa, Ambanpola | Atelier: Moratuwa, Sri Lanka
Direct WhatsApp / Hotline: +94 74 315 3951
────────────────────────────────────────`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(summaryText);
            setCopiedInvoice(true);
            setTimeout(() => setCopiedInvoice(false), 2500);
        }
    };

    return (
        <div className="checkout-page-root">
            {/* Top Checkout Header */}
            <header className="checkout-nav">
                <Link href="/" className="brand-wrap">
                    <span className="brand-title">LANSAKARA <span>BESPOKE</span></span>
                </Link>
                <div className="concierge-badge">
                    <i className="fas fa-shield-alt" style={{ color: 'var(--gold)' }}></i>
                    <span>Artisan Certified Checkout</span>
                </div>
                <div className="checkout-nav-actions">
                    <a
                        href="https://wa.me/94743153951?text=Hello%20Lansakara%20Artisans,%20I%20am%20on%20the%20checkout%20page%20and%20would%20like%20assistance%20with%20my%20commission."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="concierge-live-pill"
                        title="Direct Artisan Hotline"
                    >
                        <i className="fab fa-whatsapp"></i>
                        <span>Concierge: 0743153951</span>
                    </a>
                    <Link href="/" className="back-btn">
                        <i className="fas fa-arrow-left"></i> Return to Gallery
                    </Link>
                </div>
            </header>

            <main className="checkout-container">
                <div className="page-header">
                    <div className="page-eyebrow">
                        <i className="fas fa-gem" style={{ marginRight: '6px' }}></i> Direct Atelier Commission
                    </div>
                    <h1 className="page-heading">Bespoke Order & Secure Payment</h1>
                    <p className="page-sub">
                        Each creation is meticulously crafted from sustainably cured Ceylon hardwoods. Review your specifications and confirm your delivery details below.
                    </p>
                </div>

                <form onSubmit={handleSubmitOrder}>
                    <div className="checkout-grid">
                        {/* ════════════════ LEFT COLUMN: PRODUCT & SHIPPING ════════════════ */}
                        <div className="left-col">
                            {/* Product Summary */}
                            <div className="c-card">
                                <div className="card-header-row">
                                    <h3 className="card-title">
                                        <i className="fas fa-couch"></i> Commission Piece
                                    </h3>
                                    <span className="artisan-seal-pill">
                                        <i className="fas fa-certificate"></i> Certified Authentic
                                    </span>
                                </div>

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
                                                    ? `Timber: ${product.woodSpec} • Fabric: ${product.fabricSpec || 'Natural Linen'} • Finish: ${product.trimSpec || 'Hand-Rubbed Beeswax'}`
                                                    : 'Solid Timber Handcrafted Masterpiece • Kiln-Dried 8–12%')}
                                        </p>
                                        <div className="prod-pricing-row">
                                            <div className="prod-price-tag">
                                                Rs. {unitPrice.toLocaleString()} <span className="unit-label">/ unit</span>
                                            </div>
                                            {/* Quantity Selector */}
                                            <div className="qty-selector-box">
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    disabled={quantity <= 1}
                                                    title="Decrease quantity"
                                                >
                                                    <i className="fas fa-minus"></i>
                                                </button>
                                                <span className="qty-val">{quantity}</span>
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() => setQuantity(Math.min(20, quantity + 1))}
                                                    title="Increase quantity"
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
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
                                        <div className="phone-input-wrap">
                                            <span className="phone-prefix">+94</span>
                                            <input
                                                type="tel"
                                                className="form-input has-prefix"
                                                required
                                                placeholder="74 315 3951"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Alternative Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="Secondary contact / gate pass"
                                            value={altPhone}
                                            onChange={(e) => setAltPhone(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address (For Official Invoice & Tracking) *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        required
                                        placeholder="gamini@domain.lk"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Delivery Street Address (House / Villa / Suite) *</label>
                                    <input
                                        className="form-input"
                                        required
                                        placeholder="e.g. No. 42, Queen's Terrace, Colombo 07"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">City / Destination Zone *</label>
                                        <select
                                            className="form-select"
                                            value={district}
                                            onChange={handleDistrictChange}
                                        >
                                            {districtDistances.map((d, i) => (
                                                <option key={i} value={d.label}>
                                                    {d.label} ({d.km} km • {d.time})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Distance from Atelier (km)</label>
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
                                    <i className="fas fa-truck-moving" style={{ color: 'var(--gold)' }}></i>
                                    <span>
                                        White-glove delivery fleet: Rs. {ratePerKm.toLocaleString()} per km from Moratuwa Atelier.
                                        <strong> Est. Transit: {currentDistrictInfo.time}</strong>
                                    </span>
                                </div>

                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label className="form-label">Nearest Landmark / Street Directions</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. Opposite St. Thomas Chapel, 3rd house on the left"
                                        value={landmark}
                                        onChange={(e) => setLandmark(e.target.value)}
                                    />
                                </div>

                                {/* Preferred Delivery Timeframe */}
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label className="form-label">Preferred Delivery Schedule</label>
                                    <div className="timeframe-pills-grid">
                                        {[
                                            { label: '🚀 Priority Fast-Track (2–3 Days)', val: 'Priority Fast-Track (2–3 Days)' },
                                            { label: '📅 Standard White-Glove (5–7 Days)', val: 'Standard White-Glove (5–7 Days)' },
                                            { label: '🏡 Weekend Delivery (Sat/Sun)', val: 'Weekend Delivery (Sat/Sun)' }
                                        ].map((t, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`timeframe-pill ${deliveryTimeframe === t.val ? 'active' : ''}`}
                                                onClick={() => setDeliveryTimeframe(t.val)}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bespoke Notes */}
                            <div className="c-card">
                                <h3 className="card-title">
                                    <i className="fas fa-pen-fancy"></i> Custom Workshop Instructions
                                </h3>
                                <textarea
                                    className="form-textarea"
                                    rows="2"
                                    placeholder="Floor level (e.g. 2nd floor elevator), preferred wood stain undertones, or specific unboxing requests..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* ════════════════ RIGHT COLUMN: PAYMENT METHODS & TOTALS ════════════════ */}
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
                                                <p>Instant encrypted settlement with card privilege</p>
                                            </div>
                                        </div>
                                        <span className="p-opt-badge badge-discount">
                                            {settings.cardDiscountPercent || 10}% INSTANT OFF
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
                                                <p>Commercial Bank deposit / online bank transfer</p>
                                            </div>
                                        </div>
                                        <span
                                            className="p-opt-badge badge-advance"
                                            style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold-light)' }}
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
                                                <p>{codAdvancePercent}% commitment advance + balance upon unboxing</p>
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
                                        <div className="card-icons-row">
                                            <div className="brand-icons-list">
                                                <span className={`card-icon-pill ${getCardBrand() === 'visa' ? 'highlight' : ''}`}>
                                                    <i className="fab fa-cc-visa"></i> Visa
                                                </span>
                                                <span className={`card-icon-pill ${getCardBrand() === 'mastercard' ? 'highlight' : ''}`}>
                                                    <i className="fab fa-cc-mastercard"></i> MasterCard
                                                </span>
                                                <span className={`card-icon-pill ${getCardBrand() === 'amex' ? 'highlight' : ''}`}>
                                                    <i className="fab fa-cc-amex"></i> Amex
                                                </span>
                                            </div>
                                            <span className="card-secure-tag">
                                                <i className="fas fa-lock"></i> 256-Bit TLS
                                            </span>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Card Number</label>
                                            <input
                                                className="form-input"
                                                placeholder="4532 •••• •••• ••••"
                                                maxLength="19"
                                                value={cardNumber}
                                                onChange={handleCardNumberChange}
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
                                                    onChange={handleExpiryChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">CVV / CVC</label>
                                                <input
                                                    className="form-input"
                                                    placeholder="•••"
                                                    maxLength="4"
                                                    value={cardCvv}
                                                    onChange={handleCvvChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Cardholder Name (As printed on card)</label>
                                            <input
                                                className="form-input"
                                                placeholder="GAMINI SENANAYAKE"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                            />
                                        </div>

                                        <div className="card-privilege-callout">
                                            <i className="fas fa-gift" style={{ color: 'var(--gold)' }}></i>
                                            <span>
                                                <strong>{cardDiscountPercent}% Instant Savings:</strong> You save Rs. {discountAmount.toLocaleString()} automatically with card settlement.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Bank / COD Slip Upload Area */}
                                {paymentMethod !== 'card' && (
                                    <div className="pay-detail-box active" style={{ display: 'block' }}>
                                        <div className="bank-header-callout">
                                            <i className="fas fa-university"></i>
                                            <span>Atelier Corporate Account Details</span>
                                        </div>

                                        <div className="bank-info-grid">
                                            <div className="bank-info-row">
                                                <span className="lbl">Bank Name:</span>
                                                <span className="val">{settings.bankDetails?.bankName || 'Commercial Bank of Ceylon'}</span>
                                            </div>
                                            <div className="bank-info-row">
                                                <span className="lbl">Account Name:</span>
                                                <div className="val-copy-wrap">
                                                    <span className="val">{settings.bankDetails?.accountName || 'Lansakara Furniture (Pvt) Ltd'}</span>
                                                    <button
                                                        type="button"
                                                        className="btn-copy-mini"
                                                        onClick={() => handleCopy(settings.bankDetails?.accountName || 'Lansakara Furniture (Pvt) Ltd', 'name')}
                                                        title="Copy Account Name"
                                                    >
                                                        {copiedKey === 'name' ? '✓ Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bank-info-row">
                                                <span className="lbl">Account Number:</span>
                                                <div className="val-copy-wrap">
                                                    <span className="val gold-num">{settings.bankDetails?.accountNumber || '1000847291'}</span>
                                                    <button
                                                        type="button"
                                                        className="btn-copy-mini"
                                                        onClick={() => handleCopy(settings.bankDetails?.accountNumber || '1000847291', 'acc')}
                                                        title="Copy Account Number"
                                                    >
                                                        {copiedKey === 'acc' ? '✓ Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bank-info-row">
                                                <span className="lbl">Branch:</span>
                                                <div className="val-copy-wrap">
                                                    <span className="val">{settings.bankDetails?.branch || 'Moratuwa Premium Branch'}</span>
                                                    <button
                                                        type="button"
                                                        className="btn-copy-mini"
                                                        onClick={() => handleCopy(settings.bankDetails?.branch || 'Moratuwa Premium Branch', 'branch')}
                                                        title="Copy Branch"
                                                    >
                                                        {copiedKey === 'branch' ? '✓ Copied' : 'Copy'}
                                                    </button>
                                                </div>
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
                                                        ? `Upload ${codAdvancePercent}% Transport Commitment Slip / Screenshot`
                                                        : 'Upload Bank Deposit / Online Transfer Receipt'}
                                            </p>
                                            <span>JPG, PNG or PDF (Max 12MB) • Drag & drop or click to browse</span>
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                style={{ display: 'none' }}
                                                onChange={handleReceiptChange}
                                            />

                                            {receiptPreview && (
                                                <div className="receipt-preview-box">
                                                    <img
                                                        src={receiptPreview}
                                                        alt="Receipt Preview"
                                                        className="receipt-preview-thumb"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn-remove-receipt"
                                                        onClick={removeReceipt}
                                                    >
                                                        <i className="fas fa-trash-alt"></i> Remove
                                                    </button>
                                                </div>
                                            )}
                                        </label>

                                        <div className="whatsapp-slip-note">
                                            <i className="fab fa-whatsapp" style={{ color: '#25d366' }}></i>
                                            <span>
                                                Prefer transferring after? You can place the order now and send your slip to our WhatsApp hotline: <strong>0743153951</strong>.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Price Breakdown */}
                                <div className="breakdown-card">
                                    <div className="breakdown-row">
                                        <span>
                                            Product Subtotal {quantity > 1 ? `(${quantity} × Rs. ${unitPrice.toLocaleString()})` : ''}
                                        </span>
                                        <span className="num-val">Rs. {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>
                                            White-Glove Atelier Fleet ({km} km @ Rs. {ratePerKm}/km)
                                        </span>
                                        <span className="num-val">Rs. {deliveryFee.toLocaleString()}</span>
                                    </div>

                                    {paymentMethod === 'card' && (
                                        <div className="breakdown-row discount-row" style={{ display: 'flex' }}>
                                            <span>
                                                <i className="fas fa-tag" style={{ marginRight: '6px' }}></i> Card Privilege Discount ({cardDiscountPercent}%)
                                            </span>
                                            <span className="num-val">-Rs. {discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="breakdown-row total-row">
                                        <span>Total Net Investment</span>
                                        <span className="total-gold">Rs. {finalTotal.toLocaleString()}</span>
                                    </div>

                                    {paymentMethod === 'cod' && (
                                        <div className="breakdown-row advance-row" style={{ display: 'flex' }}>
                                            <div>
                                                <strong>Commitment Advance Today ({codAdvancePercent}%):</strong>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    Remaining upon White-Glove Unboxing: Rs. {remainingBalance.toLocaleString()}
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

                                <div className="checkout-trust-footer">
                                    <div className="trust-item">
                                        <i className="fas fa-shield-alt"></i> 100% Solid Kiln-Dried Hardwood
                                    </div>
                                    <div className="trust-item">
                                        <i className="fas fa-certificate"></i> 10-Year Structural Guarantee
                                    </div>
                                    <div className="trust-item">
                                        <i className="fas fa-truck"></i> Island-Wide White-Glove Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            {/* ═══════════════ ATELIER COMMISSION INVOICE & PROVENANCE CERTIFICATE MODAL ═══════════════ */}
            {orderConfirmed && (
                <div className="modal-overlay open invoice-modal-overlay">
                    <div className="invoice-certificate-modal">
                        {/* Certificate / Invoice Document Sheet */}
                        <div className="certificate-document-sheet" id="lansakara-official-invoice">
                            <div className="cert-inner-frame">
                                
                                {/* 1. Royal Atelier Letterhead */}
                                <div className="cert-header">
                                    <div className="cert-crest">
                                        <span className="crest-symbol">⚜</span>
                                    </div>
                                    <h1 className="cert-atelier-name">LANSAKARA BESPOKE ATELIER</h1>
                                    <p className="cert-atelier-tagline">HAUTE ÉBÉNISTERIE • ARCHITECTURAL TIMBER & MASTER FURNITURE</p>
                                    
                                    <div className="cert-atelier-locations">
                                        <span><i className="fas fa-map-marker-alt"></i> <strong>Master Workshop:</strong> Kirimetiyawa, Ambanpola</span>
                                        <span className="dot-sep">•</span>
                                        <span><i className="fas fa-warehouse"></i> <strong>Craft Atelier:</strong> Moratuwa Heritage District</span>
                                        <span className="dot-sep">•</span>
                                        <span><i className="fas fa-phone-alt"></i> +94 74 315 3951</span>
                                    </div>
                                    
                                    <div className="cert-meta-bar">
                                        <span><strong>Reg No:</strong> PV-00284918-B</span>
                                        <span className="dot-sep">•</span>
                                        <span><strong>Timber Council Reg:</strong> SL-TC-2024-K09</span>
                                        <span className="dot-sep">•</span>
                                        <span><strong>Official Desk:</strong> tharakajayasundara37@gmail.com</span>
                                    </div>

                                    <div className="cert-title-ribbon">
                                        <span className="ribbon-line"></span>
                                        <h2 className="cert-document-title">COMMISSION INVOICE & PROVENANCE CERTIFICATE</h2>
                                        <span className="ribbon-line"></span>
                                    </div>
                                </div>

                                {/* 2. Patron & Invoice Reference Dossier Grid */}
                                <div className="cert-dossier-grid">
                                    {/* Left: Patron & Delivery Dossier */}
                                    <div className="cert-dossier-col patron-col">
                                        <div className="dossier-col-header">
                                            <i className="fas fa-user-shield"></i>
                                            <span>COMMISSION PATRON DOSSIER</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Patron:</span>
                                            <span className="d-val patron-name">{orderConfirmed.customerName}</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Contact:</span>
                                            <span className="d-val">{orderConfirmed.customerPhone} {orderConfirmed.altPhone && <span className="text-dim">| {orderConfirmed.altPhone}</span>}</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Email:</span>
                                            <span className="d-val">{orderConfirmed.customerEmail}</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Destination:</span>
                                            <span className="d-val">{orderConfirmed.address}, {orderConfirmed.district}</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Transit Timeframe:</span>
                                            <span className="d-val">{orderConfirmed.deliveryTimeframe} (~{orderConfirmed.deliveryKm} km Insured Route)</span>
                                        </div>
                                        {(orderConfirmed.landmark || orderConfirmed.notes) && (
                                            <div className="dossier-item notes-item">
                                                <span className="d-label">Artisan Notes:</span>
                                                <span className="d-val italic">{[orderConfirmed.landmark && `Landmark: ${orderConfirmed.landmark}`, orderConfirmed.notes && `Notes: ${orderConfirmed.notes}`].filter(Boolean).join(' • ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Registration & Atelier Ledger */}
                                    <div className="cert-dossier-col ref-col">
                                        <div className="dossier-col-header">
                                            <i className="fas fa-file-invoice-dollar"></i>
                                            <span>REGISTRATION & ATELIER LEDGER</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Commission Ref:</span>
                                            <span className="d-val gold-highlight mono">#{orderConfirmed.orderId}</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Invoice Reference:</span>
                                            <span className="d-val mono">{orderConfirmed.invoiceNo}</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Provenance Serial:</span>
                                            <span className="d-val mono">{orderConfirmed.certificateNo}</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Date of Register:</span>
                                            <span className="d-val">{orderConfirmed.orderDate} at {orderConfirmed.orderTime}</span>
                                        </div>
                                        <div className="dossier-item">
                                            <span className="d-label">Payment Channel:</span>
                                            <span className="d-val capitalize">
                                                {orderConfirmed.paymentMethod.replace('_', ' ')}
                                                {orderConfirmed.maskedCard && ` (${orderConfirmed.maskedCard})`}
                                            </span>
                                        </div>
                                        <div className="dossier-item status-item">
                                            <span className="d-label">Atelier Status:</span>
                                            <span className="d-badge confirmed">
                                                <i className="fas fa-check-circle"></i> VERIFIED & SLOTTED FOR PRODUCTION
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Itemized Schedule of Works Table */}
                                <div className="cert-schedule-wrap">
                                    <div className="table-title">ITEMIZED COMMISSION & TIMBER VALUATION SCHEDULE</div>
                                    <table className="cert-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '5%' }}>#</th>
                                                <th style={{ width: '47%' }}>BESPOKE PIECE & ARTISANAL SPECIFICATIONS</th>
                                                <th style={{ width: '20%' }}>MATERIAL PROVENANCE</th>
                                                <th style={{ width: '8%', textAlign: 'center' }}>QTY</th>
                                                <th style={{ width: '10%', textAlign: 'right' }}>RATE</th>
                                                <th style={{ width: '10%', textAlign: 'right' }}>NET (LKR)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="mono text-center">01</td>
                                                <td>
                                                    <div className="tbl-piece-name">{orderConfirmed.productName}</div>
                                                    <div className="tbl-piece-sub">{orderConfirmed.specs || 'Hand-shaped ergonomic joinery, bespoke collection'}</div>
                                                    <div className="tbl-specs-tags">
                                                        <span className="spec-tag"><i className="fas fa-tree"></i> {orderConfirmed.woodSpec || 'Certified Seasoned Hardwood'}</span>
                                                        <span className="spec-tag"><i className="fas fa-scroll"></i> {orderConfirmed.fabricSpec || 'Natural Linen / Full-Grain Leather'}</span>
                                                        <span className="spec-tag"><i className="fas fa-gem"></i> {orderConfirmed.trimSpec || 'Satin Brass Hardware'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="prov-pill"><i className="fas fa-shield-alt"></i> Kiln-Dried (8–10% EMC)</div>
                                                    <div className="prov-sub">Organic Beeswax & Linseed Patina</div>
                                                </td>
                                                <td className="text-center font-bold">{orderConfirmed.quantity}</td>
                                                <td className="text-right mono">Rs. {Number(orderConfirmed.unitPrice).toLocaleString()}</td>
                                                <td className="text-right mono font-bold">Rs. {Number(orderConfirmed.subtotal).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="mono text-center">02</td>
                                                <td>
                                                    <div className="tbl-piece-name">White-Glove Insured Direct Transit & On-Site Assembly</div>
                                                    <div className="tbl-piece-sub">Air-ride protected transport, floor protection, positioning & uncrating ({orderConfirmed.district} ~{orderConfirmed.deliveryKm} km)</div>
                                                </td>
                                                <td>
                                                    <div className="prov-pill"><i className="fas fa-truck-ramp-box"></i> Direct Atelier Handover</div>
                                                </td>
                                                <td className="text-center font-bold">1</td>
                                                <td className="text-right mono">Rs. {Number(orderConfirmed.deliveryFee).toLocaleString()}</td>
                                                <td className="text-right mono font-bold">Rs. {Number(orderConfirmed.deliveryFee).toLocaleString()}</td>
                                            </tr>
                                            {orderConfirmed.discountAmount > 0 && (
                                                <tr className="discount-row">
                                                    <td className="mono text-center">03</td>
                                                    <td>
                                                        <div className="tbl-piece-name">VIP Patron Privilege Discount ({orderConfirmed.cardDiscountPercent}% Digital Settlement)</div>
                                                        <div className="tbl-piece-sub">Direct card authorization incentive applied</div>
                                                    </td>
                                                    <td>
                                                        <div className="prov-pill privilege"><i className="fas fa-crown"></i> Exclusive Privilege</div>
                                                    </td>
                                                    <td className="text-center font-bold">1</td>
                                                    <td className="text-right mono text-gold">-Rs. {Number(orderConfirmed.discountAmount).toLocaleString()}</td>
                                                    <td className="text-right mono text-gold font-bold">-Rs. {Number(orderConfirmed.discountAmount).toLocaleString()}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 4. Financial Settlement Summary Box */}
                                <div className="cert-financials-block">
                                    <div className="financials-terms">
                                        <div className="terms-title"><i className="fas fa-receipt"></i> Settlement Covenant & Timber Guarantee</div>
                                        <ul className="terms-list">
                                            <li>All timber is sustainably harvested and certified non-endangered solid hardwood.</li>
                                            <li>Moisture-stabilized to 8–10% EMC in computer-controlled vacuum drying kilns.</li>
                                            {orderConfirmed.paymentMethod === 'cod' ? (
                                                <li className="highlight-term"><strong>Cash on Delivery (White-Glove Handover):</strong> Advance deposit of <strong>Rs. {Number(orderConfirmed.advanceAmount).toLocaleString()}</strong> registered. Remaining balance of <strong>Rs. {Number(orderConfirmed.remainingBalance).toLocaleString()}</strong> is strictly payable upon physical inspection & handover.</li>
                                            ) : orderConfirmed.paymentMethod === 'bank_transfer' ? (
                                                <li className="highlight-term"><strong>Direct Bank Wire:</strong> Slip received or pending verification at our Moratuwa accounts bureau. Production allocated upon clearance.</li>
                                            ) : (
                                                <li className="highlight-term"><strong>Electronic Card Authorization:</strong> 100% full net settlement registered. Instant VIP prioritized atelier queue confirmed.</li>
                                            )}
                                            <li>Includes complimentary 6-month checkup & professional beeswax re-conditioning.</li>
                                        </ul>
                                    </div>

                                    <div className="financials-calculation">
                                        <div className="calc-row">
                                            <span>Bespoke Subtotal:</span>
                                            <span className="mono">Rs. {Number(orderConfirmed.subtotal).toLocaleString()}</span>
                                        </div>
                                        <div className="calc-row">
                                            <span>White-Glove Delivery ({orderConfirmed.deliveryKm} km):</span>
                                            <span className="mono">Rs. {Number(orderConfirmed.deliveryFee).toLocaleString()}</span>
                                        </div>
                                        {orderConfirmed.discountAmount > 0 && (
                                            <div className="calc-row discount">
                                                <span>Privilege Benefit ({orderConfirmed.cardDiscountPercent}%):</span>
                                                <span className="mono">-Rs. {Number(orderConfirmed.discountAmount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="calc-row grand-total">
                                            <span>TOTAL NET INVESTMENT:</span>
                                            <span className="mono gold-val">Rs. {Number(orderConfirmed.totalPrice).toLocaleString()}</span>
                                        </div>

                                        {orderConfirmed.paymentMethod === 'cod' && (
                                            <div className="cod-breakdown-box">
                                                <div className="calc-row cod-advance">
                                                    <span>Advance Registered:</span>
                                                    <span className="mono">Rs. {Number(orderConfirmed.advanceAmount).toLocaleString()}</span>
                                                </div>
                                                <div className="calc-row cod-balance">
                                                    <span>Balance Due at Handover:</span>
                                                    <span className="mono balance-highlight">Rs. {Number(orderConfirmed.remainingBalance).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 5. 10-Year Mastercraft Warranty Guarantee Pillars */}
                                <div className="cert-warranty-pillars">
                                    <div className="pillar">
                                        <i className="fas fa-shield-halved"></i>
                                        <div className="pillar-text">
                                            <strong>10-Year Structural Guarantee</strong>
                                            <span>Guaranteed against frame failure, joint looseness & structural faults.</span>
                                        </div>
                                    </div>
                                    <div className="pillar">
                                        <i className="fas fa-droplet-slash"></i>
                                        <div className="pillar-text">
                                            <strong>Kiln-Dried 8-10% EMC</strong>
                                            <span>Seasoned in vacuum drying chambers. Zero timber warping or insect attack.</span>
                                        </div>
                                    </div>
                                    <div className="pillar">
                                        <i className="fas fa-hand-holding-heart"></i>
                                        <div className="pillar-text">
                                            <strong>Traditional Joinery</strong>
                                            <span>Hand-cut mortise & tenon with seasoned hardwood fluted dowels.</span>
                                        </div>
                                    </div>
                                    <div className="pillar">
                                        <i className="fas fa-fingerprint"></i>
                                        <div className="pillar-text">
                                            <strong>Artisanal Provenance</strong>
                                            <span>Permanent registration in Lansakara Master Ledger for future provenance.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Signatures, Embossed Seal & Atelier Endorsement */}
                                <div className="cert-endorsement-section">
                                    <div className="sign-col patron-sign">
                                        <div className="sign-rule"></div>
                                        <div className="sign-caption">
                                            <strong>PATRON CONFIRMATION</strong>
                                            <span>{orderConfirmed.customerName}</span>
                                            <span className="sign-note">Commission Accepted & Registered</span>
                                        </div>
                                    </div>

                                    <div className="atelier-seal-wrapper">
                                        <div className="official-atelier-seal">
                                            <div className="seal-ring outer"></div>
                                            <div className="seal-ring inner"></div>
                                            <div className="seal-content">
                                                <span className="seal-star">★ ★ ★</span>
                                                <span className="seal-crest">⚜</span>
                                                <span className="seal-brand">LANSAKARA</span>
                                                <span className="seal-tag">MASTER ATELIER</span>
                                                <span className="seal-sub">EST. MORATUWA</span>
                                                <span className="seal-star">★ ★ ★</span>
                                            </div>
                                        </div>
                                        <div className="seal-text-legend">EMBOSSED PROVENANCE SEAL</div>
                                    </div>

                                    <div className="sign-col artisan-sign">
                                        <div className="artisan-signature-calligraphy">Tharaka Jayasundara</div>
                                        <div className="sign-rule"></div>
                                        <div className="sign-caption">
                                            <strong>THARAKA JAYASUNDARA</strong>
                                            <span>Chief Furniture Designer & Master Woodcraft Artisan</span>
                                            <span className="sign-note">Kirimetiyawa Workshop & Moratuwa Atelier Hub</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 7. Bottom Footnote Bar */}
                                <div className="cert-footer-legal">
                                    <span>This digital commercial instrument & provenance deed is officially recorded under Certificate #{orderConfirmed.certificateNo}. For architectural consultations, restoration, or aftercare concierge, please quote Reference #{orderConfirmed.orderId}. Lansakara Bespoke Furniture (Pvt) Ltd.</span>
                                </div>

                            </div>
                        </div>

                        {/* Action Controls (Hidden when printed) */}
                        <div className="cert-actions-bar no-print">
                            <button
                                type="button"
                                className="btn-print-primary"
                                onClick={handlePrintInvoice}
                            >
                                <i className="fas fa-print"></i> Print / Save Official Invoice (PDF)
                            </button>

                            <a
                                href={`https://wa.me/94743153951?text=Hello%20Tharaka%20%26%20Lansakara%20Artisans,%0A%0AI%20have%20confirmed%20Bespoke%20Order%20%23${orderConfirmed.orderId}%20(Invoice%20${orderConfirmed.invoiceNo}).%0A%0A*Commission:*%20${encodeURIComponent(orderConfirmed.productName)}%20(Qty:%20${orderConfirmed.quantity})%0A*Timber:*%20${encodeURIComponent(orderConfirmed.woodSpec)}%0A*Destination:*%20${encodeURIComponent(orderConfirmed.district)}%0A*Net%20Investment:*%20Rs.%20${Number(orderConfirmed.totalPrice).toLocaleString()}%0A%0APlease%20confirm%20my%20production%20lead%20time%20and%20timber%20preparation.`}
                                className="btn-whatsapp-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="fab fa-whatsapp"></i> Chat with Artisan on WhatsApp (0743153951)
                            </a>

                            <button
                                type="button"
                                className={`btn-copy-summary ${copiedInvoice ? 'copied' : ''}`}
                                onClick={handleCopyInvoice}
                            >
                                <i className={`fas ${copiedInvoice ? 'fa-check' : 'fa-copy'}`}></i> {copiedInvoice ? 'Invoice Summary Copied!' : 'Copy Invoice Dossier'}
                            </button>

                            <Link href="/" className="btn-return-gallery">
                                <i className="fas fa-arrow-left"></i> Return to Collections Gallery
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
