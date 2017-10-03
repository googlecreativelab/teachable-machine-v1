import { GPGPUContext } from './webgl/gpgpu_context';
import { TextureManager } from './webgl/texture_manager';
export declare let GPGPU: GPGPUContext;
export declare let TEXTURE_MANAGER: TextureManager;
export interface NDArrayData {
    values?: Float32Array;
    texture?: WebGLTexture;
    textureShapeRC?: [number, number];
}
export declare function initializeGPU(gpgpu: GPGPUContext, textureManager: TextureManager): void;
export declare class NDArray {
    shape: number[];
    size: number;
    protected strides: number[];
    private data;
    protected constructor(shape: number[], data: NDArrayData);
    static zeros(shape: number[]): NDArray;
    static zerosLike<T extends NDArray>(another: T): T;
    static like<T extends NDArray>(another: T): T;
    static make(shape: number[], data: NDArrayData): NDArray;
    reshape(newShape: number[]): NDArray;
    asScalar(): Scalar;
    as1D(): Array1D;
    as2D(rows: number, columns: number): Array2D;
    as3D(rows: number, columns: number, depth: number): Array3D;
    as4D(rows: number, columns: number, depth: number, depth2: number): Array4D;
    readonly rank: number;
    get(...locs: number[]): number;
    add(value: number, ...locs: number[]): void;
    set(value: number, ...locs: number[]): void;
    locToIndex(locs: number[]): number;
    indexToLoc(index: number): number[];
    fill(value: number): void;
    getData(): NDArrayData;
    getValues(): Float32Array;
    getValuesAsync(): Promise<Float32Array>;
    private uploadToGPU(preferredTexShape?);
    getTexture(preferredShapeRC?: [number, number]): WebGLTexture;
    getTextureShapeRC(preferredShapeRC?: [number, number]): [number, number];
    dispose(): void;
    private disposeTexture();
    inGPU(): boolean;
    equals(t: NDArray): boolean;
    static rand(shape: number[], randFunction: () => number): NDArray;
    static randNormal(shape: number[], mean?: number, stdDev?: number): NDArray;
    static randTruncatedNormal(shape: number[], mean?: number, stdDev?: number): NDArray;
    static randUniform(shape: number[], a: number, b: number): NDArray;
}
export declare class Scalar extends NDArray {
    constructor(data: NDArrayData);
    static new(value: number): Scalar;
    static ZERO: Scalar;
    static ONE: Scalar;
    static TWO: Scalar;
    static NEG_ONE: Scalar;
    get(): number;
    set(value: number): void;
    add(value: number): void;
}
export declare class Array1D extends NDArray {
    shape: [number];
    constructor(data: NDArrayData);
    static new(values: Float32Array | number[]): Array1D;
    get(i: number): number;
    set(value: number, i: number): void;
    add(value: number, i: number): void;
    locToIndex(loc: [number]): number;
    indexToLoc(index: number): [number];
    static zeros(shape: [number]): Array1D;
    static randNormal(shape: [number], mean?: number, stdDev?: number): Array1D;
    static randTruncatedNormal(shape: [number], mean?: number, stdDev?: number): Array1D;
    static randUniform(shape: [number], a: number, b: number): Array1D;
    static make(shape: [number], data: NDArrayData): Array1D;
}
export declare class Array2D extends NDArray {
    shape: [number, number];
    private stride0;
    constructor(shape: [number, number], data: NDArrayData);
    static new(shape: [number, number], values: Float32Array | number[] | number[][]): Array2D;
    get(i: number, j: number): number;
    set(value: number, i: number, j: number): void;
    add(value: number, i: number, j: number): void;
    locToIndex(locs: [number, number]): number;
    indexToLoc(index: number): [number, number];
    static zeros(shape: [number, number]): Array2D;
    static randNormal(shape: [number, number], mean?: number, stdDev?: number): Array2D;
    static randTruncatedNormal(shape: [number, number], mean?: number, stdDev?: number): Array2D;
    static randUniform(shape: [number, number], a: number, b: number): Array2D;
    static make(shape: [number, number], data: NDArrayData): Array2D;
}
export declare class Array3D extends NDArray {
    shape: [number, number, number];
    private stride0;
    private stride1;
    constructor(shape: [number, number, number], data: NDArrayData);
    static new(shape: [number, number, number], values: Float32Array | number[] | number[][][]): Array3D;
    get(i: number, j: number, k: number): number;
    set(value: number, i: number, j: number, k: number): void;
    add(value: number, i: number, j: number, k: number): void;
    locToIndex(locs: [number, number, number]): number;
    indexToLoc(index: number): [number, number, number];
    static zeros(shape: [number, number, number]): Array3D;
    static randNormal(shape: [number, number, number], mean?: number, stdDev?: number): Array3D;
    static randTruncatedNormal(shape: [number, number, number], mean?: number, stdDev?: number): Array3D;
    static randUniform(shape: [number, number, number], a: number, b: number): Array3D;
    static make(shape: [number, number, number], data: NDArrayData): Array3D;
}
export declare class Array4D extends NDArray {
    shape: [number, number, number, number];
    private stride0;
    private stride1;
    private stride2;
    constructor(shape: [number, number, number, number], data: NDArrayData);
    static new(shape: [number, number, number, number], values: Float32Array | number[] | number[][][][]): Array4D;
    get(i: number, j: number, k: number, l: number): number;
    set(value: number, i: number, j: number, k: number, l: number): void;
    add(value: number, i: number, j: number, k: number, l: number): void;
    locToIndex(locs: [number, number, number, number]): number;
    indexToLoc(index: number): [number, number, number, number];
    static zeros(shape: [number, number, number, number]): Array4D;
    static randNormal(shape: [number, number, number, number], mean?: number, stdDev?: number): Array4D;
    static randTruncatedNormal(shape: [number, number, number, number], mean?: number, stdDev?: number): Array4D;
    static randUniform(shape: [number, number, number, number], a: number, b: number): Array4D;
    static make(shape: [number, number, number, number], data: NDArrayData): Array4D;
}
