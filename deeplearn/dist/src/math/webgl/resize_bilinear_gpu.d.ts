import { GPGPUProgram } from './gpgpu_math';
export declare class ResizeBilinear3DProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(inputShape: [number, number, number], outputDimensionsRowCol: [number, number], alignCorners: boolean);
}
