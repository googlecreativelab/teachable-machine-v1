import { NDArrayMath } from '../../math/math';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class Subtract extends Operation {
    private t1;
    private t2;
    private outTensor;
    private dySizeScalar;
    constructor(t1: Tensor, t2: Tensor, outTensor: Tensor);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
    dispose(): void;
}
