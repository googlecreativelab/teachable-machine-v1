import { NDArray } from './math/ndarray';
export interface Initializer {
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
export declare class VarianceScalingInitializer implements Initializer {
    private scale;
    private mode;
    private distribution;
    constructor(scale?: number, mode?: 'fan_in' | 'fan_out' | 'fan_avg', distribution?: 'uniform' | 'normal');
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
export declare class ZerosInitializer implements Initializer {
    constructor();
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
export declare class OnesInitializer implements Initializer {
    constructor();
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
export declare class ConstantInitializer implements Initializer {
    private value;
    constructor(value?: number);
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
export declare class NDArrayInitializer implements Initializer {
    private ndarray;
    constructor(ndarray: NDArray);
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
export declare class RandomNormalInitializer implements Initializer {
    private mean;
    private stdev;
    constructor(mean?: number, stdev?: number);
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
export declare class RandomTruncatedNormalInitializer implements Initializer {
    private mean;
    private stdev;
    constructor(mean?: number, stdev?: number);
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
export declare class RandomUniformInitializer implements Initializer {
    private minval;
    private maxval;
    constructor(minval?: number, maxval?: number);
    initialize(weightsShape: number[], inputUnits: number, outputUnits: number): NDArray;
}
