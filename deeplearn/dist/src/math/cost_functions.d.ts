import { NDArrayMath } from './math';
import { NDArray } from './ndarray';
export interface ElementWiseCostFunction {
    cost<T extends NDArray>(math: NDArrayMath, x1: T, x2: T): T;
    der<T extends NDArray>(math: NDArrayMath, x1: T, x2: T): T;
    dispose(): void;
}
export declare class SquareCostFunc implements ElementWiseCostFunction {
    private halfOne;
    cost<T extends NDArray>(math: NDArrayMath, x1: T, x2: T): T;
    der<T extends NDArray>(math: NDArrayMath, x1: T, x2: T): T;
    dispose(): void;
}
