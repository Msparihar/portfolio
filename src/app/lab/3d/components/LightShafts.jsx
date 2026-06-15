'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN_DIR } from './SkyDome';

// ---------------------------------------------------------------------------
// Beam shader — vertical alpha gradient + horizontal feathered edges
// Additive blending: peak alpha kept very low so stacked beams never saturate
// ---------------------------------------------------------------------------
const BEAM_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSwayAmp;
  uniform float uSwayPhase;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    // Tiny lateral sway around the beam's long axis
    float sway = sin(uTime * 0.18 + uSwayPhase) * uSwayAmp;
    vec3 pos = position;
    pos.x += sway * (1.0 - uv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const BEAM_FRAG = /* glsl */ `
  uniform float uPeakAlpha;
  uniform vec3  uColor;
  uniform float uTime;
  uniform float uFlickerPhase;

  varying vec2 vUv;

  void main() {
    // Vertical: full brightness at top (uv.y=1), fades to nothing at bottom (uv.y=0)
    float vertFade = pow(vUv.y, 0.65);

    // Horizontal: bell-curve falloff — feathered edges, no hard cutoff
    float cx = vUv.x - 0.5;
    float horzFade = exp(-cx * cx * 14.0);

    // Very gentle slow flicker (< 3% variation) for life without distraction
    float flicker = 1.0 - 0.025 * sin(uTime * 0.55 + uFlickerPhase);

    float alpha = uPeakAlpha * vertFade * horzFade * flicker;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Dust mote shader — tiny soft glowing points within beam volume
// ---------------------------------------------------------------------------
const MOTE_VERT = /* glsl */ `
  uniform float uTime;

  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSwayX;
  attribute float aSwayZ;
  attribute float aSize;
  attribute float aBaseY;
  attribute float aDriftRange;

  varying float vAlpha;

  void main() {
    float range = aDriftRange;
    // Cycle y slowly up the beam, reset to bottom
    float t = mod(uTime * aSpeed + aPhase, 1.0);
    float y = aBaseY + t * range;

    float x = position.x + sin(uTime * 0.22 + aPhase * 6.28) * aSwayX;
    float z = position.z + cos(uTime * 0.17 + aPhase * 6.28) * aSwayZ;

    float fadeIn  = smoothstep(0.0, 0.15, t);
    float fadeOut = 1.0 - smoothstep(0.80, 1.0, t);
    vAlpha = fadeIn * fadeOut;

    vec4 mvPos = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = aSize * (180.0 / max(-mvPos.z, 0.001));
  }
`;

const MOTE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPeakAlpha;

  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    glow = glow * glow;

    float alpha = uPeakAlpha * glow * vAlpha;
    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
  }
`;

// ---------------------------------------------------------------------------
// Seeded RNG — same pattern used across sibling components
// ---------------------------------------------------------------------------
function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Build a quaternion that rotates +Y toward the given direction
function quatToward(dir) {
  const normalized = dir.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  // Guard: if dir is nearly parallel to up, use a slight nudge to avoid NaN quaternion
  if (Math.abs(normalized.dot(up)) > 0.999) normalized.x += 0.001;
  normalized.normalize();
  const q = new THREE.Quaternion();
  q.setFromUnitVectors(up, normalized);
  return q;
}

// ---------------------------------------------------------------------------
// LightShafts
// ---------------------------------------------------------------------------
export function LightShafts({
  count     = 6,
  color     = '#FFF0C0',
  intensity = 1.0,
  length    = 12,
}) {
  const beamRefs = useRef([]);
  const moteRef  = useRef();
  const { camera } = useThree();

  // Peak beam alpha: intentionally very low to avoid blowout under additive blending.
  // intensity prop scales linearly; default of 1.0 gives ~0.15 peak — soft and subtle.
  const peakBeamAlpha = Math.min(0.15 * intensity, 0.28);
  const peakMoteAlpha = Math.min(0.30 * intensity, 0.55);

  const beamColor = useMemo(() => new THREE.Color(color), [color]);

  // Beam geometry: tall plane, UVs go 0→1 from bottom to top
  const beamGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 1, 16);
    // Shift UVs so y=0 is bottom, y=1 is top (default PlaneGeometry has y flipped)
    const uvAttr = g.attributes.uv;
    for (let i = 0; i < uvAttr.count; i++) {
      uvAttr.setY(i, 1.0 - uvAttr.getY(i));
    }
    uvAttr.needsUpdate = true;
    return g;
  }, []);

  // Per-beam data — deterministic
  const beams = useMemo(() => {
    const r = seedRand(3141);
    const sunDir = SUN_DIR.clone().normalize();
    // Perpendicular to sun direction in XZ plane for fan spread
    const perp = new THREE.Vector3(-sunDir.z, 0, sunDir.x).normalize();

    const list = [];
    for (let i = 0; i < count; i++) {
      // Fan offset: spread beams slightly sideways around sun direction
      const fanT    = count > 1 ? (i / (count - 1) - 0.5) : 0;
      const fanAng  = fanT * 0.55 + (r() - 0.5) * 0.15;
      const dir = sunDir.clone()
        .addScaledVector(perp, Math.sin(fanAng))
        .normalize();

      // Tilt the beam slightly away from pure sun direction for variety
      const tiltX = (r() - 0.5) * 0.12;
      const tiltZ = (r() - 0.5) * 0.12;
      dir.x += tiltX;
      dir.z += tiltZ;
      dir.normalize();

      // Lateral spread position along perp axis
      const spread = fanT * 3.0 + (r() - 0.5) * 0.8;

      // Beam origin: start high up, offset laterally
      const ox = sunDir.x * -2 + perp.x * spread;
      const oy = 7 + r() * 2;
      const oz = sunDir.z * -2 + perp.z * spread;

      // Width varies per beam: narower center beam, wider on sides
      const width = 0.35 + r() * 0.45 + Math.abs(fanT) * 0.3;

      list.push({
        origin:      [ox, oy, oz],
        dir,
        width,
        beamLength:  length * (0.85 + r() * 0.3),
        swayAmp:     0.012 + r() * 0.018,
        swayPhase:   r() * Math.PI * 2,
        flickerPhase: r() * Math.PI * 2,
      });
    }
    return list;
  }, [count, length]);

  const beamMats = useMemo(() => {
    return beams.map((b) => new THREE.ShaderMaterial({
      vertexShader:   BEAM_VERT,
      fragmentShader: BEAM_FRAG,
      uniforms: {
        uTime:         { value: 0 },
        uColor:        { value: beamColor.clone() },
        uPeakAlpha:    { value: peakBeamAlpha },
        uSwayAmp:      { value: b.swayAmp },
        uSwayPhase:    { value: b.swayPhase },
        uFlickerPhase: { value: b.flickerPhase },
      },
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      transparent: true,
      side:        THREE.DoubleSide,
    }));
  }, [beams, beamColor, peakBeamAlpha]);

  // Dust motes geometry — points living inside beam volume
  const { moteGeo, moteMat } = useMemo(() => {
    const moteCount = Math.max(20, count * 12);
    const r = seedRand(2718);

    const positions    = new Float32Array(moteCount * 3);
    const phase        = new Float32Array(moteCount);
    const speed        = new Float32Array(moteCount);
    const swayX        = new Float32Array(moteCount);
    const swayZ        = new Float32Array(moteCount);
    const size         = new Float32Array(moteCount);
    const baseY        = new Float32Array(moteCount);
    const driftRange   = new Float32Array(moteCount);

    const sunDir = SUN_DIR.clone().normalize();
    const perp   = new THREE.Vector3(-sunDir.z, 0, sunDir.x).normalize();

    for (let i = 0; i < moteCount; i++) {
      // Scatter motes roughly within the beam fan volume
      const fanT   = (r() - 0.5);
      const along  = r();
      const spread = fanT * 3.0;

      positions[i * 3 + 0] = sunDir.x * -2 + perp.x * spread + (r() - 0.5) * 1.2;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = sunDir.z * -2 + perp.z * spread + (r() - 0.5) * 1.2;

      phase[i]      = r();
      speed[i]      = 0.02 + r() * 0.04;
      swayX[i]      = 0.06 + r() * 0.10;
      swayZ[i]      = 0.06 + r() * 0.10;
      size[i]       = 1.8 + r() * 2.2;
      baseY[i]      = 1.5 + along * 5.0;
      driftRange[i] = 3.0 + r() * 3.0;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position',   new THREE.BufferAttribute(positions,  3));
    g.setAttribute('aPhase',     new THREE.BufferAttribute(phase,      1));
    g.setAttribute('aSpeed',     new THREE.BufferAttribute(speed,      1));
    g.setAttribute('aSwayX',     new THREE.BufferAttribute(swayX,      1));
    g.setAttribute('aSwayZ',     new THREE.BufferAttribute(swayZ,      1));
    g.setAttribute('aSize',      new THREE.BufferAttribute(size,       1));
    g.setAttribute('aBaseY',     new THREE.BufferAttribute(baseY,      1));
    g.setAttribute('aDriftRange',new THREE.BufferAttribute(driftRange, 1));

    const m = new THREE.ShaderMaterial({
      vertexShader:   MOTE_VERT,
      fragmentShader: MOTE_FRAG,
      uniforms: {
        uTime:      { value: 0 },
        uColor:     { value: beamColor.clone() },
        uPeakAlpha: { value: peakMoteAlpha },
      },
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      transparent: true,
    });

    return { moteGeo: g, moteMat: m };
  }, [count, beamColor, peakMoteAlpha]);

  // Build beam meshes once — position + orient each beam plane
  const beamMeshData = useMemo(() => {
    return beams.map((b, i) => {
      const [ox, oy, oz] = b.origin;
      // Quaternion: rotate plane so its +Y axis aligns with beam direction
      const q = quatToward(b.dir);
      // Center the plane at mid-length
      const mid = b.dir.clone().multiplyScalar(b.beamLength * 0.5);
      return {
        position: [ox + mid.x, oy + mid.y, oz + mid.z],
        quaternion: q,
        scale: [b.width, b.beamLength, 1],
        mat: beamMats[i],
      };
    });
  }, [beams, beamMats]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    beamMeshData.forEach((_bd, i) => {
      const mesh = beamRefs.current[i];
      if (!mesh) return;
      mesh.material.uniforms.uTime.value = t;
      // Billboard in XZ so beams always face the viewer regardless of orbit angle
      mesh.lookAt(camera.position.x, mesh.position.y, camera.position.z);
    });

    if (moteRef.current) {
      moteMat.uniforms.uTime.value = t;
    }
  });

  return (
    <group>
      {beamMeshData.map((bd, i) => (
        <mesh
          key={i}
          ref={(el) => { beamRefs.current[i] = el; }}
          position={bd.position}
          quaternion={bd.quaternion}
          scale={bd.scale}
          geometry={beamGeo}
          material={bd.mat}
        />
      ))}
      <points ref={moteRef} geometry={moteGeo} material={moteMat} />
    </group>
  );
}
