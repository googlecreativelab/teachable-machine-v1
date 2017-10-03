"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var session_util = require("../session_util");
var tensor_array_map_1 = require("../tensor_array_map");
var Optimizer = (function () {
    function Optimizer(learningRate, specifiedVariableList) {
        this.learningRate = learningRate;
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
        this.one = ndarray_1.Scalar.new(1);
        if (specifiedVariableList != null) {
            this.specifiedVariableNodes = specifiedVariableList;
        }
    }
    Optimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        this.variableNodes = this.specifiedVariableNodes == null ?
            session_util.getVariableNodesFromEvaluationSet(runtime.nodes) :
            this.specifiedVariableNodes;
        if (batchSize !== this.prevBatchSize) {
            if (this.c != null) {
                this.c.dispose();
            }
            this.prevBatchSize = batchSize;
            this.c = ndarray_1.Scalar.new(-this.learningRate / batchSize);
        }
        this.variableNodes.forEach(function (node) { return _this.variableGradients.set(node.output, ndarray_1.NDArray.zeros(node.output.shape)); });
    };
    Optimizer.prototype.afterExample = function (math, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var gradient = gradientArrayMap.get(node.output);
                var accumulatedGradient = _this.variableGradients.get(node.output);
                _this.variableGradients.set(node.output, keep(math.add(gradient, accumulatedGradient)));
                accumulatedGradient.dispose();
            });
        });
    };
    Optimizer.prototype.dispose = function () {
        if (this.c != null) {
            this.c.dispose();
        }
        this.one.dispose();
    };
    return Optimizer;
}());
exports.Optimizer = Optimizer;
//# sourceMappingURL=optimizer.js.map