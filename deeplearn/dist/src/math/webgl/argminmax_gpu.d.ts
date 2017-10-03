import { GPGPUProgram } from './gpgpu_math';
export declare function getArgMinMaxSnippet(op: 'min' | 'max', texName: string, size: number): string;
export declare class ArgMinMaxProgram implements GPGPUProgram {
    variableNames: string[];
    outputShape: number[];
    params: Array<{}>;
    userCode: string;
    constructor(aSize: number, opType: 'min' | 'max');
}
