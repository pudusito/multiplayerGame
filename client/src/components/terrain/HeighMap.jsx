import { useMemo, useEffect, useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/* Fallback hook: carga heightmap desde PNG (igual que antes) */
function useHeightmap(src, scale = 1, flipY = false) {
  const [hm, setHm] = useState(null);

  useEffect(() => {
    let mounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const data = ctx.getImageData(0, 0, width, height).data;
        const heights = new Float32Array(width * height);

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const lum = (r + g + b) / 3;
            const normalized = lum / 255;
            const value = normalized * scale;
            const yy = flipY ? (height - 1 - y) : y;
            heights[yy * width + x] = value;
          }
        }

        if (mounted) setHm({ width, height, heights });
      } catch (err) {
        console.error("useHeightmap: failed to read image data", err);
        if (mounted) setHm(null);
      }
    };

    img.onerror = (err) => {
      console.error("useHeightmap: image load error", err);
      if (mounted) setHm(null);
    };

    return () => {
      mounted = false;
    };
  }, [src, scale, flipY]);

  return hm;
}

const HeightMap = ({ map, position = [0, 0, 0], terrainRef = null }) => {
  if (!map || !map.size) return null;

  const terrain = map?.terrain ?? null;
  const fallbackHm = useHeightmap("/models/maps/highmp.png", 100);

  const hm = useMemo(() => {
    if (terrain?.width && terrain?.height && terrain?.heights?.length) {
      return {
        width: terrain.width,
        height: terrain.height,
        heights:
          terrain.heights instanceof Float32Array
            ? terrain.heights
            : Float32Array.from(terrain.heights),
      };
    }
    return fallbackHm;
  }, [terrain, fallbackHm]);

  const rock = useTexture("/models/maps/rock.jpg");
  rock.wrapS = rock.wrapT = THREE.RepeatWrapping;

  const STEP = Math.max(1, terrain?.step ?? 8);
  const HEIGHT_THRESHOLD = terrain?.heightThreshold ?? 10;

  const terrainSize = terrain?.terrainSize ?? 2;
  const terrainHeight = terrain?.terrainHeight ?? -10;
  const terrainHeightScale = terrain?.terrainHeightScale ?? 2;
  const terrainPosition = terrain?.position ?? [0, 0, 0];

  rock.repeat.set((map.size[0] * terrainSize) / 10, (map.size[1] * terrainSize) / 10);

  const terrainGeometry = useMemo(() => {
    if (!hm) return null;

    const widthSegments = Math.max(1, Math.floor((hm.width - 1) / STEP));
    const heightSegments = Math.max(1, Math.floor((hm.height - 1) / STEP));

    const geom = new THREE.PlaneGeometry(
      map.size[0] * terrainSize,
      map.size[1] * terrainSize,
      widthSegments,
      heightSegments
    );

    const posAttr = geom.attributes.position;
    const posArray = posAttr.array;
    const colors = [];

    for (let y = 0; y <= heightSegments; y++) {
      for (let x = 0; x <= widthSegments; x++) {
        const i = y * (widthSegments + 1) + x;

        const hx = Math.min(x * STEP, hm.width - 1);
        const hy = Math.min(y * STEP, hm.height - 1);
        const hi = hy * hm.width + hx;

        const heightVal = hm.heights[hi] ?? 0;
        const finalHeight = heightVal * terrainHeightScale + terrainHeight;

        posArray[i * 3 + 2] = finalHeight;

        if (finalHeight < HEIGHT_THRESHOLD) {
          colors.push(0, 1, 0);
        } else {
          colors.push(1, 1, 1);
        }
      }
    }

    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    posAttr.needsUpdate = true;
    geom.computeVertexNormals();
    return geom;
  }, [hm, map.size, STEP, terrainSize, terrainHeight, terrainHeightScale]);

  if (!terrainGeometry) return null;

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh
        ref={terrainRef}
        position={[
          position[0] + terrainPosition[0],
          position[1] + terrainPosition[1],
          position[2] + terrainPosition[2],
        ]}
        rotation-x={-Math.PI / 2}
        geometry={terrainGeometry}
      >
        <meshStandardMaterial map={rock} vertexColors roughness={1} metalness={0} />
      </mesh>
    </RigidBody>
  );
};

export default HeightMap;