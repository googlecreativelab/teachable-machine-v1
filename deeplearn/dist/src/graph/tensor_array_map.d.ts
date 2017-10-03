import { NDArrayMath } from '../math/math';
import { NDArray } from '../math/ndarray';
import { Tensor } from './graph';
export declare abstract class TensorArrayMapBase {
    get(tensor: Tensor, skipChecks?: boolean): NDArray;
    delete(tensor: Tensor): void;
    nullify(tensor: Tensor): void;
    disposeArray(tensor: Tensor): void;
    size(): number;
    dispose(): void;
    hasNullArray(tensor: Tensor): boolean;
    protected dict: {
        [tensorID: number]: NDArray | null;
    };
}
export declare class TensorArrayMap extends TensorArrayMapBase {
    set(tensor: Tensor, array: NDArray | null): void;
}
export declare class SummedTensorArrayMap extends TensorArrayMapBase {
    private math;
    constructor(math: NDArrayMath);
    add(tensor: Tensor, array: NDArray): void;
}
