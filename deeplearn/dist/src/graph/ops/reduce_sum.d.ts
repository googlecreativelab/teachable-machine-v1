import { NDArrayMath } from '../../math/math';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class ReduceSum extends Operation {
    private x;
    private outTensor;
    constructor(x: Tensor, outTensor: Tensor);
    private ones;
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
}
