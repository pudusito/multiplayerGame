import { ContactShadows, useCursor } from "@react-three/drei";
import { useState, useRef , useEffect, Suspense } from "react";
import { useAtom } from "jotai";

import { Ground } from "./terrain/Ground";
import { Map } from "./terrain/Map";
import { Model } from "./character/AnimatedWoman";
import { characterAtom, myIdAtom, mapAtom } from "./conection/SocketConnection";
import { usePlayerInput } from "./character/Movement";
import { ThirdPersonCamera } from "./character/CameraControl";
import Item from "./items/items.jsx";

export const Experience = () => {
  usePlayerInput(); // Captura WASD

  const [characters] = useAtom(characterAtom);
  const [myId] = useAtom(myIdAtom);
  const [map] = useAtom(mapAtom);
  
  const playerRef = useRef(null);

  useEffect(() => {
    console.log('Conectado con el id:', myId);
  }, [myId]);

  const [onFloor, _setOnFloor] = useState(false);
  useCursor(onFloor);

  return (
    <>
    
      <ThirdPersonCamera playerRef={playerRef} />
      <color attach="background" args={["#8b8b8b"]} />
      <directionalLight intensity={1} position={[25, 18, -25]} castShadow />
      <ambientLight intensity={1} />

      <Ground map={map} />
      {/* <Map />  */}
      
      {map.items.map((item, idx) => (
          <Item key={`${item.name}-${idx}`} item={item} />
        ))
      }
      {characters.map((char) => {
        const rotationY = Number.isFinite(char.rotation) ? char.rotation : 0;// Usar SIEMPRE la rotación mantenida por el servidor

        return (
          <group key={char.id} 
                 position={char.position} 
                 rotation={[0, rotationY, 0]} 
                 ref={(char.id) === (myId) ? playerRef : undefined}>
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