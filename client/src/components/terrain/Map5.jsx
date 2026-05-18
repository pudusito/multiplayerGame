// client/src/components/terrain/Map5.jsx
import React from "react";
import Hexgrid from "./Chunk.jsx";
import Cube from "../terrain/items/Cube.jsx";

// componente vacio, todo lo configuramos desde el server, pero se necesita un componente para renderizar el mapa, 
// en este caso lo hacemos en experiencie para tener el control total de la escena, 
// pero se podria hacer un componente de mapa mas complejo si se quisiera agregar elementos especificos de mapa que no vengan del server, 
// como decoraciones o elementos estaticos.
// ej: si quisieramos agregar un lago con agua animada, lo haríamos aquí, 
// y el server solo se encargaría de enviar la información de los tiles que forman el lago,
// pero el renderizado del lago y su animación estaría en este componente.
// eso permite separar la lógica de datos (server) de la lógica de presentación (client) y 
// tener un control más fino sobre cada aspecto del juego.




// una vez renderizado el chunk se lo pasamos a map5 para que lo lleve a experiencia y asi lo muestre en canvas
export const Map5 = ({ map }) => {
  if (!map) return null;

  return (
    <>
      <Hexgrid map={map} />
      <Cube position={[0, 0, 0]} />
    </>
  );
};

export default Map5;