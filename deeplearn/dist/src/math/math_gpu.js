"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var math_1 = require("./math");
var ndarray = require("./ndarray");
var ndarray_1 = require("./ndarray");
var addscaledmat_gpu_1 = require("./webgl/addscaledmat_gpu");
var argmaxequals_gpu_1 = require("./webgl/argmaxequals_gpu");
var argminmax_gpu_1 = require("./webgl/argminmax_gpu");
var batchnorm_gpu_1 = require("./webgl/batchnorm_gpu");
var binaryop_gpu = require("./webgl/binaryop_gpu");
var binaryop_gpu_1 = require("./webgl/binaryop_gpu");
var concat_gpu_1 = require("./webgl/concat_gpu");
var conv_backprop_gpu_1 = require("./webgl/conv_backprop_gpu");
var conv_gpu_1 = require("./webgl/conv_gpu");
var copy_gpu_1 = require("./webgl/copy_gpu");
var gpgpu_context_1 = require("./webgl/gpgpu_context");
var gpgpu_math = require("./webgl/gpgpu_math");
var gpgpu_util = require("./webgl/gpgpu_util");
var logsumexp_gpu_1 = require("./webgl/logsumexp_gpu");
var max_pool_backprop_gpu_1 = require("./webgl/max_pool_backprop_gpu");
var minmax_gpu_1 = require("./webgl/minmax_gpu");
var mulmat_gpu_1 = require("./webgl/mulmat_gpu");
var pool_gpu_1 = require("./webgl/pool_gpu");
var reducesum_gpu_1 = require("./webgl/reducesum_gpu");
var resize_bilinear_gpu_1 = require("./webgl/resize_bilinear_gpu");
var slice_gpu_1 = require("./webgl/slice_gpu");
var texture_manager_1 = require("./webgl/texture_manager");
var unary_op = require("./webgl/unaryop_gpu");
var unaryop_gpu_1 = require("./webgl/unaryop_gpu");
var webgl_util = require("./webgl/webgl_util");
var NDArrayMathGPU = (function (_super) {
    __extends(NDArrayMathGPU, _super);
    function NDArrayMathGPU(gpgpu, safeMode) {
        if (safeMode === void 0) { safeMode = false; }
        var _this = _super.call(this, safeMode) || this;
        _this.binaryCache = {};
        if (gpgpu == null) {
            var gl = gpgpu_util.createWebGLContext();
            _this.gpgpu = new gpgpu_context_1.GPGPUContext(gl);
            _this.gpgpuCreatedLocally = true;
        }
        else {
            _this.gpgpu = gpgpu;
            _this.gpgpuCreatedLocally = false;
        }
        _this.textureManager = new texture_manager_1.TextureManager(_this.gpgpu);
        ndarray.initializeGPU(_this.gpgpu, _this.textureManager);
        return _this;
    }
    NDArrayMathGPU.prototype.getGPGPUContext = function () {
        return this.gpgpu;
    };
    NDArrayMathGPU.prototype.cloneInternal = function (a) {
        var texShape = a.getTextureShapeRC();
        var source = a.as2D(texShape[0], texShape[1]);
        var output = this.makeOutputArray(texShape);
        this.copy2D(source, [0, 0], texShape, output, [0, 0], texShape);
        return output.reshape(a.shape);
    };
    NDArrayMathGPU.prototype.slice1DInternal = function (input, begin, size) {
        var program = new slice_gpu_1.SliceProgram([size]);
        var customSetup = program.getCustomSetupFunc([begin]);
        return this.compileAndRun(program, [input], null, customSetup);
    };
    NDArrayMathGPU.prototype.slice2DInternal = function (input, begin, size) {
        var program = new slice_gpu_1.SliceProgram(size);
        var customSetup = program.getCustomSetupFunc(begin);
        return this.compileAndRun(program, [input], null, customSetup);
    };
    NDArrayMathGPU.prototype.slice3DInternal = function (input, begin, size) {
        var program = new slice_gpu_1.SliceProgram(size);
        var customSetup = program.getCustomSetupFunc(begin);
        return this.compileAndRun(program, [input], null, customSetup);
    };
    NDArrayMathGPU.prototype.slice4DInternal = function (input, begin, size) {
        var program = new slice_gpu_1.SliceProgram(size);
        var customSetup = program.getCustomSetupFunc(begin);
        return this.compileAndRun(program, [input], null, customSetup);
    };
    NDArrayMathGPU.prototype.copy2DInternal = function (source, sourceBeginRowCol, sourceSizeRowCol, dest, destBeginRowCol, destSizeRowCol) {
        var program = new copy_gpu_1.Copy2DProgram(sourceSizeRowCol[1], destSizeRowCol[1]);
        var customSetup = program.getCustomSetupFunc(sourceBeginRowCol, destBeginRowCol, destSizeRowCol);
        this.compileAndRun(program, [source], dest, customSetup);
    };
    NDArrayMathGPU.prototype.concat1DInternal = function (a, b) {
        var program = new concat_gpu_1.ConcatProgram(a.shape, b.shape, 0);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.concat2DInternal = function (a, b, axis) {
        var program = new concat_gpu_1.ConcatProgram(a.shape, b.shape, axis);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.concat3DInternal = function (x1, x2, axis) {
        var program = new concat_gpu_1.ConcatProgram(x1.shape, x2.shape, axis);
        return this.compileAndRun(program, [x1, x2]);
    };
    NDArrayMathGPU.prototype.concat4DInternal = function (x1, x2, axis) {
        var program = new concat_gpu_1.ConcatProgram(x1.shape, x2.shape, axis);
        return this.compileAndRun(program, [x1, x2]);
    };
    NDArrayMathGPU.prototype.scaledArrayAddInternal = function (c1, a, c2, b) {
        var program = new addscaledmat_gpu_1.AddScaledMatProgram(a.shape, b.shape);
        return this.compileAndRun(program, [a, b, c1, c2]);
    };
    NDArrayMathGPU.prototype.negInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.NEG);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.makeOutputArray = function (shape) {
        var textureShapeRC = webgl_util.getTextureShapeFromLogicalShape(this.gpgpu.gl, shape);
        var texture = this.textureManager.acquireTexture(textureShapeRC);
        return ndarray_1.NDArray.make(shape, { texture: texture, textureShapeRC: textureShapeRC });
    };
    NDArrayMathGPU.prototype.compileAndRun = function (program, inputs, output, customSetup) {
        var _this = this;
        if (output == null) {
            output = this.makeOutputArray(program.outputShape);
        }
        var key = gpgpu_math.makeShaderKey(program, inputs, output);
        var binary = this.getAndSaveBinary(key, function () {
            return gpgpu_math.compileProgram(_this.gpgpu, program, inputs, output);
        });
        gpgpu_math.runProgram(binary, inputs, output, customSetup);
        return output;
    };
    NDArrayMathGPU.prototype.matMulInternal = function (a, b, aOrientation, bOrientation) {
        var program = new mulmat_gpu_1.MatMulProgram(a.shape, b.shape, aOrientation, bOrientation);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.multiplyInternal = function (a, b) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.MUL, a.shape, b.shape);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.batchNormalization3DInternal = function (x, mean, variance, varianceEpsilon, scale, offset) {
        var inputs = [x, mean, variance];
        if (varianceEpsilon == null) {
            varianceEpsilon = 0.000001;
        }
        var offsetShape = null;
        if (offset != null) {
            offsetShape = offset.shape;
            inputs.push(offset);
        }
        var scaleShape = null;
        if (scale != null) {
            scaleShape = scale.shape;
            inputs.push(scale);
        }
        var program = new batchnorm_gpu_1.BatchNormProgram(x.shape, mean.shape, variance.shape, offsetShape, scaleShape, varianceEpsilon);
        return this.compileAndRun(program, inputs);
    };
    NDArrayMathGPU.prototype.switchDimInternal = function (a, newDim) {
        throw new Error('Not yet implemented!');
    };
    NDArrayMathGPU.prototype.sumInternal = function (a) {
        var program = new reducesum_gpu_1.ReduceSumProgram(a.size);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.argMinInternal = function (a) {
        var program = new argminmax_gpu_1.ArgMinMaxProgram(a.size, 'min');
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.argMaxInternal = function (a) {
        var program = new argminmax_gpu_1.ArgMinMaxProgram(a.size, 'max');
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.argMaxEqualsInternal = function (x1, x2) {
        var program = new argmaxequals_gpu_1.ArgMaxEqualsProgram(x1.size, x2.size);
        return this.compileAndRun(program, [x1, x2]);
    };
    NDArrayMathGPU.prototype.topKInternal = function (ndarray, k) {
        throw new Error('topK GPU not yet implemented!');
    };
    NDArrayMathGPU.prototype.minInternal = function (a) {
        var program = new minmax_gpu_1.MinMaxProgram(a.size, 'min');
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.maxInternal = function (a) {
        var program = new minmax_gpu_1.MinMaxProgram(a.size, 'max');
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.divideInternal = function (a, b) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.DIV, a.shape, b.shape);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.addInternal = function (a, b) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.ADD, a.shape, b.shape);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.subInternal = function (a, b) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.SUB, a.shape, b.shape);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.logSumExpInternal = function (a) {
        var program = new logsumexp_gpu_1.LogSumExpProgram(a.size);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.expInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.EXP);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.logInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.LOG);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sqrtInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.SQRT);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.reluInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.RELU);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.absInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ABS);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sigmoidInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.SIGMOID);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sinInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.SIN);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.cosInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.COS);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.tanInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.TAN);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.asinInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ASIN);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.acosInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ACOS);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.atanInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ATAN);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sinhInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.SINH);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.coshInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.COSH);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.tanhInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.TANH);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.stepInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.STEP);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.conv2dInternal = function (x, filter, bias, convInfo) {
        var program = new conv_gpu_1.Conv2DProgram(convInfo, bias != null);
        var inputs = bias != null ? [x, filter, bias] : [x, filter];
        return this.compileAndRun(program, inputs);
    };
    NDArrayMathGPU.prototype.conv2dDerInputInternal = function (dy, filter, convInfo) {
        var program = new conv_backprop_gpu_1.Conv2DDerInputProgram(convInfo);
        return this.compileAndRun(program, [dy, filter]);
    };
    NDArrayMathGPU.prototype.conv2dDerFilterInternal = function (x, dY, convInfo) {
        var program = new conv_backprop_gpu_1.Conv2DDerWeightsProgram(convInfo);
        return this.compileAndRun(program, [x, dY]);
    };
    NDArrayMathGPU.prototype.conv2dDerBiasInternal = function (dY) {
        var program = new conv_backprop_gpu_1.Conv2DDerBiasProgram(dY.shape);
        return this.compileAndRun(program, [dY]);
    };
    NDArrayMathGPU.prototype.maxPoolInternal = function (x, convInfo) {
        var program = new pool_gpu_1.Pool2DProgram(convInfo, 'max', false);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.minPoolInternal = function (x, convInfo) {
        var program = new pool_gpu_1.Pool2DProgram(convInfo, 'min', false);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.avgPoolInternal = function (x, convInfo) {
        var program = new pool_gpu_1.Pool2DProgram(convInfo, 'avg', false);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.maxPoolBackpropInternal = function (dy, x, convInfo) {
        var getPositions = true;
        var maxPoolPositionsProgram = new pool_gpu_1.Pool2DProgram(convInfo, 'max', getPositions);
        var maxPoolPositions = this.compileAndRun(maxPoolPositionsProgram, [x]);
        var maxPoolBackPropProgram = new max_pool_backprop_gpu_1.MaxPool2DBackpropProgram(convInfo);
        var result = this.compileAndRun(maxPoolBackPropProgram, [dy, maxPoolPositions]);
        maxPoolPositions.dispose();
        return result;
    };
    NDArrayMathGPU.prototype.resizeBilinear3DInternal = function (x, newShape2D, alignCorners) {
        var program = new resize_bilinear_gpu_1.ResizeBilinear3DProgram(x.shape, newShape2D, alignCorners);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.getAndSaveBinary = function (key, getBinary) {
        if (!(key in this.binaryCache)) {
            this.binaryCache[key] = getBinary();
        }
        return this.binaryCache[key];
    };
    NDArrayMathGPU.prototype.getTextureManager = function () {
        return this.textureManager;
    };
    NDArrayMathGPU.prototype.dispose = function () {
        for (var key in this.binaryCache) {
            this.gpgpu.deleteProgram(this.binaryCache[key].webGLProgram);
        }
        this.textureManager.dispose();
        if (this.gpgpuCreatedLocally) {
            this.gpgpu.dispose();
        }
    };
    return NDArrayMathGPU;
}(math_1.NDArrayMath));
exports.NDArrayMathGPU = NDArrayMathGPU;
//# sourceMappingURL=math_gpu.js.map