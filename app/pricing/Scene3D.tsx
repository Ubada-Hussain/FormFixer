'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial, Float, Sparkles, Trail, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// ── 1. Liquid Glass Core ───────────────────────────────────────────────────────
function LiquidCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Slowly morph and spin the core
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.x = t * 0.1;
    meshRef.current.position.y = Math.sin(t * 1.5) * 0.15;
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {/* A complex geometry to create beautiful glass refractions */}
      <torusKnotGeometry args={[1.2, 0.45, 256, 64]} />
      {/* Premium Glass Material */}
      <MeshTransmissionMaterial 
        backside
        samples={4}
        thickness={1.5}
        roughness={0.05}
        ior={1.5}
        chromaticAberration={0.6}
        anisotropy={0.3}
        distortion={0.4}
        distortionScale={0.5}
        temporalDistortion={0.2}
        color="#ffffff"
      />
    </mesh>
  );
}

// ── 2. Abstract Flowing Ribbon ────────────────────────────────────────────────
function Ribbon({ color, speed, offset, radius }: { color: string; speed: number; offset: number; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.getElapsedTime() + offset) * speed;
    // Lissajous curve for elegant swooping motion
    ref.current.position.x = Math.sin(t * 1.2) * radius;
    ref.current.position.y = Math.cos(t * 0.8) * radius * 0.8;
    ref.current.position.z = Math.sin(t * 1.5) * radius * 1.2;
  });

  return (
    <Trail
      width={0.6}
      color={color}
      length={12}
      decay={1.5}
      attenuation={(t) => t * t * t} // Taper gracefully
    >
      <mesh ref={ref} visible={false}>
        <sphereGeometry args={[0.1]} />
      </mesh>
    </Trail>
  );
}

// ── 3. Interactive Particle Swarm ─────────────────────────────────────────────
function Swarm() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    // Smoothly react to mouse pointer for a parallax effect
    const targetX = (state.pointer.x * state.viewport.width) / 5;
    const targetY = (state.pointer.y * state.viewport.height) / 5;
    
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetY * 0.2, 0.05);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX * 0.2, 0.05);
  });

  return (
    <group ref={group}>
      <Sparkles count={400} scale={14} size={3} speed={0.4} color="#0F6E56" opacity={0.5} noise={0.4} />
      <Sparkles count={300} scale={12} size={2} speed={0.5} color="#D85A30" opacity={0.6} noise={0.6} />
      <Sparkles count={200} scale={10} size={4} speed={0.2} color="#FBF8F0" opacity={0.8} noise={0.2} />
    </group>
  );
}

// ── Main Scene Composition ────────────────────────────────────────────────────
export default function Scene3D() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ width: '100%', height: '100%', cursor: hovered ? 'grab' : 'auto' }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        {/* Elegant cinematic lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#D85A30" />
        <pointLight position={[5, 0, -2]} intensity={2.5} color="#0F6E56" />

        {/* Environment for stunning glass refractions */}
        <Environment preset="city" />

        {/* Presentation Controls allow user to drag & spin the core */}
        <PresentationControls
          global
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
          rotation={[0.1, -0.2, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 2, Math.PI / 2]}
        >
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
            <LiquidCore />
            <Ribbon color="#0F6E56" speed={0.8} offset={0} radius={3.5} />
            <Ribbon color="#D85A30" speed={0.6} offset={Math.PI} radius={3} />
          </Float>
        </PresentationControls>

        {/* Background Swarm that reacts to mouse tracking independently */}
        <Swarm />

      </Canvas>
    </div>
  );
}
