import { NDArrayMath } from '../../math/math';
import { Scalar } from '../../math/ndarray';
import { Node, VariableNode } from '../graph';
import { SessionRuntime } from '../session';
import { SummedTensorArrayMap, TensorArrayMap } from '../tensor_array_map';
export declare abstract class Optimizer {
    protected learningRate: number;
    protected variableNodes: VariableNode[];
    protected specifiedVariableNodes: VariableNode[] | null;
    constructor(learningRate: number, specifiedVariableList?: Node[]);
    beforeBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    afterExample(math: NDArrayMath, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    abstract afterBatch(math: NDArrayMath, batchSize: number, runtime: SessionRuntime, activationArrayMap: TensorArrayMap, gradientArrayMap: SummedTensorArrayMap): void;
    dispose(): void;
    protected variableGradients: TensorArrayMap;
    protected prevBatchSize: number;
    protected one: Scalar;
    protected c: Scalar;
}
