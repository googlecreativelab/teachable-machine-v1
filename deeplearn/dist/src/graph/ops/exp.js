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
var graph_util = require("../graph_util");
var op_1 = require("./op");
var Exp = (function (_super) {
    __extends(Exp, _super);
    function Exp(xTensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.xTensor = xTensor;
        _this.yTensor = yTensor;
        return _this;
    }
    Exp.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.exp(x)));
        });
    };
    Exp.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var y = inferenceArrays.get(this.yTensor);
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.xTensor)) {
                gradientArrays.add(_this.xTensor, math.elementWiseMul(y, dy));
            }
        });
    };
    return Exp;
}(op_1.Operation));
exports.Exp = Exp;
//# sourceMappingURL=exp.js.map