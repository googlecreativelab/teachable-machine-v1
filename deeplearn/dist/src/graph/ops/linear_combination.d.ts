import { NDArrayMath } from '../../math/math';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class LinearCombination extends Operation {
    private x1Tensor;
    private x2Tensor;
    private c1Tensor;
    private c2Tensor;
    private outTensor;
    constructor(x1Tensor: Tensor, x2Tensor: Tensor, c1Tensor: Tensor, c2Tensor: Tensor, outTensor: Tensor);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
}
