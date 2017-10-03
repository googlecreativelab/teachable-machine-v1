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
var Subtract = (function (_super) {
    __extends(Subtract, _super);
    function Subtract(t1, t2, outTensor) {
        var _this = _super.call(this) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        _this.outTensor = outTensor;
        util.assert(util.sizeFromShape(t1.shape) === 1 ||
            util.sizeFromShape(t2.shape) === 1 ||
            util.arraysEqual(t1.shape, t2.shape), 'One of t1 or t2 must be a scalar, or t1 and t2 must have ' +
            'the same shape');
        return _this;
    }
    Subtract.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var t1 = inferenceArrays.get(this.t1);
        var t2 = inferenceArrays.get(this.t2);
        math.scope(function (keep) {
            var result;
            if (util.isScalarShape(t1.shape)) {
                result = math.scalarMinusArray(t1, t2);
            }
            else if (util.isScalarShape(t2.shape)) {
                result = math.arrayMinusScalar(t1, t2);
            }
            else {
                result = math.sub(t1, t2);
            }
            inferenceArrays.set(_this.outTensor, keep(result));
        });
    };
    Subtract.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var dy = gradientArrays.get(this.outTensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.t1)) {
                if (util.isScalarShape(_this.t1.shape)) {
                    var sum = math.sum(dy);
                    if (_this.dySizeScalar == null) {
                        _this.dySizeScalar = ndarray_1.Scalar.new(dy.size);
                    }
                    gradientArrays.add(_this.t1, math.divide(sum, _this.dySizeScalar));
                }
                else {
                    gradientArrays.add(_this.t1, math.clone(dy));
                }
            }
            if (graph_util.shouldBackProp(_this.t2)) {
                if (util.isScalarShape(_this.t2.shape)) {
                    var sum = math.sum(dy);
                    var negSum = math.neg(sum);
                    if (_this.dySizeScalar == null) {
                        _this.dySizeScalar = ndarray_1.Scalar.new(dy.size);
                    }
                    gradientArrays.add(_this.t2, math.divide(negSum, _this.dySizeScalar));
                }
                else {
                    gradientArrays.add(_this.t2, math.neg(dy));
                }
            }
        });
    };
    Subtract.prototype.dispose = function () {
        if (this.dySizeScalar != null) {
            this.dySizeScalar.dispose();
        }
    };
    return Subtract;
}(op_1.Operation));
exports.Subtract = Subtract;
//# sourceMappingURL=subtract.js.map