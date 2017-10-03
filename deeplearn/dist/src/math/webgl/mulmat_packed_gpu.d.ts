import { MatrixOrientation } from '../math';
import { GPGPUContext } from './gpgpu_context';
export declare function getFragmentShaderSource(sharedDimension: number, aOrientation: MatrixOrientation, bOrientation: MatrixOrientation): string;
export declare function multiplyMatrixPacked(gpgpu: GPGPUContext, multiplyProgram: WebGLProgram, a: WebGLTexture, b: WebGLTexture, result: WebGLTexture, resultShapeRowCol: [number, number]): void;
export declare function uploadMultiplyMatrixPackedDownload(a: Float32Array, aShapeRowCol: [number, number], b: Float32Array, bShapeRowCol: [number, number], aOrientation?: MatrixOrientation, bOrientation?: MatrixOrientation): Float32Array;
