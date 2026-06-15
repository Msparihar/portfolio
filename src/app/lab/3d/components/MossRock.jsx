'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { SUN_DIR } from './SkyDome';

const VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPos;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 57.0 + i.z * 113.0;
    return mix(
      mix(mix(hash(n),       hash(n + 1.0),   f.x),
          mix(hash(n + 57.0),hash(n + 58.0),  f.x), f.y),
      mix(mix(hash(n + 113.0),hash(n + 114.0),f.x),
          mix(hash(n + 170.0),hash(n + 171.0),f.x), f.y),
      f.z
    );
  }

  void main() {
    vec3 pos = position;

    float disp = valueNoise(pos * 2.3) * 0.18
               + valueNoise(pos * 5.1) * 0.07
               + valueNoise(pos * 11.0) * 0.03;
    pos += normal * disp;

    vPos    = pos;
    vNormal = normalMatrix * normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAG = /* glsl */`
  uniform vec3 uMossColor;
  uniform vec3 uStoneColor;
  uniform vec3 uSunDir;

  varying vec3 vNormal;
  varying vec3 vPos;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 57.0 + i.z * 113.0;
    return mix(
      mix(mix(hash(n),       hash(n + 1.0),   f.x),
          mix(hash(n + 57.0),hash(n + 58.0),  f.x), f.y),
      mix(mix(hash(n + 113.0),hash(n + 114.0),f.x),
          mix(hash(n + 170.0),hash(n + 171.0),f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * valueNoise(p);
      p  = p * 2.1 + vec3(3.7, 1.9, 5.3);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 n = normalize(vNormal);

    float upFacing = clamp(n.y, 0.0, 1.0);

    float boundary = fbm(vPos * 3.5);
    float mossWeight = smoothstep(0.25 + boundary * 0.35, 0.65 + boundary * 0.25, upFacing);

    float speckle = step(0.72, fbm(vPos * 14.0));
    vec3 darkMoss = uMossColor * 0.6;
    vec3 mossCol = mix(uMossColor, darkMoss, speckle * 0.55);

    vec3 col = mix(uStoneColor, mossCol, mossWeight);

    float ndl = dot(n, normalize(uSunDir));
    float diffuse = clamp(ndl, 0.0, 1.0) * 0.55 + 0.45;
    col *= diffuse;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Boulder({ position, scale, rotY, mossColor, stoneColor, sunDir }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uMossColor:  { value: new THREE.Color(mossColor) },
      uStoneColor: { value: new THREE.Color(stoneColor) },
      uSunDir:     { value: sunDir },
    },
  }), [mossColor, stoneColor, sunDir]);

  return (
    <mesh position={position} scale={scale} rotation={[0, rotY, 0]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export function MossRock({
  scale      = 1,
  mossColor  = '#6BAF52',
  stoneColor = '#7A7570',
}) {
  const sunDir = useMemo(() => SUN_DIR.clone(), []);

  return (
    <group scale={[scale, scale, scale]}>
      <Boulder
        position={[0, 0.52, 0]}
        scale={[0.62, 0.52, 0.58]}
        rotY={0}
        mossColor={mossColor}
        stoneColor={stoneColor}
        sunDir={sunDir}
      />
      <Boulder
        position={[0.55, 0.32, 0.3]}
        scale={[0.38, 0.32, 0.36]}
        rotY={1.1}
        mossColor={mossColor}
        stoneColor={stoneColor}
        sunDir={sunDir}
      />
      <Boulder
        position={[-0.4, 0.26, 0.28]}
        scale={[0.30, 0.26, 0.28]}
        rotY={2.4}
        mossColor={mossColor}
        stoneColor={stoneColor}
        sunDir={sunDir}
      />
    </group>
  );
}
