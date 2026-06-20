import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Center } from '@react-three/drei';

const CyberShield3D = ({ mousePosition }) => {
  const groupRef = useRef();
  const innerCoreRef = useRef();
  const outerRingRef = useRef();
  const dataParticlesRef = useRef();

  // Create a complex shield geometry
  const shieldGeometry = useMemo(() => {
    // A stylized hexagon/shield shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.5);
    shape.lineTo(1.2, 0.8);
    shape.lineTo(1.2, -0.5);
    shape.lineTo(0, -1.5);
    shape.lineTo(-1.2, -0.5);
    shape.lineTo(-1.2, 0.8);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Inner floating core
  const coreGeometry = useMemo(() => new THREE.OctahedronGeometry(0.5, 0), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Smooth continuous rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.5;
      
      // Floating up and down
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.15;

      // Mouse interaction
      if (mousePosition.current) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mousePosition.current.y * 0.5, 0.05);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mousePosition.current.x * 0.5, 0.05);
      }
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x = time * -1.2;
      innerCoreRef.current.rotation.z = time * 0.8;
      // Pulse scale
      const scale = 1 + Math.sin(time * 3) * 0.1;
      innerCoreRef.current.scale.set(scale, scale, scale);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = Math.PI / 2;
      outerRingRef.current.rotation.z = time * -0.3;
    }
  });

  // Holographic glass material
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00E5FF,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9, // glass-like
    transparent: true,
    opacity: 0.7,
    envMapIntensity: 1.0,
    wireframe: true
  });

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00E5FF,
    emissiveIntensity: 2,
    roughness: 0.2,
    metalness: 1
  });

  return (
    <group ref={groupRef}>
      <Center>
        {/* Main Shield Body */}
        <mesh geometry={shieldGeometry} material={glassMaterial} />
        
        {/* Glowing Inner Core */}
        <mesh ref={innerCoreRef} geometry={coreGeometry} material={coreMaterial} />

        {/* Orbiting data rings */}
        <group ref={outerRingRef}>
          <mesh>
            <torusGeometry args={[2.2, 0.02, 16, 100]} />
            <meshBasicMaterial color={0x00E5FF} transparent opacity={0.3} />
          </mesh>
          <mesh rotation={[Math.PI/4, 0, 0]}>
            <torusGeometry args={[2.5, 0.01, 16, 100]} />
            <meshBasicMaterial color={0x00E5FF} transparent opacity={0.15} />
          </mesh>
        </group>
      </Center>
    </group>
  );
};

export default CyberShield3D;
