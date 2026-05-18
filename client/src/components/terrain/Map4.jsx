import React from "react";
import GroundBase from "./GroundBase.jsx";

export const Map4 = ({ map }) => {
  return (
    <>
      <GroundBase
        map={map}
        baseProps={{ position: [0, 0, 0] }}
      />
    </>
  );
};

export default Map4;