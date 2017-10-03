export declare type ConvInfo = {
    inShape: [number, number, number];
    outShape: [number, number, number];
    strideHeight: number;
    strideWidth: number;
    filterHeight: number;
    filterWidth: number;
    padInfo: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
};
export declare function computeConvInfo(inShape: [number, number, number], filterHeight: number, filterWidth: number, outDepth: number, strideHeight: number, strideWidth: number, pad: 'same' | 'valid' | number): ConvInfo;
export declare function computeOutputShape3D(inShape: [number, number, number], fieldSize: number, outDepth: number, stride: number, zeroPad?: number): [number, number, number];
export declare function computeDefaultPad(inputShape: [number, number, number], fieldSize: number, stride: number): number;
export declare function computeTexShapeFrom3D(shapeRowColDepth: [number, number, number]): [number, number];
export declare function computeWeightsShape4D(inputDepth: number, outputDepth: number, filterHeight: number, filterWidth: number): [number, number, number, number];
export declare function computeDilatedRC(rc: [number, number], origStride: number): [number, number];
