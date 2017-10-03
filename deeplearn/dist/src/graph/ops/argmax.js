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
var op_1 = require("./op");
var ArgMax = (function (_super) {
    __extends(ArgMax, _super);
    function ArgMax(xTensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.xTensor = xTensor;
        _this.yTensor = yTensor;
        return _this;
    }
    ArgMax.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.argMax(x)));
        });
    };
    ArgMax.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        throw new Error('ArgMax backprop unimplemented');
    };
    return ArgMax;
}(op_1.Operation));
exports.ArgMax = ArgMax;
//# sourceMappingURL=argmax.js.map