"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../util");
function computeConvInfo(inShape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad) {
    if (typeof pad === 'number') {
        var outShape_1 = computeOutputShape3D(inShape, filterHeight, outDepth, strideHeight, pad);
        return {
            inShape: inShape,
            outShape: outShape_1,
            padInfo: { top: pad, bottom: pad, left: pad, right: pad },
            strideHeight: strideHeight,
            strideWidth: strideWidth,
            filterHeight: filterHeight,
            filterWidth: filterWidth
        };
    }
    var inHeight = inShape[0];
    var inWidth = inShape[1];
    var outShape;
    var padInfo;
    if (pad === 'same') {
        var outHeight = Math.ceil(inHeight / strideHeight);
        var outWidth = Math.ceil(inWidth / strideWidth);
        outShape = [outHeight, outWidth, outDepth];
        var padAlongHeight = (outHeight - 1) * strideHeight + filterHeight - inHeight;
        var padAlongWidth = (outWidth - 1) * strideWidth + filterWidth - inWidth;
        var top_1 = Math.floor(padAlongHeight / 2);
        var bottom = padAlongHeight - top_1;
        var left = Math.floor(padAlongWidth / 2);
        var right = padAlongWidth - left;
        padInfo = { top: top_1, bottom: bottom, left: left, right: right };
    }
    else if (pad === 'valid') {
        var outHeight = Math.ceil((inHeight - filterHeight + 1) / strideHeight);
        var outWidth = Math.ceil((inWidth - filterWidth + 1) / strideWidth);
        outShape = [outHeight, outWidth, outDepth];
        padInfo = { top: 0, bottom: 0, left: 0, right: 0 };
    }
    else {
        throw Error("Unknown padding parameter: " + pad);
    }
    return {
        inShape: inShape,
        outShape: outShape,
        padInfo: padInfo,
        strideHeight: strideHeight,
        strideWidth: strideWidth,
        filterHeight: filterHeight,
        filterWidth: filterWidth
    };
}
exports.computeConvInfo = computeConvInfo;
function computeOutputShape3D(inShape, fieldSize, outDepth, stride, zeroPad) {
    if (zeroPad == null) {
        zeroPad = computeDefaultPad(inShape, fieldSize, stride);
    }
    var inputRows = inShape[0];
    var inputCols = inShape[1];
    var outputRows = (inputRows - fieldSize + 2 * zeroPad) / stride + 1;
    util.assert(util.isInt(outputRows), "The output # of rows (" + outputRows + ") must be an integer. Change the " +
        "stride and/or zero pad parameters");
    var outputCols = (inputCols - fieldSize + 2 * zeroPad) / stride + 1;
    util.assert(util.isInt(outputCols), "The output # of columns (" + outputCols + ") must be an integer. Change " +
        "the stride and/or zero pad parameters");
    return [outputRows, outputCols, outDepth];
}
exports.computeOutputShape3D = computeOutputShape3D;
function computeDefaultPad(inputShape, fieldSize, stride) {
    return Math.floor((inputShape[0] * (stride - 1) - stride + fieldSize) / 2);
}
exports.computeDefaultPad = computeDefaultPad;
function computeTexShapeFrom3D(shapeRowColDepth) {
    return [shapeRowColDepth[0], shapeRowColDepth[1] * shapeRowColDepth[2]];
}
exports.computeTexShapeFrom3D = computeTexShapeFrom3D;
function computeWeightsShape4D(inputDepth, outputDepth, filterHeight, filterWidth) {
    return [filterHeight, filterWidth, inputDepth, outputDepth];
}
exports.computeWeightsShape4D = computeWeightsShape4D;
function computeDilatedRC(rc, origStride) {
    var rowsDilated = (rc[0] - 1) * origStride + 1;
    var colsDilated = (rc[1] - 1) * origStride + 1;
    return [rowsDilated, colsDilated];
}
exports.computeDilatedRC = computeDilatedRC;
//# sourceMappingURL=conv_util.js.map