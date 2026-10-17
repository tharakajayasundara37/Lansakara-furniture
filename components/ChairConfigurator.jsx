'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const woodOptions = {
    teak: {
        name: 'Ceylon Teak',
        price: 18500,
        color: 0x9b5a28,
        roughness: 0.38,
        metalness: 0.05,
        desc: 'Aged Ceylon timber featuring tight natural grain, weather resistance, and finished with warm organic beeswax.'
    },
    walnut: {
        name: 'Dark Walnut',
        price: 28000,
        color: 0x3d2112,
        roughness: 0.32,
        metalness: 0.08,
        desc: 'Deep royal chocolate brown with espresso grain streaks and a silken matte tactile feel.'
    },
    ebony: {
        name: 'Ebony Ash',
        price: 34000,
        color: 0x1d1a18,
        roughness: 0.28,
        metalness: 0.12,
        desc: 'Jet black timber with charcoal undertones, creating bold aristocratic contrast.'
    },
    mahogany: {
        name: 'Red Mahogany',
        price: 25000,
        color: 0x611812,
        roughness: 0.34,
        metalness: 0.06,
        desc: 'Rich reddish-burgundy hues that deepen with age under natural sunlight exposure.'
    },
    oak: {
        name: 'Nordic Oak',
        price: 21500,
        color: 0xb59570,
        roughness: 0.44,
        metalness: 0.04,
        desc: 'Pale golden Scandinavian oak with open cathedral pore patterns and organic wax coat.'
    }
};

const fabricOptions = {
    linen: {
        name: 'Oat Linen',
        price: 0,
        color: 0xd9cca8,
        roughness: 0.85,
        metalness: 0.0,
        desc: '100% organic unbleached flax weave. Breathable, hypoallergenic, and naturally durable for daily dining.'
    },
    crimson_velvet: {
        name: 'Crimson Velvet',
        price: 14000,
        color: 0x6b0918,
        roughness: 0.65,
        metalness: 0.1,
        desc: 'Deep royal ruby velvet with plush 400gsm pile that catches light dramatically across angles.'
    },
    emerald_velvet: {
        name: 'Emerald Velvet',
        price: 14000,
        color: 0x113b28,
        roughness: 0.65,
        metalness: 0.1,
        desc: 'Aristocratic Ceylon forest green velvet offering luxuriant tactile depth and rich shadows.'
    },
    navy_velvet: {
        name: 'Sapphire Velvet',
        price: 14000,
        color: 0x142747,
        roughness: 0.65,
        metalness: 0.1,
        desc: 'Regal midnight navy hue reminiscent of Ceylon blue sapphires, treated for stain resistance.'
    },
    leather: {
        name: 'Cognac Leather',
        price: 23000,
        color: 0x733a18,
        roughness: 0.4,
        metalness: 0.15,
        desc: 'Full-grain vegetable-tanned leather that develops a magnificent personalized patina.'
    },
    noir_velvet: {
        name: 'Noir Velvet',
        price: 14000,
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.05,
        desc: 'Obsidian black velvet exuding modern imperial grandeur with whisper-soft pile.'
    }
};

const trimOptions = {
    gold: {
        name: '24K Gold Leaf',
        price: 11000,
        color: 0xd4af37,
        roughness: 0.28,
        metalness: 0.88,
        desc: 'Hand-applied gold leaf gilding on the central back medallion and corner rosette blocks.'
    },
    wood: {
        name: 'Matching Timber',
        price: 0,
        color: 0x9b5a28,
        roughness: 0.35,
        metalness: 0.05,
        desc: 'Carvings remain in natural solid timber, sculpted seamlessly with the chair frame.'
    },
    bronze: {
        name: 'Antique Bronze',
        price: 9500,
        color: 0x8f6844,
        roughness: 0.42,
        metalness: 0.65,
        desc: 'Warm patinated bronze leafing with dark antique burnish in carved recesses.'
    }
};

const BASE_PRICE = 185000;

