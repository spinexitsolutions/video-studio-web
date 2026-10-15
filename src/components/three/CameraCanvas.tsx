"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";
import type { MotionValue } from "framer-motion";
import CameraModel from "./CameraModel";

/** Shrinks the model on narrow canvases (phones) so the zoomed lens stays in frame. */
function Responsive({ children }: { children: ReactNode }) {
  const width = useThree((s) => s.size.width);
  const scale = Math.min(1, Math.max(0.55, width / 720));
  return <group scale={scale}>{children}</group>;
}

export default function CameraCanvas({ progress, accent, active = true }: { progress: MotionValue<number>; accent: string; active?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.4, 9.5], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <spotLight position={[6, 8, 6]} angle={0.4} penumbra={1} intensity={120} castShadow />
        <pointLight position={[-6, -2, 3]} intensity={30} color={accent} />
        <pointLight position={[0, 3, -6]} intensity={40} color="#7aa2ff" />
        <group position={[0, -0.1, 0]}>
          <Responsive>
            <CameraModel progress={progress} accent={accent} />
          </Responsive>
        </group>
        <ContactShadows position={[0, -1.9, 0]} opacity={0.55} scale={14} blur={2.6} far={4} />
        {/* Studio lighting baked into an environment map — no external HDR files */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={4} position={[0, 5, -2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={2.5} position={[-6, 1, 1]} scale={[3, 8, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={2.5} position={[6, 1, 1]} scale={[3, 8, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="ring" color={accent} intensity={3} position={[3, 2, 6]} scale={2.5} />
          <Lightformer form="circle" intensity={1.5} position={[-3, -2, 5]} scale={2} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
