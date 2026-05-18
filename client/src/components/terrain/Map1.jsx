import ClassZone from "../character/Classes.jsx";
import Cube from "../terrain/items/Cube.jsx";
import GroundBase from "./GroundBase.jsx";
import Sphere from "../terrain/items/Sphere.jsx";

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
    </>
  );
};

export default Map1;