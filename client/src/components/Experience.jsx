import { ContactShadows, OrbitControls, useCursor } from "@react-three/drei";
import { useState, useRef , useEffect } from "react";
import { useAtom } from "jotai";

import { Ground } from "./terrain/Ground";
import { Map } from "./terrain/Map";
import { Model } from "./character/AnimatedWoman";
import { characterAtom, myIdAtom } from "./conection/SocketConnection";
import { usePlayerInput } from "./character/Movement";
import { ThirdPersonCamera } from "./character/CameraControl";

export const Experience = () => {
  usePlayerInput(); // Captura WASD

  const [characters] = useAtom(characterAtom);

  const [myId] = useAtom(myIdAtom);
  const playerRef = useRef(null);

  useEffect(() => {
    console.log('[Experience] myId:', myId, 'characters.length:', characters.length);
  }, [myId, characters.length]);

  const [onFloor, _setOnFloor] = useState(false);
  useCursor(onFloor);

  return (
    <><ThirdPersonCamera playerRef={playerRef} />
     {/*  <OrbitControls enablePan enableZoom enableRotate /> */}
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

      <Ground />
      {/* <Map /> */}

      {characters.map((char) => {
        // Usar SIEMPRE la rotación mantenida por el servidor
        const rotationY = Number.isFinite(char.rotation) ? char.rotation : 0;

        return (
          <group key={char.id} 
                 position={char.position} 
                 rotation={[0, rotationY, 0]} 
                 ref={String(char.id) === String(myId) ? playerRef : undefined}>
            <Model
              hairColor={char.hairColor}
              topColor={char.topColor}
              bottomColor={char.bottomColor}
              shoeColor={char.shoeColor}
              animation={char.animation}
            />
          </group>
        );
      })}
    </>
  );
};