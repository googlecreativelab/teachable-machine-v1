import { NDArray } from '../ndarray';
import { GPGPUContext } from './gpgpu_context';
import { ShapeInfo } from './shader_compiler';
export interface GPGPUProgram {
    variableNames: string[];
    outputShape: number[];
    params: Array<{}>;
    userCode: string;
    supportsBroadcasting?: boolean;
}
export interface GPGPUBinary {
    webGLProgram: WebGLProgram;
    program: GPGPUProgram;
    uniformLocations: {
        [name: string]: WebGLUniformLocation;
    };
    gpgpu: GPGPUContext;
    source: string;
    inShapeInfos: ShapeInfo[];
    outShapeInfo: ShapeInfo;
}
export declare function compileProgram<T extends NDArray, K extends NDArray>(gpgpu: GPGPUContext, program: GPGPUProgram, inputs: T[], output: K): GPGPUBinary;
export declare function runProgram<T extends NDArray, K extends NDArray>(binary: GPGPUBinary, inputs: T[], output: K, customSetup?: (gpgpu: GPGPUContext, webGLProgram: WebGLProgram) => void): void;
export declare function makeShaderKey(program: GPGPUProgram, inputs: NDArray[], output: NDArray): string;
