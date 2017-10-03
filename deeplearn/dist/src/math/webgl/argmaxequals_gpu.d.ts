import { GPGPUProgram } from './gpgpu_math';
export declare class ArgMaxEqualsProgram implements GPGPUProgram {
    variableNames: string[];
    outputShape: number[];
    params: Array<{}>;
    userCode: string;
    constructor(aSize: number, bSize: number);
}
