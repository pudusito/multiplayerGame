/* Comparación REAL
Sistema	Draw Calls	Triángulos	Escala Bien
Mesh por voxel	❌ horrible	❌ horrible	❌
InstancedMesh	✅ excelente	❌ alto	⚠️ medio
Greedy Meshing	✅ excelente	✅ muy bajo	✅
Greedy + BVH	✅ excelente	✅ excelente	🚀 */

/* BVH - Bounding Volume Hierarchy */
// es una estructura de datos que organiza los objetos en una escena 3D en una jerarquía de volúmenes delimitadores (bounding volumes), lo que permite acelerar las operaciones de intersección, como el raycasting o la detección de colisiones. 
// En lugar de comprobar cada triángulo individualmente, el BVH permite descartar grandes grupos de triángulos que no intersectan con el rayo o el objeto en cuestión, lo que mejora significativamente el rendimiento.
/* npm install three-mesh-bvh */

import * as THREE from "three";

import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";

THREE.Mesh.prototype.raycast =
  acceleratedRaycast;

THREE.BufferGeometry.prototype.computeBoundsTree =
  computeBoundsTree;

THREE.BufferGeometry.prototype.disposeBoundsTree =
  disposeBoundsTree;


