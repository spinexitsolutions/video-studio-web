"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

/**
 * A procedurally-built mirrorless camera (no external model file needed).
 * Every part is a group so the scroll story can zoom the lens, explode the optics
 * and spin the body around.
 */

interface State {
  rx: number;
  ry: number;
  rz: number;
  x: number;
  y: number;
  z: number;
  zoom: number; // 0..1 lens barrel extension
  explode: number; // 0..1 exploded view
}

// Keyframes the scroll progress moves through
const STATES: State[] = [
  { rx: 0.18, ry: -0.65, rz: 0.04, x: 0, y: 0, z: 0, zoom: 0, explode: 0 }, // hero three-quarter
  { rx: 0.05, ry: -1.45, rz: 0, x: 0, y: 0, z: 0.4, zoom: 1, explode: 0 }, // side profile, lens zoomed
  { rx: 0.4, ry: -0.55, rz: -0.08, x: 0, y: 0.1, z: -0.6, zoom: 0.6, explode: 1 }, // exploded optics
  { rx: 0.25, ry: Math.PI - 0.55, rz: 0, x: 0, y: 0, z: 0.2, zoom: 0, explode: 0 }, // back / screen
  { rx: 0.02, ry: 0, rz: 0, x: 0, y: 0, z: 1.3, zoom: 0.25, explode: 0 }, // looking at you
];

const ease = (t: number) => t * t * (3 - 2 * t);
const remap = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

function sample(p: number): State {
  const f = Math.min(0.9999, Math.max(0, p)) * (STATES.length - 1);
  const i = Math.floor(f);
  const t = ease(remap(f - i, 0.62, 1)); // hold each pose, then move at the chapter boundary
  const a = STATES[i];
  const b = STATES[i + 1] ?? a;
  const out = {} as State;
  (Object.keys(a) as (keyof State)[]).forEach((k) => (out[k] = a[k] + (b[k] - a[k]) * t));
  return out;
}

function Ribbed({ radius, length, ribs = 18, depth = 0.025, material }: { radius: number; length: number; ribs?: number; depth?: number; material: THREE.Material }) {
  const step = length / ribs;
  return (
    <group>
      <mesh rotation-x={Math.PI / 2} material={material}>
        <cylinderGeometry args={[radius - depth, radius - depth, length, 64]} />
      </mesh>
      {Array.from({ length: ribs }).map((_, i) => (
        <mesh key={i} rotation-x={Math.PI / 2} position-z={-length / 2 + step * (i + 0.5)} material={material}>
          <cylinderGeometry args={[radius, radius, step * 0.55, 64]} />
        </mesh>
      ))}
    </group>
  );
}

