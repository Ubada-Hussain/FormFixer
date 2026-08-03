'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// ── Animated Torus Knot ──────────────────────────────────────────────────────
function BrewingShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.4 + t * 0.12;
    meshRef.current.rotation.y = t * 0.22;
    meshRef.current.rotation.z = Math.cos(t * 0.25) * 0.2;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef} castShadow>
        <torusKnotGeometry args={[1.1, 0.35, 200, 32, 2, 3]} />
        <MeshDistortMaterial
          color="#0F6E56"
          emissive="#D85A30"
          emissiveIntensity={0.18}
          metalness={0.6}
          roughness={0.15}
          distort={0.28}
          speed={1.6}
          transparent
          opacity={0.95}
        />
      </mesh>
    </Float>
  );
}

// ── Orbiting secondary sphere ─────────────────────────────────────────────────
function OrbitSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.x = Math.sin(t * 0.6) * 2.5;
    ref.current.position.y = Math.cos(t * 0.6) * 1.2;
    ref.current.position.z = Math.cos(t * 0.6) * 1.5;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.22, 32, 32]} />
      <meshStandardMaterial
        color="#D85A30"
        emissive="#D85A30"
        emissiveIntensity={0.5}
        metalness={0.7}
        roughness={0.1}
      />
    </mesh>
  );
}

// ── Second orbiting sphere (opposite phase) ───────────────────────────────────
function OrbitSphere2() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() + Math.PI;
    ref.current.position.x = Math.sin(t * 0.5) * 2.2;
    ref.current.position.y = Math.cos(t * 0.7) * 1.4;
    ref.current.position.z = Math.sin(t * 0.4) * 1.8;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.14, 32, 32]} />
      <meshStandardMaterial
        color="#1D9E75"
        emissive="#1D9E75"
        emissiveIntensity={0.6}
        metalness={0.8}
        roughness={0.05}
      />
    </mesh>
  );
}

// ── Main exported Scene ───────────────────────────────────────────────────────
export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      dpr={[1, 2]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.8}
        color="#ffffff"
      />
      <pointLight position={[-4, -3, -4]} intensity={0.8} color="#D85A30" />
      <pointLight position={[4, 3, 2]}   intensity={0.6} color="#1D9E75" />

      {/* HDRI environment for reflections */}
      <Environment preset="city" />

      {/* 3D shapes */}
      <BrewingShape />
      <OrbitSphere />
      <OrbitSphere2 />

      {/* Sparkles */}
      <Sparkles
        count={80}
        size={1.6}
        speed={0.4}
        opacity={0.6}
        color="#0F6E56"
        scale={7}
      />
      <Sparkles
        count={40}
        size={1.2}
        speed={0.3}
        opacity={0.4}
        color="#D85A30"
        scale={6}
      />
    </Canvas>
  );
}
