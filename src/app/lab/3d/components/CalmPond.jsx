'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN_DIR } from './SkyDome';

// PlaneGeometry lies in local XY plane. Mesh rotation is -PI/2 around X so
// local X -> world X, local Y -> world -Z, local Z -> world Y.
// Displacement must go into pos.z (world-up after rotation).
// UV is (0-1, 0-1); remap to dist from center for circular alpha.

const VERT = /* glsl */ `
uniform float uTime;
uniform float uWaveAmplitude;
uniform float uWaveSpeed;
varying vec2  vUv;
varying vec3  vWorldPos;
varying vec3  vViewDir;
varying float vFresnel;

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
    mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vUv = uv;
  vec3 pos = position;

  float t = uTime * uWaveSpeed;
  float s1 = sin(pos.x * 2.8 + t * 0.9) * cos(pos.y * 2.2 + t * 0.7);
  float s2 = sin(pos.x * 5.1 - t * 1.2) * cos(pos.y * 4.8 + t * 1.1);
  float s3 = vnoise2(pos.xy * 3.5 + vec2(t * 0.4, -t * 0.35)) * 2.0 - 1.0;

  float amp = uWaveAmplitude;
  // Displace along local Z -> becomes world Y after -PI/2 X rotation
  pos.z += s1 * amp * 0.5 + s2 * amp * 0.3 + s3 * amp * 0.2;

  vec4 worldPos4 = modelMatrix * vec4(pos, 1.0);
  vWorldPos = worldPos4.xyz;

  vec3 mvPos = (modelViewMatrix * vec4(pos, 1.0)).xyz;
  // Flat surface normal is (0,0,1) locally, becomes (0,1,0) in world after rotation.
  // In view space the normal approximation holds for a near-flat surface.
  vec3 viewNorm = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
  float cosTheta = abs(dot(normalize(-mvPos), viewNorm));
  vFresnel = pow(1.0 - clamp(cosTheta, 0.0, 1.0), 3.5);

  vViewDir = normalize(cameraPosition - vWorldPos);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uWaveSpeed;
uniform vec3  uSunDirection;
uniform vec3  uDeepColor;
uniform vec3  uShallowColor;
uniform vec3  uSkyTint;
uniform vec3  uSunTint;

varying vec2  vUv;
varying vec3  vWorldPos;
varying vec3  vViewDir;
varying float vFresnel;

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise2(vec2 p) {
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
  for (int i = 0; i < 4; i++) {
    v += a * vnoise2(p);
    p = p * 2.1 + vec2(1.3, 0.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 center = vec2(0.5);
  float dist = length(vUv - center) * 2.0;

  float gradient = smoothstep(0.0, 1.0, dist);
  vec3 baseColor = mix(uDeepColor, uShallowColor, gradient);

  vec2 shimmerUv1 = vUv * 6.0 + vec2(uTime * uWaveSpeed * 0.35, uTime * uWaveSpeed * 0.22);
  vec2 shimmerUv2 = vUv * 11.0 - vec2(uTime * uWaveSpeed * 0.28, -uTime * uWaveSpeed * 0.31);
  float shimmer1 = fbm2(shimmerUv1);
  float shimmer2 = fbm2(shimmerUv2);
  float shimmerMix = shimmer1 * 0.6 + shimmer2 * 0.4;
  float shimmerBright = smoothstep(0.55, 0.78, shimmerMix);
  baseColor = mix(baseColor, uShallowColor * 1.25, shimmerBright * 0.28);

  vec3 skyRefl = mix(baseColor, uSkyTint, vFresnel * 0.55);

  vec3 sunDir = normalize(uSunDirection);
  vec3 upNorm = vec3(0.0, 1.0, 0.0);
  float sunElevDot = max(0.0, dot(upNorm, sunDir));
  vec3 halfVec = normalize(sunDir + vViewDir);
  float specDot = max(0.0, dot(upNorm, halfVec));
  float spec = pow(clamp(specDot, 0.0, 1.0), 32.0) * sunElevDot;

  float sparkleNoise = vnoise2(vUv * 28.0 + vec2(uTime * 1.8, -uTime * 1.4));
  float sparkle = smoothstep(0.72, 0.95, sparkleNoise) * spec * 2.5;
  sparkle = clamp(sparkle, 0.0, 0.8);

  vec3 color = skyRefl;
  color += uSunTint * spec * 0.45;
  color += vec3(1.0, 0.96, 0.82) * sparkle;

  float alpha = smoothstep(1.04, 0.7, dist) * 0.9;
  gl_FragColor = vec4(color, alpha);
}
`;

export function CalmPond({
  radius = 2.2,
  uDeepColor = new THREE.Color('#1B3E5C'),
  uShallowColor = new THREE.Color('#5ABCCC'),
  uSkyTint = new THREE.Color('#C8D8E8'),
  uSunTint = new THREE.Color('#F5C880'),
  uWaveAmplitude = 0.018,
  uWaveSpeed = 0.4,
}) {
  const matRef = useRef();

  const uniforms = useMemo(() => ({
    uTime:          { value: 0 },
    uWaveAmplitude: { value: uWaveAmplitude },
    uWaveSpeed:     { value: uWaveSpeed },
    uSunDirection:  { value: SUN_DIR.clone() },
    uDeepColor:     { value: uDeepColor.clone() },
    uShallowColor:  { value: uShallowColor.clone() },
    uSkyTint:       { value: uSkyTint.clone() },
    uSunTint:       { value: uSunTint.clone() },
  }), []);

  const geo = useMemo(() => new THREE.PlaneGeometry(radius * 2, radius * 2, 48, 48), [radius]);

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
