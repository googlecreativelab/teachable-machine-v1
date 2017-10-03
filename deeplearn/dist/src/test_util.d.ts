export declare const TEST_EPSILON: number;
export declare const TEST_LOW_PRECISION: number;
export declare const TEST_LOW_PRECISION_EPSILON: number;
export declare function expectArraysClose(actual: Float32Array, expected: Float32Array, epsilon?: number): void;
export declare function randomArrayInRange(n: number, minValue: number, maxValue: number): Float32Array;
export declare function makeIdentity(n: number): Float32Array;
export declare function setValue(m: Float32Array, mNumRows: number, mNumCols: number, v: number, row: number, column: number): void;
export declare function cpuMultiplyMatrix(a: Float32Array, aRow: number, aCol: number, b: Float32Array, bRow: number, bCol: number): Float32Array;
export declare function cpuDotProduct(a: Float32Array, b: Float32Array): number;
