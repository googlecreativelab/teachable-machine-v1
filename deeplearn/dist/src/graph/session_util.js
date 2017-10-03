"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var graph_1 = require("./graph");
var graph_util = require("./graph_util");
function getTerminatingNodesFromFeedDictionary(feedDictionary) {
    return Object.keys(feedDictionary.dict)
        .map(function (tensorID) { return feedDictionary.dict[+tensorID].tensor.node; });
}
exports.getTerminatingNodesFromFeedDictionary = getTerminatingNodesFromFeedDictionary;
function getOrderedEvaluationSetFromEvalTensor(evalTensors, feedDictionary) {
    var terminatingNodes = getTerminatingNodesFromFeedDictionary(feedDictionary);
    var evalNodes = evalTensors.map(function (x) { return x.node; });
    var unorderedEvaluationSet = graph_util.getUnorderedEvaluationSet(evalNodes, terminatingNodes);
    var orderedEvaluationSet = graph_util.getOrderedEvaluationSet(unorderedEvaluationSet);
    return orderedEvaluationSet;
}
exports.getOrderedEvaluationSetFromEvalTensor = getOrderedEvaluationSetFromEvalTensor;
function addPersistentArraysToTensorArrayMap(evaluationSet, tensorArrayMap) {
    evaluationSet.forEach(function (node) {
        if (node instanceof graph_1.VariableNode || node instanceof graph_1.ConstantNode) {
            tensorArrayMap.set(node.output, node.data);
        }
    });
}
exports.addPersistentArraysToTensorArrayMap = addPersistentArraysToTensorArrayMap;
function getVariableNodesFromEvaluationSet(evaluationSet) {
    var nodes = [];
    evaluationSet.forEach(function (node) {
        if (node instanceof graph_1.VariableNode) {
            nodes.push(node);
        }
    });
    return nodes;
}
exports.getVariableNodesFromEvaluationSet = getVariableNodesFromEvaluationSet;
function throwIfFeedDictionaryContainsNDArrays(feedDictionary) {
    Object.keys(feedDictionary.dict).forEach(function (tensorID) {
        if (feedDictionary.dict[+tensorID].data instanceof ndarray_1.NDArray) {
            throw new Error('training requires FeedDictionary entries to be InputProviders' +
                'and not NDArrays.');
        }
    });
}
exports.throwIfFeedDictionaryContainsNDArrays = throwIfFeedDictionaryContainsNDArrays;
function loadInputsFromFeedDictionaryToTensorArrayMap(batchFeed, activations, math) {
    Object.keys(batchFeed.dict).forEach(function (tensorID) {
        var feedEntry = batchFeed.dict[+tensorID];
        var data;
        if (feedEntry.data instanceof ndarray_1.NDArray) {
            data = feedEntry.data;
        }
        else {
            var provider = feedEntry.data;
            data = provider.getNextCopy(math);
        }
        util.assert(util.arraysEqual(feedEntry.tensor.shape, data.shape), "Error loading FeedEntry: feeding NDArray of shape " + data.shape + " " +
            ("does not match Tensor (id: " + feedEntry.tensor.id + ") shape: ") +
            (feedEntry.tensor.shape + "."));
        activations.set(feedEntry.tensor, data);
    });
}
exports.loadInputsFromFeedDictionaryToTensorArrayMap = loadInputsFromFeedDictionaryToTensorArrayMap;
function releaseFeedDictionaryInputsFromTensorArrayMap(batchFeed, activations, math) {
    Object.keys(batchFeed.dict).forEach(function (tensorID) {
        var feedEntry = batchFeed.dict[+tensorID];
        if (!(feedEntry.data instanceof ndarray_1.NDArray)) {
            var provider = feedEntry.data;
            var feedEntryArray = activations.get(feedEntry.tensor);
            provider.disposeCopy(math, feedEntryArray);
        }
        activations.delete(feedEntry.tensor);
    });
}
exports.releaseFeedDictionaryInputsFromTensorArrayMap = releaseFeedDictionaryInputsFromTensorArrayMap;
function removeFeedDictionaryNodesFromEvaluationSet(feedDictionary, evaluationSet) {
    var i = 0;
    while (i < evaluationSet.length) {
        var node = evaluationSet[i];
        if (feedDictionary.dict[node.output.id] != null) {
            evaluationSet.splice(i, 1);
        }
        else {
            ++i;
        }
    }
}
exports.removeFeedDictionaryNodesFromEvaluationSet = removeFeedDictionaryNodesFromEvaluationSet;
function disposeAndInitializeOperationOutputs(evaluationSet, tensorArrayMap) {
    evaluationSet.forEach(function (node) {
        if (!graph_util.isInputNode(node)) {
            if (!graph_util.isPassthroughNode(node, tensorArrayMap)) {
                tensorArrayMap.disposeArray(node.output);
            }
            tensorArrayMap.set(node.output, null);
        }
    });
}
exports.disposeAndInitializeOperationOutputs = disposeAndInitializeOperationOutputs;
function disposeAndInitializeOperationInputGradients(evaluationSet, gradients) {
    evaluationSet.forEach(function (node) {
        Object.keys(node.inputs).forEach(function (inputName) {
            var input = node.inputs[inputName];
            if (gradients.get(input, true) !== gradients.get(node.output, true)) {
                gradients.disposeArray(input);
            }
            gradients.nullify(input);
        });
    });
}
exports.disposeAndInitializeOperationInputGradients = disposeAndInitializeOperationInputGradients;
function disposeTransientOperationArrays(operations, activations, gradients) {
    operations.forEach(function (op) { return op.disposeTransientArrays(activations, gradients); });
}
exports.disposeTransientOperationArrays = disposeTransientOperationArrays;
function throwErrorIfEvaluationSetContainsPlaceholderNodes(evaluationSet) {
    evaluationSet.forEach(function (node) {
        if (node instanceof graph_1.PlaceholderNode) {
            var shape = '[' + node.output.shape.join(', ') + ']';
            throw new Error('Placeholder node "' + node.name + '" ' + shape +
                ' not present in feed dictionary.');
        }
    });
}
exports.throwErrorIfEvaluationSetContainsPlaceholderNodes = throwErrorIfEvaluationSetContainsPlaceholderNodes;
//# sourceMappingURL=session_util.js.map