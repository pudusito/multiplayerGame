import { useGLTF , useAnimations} from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useEffect, useRef } from 'react';

/**
 * Wrapper Map: no usa hooks aquí, evita errores si no hay modelo.
 * Si model es falsy, devuelve null (no intenta cargar).
 */
export const Map = ({ model = '/models/maps/map.glb', ...props }) => {

  const { scene, animations } = useGLTF(model);
  const group = useRef();
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    if (actions && animations?.length > 0) {
      const action = actions[animations[0].name];
      if (action) action.play();
    }
  }, [actions, animations]);

  if (!scene) return null;

  return (
    <group ref={group} {...props}>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={scene} />
      </RigidBody>
    </group>
  );
};
