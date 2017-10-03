import { GPGPUProgram } from './gpgpu_math';
export declare class AddScaledMatProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    supportsBroadcasting: boolean;
    constructor(aShape: number[], bShape: number[]);
}
