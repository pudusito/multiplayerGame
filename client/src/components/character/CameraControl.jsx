import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Cámara en tercera persona que sigue a playerRef (solo local por cliente)
export function ThirdPersonCamera({
  playerRef,            // referencia al group del jugador local (contiene la rotación global del jugador)
  follow = true,        // si false, expone OrbitControls (debug)
  offset = [0, 2, -5],  // desplazamiento base [x, y, z] relativo al jugador
  lookAtOffset = [0, 1, 0], // ajuste de mirada
  positionLerp = 0.12,  // suavizado de posición de cámara
  rotationLerp = 0.12,  // suavizado de rotación de cámara
  enableZoom = true,    // zoom con rueda
  minDistance = 2,
  maxDistance = 15,
  zoomSpeed = 0.5,
}) {
  // 1) Cámara activa del canvas (local al cliente)
  const camera = useThree((state) => state.camera);

  // 2) Refs para cálculos e intermediarios (evitan GC y jitter)
  const orbitRef = useRef();
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredLookAt = useRef(new THREE.Vector3());
  const distanceRef = useRef(Math.abs(offset[2] || -5));
  const fixedY = useRef(null);
  const tmpVector = useRef(new THREE.Vector3());
  const tmpQuat = useRef(new THREE.Quaternion());
  const yawQuat = useRef(new THREE.Quaternion());
  const tmpOffset = useRef(new THREE.Vector3());

  // 3) Ajusta distancia inicial si cambia el offset
  useEffect(() => {
    distanceRef.current = Math.abs(offset[2] || -5);
  }, [offset]);

  // 4) Zoom con rueda (clamp entre min y max)
  useEffect(() => {
    if (!enableZoom) return;
    const onWheel = (e) => {
      const delta = Math.sign(e.deltaY) * zoomSpeed;
      distanceRef.current = THREE.MathUtils.clamp(
        distanceRef.current + delta,
        Math.abs(minDistance),
        Math.abs(maxDistance)
      );
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [enableZoom, zoomSpeed, minDistance, maxDistance]);

  // 5) Seguir al jugador local cada frame
  useFrame(() => {
    if (!follow || !playerRef?.current) return;

    // Posición del jugador (mundo)
    playerRef.current.getWorldPosition(tmpVector.current);

    // Solo yaw del jugador (ignoramos pitch/roll)
    playerRef.current.getWorldQuaternion(tmpQuat.current);
    yawQuat.current.copy(tmpQuat.current);
    yawQuat.current.x = 0;
    yawQuat.current.z = 0;
    yawQuat.current.normalize();

    // Altura suavizada (reduce jitter al saltar)
    if (fixedY.current === null) fixedY.current = tmpVector.current.y + offset[1];
    fixedY.current = THREE.MathUtils.lerp(
      fixedY.current,
      tmpVector.current.y + offset[1],
      0.06
    );

    // Offset detrás del jugador según yaw y distancia (zoom)
    tmpOffset.current.set(offset[0], 0, -Math.abs(distanceRef.current));
    tmpOffset.current.applyQuaternion(yawQuat.current);

    // Posición objetivo de la cámara
    desiredPosition.current.set(
      tmpVector.current.x + tmpOffset.current.x,
      fixedY.current,
      tmpVector.current.z + tmpOffset.current.z
    );

    // Punto objetivo al que mirar (jugador + lookAtOffset)
    desiredLookAt.current.set(
      tmpVector.current.x + lookAtOffset[0],
      tmpVector.current.y + lookAtOffset[1],
      tmpVector.current.z + lookAtOffset[2]
    );

    // Interpolar posición
    camera.position.lerp(desiredPosition.current, positionLerp);

    // Interpolar orientación hacia el punto objetivo
    const m = new THREE.Matrix4().lookAt(
      camera.position,
      desiredLookAt.current,
      camera.up
    );
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m);
    camera.quaternion.slerp(targetQuat, rotationLerp);
  });

  // 6) OrbitControls solo si follow=false (debug)
  useEffect(() => {
    if (orbitRef.current) orbitRef.current.enabled = !follow;
  }, [follow]);

  // 7) Si seguimos al jugador, no renderizamos controles
  return !follow ? (
    <OrbitControls ref={orbitRef} enablePan enableZoom enableRotate />
  ) : null;
}