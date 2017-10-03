"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graph_1 = require("./graph");
var priority_queue = require("./priority_queue");
var priority_queue_1 = require("./priority_queue");
function getUnorderedEvaluationSet(nodes, terminatingNodes) {
    var terminatingNodeMap = {};
    var seen = {};
    var set = [];
    var visit = nodes.slice();
    terminatingNodes.forEach(function (node) { return terminatingNodeMap[node.id] = node; });
    var _loop_1 = function () {
        var cur = visit.pop();
        if (seen[cur.id] == null) {
            if (terminatingNodeMap[cur.id] == null) {
                Object.keys(cur.inputs)
                    .map(function (inputName) { return cur.inputs[inputName]; })
                    .forEach(function (input) { return visit.push(input.node); });
            }
            set.push(cur);
            seen[cur.id] = cur;
        }
    };
    while (visit.length !== 0) {
        _loop_1();
    }
    return set;
}
exports.getUnorderedEvaluationSet = getUnorderedEvaluationSet;
function getOrderedEvaluationSet(unorderedEvaluationSet) {
    var set = [];
    var nodeIndices = {};
    var pendingDependencies = {};
    var nodeQueue = new priority_queue_1.PriorityQueue(function (a, b) { return priority_queue.defaultCompare(pendingDependencies[a.id], pendingDependencies[b.id]); }, function (node, newIndex) { return nodeIndices[node.id] = newIndex; });
    unorderedEvaluationSet.forEach(function (node) { return pendingDependencies[node.id] = 0; });
    unorderedEvaluationSet.forEach(function (node) { return Object.keys(node.inputs)
        .map(function (key) { return node.inputs[key]; })
        .forEach(function (input) {
        if (unorderedEvaluationSet.indexOf(input.node) !== -1) {
            pendingDependencies[input.node.id]++;
        }
    }); });
    unorderedEvaluationSet.forEach(function (node) { return nodeQueue.enqueue(node); });
    while (!nodeQueue.empty()) {
        set.unshift(nodeQueue.dequeue());
        Object.keys(set[0].inputs).map(function (key) { return set[0].inputs[key]; }).forEach(function (input) {
            if (unorderedEvaluationSet.indexOf(input.node) === -1) {
                return;
            }
            pendingDependencies[input.node.id]--;
            nodeQueue.update(input.node, nodeIndices[input.node.id]);
        });
    }
    return set;
}
exports.getOrderedEvaluationSet = getOrderedEvaluationSet;
function isInputNode(node) {
    return Object.keys(node.inputs).length === 0;
}
exports.isInputNode = isInputNode;
function shouldBackProp(t) {
    return !(t.node instanceof graph_1.ConstantNode);
}
exports.shouldBackProp = shouldBackProp;
function isPassthroughNode(node, map) {
    var keys = Object.keys(node.inputs);
    for (var i = 0; i < keys.length; i++) {
        var input = node.inputs[keys[i]];
        if (map.get(input, true) === map.get(node.output, true)) {
            return true;
        }
    }
    return false;
}
exports.isPassthroughNode = isPassthroughNode;
//# sourceMappingURL=graph_util.js.map