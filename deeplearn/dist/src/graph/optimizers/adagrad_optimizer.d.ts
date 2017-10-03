import { NDArrayMath } from '../../math/math';
import { Node } from '../graph';
import { SessionRuntime } from '../session';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Optimizer } from './optimizer';
export declare class AdagradOptimizer extends Optimizer {
    protected learningRate: number;
    protected momentum: number;
    constructor(learningRate: number, momentum: number, specifiedVariableList?: Node[]);
    beforeBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    afterBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    dispose(): void;
    private accumulatedSquaredGradients;
    private m;
    private eps;
}
