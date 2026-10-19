'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChairConfigurator from '@/components/ChairConfigurator';
import Footer from '@/components/Footer';

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
        woodType: 'Natural Ceylon Suar Solid Slab',
        dimensions: '96"L x 42"W x 30"H • 8-10 Seater',
        finish: 'Organic Raw Beeswax & Natural Botanical Oils',
        warranty: '25-Year Generational Structural Guarantee',
        description: 'Mastercrafted from a single massive Suar tree slab, keeping the natural living contours of the tree trunk intact. Book-matched and hand-planed by Moratuwa master artisans to a velvety glass-like finish.',
        price: 285000
    },
    {
        id: 'prod_002',
        name: 'Aurelin Organic Sofa',
        category: 'living',
        img: '/images/wood_04.jpg',
        badge: 'Sculptural',
        spec: 'Solid Teak Wood Base • 96"W x 24"D x 16"H',
        woodType: 'Solid Ceylon Plantation Teak Frame',
        dimensions: '96"W x 36"D x 30"H • 3-4 Seater',
        finish: 'Warm Honey Matte Lacquer & Organic Linen',
        warranty: '15-Year Frame & Cushion Resilience Guarantee',
        description: 'Organic curved silhouette resting upon an architectural Ceylon Teak wood foundation. Upholstered in premium breathable linen weave for relaxed luxury living.',
        price: 340000
    },
    {
        id: 'prod_003',
        name: 'Wabi Sabi Timber Table',
        category: 'dining',
        img: '/images/wood_27.jpg',
        badge: 'Wabi Sabi',
        spec: 'Deep Walnut Finish • 72"W x 40"D x 30"H',
        woodType: 'Aged Ceylon Walnut / Suriyamara',
        dimensions: '72"W x 40"D x 30"H • 6 Seater',
        finish: 'Hand-Charred Satin Charcoal Walnut Finish',
        warranty: '25-Year Structural Longevity Guarantee',
        description: 'Embracing Japanese Wabi-Sabi philosophy: honoring natural timber knots, grain ripples, and organic asymmetry. Treated with deep penetrating walnut beeswax.',
        price: 245000
    },
    {
        id: 'prod_004',
        name: 'Noverra Sculpted Table',
        category: 'tables',
        img: '/images/wood_19.jpg',
        badge: 'Artisan',
        spec: 'Solid Teak Monolith • 48"W x 24"D x 16"H',
        woodType: 'Solid Moratuwa Plantation Teak Monolith',
        dimensions: '48"W x 24"D x 16"H',
        finish: 'Hand-Rubbed Warm Amber Beeswax Finish',
        warranty: '20-Year Heirloom Quality Warranty',
        description: 'A sculptural coffee table carved from solid teak monolith blocks. Smooth flowing chamfered bevels with floating leg joinery creating a serene centerpiece.',
        price: 165000
    },
    {
        id: 'prod_005',
        name: 'Solid Wood Artisan Bed',
        category: 'bedroom',
        img: '/images/wood_14.jpg',
        badge: 'Signature',
        spec: 'Upholstered Linen & Solid Teak • King Size',
        woodType: 'Grade-A Ceylon Teak & Solid Brass Ferrules',
        dimensions: '82"L x 76"W x 54"H • King Size',
        finish: 'Kiln-Dried Natural Teak with Linen Upholstered Headboard',
        warranty: '30-Year Heavy Timber Structural Warranty',
        description: 'An aristocratic master bedroom statement bed. Features an ultra-sturdy interlocking timber slat subframe and plush padded headboard crafted for generational comfort.',
        price: 389000
    },
    {
        id: 'prod_006',
        name: 'Royal Carved Vanity Table',
        category: 'bedroom',
        img: '/images/wood_20.jpg',
        badge: 'Master Carving',
        spec: 'Ornate Floral Carvings • Vintage Warm Finish',
        woodType: 'Ceylon Red Mahogany & Teak Accents',
        dimensions: '50"W x 22"D x 62"H (with Mirror)',
        finish: 'Vintage Rosewood Burnish & Beveled Arch Mirror',
        warranty: '25-Year Master Hand-Carving Warranty',
        description: 'Ornate floral acanthus leaf carvings sculpted by third-generation Sri Lankan woodcarvers. Includes smooth velvet-lined keepsake drawers and solid brass ring pulls.',
        price: 219000
    },
    {
        id: 'prod_007',
        name: 'Tharvane Solid Coffee Table',
        category: 'tables',
        img: '/images/wood_23.jpg',
        badge: 'Minimalist',
        spec: 'Solid Teak Architecture • 30"W x 18"D x 16"H',
        woodType: 'Kiln-Dried Nordic White Oak / Teak',
        dimensions: '30"W x 18"D x 16"H',
        finish: 'Silken Matte Organic Wax Finish',
        warranty: '15-Year Solid Timber Warranty',
        description: 'Architectural minimalism crafted for contemporary luxury interiors. Clean geometric miters, rounded safety edges, and whisper-silent structural stability.',
        price: 115000
    },
    {
        id: 'prod_008',
        name: 'Rustic Timber Log Sofa',
        category: 'living',
        img: '/images/wood_05.jpg',
        badge: 'Rustic',
        spec: 'Natural Tree Log Construction • Linen Cushions',
        woodType: 'Reclaimed Hardwood Logs & Teak Struts',
        dimensions: '88"W x 34"D x 32"H',
        finish: 'Unvarnished Raw Weathered Timber with Protective Botanical Oils',
        warranty: '20-Year Natural Log Structural Warranty',
        description: 'Authentic artisanal lodge seating sculpted from heavy reclaimed tree logs. Features deep, sink-in high-density foam cushions wrapped in unbleached oat linen.',
        price: 298000
    },
    {
        id: 'prod_009',
        name: 'Barnwood Farmhouse Vanity',
        category: 'bedroom',
        img: '/images/wood_21.jpg',
        badge: 'Farmhouse',
        spec: 'Reclaimed Timber • Stone Basin Ready',
        woodType: 'Reclaimed Coastal Barnwood & Moratuwa Teak',
        dimensions: '44"W x 22"D x 34"H',
        finish: 'Water-Resistant Marine Matte Polywax Finish',
        warranty: '20-Year Moisture & Joinery Warranty',
        description: 'Historic barnwood timber repurposed into a master bathroom vanity. Pre-sealed for high humidity and stone countertop vessel basins.',
        price: 179000
    }
];

