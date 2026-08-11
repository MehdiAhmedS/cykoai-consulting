"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * The hero centerpiece: a faceted "evolving crystal" core (soft distorted
 * icosahedron) inside a slower-rotating wireframe shell, with glowing
 * node points at the shell's vertices. Reads pointer + scroll progress
 * from refs (no React state) so it never triggers a re-render.
 */
export default function CrystalCore({
  scrollProgress,
}: {
  scrollProgress: React.RefObject<number>;
}) {
  const rigRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);

  const shellGeometry = useMemo(() => new THREE.IcosahedronGeometry(2.35, 1), []);
  const nodePositions = useMemo(() => {
    const posAttr = shellGeometry.getAttribute("position");
    const seen = new Set<string>();
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const key = v.toArray().map((n) => n.toFixed(2)).join(",");
      if (!seen.has(key)) {
        seen.add(key);
        pts.push(v);
      }
    }
    return pts;
  }, [shellGeometry]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const p = state.pointer;
    const scroll = scrollProgress.current ?? 0;
    const t = state.clock.elapsedTime;

    if (rigRef.current) {
      const targetRotX = p.y * 0.28 + scroll * 0.9;
      const targetRotY = p.x * 0.35;
      rigRef.current.rotation.x += (targetRotX - rigRef.current.rotation.x) * 0.04;
      rigRef.current.rotation.y += (targetRotY - rigRef.current.rotation.y) * 0.04;

      const targetScale = 1 - scroll * 0.22;
      rigRef.current.scale.setScalar(
        rigRef.current.scale.x + (targetScale - rigRef.current.scale.x) * 0.06
      );
      rigRef.current.position.y = -scroll * 0.6;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.09;
      coreRef.current.rotation.x = t * 0.05;
      const breathe = 1 + Math.sin(t * 0.6) * 0.03;
      coreRef.current.scale.setScalar(breathe);
    }

    if (shellRef.current) {
      shellRef.current.rotation.y = -t * 0.045;
      shellRef.current.rotation.x = Math.sin(t * 0.15) * 0.15;
    }

    if (nodesRef.current) {
      nodesRef.current.rotation.copy(shellRef.current?.rotation ?? new THREE.Euler());
      for (let i = 0; i < nodePositions.length; i++) {
        const base = nodePositions[i];
        const pulse = 1 + Math.sin(t * 1.4 + i) * 0.25;
        dummy.position.copy(base);
        dummy.scale.setScalar(0.035 * pulse);
        dummy.updateMatrix();
        nodesRef.current.setMatrixAt(i, dummy.matrix);
      }
      nodesRef.current.instanceMatrix.needsUpdate = true;
    }

    void delta;
  });

  return (
    <group ref={rigRef}>
      {/* Inner evolving crystal */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.35, 5]} />
        <MeshDistortMaterial
          color="#0e1626"
          emissive="#5a4020"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.6}
          distort={0.32}
          speed={1.4}
          clearcoat={0.6}
        />
      </mesh>

      {/* Outer wireframe shell */}
      <mesh ref={shellRef} geometry={shellGeometry}>
        <meshBasicMaterial
          color="#ad8752"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* Glowing node points at shell vertices */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodePositions.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#d4b483" />
      </instancedMesh>
    </group>
  );
}
