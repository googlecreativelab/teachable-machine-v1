import { NDArrayMath } from '../../math/math';
import { NDArray } from '../../math/ndarray';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class Reshape<T1 extends NDArray, T2 extends NDArray> extends Operation {
    private xTensor;
    private yTensor;
    constructor(xTensor: Tensor, yTensor: Tensor);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
}
