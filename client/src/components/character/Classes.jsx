import React, { useMemo, useRef } from "react";
import { useGLTF, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";
import { RigidBody } from "@react-three/rapier";
import { useAtom } from "jotai";
import { Socket, characterAtom, myIdAtom } from "../../conection/SocketConnection.js";

function ClassZoneModel({ src = "/models/items/tp.glb", scale = 1, position = [0,0,0], rotation = [0,0,0] }) {
  const { scene } = useGLTF(src);
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <group position={position} rotation={rotation} scale={scale}>
        <primitive object={cloned} dispose={null} />
      </group>
    </RigidBody>
  );
}

export default function ClassZone({ zone, playerRef }) {
  const p = zone.position ?? [0,0,0];
  const y = Number(p[1] ?? 0);
  const r = Math.max(0.8, Number(zone.radius ?? 2));
  const targetClass = zone.class ?? zone.className ?? null;

  const [characters] = useAtom(characterAtom);
  const [myId] = useAtom(myIdAtom);

  const insideRef = useRef(false);
  const lastSentRef = useRef(0);
  const COOLDOWN_MS = Number(zone.cooldown ?? 1200);

  useFrame(() => {
    let px, pz;
    if (playerRef && playerRef.current) {
      const pos = playerRef.current.position;
      px = pos.x; pz = pos.z;
    } else {
      const me = characters.find((c) => String(c.id) === String(myId));
      if (!me) return;
      px = me.position[0]; pz = me.position[2];
    }

    const dx = px - p[0];
    const dz = pz - p[2];
    const inside = dx * dx + dz * dz <= r * r;
    const now = performance.now();

    if (inside && !insideRef.current && now - lastSentRef.current >= COOLDOWN_MS && targetClass) {
      if (Socket.emit("select_class", { class: targetClass })) {
        lastSentRef.current = now;
        console.log("ClassZone: requested class", targetClass, "from zone", zone.id);
      }
    }

    insideRef.current = inside;
  });

  return (
    <group position={[p[0], y + 0.03, p[2]]}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[r * 0.55, r, 48]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.85} side={2} />
      </mesh>

      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[r * 0.07, r * 0.07, 1.5, 16]} />
        <meshStandardMaterial color="#00b7ff" emissive="#91b7ff" emissiveIntensity={1} transparent opacity={0.35} />
      </mesh>

      <Text position={[0, 3, 0]} fontSize={1} color="#ffffff" anchorX="center" anchorY="bottom">
        {targetClass ?? zone.id}
      </Text>

      {zone.model && (
        <ClassZoneModel
          src={zone.model}
          scale={zone.scale ?? 1}
          position={[
            (zone.position_model?.[0] ?? zone.position?.[0] ?? 0) - p[0],
            (zone.position_model?.[1] ?? zone.position?.[1] ?? 0) - p[1],
            (zone.position_model?.[2] ?? zone.position?.[2] ?? 0) - p[2],
          ]}
          rotation={zone.rotation_model ?? zone.rotation ?? [0, 0, 0]}
        />
      )}
    </group>
  );
}