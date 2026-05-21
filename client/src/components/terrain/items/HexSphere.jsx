import React, { useMemo } from "react";
import * as THREE from "three";

// ============================================================================
// QUANTIZED VERTEX MERGE
// ============================================================================

function quantizedMerge(vertices, precision = 100000) {

  const map = new Map();

  const unique = [];
  const remap = [];

  vertices.forEach((v, i) => {

    const key =
      `${Math.round(v.x * precision)},` +
      `${Math.round(v.y * precision)},` +
      `${Math.round(v.z * precision)}`;

    if (!map.has(key)) {

      map.set(key, unique.length);

      unique.push(v.clone());

    }

    remap[i] = map.get(key);

  });

  return {
    unique,
    remap,
  };
}

// ============================================================================
// BUILD HEXSPHERE
// ============================================================================

function buildIcoDual(radius = 10, detail = 3) {

  const ico = new THREE.IcosahedronGeometry(radius, detail);

  const posAttr = ico.attributes.position;

  // ==========================================================================
  // RAW VERTICES
  // ==========================================================================

  const rawVertices = [];

  for (let i = 0; i < posAttr.count; i++) {

    rawVertices.push(
      new THREE.Vector3()
        .fromBufferAttribute(posAttr, i)
    );

  }

  // ==========================================================================
  // QUANTIZED MERGE
  // ==========================================================================

  const {
    unique: vertices,
    remap,
  } = quantizedMerge(rawVertices);

  // ==========================================================================
  // TRIANGLES
  // ==========================================================================

  const faces = [];

  for (let i = 0; i < rawVertices.length; i += 3) {

    faces.push([
      remap[i],
      remap[i + 1],
      remap[i + 2],
    ]);

  }

  // ==========================================================================
  // FACE CENTERS
  // ==========================================================================

  const faceCenters = faces.map((f) => {

    const c = new THREE.Vector3();

    c.add(vertices[f[0]]);
    c.add(vertices[f[1]]);
    c.add(vertices[f[2]]);

    return c
      .divideScalar(3)
      .normalize()
      .multiplyScalar(radius);

  });

  // ==========================================================================
  // VERTEX -> FACES
  // ==========================================================================

  const vertToFaces = Array(vertices.length)
    .fill()
    .map(() => []);

  faces.forEach((f, fi) => {

    vertToFaces[f[0]].push(fi);
    vertToFaces[f[1]].push(fi);
    vertToFaces[f[2]].push(fi);

  });

  // ==========================================================================
  // POLYGONS
  // ==========================================================================

  const polygons = [];

  for (let v = 0; v < vertices.length; v++) {

    const faceIndices = vertToFaces[v];

    // EXACTAMENTE 5 o 6
    if (
      faceIndices.length !== 5 &&
      faceIndices.length !== 6
    ) continue;

    const vPos = vertices[v]
      .clone()
      .normalize()
      .multiplyScalar(radius);

    const normal = vPos.clone().normalize();

    // ==========================================================================
    // LOCAL BASIS
    // ==========================================================================

    let tangent = new THREE.Vector3(1, 0, 0);

    if (Math.abs(normal.dot(tangent)) > 0.99) {
      tangent.set(0, 1, 0);
    }

    const e1 = tangent
      .clone()
      .sub(
        normal.clone().multiplyScalar(
          tangent.dot(normal)
        )
      )
      .normalize();

    const e2 = normal
      .clone()
      .cross(e1)
      .normalize();

    // ==========================================================================
    // SORT
    // ==========================================================================

    const ordered = faceIndices
      .map((fi) => {

        const center = faceCenters[fi];

        const dir = center
          .clone()
          .sub(vPos)
          .normalize();

        const angle = Math.atan2(
          dir.dot(e2),
          dir.dot(e1)
        );

        return {
          center,
          angle,
        };

      })
      .sort((a, b) => a.angle - b.angle);

    // ==========================================================================
    // TRIANGULATE
    // ==========================================================================

    const positions = [];

    for (let i = 1; i < ordered.length - 1; i++) {

      const a = ordered[0].center;
      const b = ordered[i].center;
      const c = ordered[i + 1].center;

      positions.push(
        a.x, a.y, a.z,
        b.x, b.y, b.z,
        c.x, c.y, c.z
      );

    }

    // ==========================================================================
    // GEOMETRY
    // ==========================================================================

    const g = new THREE.BufferGeometry();

    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        positions,
        3
      )
    );

    g.computeVertexNormals();

    polygons.push({
      geometry: g,
      sides: ordered.length,
    });

  }

  return polygons;
}

// ============================================================================
// COMPONENT
// ============================================================================

function HexSphere({
  radius = 10,
  detail = 3,
  color = "#ff0000",
  position = [0, 0, 0],
  wireframe = false,
}) {

  const polygons = useMemo(() => {
    return buildIcoDual(radius, detail);
  }, [radius, detail]);

  return (
    <group position={position}>
      {polygons.map((p, i) => (
        <mesh
          key={i}
          geometry={p.geometry}
        >
          <meshStandardMaterial
            color={color}
            wireframe={wireframe}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default HexSphere;
