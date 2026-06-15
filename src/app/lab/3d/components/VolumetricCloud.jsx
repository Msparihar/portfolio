'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN_DIR } from './SkyDome';

const VERT = /* glsl */ `
uniform mat4 uInvModel;

varying vec3 vLocalPos;
varying vec3 vRayOriginLocal;

void main() {
  vLocalPos = position;
  vRayOriginLocal = (uInvModel * vec4(cameraPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform vec3  uSunDirection;
uniform float uDensity;
uniform float uTime;
uniform vec3  uSunColor;
uniform vec3  uShadowColor;
uniform vec3  uAmbientColor;

varying vec3 vLocalPos;
varying vec3 vRayOriginLocal;

float hash(vec3 p) {
  p = fract(p * vec3(127.1, 311.7, 74.7));
  p += dot(p, p.yxz + 19.19);
  return fract((p.x + p.y) * p.z);
}

float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i),             hash(i+vec3(1,0,0)), f.x),
        mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
        mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p  = p * 2.1 + vec3(1.7, 0.9, 2.3);
    a *= 0.48;
  }
  return v;
}

float cloudDensity(vec3 p, float t) {
  vec3 q = p / vec3(1.4, 0.95, 1.4);
  float envelope = smoothstep(0.0, 0.55, 1.0 - dot(q, q));

  vec3 np = p * 2.2 + vec3(0.0, t * 0.03, 0.0);
  float raw = fbm(np) * 1.25 - 0.25;
  float d = smoothstep(0.0, 1.0, raw) * envelope * uDensity;

  return d * smoothstep(-0.6, -0.4, p.y);
}

float hg(float cosTheta, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * 3.14159 * pow(max(1.0 + g2 - 2.0 * g * cosTheta, 0.0001), 1.5));
}

bool rayBox(vec3 ro, vec3 rd, vec3 bMin, vec3 bMax, out float tNear, out float tFar) {
  vec3 invRd = 1.0 / rd;
  vec3 t0 = (bMin - ro) * invRd;
  vec3 t1 = (bMax - ro) * invRd;
  tNear = max(max(min(t0.x, t1.x), min(t0.y, t1.y)), min(t0.z, t1.z));
  tFar  = min(min(max(t0.x, t1.x), max(t0.y, t1.y)), max(t0.z, t1.z));
  return tFar > max(tNear, 0.0);
}

void main() {
  vec3 toFrag = vLocalPos - vRayOriginLocal;
  float fragDist = length(toFrag);
  if (fragDist < 0.0001) discard;
  vec3 rd = toFrag / fragDist;

  vec3 bMin = vec3(-1.5, -0.95, -1.5);
  vec3 bMax = vec3( 1.5,  0.95,  1.5);

  float tNear, tFar;
  if (!rayBox(vRayOriginLocal, rd, bMin, bMax, tNear, tFar)) discard;

  float tStart = max(tNear, 0.0);
  float dist   = tFar - tStart;
  if (dist <= 0.0) discard;

  const int PRIMARY_STEPS = 44;
  const int LIGHT_STEPS   = 5;
  float stepSize = dist / float(PRIMARY_STEPS);

  vec3  sunDir   = normalize(uSunDirection);
  float cosTheta = dot(rd, sunDir);
  float phase    = hg(cosTheta, 0.35);

  float sigma = 3.0;

  float transmittance = 1.0;
  vec3  scattered     = vec3(0.0);
  float t = tStart + stepSize * 0.5;

  for (int i = 0; i < PRIMARY_STEPS; i++) {
    vec3  p = vRayOriginLocal + rd * t;
    float d = cloudDensity(p, uTime);

    if (d > 0.001) {
      float stepTrans = exp(-sigma * d * stepSize);

      float lightTrans = 1.0;
      for (int j = 0; j < LIGHT_STEPS; j++) {
        vec3 lp = clamp(p + sunDir * (float(j + 1) * 0.5), bMin, bMax);
        lightTrans *= exp(-sigma * cloudDensity(lp, uTime) * 0.5);
      }

      vec3 inScatter = (uSunColor * lightTrans * phase
                      + uShadowColor * (1.0 - lightTrans)
                      + uAmbientColor) * d;
      scattered += transmittance * inScatter * stepSize;
      transmittance *= stepTrans;
      if (transmittance < 0.005) break;
    }

    t += stepSize;
  }

  float alpha = 1.0 - transmittance;
  if (alpha < 0.01) discard;

  vec3 color = scattered / max(alpha, 0.001);
  color = color / (color + 1.0);
  color = pow(max(color, vec3(0.0)), vec3(0.88));

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`;

const _invModel = new THREE.Matrix4();

export function VolumetricCloud({ position = [0, 0, 0] }) {
  const meshRef = useRef(null);

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uInvModel:     { value: new THREE.Matrix4() },
      uSunDirection: { value: SUN_DIR.clone() },
      uDensity:      { value: 0.55 },
      uTime:         { value: 0 },
      uSunColor:     { value: new THREE.Color('#FDDCB0').multiplyScalar(2.4) },
      uShadowColor:  { value: new THREE.Color('#B8C4E8').multiplyScalar(0.7) },
      uAmbientColor: { value: new THREE.Color('#E8DCF0').multiplyScalar(1.1) },
    },
  }), []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (meshRef.current) {
      _invModel.copy(meshRef.current.matrixWorld).invert();
      material.uniforms.uInvModel.value.copy(_invModel);
    }
  });

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <boxGeometry args={[3.0, 1.9, 3.0]} />
    </mesh>
  );
}
