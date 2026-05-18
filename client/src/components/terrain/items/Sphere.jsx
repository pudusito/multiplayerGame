import React from "react";
import { RigidBody } from "@react-three/rapier";


export default function Sphere({ position=[0,0,0], color="orange", size=[1,32,32] }) {

  return (
    <RigidBody type="dynamic" colliders="ball" position={position}>

        <mesh castShadow receiveShadow>
          <sphereGeometry args={size} />
          <meshStandardMaterial color={color} size={[size]} />
        </mesh>

    </RigidBody>
  );
}