'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ════════════════════════════════════════════════════════════════
// 100% PHOTOREALISTIC 3D PBR CHAIR CATALOG (ZERO CARTOONS)
// ════════════════════════════════════════════════════════════════
const chairStyles = [
    {
        id: 'armchair',
        name: 'Royal Bespoke Armchair',
        subtitle: 'Modern Luxury • Turned Legs • Plush Velvet',
        badge: '★ 3D PBR Asset',
        badgeType: 'gold',
        basePrice: 185000,
        image: '/images/chairs/chair_rocker.jpg',
        modelUrl: '/models/sheen_chair.glb',
        desc: 'Mastercrafted plush lounge chair with architectural silhouette, curved timber supports, and customizable luxury textile upholstery.',
        dimensions: { height: '84 cm', width: '76 cm', depth: '78 cm', seatHeight: '44 cm', weight: '22 kg' },
        craftDetails: 'Hand-shaped Teak frame • 10-layer ergonomic cushioning • 100% bespoke tailoring'
    },
    {
        id: 'dining',
        name: 'Ceylon Heritage Dining Chair',
        subtitle: 'Turned Timber • Contoured Seat • Solid Teak',
        badge: 'Solid Timber PBR',
        badgeType: 'wood',
        basePrice: 85000,
        image: '/images/chairs/chair_spindle.jpg',
        modelUrl: '/models/dining_chair/model.gltf',
        desc: 'Gracefully turned solid Ceylon timber dining chair with contoured comfort seat and steam-bent architectural crest.',
        dimensions: { height: '92 cm', width: '52 cm', depth: '54 cm', seatHeight: '46 cm', weight: '9.5 kg' },
        craftDetails: '100% Solid Kiln-Dried Ceylon Teak • Mortise & tenon joinery • Hand-sanded 600-grit'
    },
    {
        id: 'lounge',
        name: 'Mid-Century Sculptural Lounge',
        subtitle: 'Organic Curves • Floating Armrests • Minimalist',
        badge: 'Sculptural PBR',
        badgeType: 'craft',
        basePrice: 135000,
        image: '/images/chairs/chair_woven.jpg',
        modelUrl: '/models/lounge_chair/model.gltf',
        desc: 'Sculptural organic lounge chair featuring flowing curved timber joinery, tapered legs, and tailored comfort cushioning.',
        dimensions: { height: '78 cm', width: '68 cm', depth: '74 cm', seatHeight: '42 cm', weight: '14 kg' },
        craftDetails: 'Cantilever organic joinery • High-resilience cold foam • Danish papercord / weave'
    },
    {
        id: 'rocker',
        name: 'Handcrafted Heritage Rocker',
        subtitle: 'Smooth Balanced Runners • Spindle Back • Solid Timber',
        badge: 'Heirloom PBR',
        badgeType: 'luxury',
        basePrice: 220000,
        image: '/images/chairs/chair_rocker.jpg',
        modelUrl: '/models/rocking_chair/model.gltf',
        desc: 'Authentic handcrafted rocking armchair with whisper-silent balanced curved rockers and heirloom spindle back.',
        dimensions: { height: '104 cm', width: '64 cm', depth: '88 cm', seatHeight: '45 cm', weight: '19 kg' },
        craftDetails: 'Steam-curved equilibrium rockers • 24 spindle backrest • Generational heirloom warranty'
    },
    {
        id: 'throne',
        name: 'Victorian Carved Royal Chair',
        subtitle: 'Hand-Carved Backrest • Fluted Legs • Ceremonial Teak',
        badge: 'Royal Carved PBR',
        badgeType: 'gold',
        basePrice: 380000,
        image: '/images/chairs/chair_royal.jpg',
        modelUrl: '/models/wooden_chair/model.gltf',
        desc: 'Ornate ancestral ceremonial chair featuring deep hand-carved floral cresting, turned cabriole legs, and solid timber construction.',
        dimensions: { height: '122 cm', width: '72 cm', depth: '68 cm', seatHeight: '48 cm', weight: '26 kg' },
        craftDetails: 'Ancestral hand-carved relief • 24K gold leaf rosettes • Crown insignia cresting'
    }
];

// ════════════════════════════════════════════════════════════════
// STUDIO LIGHTING MOODS (INTERACTIVE THREE.JS ENVIRONMENT)
// ════════════════════════════════════════════════════════════════
const lightingMoods = {
    golden: {
        id: 'golden',
        label: 'Golden Hour',
        icon: '🌅',
        sub: 'Warm Atelier Amber',
        ambientColor: 0xffeedd,
        ambientIntensity: 1.15,
        keyColor: 0xffd599,
        keyIntensity: 1.55,
        fillColor: 0x996633,
        fillIntensity: 0.55,
        rimColor: 0xffb74d,
        rimIntensity: 1.1,
        bounceColor: 0x8a4511,
        bgGradient: 'radial-gradient(circle at 50% 45%, #351d10 0%, #1a0c06 75%, #0a0402 100%)'
    },
    daylight: {
        id: 'daylight',
        label: 'Daylight Gallery',
        icon: '🏛️',
        sub: 'Crisp Natural Wood Grain',
        ambientColor: 0xf5f7fa,
        ambientIntensity: 1.25,
        keyColor: 0xffffff,
        keyIntensity: 1.45,
        fillColor: 0xd8e6f7,
        fillIntensity: 0.65,
        rimColor: 0xffffff,
        rimIntensity: 0.85,
        bounceColor: 0x665544,
        bgGradient: 'radial-gradient(circle at 50% 45%, #252422 0%, #151413 75%, #0b0a0a 100%)'
    },
    dramatic: {
        id: 'dramatic',
        label: 'Midnight Noir',
        icon: '🍸',
        sub: 'High Contrast Luxury Rim',
        ambientColor: 0x332218,
        ambientIntensity: 0.5,
        keyColor: 0xffecc4,
        keyIntensity: 1.9,
        fillColor: 0x221833,
        fillIntensity: 0.35,
        rimColor: 0xd4af37,
        rimIntensity: 1.45,
        bounceColor: 0x442200,
        bgGradient: 'radial-gradient(circle at 50% 45%, #1f0f08 0%, #0d0603 80%, #040201 100%)'
    }
};

