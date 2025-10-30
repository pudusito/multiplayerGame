import { RigidBody } from "@react-three/rapier";
import { useState, useEffect } from "react";
import { Socket } from "../conection/SocketConnection";

export const Ground = ({ size = [50, 1, 50], position = [0, -1, 0] }) => {
  const [onFloor, setOnFloor] = useState(false);
  // inicializar leyendo la variable global (no provoca side-effect)
  const [_cameraFollow, setCameraFollow] = useState(() => window.__cameraIsFollowing ?? true);

  useEffect(() => {
    const handler = (e) => {
      setCameraFollow(Boolean(e.detail?.isFollowing));
    };
    window.addEventListener("cameraModeChanged", handler);
    return () => window.removeEventListener("cameraModeChanged", handler);
  }, []);

  const handleClick = (e) => {
    // Si la cámara está en modo libre (isFollowing === false) ignoramos clicks de movimiento
    if (window.__cameraIsFollowing === false) return;

    const { x, z } = e.point;
    Socket.emit("move", {
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

export default Ground;