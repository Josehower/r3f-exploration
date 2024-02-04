'use client';

import { useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { InstancedMesh } from 'three';

var myOffset = new Float32Array([
  0 / 4,
  0.0, // x,y texture offset for first instance. 1.0 unit is the full width
  1 / 4,
  0.0, // x,y texture offset for second instance etc.
  2 / 4,
  0.0, // x,y texture offset for second instance etc.
  3 / 4,
  0.0
]);

// let texIdx = Float32Array.from('01011');

function Instances({ count = 5, temp = new THREE.Object3D() }) {
  const texture = useTexture('/vampire_v2_full-spaced.png');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  const instancedMeshRef = useRef<InstancedMesh>(null!);
  useEffect(() => {
    // Set positions
    for (let i = 0; i < count; i++) {
      temp.position.set(i, i, 0);
      temp.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }

    // Update the instance
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const onBeforeCompile = (shader: THREE.ShaderLibShader) => {
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `
      varying vec2 vUv;
      attribute vec2 myOffset;
      attribute vec2 corrector;
      void main() {
      `
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `
      #include <uv_vertex>
      vec2 customUV = (uv * corrector) + myOffset;
      vMapUv = customUV;
      vUv = customUV;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(vUv, 1.0, 1.0);
      `
    );
    console.log(shader.fragmentShader);
  };

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]}>
      <planeGeometry>
        <instancedBufferAttribute
          attach="attributes-myOffset"
          array={myOffset}
          itemSize={2}
        />
        <instancedBufferAttribute
          attach="attributes-corrector"
          array={new Float32Array(count * 2).map((_, index) =>
            index % 2 === 0 ? 0.25 : 1.0
          )}
          itemSize={2}
        />
      </planeGeometry>
      <meshBasicMaterial
        transparent
        map={texture}
        onBeforeCompile={onBeforeCompile}
      />
    </instancedMesh>
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
        pointerEvents: 'none'
      }}
      camera={{ position: [0, 0, 10] }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <Instances />
    </Canvas>
  );
}
