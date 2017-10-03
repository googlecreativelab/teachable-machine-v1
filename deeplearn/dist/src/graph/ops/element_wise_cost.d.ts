import { ElementWiseCostFunction } from '../../math/cost_functions';
import { NDArrayMath } from '../../math/math';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class ElementWiseCost extends Operation {
    protected x1Tensor: Tensor;
    protected x2Tensor: Tensor;
    protected yTensor: Tensor;
    protected func: ElementWiseCostFunction;
    private oneOverNScalar;
    constructor(x1Tensor: Tensor, x2Tensor: Tensor, yTensor: Tensor, func: ElementWiseCostFunction);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
    dispose(): void;
}
export declare class MeanSquaredCost extends ElementWiseCost {
    constructor(x1Tensor: Tensor, x2Tensor: Tensor, yTensor: Tensor);
}
