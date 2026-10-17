import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Completely code-generated procedural environment map using RoomEnvironment.
 * Requires 0 network requests, 0 external HDR files, and eliminates Suspense freezes.
 */
export const ProceduralEnvironment: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const room = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(room, 0.04).texture;
    scene.environment = envTexture;
    (scene as any).environmentIntensity = 0.6;

    return () => {
      scene.environment = null;
      (scene as any).environmentIntensity = 1.0;
      envTexture.dispose();
      room.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
};

