'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// ── Interactive Document Stack ───────────────────────────────────────────────
function DocumentStack() {
  const doc1 = useRef<THREE.Group>(null);
  const doc2 = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Switch cursor to grab on hover
  useEffect(() => {
    document.body.style.cursor = hovered ? 'grab' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  useFrame((state) => {
    if (!doc1.current || !doc2.current) return;
    
    // Animate separation and tilt on hover
    const targetZ1 = hovered ? 0.6 : 0.15;
    const targetZ2 = hovered ? -0.6 : -0.15;
    const targetRotX1 = hovered ? -0.05 : 0;
    const targetRotX2 = hovered ? 0.05 : 0;
    
    doc1.current.position.z = THREE.MathUtils.lerp(doc1.current.position.z, targetZ1, 0.08);
    doc2.current.position.z = THREE.MathUtils.lerp(doc2.current.position.z, targetZ2, 0.08);
    
    doc1.current.rotation.x = THREE.MathUtils.lerp(doc1.current.rotation.x, targetRotX1, 0.08);
    doc2.current.rotation.x = THREE.MathUtils.lerp(doc2.current.rotation.x, targetRotX2, 0.08);
    
    // Add a gentle continuous spin/bobbing
    const t = state.clock.getElapsedTime();
    doc1.current.position.y = Math.sin(t * 1.5) * 0.1;
    doc2.current.position.y = Math.cos(t * 1.5) * 0.1;
  });
  
  return (
    <group 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <PresentationControls
        global
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0.1, -0.4, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 2, Math.PI / 2]}
      >
        <group ref={doc1}>
            {/* Document 1: Representing a Photo / Image File */}
            <RoundedBox args={[2, 2.8, 0.1]} radius={0.05} smoothness={4} castShadow receiveShadow>
               <meshPhysicalMaterial 
                  color="#ffffff"
                  metalness={0.1}
                  roughness={0.2}
                  transmission={0.95}
                  ior={1.5}
                  thickness={0.5}
                  transparent
                />
            </RoundedBox>
            
            {/* Image block */}
            <RoundedBox args={[1.5, 1.2, 0.12]} radius={0.1} position={[0, 0.5, 0]}>
               <meshStandardMaterial color="#0F6E56" emissive="#0F6E56" emissiveIntensity={0.2} />
            </RoundedBox>
            
            {/* Text lines */}
            <RoundedBox args={[1.5, 0.15, 0.12]} radius={0.05} position={[0, -0.4, 0]}>
               <meshStandardMaterial color="#D85A30" />
            </RoundedBox>
            <RoundedBox args={[1.1, 0.15, 0.12]} radius={0.05} position={[-0.2, -0.7, 0]}>
               <meshStandardMaterial color="#D85A30" />
            </RoundedBox>
        </group>
        
        <group ref={doc2}>
            {/* Document 2: Representing a Document / PDF */}
            <RoundedBox args={[2, 2.8, 0.1]} radius={0.05} smoothness={4} castShadow receiveShadow>
               <meshPhysicalMaterial 
                  color="#ffffff"
                  metalness={0.1}
                  roughness={0.2}
                  transmission={0.95}
                  ior={1.5}
                  thickness={0.5}
                  transparent
                />
            </RoundedBox>
            
            {/* Text lines */}
            <RoundedBox args={[1.4, 0.12, 0.12]} radius={0.04} position={[0, 0.9, 0]}>
               <meshStandardMaterial color="#1D9E75" />
            </RoundedBox>
            <RoundedBox args={[1.4, 0.12, 0.12]} radius={0.04} position={[0, 0.6, 0]}>
               <meshStandardMaterial color="#1D9E75" />
            </RoundedBox>
            <RoundedBox args={[1.0, 0.12, 0.12]} radius={0.04} position={[-0.2, 0.3, 0]}>
               <meshStandardMaterial color="#1D9E75" />
            </RoundedBox>
            
            <RoundedBox args={[1.4, 0.12, 0.12]} radius={0.04} position={[0, -0.1, 0]}>
               <meshStandardMaterial color="#04342C" />
            </RoundedBox>
            <RoundedBox args={[1.2, 0.12, 0.12]} radius={0.04} position={[-0.1, -0.4, 0]}>
               <meshStandardMaterial color="#04342C" />
            </RoundedBox>
        </group>
      </PresentationControls>
    </group>
  );
}

// ── Main exported Scene ───────────────────────────────────────────────────────
export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      dpr={[1, 2]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-4, -2, -4]} intensity={1} color="#D85A30" />
      <pointLight position={[4, 2, 2]} intensity={1.5} color="#1D9E75" />

      {/* HDRI environment for reflections on glass */}
      <Environment preset="city" />

      {/* Floating Interactive Document Stack */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <DocumentStack />
      </Float>

      {/* Ground soft shadow */}
      <ContactShadows 
        position={[0, -2.2, 0]} 
        opacity={0.6} 
        scale={10} 
        blur={2.5} 
        far={4} 
        color="#0F6E56" 
      />

      {/* Ambient Sparkles */}
      <Sparkles
        count={50}
        size={1.6}
        speed={0.4}
        opacity={0.6}
        color="#0F6E56"
        scale={6}
      />
      <Sparkles
        count={30}
        size={1.2}
        speed={0.3}
        opacity={0.4}
        color="#D85A30"
        scale={5}
      />
    </Canvas>
  );
}
