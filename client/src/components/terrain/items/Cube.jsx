import React from "react";
import { RigidBody } from "@react-three/rapier";

// this is a local cube for the moment, we need to reference on the server for multiplayer
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






/* crea la logica de colicion y luego dale lineas visuales para poder hacer debugging, estas las puedo activar y desactivar con un true o false desde el servidor, ademas, editar el tamaño de la distancia para la colicion de mi personaje, en eje y si toca la punta isgrounded sera true, y en eje x si toca la punta mi personaje se detendra, ej: colicion con pared, dame el codigo simple y corregido */