import { ActivationFunction } from '../../math/activation_functions';
import { NDArrayMath } from '../../math/math';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class ElementWiseActivation extends Operation {
    protected xTensor: Tensor;
    protected yTensor: Tensor;
    private func;
    constructor(xTensor: Tensor, yTensor: Tensor, func: ActivationFunction);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
}
export declare class ReLU extends ElementWiseActivation {
    constructor(xTensor: Tensor, yTensor: Tensor);
}
export declare class TanH extends ElementWiseActivation {
    constructor(xTensor: Tensor, yTensor: Tensor);
}
export declare class Sigmoid extends ElementWiseActivation {
    constructor(xTensor: Tensor, yTensor: Tensor);
}
export declare class Square extends ElementWiseActivation {
    constructor(xTensor: Tensor, yTensor: Tensor);
}
