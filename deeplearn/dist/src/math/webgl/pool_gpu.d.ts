import { ConvInfo } from '../conv_util';
import { GPGPUProgram } from './gpgpu_math';
export declare class Pool2DProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(convInfo: ConvInfo, poolType: 'max' | 'min' | 'avg', computePositions: boolean);
}
