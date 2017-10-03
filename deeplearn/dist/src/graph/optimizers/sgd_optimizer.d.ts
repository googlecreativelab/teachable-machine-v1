import { NDArrayMath } from '../../math/math';
import { Node } from '../graph';
import { SessionRuntime } from '../session';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { Optimizer } from './optimizer';
export declare class SGDOptimizer extends Optimizer {
    protected learningRate: number;
    constructor(learningRate: number, specifiedVariableList?: Node[]);
    afterBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    dispose(): void;
    setLearningRate(learningRate: number): void;
}
