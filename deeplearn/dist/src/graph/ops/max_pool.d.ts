import { NDArrayMath } from '../../math/math';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class MaxPool extends Operation {
    private xTensor;
    private yTensor;
    private fieldSize;
    private stride;
    private pad;
    constructor(xTensor: Tensor, yTensor: Tensor, fieldSize: number, stride?: number, pad?: number);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
}
