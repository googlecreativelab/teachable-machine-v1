import { GPGPUProgram } from './gpgpu_math';
export declare class UnaryOpProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    userCode: string;
    outputShape: number[];
    constructor(aShape: number[], opSnippet: string);
}
export declare const CHECK_NAN_SNIPPET: string;
export declare const ABS: string;
export declare const RELU: string;
export declare const STEP: string;
export declare const NEG: string;
export declare const EXP: string;
export declare const LOG: string;
export declare const SQRT: string;
export declare const SIGMOID: string;
export declare const SIN: string;
export declare const COS: string;
export declare const TAN: string;
export declare const ASIN: string;
export declare const ACOS: string;
export declare const ATAN: string;
export declare const SINH: string;
export declare const COSH: string;
export declare const TANH: string;
