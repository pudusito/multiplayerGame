// este archivo contiene la logica visual de las lineas de colision ShapeCast-Raycast
// utilizamos Shapecast

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function RayoColiciones({ a = new THREE.Vector3(), b = new THREE.Vector3(), color = 0xff0000 }) {
  const lineRef = useRef();
  useEffect(() => {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(6);
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geom, mat);
    lineRef.current = line;
  }, []);

  useFrame(() => {
    if (!lineRef.current) return;
    const pos = lineRef.current.geometry.attributes.position.array;
    pos[0] = a.x; pos[1] = a.y; pos[2] = a.z;
    pos[3] = b.x; pos[4] = b.y; pos[5] = b.z;
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return lineRef.current ? <primitive object={lineRef.current} /> : null;
}