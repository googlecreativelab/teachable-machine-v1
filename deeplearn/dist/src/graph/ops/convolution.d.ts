import { NDArrayMath } from '../../math/math';
import { Tensor } from '../graph';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Operation } from './op';
export declare class Convolution2D extends Operation {
    private wTensor;
    private xTensor;
    private bTensor;
    private yTensor;
    private fieldSize;
    private outputDepth;
    private stride;
    private zeroPad;
    constructor(wTensor: Tensor, xTensor: Tensor, bTensor: Tensor, yTensor: Tensor, fieldSize: number, outputDepth: number, stride?: number, zeroPad?: number);
    feedForward(math: NDArrayMath, inferenceArrays: TensorArrayMap): void;
    backProp(math: NDArrayMath, inferenceArrays: TensorArrayMap, gradientArrays: SummedTensorArrayMap): void;
    private assertWeightsShape(weightsShape);
}
