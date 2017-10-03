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
var graph_util = require("../graph_util");
var op_1 = require("./op");
var ReduceSum = (function (_super) {
    __extends(ReduceSum, _super);
    function ReduceSum(x, outTensor) {
        var _this = _super.call(this) || this;
        _this.x = x;
        _this.outTensor = outTensor;
        util.assertShapesMatch(outTensor.shape, []);
        return _this;
    }
    ReduceSum.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.x);
        math.scope(function (keep) {
            inferenceArrays.set(_this.outTensor, keep(math.sum(x)));
        });
    };
    ReduceSum.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        if (!graph_util.shouldBackProp(this.x)) {
            return;
        }
        math.scope(function () {
            var dy = gradientArrays.get(_this.outTensor);
            if (_this.ones == null) {
                var xArray = inferenceArrays.get(_this.x);
                _this.ones = ndarray_1.NDArray.zerosLike(xArray);
                _this.ones.fill(1);
            }
            gradientArrays.add(_this.x, math.scalarTimesArray(dy, _this.ones));
        });
    };
    return ReduceSum;
}(op_1.Operation));
exports.ReduceSum = ReduceSum;
//# sourceMappingURL=reduce_sum.js.map