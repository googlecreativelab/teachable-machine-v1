import { Tensor } from './graph/graph';
import { Optimizer } from './graph/optimizers/optimizer';
import { FeedEntry, Session } from './graph/session';
import { NDArrayMath } from './math/math';
import { NDArray, Scalar } from './math/ndarray';
export interface GraphRunnerEventObserver {
    batchesTrainedCallback?: (totalBatchesTrained: number) => void;
    avgCostCallback?: (avgCost: Scalar) => void;
    metricCallback?: (metric: NDArray) => void;
    inferenceExamplesCallback?: (feeds: FeedEntry[][], inferenceValues: NDArray[]) => void;
    inferenceExamplesPerSecCallback?: (examplesPerSec: number) => void;
    trainExamplesPerSecCallback?: (examplesPerSec: number) => void;
    totalTimeCallback?: (totalTimeSec: number) => void;
    doneTrainingCallback?: () => void;
}
export declare enum MetricReduction {
    SUM = 0,
    MEAN = 1,
}
export declare class GraphRunner {
    private math;
    private session;
    private eventObserver;
    private costTensor;
    private trainFeedEntries;
    private batchSize;
    private optimizer;
    private currentTrainLoopNumBatches;
    private costIntervalMs;
    private metricTensor;
    private metricFeedEntries;
    private metricBatchSize;
    private metricReduction;
    private metricIntervalMs;
    private inferenceTensor;
    private inferenceFeedEntries;
    private inferenceExampleIntervalMs;
    private inferenceExampleCount;
    private isTraining;
    private totalBatchesTrained;
    private batchesTrainedThisRun;
    private lastComputedMetric;
    private isInferring;
    private lastInferTimeoutID;
    private currentInferenceLoopNumPasses;
    private inferencePassesThisRun;
    private trainStartTimestamp;
    private lastCostTimestamp;
    private lastEvalTimestamp;
    private lastStopTimestamp;
    private totalIdleTimeMs;
    private zeroScalar;
    private metricBatchSizeScalar;
    constructor(math: NDArrayMath, session: Session, eventObserver: GraphRunnerEventObserver);
    resetStatistics(): void;
    train(costTensor: Tensor, trainFeedEntries: FeedEntry[], batchSize: number, optimizer: Optimizer, numBatches?: number, metricTensor?: Tensor, metricFeedEntries?: FeedEntry[], metricBatchSize?: number, metricReduction?: MetricReduction, evalIntervalMs?: number, costIntervalMs?: number): void;
    stopTraining(): void;
    resumeTraining(): void;
    private trainNetwork();
    infer(inferenceTensor: Tensor, inferenceFeedEntries: FeedEntry[], inferenceExampleIntervalMs?: number, inferenceExampleCount?: number, numPasses?: number): void;
    private inferNetwork();
    stopInferring(): void;
    isInferenceRunning(): boolean;
    computeMetric(): Scalar;
    getTotalBatchesTrained(): number;
    getLastComputedMetric(): Scalar;
    setMath(math: NDArrayMath): void;
    setSession(session: Session): void;
    setInferenceTensor(inferenceTensor: Tensor): void;
    setInferenceExampleCount(inferenceExampleCount: number): void;
}
