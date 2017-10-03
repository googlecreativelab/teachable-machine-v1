import { NDArrayMath } from '../../math/math';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class Add extends Operation {
    private x1Tensor;
    private x2Tensor;
    private yTensor;
    private dySizeScalar;
    constructor(x1Tensor: Tensor, x2Tensor: Tensor, yTensor: Tensor);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
    dispose(): void;
}
