"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import CrystalCore from "./CrystalCore";
import ParticleLattice from "./ParticleLattice";

const DPR: [number, number] = [1, 1.75];

export default function HeroCanvas({
  scrollProgress,
  active,
}: {
  scrollProgress: React.RefObject<number>;
  active: boolean;
}) {
  return (
    <Canvas
      dpr={DPR}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#0b1527"]} />
      <fog attach="fog" args={["#0b1527", 7, 15]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[4, 3, 5]} intensity={40} color="#ad8752" />
      <pointLight position={[-5, -2, -3]} intensity={25} color="#912f40" />
      <directionalLight position={[0, 6, 3]} intensity={0.6} color="#ffffff" />

      <Suspense fallback={null}>
        <CrystalCore scrollProgress={scrollProgress} />
        <ParticleLattice scrollProgress={scrollProgress} />
        <ContactShadows
          frames={1}
          position={[0, -2.6, 0]}
          opacity={0.4}
          scale={12}
          blur={2.8}
          far={4}
          color="#ad8752"
        />
      </Suspense>

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
