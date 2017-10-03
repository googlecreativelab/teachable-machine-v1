import { NDArrayMath } from './math';
import { NDArray } from './ndarray';
export interface ActivationFunction {
    output<T extends NDArray>(math: NDArrayMath, input: T): T;
    der<T extends NDArray>(math: NDArrayMath, input: T, output: T): T;
}
export declare class TanHFunc implements ActivationFunction {
    output<T extends NDArray>(math: NDArrayMath, x: T): T;
    der<T extends NDArray>(math: NDArrayMath, x: T, y: T): T;
}
export declare class ReLUFunc implements ActivationFunction {
    output<T extends NDArray>(math: NDArrayMath, x: T): T;
    der<T extends NDArray>(math: NDArrayMath, x: T, y: T): T;
}
export declare class SigmoidFunc implements ActivationFunction {
    output<T extends NDArray>(math: NDArrayMath, x: T): T;
    der<T extends NDArray>(math: NDArrayMath, x: T, y: T): T;
}
export declare class SquareFunc implements ActivationFunction {
    output<T extends NDArray>(math: NDArrayMath, x: T): T;
    der<T extends NDArray>(math: NDArrayMath, x: T, y: T): T;
}
