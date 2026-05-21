import React, { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";


export const GroundBase = ({ map, baseProps = {}, terrainRef = null }) => {
  if (!map) return null;

  const position = baseProps.position ?? [0, 0, 0];
  
  // traemos la config del servidor para el groundbase.
  const groundBaseConfig = map?.groundbase;
  // Si el servidor puso explícitamente `groundbase: None`, no renderizar nada. Si no se definió, usar valores por defecto.
  if (groundBaseConfig === null ) return null;

  const isArrayGroundBase = Array.isArray(groundBaseConfig);
  const GroundBaseObj = groundBaseConfig != null && !isArrayGroundBase && typeof groundBaseConfig === "object" ? groundBaseConfig : {};

  let baseSize = isArrayGroundBase ? GroundBase[0] ?? 2 : GroundBaseObj.baseSize ?? map?.terrain?.baseSize;
  let baseHeight = isArrayGroundBase ? GroundBase[1] ?? 0 : GroundBaseObj.baseHeight ?? map?.terrain?.baseHeight;
  const texturePath = baseProps.texture ?? GroundBaseObj.texture ?? map?.groundTexture ?? "/models/maps/grass.jpg";

  baseSize = baseProps.baseSize ?? baseSize;
  baseHeight = baseProps.baseHeight ?? baseHeight;

  const transparentFlag = baseProps.transparent ?? GroundBaseObj.transparent ?? (map?.model === null);
  const opacity = baseProps.opacity ?? GroundBaseObj.opacity ?? (transparentFlag ? 0 : 1);

  const tex = useTexture(texturePath);
  const grass = Array.isArray(tex) ? tex[0] : tex;
  if (grass) {
    grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
    if (grass.repeat) {
      grass.repeat.set((map.size[0] * baseSize) / 10, (map.size[1] * baseSize) / 10);
    }
  }
  
  const gridSize = Math.max(map.size[0] * baseSize, map.size[1] * baseSize);

  useEffect(() => {
    if (!terrainRef?.current) return;
    const geo = terrainRef.current.geometry;
    if (geo?.computeBoundsTree) geo.computeBoundsTree();
    return () => {
      if (geo?.disposeBoundsTree) geo.disposeBoundsTree();
    };
  }, [terrainRef]);

  return (
    <>   
    <RigidBody type="fixed" colliders="hull">
      <mesh ref={terrainRef} position={[position[0], baseHeight, position[2]]} rotation-x={-Math.PI / 2}>
    
          <planeGeometry args={[map.size[0] * baseSize, map.size[1] * baseSize]} />
          <meshStandardMaterial map={grass} transparent={transparentFlag} opacity={opacity} depthWrite={!transparentFlag} />
    
      </mesh>
    </RigidBody>

    {/* genera una grilla para ayudar a visualizar el terreno */}
    <gridHelper
      args={[gridSize, 50, '#ff0000', '#000000']}
      position={[0, baseHeight + 0.01, 0]}
    />
    </>
  );
};

export default GroundBase;