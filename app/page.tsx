'use client';

import { useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

// let texIdx = Float32Array.from('01011');

function Box() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useTexture('/color.jpg');

  useFrame(() => {
    meshRef.current.rotateZ(0.001);
    meshRef.current.rotateY(0.001);
    meshRef.current.rotateX(0.001);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry />

      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function Plane() {
  const onBeforeCompile = (shader: THREE.ShaderLibShader) => {
    shader.fragmentShader = `
      ${shader.fragmentShader}
    `.replace(
      `#include <map_fragment>`,
      // normal collor would be vec3 col = texelColor.rgb;
      `
      	#ifdef USE_MAP
          float gray = dot(texelColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 col = vec3(gray);
          diffuseColor *= vec4(col, texelColor.a);
        #endif
      `
    );
  };

  return (
    <mesh position={[0.5, 0, 1]}>
      <planeGeometry />
      <meshPhongMaterial opacity={0.1} onBeforeCompile={onBeforeCompile} />
    </mesh>
  );
}

export default function Home() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        background: '#04041a'
      }}
      camera={{ position: [0, 0, 3] }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <Box />
      <Plane />
    </Canvas>
  );
}
