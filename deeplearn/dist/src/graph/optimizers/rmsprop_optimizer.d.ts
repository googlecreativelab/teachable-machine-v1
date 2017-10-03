import { NDArrayMath } from '../../math/math';
import { Node } from '../graph';
import { SessionRuntime } from '../session';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Optimizer } from './optimizer';
export declare class RMSPropOptimizer extends Optimizer {
    protected learningRate: number;
    private gamma;
    constructor(learningRate: number, gamma: number, specifiedVariableList?: Node[]);
    beforeBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    afterBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    dispose(): void;
    private accumulatedSquaredGradients;
    private eps;
    private g;
}
