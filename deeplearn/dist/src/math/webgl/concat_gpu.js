"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var concat_util = require("../concat_util");
var ConcatProgram = (function () {
    function ConcatProgram(aShape, bShape, axis) {
        this.variableNames = ['A', 'B'];
        this.params = [];
        this.outputShape = [];
        var yAxes = ['yR', 'yC', 'yD', 'yW'];
        var concatAxis = yAxes[axis];
        this.params = [axis];
        this.outputShape = concat_util.computeOutShape(aShape, bShape, axis);
        var dType = getDataType(aShape.length);
        var unpackSnippet = getUnpack(aShape.length);
        var sampleCoords = getSampleCoords(aShape.length);
        this.userCode = "\n      void main() {\n        " + dType + " coords = getOutputCoords();\n        " + unpackSnippet + "\n\n        float value = 0.0;\n        if (" + concatAxis + " < " + aShape[axis] + ") {\n          value = getA(" + sampleCoords + ");\n        } else {\n          " + concatAxis + " -= " + aShape[axis] + ";\n          value = getB(" + sampleCoords + ");\n        }\n\n        setOutput(value);\n      }\n    ";
    }
    return ConcatProgram;
}());
exports.ConcatProgram = ConcatProgram;
function getSampleCoords(rank) {
    if (rank === 1) {
        return 'yR';
    }
    else if (rank === 2) {
        return 'yR, yC';
    }
    else if (rank === 3) {
        return 'yR, yC, yD';
    }
    else if (rank === 4) {
        return 'yR, yC, yD, yW';
    }
    else {
        throw Error("Concat for rank " + rank + " is not yet supported");
    }
}
function getUnpack(rank) {
    var res = rank === 1 ? 'int yR = coords;' : 'int yR = coords.x;';
    if (rank > 1) {
        res += '\nint yC = coords.y;';
    }
    if (rank > 2) {
        res += '\nint yD = coords.z;';
    }
    if (rank > 3) {
        res += '\nint yW = coords.w;';
    }
    if (rank > 4) {
        throw Error("Concat for rank " + rank + " is not yet supported");
    }
    return res;
}
function getDataType(rank) {
    if (rank === 1) {
        return 'int';
    }
    else if (rank === 2) {
        return 'ivec2';
    }
    else if (rank === 3) {
        return 'ivec3';
    }
    else if (rank === 4) {
        return 'ivec4';
    }
    else {
        throw Error("Concat for rank " + rank + " is not yet supported");
    }
}
//# sourceMappingURL=concat_gpu.js.map