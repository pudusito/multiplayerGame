import { useEffect, useRef, useState } from "react";
import { Socket } from "../conection/SocketConnection";

export const usePlayerInput = () => {
  const input = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    target: null,
  });


  const [animation, setAnimation] = useState("CharacterArmature|Idle");
  const [rotationY, setRotationY] = useState(0);

  const WALK_SPEED = 0.05;
  const RUN_SPEED = 0.1;
  const JUMP_SPEED = 0.15;
  const GRAVITY = -0.005;
  // --- Estado de posición y rotación ---
  const positionRef = useRef([0, 0, 0]);
  const rotationRef = useRef(0);
  // --- Estado de salto ---
  const velocityY = useRef(0);
  const isGrounded = useRef(true);
  // --- Movimiento hacia click ---
  const targetRef = useRef(null);
  const movingToTarget = useRef(false);

  // Utilidad para calcular orientación deseada
  const calcRotation = () => {
    if (targetRef.current) {
      const dx = targetRef.current[0] - positionRef.current[0];
      const dz = targetRef.current[2] - positionRef.current[2];
      if (dx !== 0 || dz !== 0) return Math.atan2(dx, dz);
    }
    const mx = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);
    const mz = (input.current.backward ? 1 : 0) - (input.current.forward ? 1 : 0);
    if (mx !== 0 || mz !== 0) return Math.atan2(mx, mz);
    return rotationRef.current; // última orientación válida
  };

  // --- Captura de teclas ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      let changed = false;
      switch (e.key.toLowerCase()) {
        case "w": input.current.forward = true; changed = true; break;
        case "s": input.current.backward = true; changed = true; break;
        case "a": input.current.left = true; changed = true; break;
        case "d": input.current.right = true; changed = true; break;
        case "shift": input.current.run = true; changed = true; break;
        case " ":
          if (isGrounded.current) {
            input.current.jump = true;
            changed = true;
          }
          break;
      }

      // Emitir estado si hubo cambios
      if (changed) {
        const rot = calcRotation();
        rotationRef.current = rot;
        setRotationY(rot);
        targetRef.current = null;
        input.current.target = null;
        Socket.emit("move", { ...input.current, target: null, rotation: rot });
        movingToTarget.current = false;
      }
    };

    const handleKeyUp = (e) => {
      let changed = false;
      switch (e.key.toLowerCase()) {
        case "w": input.current.forward = false; changed = true; break;
        case "s": input.current.backward = false; changed = true; break;
        case "a": input.current.left = false; changed = true; break;
        case "d": input.current.right = false; changed = true; break;
        case "shift": input.current.run = false; changed = true; break;
        case " ": input.current.jump = false; changed = true; break;
      }
      if (changed) {
        const rot = calcRotation();
        rotationRef.current = rot;
        setRotationY(rot);
        Socket.emit("move", { ...input.current, target: null, rotation: rot });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // --- Animación ---
  useEffect(() => {
    const updateAnimation = () => {
      if (!isGrounded.current) {
        setAnimation("CharacterArmature|Jump");
        return;
      }
      const moving =
        input.current.forward ||
        input.current.backward ||
        input.current.left ||
        input.current.right ||
        movingToTarget.current;
      setAnimation(moving ? "CharacterArmature|Run" : "CharacterArmature|Idle");
    };
    const interval = setInterval(updateAnimation, 50);
    return () => clearInterval(interval);
  }, []);

  // --- Actualización de posición local (predicción opcional) ---
  const updateLocalPosition = (deltaTime) => {
    let dx = 0, dz = 0;
    const SPEED = input.current.run ? RUN_SPEED : WALK_SPEED;

    if (input.current.forward) dz -= SPEED * deltaTime;
    if (input.current.backward) dz += SPEED * deltaTime;
    if (input.current.left) dx -= SPEED * deltaTime;
    if (input.current.right) dx += SPEED * deltaTime;

    // Movimiento hacia click
    if (targetRef.current) {
      const pos = positionRef.current;
      const dirX = targetRef.current[0] - pos[0];
      const dirZ = targetRef.current[2] - pos[2];
      const dist = Math.sqrt(dirX * dirX + dirZ * dirZ);
      if (dist > 0.05) {
        dx += (dirX / dist) * SPEED * deltaTime;
        dz += (dirZ / dist) * SPEED * deltaTime;
        movingToTarget.current = true;
      } else {
        movingToTarget.current = false;
        targetRef.current = null;
        input.current.target = null;
      }
    }

    positionRef.current[0] += dx;
    positionRef.current[2] += dz;

    // --- Salto ---
    if (input.current.jump && isGrounded.current) {
      velocityY.current = JUMP_SPEED;
      isGrounded.current = false;
      input.current.jump = false; // consumimos salto
    }
    velocityY.current += GRAVITY * deltaTime;
    positionRef.current[1] += velocityY.current;

    if (positionRef.current[1] <= 0) {
      positionRef.current[1] = 0;
      velocityY.current = 0;
      isGrounded.current = true;
    }

    // --- Rotación (mantener la última si no hay input) ---
    const rot = calcRotation();
    rotationRef.current = rot;
    setRotationY(rot);

    return positionRef.current;
  };

  const moveTo = (x, z) => {
    targetRef.current = [x, 0, z];
    input.current.target = targetRef.current;
    movingToTarget.current = true;
    const rot = calcRotation();
    rotationRef.current = rot;
    setRotationY(rot);
    Socket.emit("move", { ...input.current, target: targetRef.current, rotation: rot });
  };

  return { input, animation, rotationY, updateLocalPosition, positionRef, moveTo };
};