// Each entry: { slug, label, category, render: () => JSX, cameraPos?, targetY?, showGround?, autoRotate? }
// Components render at neutral position (origin) so the frame's camera/orbit works for all of them.

import { SkyDome } from '../components/SkyDome';
import { Island } from '../components/Island';
import { GrassField } from '../components/GrassField';
import { Clouds } from '../components/Clouds';
import { Kodama } from '../components/Kodama';
import { Torii } from '../components/Torii';
import { Cottage } from '../components/Cottage';
import { GLBTrees } from '../components/GLBTrees';
import { GLBMushrooms, GLBFlowers, GLBStumps } from '../components/GLBScatter';
import { GLBRocks, GLBCliffs, GLBCrops, GLBFences, GLBPaths, GLBDecoProps } from '../components/GLBNewParts';
import { Waterfall } from '../components/Waterfall';
import { AnimeWater } from '../components/AnimeWater';
import { CalmPond } from '../components/CalmPond';
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
import { VolumetricCloud } from '../components/VolumetricCloud';
import { PuffCloud } from '../components/PuffCloud';
import { FireflySwarm } from '../components/FireflySwarm';
import { SpiritWisps } from '../components/SpiritWisps';
import { MossRock } from '../components/MossRock';
import { LushTree } from '../components/LushTree';
import { LightShafts } from '../components/LightShafts';
import { GlowMushrooms } from '../components/GlowMushrooms';
import { DriftingSpores } from '../components/DriftingSpores';
import { KoiSchool } from '../components/KoiSchool';

