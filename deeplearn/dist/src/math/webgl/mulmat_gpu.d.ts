import { MatrixOrientation } from '../math';
import { GPGPUProgram } from './gpgpu_math';
export declare class MatMulProgram implements GPGPUProgram {
    variableNames: string[];
    params: Array<{}>;
    outputShape: number[];
    userCode: string;
    constructor(aShape: [number, number], bShape: [number, number], aOrient?: MatrixOrientation, bOrient?: MatrixOrientation);
}