const woodMaterials = [
    {
        id: 'teak',
        name: 'CEYLON TEAK',
        localName: 'තේක්ක (Thekka)',
        botanical: 'Tectona grandis (Ceylon Heartwood)',
        origin: 'Moratuwa & Central Highlands Reserve',
        moisture: '8% – 10% Vacuum Kiln-Dried',
        densityTier: 'High Density (650 kg/m³)',
        hardness: '1,155 lbf',
        hardnessPercent: 35,
        jankaNote: 'Immune to rot, fungal decay, and termites due to concentrated natural silica and tectoquinone oils.',
        patinaTimeline: 'Blossoms from warm golden-honey into a luminous, deep amber glow over decades.',
        tone: 'Deep Golden Honey to Lustrous Warm Amber',
        grain: 'Dense straight grain with subtle dark mineral ribbons and rich silicone sheen',
        bestFor: 'Master Dining Suites, Architectural Daybeds, Grand Royal Thrones',
        description: 'The undisputed monarch of Sri Lankan woodcraft. Celebrated across centuries for its unmatched dimensional stability, self-lubricating natural resin, and legendary resistance to equatorial humidity.',
        estimatedFrom: 'Rs. 245,000',
        swatch: '/images/swatches/teak.png',
        image: '/images/wood_09.jpg',
        category: 'ceylon'
    },
    {
        id: 'ebony',
        name: 'CEYLON EBONY',
        localName: 'කළුවර (Kaluwara)',
        botanical: 'Diospyros ebenum (Dry Zone Ebony)',
        origin: 'Ancient Dry Zone Kiln-Matured Heartwood',
        moisture: '8% – 10% Controlled Slow-Cured',
        densityTier: 'Ultra-Dense (1,190 kg/m³ • Sinks in Water)',
        hardness: '3,220 lbf',
        hardnessPercent: 92,
        jankaNote: 'Indentation-proof (3,220 lbf). Denser than water with natural resistance to knives and scratches.',
        patinaTimeline: 'Maintains an eternal, obsidian piano-black luster impervious to UV fading.',
        tone: 'Obsidian Jet Black with Microscopic Charcoal Veins',
        grain: 'Virtually poreless, mirror-like glass polish texture with metallic chatoyancy',
        bestFor: 'Signature Monolith Desks, Royal Carving Inlays, Masterpiece Sculptures',
        description: 'The legendary jet-black timber of ancient Ceylon kings and Dutch colonial mansions. So remarkably dense that it sinks in water. Hand-buffed with pure botanical beeswax to an obsidian sheen.',
        estimatedFrom: 'Rs. 420,000',
        swatch: '/images/swatches/ebony.png',
        image: '/images/wood_08.jpg',
        category: 'ceylon'
    },
    {
        id: 'rosewood',
        name: 'CEYLON NEDUN',
        localName: 'නැදුන් (Ceylon Nedun / Rosewood)',
        botanical: 'Pericopsis mooniana (Indigenous Heritage)',
        origin: 'Protected Wet-Zone Indigenous Reserve',
        moisture: '9% – 11% Kiln Stabilized',
        densityTier: 'Very High Density (880 kg/m³)',
        hardness: '1,780 lbf',
        hardnessPercent: 55,
        jankaNote: 'Extreme impact resilience (1,780 lbf). Withstands centuries of continuous daily use without surface marking.',
        patinaTimeline: 'Matures into variegated dark violet-chocolate with age.',
        tone: 'Variegated Dark Olive Brown to Deep Violet Undertones',
        grain: 'Dense, interlocking marble-like ribbons and three-dimensional holographic figure',
        bestFor: 'Centenary Heirloom Tables, Monolith Boardroom Desks, Heritage Credenzas',
        description: 'Ceylon’s most coveted indigenous heirloom hardwood. Highly regulated and revered for centuries, displaying breathtaking iridescent figure and an indestructible structural backbone.',
        estimatedFrom: 'Rs. 380,000',
        swatch: '/images/swatches/rosewood.png',
        image: '/images/wood_27.jpg',
        category: 'ceylon'
    },
    {
        id: 'mahogany',
        name: 'CEYLON MAHOGANY',
        localName: 'මහෝගනී (Mahogany)',
        botanical: 'Swietenia macrophylla (Southern Ceylon)',
        origin: 'Aged Southern Ceylon Plantations',
        moisture: '8% – 11% Kiln Certified',
        densityTier: 'Medium-High Density (540 kg/m³)',
        hardness: '1,000 lbf',
        hardnessPercent: 30,
        jankaNote: 'Exceptional structural balance and knife-edge chisel definition for intricate royal relief carving.',
        patinaTimeline: 'Deepens gracefully under natural light from warm rose to majestic burgundy.',
        tone: 'Deep Reddish Cognac with Rosy Cathedral Highlights',
        grain: 'Interlocking ribbons and wavy cathedral chatoyancy with silky tactile finish',
        bestFor: 'Ornate Carved Headboards, Stately Wardrobes, Heritage Dressing Consoles',
        description: 'The choice of aristocratic colonial estates. Revered for its deep wine-red luster that darkens gracefully under ambient room light, giving timeless dignity to carved headboards and fine cabinetry.',
        estimatedFrom: 'Rs. 195,000',
        swatch: '/images/swatches/mahogany.png',
        image: '/images/wood_10.jpg',
        category: 'ceylon'
    },
    {
        id: 'walnut',
        name: 'AMERICAN WALNUT',
        localName: 'ඇමෙරිකන් වෝල්නට් (American Walnut)',
        botanical: 'Juglans nigra (Crown Cut Heartwood)',
        origin: 'Certified Sustainable Temperate Forests',
        moisture: '7% – 9% Precision Kiln-Dried',
        densityTier: 'High Density (640 kg/m³)',
        hardness: '1,010 lbf',
        hardnessPercent: 32,
        jankaNote: 'Natural shock-dampening qualities with velvety low-glare surface warmth.',
        patinaTimeline: 'Softens over decades into a warm, creamy golden-espresso glow.',
        tone: 'Deep Mocha with Smoky Truffle & Espresso Grain',
        grain: 'Rich, flowing architectural ribbons with satin chatoyancy and burled flares',
        bestFor: 'Executive Executive Desks, Minimalist Floating Credenzas, Dining Tables',
        description: 'The aristocrat of modern luxury design. Celebrated globally for its rich mocha undertones, smooth tactile warmth, and organic swirling marbling that creates an immediate focal point in modern interiors.',
        estimatedFrom: 'Rs. 280,000',
        swatch: '/images/swatches/walnut.png',
        image: '/images/wood_27.jpg',
        category: 'heritage'
    },
    {
        id: 'oak',
        name: 'EUROPEAN WHITE OAK',
        localName: 'යුරෝපීය ඕක් (European White Oak)',
        botanical: 'Quercus robur (Rift & Quarter Sawn)',
        origin: 'Managed Continental Forests',
        moisture: '8% – 10% Stabilized Core',
        densityTier: 'High Density (720 kg/m³)',
        hardness: '1,360 lbf',
        hardnessPercent: 40,
        jankaNote: 'Tyloses cellular structure creates natural water & rot impermeability.',
        patinaTimeline: 'Gently warms into an earthy honey-sand tone over years of indoor living.',
        tone: 'Muted Biscuit to Warm Sand Stone',
        grain: 'Open architectural grain highlighted by prominent silver medullary ray flecks',
        bestFor: 'Heavy Trestle Dining Tables, Architectural Wall Paneling, Nordic Armchairs',
        description: 'A monument of architectural strength and Scandinavian calm. Its quarter-sawn medullary ray flecks and open tactile grain create an organic, serene dialogue between nature and architecture.',
        estimatedFrom: 'Rs. 260,000',
        swatch: '/images/swatches/oak.png',
        image: '/images/wood_11.jpg',
        category: 'heritage'
    },
    {
        id: 'maple',
        name: 'ROCK MAPLE',
        localName: 'මේපල් (Hard Rock Maple)',
        botanical: 'Acer saccharum (Northern Hardwood)',
        origin: 'Kiln-Stabilized Northern Forests',
        moisture: '7% – 9% Moisture Verified',
        densityTier: 'High Density (705 kg/m³)',
        hardness: '1,450 lbf',
        hardnessPercent: 42,
        jankaNote: 'Extreme surface abrasion resistance; ideal for heavy daily use dining and study surfaces.',
        patinaTimeline: 'Ages from milky ivory into a mellow golden champagne luster.',
        tone: 'Silky Cream to Delicate Warm Honey',
        grain: 'Closed, ultra-fine pores with occasional bird’s-eye and tiger fiddleback curl',
        bestFor: 'Contemporary Architectural Dining Tables, Sculpted Vanity Desks',
        description: 'Celebrated for its pristine, luminous blonde aesthetic and outstanding surface hardness. Hand-sanded to a silky sheen that captures ambient room light with subtle, shimmering curl figure.',
        estimatedFrom: 'Rs. 230,000',
        swatch: '/images/swatches/maple.png',
        image: '/images/wood_23.jpg',
        category: 'heritage'
    },
    {
        id: 'cherry',
        name: 'BLACK CHERRY',
        localName: 'චෙරි (American Black Cherry)',
        botanical: 'Prunus serotina (Old Growth Heartwood)',
        origin: 'Selective Sustainable Harvest',
        moisture: '8% – 10% Kiln-Dried',
        densityTier: 'Medium Density (560 kg/m³)',
        hardness: '950 lbf',
        hardnessPercent: 29,
        jankaNote: 'Silky grain that responds vividly to organic botanical beeswax and slow friction oil finishes.',
        patinaTimeline: 'Deepens rapidly upon sunlight exposure from amber-pink into deep russet.',
        tone: 'Warm Amber to Deep Cinnamon Patina',
        grain: 'Graceful undulating arches with natural pitch pockets and mineral accents',
        bestFor: 'Bespoke Ergonomic Armchairs, Fine Linen Storage, Bedroom Suites',
        description: 'A living timber with a poetic personality. Under natural room sunlight, its light salmon undertones evolve over months into a deep, regal cinnamon-bronze with unmistakable heirloom charm.',
        estimatedFrom: 'Rs. 240,000',
        swatch: '/images/swatches/cherry.png',
        image: '/images/wood_19.jpg',
        category: 'heritage'
    },
    {
        id: 'cedar',
        name: 'AROMATIC CEDAR',
        localName: 'සීඩර් (Himalayan / Aromatic Cedar)',
        botanical: 'Cedrus deodara (Highland Ridge Timber)',
        origin: 'Seasoned Highland Conifer Reserve',
        moisture: '9% – 12% Naturally Cured',
        densityTier: 'Medium-Light Density (490 kg/m³)',
        hardness: '900 lbf',
        hardnessPercent: 27,
        jankaNote: 'Infused with thujaplicin essential oils that provide permanent resistance to insects and mildew.',
        patinaTimeline: 'Settles into a weathered, warm cognac tone while maintaining subtle fragrance.',
        tone: 'Golden Cognac with Toasted Amber Undertones',
        grain: 'Even, straight grain infused with aromatic resins and clean linear growth rings',
        bestFor: 'Heirloom Hope Chests, Walk-in Wardrobe Interiors, Outdoor Verandah Chairs',
        description: 'Renowned for its calming woodland scent and inherent resilience against pests and moisture. Infuses living spaces with a clean, therapeutic cedarwood aroma that endures for generations.',
        estimatedFrom: 'Rs. 210,000',
        swatch: '/images/swatches/cedar.png',
        image: '/images/wood_05.jpg',
        category: 'heritage'
    },
    {
        id: 'pine',
        name: 'RECLAIMED ALPINE PINE',
        localName: 'පයින් (Aged Alpine Pine)',
        botanical: 'Pinus sylvestris (Centenary Seasoned)',
        origin: 'Salvaged High-Altitude Ridge Timber',
        moisture: '9% – 11% Stabilized Recycled',
        densityTier: 'Medium Density (510 kg/m³)',
        hardness: '870 lbf',
        hardnessPercent: 26,
        jankaNote: 'Seasoned internal resin crystals prevent cracking and movement across shifting weather seasons.',
        patinaTimeline: 'Oxidizes into a sun-drenched golden honey with rustic vintage character.',
        tone: 'Sun-Drenched Honey with Warm Ochre Knots',
        grain: 'Dramatic growth rings, rustic structural knots, and organic sawmark history',
        bestFor: 'Farmhouse Dining Tables, Rustic Verandah Benches, Coffee Tables',
        description: 'Exudes raw, authentic warmth and grounded rustic luxury. Sourced from aged alpine structures, every slab is seasoned over decades to resist thermal expansion while showcasing honest natural knots.',
        estimatedFrom: 'Rs. 175,000',
        swatch: '/images/swatches/pine.png',
        image: '/images/wood_24.jpg',
        category: 'heritage'
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
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Materials Showcase State
    const [materialFilter, setMaterialFilter] = useState('all');
    const [selectedMaterial, setSelectedMaterial] = useState(woodMaterials[0]);

    const handleMaterialFilter = (filter) => {
        setMaterialFilter(filter);
        if (filter !== 'all') {
            const firstMatch = woodMaterials.find(m => m.category === filter);
            if (firstMatch) {
                setSelectedMaterial(firstMatch);
            }
        }
    };

    const filteredMaterials = materialFilter === 'all'
        ? woodMaterials
        : woodMaterials.filter(m => m.category === materialFilter);

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

    // Mobile Menu, Active Scroll-Spy & Scroll Progress
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [scrollProgress, setScrollProgress] = useState(0);

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

    // 3. Navbar scroll, Back to Top & Active Scroll-Spy
    useEffect(() => {
        const sections = [
            'home',
            'about',
            '3d-chair',
            'collections',
            'products',
            'materials',
            'gallery',
            'testimonials',
            'contact'
        ];

        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > 60);

            // Back to top button visibility
            const btt = document.getElementById('backToTop');
            if (btt) {
                if (scrollY > 400) {
                    btt.classList.add('visible');
                } else {
                    btt.classList.remove('visible');
                }
            }

            // Real-time Scroll Progress (0% to 100%)
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
                setScrollProgress(progress);
            }

            // Scroll-Spy: detect which section is currently in view
            const triggerOffset = 220;
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i]);
                if (el) {
                    const top = el.offsetTop - triggerOffset;
                    if (scrollY >= top) {
                        setActiveSection(sections[i]);
                        return;
                    }
                }
            }
            setActiveSection('home');
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
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

    // Modal Escape Key Dismissal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setQuickViewProduct(null);
                setIsReviewModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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

    const openQuickView = (product) => {
        setQuickViewProduct(product);
    };

    const closeQuickView = () => {
        setQuickViewProduct(null);
    };

    const inquireViaWhatsApp = (product) => {
        const text = `Hello Lansakara Artisans,%0A%0AI would like to inquire about the ${encodeURIComponent(product.name)} (Rs. ${(product.price || 0).toLocaleString()}):%0A- Category: ${encodeURIComponent(product.category || 'Handcrafted')}%0A- Timber: ${encodeURIComponent(product.woodType || product.spec || 'Solid Hardwood')}%0A- Sizing: ${encodeURIComponent(product.dimensions || 'Standard')}%0A%0ACould you please advise on lead time, custom sizing options, and workshop delivery?`;
        window.open(`https://wa.me/94743153951?text=${text}`, '_blank');
    };

    const inquireMaterialCommission = (material) => {
        const basePrice = parseInt(material.estimatedFrom?.replace(/[^0-9]/g, '') || '245000', 10);
        const orderDraft = {
            name: `Bespoke Creation in ${material.name}`,
            price: basePrice,
            image: material.image || '/images/wood_09.jpg',
            specs: `${material.name} (${material.localName || material.botanical}) • ${material.moisture || '8-10% Kiln-Dried'} • Janka ${material.hardness}`,
            woodSpec: material.name
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('lansakara_checkout_order', JSON.stringify(orderDraft));
        }
        router.push(`/checkout?product=${encodeURIComponent(`Bespoke Creation in ${material.name}`)}&price=${basePrice}&wood=${encodeURIComponent(material.name)}`);
    };

    const inquireMaterialViaWhatsApp = (material) => {
        const text = `Hello Lansakara Artisans,%0A%0AI would like to consult on commissioning a bespoke handcrafted piece in *${encodeURIComponent(material.name)}* (${encodeURIComponent(material.localName || '')}):%0A- Botanical Species: ${encodeURIComponent(material.botanical)}%0A- Reserve / Origin: ${encodeURIComponent(material.origin)}%0A- Moisture Level: ${encodeURIComponent(material.moisture || '8-12% Kiln-Dried')}%0A- Janka Resistance: ${encodeURIComponent(material.hardness)} (${encodeURIComponent(material.densityTier || '')})%0A- Investment Guide: ${encodeURIComponent(material.estimatedFrom || 'Custom Quotation')}%0A%0ACould you please advise on available seasoned slabs, custom sizing, and workshop lead times?`;
        window.open(`https://wa.me/94743153951?text=${text}`, '_blank');
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
        window.open(`https://wa.me/94743153951?text=${text}`, '_blank');
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
            {/* Top Viewport Gold Scroll Progress Bar */}
            <div className="top-scroll-progress-container">
                <div className="top-scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            {/* Preloader */}
            <div className={`preloader ${preloaderHidden ? 'hidden' : ''}`} id="preloader">
                <div className="preloader-logo">Lansakara</div>
                <div className="preloader-sub">Bespoke Furniture Artistry</div>
                <div className="preloader-bar"></div>
            </div>

            {/* Custom Cursor */}
            <div className="cursor-dot" id="cursorDot"></div>
            <div className="cursor-ring" id="cursorRing"></div>

            {/* Top Navigation (Modern Floating Capsule & Circular Glass Actions) */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
                <div className="navbar-container">
                    <a href="#home" className="nav-logo">
                        <span className="logo-icon">⚜</span>
                        Lansakara <span>Furniture</span>
                    </a>

                    {/* Floating Center Capsule Bar with Dynamic Scroll-Spy */}
                    <div className="nav-capsule-wrapper">
                        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="navLinks">
                            <li>
                                <a 
                                    href="#home" 
                                    className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#about" 
                                    className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Story
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#3d-chair" 
                                    className={`nav-link nav-highlight ${activeSection === '3d-chair' ? 'active' : ''}`} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="live-dot-nav"></span> 3D Studio
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#collections" 
                                    className={`nav-link ${activeSection === 'collections' ? 'active' : ''}`} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Collections
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#products" 
                                    className={`nav-link ${activeSection === 'products' ? 'active' : ''}`} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Products
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#materials" 
                                    className={`nav-link ${activeSection === 'materials' ? 'active' : ''}`} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Materials
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#gallery" 
                                    className={`nav-link ${activeSection === 'gallery' ? 'active' : ''}`} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Art Gallery
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#testimonials" 
                                    className={`nav-link ${activeSection === 'testimonials' ? 'active' : ''}`} 
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Reviews
                                </a>
                            </li>
                            <li className="mobile-only"><Link href="/checkout" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Checkout</Link></li>
                            <li className="mobile-only"><Link href="/admin" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Admin Portal</Link></li>
                            <li className="mobile-only">
                                <a href="#contact" className="nav-cta-mobile" onClick={() => setMobileMenuOpen(false)}>
                                    Custom Order
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Right Circular Glass Action Buttons + CTA */}
                    <div className="nav-actions">
                        <a href="#contact" className="nav-circle-btn" title="Studio Showroom & Location">
                            <i className="fas fa-map-marker-alt"></i>
                        </a>
                        <Link href="/checkout" className="nav-circle-btn" title="Bespoke Checkout (10% Card Discount)">
                            <i className="fas fa-shopping-bag"></i>
                        </Link>
                        <Link href="/admin" className="nav-circle-btn" title="Master Artisan Portal">
                            <i className="fas fa-user-shield"></i>
                        </Link>
                        <a href="#contact" className="nav-cta-pill">Custom Order</a>
                        <button
                            className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
                            id="menuToggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation"
                        >
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section (Crisp 10-Second Carousel, HD Non-Blur, Cinematic Motion) */}
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
                    <div className="hero-badge">
                        <span className="badge-royal-mark">⚜</span>
                        <span>Master Woodworkers & Artisans • Ceylon Heritage</span>
                        <span className="badge-royal-mark">⚜</span>
                    </div>
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
                            <i className="fas fa-arrow-right btn-arrow-icon"></i>
                        </a>
                        <a href="#gallery" className="btn-outline">
                            <i className="fas fa-gem btn-gem-icon"></i>
                            <span>View Art Gallery</span>
                        </a>
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
                    <span>Explore Atelier</span>
                    <div className="scroll-line"></div>
                </div>

                {/* 10-Second Countdown Carousel Navigation */}
                <div className="hero-carousel-nav">
                    <button className="hero-slide-btn" onClick={prevHeroSlide} title="Previous Slide">
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <div className="hero-progress-bars" id="heroProgressBars">
                        {heroSlides.map((_, i) => (
                            <div
                                key={i}
                                className={`hero-progress-pill ${i === heroIndex ? 'active' : ''}`}
                                onClick={() => setHeroSlide(i)}
                                title={`Slide ${i + 1}: ${heroSlides[i].caption}`}
                            >
                                <div
                                    key={`${i}-${i === heroIndex ? heroKey : 'idle'}`}
                                    className="hero-progress-fill"
                                ></div>
                            </div>
                        ))}
                    </div>
                    <button className="hero-slide-btn" onClick={nextHeroSlide} title="Next Slide">
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <div className="hero-caption-pill" id="heroCaptionPill">
                        <span className="caption-dot"></span>
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
                        <span>✦</span> All Masterpieces
                    </button>
                    <button
                        className={`filter-btn ${activeCategory === 'dining' ? 'active' : ''}`}
                        onClick={() => filterCategory('dining')}
                    >
                        <span>🪑</span> Dining & Desks
                    </button>
                    <button
                        className={`filter-btn ${activeCategory === 'living' ? 'active' : ''}`}
                        onClick={() => filterCategory('living')}
                    >
                        <span>🛋️</span> Living & Sofas
                    </button>
                    <button
                        className={`filter-btn ${activeCategory === 'tables' ? 'active' : ''}`}
                        onClick={() => filterCategory('tables')}
                    >
                        <span>☕</span> Coffee Tables
                    </button>
                    <button
                        className={`filter-btn ${activeCategory === 'bedroom' ? 'active' : ''}`}
                        onClick={() => filterCategory('bedroom')}
                    >
                        <span>🛏️</span> Bed & Vanity
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
                                    <img src={p.img} alt={p.name} loading="lazy" />
                                    {p.badge && <div className="product-badge-tag">{p.badge}</div>}
                                    <div className="product-overlay-action">
                                        <button
                                            type="button"
                                            className="product-quick-btn"
                                            onClick={() => openQuickView(p)}
                                            title="Quick View Details"
                                        >
                                            <i className="fas fa-eye"></i> Quick View
                                        </button>
                                        <button
                                            type="button"
                                            className="product-order-overlay-btn"
                                            onClick={() => inquireProduct(p.name, p.price, p.img)}
                                            title="Order Bespoke Piece"
                                        >
                                            <i className="fas fa-shopping-bag"></i> Order
                                        </button>
                                    </div>
                                </div>
                                <div className="product-details">
                                    <div className="product-meta-row">
                                        <span className="product-category">
                                            {p.category.toUpperCase()}
                                        </span>
                                        <span className="product-heritage-tag">Handmade Ceylon</span>
                                    </div>
                                    <h3
                                        className="product-title"
                                        onClick={() => openQuickView(p)}
                                        style={{ cursor: 'pointer' }}
                                        title="Click to Quick View"
                                    >
                                        {p.name}
                                    </h3>
                                    <p className="product-spec">{p.spec}</p>
                                    <div className="product-footer">
                                        <div className="product-price-col">
                                            <span className="product-price">Rs. {p.price.toLocaleString()}</span>
                                            <span className="product-discount-hint">10% Card Discount</span>
                                        </div>
                                        <div className="product-footer-actions">
                                            <button
                                                type="button"
                                                className="product-quick-icon-btn"
                                                onClick={() => openQuickView(p)}
                                                title="Quick View Specifications"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="product-inquire"
                                                onClick={() => inquireProduct(p.name, p.price, p.img)}
                                            >
                                                <span>Order</span>
                                                <i className="fas fa-arrow-right"></i>
                                            </button>
                                        </div>
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
                        const adminProdObj = {
                            id: p._id || p.id,
                            name: p.name,
                            category: cat,
                            img: img,
                            badge: p.badge || 'Bespoke',
                            spec: specText,
                            woodType: p.woodType || 'Solid Ceylon Timber',
                            dimensions: p.dimensions || 'Custom Artisan Dimensions',
                            finish: p.finish || 'Botanical Oil & Beeswax',
                            warranty: p.warranty || '25-Year Generational Guarantee',
                            description: p.description || p.shortDescription || 'Bespoke hand-planed timber creation crafted to perfection at the Moratuwa atelier.',
                            price: priceNum
                        };
                        return (
                            <div key={p._id} className="product-card reveal" data-category={cat}>
                                <div className="product-thumb">
                                    <img
                                        src={img}
                                        alt={p.name}
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.src = '/images/wood_09.jpg'; }}
                                    />
                                    {p.badge && <div className="product-badge-tag">{p.badge}</div>}
                                    <div className="product-overlay-action">
                                        <button
                                            type="button"
                                            className="product-quick-btn"
                                            onClick={() => openQuickView(adminProdObj)}
                                            title="Quick View Details"
                                        >
                                            <i className="fas fa-eye"></i> Quick View
                                        </button>
                                        <button
                                            type="button"
                                            className="product-order-overlay-btn"
                                            onClick={() => inquireProduct(p.name, priceNum, img)}
                                            title="Order Bespoke Piece"
                                        >
                                            <i className="fas fa-shopping-bag"></i> Order
                                        </button>
                                    </div>
                                </div>
                                <div className="product-details">
                                    <div className="product-meta-row">
                                        <span className="product-category">
                                            {(p.category || 'Handcrafted').toUpperCase()}
                                        </span>
                                        <span className="product-heritage-tag">Handmade Ceylon</span>
                                    </div>
                                    <h3
                                        className="product-title"
                                        onClick={() => openQuickView(adminProdObj)}
                                        style={{ cursor: 'pointer' }}
                                        title="Click to Quick View"
                                    >
                                        {p.name}
                                    </h3>
                                    <p className="product-spec">{specText}</p>
                                    <div className="product-footer">
                                        <div className="product-price-col">
                                            <span className="product-price">Rs. {priceNum.toLocaleString()}</span>
                                            <span className="product-discount-hint">10% Card Discount</span>
                                        </div>
                                        <div className="product-footer-actions">
                                            <button
                                                type="button"
                                                className="product-quick-icon-btn"
                                                onClick={() => openQuickView(adminProdObj)}
                                                title="Quick View Specifications"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                type="button"
                                                className="product-inquire"
                                                onClick={() => inquireProduct(p.name, priceNum, img)}
                                            >
                                                <span>Order</span>
                                                <i className="fas fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               MATERIALS SHOWCASE SECTION (MATCHING REFERENCE DESIGN)
            ══════════════════════════════════════════════════════════════ */}
            <section className="section materials-section" id="materials">
                {/* Atmospheric Forest Backdrop (Exact Match to Reference Image) */}
                <div className="materials-backdrop"></div>

                <div className="materials-container">
                    {/* Centered Materials Header */}
                    <div className="materials-header reveal">
                        <div className="section-label" style={{ color: 'var(--gold)', marginBottom: '10px' }}>
                            <i className="fas fa-tree" style={{ marginRight: '8px' }}></i> Botanical Heritage & Century Durability
                        </div>
                        <h2 className="materials-title">Wood Materials Library</h2>
                        <p className="materials-subtitle">
                            Every master Lansakara creation begins with sustainably harvested, honest timber. Certified 8%–12% vacuum kiln-dried to resist tropical warping, each species carries its own centenary density, grain chatoyancy, and living patina.
                        </p>

                        {/* Interactive Collection Filter Pills */}
                        <div className="materials-filter-pills">
                            <button
                                type="button"
                                className={`mat-pill ${materialFilter === 'all' ? 'active' : ''}`}
                                onClick={() => handleMaterialFilter('all')}
                            >
                                All Hardwoods ({woodMaterials.length})
                            </button>
                            <button
                                type="button"
                                className={`mat-pill ${materialFilter === 'ceylon' ? 'active' : ''}`}
                                onClick={() => handleMaterialFilter('ceylon')}
                            >
                                ⚜ Royal Ceylon Hardwoods (4)
                            </button>
                            <button
                                type="button"
                                className={`mat-pill ${materialFilter === 'heritage' ? 'active' : ''}`}
                                onClick={() => handleMaterialFilter('heritage')}
                            >
                                🌿 World Heritage Collection (6)
                            </button>
                        </div>
                    </div>

                    {/* Circular Swatches Grid (Floating over the Atmospheric Forest Backdrop) */}
                    <div className="materials-swatches-wrapper reveal">
                        <div className="materials-swatches-grid">
                            {filteredMaterials.map((mat) => {
                                const isSelected = selectedMaterial?.id === mat.id;
                                const isCeylon = mat.category === 'ceylon';
                                return (
                                    <button
                                        key={mat.id}
                                        type="button"
                                        className={`material-circle-btn ${isSelected ? 'active' : ''} ${isCeylon ? 'is-ceylon' : ''}`}
                                        onClick={() => setSelectedMaterial(mat)}
                                        title={`Inspect ${mat.name} (${mat.localName || mat.botanical})`}
                                    >
                                        <div className="circle-img-wrap">
                                            {isCeylon && (
                                                <span className="swatch-ceylon-insignia" title="Authentic Royal Ceylon Hardwood">⚜</span>
                                            )}
                                            <img src={mat.swatch} alt={mat.name} />
                                        </div>
                                        <span className="circle-label-sub">{mat.name}</span>
                                        {mat.localName && (
                                            <span className="circle-sinhala-tag">{mat.localName.split(' ')[0]}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Interactive Timber Specification Inspector Panel */}
                    {selectedMaterial && (
                        <div className="material-detail-panel reveal">
                            <div className="mat-detail-visual-col">
                                <div className="mat-detail-image-box">
                                    <img
                                        src={selectedMaterial.image || '/images/wood_09.jpg'}
                                        alt={`${selectedMaterial.name} timber sample`}
                                    />
                                    <span className="mat-image-tag">
                                        <i className="fas fa-tree" style={{ marginRight: '6px' }}></i>
                                        {selectedMaterial.origin}
                                    </span>
                                    <span className="mat-moisture-tag">
                                        <i className="fas fa-certificate" style={{ marginRight: '6px' }}></i>
                                        {selectedMaterial.moisture || '8%–10% Kiln-Dried'}
                                    </span>
                                </div>
                                <div className="mat-quick-strip">
                                    <div className="mat-quick-item">
                                        <span className="mat-quick-label">Density Class</span>
                                        <span className="mat-quick-val">{selectedMaterial.densityTier || 'High Hardwood'}</span>
                                    </div>
                                    <div className="mat-quick-item gold">
                                        <span className="mat-quick-label">Investment Guide</span>
                                        <span className="mat-quick-val">{selectedMaterial.estimatedFrom || 'Custom'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mat-detail-content">
                                <span className="mat-detail-badge">
                                    {selectedMaterial.category === 'ceylon' ? '⚜ Royal Ceylon Indigenous Timber • Master Grade' : '🌿 World Heritage Sustainable Hardwood'}
                                </span>

                                <div className="mat-detail-title-row">
                                    <div className="mat-name-block">
                                        <h3 className="mat-detail-name">{selectedMaterial.name}</h3>
                                        {selectedMaterial.localName && (
                                            <span className="mat-detail-local">{selectedMaterial.localName}</span>
                                        )}
                                    </div>
                                    <span className="mat-detail-botanical">{selectedMaterial.botanical}</span>
                                </div>

                                <p className="mat-detail-desc">
                                    {selectedMaterial.description}
                                </p>

                                <div className="mat-specs-grid">
                                    <div className="mat-spec-item">
                                        <span className="mat-spec-label"><i className="fas fa-palette"></i> Natural Color & Tone</span>
                                        <span className="mat-spec-value">{selectedMaterial.tone}</span>
                                        {selectedMaterial.patinaTimeline && (
                                            <span className="mat-spec-sub"><i className="fas fa-hourglass-half"></i> {selectedMaterial.patinaTimeline}</span>
                                        )}
                                    </div>

                                    <div className="mat-spec-item">
                                        <span className="mat-spec-label"><i className="fas fa-fingerprint"></i> Grain & Tactile Texture</span>
                                        <span className="mat-spec-value">{selectedMaterial.grain}</span>
                                    </div>

                                    <div className="mat-spec-item janka-span">
                                        <div className="janka-header-row">
                                            <span className="mat-spec-label"><i className="fas fa-weight-hanging"></i> Janka Hardness Rating</span>
                                            <span className="janka-val-badge">{selectedMaterial.hardness}</span>
                                        </div>
                                        <div className="janka-bar-wrap">
                                            <div
                                                className="janka-bar-fill"
                                                style={{ width: `${selectedMaterial.hardnessPercent || 35}%` }}
                                            ></div>
                                        </div>
                                        {selectedMaterial.jankaNote && (
                                            <span className="mat-spec-sub"><i className="fas fa-shield-alt"></i> {selectedMaterial.jankaNote}</span>
                                        )}
                                    </div>

                                    <div className="mat-spec-item">
                                        <span className="mat-spec-label"><i className="fas fa-fire"></i> Seasoning Standard</span>
                                        <span className="mat-spec-value">{selectedMaterial.moisture || '8%–10% Kiln-Dried'}</span>
                                        <span className="mat-spec-sub" style={{ color: '#4ade80' }}>
                                            <i className="fas fa-check-circle"></i> Termite & Moisture Stabilized
                                        </span>
                                    </div>

                                    <div className="mat-spec-item">
                                        <span className="mat-spec-label"><i className="fas fa-couch"></i> Ideal Applications</span>
                                        <span className="mat-spec-value">{selectedMaterial.bestFor}</span>
                                    </div>
                                </div>

                                <div className="mat-actions-row">
                                    <button
                                        type="button"
                                        className="btn-mat-cta"
                                        onClick={() => inquireMaterialCommission(selectedMaterial)}
                                    >
                                        <i className="fas fa-hammer"></i> Commission in this Timber
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-mat-whatsapp"
                                        onClick={() => inquireMaterialViaWhatsApp(selectedMaterial)}
                                    >
                                        <i className="fab fa-whatsapp"></i> Consult Woodmaster
                                    </button>
                                    <a href="#3d-chair" className="btn-mat-secondary">
                                        <i className="fas fa-cube"></i> View in 3D Studio
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
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

            {/* ═══ BESPOKE PRODUCT QUICK VIEW MODAL ═══ */}
            {quickViewProduct && (
                <div className="quickview-modal-backdrop" onClick={closeQuickView}>
                    <div className="quickview-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="quickview-close-btn"
                            onClick={closeQuickView}
                            aria-label="Close Quick View"
                        >
                            &times;
                        </button>
                        <div className="quickview-modal-grid">
                            <div className="quickview-image-col">
                                <div className="quickview-image-box">
                                    <img src={quickViewProduct.img} alt={quickViewProduct.name} />
                                    {quickViewProduct.badge && (
                                        <span className="quickview-badge">{quickViewProduct.badge}</span>
                                    )}
                                    <div className="quickview-certified-badge">
                                        <span className="cert-mark">⚜</span>
                                        <span>Certified Ceylon Timber</span>
                                    </div>
                                </div>
                            </div>
                            <div className="quickview-content-col">
                                <div className="quickview-tag-row">
                                    <span className="quickview-category">
                                        {(quickViewProduct.category || 'BESPOKE').toUpperCase()}
                                    </span>
                                    <span className="quickview-sku">Atelier Ref: #{quickViewProduct.id}</span>
                                </div>
                                <h2 className="quickview-title">{quickViewProduct.name}</h2>

                                <div className="quickview-price-row">
                                    <div className="quickview-price-main">
                                        Rs. {quickViewProduct.price.toLocaleString()}
                                    </div>
                                    <div className="quickview-card-discount">
                                        <span className="discount-tag">10% Card Discount</span>
                                        <span className="discount-net">
                                            Net: Rs. {Math.round(quickViewProduct.price * 0.9).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <p className="quickview-desc">{quickViewProduct.description}</p>

                                <div className="quickview-specs-grid">
                                    <div className="quickview-spec-item">
                                        <i className="fas fa-tree"></i>
                                        <div>
                                            <span className="spec-label">Timber Spec</span>
                                            <span className="spec-value">{quickViewProduct.woodType || quickViewProduct.spec}</span>
                                        </div>
                                    </div>
                                    <div className="quickview-spec-item">
                                        <i className="fas fa-ruler-combined"></i>
                                        <div>
                                            <span className="spec-label">Dimensions</span>
                                            <span className="spec-value">{quickViewProduct.dimensions || 'Customizable to Space'}</span>
                                        </div>
                                    </div>
                                    <div className="quickview-spec-item">
                                        <i className="fas fa-paint-brush"></i>
                                        <div>
                                            <span className="spec-label">Artisan Finish</span>
                                            <span className="spec-value">{quickViewProduct.finish || 'Organic Beeswax & Botanical Oils'}</span>
                                        </div>
                                    </div>
                                    <div className="quickview-spec-item">
                                        <i className="fas fa-shield-alt"></i>
                                        <div>
                                            <span className="spec-label">Warranty</span>
                                            <span className="spec-value">{quickViewProduct.warranty || '25-Year Mastercraft Guarantee'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="quickview-cta-row">
                                    <button
                                        type="button"
                                        className="btn-quickview-order"
                                        onClick={() => {
                                            closeQuickView();
                                            inquireProduct(quickViewProduct.name, quickViewProduct.price, quickViewProduct.img);
                                        }}
                                    >
                                        <span>⚜ Order Bespoke Piece</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-quickview-whatsapp"
                                        onClick={() => inquireViaWhatsApp(quickViewProduct)}
                                    >
                                        <i className="fab fa-whatsapp"></i>
                                        <span>Inquire on WhatsApp</span>
                                    </button>
                                </div>
                            </div>
                        </div>
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
                                <span>Kirimetiyawa, Ambanpola</span>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <div className="icon">📞</div>
                            <div className="text">
                                <strong>Direct Consultations</strong>
                                <span><a href="tel:0743153951" style={{ color: 'inherit', textDecoration: 'none' }}>0743153951</a></span>
                            </div>
                        </div>

                        <div className="contact-detail">
                            <div className="icon">✉️</div>
                            <div className="text">
                                <strong>Artisan Concierge</strong>
                                <span><a href="mailto:tharakajayasundara37@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>tharakajayasundara37@gmail.com</a></span>
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

            {/* Luxury Footer */}
            <Footer />

            {/* Desktop Floating WhatsApp Concierge Button */}
            <a
                href="https://wa.me/94743153951?text=Hello%20Lansakara%20Artisans,%20I%20would%20like%20to%20consult%20on%20a%20bespoke%20piece."
                target="_blank"
                rel="noopener noreferrer"
                className="desktop-floating-concierge"
                title="Direct Artisan Hotline (0743153951)"
            >
                <div className="concierge-avatar">
                    <i className="fab fa-whatsapp"></i>
                    <span className="avatar-online-dot"></span>
                </div>
                <div className="concierge-text">
                    <span className="concierge-status">Artisan Online</span>
                    <span className="concierge-action">Chat on WhatsApp</span>
                </div>
            </a>

            {/* Circular Progress Dial Back-to-Top Button */}
            <button
                className={`back-to-top ${scrollProgress > 6 ? 'visible' : ''}`}
                id="backToTop"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Scroll back to top"
                aria-label="Back to top"
            >
                <svg className="btt-svg-circle" viewBox="0 0 36 36">
                    <path
                        className="btt-circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="btt-circle-stroke"
                        strokeDasharray={`${Math.round(scrollProgress)}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <span className="btt-arrow">↑</span>
            </button>

            {/* Mobile Bottom Floating Glass Dock Navigation */}
            <nav className="mobile-bottom-dock" aria-label="Mobile Bottom Navigation">
                <a
                    href="#home"
                    className={`dock-item ${activeSection === 'home' ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <i className="fas fa-home"></i>
                    <span>Home</span>
                </a>
                <a
                    href="#3d-chair"
                    className={`dock-item ${activeSection === '3d-chair' ? 'active' : ''}`}
                >
                    <i className="fas fa-cube"></i>
                    <span>3D Studio</span>
                </a>
                <a
                    href="#products"
                    className={`dock-item ${activeSection === 'products' ? 'active' : ''}`}
                >
                    <i className="fas fa-couch"></i>
                    <span>Catalog</span>
                </a>
                <a
                    href="#materials"
                    className={`dock-item ${activeSection === 'materials' ? 'active' : ''}`}
                >
                    <i className="fas fa-tree"></i>
                    <span>Timber</span>
                </a>
                <a
                    href="https://wa.me/94743153951?text=Hello%20Lansakara%20Artisans,%20I%20would%20like%20to%20consult%20on%20a%20bespoke%20piece."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dock-item wa-item"
                    title="WhatsApp Hotline (0743153951)"
                >
                    <div className="dock-wa-wrap">
                        <i className="fab fa-whatsapp"></i>
                        <span className="dock-online-dot"></span>
                    </div>
                    <span>Artisan</span>
                </a>
                <Link
                    href="/checkout"
                    className="dock-item checkout-item"
                    title="Direct Bespoke Checkout"
                >
                    <i className="fas fa-shopping-bag"></i>
                    <span>Order</span>
                </Link>
            </nav>
        </div>
    );
}
