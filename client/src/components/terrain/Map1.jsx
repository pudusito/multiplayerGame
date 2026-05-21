import ClassZone from "../character/Classes.jsx";
import Cube from "../terrain/items/Cube.jsx";
import GroundBase from "./GroundBase.jsx";
import Sphere from "../terrain/items/Sphere.jsx";
import HexSphere from "../terrain/items/HexSphere.jsx";
import { RigidBody } from "@react-three/rapier";

export const Map1 = ({ map, terrainRef = null }) => {
  if (!map) return null;

  return (
    <>
      <GroundBase
        map={map}
        baseProps={{ position: [0, 0, 0] } }
        terrainRef={terrainRef}
      />
      {map?.classZones?.map((zone) => ( <ClassZone key={`class-${zone.id}`} zone={zone} /> ) ) }
      <Cube position={[22, 2, 10]} />
      <Sphere position={[-22, 2, -10]} />
    
      <RigidBody type="fixed" colliders="trimesh" position={[0, 6, 0]}>
        <HexSphere radius={50} detail={5} color="#ff0000" position={[0, 0, 0]} wireframe={false} />
      </RigidBody>
    </>
  );
};

export default Map1;