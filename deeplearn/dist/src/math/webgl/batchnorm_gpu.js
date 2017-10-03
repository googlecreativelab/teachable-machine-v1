"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../../util");
var BatchNormProgram = (function () {
    function BatchNormProgram(xShape, meanShape, varianceShape, offsetShape, scaleShape, varianceEpsilon) {
        this.params = [];
        this.outputShape = [];
        this.supportsBroadcasting = true;
        this.variableNames = ['x', 'mean', 'variance'];
        util.assertAndGetBroadcastedShape(xShape, meanShape);
        util.assertAndGetBroadcastedShape(xShape, varianceShape);
        var offsetSnippet = '0.0';
        if (offsetShape != null) {
            util.assertAndGetBroadcastedShape(xShape, offsetShape);
            this.variableNames.push('offset');
            offsetSnippet = 'getOffsetAtOutCoords()';
        }
        var scaleSnippet = '1.0';
        if (scaleShape != null) {
            util.assertAndGetBroadcastedShape(xShape, scaleShape);
            this.variableNames.push('scale');
            scaleSnippet = 'getScaleAtOutCoords()';
        }
        this.params = [varianceEpsilon];
        this.outputShape = xShape;
        this.userCode = "\n      void main() {\n        float x = getXAtOutCoords();\n        float mean = getMeanAtOutCoords();\n        float variance = getVarianceAtOutCoords();\n        float offset = " + offsetSnippet + ";\n        float scale = " + scaleSnippet + ";\n        float inv = scale / sqrt(variance + float(" + varianceEpsilon + "));\n        setOutput((x - mean) * inv + offset);\n      }\n    ";
    }
    return BatchNormProgram;
}());
exports.BatchNormProgram = BatchNormProgram;
//# sourceMappingURL=batchnorm_gpu.js.map