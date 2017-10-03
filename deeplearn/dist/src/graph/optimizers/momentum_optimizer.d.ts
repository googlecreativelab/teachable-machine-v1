import { NDArrayMath } from '../../math/math';
import { Node } from '../graph';
import { SessionRuntime } from '../session';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
import { SGDOptimizer } from './sgd_optimizer';
export declare class MomentumOptimizer extends SGDOptimizer {
    protected learningRate: number;
    private momentum;
    constructor(learningRate: number, momentum: number, specifiedVariableList?: Node[]);
    beforeBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    afterBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    dispose(): void;
    setMomentum(momentum: number): void;
    private variableVelocities;
    private m;
}
