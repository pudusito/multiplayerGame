import { ContactShadows, OrbitControls, useCursor } from "@react-three/drei";
import { useState } from "react";
import { useAtom } from "jotai";
import { Physics } from "@react-three/rapier";

import { Ground } from "./terrain/Ground";
import { Map } from "./terrain/Map";
import { Model } from "./character/AnimatedWoman";
import { characterAtom } from "./conection/SocketManager";
import { usePlayerInput } from "./character/Movement";

export const Experience = () => {
  usePlayerInput(); // Captura WASD

  const [characters] = useAtom(characterAtom);
  const [onFloor, _setOnFloor] = useState(false);
  useCursor(onFloor);

  return (
    <>
      <OrbitControls enablePan enableZoom enableRotate />
      <color attach="background" args={["#8b8b8b"]} />
      <directionalLight
        position={[25, 18, -25]}
        intensity={1}
        castShadow
        shadow-camera-near={0}
        shadow-camera-far={100}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-bias={-0.0001}
        shadow-radius={2}
        shadow-focus={1}
      />
      <ambientLight intensity={1} />
      <ContactShadows blur={2} />

      <Physics gravity={[0, -9.81, 0]}>
        <Ground />
{/*         <Map /> */}

        {characters.map((char) => {
          // Calcular rotación local
          let rotationY = 0;

          if (char.input?.target) {
            const dx = char.input.target[0] - char.position[0];
            const dz = char.input.target[2] - char.position[2];
            rotationY = Math.atan2(dx, dz);
          } else {
            const { forward, backward, left, right } = char.input || {};
            const dx = (right ? 1 : 0) - (left ? 1 : 0);
            const dz = (backward ? 1 : 0) - (forward ? 1 : 0);
            if (dx !== 0 || dz !== 0) rotationY = Math.atan2(dx, dz);
          }

          return (
            <group key={char.id} position={char.position}>
              <Model
                hairColor={char.hairColor}
                topColor={char.topColor}
                bottomColor={char.bottomColor}
                shoeColor={char.shoeColor}
                animation={char.animation}
                rotationY={rotationY} // <-- pasamos rotación local
              />
            </group>
          );
        })}
      </Physics>
    </>
  );
};
