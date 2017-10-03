import { GPGPUProgram } from './gpgpu_math';
export declare const ADD = "return a + b;";
export declare const SUB = "return a - b;";
export declare const MUL = "return a * b;";
export declare const DIV = "return a / b;";
export declare class BinaryOpProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    supportsBroadcasting: boolean;
    constructor(op: string, aShape: number[], bShape: number[]);
}
