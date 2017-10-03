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
var tensor_array_map_1 = require("../tensor_array_map");
var optimizer_1 = require("./optimizer");
var AdagradOptimizer = (function (_super) {
    __extends(AdagradOptimizer, _super);
    function AdagradOptimizer(learningRate, momentum, specifiedVariableList) {
        var _this = _super.call(this, learningRate, specifiedVariableList) || this;
        _this.learningRate = learningRate;
        _this.momentum = momentum;
        _this.accumulatedSquaredGradients = new tensor_array_map_1.TensorArrayMap();
        _this.m = ndarray_1.Scalar.new(momentum);
        _this.eps = ndarray_1.Scalar.new(1e-6);
        return _this;
    }
    AdagradOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
        if (this.accumulatedSquaredGradients.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.accumulatedSquaredGradients.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
    };
    AdagradOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var oldVariable = activationArrayMap.get(node.output);
                var gradient = _this.variableGradients.get(node.output);
                var oldCache = _this.accumulatedSquaredGradients.get(node.output);
                var gradientSquare = math.multiply(gradient, gradient);
                var cache = math.add(oldCache, gradientSquare);
                var variable = math.scaledArrayAdd(_this.c, math.divide(gradient, math.add(math.sqrt(cache), _this.eps)), _this.one, oldVariable);
                _this.accumulatedSquaredGradients.set(node.output, keep(cache));
                activationArrayMap.set(node.output, keep(variable));
                node.data = variable;
                oldVariable.dispose();
                oldCache.dispose();
            });
        });
        this.variableGradients.dispose();
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
    };
    AdagradOptimizer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.m.dispose();
        this.eps.dispose();
        this.accumulatedSquaredGradients.dispose();
    };
    return AdagradOptimizer;
}(optimizer_1.Optimizer));
exports.AdagradOptimizer = AdagradOptimizer;
//# sourceMappingURL=adagrad_optimizer.js.map