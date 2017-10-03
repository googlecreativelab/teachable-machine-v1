import { GPGPUProgram } from './gpgpu_math';
export declare class ReduceSumProgram implements GPGPUProgram {
    size: number;
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(size: number);
}
