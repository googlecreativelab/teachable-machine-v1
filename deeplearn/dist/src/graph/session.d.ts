import { InputProvider } from '../data/input_provider';
import { NDArrayMath } from '../math/math';
import { NDArray, Scalar } from '../math/ndarray';
import { Graph, Node, Tensor } from './graph';
import { Operation } from './ops/op';
import { Optimizer } from './optimizers/optimizer';
import { SummedTensorArrayMap, TensorArrayMap } from './tensor_array_map';
export declare type FeedEntry = {
    tensor: Tensor;
    data: NDArray | InputProvider;
};
export declare class FeedDictionary {
    dict: {
        [tensorID: number]: FeedEntry;
    };
    constructor(feedEntries?: FeedEntry[]);
}
export declare enum CostReduction {
    NONE = 0,
    SUM = 1,
    MEAN = 2,
}
export declare class Session {
    private math;
    constructor(graph: Graph, math: NDArrayMath);
    dispose(): void;
    evalAll(tensors: Tensor[], feedEntries: FeedEntry[]): NDArray[];
    eval(tensor: Tensor, feedEntries: FeedEntry[]): NDArray;
    train(costTensor: Tensor, feedEntries: FeedEntry[], batchSize: number, optimizer: Optimizer, costReduction?: CostReduction): Scalar;
    private updateCostForExample(totalCost, currCost, costReduction);
    private updateCostForBatch(totalCost, costReduction);
    private getOrCreateRuntime(tensors, feed);
    private makeRuntimeCacheKey(tensors, feed);
    activationArrayMap: TensorArrayMap;
    gradientArrayMap: SummedTensorArrayMap;
    private runtimeCache;
    private prevBatchSize;
    private batchSizeScalar;
    private oneScalar;
}
export declare type SessionRuntime = {
    nodes: Node[];
    operations: Operation[];
};
