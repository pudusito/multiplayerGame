import * as THREE from "three";

export function generateLODGeometries({ heightData, xStart=0, zStart=0, tileSize={width:10,depth:10}, gridResolution=64, levels=3 }) {
  const geometries = [];
  for (let level = 0; level < levels; level++) {
    const step = 1 << level;
    const segX = Math.floor((gridResolution - 1) / step);
    const segZ = Math.floor((gridResolution - 1) / step);
    const geom = new THREE.PlaneGeometry(tileSize.width, tileSize.depth, segX, segZ);

    geom.rotateX(-Math.PI / 2);
    const pos = geom.attributes.position;
    let idx = 0;
    for (let z = 0; z <= segZ; z++) {
      for (let x = 0; x <= segX; x++) {
        const worldX = xStart + x * step;
        const worldZ = zStart + z * step;
        const h = typeof heightData === "function" ? heightData(worldX, worldZ) : (heightData?.[worldZ]?.[worldX] ?? 0);
        pos.setY(idx, h);
        idx++;
      }
    }
    geom.computeVertexNormals();
    geometries.push(geom);
  }
  return geometries;
}