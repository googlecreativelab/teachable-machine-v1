import { NDArrayMath } from '../../math/math';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
export declare abstract class Operation {
    abstract feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    abstract backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
    disposeTransientArrays(inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
    dispose(): void;
}
