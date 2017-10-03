import { GPGPUProgram } from './gpgpu_math';
export declare class ConcatProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(aShape: number[], bShape: number[], axis: number);
}
