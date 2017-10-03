import { NDArrayMath } from '../../math/math';
import { Array1D, Scalar } from '../../math/ndarray';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class Softmax extends Operation {
    private logitsTensor;
    private output;
    constructor(logitsTensor: Tensor, output: Tensor);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(): void;
}
export declare class SoftmaxCrossEntropyCost extends Operation {
    private logitsTensor;
    private labelTensor;
    private yTensor;
    constructor(logitsTensor: Tensor, labelTensor: Tensor, yTensor: Tensor);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
    disposeTransientArrays(inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
    dispose(): void;
    private softmaxTensor;
    private epsilon;
}
export declare function crossEntropyCost(math: NDArrayMath, y: Array1D, target: Array1D, epsilon: Scalar): Scalar;
