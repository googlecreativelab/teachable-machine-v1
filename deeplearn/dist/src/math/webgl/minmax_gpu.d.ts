import { GPGPUProgram } from './gpgpu_math';
export declare class MinMaxProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(size: number, op: 'min' | 'max');
}