// ════════════════════════════════════════════════════════════════
// TIMBER, FABRIC & ACCENT OPTIONS
// ════════════════════════════════════════════════════════════════
const woodOptions = {
    teak: {
        name: 'Ceylon Teak',
        price: 18500,
        color: 0xc47f43,
        roughness: 0.35,
        desc: 'Aged Ceylon timber featuring tight natural grain, weather resistance, and finished with warm organic beeswax.'
    },
    walnut: {
        name: 'Dark Walnut',
        price: 28000,
        color: 0x5a3422,
        roughness: 0.28,
        desc: 'Deep royal chocolate brown with espresso grain streaks and a silken matte tactile feel.'
    },
    ebony: {
        name: 'Ebony Ash',
        price: 34000,
        color: 0x221f1d,
        roughness: 0.22,
        desc: 'Jet black timber with charcoal undertones, creating bold aristocratic contrast.'
    },
    mahogany: {
        name: 'Red Mahogany',
        price: 25000,
        color: 0x7c231c,
        roughness: 0.30,
        desc: 'Rich reddish-burgundy hues that deepen with age under natural sunlight exposure.'
    },
    oak: {
        name: 'Nordic Oak',
        price: 21500,
        color: 0xd4ba96,
        roughness: 0.40,
        desc: 'Pale golden Scandinavian oak with open cathedral pore patterns and organic wax coat.'
    }
};

const fabricOptions = {
    linen: {
        name: 'Oat Linen',
        price: 0,
        color: 0xdfd4b8,
        roughness: 0.88,
        sheenColor: 0xffffff,
        desc: '100% organic unbleached flax weave. Breathable, hypoallergenic, and naturally durable.'
    },
    crimson_velvet: {
        name: 'Crimson Velvet',
        price: 14000,
        color: 0x7a0c1e,
        roughness: 0.62,
        sheenColor: 0xcc2a45,
        desc: 'Deep royal ruby velvet with plush 400gsm pile that catches light dramatically across angles.'
    },
    emerald_velvet: {
        name: 'Emerald Velvet',
        price: 14000,
        color: 0x0f402c,
        roughness: 0.62,
        sheenColor: 0x228b61,
        desc: 'Aristocratic Ceylon forest green velvet offering luxuriant tactile depth and rich shadows.'
    },
    navy_velvet: {
        name: 'Sapphire Velvet',
        price: 14000,
        color: 0x142b52,
        roughness: 0.62,
        sheenColor: 0x3b65a6,
        desc: 'Regal midnight navy hue reminiscent of Ceylon blue sapphires, treated for stain resistance.'
    },
    leather: {
        name: 'Cognac Leather',
        price: 23000,
        color: 0x7a3d1c,
        roughness: 0.36,
        sheenColor: 0xb56333,
        desc: 'Full-grain vegetable-tanned leather that develops a magnificent personalized patina.'
    },
    noir_velvet: {
        name: 'Noir Velvet',
        price: 14000,
        color: 0x1c1c1c,
        roughness: 0.68,
        sheenColor: 0x4a4a4a,
        desc: 'Obsidian black velvet exuding modern imperial grandeur with whisper-soft pile.'
    }
};

const trimOptions = {
    gold: {
        name: '24K Gold Leaf',
        price: 11000,
        color: 0xd4af37,
        metalness: 0.90,
        roughness: 0.25,
        desc: 'Hand-applied gold leaf gilding on carved rosette accents and metallic ferrules.'
    },
    wood: {
        name: 'Matching Timber',
        price: 0,
        color: 0xb56d35,
        metalness: 0.05,
        roughness: 0.35,
        desc: 'Details remain in natural solid timber, sculpted seamlessly with the chair frame.'
    },
    bronze: {
        name: 'Antique Bronze',
        price: 9500,
        color: 0x8f6844,
        metalness: 0.70,
        roughness: 0.40,
        desc: 'Warm patinated bronze leafing with dark antique burnish in carved recesses.'
    }
};

