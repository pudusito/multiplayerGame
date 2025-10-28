import { RigidBody } from "@react-three/rapier";
import { useState } from "react";
import { socket } from "../conection/SocketManager";

export const Ground = ({ size = [50, 1, 50], position = [0, -1, 0] }) => {
  const [onFloor, setOnFloor] = useState(false);

  const handleClick = (e) => {
    const { x, z } = e.point;
    socket.emit("move", {
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false,
      target: [x, 0, z], // Movimiento hacia click
    });
  };

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh
        position={position}
        receiveShadow
        onClick={handleClick}
        onPointerEnter={() => setOnFloor(true)}
        onPointerLeave={() => setOnFloor(false)}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial color={onFloor ? "lightgreen" : "green"} />
      </mesh>
    </RigidBody>
  );
};
