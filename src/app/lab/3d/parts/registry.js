// Each entry: { slug, label, category, render: () => JSX, cameraPos?, targetY?, showGround?, autoRotate? }
// Components render at neutral position (origin) so the frame's camera/orbit works for all of them.

import { Island } from '../components/Island';
import { GrassField } from '../components/GrassField';
import { Clouds } from '../components/Clouds';
import { Kodama } from '../components/Kodama';
import { Torii } from '../components/Torii';
import { Cottage } from '../components/Cottage';
import { GLBTrees } from '../components/GLBTrees';
import { GLBMushrooms, GLBFlowers, GLBStumps } from '../components/GLBScatter';
import { Waterfall } from '../components/Waterfall';
import { Campfire } from '../components/Campfire';
import { Lake } from '../components/Lake';
import { CherryBlossoms } from '../components/CherryBlossoms';
import { HangingLanterns } from '../components/HangingLanterns';
import { DistantClouds } from '../components/DistantClouds';
import { SakuraPetals } from '../components/SakuraPetals';
import { HakuDragon } from '../components/HakuDragon';
import { ForestSpirit } from '../components/ForestSpirit';
import { StoneLantern } from '../components/StoneLantern';
import { TallGrass } from '../components/TallGrass';
import { Fireflies } from '../components/Fireflies';
import { Bridge } from '../components/Bridge';
import { SteppingStones } from '../components/SteppingStones';
import { Moon } from '../components/Moon';
import { Birds } from '../components/Birds';
import { UndersideMist } from '../components/UndersideMist';
import { SpiritVisitor } from '../components/SpiritVisitor';
import { PoleLanterns } from '../components/PoleLanterns';
import { ToriiBeam } from '../components/ToriiBeam';
import { Susuwatari } from '../components/Susuwatari';
import { WindChime } from '../components/WindChime';
import { Cattails } from '../components/Cattails';
import { PerchedCrane } from '../components/PerchedCrane';
import { DistantMountains } from '../components/DistantMountains';
import { Airship } from '../components/Airship';

