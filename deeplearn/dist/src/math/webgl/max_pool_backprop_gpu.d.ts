import { ConvInfo } from '../conv_util';
import { GPGPUProgram } from './gpgpu_math';
export declare class MaxPool2DBackpropProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(convInfo: ConvInfo);
}