export default function ChairConfigurator() {
    const router = useRouter();
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);

    const [selectedWood, setSelectedWood] = useState('teak');
    const [selectedFabric, setSelectedFabric] = useState('linen');
    const [selectedTrim, setSelectedTrim] = useState('gold');
    const [activeTab, setActiveTab] = useState('wood');
    const [isAutoSpin, setIsAutoSpin] = useState(true);
    const [activeCamPill, setActiveCamPill] = useState('hero');

    // Three.js object references
    const threeRefs = useRef({
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        woodMaterial: null,
        cushionMaterial: null,
        accentMaterial: null,
        targetCameraPos: null,
        animFrameId: null
    });

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
        camera.position.set(42, 48, 68);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        // Controls
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 + 0.04;
        controls.minDistance = 32;
        controls.maxDistance = 120;
        controls.target.set(0, 24, 0);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.2;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.75);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfffaee, 1.35);
        keyLight.position.set(38, 70, 45);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.bias = -0.0001;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xdceaff, 0.55);
        fillLight.position.set(-45, 35, -30);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffdf99, 0.75);
        rimLight.position.set(0, 50, -55);
        scene.add(rimLight);

        const floorBounce = new THREE.DirectionalLight(0x7d4a1b, 0.25);
        floorBounce.position.set(0, -20, 20);
        scene.add(floorBounce);

        // Studio Floor shadow receiver
        const floorGeo = new THREE.CircleGeometry(32, 48);
        const floorMat = new THREE.ShadowMaterial({ opacity: 0.38 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.01;
        floor.receiveShadow = true;
        scene.add(floor);

        // Ambient Brass Rings
        const ringGeo = new THREE.RingGeometry(28, 28.3, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        scene.add(ring);

        // Bump maps
        const woodBumpCanvas = document.createElement('canvas');
        woodBumpCanvas.width = 128;
        woodBumpCanvas.height = 256;
        const wCtx = woodBumpCanvas.getContext('2d');
        if (wCtx) {
            wCtx.fillStyle = '#808080';
            wCtx.fillRect(0, 0, 128, 256);
            for (let i = 0; i < 120; i++) {
                const y = Math.random() * 256;
                wCtx.fillStyle = Math.random() > 0.5 ? '#959595' : '#6b6b6b';
                wCtx.fillRect(0, y, 128, Math.random() * 2 + 1);
            }
        }
        const woodBump = new THREE.CanvasTexture(woodBumpCanvas);
        woodBump.wrapS = THREE.RepeatWrapping;
        woodBump.wrapT = THREE.RepeatWrapping;
        woodBump.repeat.set(1, 4);

        const fabricBumpCanvas = document.createElement('canvas');
        fabricBumpCanvas.width = 64;
        fabricBumpCanvas.height = 64;
        const fCtx = fabricBumpCanvas.getContext('2d');
        if (fCtx) {
            fCtx.fillStyle = '#808080';
            fCtx.fillRect(0, 0, 64, 64);
            for (let x = 0; x < 64; x += 4) {
                for (let y = 0; y < 64; y += 4) {
                    fCtx.fillStyle = ((x + y) % 8 === 0) ? '#a0a0a0' : '#606060';
                    fCtx.fillRect(x, y, 3, 3);
                }
            }
        }
        const fabricBump = new THREE.CanvasTexture(fabricBumpCanvas);
        fabricBump.wrapS = THREE.RepeatWrapping;
        fabricBump.wrapT = THREE.RepeatWrapping;
        fabricBump.repeat.set(8, 8);

        // Materials
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: woodOptions.teak.color,
            roughness: woodOptions.teak.roughness,
            metalness: woodOptions.teak.metalness,
            bumpMap: woodBump,
            bumpScale: 0.025
        });

        const cushionMaterial = new THREE.MeshStandardMaterial({
            color: fabricOptions.linen.color,
            roughness: fabricOptions.linen.roughness,
            metalness: fabricOptions.linen.metalness,
            bumpMap: fabricBump,
            bumpScale: 0.04
        });

        const accentMaterial = new THREE.MeshStandardMaterial({
            color: trimOptions.gold.color,
            roughness: trimOptions.gold.roughness,
            metalness: trimOptions.gold.metalness
        });

        threeRefs.current.woodMaterial = woodMaterial;
        threeRefs.current.cushionMaterial = cushionMaterial;
        threeRefs.current.accentMaterial = accentMaterial;
        threeRefs.current.scene = scene;
        threeRefs.current.camera = camera;
        threeRefs.current.renderer = renderer;
        threeRefs.current.controls = controls;

        // Build Procedural Chair
        const chairGroup = new THREE.Group();

        // 1. Turned Front Legs
        const lathePoints = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(1.2, 0),
            new THREE.Vector2(1.4, 1.2),
            new THREE.Vector2(0.9, 2.4),
            new THREE.Vector2(1.4, 3.4),
            new THREE.Vector2(0.9, 4.4),
            new THREE.Vector2(1.5, 8.5),
            new THREE.Vector2(1.1, 14.0),
            new THREE.Vector2(1.3, 22.0),
            new THREE.Vector2(1.0, 23.5),
            new THREE.Vector2(1.5, 25.0),
            new THREE.Vector2(1.2, 26.5),
            new THREE.Vector2(0, 26.5)
        ];
        const legLatheGeo = new THREE.LatheGeometry(lathePoints, 24);

        const frontLegL = new THREE.Mesh(legLatheGeo, woodMaterial);
        frontLegL.castShadow = true;
        frontLegL.position.set(-14.5, 0, 12.5);
        chairGroup.add(frontLegL);

        const frontLegR = new THREE.Mesh(legLatheGeo, woodMaterial);
        frontLegR.castShadow = true;
        frontLegR.position.set(14.5, 0, 12.5);
        chairGroup.add(frontLegR);

        // Top Square Plinths
        const plinthGeo = new THREE.BoxGeometry(3.2, 4.5, 3.2);
        const plinthL = new THREE.Mesh(plinthGeo, woodMaterial);
        plinthL.position.set(-14.5, 28.5, 12.5);
        plinthL.castShadow = true;
        chairGroup.add(plinthL);

        const plinthR = new THREE.Mesh(plinthGeo, woodMaterial);
        plinthR.position.set(14.5, 28.5, 12.5);
        plinthR.castShadow = true;
        chairGroup.add(plinthR);

        // Rosette Badges
        const rosetteGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.4, 16);
        rosetteGeo.rotateX(Math.PI / 2);
        const rosetteL = new THREE.Mesh(rosetteGeo, accentMaterial);
        rosetteL.position.set(-14.5, 28.5, 14.2);
        chairGroup.add(rosetteL);

        const rosetteR = new THREE.Mesh(rosetteGeo, accentMaterial);
        rosetteR.position.set(14.5, 28.5, 14.2);
        chairGroup.add(rosetteR);

        // 2. Rear Curved Saber Legs
        const rearCurveLPoints = [
            new THREE.Vector3(-12.8, 0, -16.5),
            new THREE.Vector3(-12.5, 15, -14.0),
            new THREE.Vector3(-12.2, 28, -12.5),
            new THREE.Vector3(-12.0, 42, -13.0),
            new THREE.Vector3(-12.8, 56, -15.2),
            new THREE.Vector3(-13.8, 68, -17.0)
        ];
        const rearCurveL = new THREE.CatmullRomCurve3(rearCurveLPoints);
        const rearLegGeoL = new THREE.TubeGeometry(rearCurveL, 24, 1.35, 10, false);
        const rearLegMeshL = new THREE.Mesh(rearLegGeoL, woodMaterial);
        rearLegMeshL.castShadow = true;
        chairGroup.add(rearLegMeshL);

        const rearCurveRPoints = rearCurveLPoints.map(p => new THREE.Vector3(-p.x, p.y, p.z));
        const rearCurveR = new THREE.CatmullRomCurve3(rearCurveRPoints);
        const rearLegGeoR = new THREE.TubeGeometry(rearCurveR, 24, 1.35, 10, false);
        const rearLegMeshR = new THREE.Mesh(rearLegGeoR, woodMaterial);
        rearLegMeshR.castShadow = true;
        chairGroup.add(rearLegMeshR);

        // 3. Seat Apron Rails
        const frontApronGeo = new THREE.BoxGeometry(26, 3.8, 1.8);
        const frontApron = new THREE.Mesh(frontApronGeo, woodMaterial);
        frontApron.position.set(0, 28.5, 12.5);
        frontApron.castShadow = true;
        chairGroup.add(frontApron);

        const dropGeo = new THREE.CylinderGeometry(2.4, 0.4, 2.2, 16);
        dropGeo.rotateZ(Math.PI);
        const dropMesh = new THREE.Mesh(dropGeo, woodMaterial);
        dropMesh.position.set(0, 25.8, 12.8);
        chairGroup.add(dropMesh);

        const sideApronGeo = new THREE.BoxGeometry(1.6, 3.6, 25);
        const sideApronL = new THREE.Mesh(sideApronGeo, woodMaterial);
        sideApronL.position.set(-13.4, 28.5, 0);
        sideApronL.castShadow = true;
        chairGroup.add(sideApronL);

        const sideApronR = new THREE.Mesh(sideApronGeo, woodMaterial);
        sideApronR.position.set(13.4, 28.5, 0);
        sideApronR.castShadow = true;
        chairGroup.add(sideApronR);

        const backApronGeo = new THREE.BoxGeometry(23, 3.4, 1.6);
        const backApron = new THREE.Mesh(backApronGeo, woodMaterial);
        backApron.position.set(0, 28.5, -12.5);
        backApron.castShadow = true;
        chairGroup.add(backApron);

        // 4. Upholstered Seat Cushion
        const cushionShape = new THREE.Shape();
        cushionShape.moveTo(-13.5, -12.5);
        cushionShape.lineTo(13.5, -12.5);
        cushionShape.lineTo(15.8, 11.5);
        cushionShape.quadraticCurveTo(0, 14.5, -15.8, 11.5);
        cushionShape.closePath();

        const cushionExtrudeSettings = {
            steps: 2,
            depth: 2.8,
            bevelEnabled: true,
            bevelThickness: 2.2,
            bevelSize: 1.6,
            bevelSegments: 6
        };
        const cushionGeo = new THREE.ExtrudeGeometry(cushionShape, cushionExtrudeSettings);
        cushionGeo.rotateX(-Math.PI / 2);

        const cushionMesh = new THREE.Mesh(cushionGeo, cushionMaterial);
        cushionMesh.position.set(0, 31.8, 0);
        cushionMesh.castShadow = true;
        cushionMesh.receiveShadow = true;
        chairGroup.add(cushionMesh);

        // Piping trim
        const pipingCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-14.2, 31.2, -12.8),
            new THREE.Vector3(14.2, 31.2, -12.8),
            new THREE.Vector3(16.5, 31.2, 11.8),
            new THREE.Vector3(0, 31.2, 14.8),
            new THREE.Vector3(-16.5, 31.2, 11.8)
        ], true);
        const pipingGeo = new THREE.TubeGeometry(pipingCurve, 32, 0.45, 8, true);
        const pipingMesh = new THREE.Mesh(pipingGeo, cushionMaterial);
        chairGroup.add(pipingMesh);

        // 5. Ornate Carved Backrest
        const crestCurvePoints = [
            new THREE.Vector3(-14.2, 67.5, -17.2),
            new THREE.Vector3(-7.0, 71.5, -17.4),
            new THREE.Vector3(0, 73.2, -17.6),
            new THREE.Vector3(7.0, 71.5, -17.4),
            new THREE.Vector3(14.2, 67.5, -17.2)
        ];
        const crestCurve = new THREE.CatmullRomCurve3(crestCurvePoints);
        const crestGeo = new THREE.TubeGeometry(crestCurve, 24, 1.4, 10, false);
        const crestMesh = new THREE.Mesh(crestGeo, woodMaterial);
        crestMesh.castShadow = true;
        chairGroup.add(crestMesh);

        const crownFinialGeo = new THREE.CylinderGeometry(1.6, 0.4, 3.2, 16);
        crownFinialGeo.rotateX(0.15);
        const crownFinial = new THREE.Mesh(crownFinialGeo, accentMaterial);
        crownFinial.position.set(0, 74.6, -17.8);
        chairGroup.add(crownFinial);

        const lowerBackRailGeo = new THREE.BoxGeometry(22.5, 2.2, 1.4);
        const lowerBackRail = new THREE.Mesh(lowerBackRailGeo, woodMaterial);
        lowerBackRail.position.set(0, 37.5, -13.0);
        chairGroup.add(lowerBackRail);

        // Central Medallion
        const ovalRingGeo = new THREE.TorusGeometry(6.2, 0.85, 12, 36);
        ovalRingGeo.scale(1.0, 1.42, 0.8);
        const ovalRingMesh = new THREE.Mesh(ovalRingGeo, woodMaterial);
        ovalRingMesh.position.set(0, 53.5, -15.0);
        ovalRingMesh.rotation.x = 0.15;
        chairGroup.add(ovalRingMesh);

        const centerRosetteGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.6, 24);
        centerRosetteGeo.scale(1.0, 0.7, 1.35);
        centerRosetteGeo.rotateX(Math.PI / 2 + 0.15);
        const centerRosette = new THREE.Mesh(centerRosetteGeo, accentMaterial);
        centerRosette.position.set(0, 53.5, -15.0);
        chairGroup.add(centerRosette);

        // Lattice Filigree
        const ribbonL1Points = [
            new THREE.Vector3(-12.8, 62.0, -15.8),
            new THREE.Vector3(-7.5, 57.0, -15.2),
            new THREE.Vector3(-4.5, 52.0, -14.9)
        ];
        chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonL1Points), 12, 0.55, 6, false), woodMaterial));
        chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonL1Points.map(p => new THREE.Vector3(-p.x, p.y, p.z))), 12, 0.55, 6, false), woodMaterial));

        const ribbonL2Points = [
            new THREE.Vector3(-4.5, 55.0, -15.0),
            new THREE.Vector3(-7.5, 48.0, -14.4),
            new THREE.Vector3(-12.2, 43.0, -13.8)
        ];
        chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonL2Points), 12, 0.55, 6, false), woodMaterial));
        chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonL2Points.map(p => new THREE.Vector3(-p.x, p.y, p.z))), 12, 0.55, 6, false), woodMaterial));

        // 6. Stretchers
        const stretcherLPoints = [new THREE.Vector3(-14.5, 9.0, 12.5), new THREE.Vector3(-13.5, 9.0, -14.0)];
        chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stretcherLPoints), 12, 0.7, 6, false), woodMaterial));
        chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stretcherLPoints.map(p => new THREE.Vector3(-p.x, p.y, p.z))), 12, 0.7, 6, false), woodMaterial));

        const crossPoints = [new THREE.Vector3(-14.0, 9.0, 0), new THREE.Vector3(14.0, 9.0, 0)];
        chairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(crossPoints), 12, 0.7, 6, false), woodMaterial));

        scene.add(chairGroup);

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

        // Render animation loop
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

    // Sync wood material changes
    const handleSelectWood = (woodKey) => {
        setSelectedWood(woodKey);
        const opt = woodOptions[woodKey];
        const { woodMaterial, accentMaterial } = threeRefs.current;
        if (woodMaterial && opt) {
            woodMaterial.color.setHex(opt.color);
            woodMaterial.roughness = opt.roughness;
            woodMaterial.metalness = opt.metalness;
            woodMaterial.needsUpdate = true;
        }
        if (selectedTrim === 'wood' && accentMaterial && opt) {
            accentMaterial.color.setHex(opt.color);
            accentMaterial.roughness = opt.roughness;
            accentMaterial.metalness = opt.metalness;
            accentMaterial.needsUpdate = true;
        }
    };

    // Sync fabric material changes
    const handleSelectFabric = (fabricKey) => {
        setSelectedFabric(fabricKey);
        const opt = fabricOptions[fabricKey];
        const { cushionMaterial } = threeRefs.current;
        if (cushionMaterial && opt) {
            cushionMaterial.color.setHex(opt.color);
            cushionMaterial.roughness = opt.roughness;
            cushionMaterial.metalness = opt.metalness;
            cushionMaterial.needsUpdate = true;
        }
    };

    // Sync trim material changes
    const handleSelectTrim = (trimKey) => {
        setSelectedTrim(trimKey);
        const opt = trimOptions[trimKey];
        const { accentMaterial } = threeRefs.current;
        if (accentMaterial && opt) {
            if (trimKey === 'wood') {
                const curWood = woodOptions[selectedWood];
                accentMaterial.color.setHex(curWood.color);
                accentMaterial.roughness = curWood.roughness;
                accentMaterial.metalness = curWood.metalness;
            } else {
                accentMaterial.color.setHex(opt.color);
                accentMaterial.roughness = opt.roughness;
                accentMaterial.metalness = opt.metalness;
            }
            accentMaterial.needsUpdate = true;
        }
    };

    // Camera preset views
    const handleSetCameraView = (preset) => {
        setActiveCamPill(preset);
        const { controls, targetCameraPos } = threeRefs.current;
        if (controls) {
            controls.autoRotate = false;
            setIsAutoSpin(false);
        }

        if (preset === 'hero') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(42, 46, 64);
            if (controls) controls.target.set(0, 24, 0);
        } else if (preset === 'front') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(0, 36, 75);
            if (controls) controls.target.set(0, 32, 0);
        } else if (preset === 'back') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(0, 52, -75);
            if (controls) controls.target.set(0, 50, 0);
        } else if (preset === 'side') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(75, 34, 0);
            if (controls) controls.target.set(0, 30, 0);
        } else if (preset === 'cushion') {
            threeRefs.current.targetCameraPos = new THREE.Vector3(0, 72, 38);
            if (controls) controls.target.set(0, 32, 0);
        }
    };

    // Toggle Spin
    const handleToggleSpin = () => {
        const next = !isAutoSpin;
        setIsAutoSpin(next);
        if (threeRefs.current.controls) {
            threeRefs.current.controls.autoRotate = next;
        }
    };

    // Zoom
    const handleZoom = (delta) => {
        const { camera, controls } = threeRefs.current;
        if (!camera || !controls) return;
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
        camera.position.addScaledVector(dir, delta * 20);
    };

    // Reset View
    const handleReset = () => {
        const { camera, controls } = threeRefs.current;
        if (!camera || !controls) return;
        threeRefs.current.targetCameraPos = new THREE.Vector3(42, 48, 68);
        controls.target.set(0, 24, 0);
        setIsAutoSpin(true);
        controls.autoRotate = true;
        setActiveCamPill('hero');
    };

    // Order Action
    const handleOrder = () => {
        const wood = woodOptions[selectedWood];
        const fabric = fabricOptions[selectedFabric];
        const trim = trimOptions[selectedTrim];
        const total = BASE_PRICE + wood.price + fabric.price + trim.price;
        const specs = `Bespoke Order: Lansakara Royal Chair • Wood: ${wood.name} • Upholstery: ${fabric.name} • Trim: ${trim.name}`;

        const orderDraft = {
            name: 'Lansakara Royal Bespoke Chair',
            price: total,
            image: '/images/lansakara_royal_chair.jpg',
            specs: specs,
            woodSpec: wood.name,
            fabricSpec: fabric.name,
            trimSpec: trim.name
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('lansakara_checkout_order', JSON.stringify(orderDraft));
        }
        router.push(`/checkout?product=${encodeURIComponent('Lansakara Royal Bespoke Chair')}&price=${total}`);
    };

    const currentWood = woodOptions[selectedWood];
    const currentFabric = fabricOptions[selectedFabric];
    const currentTrim = trimOptions[selectedTrim];
    const totalPrice = BASE_PRICE + currentWood.price + currentFabric.price + currentTrim.price;

    return (
        <section className="chair-3d-studio" id="3d-chair">
            <div className="section-header reveal">
                <div className="section-label" style={{ color: 'var(--gold)' }}>3D Bespoke Studio</div>
                <h2 className="section-title" style={{ color: 'var(--white)' }}>
                    Design Your <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Royal Chair</span> in 3D
                </h2>
                <p className="section-desc" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Rotate 360° in real-time 3D space, customize the handcrafted solid wood species, upholstery fabrics, and gilded carving accents to build your heirloom piece.
                </p>
            </div>

            <div className="chair-3d-container">
                {/* 3D WebGL Canvas Viewport */}
                <div className="chair-canvas-wrapper reveal-left" ref={wrapperRef} id="chairCanvasWrapper">
                    <div className="chair-canvas-badge">
                        <span className="live-dot"></span>
                        <span>3D Real-Time WebGL Engine</span>
                    </div>

                    <div className="chair-canvas-actions">
                        <button
                            className={`chair-tool-btn ${isAutoSpin ? 'active' : ''}`}
                            onClick={handleToggleSpin}
                        >
                            {isAutoSpin ? '⟳ Spin: ON' : '⟳ Spin: OFF'}
                        </button>
                        <button className="chair-tool-btn" onClick={() => handleZoom(-0.15)} title="Zoom In">+</button>
                        <button className="chair-tool-btn" onClick={() => handleZoom(0.15)} title="Zoom Out">−</button>
                        <button className="chair-tool-btn" onClick={handleReset} title="Reset Perspective">↺ Reset</button>
                    </div>

                    <canvas ref={canvasRef} id="chairThreeCanvas"></canvas>

                    <div className="chair-camera-dock">
                        {[
                            { id: 'hero', label: '3/4 Hero' },
                            { id: 'front', label: 'Front' },
                            { id: 'back', label: 'Carved Back' },
                            { id: 'side', label: 'Side' },
                            { id: 'cushion', label: 'Cushion' }
                        ].map((view) => (
                            <button
                                key={view.id}
                                className={`chair-cam-pill ${activeCamPill === view.id ? 'active' : ''}`}
                                onClick={() => handleSetCameraView(view.id)}
                            >
                                {view.label}
                            </button>
                        ))}
                    </div>

                    <div className="chair-viewer-hint">
                        <span>↻ Click & Drag to Orbit 360° • Pinch / Scroll to Zoom</span>
                    </div>
                </div>

                {/* Customizer Side Panel */}
                <div className="chair-customizer-panel reveal-right">
                    <div className="customizer-card">
                        <span className="config-badge">Bespoke Configurator</span>
                        <h3 className="config-title">Lansakara Royal Dining Chair</h3>
                        <p className="config-desc">
                            Ancestral Ceylon woodcraft meets tailored comfort. Select your wood species, cushion upholstery, and carving trim below:
                        </p>

                        {/* Step Tabs */}
                        <div className="config-tabs">
                            <button
                                className={`config-tab-btn ${activeTab === 'wood' ? 'active' : ''}`}
                                onClick={() => setActiveTab('wood')}
                            >
                                <span>🪵</span> 1. Timber Frame
                            </button>
                            <button
                                className={`config-tab-btn ${activeTab === 'fabric' ? 'active' : ''}`}
                                onClick={() => setActiveTab('fabric')}
                            >
                                <span>🛋️</span> 2. Cushion Fabric
                            </button>
                            <button
                                className={`config-tab-btn ${activeTab === 'trim' ? 'active' : ''}`}
                                onClick={() => setActiveTab('trim')}
                            >
                                <span>✨</span> 3. Carving Trim
                            </button>
                        </div>

                        {/* TAB 1: Wood */}
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
                                        </div>
                                    ))}
                                </div>
                                <div className="material-info-box" id="woodInfoBox">
                                    <strong>{currentWood.name}</strong>
                                    {currentWood.desc}
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
                                        </div>
                                    ))}
                                </div>
                                <div className="material-info-box" id="fabricInfoBox">
                                    <strong>{currentFabric.name}</strong>
                                    {currentFabric.desc}
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
                                        </div>
                                    ))}
                                </div>
                                <div className="material-info-box" id="trimInfoBox">
                                    <strong>{currentTrim.name}</strong>
                                    {currentTrim.desc}
                                </div>
                            </div>
                        )}

                        {/* Live Pricing & Order Action Card */}
                        <div className="config-summary-card">
                            <div className="summary-header-row">
                                <span className="summary-label">Estimated Investment:</span>
                                <span className="summary-price-big" id="configPriceDisplay">
                                    Rs. {totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="summary-pills-row" id="configSummaryPills">
                                <span className="summary-pill">{currentWood.name} (+Rs. {currentWood.price.toLocaleString()})</span>
                                <span className="summary-pill">{currentFabric.name} (+Rs. {currentFabric.price.toLocaleString()})</span>
                                <span className="summary-pill">{currentTrim.name} (+Rs. {currentTrim.price.toLocaleString()})</span>
                            </div>
                            <button className="config-order-btn" onClick={handleOrder}>
                                <span>⚜</span> Order This Custom Build →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
