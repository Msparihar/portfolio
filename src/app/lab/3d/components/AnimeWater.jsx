'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN_DIR } from './SkyDome';

const VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vViewDir;

void main() {
  vUv = uv;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vViewDir = normalize(cameraPosition - vWorldPos);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uRippleSpeed;
uniform vec3  uSunDirection;
uniform vec3  uDeepColor;
uniform vec3  uMidColor;
uniform vec3  uHighlightColor;
uniform vec3  uFoamColor;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vViewDir;

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
    mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm2(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.1 + vec2(1.3, 0.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 center = vec2(0.5);
  float dist = length(vUv - center) * 2.0;

  vec2 t = vec2(uTime * uRippleSpeed * 0.4, uTime * uRippleSpeed * 0.3);
  float n1 = fbm2(vUv * 3.5 + t);
  float n2 = fbm2(vUv * 7.0 - t * 1.3 + vec2(5.7, 2.1));
  float n3 = vnoise(vUv * 14.0 + vec2(uTime * uRippleSpeed * 0.9, -uTime * uRippleSpeed * 0.7));
  float noiseMix = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

  float band = floor(noiseMix * 3.0) / 2.0;
  band = clamp(band, 0.0, 1.0);

  vec3 waterColor = uDeepColor;
  waterColor = mix(waterColor, uMidColor, step(0.33, band));
  waterColor = mix(waterColor, uHighlightColor, step(0.66, band));

  float rippleRadius1 = mod(uTime * uRippleSpeed * 0.55, 1.2);
  float rippleRadius2 = mod(uTime * uRippleSpeed * 0.55 + 0.6, 1.2);
  float rippleRadius3 = mod(uTime * uRippleSpeed * 0.55 + 1.0, 1.2);

  float noisyDist = dist + vnoise(vUv * 8.0 + uTime * 0.3) * 0.06 - 0.03;
  noisyDist = max(0.0, noisyDist);

  float fade1 = 1.0 - clamp(rippleRadius1 / 1.2, 0.0, 1.0);
  float fade2 = 1.0 - clamp(rippleRadius2 / 1.2, 0.0, 1.0);
  float fade3 = 1.0 - clamp(rippleRadius3 / 1.2, 0.0, 1.0);

  float ring1 = smoothstep(0.03, 0.0, abs(noisyDist - rippleRadius1)) * fade1;
  float ring2 = smoothstep(0.025, 0.0, abs(noisyDist - rippleRadius2)) * fade2;
  float ring3 = smoothstep(0.02, 0.0, abs(noisyDist - rippleRadius3)) * fade3;
  float rings = clamp(ring1 + ring2 + ring3, 0.0, 1.0);

  waterColor = mix(waterColor, uHighlightColor, rings * 0.85);

  float foamNoise = vnoise(vUv * 12.0 + uTime * 0.2);
  float foamRing = smoothstep(0.78, 1.0, dist) * smoothstep(1.05, 0.85, dist);
  foamRing *= 0.5 + foamNoise * 0.7;
  foamRing = clamp(foamRing, 0.0, 1.0);
  waterColor = mix(waterColor, uFoamColor, foamRing * 0.9);

  vec3 upNorm = vec3(0.0, 1.0, 0.0);
  vec3 sunDir = normalize(uSunDirection);
  float sunDot = max(0.0, dot(upNorm, sunDir));
  vec3 halfVec = normalize(sunDir + vViewDir);
  float specDot = max(0.0, dot(upNorm, halfVec));
  float spec = pow(clamp(specDot, 0.0, 1.0), 48.0) * sunDot;
  float glintNoise = vnoise(vUv * 20.0 + uTime * 1.5);
  float glint = spec * glintNoise * 1.8;
  waterColor += vec3(1.0, 0.92, 0.75) * clamp(glint, 0.0, 0.55);

  float alpha = smoothstep(1.02, 0.75, dist);
  gl_FragColor = vec4(waterColor, alpha);
}
`;

export function AnimeWater({
  radius = 2.2,
  uDeepColor = new THREE.Color('#1A5C7A'),
  uMidColor = new THREE.Color('#3AADA8'),
  uHighlightColor = new THREE.Color('#A8EEE8'),
  uFoamColor = new THREE.Color('#E8F8F8'),
  uRippleSpeed = 1.0,
}) {
  const matRef = useRef();

  const uniforms = useMemo(() => ({
    uTime:           { value: 0 },
    uRippleSpeed:    { value: uRippleSpeed },
    uSunDirection:   { value: SUN_DIR.clone() },
    uDeepColor:      { value: uDeepColor.clone() },
    uMidColor:       { value: uMidColor.clone() },
    uHighlightColor: { value: uHighlightColor.clone() },
    uFoamColor:      { value: uFoamColor.clone() },
  }), []);

  const geo = useMemo(() => new THREE.CircleGeometry(radius, 64), [radius]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
