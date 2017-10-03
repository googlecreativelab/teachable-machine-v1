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
var math_1 = require("../../math/math");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var MatMul = (function (_super) {
    __extends(MatMul, _super);
    function MatMul(x1Tensor, x2Tensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.yTensor = yTensor;
        return _this;
    }
    MatMul.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            if (x1.shape.length === 2 && x2.shape.length === 2) {
                inferenceArrays.set(_this.yTensor, keep(math.matMul(x1, x2)));
            }
            else if (x1.shape.length === 2 && x2.shape.length === 1) {
                inferenceArrays.set(_this.yTensor, keep(math.matrixTimesVector(x1, x2)));
            }
            else if (x1.shape.length === 1 && x2.shape.length === 2) {
                inferenceArrays.set(_this.yTensor, keep(math.vectorTimesMatrix(x1, x2)));
            }
        });
    };
    MatMul.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        var dy = gradientArrays.get(this.yTensor);
        if (x1.shape.length === 1) {
            x1 = x1.reshape([1, x1.size]);
            dy = dy.reshape([1, dy.size]);
        }
        if (x2.shape.length === 1) {
            x2 = x2.reshape([x2.size, 1]);
            dy = dy.reshape([dy.size, 1]);
        }
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.x1Tensor)) {
                var dx1 = math.matMul(dy, x2, math_1.MatrixOrientation.REGULAR, math_1.MatrixOrientation.TRANSPOSED);
                gradientArrays.add(_this.x1Tensor, _this.x1Tensor.shape.length === 1 ? dx1.as1D() : dx1);
            }
            if (graph_util.shouldBackProp(_this.x2Tensor)) {
                var dx2 = math.matMul(x1, dy, math_1.MatrixOrientation.TRANSPOSED, math_1.MatrixOrientation.REGULAR);
                gradientArrays.add(_this.x2Tensor, _this.x2Tensor.shape.length === 1 ? dx2.as1D() : dx2);
            }
        });
    };
    return MatMul;
}(op_1.Operation));
exports.MatMul = MatMul;
//# sourceMappingURL=matmul.js.map