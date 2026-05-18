// client/src/components/terrain/Chunk.jsx

// componente que renderiza un chunk de terreno hexagonal a partir de un arreglo de tiles 
// generados por el server, cada tile tiene coordenadas axiales (q, r) y una altura (h), 
// y opcionalmente un color( que se puede usar para diferenciar tipos de terreno, como agua, tierra, etc ),
// el chunk se encarga de posicionar cada tile en el espacio 3D usando sus coordenadas axiales y su altura,

import React from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

export default function HexGrid({ map, tileSize = 1, heightScale = 0 , thickness = 1, position = [0, -1, 0] }) {
  const tiles = map?.hexGrid ?? [];

  const axialToWorld = (q, r, size = 1) => {
    const x = size * Math.sqrt(3) * (q + r / 2);
    const z = size * (3 / 2) * r;
    return [x, z];
  };

  if (!tiles.length) return null;

  return (
    <group position={position}>
      {tiles.map((t, i) => {
        const [x, z] = axialToWorld(t.q, t.r, tileSize);
        const topY = (t.h ?? 0) * heightScale;
        const centerY = topY + thickness / 2; 
        return (
          <RigidBody type="fixed" colliders={false} key={i} position={[x, centerY, z]} >
            <CuboidCollider args={[tileSize * 0.95 / 2, thickness / 2, tileSize * 0.95 / 2]} />
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[tileSize * 0.95, tileSize * 0.95, thickness, 6]} />
              <meshStandardMaterial color={t.color} />
            </mesh>
          </RigidBody>
        );
      })}
    </group>
  );
}