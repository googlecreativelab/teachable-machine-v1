"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var conv_util = require("../conv_util");
var ndarray_1 = require("../ndarray");
var gpgpu_context_1 = require("./gpgpu_context");
var gpgpu_math = require("./gpgpu_math");
var pool_gpu_1 = require("./pool_gpu");
var texture_manager_1 = require("./texture_manager");
function uploadPoolDownload(a, xShape, filterSizes, strides, zeroPad, op) {
    var gpgpu = new gpgpu_context_1.GPGPUContext();
    gpgpu.enableAutomaticDebugValidation(true);
    var textureManager = new texture_manager_1.TextureManager(gpgpu);
    ndarray_1.initializeGPU(gpgpu, textureManager);
    var x = ndarray_1.Array3D.new(xShape, a);
    var outDepth = x.shape[2];
    var _a = parseTuple(filterSizes), filterHeight = _a[0], filterWidth = _a[1];
    var _b = parseTuple(strides), strideHeight = _b[0], strideWidth = _b[1];
    var convInfo = conv_util.computeConvInfo(xShape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, zeroPad);
    var program = new pool_gpu_1.Pool2DProgram(convInfo, op, false);
    var res = ndarray_1.NDArray.zeros(program.outputShape);
    var binary = gpgpu_math.compileProgram(gpgpu, program, [x], res);
    gpgpu_math.runProgram(binary, [x], res);
    var resValues = res.getValues();
    textureManager.dispose();
    gpgpu.deleteProgram(binary.webGLProgram);
    gpgpu.dispose();
    return resValues;
}
exports.uploadPoolDownload = uploadPoolDownload;
function parseTuple(a) {
    return typeof a === 'number' ? [a, a] : a;
}
//# sourceMappingURL=pool_gpu_test_util.js.map