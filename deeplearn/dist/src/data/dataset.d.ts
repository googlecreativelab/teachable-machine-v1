import { NDArray } from '../math/ndarray';
export interface DataStats {
    exampleCount: number;
    inputMin: number;
    inputMax: number;
    shape: number[];
}
export declare abstract class InMemoryDataset {
    protected dataShapes: number[][];
    protected dataset: NDArray[][] | null;
    private normalizationInfo;
    constructor(dataShapes: number[][]);
    getDataShape(dataIndex: number): number[];
    abstract fetchData(): Promise<void>;
    getData(): NDArray[][] | null;
    getStats(): DataStats[];
    private getStatsForData(data);
    private normalizeExamplesToRange(examples, curLowerBounds, curUpperBounds, newLowerBounds, newUpperBounds);
    private computeBounds(dataIndex);
    normalizeWithinBounds(dataIndex: number, lowerBound: number, upperBound: number): void;
    private isNormalized(dataIndex);
    removeNormalization(dataIndex: number): void;
    unnormalizeExamples(examples: NDArray[], dataIndex: number): NDArray[];
    dispose(): void;
}
