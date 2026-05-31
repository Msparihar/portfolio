'use client';

import { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, BrightnessContrast } from '@react-three/postprocessing';
import * as THREE from 'three';

import { Island } from './components/Island';
import { GrassField } from './components/GrassField';
import { Clouds } from './components/Clouds';
import { Kodama } from "./components/Kodama";
import { Torii } from './components/Torii';
import { Cottage } from "./components/Cottage";
import { GLBTrees } from './components/GLBTrees';
import { GLBMushrooms, GLBFlowers, GLBStumps } from './components/GLBScatter';
import { Waterfall } from "./components/Waterfall";
import { Campfire } from './components/Campfire';
import { Lake } from "./components/Lake";
import { CherryBlossoms } from './components/CherryBlossoms';
import { HangingLanterns } from './components/HangingLanterns';
import { DistantClouds } from "./components/DistantClouds";
import { SakuraPetals } from './components/SakuraPetals';
import { HakuDragon } from "./components/HakuDragon";
import { ForestSpirit } from "./components/ForestSpirit";
import { StoneLantern } from './components/StoneLantern';
import { TallGrass } from './components/TallGrass';
import { Fireflies } from './components/Fireflies';
import { Bridge } from './components/Bridge';
import { SteppingStones } from './components/SteppingStones';
import { Moon } from './components/Moon';
import { Birds } from './components/Birds';
import { UndersideMist } from './components/UndersideMist';
import { CameraKeys } from './components/CameraKeys';
import { CameraIntro } from './components/CameraIntro';
import { WindProvider } from './components/WindContext';
import { SpiritVisitor } from './components/SpiritVisitor';
import { PoleLanterns } from './components/PoleLanterns';
import { ToriiBeam } from './components/ToriiBeam';
import { Susuwatari } from './components/Susuwatari';
import { WindChime } from './components/WindChime';
import { Cattails } from './components/Cattails';
import { PerchedCrane } from './components/PerchedCrane';
import { DistantMountains } from './components/DistantMountains';
import { Airship } from './components/Airship';

function SkyDome() {
  const geometry = useMemo(() => {
    const geom = new THREE.SphereGeometry(80, 64, 32);
    const cZenith = new THREE.Color('#3C5378');   // deep dusky night-blue at top
    const cMid = new THREE.Color('#D89A7C');      // cool sunset peach band
    const cHorizon = new THREE.Color('#EDC4A8');  // dusty rose horizon
    const cBelow = new THREE.Color('#6B5878');    // deep mauve below horizon
    const positions = geom.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i) / 80;
      let c;
      if (y > 0.45) {
        c = cMid.clone().lerp(cZenith, (y - 0.45) / 0.55);
      } else if (y > 0) {
        c = cHorizon.clone().lerp(cMid, y / 0.45);
      } else {
        c = cHorizon.clone().lerp(cBelow, -y);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

function SunDisc() {
  return (
    <mesh position={[18, 6, -30]}>
      <sphereGeometry args={[2.2, 24, 16]} />
      <meshStandardMaterial
        color="#FFE0A0"
        emissive="#FFD060"
        emissiveIntensity={2}
        fog={false}
      />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      style={{ width: '100%', height: '100%' }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      <PerspectiveCamera makeDefault position={[8, 4.5, 8]} fov={45} />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={30}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
        target={[0, 0.5, 0]}
        autoRotate
        autoRotateSpeed={0.22}
      />

      <CameraIntro />
      <CameraKeys />
      <SkyDome />
      <DistantMountains />
      <SunDisc />
      <Moon />
      <fog attach="fog" args={['#C29A8A', 25, 80]} />

      <ambientLight intensity={0.55} color="#FFE9CF" />
      <hemisphereLight args={['#FFE6D0', '#7BA85A', 0.45]} />
      <directionalLight
        position={[10, 14, 8]}
        intensity={1.4}
        color="#FFD9A8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-5, -4, -5]} intensity={0.22} color="#A8C8FF" />
      <pointLight position={[-1.6, 1.1, 0.2]} intensity={1.5} color="#FFB830" distance={4} decay={2} />
      {/* Underglow — magic floating feel */}
      <pointLight position={[0, -3.5, 0]} intensity={0.7} color="#7EC8FF" distance={9} decay={2} />

      <Suspense fallback={null}>
        <WindProvider>
        <Island />
        <GrassField count={12000} radius={2.75} yBase={0.5} />
        <GLBTrees />
        <CherryBlossoms />
        <HangingLanterns />
        <GLBMushrooms />
        <GLBFlowers />
        <GLBStumps />
        <Waterfall />
        <Campfire position={[0.8, 0.52, 1.8]} />
        <Lake />
        <Cottage />
        <Torii />
        <Clouds />
        <DistantClouds />
        <Kodama />
        <SakuraPetals />
        <HakuDragon />
        <ForestSpirit position={[1.85, 0.55, 1.3]} rotationY={-0.6} />
        <StoneLantern position={[-2.25, 0.55, 0.8]} scale={1.1} />
        <StoneLantern position={[1.4, 0.55, -1.9]} scale={0.85} />
        <TallGrass />
        <Fireflies />
        <Bridge position={[-1.5, 0.5, 1.6]} rotationY={1.0} scale={0.85} />
        <SteppingStones />
        <Birds />
        <UndersideMist />
        <SpiritVisitor position={[-1.05, 0.5, -0.35]} rotationY={0.5} />
        <PoleLanterns />
        <ToriiBeam />
        <Susuwatari />
        <WindChime position={[-1.0, 2.0, 1.2]} />
        <WindChime position={[1.7, 2.0, -0.5]} />
        <Cattails />
        <PerchedCrane position={[2.0, 2.45, 0.55]} rotationY={-0.6} />
        <Airship variant="chunky" scale={0.006} />
        <Airship variant="chunky" radius={20} altitude={10} speed={-0.025} phase={2.1} scale={0.004} />
        <Airship variant="prop" radius={11} altitude={5.5} speed={0.06} phase={4.2} scale={0.0014} />

        </WindProvider>
        {/* EffectComposer disabled — CherryBlossoms' ShaderMaterial was one culprit
            (fixed by switching to MeshLambertMaterial vertexColors). One or more
            other components still incompatible: Cottage / Lake / Waterfall / Kodama
            / HakuDragon / DistantClouds all use custom ShaderMaterials. Audit
            needed: check for `color` attribute collisions with Three's auto-
            injected vertex color attribute, and for NaN-producing shader math
            (normalize of zero vector, etc). */}
      </Suspense>
    </Canvas>
  );
}
