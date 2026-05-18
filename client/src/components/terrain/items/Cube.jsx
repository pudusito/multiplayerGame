import React from "react";
import { RigidBody } from "@react-three/rapier";


export default function Cube({ position=[0,0,0], color="orange", size=[1,1,1] }) {

  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>

        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} />
        </mesh>

    </RigidBody>
  );
}