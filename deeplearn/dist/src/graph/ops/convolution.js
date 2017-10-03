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
var conv_util = require("../../math/conv_util");
var util = require("../../util");
var op_1 = require("./op");
var Convolution2D = (function (_super) {
    __extends(Convolution2D, _super);
    function Convolution2D(wTensor, xTensor, bTensor, yTensor, fieldSize, outputDepth, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        var _this = _super.call(this) || this;
        _this.wTensor = wTensor;
        _this.xTensor = xTensor;
        _this.bTensor = bTensor;
        _this.yTensor = yTensor;
        _this.fieldSize = fieldSize;
        _this.outputDepth = outputDepth;
        _this.stride = stride;
        _this.assertWeightsShape(wTensor.shape);
        _this.zeroPad = zeroPad != null ?
            zeroPad :
            conv_util.computeDefaultPad(_this.xTensor.shape, _this.fieldSize, _this.stride);
        util.assert(util.isInt(_this.zeroPad), "The zero padding (" + _this.zeroPad + ") must be an integer. Change the " +
            "stride and/or zero pad parameters");
        return _this;
    }
    Convolution2D.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var weights = inferenceArrays.get(this.wTensor);
        var biases = inferenceArrays.get(this.bTensor);
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.conv2d(x, weights, biases, _this.stride, _this.zeroPad)));
        });
    };
    Convolution2D.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var weights = inferenceArrays.get(this.wTensor);
        var x = inferenceArrays.get(this.xTensor);
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            var _a = math.conv2dBackProp(x, dy, weights, _this.stride, _this.zeroPad), dw = _a.dw, db = _a.db, dx = _a.dx;
            gradientArrays.add(_this.wTensor, dw);
            gradientArrays.add(_this.bTensor, db);
            gradientArrays.add(_this.xTensor, dx);
        });
    };
    Convolution2D.prototype.assertWeightsShape = function (weightsShape) {
        util.assert(weightsShape[0] === this.fieldSize &&
            weightsShape[1] === this.fieldSize &&
            weightsShape[2] === this.xTensor.shape[2] &&
            weightsShape[3] === this.outputDepth, "weights must be of shape [" + this.fieldSize + "," + this.fieldSize + "," +
            (this.xTensor.shape[2] + "," + this.outputDepth + "] but they are of") +
            ("shape [" + weightsShape + "]"));
    };
    return Convolution2D;
}(op_1.Operation));
exports.Convolution2D = Convolution2D;
//# sourceMappingURL=convolution.js.map