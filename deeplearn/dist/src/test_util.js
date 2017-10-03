"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("./environment");
exports.TEST_EPSILON = environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED') ? 1e-4 : 1e-2;
exports.TEST_LOW_PRECISION = environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED') ? 3 : 1;
exports.TEST_LOW_PRECISION_EPSILON = 1 / Math.pow(10, exports.TEST_LOW_PRECISION);
function expectArraysClose(actual, expected, epsilon) {
    if (epsilon === void 0) { epsilon = exports.TEST_EPSILON; }
    if (actual.length !== expected.length) {
        throw new Error('Matrices have different lengths (' + actual.length + ' vs ' +
            expected.length + ').');
    }
    for (var i = 0; i < expected.length; ++i) {
        var a = actual[i];
        var e = expected[i];
        if (isNaN(a) && isNaN(e)) {
            continue;
        }
        if (isNaN(a) || isNaN(e) || Math.abs(a - e) > epsilon) {
            var actualStr = 'actual[' + i + '] === ' + a;
            var expectedStr = 'expected[' + i + '] === ' + e;
            throw new Error('Arrays differ: ' + actualStr + ', ' + expectedStr);
        }
    }
}
exports.expectArraysClose = expectArraysClose;
function randomArrayInRange(n, minValue, maxValue) {
    var v = new Float32Array(n);
    var range = maxValue - minValue;
    for (var i = 0; i < n; ++i) {
        v[i] = (Math.random() * range) + minValue;
    }
    return v;
}
exports.randomArrayInRange = randomArrayInRange;
function makeIdentity(n) {
    var i = new Float32Array(n * n);
    for (var j = 0; j < n; ++j) {
        i[(j * n) + j] = 1;
    }
    return i;
}
exports.makeIdentity = makeIdentity;
function setValue(m, mNumRows, mNumCols, v, row, column) {
    if (row >= mNumRows) {
        throw new Error('row (' + row + ') must be in [0 ' + mNumRows + '].');
    }
    if (column >= mNumCols) {
        throw new Error('column (' + column + ') must be in [0 ' + mNumCols + '].');
    }
    m[(row * mNumCols) + column] = v;
}
exports.setValue = setValue;
function cpuMultiplyMatrix(a, aRow, aCol, b, bRow, bCol) {
    var result = new Float32Array(aRow * bCol);
    for (var r = 0; r < aRow; ++r) {
        var aOffset = (r * aCol);
        var cOffset = (r * bCol);
        for (var c = 0; c < bCol; ++c) {
            var d = 0;
            for (var k = 0; k < aCol; ++k) {
                d += a[aOffset + k] * b[(k * bCol) + c];
            }
            result[cOffset + c] = d;
        }
    }
    return result;
}
exports.cpuMultiplyMatrix = cpuMultiplyMatrix;
function cpuDotProduct(a, b) {
    if (a.length !== b.length) {
        throw new Error('cpuDotProduct: incompatible vectors.');
    }
    var d = 0;
    for (var i = 0; i < a.length; ++i) {
        d += a[i] * b[i];
    }
    return d;
}
exports.cpuDotProduct = cpuDotProduct;
//# sourceMappingURL=test_util.js.map