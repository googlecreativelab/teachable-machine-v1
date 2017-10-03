import { NDArray } from '../math/ndarray';
import { InMemoryDataset } from './dataset';
export interface NDArrayInfo {
    path: string;
    name: string;
    dataType: 'uint8' | 'float32' | 'png';
    shape: number[];
}
export interface XhrDatasetConfig {
    data: NDArrayInfo[];
    labelClassNames?: string[];
    modelConfigs: {
        [modelName: string]: XhrModelConfig;
    };
}
export interface XhrModelConfig {
    path: string;
}
export declare function getXhrDatasetConfig(jsonConfigPath: string): Promise<{
    [datasetName: string]: XhrDatasetConfig;
}>;
export declare class XhrDataset extends InMemoryDataset {
    protected xhrDatasetConfig: XhrDatasetConfig;
    constructor(xhrDatasetConfig: XhrDatasetConfig);
    protected getNDArray<T extends NDArray>(info: NDArrayInfo): Promise<T[]>;
    fetchData(): Promise<void>;
}