export const PARTS = [
  // === Landscape ===
  { slug: 'island', label: 'Floating Island', category: 'Landscape', cameraPos: [6, 4, 6], targetY: -0.5, showGround: false, render: () => <Island /> },
  { slug: 'mountains', label: 'Distant Mountains', category: 'Landscape', cameraPos: [0, 10, 55], targetY: 2, showGround: false, render: () => <DistantMountains /> },
  { slug: 'grass-field', label: 'Grass Field', category: 'Landscape', cameraPos: [2.5, 1.2, 2.5], targetY: 0.1, render: () => <GrassField count={6000} radius={2.5} yBase={0.01} /> },
  { slug: 'tall-grass', label: 'Tall Grass Tufts', category: 'Landscape', cameraPos: [2, 1.2, 2], targetY: 0.7, render: () => <TallGrass /> },
  // Cattails: HARDCODED near [-2.4,0.5,1.6] and [-1.5,0.5,2.6]. Wrap to center.
  // Center of cluster ≈ (-2.0, 0.5, 2.0). Wrap with group position=[2.0,-0.5,-2.0]
  { slug: 'cattails', label: 'Cattails', category: 'Landscape', cameraPos: [2, 1.5, 2], targetY: 0.5, render: () => (
    <group position={[2.0, -0.5, -2.0]}><Cattails /></group>
  ) },

  // === Structures ===
  { slug: 'torii', label: 'Inari Torii Gate', category: 'Structures', cameraPos: [2.5, 1.5, 2.5], targetY: 1.0, render: () => <Torii position={[0, 0, 0]} rotationY={0} /> },
  // ToriiBeam: HARDCODED at [2.5, 1.2, 1.0]. Wrap to center.
  { slug: 'torii-beam', label: 'Torii Light Beam', category: 'Structures', cameraPos: [2, 1.5, 2], targetY: 0.5, render: () => (
    <group position={[-2.5, -1.2, -1.0]}><ToriiBeam /></group>
  ) },
  // Cottage: HARDCODED at [-1.6, 0.65, -0.4], height ~1.9. Wrap to center.
  { slug: 'cottage', label: 'Cottage', category: 'Structures', cameraPos: [2.5, 1.5, 2.5], targetY: 0.8, render: () => (
    <group position={[1.6, -0.65, 0.4]}><Cottage /></group>
  ) },
  { slug: 'bridge', label: 'Arched Bridge', category: 'Structures', cameraPos: [1.5, 0.8, 1.5], targetY: 0.2, render: () => <Bridge position={[0, 0, 0]} rotationY={0} scale={1.0} /> },
  // SteppingStones: x -1.0 to 1.4, z 0.4-1.1, y=0.51. Center ~(0.2, 0.51, 0.75).
  // Wrap to center around origin.
  { slug: 'stepping-stones', label: 'Stepping Stones', category: 'Structures', cameraPos: [1.8, 1.2, 1.8], targetY: 0.5, render: () => (
    <group position={[-0.2, -0.51, -0.75]}><SteppingStones /></group>
  ) },
  { slug: 'stone-lantern', label: 'Stone Lantern (Toro)', category: 'Structures', cameraPos: [1.5, 0.8, 1.5], targetY: 0.4, render: () => <StoneLantern position={[0, 0, 0]} scale={1.2} /> },
  // PoleLanterns: 2 lanterns at [-2.2,0.5,-1.4] and [2.3,0.5,1.4]. Spread ~6.5 diagonal — camera needs to be wide.
  { slug: 'pole-lanterns', label: 'Paper Pole Lanterns', category: 'Structures', cameraPos: [4.5, 2.5, 4.5], targetY: 0.9, render: () => <PoleLanterns /> },
  { slug: 'hanging-lanterns', label: 'Hanging Lanterns', category: 'Structures', cameraPos: [3.5, 2.5, 3.5], targetY: 1.5, render: () => <HangingLanterns /> },
  { slug: 'wind-chime', label: 'Wind Chime', category: 'Structures', cameraPos: [0.6, 0.5, 0.6], targetY: 0.1, render: () => <WindChime position={[0, 0, 0]} /> },
  { slug: 'campfire', label: 'Campfire', category: 'Structures', cameraPos: [1.0, 0.6, 1.0], targetY: 0.15, render: () => <Campfire position={[0, 0, 0]} /> },

  // === Trees & Flora ===
  { slug: 'cherry-blossoms', label: 'Cherry Blossom Trees', category: 'Flora', cameraPos: [3.5, 2.2, 3.5], targetY: 1.2, render: () => <CherryBlossoms /> },
  { slug: 'glb-trees', label: 'Forest Trees (Kenney)', category: 'Flora', cameraPos: [4, 2.5, 4], targetY: 1.0, render: () => <GLBTrees /> },
  { slug: 'mushrooms', label: 'Mushrooms', category: 'Flora', cameraPos: [2.5, 1.5, 2.5], targetY: 0.5, render: () => <GLBMushrooms /> },
  { slug: 'flowers', label: 'Wildflowers', category: 'Flora', cameraPos: [2.5, 1.5, 2.5], targetY: 0.5, render: () => <GLBFlowers /> },
  { slug: 'stumps', label: 'Stumps & Logs', category: 'Flora', cameraPos: [2.5, 1.5, 2.5], targetY: 0.5, render: () => <GLBStumps /> },
  { slug: 'crops', label: 'Garden Crops', category: 'Flora', cameraPos: [3, 1.8, 3], targetY: 0.6, showGround: true, render: () => <GLBCrops /> },

  // === Landscape additions ===
  { slug: 'rocks', label: 'Rock Formation', category: 'Landscape', cameraPos: [3.5, 2.0, 3.5], targetY: 0.6, showGround: true, render: () => <GLBRocks /> },
  { slug: 'cliffs', label: 'Cliff Blocks', category: 'Landscape', cameraPos: [4, 2.5, 4], targetY: 0.5, showGround: false, render: () => <GLBCliffs /> },
  { slug: 'paths', label: 'Stone & Wood Paths', category: 'Landscape', cameraPos: [3, 1.5, 3], targetY: 0.5, showGround: true, render: () => <GLBPaths /> },

  // === Structures additions ===
  { slug: 'fences', label: 'Fences & Gates', category: 'Structures', cameraPos: [3, 1.8, 3], targetY: 0.6, showGround: true, render: () => <GLBFences /> },
  { slug: 'deco-props', label: 'Statues & Tents', category: 'Structures', cameraPos: [3.5, 2.0, 3.5], targetY: 0.6, showGround: true, render: () => <GLBDecoProps /> },

  // === Water ===
  // Lake: HARDCODED at [-1.5, 0.5, 1.6], disc radius 1.1. Wrap to center.
  { slug: 'lake', label: 'Koi Lake', category: 'Water', cameraPos: [2, 1.8, 2], targetY: 0.1, render: () => (
    <group position={[1.5, -0.5, -1.6]}><Lake /></group>
  ) },
  // Waterfall: HARDCODED at [3.05, -1.05, -0.4], plane height 3.4. Wrap to center.
  { slug: 'waterfall', label: 'Waterfall', category: 'Water', cameraPos: [3, 2, 3], targetY: 0.3, render: () => (
    <group position={[-3.05, 1.05, 0.4]}><Waterfall /></group>
  ) },

  { slug: 'anime-water', label: 'Anime Water (toon)', category: 'Water', cameraPos: [0, 3.5, 3.8], targetY: 0, showGround: false, render: () => (
    <>
      <SkyDome radius={10} />
      <AnimeWater radius={2.2} />
    </>
  ) },
  { slug: 'calm-pond', label: 'Calm Pond (painterly)', category: 'Water', cameraPos: [0, 3.5, 3.8], targetY: 0, showGround: false, render: () => (
    <>
      <SkyDome radius={10} />
      <CalmPond radius={2.2} />
    </>
  ) },

  // === Sky ===
  { slug: 'dusk-sky', label: 'Atmosphere — Dusk Sky', category: 'Sky', cameraPos: [-3, 0.5, -2], targetY: 2.5, showGround: false, render: () => <SkyDome radius={10} /> },
  { slug: 'clouds-near', label: 'Cloud Decks', category: 'Sky', cameraPos: [12, 3, 12], targetY: 0, showGround: false, render: () => (
    <group position={[-1, -5, 1]}><Clouds /></group>
  ) },
  // NOTE: DistantClouds is designed to be seen from inside the island scene, not in isolation.
  { slug: 'distant-clouds', label: 'Distant Painterly Clouds', category: 'Sky', cameraPos: [0, -5, 35], targetY: -12, showGround: false, render: () => <DistantClouds /> },
  // Moon: HARDCODED at [-22, 12, 25]. Wrap to center.
  { slug: 'moon', label: 'Moon', category: 'Sky', cameraPos: [0, 0, 5], targetY: 0, showGround: false, render: () => (
    <group position={[22, -12, -25]}><Moon /></group>
  ) },
  { slug: 'volumetric-cloud', label: 'Volumetric Cloud (soft)', category: 'Sky', cameraPos: [0, -0.4, 6], targetY: 0.3, showGround: false, render: () => (
    <>
      <SkyDome radius={10} />
      <VolumetricCloud position={[0, 0, 0]} />
    </>
  ) },
  { slug: 'puff-cloud', label: 'Puff Cloud (painterly)', category: 'Sky', cameraPos: [0, 0.5, 9], targetY: 0.5, showGround: false, render: () => (
    <>
      <SkyDome radius={10} />
      <PuffCloud position={[0, 0, 0]} />
    </>
  ) },
  { slug: 'airship-chunky', label: "Howl's Airship (chunky)", category: 'Sky', cameraPos: [3, 1, 3], targetY: 0, showGround: false, render: () => <Airship variant="chunky" radius={0} altitude={0} speed={0} scale={0.005} /> },
  { slug: 'airship-prop', label: 'Propeller Airship', category: 'Sky', cameraPos: [2, 0.5, 2], targetY: 0, showGround: false, render: () => <Airship variant="prop" radius={0} altitude={0} speed={0} scale={0.003} /> },

  // === Spirits & Creatures ===
  // Kodama: spirits orbiting at radius 3.8-5.2 — camera must be outside the orbit.
  { slug: 'kodama', label: 'Kodama (azure flame spirits)', category: 'Spirits', cameraPos: [8, 3, 8], targetY: 1.5, showGround: false, render: () => <Kodama /> },
  { slug: 'susuwatari', label: 'Susuwatari (soot sprites)', category: 'Spirits', cameraPos: [3.5, 1.5, 3.5], targetY: 0.5, render: () => <Susuwatari /> },
  { slug: 'forest-spirit', label: 'Forest Spirit (Totoro)', category: 'Spirits', cameraPos: [1.5, 1.0, 1.5], targetY: 0.4, render: () => <ForestSpirit position={[0, 0, 0]} rotationY={0} /> },
  { slug: 'spirit-visitor', label: 'Spirit Visitor (Chihiro)', category: 'Spirits', cameraPos: [1.2, 0.8, 1.2], targetY: 0.25, render: () => <SpiritVisitor position={[0, 0, 0]} rotationY={0} /> },
  // HakuDragon: orbits at radius 7.5, y=3.8 — camera must be further out than the orbit.
  { slug: 'haku-dragon', label: 'Haku Dragon', category: 'Spirits', cameraPos: [12, 5, 12], targetY: 3.5, showGround: false, render: () => <HakuDragon /> },
  { slug: 'perched-crane', label: 'Perched Crane', category: 'Spirits', cameraPos: [0.5, 0.3, 0.5], targetY: 0.07, render: () => <PerchedCrane position={[0, 0, 0]} rotationY={0} /> },
  // NOTE: birds orbit at radius ~22; tile shows the sky center, bird may or may not be in frame.
  { slug: 'birds', label: 'Birds (V-formation)', category: 'Spirits', cameraPos: [0, 6, 28], targetY: 6, showGround: false, render: () => <Birds /> },

  // === Particles & Effects ===
  { slug: 'sakura-petals', label: 'Sakura Petals', category: 'Effects', cameraPos: [5, 3, 5], targetY: 1.5, showGround: false, render: () => <SakuraPetals /> },
  { slug: 'fireflies', label: 'Fireflies', category: 'Effects', cameraPos: [5, 2.5, 5], targetY: 2, showGround: false, render: () => <Fireflies /> },
  { slug: 'underside-mist', label: 'Underside Mist', category: 'Effects', cameraPos: [0, 3, 5], targetY: -2, showGround: false, render: () => <UndersideMist /> },

  // === Harvest batch 1 (2026-06-06) ===
  { slug: 'firefly-swarm', label: 'Firefly Swarm', category: 'Spirits', cameraPos: [3, 2, 5], targetY: 1.0, showGround: false, render: () => (
    <>
      <SkyDome radius={12} />
      <FireflySwarm />
    </>
  ) },
  { slug: 'spirit-wisps', label: 'Spirit Wisps (rising motes)', category: 'Spirits', cameraPos: [3, 2.5, 5], targetY: 2.0, showGround: false, render: () => (
    <>
      <SkyDome radius={12} />
      <SpiritWisps />
    </>
  ) },
  { slug: 'moss-rock', label: 'Mossy Rock', category: 'Flora', cameraPos: [2, 1.4, 2], targetY: 0.2, showGround: true, render: () => <MossRock /> },
  { slug: 'lush-tree', label: 'Lush Tree', category: 'Flora', cameraPos: [0, 1.8, 4.2], targetY: 1.4, showGround: true, render: () => <LushTree /> },

  // === Harvest batch 2 (2026-06-06) ===
  { slug: 'light-shafts', label: 'Light Shafts', category: 'Effects', cameraPos: [0, 6, 10], targetY: 3, showGround: false, render: () => (
    <>
      <SkyDome radius={20} />
      <LightShafts />
    </>
  ) },
  { slug: 'drifting-spores', label: 'Drifting Spores', category: 'Effects', cameraPos: [0, 1.5, 6], targetY: 0.5, showGround: false, render: () => (
    <>
      <SkyDome radius={12} />
      <DriftingSpores />
    </>
  ) },
  { slug: 'glow-mushrooms', label: 'Glow Mushrooms (bioluminescent)', category: 'Flora', cameraPos: [2.2, 1.4, 2.2], targetY: 0.6, showGround: true, render: () => <GlowMushrooms /> },
  { slug: 'koi-school', label: 'Koi School', category: 'Spirits', cameraPos: [0, 4.5, 3], targetY: -0.15, showGround: false, render: () => <KoiSchool /> },
];

export const CATEGORIES = [...new Set(PARTS.map((p) => p.category))];
