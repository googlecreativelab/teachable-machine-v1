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
var ndarray_1 = require("../../math/ndarray");
var util = require("../../util");
var graph_1 = require("../graph");
var op_1 = require("./op");
var Softmax = (function (_super) {
    __extends(Softmax, _super);
    function Softmax(logitsTensor, output) {
        var _this = _super.call(this) || this;
        _this.logitsTensor = logitsTensor;
        _this.output = output;
        return _this;
    }
    Softmax.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var logits = inferenceArrays.get(this.logitsTensor);
        return math.scope(function (keep) {
            inferenceArrays.set(_this.output, keep(math.softmax(logits)));
        });
    };
    Softmax.prototype.backProp = function () {
        throw Error('Softmax backprop is not yet implemented');
    };
    return Softmax;
}(op_1.Operation));
exports.Softmax = Softmax;
var SoftmaxCrossEntropyCost = (function (_super) {
    __extends(SoftmaxCrossEntropyCost, _super);
    function SoftmaxCrossEntropyCost(logitsTensor, labelTensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.logitsTensor = logitsTensor;
        _this.labelTensor = labelTensor;
        _this.yTensor = yTensor;
        _this.epsilon = ndarray_1.Scalar.new(1e-5);
        _this.softmaxTensor = new graph_1.Tensor(logitsTensor.shape);
        return _this;
    }
    SoftmaxCrossEntropyCost.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var logits = inferenceArrays.get(this.logitsTensor);
        var label = inferenceArrays.get(this.labelTensor);
        math.scope(function (keep) {
            var softmaxResult = math.softmax(logits);
            inferenceArrays.set(_this.softmaxTensor, keep(softmaxResult));
            inferenceArrays.set(_this.yTensor, keep(crossEntropyCost(math, softmaxResult, label, _this.epsilon)));
        });
    };
    SoftmaxCrossEntropyCost.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var softmax = inferenceArrays.get(this.softmaxTensor);
        var label = inferenceArrays.get(this.labelTensor);
        math.scope(function () {
            gradientArrays.add(_this.logitsTensor, math.sub(softmax, label));
        });
    };
    SoftmaxCrossEntropyCost.prototype.disposeTransientArrays = function (inferenceArrays, gradientArrays) {
        inferenceArrays.disposeArray(this.softmaxTensor);
    };
    SoftmaxCrossEntropyCost.prototype.dispose = function () {
        this.epsilon.dispose();
    };
    return SoftmaxCrossEntropyCost;
}(op_1.Operation));
exports.SoftmaxCrossEntropyCost = SoftmaxCrossEntropyCost;
function crossEntropyCost(math, y, target, epsilon) {
    util.assert(y.size === target.size, 'The output and target must be the same size');
    return math.scope(function () {
        var yPlusEps = math.scalarPlusArray(epsilon, y);
        var logOutput = math.log(yPlusEps);
        var tarLogOutput = math.elementWiseMul(target, logOutput);
        var costVector = math.neg(tarLogOutput);
        return math.sum(costVector);
    });
}
exports.crossEntropyCost = crossEntropyCost;
//# sourceMappingURL=softmax.js.map