export default function ChairConfigurator() {
    const router = useRouter();
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);

    // Active Chair Style selection
    const [selectedChairId, setSelectedChairId] = useState('armchair');
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [loadingLabel, setLoadingLabel] = useState('Loading Ultra-Photorealistic 3D Model...');

    // Customization states
    const [selectedWood, setSelectedWood] = useState('teak');
    const [selectedFabric, setSelectedFabric] = useState('linen');
    const [selectedTrim, setSelectedTrim] = useState('gold');
    const [activeTab, setActiveTab] = useState('wood');
    const [isAutoSpin, setIsAutoSpin] = useState(true);
    const [activeCamPill, setActiveCamPill] = useState('hero');

    // Enhanced interactive states: Lighting Mood, Fullscreen, Dimensions HUD
    const [lightingMood, setLightingMood] = useState('golden');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showDimensionsHud, setShowDimensionsHud] = useState(false);

    const selectedChairIdRef = useRef(selectedChairId);
    selectedChairIdRef.current = selectedChairId;
    const selectedWoodRef = useRef(selectedWood);
    selectedWoodRef.current = selectedWood;
    const selectedFabricRef = useRef(selectedFabric);
    selectedFabricRef.current = selectedFabric;
    const selectedTrimRef = useRef(selectedTrim);
    selectedTrimRef.current = selectedTrim;

    // Three.js References
    const threeRefs = useRef({
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        gltfLoader: null,
        loadedModels: {}, // cached 3D scenes by chair id
        lights: {},
        targetCameraPos: null,
        animFrameId: null
    });

    const activeChair = chairStyles.find(c => c.id === selectedChairId) || chairStyles[0];
    const currentWood = woodOptions[selectedWood];
    const currentFabric = fabricOptions[selectedFabric];
    const currentTrim = trimOptions[selectedTrim];
    const totalPrice = activeChair.basePrice + currentWood.price + currentFabric.price + currentTrim.price;

    // Smooth price animation counter
    const [displayPrice, setDisplayPrice] = useState(totalPrice);
    const [isPriceUpdating, setIsPriceUpdating] = useState(false);

    useEffect(() => {
        setIsPriceUpdating(true);
        const start = displayPrice;
        const end = totalPrice;
        if (start === end) {
            setIsPriceUpdating(false);
            return;
        }
        let startTime = null;
        const duration = 380; // ms

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
            const current = Math.round(start + (end - start) * ease);
            setDisplayPrice(current);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setDisplayPrice(end);
                setTimeout(() => setIsPriceUpdating(false), 200);
            }
        };
        const animId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animId);
    }, [totalPrice]);

    // Fullscreen listener
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            if (threeRefs.current.renderer && threeRefs.current.camera && wrapperRef.current) {
                setTimeout(() => {
                    const w = wrapperRef.current.clientWidth;
                    const h = wrapperRef.current.clientHeight;
                    threeRefs.current.camera.aspect = w / h;
                    threeRefs.current.camera.updateProjectionMatrix();
                    threeRefs.current.renderer.setSize(w, h);
                }, 100);
            }
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Helper: Normalize & center loaded GLTF model so it sits gracefully on the floor
    const setupModelInScene = (model, chairId) => {
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material = child.material.clone();
                    if (!child.userData.originalColor) {
                        child.userData.originalColor = child.material.color.clone();
                    }
                }
            }
        });

        // Bounding box calculation
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Target height ~ 48 units
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetHeight = chairId === 'armchair' ? 44 : 48;
        const scaleFactor = targetHeight / (size.y > 0 ? size.y : maxDimension);

        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Position model: base rests on floor (y = 0.05), centered at origin
        box.setFromObject(model);
        model.position.x = -center.x * scaleFactor;
        model.position.y = -box.min.y + 0.05;
        model.position.z = -center.z * scaleFactor;

        // Apply current materials
        applyMaterialsToModel(model, chairId);
    };

    // Helper: Apply active wood/fabric/trim materials to a model
    const applyMaterialsToModel = (model, chairId) => {
        const wood = woodOptions[selectedWoodRef.current || 'teak'];
        const fabric = fabricOptions[selectedFabricRef.current || 'linen'];
        const trim = trimOptions[selectedTrimRef.current || 'gold'];

        model.traverse((child) => {
            if (child.isMesh && child.material) {
                const name = (child.name || '').toLowerCase();
                const matName = (child.material.name || '').toLowerCase();

                if (chairId === 'armchair') {
                    if (name.includes('wood') || matName.includes('wood')) {
                        child.material.color.setHex(wood.color);
                        child.material.roughness = wood.roughness;
                    } else if (name.includes('fabric') || matName.includes('fabric')) {
                        child.material.color.setHex(fabric.color);
                        child.material.roughness = fabric.roughness;
                        if (child.material.sheenColor) {
                            child.material.sheenColor.setHex(fabric.sheenColor || fabric.color);
                        }
                    } else if (name.includes('metal') || matName.includes('metal')) {
                        child.material.color.setHex(trim.color);
                        child.material.metalness = trim.metalness;
                        child.material.roughness = trim.roughness;
                    }
                } else if (chairId === 'lounge') {
                    if (name.includes('cushion') || matName.includes('fabric') || matName.includes('cushion')) {
                        child.material.color.setHex(fabric.color);
                        child.material.roughness = fabric.roughness;
                    } else {
                        child.material.color.setHex(wood.color);
                        child.material.roughness = wood.roughness;
                    }
                } else {
                    // Solid Timber Chairs
                    child.material.color.setHex(wood.color);
                    child.material.roughness = wood.roughness;
                }
                child.material.needsUpdate = true;
            }
        });
    };

    // Load or switch to chair model
    const switchChairModel = (chairId) => {
        const { scene, loadedModels, gltfLoader, controls } = threeRefs.current;
        if (!scene || !gltfLoader) return;

        setSelectedChairId(chairId);
        selectedChairIdRef.current = chairId;

        // Hide all current models
        Object.keys(loadedModels).forEach((id) => {
            if (loadedModels[id]) loadedModels[id].visible = false;
        });

        const chairDef = chairStyles.find(c => c.id === chairId);
        if (!chairDef) return;

        // Animate camera to optimal viewing position
        if (controls) {
            controls.target.set(0, 22, 0);
            threeRefs.current.targetCameraPos = new THREE.Vector3(42, 45, 65);
            setActiveCamPill('hero');
        }

        // If already cached, show immediately
        if (loadedModels[chairId]) {
            loadedModels[chairId].visible = true;
            applyMaterialsToModel(loadedModels[chairId], chairId);
            setIsModelLoading(false);
            return;
        }

        // Otherwise load from file
        setIsModelLoading(true);
        setLoadingLabel(`Loading 3D PBR Asset: ${chairDef.name}...`);

        gltfLoader.load(
            chairDef.modelUrl,
            (gltf) => {
                const model = gltf.scene;
                setupModelInScene(model, chairId);
                model.visible = (selectedChairIdRef.current === chairId);
                scene.add(model);
                loadedModels[chairId] = model;
                setIsModelLoading(false);
            },
            undefined,
            (err) => {
                console.warn(`GLTF load notice for ${chairId}:`, err);
                setIsModelLoading(false);
            }
        );
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const width = wrapper.clientWidth || 700;
        const height = wrapper.clientHeight || 700;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
        camera.position.set(42, 45, 65);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        // OrbitControls
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 + 0.04;
        controls.minDistance = 22;
        controls.maxDistance = 120;
        controls.target.set(0, 22, 0);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.9;

        // Cinematic 3-Point Studio Lighting (Defaults to Golden Hour)
        const mood = lightingMoods.golden;
        const ambientLight = new THREE.AmbientLight(mood.ambientColor, mood.ambientIntensity);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(mood.keyColor, mood.keyIntensity);
        keyLight.position.set(40, 75, 45);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.bias = -0.0001;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(mood.fillColor, mood.fillIntensity);
        fillLight.position.set(-45, 35, -30);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(mood.rimColor, mood.rimIntensity);
        rimLight.position.set(0, 50, -55);
        scene.add(rimLight);

        const floorBounce = new THREE.DirectionalLight(mood.bounceColor, 0.35);
        floorBounce.position.set(0, -20, 20);
        scene.add(floorBounce);

        // Studio Floor shadow receiver
        const floorGeo = new THREE.CircleGeometry(38, 48);
        const floorMat = new THREE.ShadowMaterial({ opacity: 0.42 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.01;
        floor.receiveShadow = true;
        scene.add(floor);

        // Ambient Brass Orbit Ring
        const ringGeo = new THREE.RingGeometry(33, 33.4, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        scene.add(ring);

        const gltfLoader = new GLTFLoader();

        threeRefs.current.scene = scene;
        threeRefs.current.camera = camera;
        threeRefs.current.renderer = renderer;
        threeRefs.current.controls = controls;
        threeRefs.current.gltfLoader = gltfLoader;
        threeRefs.current.lights = { ambientLight, keyLight, fillLight, rimLight, floorBounce };

        // Load the initial chair model (Royal Armchair)
        switchChairModel('armchair');

        // Resize handler
        const handleResize = () => {
            if (!wrapper || !renderer || !camera) return;
            const w = wrapper.clientWidth;
            const h = wrapper.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // Animation Loop
        let isMounted = true;
        const animate = () => {
            if (!isMounted) return;
            threeRefs.current.animFrameId = requestAnimationFrame(animate);
            controls.update();

            const targetPos = threeRefs.current.targetCameraPos;
            if (targetPos) {
                camera.position.lerp(targetPos, 0.08);
                if (camera.position.distanceTo(targetPos) < 0.2) {
                    threeRefs.current.targetCameraPos = null;
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            isMounted = false;
            window.removeEventListener('resize', handleResize);
            if (threeRefs.current.animFrameId) {
                cancelAnimationFrame(threeRefs.current.animFrameId);
            }
            controls.dispose();
            renderer.dispose();
        };
    }, []);

    // ═══════════════════════════════════════════════════════════
    // MATERIAL & LIGHTING ACTIONS
    // ═══════════════════════════════════════════════════════════
    const handleSetLightingMood = (moodId) => {
        setLightingMood(moodId);
        const mood = lightingMoods[moodId];
        if (!mood) return;

        const { lights } = threeRefs.current;
        if (lights) {
            if (lights.ambientLight) {
                lights.ambientLight.color.setHex(mood.ambientColor);
                lights.ambientLight.intensity = mood.ambientIntensity;
            }
            if (lights.keyLight) {
                lights.keyLight.color.setHex(mood.keyColor);
                lights.keyLight.intensity = mood.keyIntensity;
            }
            if (lights.fillLight) {
                lights.fillLight.color.setHex(mood.fillColor);
                lights.fillLight.intensity = mood.fillIntensity;
            }
            if (lights.rimLight) {
                lights.rimLight.color.setHex(mood.rimColor);
                lights.rimLight.intensity = mood.rimIntensity;
            }
            if (lights.floorBounce) {
                lights.floorBounce.color.setHex(mood.bounceColor);
            }
        }
    };

    const handleSelectWood = (woodKey) => {
        setSelectedWood(woodKey);
        selectedWoodRef.current = woodKey;
        const currentModel = threeRefs.current.loadedModels[selectedChairIdRef.current];
        if (currentModel) {
            applyMaterialsToModel(currentModel, selectedChairIdRef.current);
        }
    };

    const handleSelectFabric = (fabricKey) => {
        setSelectedFabric(fabricKey);
        selectedFabricRef.current = fabricKey;
        const currentModel = threeRefs.current.loadedModels[selectedChairIdRef.current];
        if (currentModel) {
            applyMaterialsToModel(currentModel, selectedChairIdRef.current);
        }
    };

    const handleSelectTrim = (trimKey) => {
        setSelectedTrim(trimKey);
        selectedTrimRef.current = trimKey;
        const currentModel = threeRefs.current.loadedModels[selectedChairIdRef.current];
        if (currentModel) {
            applyMaterialsToModel(currentModel, selectedChairIdRef.current);
        }
    };

    // Camera preset controls
    const handleSetCameraView = (preset) => {
        setActiveCamPill(preset);
        const { controls } = threeRefs.current;
        if (controls) {
            controls.autoRotate = false;
            setIsAutoSpin(false);
            controls.target.set(0, 22, 0);
        }

        if (preset === 'hero') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(42, 45, 65);
        } else if (preset === 'front') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(0, 24, 75);
        } else if (preset === 'back') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(0, 28, -75);
        } else if (preset === 'side') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(72, 24, 0);
        } else if (preset === 'top') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(0, 85, 12);
        } else if (preset === 'cushion') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(18, 45, 30);
        }
    };

    const handleToggleSpin = () => {
        const next = !isAutoSpin;
        setIsAutoSpin(next);
        if (threeRefs.current.controls) {
            threeRefs.current.controls.autoRotate = next;
        }
    };

    const handleZoom = (delta) => {
        const { camera, controls } = threeRefs.current;
        if (!camera || !controls) return;
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
        camera.position.addScaledVector(dir, delta * 20);
    };

    const handleReset = () => {
        const { camera, controls } = threeRefs.current;
        if (!camera || !controls) return;
        threeRefs.current.targetCameraPos = new THREE.Vector3(42, 45, 65);
        controls.target.set(0, 22, 0);
        setIsAutoSpin(true);
        controls.autoRotate = true;
        setActiveCamPill('hero');
    };

    const toggleFullscreen = () => {
        const el = wrapperRef.current;
        if (!el) return;

        if (!document.fullscreenElement) {
            if (el.requestFullscreen) {
                el.requestFullscreen();
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    // Direct Checkout Order Creation
    const handleOrder = () => {
        const wood = woodOptions[selectedWood];
        const fabric = fabricOptions[selectedFabric];
        const trim = trimOptions[selectedTrim];
        const total = activeChair.basePrice + wood.price + fabric.price + trim.price;
        const chairName = `Lansakara Bespoke: ${activeChair.name}`;
        const specs = `Bespoke Order: ${activeChair.name} • Wood: ${wood.name} • Upholstery: ${fabric.name} • Trim: ${trim.name}`;

        const orderDraft = {
            name: chairName,
            price: total,
            image: activeChair.image,
            specs: specs,
            woodSpec: wood.name,
            fabricSpec: fabric.name,
            trimSpec: trim.name
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('lansakara_checkout_order', JSON.stringify(orderDraft));
        }
        router.push(`/checkout?product=${encodeURIComponent(chairName)}&price=${total}`);
    };

    // Direct WhatsApp Consultation Inquiry
    const handleWhatsAppConsultation = () => {
        const wood = woodOptions[selectedWood];
        const fabric = fabricOptions[selectedFabric];
        const trim = trimOptions[selectedTrim];
        const text = `Hello Lansakara Artisans,%0A%0AI configured a bespoke chair in the 3D Studio:%0A- Silhouette: ${encodeURIComponent(activeChair.name)}%0A- Timber: ${encodeURIComponent(wood.name)} (+Rs. ${wood.price.toLocaleString()})%0A- Upholstery: ${encodeURIComponent(fabric.name)} (+Rs. ${fabric.price.toLocaleString()})%0A- Accent Trim: ${encodeURIComponent(trim.name)} (+Rs. ${trim.price.toLocaleString()})%0A- Estimated Investment: Rs. ${totalPrice.toLocaleString()}%0A%0AI would like to consult with an artisan about custom dimensions, wood grain samples, and workshop delivery.`;
        window.open(`https://wa.me/94743153951?text=${text}`, '_blank');
    };

    const currentMoodConfig = lightingMoods[lightingMood] || lightingMoods.golden;

    return (
        <section className="chair-3d-studio" id="3d-chair">
            <div className="section-header reveal">
                <div className="section-label" style={{ color: 'var(--gold)' }}>Bespoke 3D Atelier</div>
                <h2 className="section-title" style={{ color: 'var(--white)' }}>
                    Design Your <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Master Chair</span> in 3D
                </h2>
                <p className="section-desc" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Explore 5 ultra-photorealistic PBR 3D chairs with genuine carved wood grain, high-pile upholstery fabrics, and interactive 360° studio lighting moods.
                </p>
            </div>

            <div className="chair-3d-container">
                {/* 3D WebGL Canvas Viewport */}
                <div
                    className={`chair-canvas-wrapper reveal-left ${isFullscreen ? 'fullscreen-mode' : ''}`}
                    ref={wrapperRef}
                    id="chairCanvasWrapper"
                    style={{ background: currentMoodConfig.bgGradient }}
                >
                    {/* Top-Left Live Badge */}
                    <div className="chair-canvas-badge">
                        <span className="live-dot"></span>
                        <span>{`★ 100% Photorealistic PBR: ${activeChair.name}`}</span>
                    </div>

                    {/* Top-Right Studio Action Toolbar */}
                    <div className="chair-canvas-actions">
                        <button
                            type="button"
                            className={`chair-tool-btn ${isAutoSpin ? 'active' : ''}`}
                            onClick={handleToggleSpin}
                            title="Toggle 360° Auto-Spin"
                        >
                            <i className={`fas fa-sync-alt ${isAutoSpin ? 'fa-spin-slow' : ''}`}></i>
                            <span>{isAutoSpin ? 'Spin ON' : 'Spin OFF'}</span>
                        </button>
                        <button
                            type="button"
                            className={`chair-tool-btn ${showDimensionsHud ? 'active' : ''}`}
                            onClick={() => setShowDimensionsHud(!showDimensionsHud)}
                            title="Toggle Furniture Dimensions & Specs HUD"
                        >
                            <i className="fas fa-ruler-combined"></i>
                            <span>Specs</span>
                        </button>
                        <button type="button" className="chair-tool-btn" onClick={() => handleZoom(-0.15)} title="Zoom In">
                            <i className="fas fa-search-plus"></i>
                        </button>
                        <button type="button" className="chair-tool-btn" onClick={() => handleZoom(0.15)} title="Zoom Out">
                            <i className="fas fa-search-minus"></i>
                        </button>
                        <button type="button" className="chair-tool-btn" onClick={handleReset} title="Reset Camera Perspective">
                            <i className="fas fa-undo"></i>
                        </button>
                        <button
                            type="button"
                            className={`chair-tool-btn ${isFullscreen ? 'active' : ''}`}
                            onClick={toggleFullscreen}
                            title="Toggle Fullscreen 3D Inspection"
                        >
                            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                        </button>
                    </div>

                    {/* Loading Overlay */}
                    {isModelLoading && (
                        <div className="chair-loading-overlay">
                            <i className="fas fa-circle-notch fa-spin fa-2x"></i>
                            <span>{loadingLabel}</span>
                        </div>
                    )}

                    {/* Canvas Element */}
                    <canvas ref={canvasRef} id="chairThreeCanvas"></canvas>

                    {/* Lighting Mood Switcher Dock */}
                    <div className="chair-lighting-dock">
                        <span className="lighting-dock-label">Studio Mood:</span>
                        {Object.values(lightingMoods).map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                className={`chair-light-pill ${lightingMood === m.id ? 'active' : ''}`}
                                onClick={() => handleSetLightingMood(m.id)}
                                title={m.sub}
                            >
                                <span className="mood-icon">{m.icon}</span>
                                <span className="mood-label">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Camera Angle Presets Dock */}
                    <div className="chair-camera-dock">
                        {[
                            { id: 'hero', label: '3/4 Hero', icon: 'fa-cube' },
                            { id: 'front', label: 'Front', icon: 'fa-arrow-down' },
                            { id: 'side', label: 'Side Profile', icon: 'fa-arrow-right' },
                            { id: 'back', label: 'Back View', icon: 'fa-arrow-up' },
                            { id: 'top', label: 'Top Contour', icon: 'fa-compress-arrows-alt' },
                            { id: 'cushion', label: 'Detail Focus', icon: 'fa-gem' }
                        ].map((view) => (
                            <button
                                key={view.id}
                                type="button"
                                className={`chair-cam-pill ${activeCamPill === view.id ? 'active' : ''}`}
                                onClick={() => handleSetCameraView(view.id)}
                            >
                                <i className={`fas ${view.icon} cam-icon`}></i>
                                <span>{view.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Dimensions & Craft Specs HUD Overlay */}
                    {showDimensionsHud && activeChair.dimensions && (
                        <div className="chair-dimensions-hud">
                            <div className="hud-header">
                                <div className="hud-title">
                                    <i className="fas fa-compass"></i>
                                    <span>Master Artisan Blueprints</span>
                                </div>
                                <button
                                    type="button"
                                    className="hud-close-btn"
                                    onClick={() => setShowDimensionsHud(false)}
                                    title="Close Blueprints"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="hud-metrics-grid">
                                <div className="hud-metric">
                                    <span className="hud-metric-label">Height</span>
                                    <span className="hud-metric-val">{activeChair.dimensions.height}</span>
                                </div>
                                <div className="hud-metric">
                                    <span className="hud-metric-label">Width</span>
                                    <span className="hud-metric-val">{activeChair.dimensions.width}</span>
                                </div>
                                <div className="hud-metric">
                                    <span className="hud-metric-label">Depth</span>
                                    <span className="hud-metric-val">{activeChair.dimensions.depth}</span>
                                </div>
                                <div className="hud-metric">
                                    <span className="hud-metric-label">Seat Height</span>
                                    <span className="hud-metric-val">{activeChair.dimensions.seatHeight}</span>
                                </div>
                                <div className="hud-metric">
                                    <span className="hud-metric-label">Weight</span>
                                    <span className="hud-metric-val">{activeChair.dimensions.weight}</span>
                                </div>
                            </div>
                            <div className="hud-craft-line">
                                <i className="fas fa-award"></i>
                                <span>{activeChair.craftDetails}</span>
                            </div>
                        </div>
                    )}

                    {/* Viewer Hint */}
                    <div className="chair-viewer-hint">
                        <span>↻ Click & Drag to Orbit 360° • Scroll / Pinch to Zoom • Studio Light & Shadow PBR</span>
                    </div>
                </div>

                {/* Customizer Side Panel */}
                <div className="chair-customizer-panel reveal-right">
                    <div className="customizer-card">
                        <div className="config-header-row">
                            <span className="config-badge">Bespoke 3D Configurator</span>
                            <span className="config-status-tag">✦ Custom Made-to-Order</span>
                        </div>
                        <h3 className="config-title">{activeChair.name}</h3>
                        <p className="config-desc">{activeChair.desc}</p>

                        {/* MASTER CHAIR STYLE SELECTOR */}
                        <div className="chair-selector-wrapper">
                            <div className="chair-selector-header">
                                <span className="chair-selector-label">1. Choose Silhouette</span>
                                <span className="chair-selector-hint">5 Photorealistic Models</span>
                            </div>
                            <div className="chair-style-grid">
                                {chairStyles.map((style) => (
                                    <div
                                        key={style.id}
                                        className={`chair-style-card ${selectedChairId === style.id ? 'active' : ''}`}
                                        onClick={() => switchChairModel(style.id)}
                                    >
                                        <div className="chair-card-thumb-wrap">
                                            <img
                                                src={style.image}
                                                alt={style.name}
                                                className="chair-card-thumb"
                                                loading="lazy"
                                            />
                                            <span className={`chair-card-badge ${style.badgeType || ''}`}>
                                                {style.badge}
                                            </span>
                                        </div>
                                        <div className="chair-card-body">
                                            <div className="chair-card-name" title={style.name}>{style.name}</div>
                                            <div className="chair-card-price">From Rs. {(style.basePrice / 1000).toFixed(0)}k</div>
                                        </div>
                                        {selectedChairId === style.id && <span className="chair-card-check">✓</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customization Step Tabs */}
                        <div className="config-tabs">
                            <button
                                type="button"
                                className={`config-tab-btn ${activeTab === 'wood' ? 'active' : ''}`}
                                onClick={() => setActiveTab('wood')}
                            >
                                <span>🪵</span> 2. Timber Spec
                            </button>
                            <button
                                type="button"
                                className={`config-tab-btn ${activeTab === 'fabric' ? 'active' : ''}`}
                                onClick={() => setActiveTab('fabric')}
                            >
                                <span>🧵</span> 3. Upholstery
                            </button>
                            <button
                                type="button"
                                className={`config-tab-btn ${activeTab === 'trim' ? 'active' : ''}`}
                                onClick={() => setActiveTab('trim')}
                            >
                                <span>✨</span> 4. Accents
                            </button>
                        </div>

                        {/* TAB 1: Timber Species */}
                        {activeTab === 'wood' && (
                            <div className="tab-content active" id="tab-wood">
                                <div className="swatches-grid">
                                    {[
                                        { key: 'teak', name: 'Ceylon Teak', price: '+Rs. 18,500', grad: 'radial-gradient(circle, #c98a44, #7d4a1b)' },
                                        { key: 'walnut', name: 'Dark Walnut', price: '+Rs. 28,000', grad: 'radial-gradient(circle, #522d1b, #261108)' },
                                        { key: 'ebony', name: 'Ebony Ash', price: '+Rs. 34,000', grad: 'radial-gradient(circle, #383431, #141312)' },
                                        { key: 'mahogany', name: 'Red Mahogany', price: '+Rs. 25,000', grad: 'radial-gradient(circle, #7a251e, #3a0d0a)' },
                                        { key: 'oak', name: 'Nordic Oak', price: '+Rs. 21,500', grad: 'radial-gradient(circle, #d4b896, #997956)' }
                                    ].map(item => (
                                        <div
                                            key={item.key}
                                            className={`swatch-item-card ${selectedWood === item.key ? 'active' : ''}`}
                                            onClick={() => handleSelectWood(item.key)}
                                        >
                                            <div className="swatch-circle-preview" style={{ background: item.grad }}></div>
                                            <div className="swatch-name">{item.name}</div>
                                            <div className="swatch-price-tag">{item.price}</div>
                                            {selectedWood === item.key && <span className="swatch-active-badge">✓</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="material-info-box" id="woodInfoBox">
                                    <div className="material-info-title">
                                        <strong>{currentWood.name}</strong>
                                        <span className="material-grade-tag">Kiln-Dried • Ceylon Hardwood</span>
                                    </div>
                                    <p>{currentWood.desc}</p>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Fabric */}
                        {activeTab === 'fabric' && (
                            <div className="tab-content active" id="tab-fabric">
                                <div className="swatches-grid">
                                    {[
                                        { key: 'linen', name: 'Oat Linen', price: 'Included', grad: 'radial-gradient(circle, #e6dac8, #b8a892)' },
                                        { key: 'crimson_velvet', name: 'Crimson Velvet', price: '+Rs. 14,000', grad: 'radial-gradient(circle, #9e1f32, #470812)' },
                                        { key: 'emerald_velvet', name: 'Emerald Velvet', price: '+Rs. 14,000', grad: 'radial-gradient(circle, #1e5944, #0b291d)' },
                                        { key: 'navy_velvet', name: 'Sapphire Velvet', price: '+Rs. 14,000', grad: 'radial-gradient(circle, #20395e, #0c182b)' },
                                        { key: 'leather', name: 'Cognac Leather', price: '+Rs. 23,000', grad: 'radial-gradient(circle, #a1582a, #4e250f)' },
                                        { key: 'noir_velvet', name: 'Noir Velvet', price: '+Rs. 14,000', grad: 'radial-gradient(circle, #3a3a3a, #151515)' }
                                    ].map(item => (
                                        <div
                                            key={item.key}
                                            className={`swatch-item-card ${selectedFabric === item.key ? 'active' : ''}`}
                                            onClick={() => handleSelectFabric(item.key)}
                                        >
                                            <div className="swatch-circle-preview" style={{ background: item.grad }}></div>
                                            <div className="swatch-name">{item.name}</div>
                                            <div className="swatch-price-tag">{item.price}</div>
                                            {selectedFabric === item.key && <span className="swatch-active-badge">✓</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="material-info-box" id="fabricInfoBox">
                                    <div className="material-info-title">
                                        <strong>{currentFabric.name}</strong>
                                        <span className="material-grade-tag">Tailored Upholstery • Stain-Resistant</span>
                                    </div>
                                    <p>{currentFabric.desc}</p>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: Trim */}
                        {activeTab === 'trim' && (
                            <div className="tab-content active" id="tab-trim">
                                <div className="swatches-grid">
                                    {[
                                        { key: 'gold', name: '24K Gold Leaf', price: '+Rs. 11,000', grad: 'radial-gradient(circle, #ffd700, #b8860b)' },
                                        { key: 'wood', name: 'Matching Timber', price: 'Included', grad: 'radial-gradient(circle, #a87242, #5c381c)' },
                                        { key: 'bronze', name: 'Antique Bronze', price: '+Rs. 9,500', grad: 'radial-gradient(circle, #b88758, #59391e)' }
                                    ].map(item => (
                                        <div
                                            key={item.key}
                                            className={`swatch-item-card ${selectedTrim === item.key ? 'active' : ''}`}
                                            onClick={() => handleSelectTrim(item.key)}
                                        >
                                            <div className="swatch-circle-preview" style={{ background: item.grad }}></div>
                                            <div className="swatch-name">{item.name}</div>
                                            <div className="swatch-price-tag">{item.price}</div>
                                            {selectedTrim === item.key && <span className="swatch-active-badge">✓</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="material-info-box" id="trimInfoBox">
                                    <div className="material-info-title">
                                        <strong>{currentTrim.name}</strong>
                                        <span className="material-grade-tag">Artisan Rosettes & Ferrules</span>
                                    </div>
                                    <p>{currentTrim.desc}</p>
                                </div>
                            </div>
                        )}

                        {/* Live Pricing & Dual Action Checkout/Consultation Card */}
                        <div className="config-summary-card">
                            <div className="summary-header-row">
                                <div className="summary-label-col">
                                    <span className="summary-label">Estimated Investment:</span>
                                    <span className="summary-sublabel">Includes hand-waxing, joinery & delivery</span>
                                </div>
                                <div className="summary-price-box">
                                    <span
                                        className={`summary-price-big ${isPriceUpdating ? 'price-updating' : ''}`}
                                        id="configPriceDisplay"
                                    >
                                        Rs. {displayPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="summary-pills-row" id="configSummaryPills">
                                <span className="summary-pill">
                                    <i className="fas fa-chair"></i> {activeChair.name}
                                </span>
                                <span className="summary-pill">
                                    <i className="fas fa-tree"></i> {currentWood.name} (+Rs. {currentWood.price.toLocaleString()})
                                </span>
                                <span className="summary-pill">
                                    <i className="fas fa-layer-group"></i> {currentFabric.name} (+Rs. {currentFabric.price.toLocaleString()})
                                </span>
                                <span className="summary-pill">
                                    <i className="fas fa-sparkles"></i> {currentTrim.name} (+Rs. {currentTrim.price.toLocaleString()})
                                </span>
                            </div>

                            <div className="config-actions-row">
                                <button type="button" className="config-order-btn" onClick={handleOrder}>
                                    <span className="btn-crown">⚜</span>
                                    <span>Proceed to Bespoke Checkout →</span>
                                </button>
                                <button
                                    type="button"
                                    className="config-whatsapp-btn"
                                    onClick={handleWhatsAppConsultation}
                                    title="Chat directly with our Moratuwa master artisans"
                                >
                                    <i className="fab fa-whatsapp"></i>
                                    <span>Consult Artisan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
