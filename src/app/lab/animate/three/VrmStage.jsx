'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy, createVRMAnimationClip } from '@pixiv/three-vrm-animation';
import { useAnimateStore } from '../store';

export function VrmStage() {
  const { scene } = useThree();
  const vrmRef = useRef(null);
  const mixerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let vrm = null;

    async function load() {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      const vrmGltf = await loader.loadAsync('/models/vrm/avatar.vrm');
      if (cancelled) return;

      vrm = vrmGltf.userData.vrm;
      VRMUtils.removeUnnecessaryJoints(vrm.scene);
      VRMUtils.removeUnnecessaryVertices(vrm.scene);
      VRMUtils.combineSkeletons(vrm.scene);

      if (vrm.lookAt) {
        const lookAtProxy = new VRMLookAtQuaternionProxy(vrm.lookAt);
        lookAtProxy.name = 'VRMLookAtQuaternionProxy';
        vrm.scene.add(lookAtProxy);
      }

      const animLoader = new GLTFLoader();
      animLoader.register((parser) => new VRMAnimationLoaderPlugin(parser));
      const animGltf = await animLoader.loadAsync('/models/vrma/test.vrma');
      if (cancelled) {
        VRMUtils.deepDispose(vrm.scene);
        return;
      }

      const vrmAnimation = animGltf.userData.vrmAnimations?.[0];
      if (vrmAnimation) {
        const clip = createVRMAnimationClip(vrmAnimation, vrm);
        const mixer = new THREE.AnimationMixer(vrm.scene);
        const action = mixer.clipAction(clip);
        action.play();
        mixerRef.current = mixer;
      }

      scene.add(vrm.scene);
      vrmRef.current = vrm;
    }

    load().catch((err) => {
      console.error(err);
      if (!cancelled) useAnimateStore.getState().setLoadError(err?.message || 'Failed to load avatar');
    });

    return () => {
      cancelled = true;
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene);
        VRMUtils.deepDispose(vrmRef.current.scene);
        vrmRef.current = null;
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
    };
  }, [scene]);

  useFrame((_, delta) => {
    if (!vrmRef.current) return;
    // Clamp prevents spring-bone explosion on first frame or tab refocus
    const d = Math.min(delta, 0.05);
    if (mixerRef.current) {
      mixerRef.current.timeScale = useAnimateStore.getState().isPlaying ? 1 : 0;
      mixerRef.current.update(d);
    }
    vrmRef.current.update(d);
  });

  return null;
}