export default function CameraModel({ progress, accent }: { progress: MotionValue<number>; accent: string }) {
  const root = useRef<THREE.Group>(null);
  const lens = useRef<THREE.Group>(null);
  const barrel2 = useRef<THREE.Group>(null);
  const front = useRef<THREE.Group>(null);
  const elements = useRef<(THREE.Mesh | null)[]>([]);
  const top = useRef<THREE.Group>(null);
  const grip = useRef<THREE.Group>(null);
  const screen = useRef<THREE.Group>(null);
  const sensor = useRef<THREE.Mesh>(null);
  const cur = useRef<State>({ ...STATES[0] });

  const m = useMemo(() => {
    const accentColor = new THREE.Color(accent);
    return {
      body: new THREE.MeshPhysicalMaterial({ color: "#1b1b1f", roughness: 0.62, metalness: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.6 }),
      plate: new THREE.MeshPhysicalMaterial({ color: "#2b2b31", roughness: 0.32, metalness: 0.85, clearcoat: 0.6 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#0d0d0f", roughness: 0.92, metalness: 0.05 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#d9d9de", roughness: 0.18, metalness: 1 }),
      steel: new THREE.MeshStandardMaterial({ color: "#8d8d95", roughness: 0.3, metalness: 1 }),
      black: new THREE.MeshPhysicalMaterial({ color: "#0b0b0d", roughness: 0.45, metalness: 0.4, clearcoat: 0.4 }),
      accent: new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.3 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#0b1026",
        roughness: 0.04,
        metalness: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0,
        iridescence: 1,
        iridescenceIOR: 1.6,
        iridescenceThicknessRange: [200, 800],
        envMapIntensity: 2.2,
      }),
      element: new THREE.MeshPhysicalMaterial({
        color: "#b9c6ff",
        roughness: 0.02,
        metalness: 0.1,
        transmission: 0.92,
        thickness: 0.25,
        ior: 1.55,
        iridescence: 0.7,
        transparent: true,
        opacity: 0.9,
      }),
      elements: [] as THREE.MeshPhysicalMaterial[],
      screen: new THREE.MeshPhysicalMaterial({ color: "#050507", roughness: 0.08, metalness: 0.2, clearcoat: 1, emissive: "#0a0e1c", emissiveIntensity: 0.6 }),
      sensor: new THREE.MeshPhysicalMaterial({ color: "#2a1f4a", roughness: 0.1, metalness: 0.9, iridescence: 1, iridescenceThicknessRange: [300, 900] }),
    };
  }, [accent]);
  if (!m.elements.length) for (let i = 0; i < 5; i++) m.elements.push(m.element.clone());

  useFrame((state, delta) => {
    const target = sample(progress.get());
    const c = cur.current;
    const k = 1 - Math.pow(0.0025, delta); // frame-rate independent damping
    (Object.keys(c) as (keyof State)[]).forEach((key) => (c[key] += (target[key] - c[key]) * k));

    const t = state.clock.elapsedTime;
    const px = state.pointer.x * 0.18;
    const py = state.pointer.y * 0.12;
    if (root.current) {
      root.current.rotation.set(c.rx - py + Math.sin(t * 0.6) * 0.02, c.ry + px, c.rz + Math.sin(t * 0.4) * 0.015);
      root.current.position.set(c.x, c.y + Math.sin(t * 0.9) * 0.05, c.z);
    }
    if (barrel2.current) barrel2.current.position.z = 0.55 + c.zoom * 0.55 + c.explode * 0.5;
    if (front.current) front.current.position.z = 1.25 + c.zoom * 0.75 + c.explode * 1.8;
    if (lens.current) lens.current.position.z = 0.5 + c.explode * 0.9;
    elements.current.forEach((el, i) => {
      if (!el) return;
      el.position.z = 0.35 + i * 0.28 * (1 + c.explode * 2.4) + c.zoom * 0.25;
      el.rotation.z = t * 0.2 * (i % 2 ? 1 : -1);
      el.visible = c.explode > 0.02;
      (el.material as THREE.MeshPhysicalMaterial).opacity = Math.min(0.9, c.explode * 1.2);
      el.scale.setScalar(0.85 + c.explode * 0.15);
    });
    if (top.current) top.current.position.y = c.explode * 0.55;
    if (grip.current) grip.current.position.x = -c.explode * 0.5;
    if (screen.current) screen.current.position.z = -c.explode * 0.6;
    if (sensor.current) sensor.current.position.z = 0.15 + c.explode * 0.6;
  });

  return (
    <group ref={root} dispose={null}>
      {/* ---------- BODY ---------- */}
      <RoundedBox args={[3.4, 2.0, 1.0]} radius={0.16} smoothness={6} material={m.body} />
      {/* leatherette front panel */}
      <RoundedBox args={[3.1, 1.45, 0.04]} radius={0.02} position={[0, -0.22, 0.5]} material={m.rubber} />
      {/* sensor (visible in exploded view) */}
      <mesh ref={sensor} position={[0.15, -0.05, 0.15]} material={m.sensor}>
        <boxGeometry args={[0.9, 0.62, 0.04]} />
      </mesh>
      {/* AF assist lamp */}
      <mesh position={[1.35, 0.62, 0.52]} material={m.accent}>
        <sphereGeometry args={[0.055, 24, 24]} />
      </mesh>
      {/* strap lugs */}
      {[-1.72, 1.72].map((x) => (
        <mesh key={x} position={[x, 0.65, 0]} rotation-y={Math.PI / 2} material={m.steel}>
          <torusGeometry args={[0.1, 0.03, 12, 24]} />
        </mesh>
      ))}

      {/* ---------- TOP PLATE ---------- */}
      <group ref={top}>
        <RoundedBox args={[3.25, 0.22, 0.92]} radius={0.08} smoothness={4} position={[0, 1.05, 0]} material={m.plate} />
        {/* EVF hump */}
        <RoundedBox args={[1.25, 0.55, 0.95]} radius={0.12} smoothness={4} position={[0.15, 1.32, -0.02]} material={m.body} />
        <RoundedBox args={[1.05, 0.12, 0.85]} radius={0.04} position={[0.15, 1.62, -0.02]} material={m.plate} />
        {/* hot shoe */}
        <mesh position={[0.15, 1.71, -0.02]} material={m.chrome}>
          <boxGeometry args={[0.5, 0.05, 0.48]} />
        </mesh>
        {/* mode dial */}
        <group position={[1.05, 1.24, -0.05]}>
          <mesh material={m.plate}>
            <cylinderGeometry args={[0.34, 0.34, 0.2, 48]} />
          </mesh>
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.345, 0, Math.sin(a) * 0.345]} rotation-y={-a} material={m.steel}>
                <boxGeometry args={[0.02, 0.17, 0.035]} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.105, 0.2]} material={m.accent}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
          </mesh>
        </group>
        {/* rear dial */}
        <mesh position={[-0.7, 1.21, -0.22]} material={m.steel}>
          <cylinderGeometry args={[0.24, 0.24, 0.14, 40]} />
        </mesh>
      </group>

      {/* ---------- GRIP + SHUTTER ---------- */}
      <group ref={grip}>
        <RoundedBox args={[0.95, 1.9, 0.55]} radius={0.24} smoothness={6} position={[-1.18, -0.05, 0.62]} material={m.rubber} />
        <group position={[-1.18, 0.98, 0.55]}>
          <mesh material={m.chrome}>
            <cylinderGeometry args={[0.2, 0.22, 0.06, 40]} />
          </mesh>
          <mesh position-y={0.06} material={m.steel}>
            <cylinderGeometry args={[0.13, 0.14, 0.08, 40]} />
          </mesh>
        </group>
        {/* front control dial */}
        <mesh position={[-1.18, 0.75, 0.92]} rotation-x={Math.PI / 2} material={m.steel}>
          <cylinderGeometry args={[0.16, 0.16, 0.06, 32]} />
        </mesh>
      </group>

      {/* ---------- REAR SCREEN ---------- */}
      <group ref={screen}>
        <RoundedBox args={[2.25, 1.45, 0.06]} radius={0.04} position={[0.25, -0.12, -0.53]} material={m.black} />
        <mesh position={[0.25, -0.12, -0.565]} rotation-y={Math.PI} material={m.screen}>
          <planeGeometry args={[2.05, 1.27]} />
        </mesh>
        {/* screen UI accents */}
        <mesh position={[-0.55, 0.38, -0.568]} rotation-y={Math.PI} material={m.accent}>
          <circleGeometry args={[0.045, 24]} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-1.25, 0.45 - i * 0.28, -0.53]} material={m.steel}>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 20]} />
          </mesh>
        ))}
      </group>

      {/* ---------- LENS ---------- */}
      <mesh position={[0.15, -0.05, 0.52]} material={m.chrome}>
        <torusGeometry args={[0.86, 0.05, 20, 80]} />
      </mesh>
      <group ref={lens} position={[0.15, -0.05, 0.5]}>
        {/* mount */}
        <mesh rotation-x={Math.PI / 2} position-z={0.1} material={m.chrome}>
          <cylinderGeometry args={[0.83, 0.83, 0.2, 64]} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} position-z={0.32} material={m.black}>
          <cylinderGeometry args={[0.8, 0.82, 0.26, 64]} />
        </mesh>
        {/* zoom ring */}
        <group position-z={0.7}>
          <Ribbed radius={0.86} length={0.5} ribs={16} material={m.rubber} />
        </group>
        {/* inner barrel that extends */}
        <group ref={barrel2} position-z={0.55}>
          <mesh rotation-x={Math.PI / 2} position-z={0.4} material={m.black}>
            <cylinderGeometry args={[0.76, 0.78, 0.7, 64]} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={0.5} material={m.accent}>
            <cylinderGeometry args={[0.785, 0.785, 0.045, 64]} />
          </mesh>
        </group>
        {/* focus ring + front element */}
        <group ref={front} position-z={1.25}>
          <Ribbed radius={0.82} length={0.32} ribs={22} depth={0.018} material={m.rubber} />
          <mesh rotation-x={Math.PI / 2} position-z={0.24} material={m.black}>
            <cylinderGeometry args={[0.84, 0.8, 0.16, 64]} />
          </mesh>
          <mesh position-z={0.32} material={m.steel}>
            <torusGeometry args={[0.72, 0.035, 16, 72]} />
          </mesh>
          <mesh position-z={0.2} scale={[1, 1, 0.38]} material={m.glass}>
            <sphereGeometry args={[0.7, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>
        {/* inner optical elements (fly out in exploded view) */}
        {[0.6, 0.66, 0.7, 0.64, 0.58].map((r, i) => (
          <mesh key={i} ref={(el) => (elements.current[i] = el)} rotation-x={Math.PI / 2} material={m.elements[i]} visible={false}>
            <cylinderGeometry args={[r, r, 0.06 + (i % 2) * 0.05, 64]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
