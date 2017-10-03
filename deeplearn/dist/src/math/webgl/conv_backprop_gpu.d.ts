import { ConvInfo } from '../conv_util';
import { GPGPUProgram } from './gpgpu_math';
export declare class Conv2DDerWeightsProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(convInfo: ConvInfo);
}
export declare class Conv2DDerInputProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(convInfo: ConvInfo);
}
export declare class Conv2DDerBiasProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(yShape: [number, number, number]);
}
