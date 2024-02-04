'use client';

import { useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';

function Box() {
  const [needsUpdate, setNeedsUpdate] = useState(false);

  const [{ grayscale }] = useControls(() => ({
    grayscale: {
      value: true,
      onChange: () => {
        setNeedsUpdate(true);
      },
      transient: false
    }
  }));

  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useTexture('/color.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  const onBeforeCompile = (shader: THREE.ShaderLibShader) => {
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `
      attribute vec2 grayscale;
      varying vec2 vgrayscale;
      varying vec2 vUv;
      void main() {
      `
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `
      #include <uv_vertex>
      vUv = uv;
      vgrayscale = grayscale;
      `
    );

    shader.fragmentShader = `
      varying vec2 vgrayscale;
      varying vec2 vUv;
      ${shader.fragmentShader}
    `.replace(
      `#include <map_fragment>`,
      `
      	#ifdef USE_MAP
          vec4 texelColor = texture2D( map, vUv );
          float gray = dot(texelColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 col = vgrayscale[0] > 0.0 ? vec3(gray) : texelColor.rgb;
          diffuseColor *= vec4(col, texelColor.a);
        #endif
      `
    );
  };

  useFrame(() => {
    meshRef.current.rotateZ(0.001);
    meshRef.current.rotateY(0.001);
    meshRef.current.rotateX(0.001);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry>
        <instancedBufferAttribute
          attach="attributes-grayscale"
          array={new Float32Array([grayscale ? 1 : 0])}
          itemSize={1}
          needsUpdate={needsUpdate}
          onUpdate={() => {
            setNeedsUpdate(false);
          }}
        />
      </sphereGeometry>
      <meshBasicMaterial
        transparent
        map={texture}
        onBeforeCompile={onBeforeCompile}
      />
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
    </Canvas>
  );
}
