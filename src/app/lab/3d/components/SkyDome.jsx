'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

const SKY_VERT = /* glsl */`
varying vec3 vWorldDir;
void main() {
  vWorldDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAG = /* glsl */`
uniform vec3 uZenithColor;
uniform vec3 uHorizonColor;
uniform vec3 uBelowColor;
uniform vec3 uSunGlowColor;
uniform vec3 uSunDirection;
uniform float uSunDiscRadius;
uniform float uSunGlowStrength;

varying vec3 vWorldDir;

void main() {
  vec3 dir = normalize(vWorldDir);
  float elevation = dir.y;

  float tAbove = smoothstep(0.0, 0.7, elevation);
  vec3 skyColor = mix(uBelowColor, uHorizonColor, smoothstep(-0.25, 0.05, elevation));
  skyColor = mix(skyColor, uZenithColor, tAbove);

  float sunDot = dot(dir, normalize(uSunDirection));
  float aureole = pow(max(0.0, sunDot), 4.0) * uSunGlowStrength;
  float horizonBand = smoothstep(0.18, 0.0, abs(elevation)) * 0.35;
  float azimuthBias = smoothstep(-0.1, 0.6, sunDot) * horizonBand;
  skyColor += uSunGlowColor * (aureole + azimuthBias);

  float disc = smoothstep(uSunDiscRadius - 0.008, uSunDiscRadius + 0.02, sunDot);
  skyColor += uSunGlowColor * disc * 0.45;

  skyColor = pow(max(skyColor, vec3(0.0)), vec3(0.88));

  gl_FragColor = vec4(skyColor, 1.0);
}
`;

// Shared sun direction derived from the main directional light position [10, 14, 8].
// Exported so Scene.jsx can place the SunDisc mesh at SUN_DIR.clone().multiplyScalar(r).
export const SUN_DIR = new THREE.Vector3(10, 14, 8).normalize();

export function SkyDome({ radius = 80 }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
      uniforms: {
        uZenithColor:     { value: new THREE.Color('#3C5378') },
        uHorizonColor:    { value: new THREE.Color('#EDC4A8') },
        uBelowColor:      { value: new THREE.Color('#6B5878') },
        uSunGlowColor:    { value: new THREE.Color('#F5B97A') },
        uSunDirection:    { value: SUN_DIR.clone() },
        uSunGlowStrength: { value: 0.55 },
        uSunDiscRadius:   { value: 0.975 },
      },
    });
  }, []);

  return (
    <mesh material={material}>
      <sphereGeometry args={[radius, 64, 32]} />
    </mesh>
  );
}
