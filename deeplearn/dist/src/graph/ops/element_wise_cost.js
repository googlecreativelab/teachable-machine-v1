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
var cost_functions_1 = require("../../math/cost_functions");
var ndarray_1 = require("../../math/ndarray");
var util = require("../../util");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var ElementWiseCost = (function (_super) {
    __extends(ElementWiseCost, _super);
    function ElementWiseCost(x1Tensor, x2Tensor, yTensor, func) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.yTensor = yTensor;
        _this.func = func;
        _this.oneOverNScalar = ndarray_1.Scalar.new(1 / util.sizeFromShape(x1Tensor.shape));
        return _this;
    }
    ElementWiseCost.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            var elementWiseCost = _this.func.cost(math, x1, x2);
            var sum = math.sum(elementWiseCost);
            var result = math.scalarTimesArray(_this.oneOverNScalar, sum);
            inferenceArrays.set(_this.yTensor, keep(result));
        });
    };
    ElementWiseCost.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.x1Tensor)) {
                gradientArrays.add(_this.x1Tensor, _this.func.der(math, x1, x2));
            }
            if (graph_util.shouldBackProp(_this.x2Tensor)) {
                gradientArrays.add(_this.x2Tensor, _this.func.der(math, x2, x1));
            }
        });
    };
    ElementWiseCost.prototype.dispose = function () {
        this.func.dispose();
        this.oneOverNScalar.dispose();
    };
    return ElementWiseCost;
}(op_1.Operation));
exports.ElementWiseCost = ElementWiseCost;
var MeanSquaredCost = (function (_super) {
    __extends(MeanSquaredCost, _super);
    function MeanSquaredCost(x1Tensor, x2Tensor, yTensor) {
        return _super.call(this, x1Tensor, x2Tensor, yTensor, new cost_functions_1.SquareCostFunc()) || this;
    }
    return MeanSquaredCost;
}(ElementWiseCost));
exports.MeanSquaredCost = MeanSquaredCost;
//# sourceMappingURL=element_wise_cost.js.map