export const PARTS = [
  // === Landscape ===
  // Island: group at origin, terrain radius ~3, height span ~-4.2 to +0.6
  { slug: 'island', label: 'Floating Island', category: 'Landscape', cameraPos: [6, 4, 6], targetY: -0.5, showGround: false, render: () => <Island /> },
  // DistantMountains: cone rings at radii 36-64, yBase=-3. Need a far elevated camera looking in.
  { slug: 'mountains', label: 'Distant Mountains', category: 'Landscape', cameraPos: [0, 10, 55], targetY: 2, showGround: false, render: () => <DistantMountains /> },
  // GrassField: blades at yBase=0.01, height ~0.2, radius 2.5
  { slug: 'grass-field', label: 'Grass Field', category: 'Landscape', cameraPos: [2.5, 1.2, 2.5], targetY: 0.1, render: () => <GrassField count={6000} radius={2.5} yBase={0.01} /> },
  // TallGrass: tufts at radius 0.4-2.7, y=0.52, blade height ~0.35-0.55
  { slug: 'tall-grass', label: 'Tall Grass Tufts', category: 'Landscape', cameraPos: [2, 1.2, 2], targetY: 0.7, render: () => <TallGrass /> },
  // Cattails: HARDCODED near [-2.4,0.5,1.6] and [-1.5,0.5,2.6]. Wrap to center.
  // Center of cluster ≈ (-2.0, 0.5, 2.0). Wrap with group position=[2.0,-0.5,-2.0]
  { slug: 'cattails', label: 'Cattails', category: 'Landscape', cameraPos: [2, 1.5, 2], targetY: 0.5, render: () => (
    <group position={[2.0, -0.5, -2.0]}><Cattails /></group>
  ) },

  // === Structures ===
  // Torii: registry passes position={[0,0,0]}, scale 3.5 GLB. Likely ~1.5 wide, ~2 tall at that scale.
  { slug: 'torii', label: 'Inari Torii Gate', category: 'Structures', cameraPos: [2.5, 1.5, 2.5], targetY: 1.0, render: () => <Torii position={[0, 0, 0]} rotationY={0} /> },
  // ToriiBeam: HARDCODED at [2.5, 1.2, 1.0]. Wrap to center.
  { slug: 'torii-beam', label: 'Torii Light Beam', category: 'Structures', cameraPos: [2, 1.5, 2], targetY: 0.5, render: () => (
    <group position={[-2.5, -1.2, -1.0]}><ToriiBeam /></group>
  ) },
  // Cottage: HARDCODED at [-1.6, 0.65, -0.4], height ~1.9. Wrap to center.
  { slug: 'cottage', label: 'Cottage', category: 'Structures', cameraPos: [2.5, 1.5, 2.5], targetY: 0.8, render: () => (
    <group position={[1.6, -0.65, 0.4]}><Cottage /></group>
  ) },
  // Bridge: registry passes position={[0,0,0]}, scale 1. Width 1.5, height ~0.36.
  { slug: 'bridge', label: 'Arched Bridge', category: 'Structures', cameraPos: [1.5, 0.8, 1.5], targetY: 0.2, render: () => <Bridge position={[0, 0, 0]} rotationY={0} scale={1.0} /> },
  // SteppingStones: x -1.0 to 1.4, z 0.4-1.1, y=0.51. Center ~(0.2, 0.51, 0.75).
  // Wrap to center around origin.
  { slug: 'stepping-stones', label: 'Stepping Stones', category: 'Structures', cameraPos: [1.8, 1.2, 1.8], targetY: 0.5, render: () => (
    <group position={[-0.2, -0.51, -0.75]}><SteppingStones /></group>
  ) },
  // StoneLantern: registry passes position={[0,0,0]}, internal scale 1.92. GLB model.
  { slug: 'stone-lantern', label: 'Stone Lantern (Toro)', category: 'Structures', cameraPos: [1.5, 0.8, 1.5], targetY: 0.4, render: () => <StoneLantern position={[0, 0, 0]} scale={1.2} /> },
  // PoleLanterns: 2 lanterns at [-2.2,0.5,-1.4] and [2.3,0.5,1.4]. Spread ~6.5 diagonal.
  // Center ≈ (0.05, 0.5, 0.0). Camera needs to be wide.
  { slug: 'pole-lanterns', label: 'Paper Pole Lanterns', category: 'Structures', cameraPos: [4.5, 2.5, 4.5], targetY: 0.9, render: () => <PoleLanterns /> },
  // HangingLanterns: x -2.15 to 1.85, y 1.5-1.9. Spread ~4 wide.
  { slug: 'hanging-lanterns', label: 'Hanging Lanterns', category: 'Structures', cameraPos: [3.5, 2.5, 3.5], targetY: 1.5, render: () => <HangingLanterns /> },
  // WindChime: registry passes position={[0,0,0]}. Bell + string ~0.55 tall, tiny.
  { slug: 'wind-chime', label: 'Wind Chime', category: 'Structures', cameraPos: [0.6, 0.5, 0.6], targetY: 0.1, render: () => <WindChime position={[0, 0, 0]} /> },
  // Campfire: registry passes position={[0,0,0]}. Tiny, logs ~0.3 tall.
  { slug: 'campfire', label: 'Campfire', category: 'Structures', cameraPos: [1.0, 0.6, 1.0], targetY: 0.15, render: () => <Campfire position={[0, 0, 0]} /> },

  // === Trees & Flora ===
  // CherryBlossoms: 4 trees at radius ~1-2, y=0.5 base, max height ~2.6
  { slug: 'cherry-blossoms', label: 'Cherry Blossom Trees', category: 'Flora', cameraPos: [3.5, 2.2, 3.5], targetY: 1.2, render: () => <CherryBlossoms /> },
  // GLBTrees: 15 trees in circle radius 0-2.3, y=0.52, likely 1-2 units tall
  { slug: 'glb-trees', label: 'Forest Trees (Kenney)', category: 'Flora', cameraPos: [4, 2.5, 4], targetY: 1.0, render: () => <GLBTrees /> },
  // GLBMushrooms: 9 at radius 0.8-2.8, y=0.5, small scale
  { slug: 'mushrooms', label: 'Mushrooms', category: 'Flora', cameraPos: [2.5, 1.5, 2.5], targetY: 0.5, render: () => <GLBMushrooms /> },
  // GLBFlowers: 20 at radius 1.5-2.8, y=0.5
  { slug: 'flowers', label: 'Wildflowers', category: 'Flora', cameraPos: [2.5, 1.5, 2.5], targetY: 0.5, render: () => <GLBFlowers /> },
  // GLBStumps: 5 at radius 0.5-2.3, y=0.5
  { slug: 'stumps', label: 'Stumps & Logs', category: 'Flora', cameraPos: [2.5, 1.5, 2.5], targetY: 0.5, render: () => <GLBStumps /> },

  // === Water ===
  // Lake: HARDCODED at [-1.5, 0.5, 1.6], disc radius 1.1. Wrap to center.
  { slug: 'lake', label: 'Koi Lake', category: 'Water', cameraPos: [2, 1.8, 2], targetY: 0.1, render: () => (
    <group position={[1.5, -0.5, -1.6]}><Lake /></group>
  ) },
  // Waterfall: HARDCODED at [3.05, -1.05, -0.4], plane height 3.4. Wrap to center.
  { slug: 'waterfall', label: 'Waterfall', category: 'Water', cameraPos: [3, 2, 3], targetY: 0.3, render: () => (
    <group position={[-3.05, 1.05, 0.4]}><Waterfall /></group>
  ) },

  // === Sky ===
  // Clouds: 5 cloud groups at radius ~1-9, y 3.5-6. Wrap by centering at avg ≈ (1,5,-1).
  { slug: 'clouds-near', label: 'Cloud Decks', category: 'Sky', cameraPos: [12, 3, 12], targetY: 0, showGround: false, render: () => (
    <group position={[-1, -5, 1]}><Clouds /></group>
  ) },
  // DistantClouds: 44 puffs at radius 14-42, y = -7 to -16. Extremely wide. Use very far camera.
  // NOTE: this component is designed to be seen from inside the island scene, not in isolation.
  { slug: 'distant-clouds', label: 'Distant Painterly Clouds', category: 'Sky', cameraPos: [0, -5, 35], targetY: -12, showGround: false, render: () => <DistantClouds /> },
  // Moon: HARDCODED at [-22, 12, 25]. Wrap to center.
  { slug: 'moon', label: 'Moon', category: 'Sky', cameraPos: [0, 0, 5], targetY: 0, showGround: false, render: () => (
    <group position={[22, -12, -25]}><Moon /></group>
  ) },
  // Airship chunky: radius=0, altitude=0, speed=0 → stays at origin. Scale 0.005. GLB model.
  { slug: 'airship-chunky', label: 'Howl’s Airship (chunky)', category: 'Sky', cameraPos: [3, 1, 3], targetY: 0, showGround: false, render: () => <Airship variant="chunky" radius={0} altitude={0} speed={0} scale={0.005} /> },
  // Airship prop: same static display
  { slug: 'airship-prop', label: 'Propeller Airship', category: 'Sky', cameraPos: [2, 0.5, 2], targetY: 0, showGround: false, render: () => <Airship variant="prop" radius={0} altitude={0} speed={0} scale={0.003} /> },

  // === Spirits & Creatures ===
  // Kodama: 5 spirits orbiting at radius 3.8-5.2, y 0.9-2.2. Camera must be OUTSIDE the orbit.
  { slug: 'kodama', label: 'Kodama (azure flame spirits)', category: 'Spirits', cameraPos: [8, 3, 8], targetY: 1.5, showGround: false, render: () => <Kodama /> },
  // Susuwatari: sprites at x -2.1 to 1.8, z -1.2 to 1.6, y~0.55. Center ≈ (-0.15, 0.55, 0.2).
  // Center is close enough to origin; just widen camera.
  { slug: 'susuwatari', label: 'Susuwatari (soot sprites)', category: 'Spirits', cameraPos: [3.5, 1.5, 3.5], targetY: 0.5, render: () => <Susuwatari /> },
  // ForestSpirit: registry passes position={[0,0,0]}. Body height ~0.84.
  { slug: 'forest-spirit', label: 'Forest Spirit (Totoro)', category: 'Spirits', cameraPos: [1.5, 1.0, 1.5], targetY: 0.4, render: () => <ForestSpirit position={[0, 0, 0]} rotationY={0} /> },
  // SpiritVisitor: registry passes position={[0,0,0]}. Height ~0.47.
  { slug: 'spirit-visitor', label: 'Spirit Visitor (Chihiro)', category: 'Spirits', cameraPos: [1.2, 0.8, 1.2], targetY: 0.25, render: () => <SpiritVisitor position={[0, 0, 0]} rotationY={0} /> },
  // HakuDragon: orbits at radius 7.5, y=3.8. Camera must be further out.
  { slug: 'haku-dragon', label: 'Haku Dragon', category: 'Spirits', cameraPos: [12, 5, 12], targetY: 3.5, showGround: false, render: () => <HakuDragon /> },
  // PerchedCrane: registry passes position={[0,0,0]}. Tiny bird, ~0.2 wide, 0.18 tall.
  { slug: 'perched-crane', label: 'Perched Crane', category: 'Spirits', cameraPos: [0.5, 0.3, 0.5], targetY: 0.07, render: () => <PerchedCrane position={[0, 0, 0]} rotationY={0} /> },
  // Birds: loop at radius 22, y=6. Inherently impossible to frame in a small tile.
  // NOTE: birds orbit at radius ~22; tile shows the sky center, bird may or may not be in frame.
  { slug: 'birds', label: 'Birds (V-formation)', category: 'Spirits', cameraPos: [0, 6, 28], targetY: 6, showGround: false, render: () => <Birds /> },

  // === Particles & Effects ===
  // SakuraPetals: 60 petals at radius ±3.5, y -2 to 5
  { slug: 'sakura-petals', label: 'Sakura Petals', category: 'Effects', cameraPos: [5, 3, 5], targetY: 1.5, showGround: false, render: () => <SakuraPetals /> },
  // Fireflies: 45 flies at x/z ±4, y 0.5-4
  { slug: 'fireflies', label: 'Fireflies', category: 'Effects', cameraPos: [5, 2.5, 5], targetY: 2, showGround: false, render: () => <Fireflies /> },
  // UndersideMist: puffs at radius 0.5-2.0, y = -0.8 to -3.8. Camera looks down from above-side.
  { slug: 'underside-mist', label: 'Underside Mist', category: 'Effects', cameraPos: [0, 3, 5], targetY: -2, showGround: false, render: () => <UndersideMist /> },
];

export const CATEGORIES = [...new Set(PARTS.map((p) => p.category))];
