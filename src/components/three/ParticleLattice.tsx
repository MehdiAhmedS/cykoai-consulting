"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 90;
const MAX_LINK_DIST = 1.7;
const FIELD_RADIUS = 5.4;

function generateField() {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const r = FIELD_RADIUS * (0.55 + Math.random() * 0.45);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    points.push(
      new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.6,
        r * Math.cos(phi)
      )
    );
  }

  const linePositions: number[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (points[i].distanceTo(points[j]) < MAX_LINK_DIST) {
        linePositions.push(points[i].x, points[i].y, points[i].z);
        linePositions.push(points[j].x, points[j].y, points[j].z);
      }
    }
  }

  const pointPositions = new Float32Array(points.length * 3);
  points.forEach((p, i) => p.toArray(pointPositions, i * 3));

  return {
    pointPositions,
    linePositions: new Float32Array(linePositions),
  };
}

/**
 * A slow-drifting constellation of nodes and connecting edges surrounding
 * the crystal core — gives the scene depth and an "intelligence field" feel
 * without depicting anything literal.
 */
export default function ParticleLattice({
  scrollProgress,
}: {
  scrollProgress: React.RefObject<number>;
}) {
  const { pointPositions, linePositions } = useMemo(() => generateField(), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const scroll = scrollProgress.current ?? 0;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.02;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.08;
      groupRef.current.position.z = -scroll * 2.2;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#d4b483"
          transparent
          opacity={0.55}
          sizeAttenuation
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#6b5432" transparent opacity={0.12} />
      </lineSegments>
    </group>
  );
}
