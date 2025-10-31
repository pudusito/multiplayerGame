import { useMemo } from 'react';
import { useGLTF} from "@react-three/drei";
import { useAtom } from 'jotai';
import { mapAtom } from "../conection/SocketConnection";
import { SkeletonUtils } from 'three-stdlib';

export const Items = ({ item }) => {

    const {name, size, gridPosition, rotation } = item; // Desestructurar las propiedades del item

    const [map] = useAtom(mapAtom);

    const { scene } = useGLTF(`/models/items/${name}.glb`);

    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

    return <primitive object={clone} position={[
        size[0] / map.gridDivision / 2 + gridPosition[0] / map.gridDivision,
        0,
        size[1] / map.gridDivision / 2 + gridPosition[1] / map.gridDivision
    ]}
    rotation-y={rotation || 0 * (Math.PI / 2)}
    
    />;
};

export default Items;
