import { ConvInfo } from '../conv_util';
import { GPGPUProgram } from './gpgpu_math';
export declare class Conv2DProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(convInfo: ConvInfo, hasBias: boolean);
}
