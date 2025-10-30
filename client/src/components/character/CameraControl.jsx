import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export function ThirdPersonCamera({
  playerRef,
  targetRef,
  follow = true,
  offset = [0, 30, -6],
  lookAtOffset = [0, 1.2, 0],
  positionLerp = 0.12,
  rotationLerp = 0.12,
  enableZoom = true,
  minDistance = 2,
  maxDistance = 30,
  zoomSpeed = 0.5,
  globalYaw = -Math.PI / 4,
  pitch = Math.PI / 5.5,
  toggleKey = "c",
}) {
  const actualTargetRef = targetRef || playerRef;
  const camera = useThree((s) => s.camera);
  const orbitRef = useRef(null);

  const desiredPosition = useRef(new THREE.Vector3());
  const desiredLookAt = useRef(new THREE.Vector3());
  const tmpVector = useRef(new THREE.Vector3());
  const fixedY = useRef(null);

  const [isFollowing, setIsFollowing] = useState(follow);
  useEffect(() => setIsFollowing(follow), [follow]);

  // exponer estado para que Ground u otros componentes puedan consultarlo
  useEffect(() => {
    window.__cameraIsFollowing = isFollowing;
  }, [isFollowing]);

  const distanceRef = useRef(Math.abs(offset[2] || -6));

  const cameraQuat = useRef(new THREE.Quaternion());
  useEffect(() => {
    cameraQuat.current.setFromEuler(new THREE.Euler(-pitch, globalYaw, 0, "YXZ"));
  }, [globalYaw, pitch]);

  useEffect(() => {
    distanceRef.current = Math.abs(offset[2] || -6);
  }, [offset]);

  // wheel zoom modifies distanceRef (used by follow offset); OrbitControls handles zoom in free mode
  useEffect(() => {
    if (!enableZoom) return;
    const onWheel = (e) => {
      const delta = Math.sign(e.deltaY) * zoomSpeed;
      distanceRef.current = THREE.MathUtils.clamp(
        distanceRef.current + delta,
        minDistance,
        maxDistance
      );
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [enableZoom, zoomSpeed, minDistance, maxDistance]);

  // toggle key: actualiza estado local, expone variable global y lanza evento custom
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() === String(toggleKey).toLowerCase()) {
        setIsFollowing((prev) => {
          const next = !prev;
          window.__cameraIsFollowing = next;
          window.dispatchEvent(new CustomEvent("cameraModeChanged", { detail: { isFollowing: next } }));
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleKey]);

  // al cambiar a modo libre: centramos el pivot de OrbitControls sobre el personaje
  // NO sobrescribimos camera.position para conservar la última posición visible
  useEffect(() => {
    if (!orbitRef.current) return;

    if (!isFollowing && actualTargetRef?.current) {
      actualTargetRef.current.getWorldPosition(tmpVector.current);

      const behindZ = -Math.abs(distanceRef.current);
      const rawOffset = new THREE.Vector3(offset[0], 0, behindZ).applyQuaternion(cameraQuat.current);
      const y = tmpVector.current.y + offset[1];

      desiredPosition.current.set(
        tmpVector.current.x + rawOffset.x,
        y,
        tmpVector.current.z + rawOffset.z
      );

      desiredLookAt.current.set(
        tmpVector.current.x + lookAtOffset[0],
        tmpVector.current.y + lookAtOffset[1],
        tmpVector.current.z + lookAtOffset[2]
      );

      // solo colocamos el pivot/target del OrbitControls para que las rotaciones
      // libres ocurran alrededor del personaje; la cámara se mantiene en su última transform
      orbitRef.current.target.copy(desiredLookAt.current);
      orbitRef.current.update();
      orbitRef.current.enabled = true;
      return;
    }

    // volver a follow: desactivar orbit para que la lógica de follow controle la cámara
    if (isFollowing) {
      orbitRef.current.enabled = false;
    }
  }, [isFollowing, actualTargetRef, cameraQuat, offset, lookAtOffset]);

  useFrame(() => {
    if (!actualTargetRef?.current) return;

    // obtener posición del personaje
    actualTargetRef.current.getWorldPosition(tmpVector.current);

    const behindZ = -Math.abs(distanceRef.current);
    const rawOffset = new THREE.Vector3(offset[0], 0, behindZ).applyQuaternion(cameraQuat.current);

    if (fixedY.current === null) fixedY.current = tmpVector.current.y + offset[1];
    fixedY.current = THREE.MathUtils.lerp(fixedY.current, tmpVector.current.y + offset[1], 0.05);

    desiredPosition.current.set(
      tmpVector.current.x + rawOffset.x,
      fixedY.current,
      tmpVector.current.z + rawOffset.z
    );

    desiredLookAt.current.set(
      tmpVector.current.x + lookAtOffset[0],
      tmpVector.current.y + lookAtOffset[1],
      tmpVector.current.z + lookAtOffset[2]
    );

    if (isFollowing) {
      // follow mode: lerp hacia desired position/lookAt
      if (orbitRef.current) orbitRef.current.enabled = false;

      camera.position.lerp(desiredPosition.current, positionLerp);

      const m = new THREE.Matrix4().lookAt(camera.position, desiredLookAt.current, camera.up);
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m);
      camera.quaternion.slerp(targetQuat, rotationLerp);
      return;
    }

    // free mode: mantener pivot centrado (suavizado) y dejar OrbitControls manejar la cámara
    if (orbitRef.current) {
      orbitRef.current.target.lerp(desiredLookAt.current, 0.35);
      orbitRef.current.update();
      orbitRef.current.enabled = true;
    }
  });

  // sincronizar enabled por si OrbitControls se crea más tarde
  useEffect(() => {
    if (orbitRef.current) orbitRef.current.enabled = !isFollowing;
  }, [isFollowing]);

  return (
    <OrbitControls
      ref={orbitRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enabled={!isFollowing}
      minDistance={minDistance}
      maxDistance={maxDistance}
    />
  );
}

export default ThirdPersonCamera;