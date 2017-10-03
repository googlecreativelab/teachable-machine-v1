"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReduceSumProgram = (function () {
    function ReduceSumProgram(size) {
        this.size = size;
        this.variableNames = ['A'];
        this.params = [];
        this.outputShape = [];
        var sizeNearestVec4 = Math.floor(size / 4) * 4;
        var sizeVec4Remainder = size % 4;
        var r1 = sizeNearestVec4;
        var r2 = sizeNearestVec4 + 1;
        var r3 = sizeNearestVec4 + 2;
        this.userCode = "\n      void main() {\n        const vec2 ones2 = vec2(1);\n        const vec3 ones3 = vec3(1);\n        const vec4 ones4 = vec4(1);\n\n        float sum = 0.0;\n        for (int i = 0; i < " + sizeNearestVec4 + "; i += 4) {\n          vec4 aVec = vec4(getAFlat(i), getAFlat(i+1),\n                           getAFlat(i+2), getAFlat(i+3));\n          sum += dot(ones4, aVec);\n        }\n\n        if (" + (sizeVec4Remainder === 1) + ") {\n          sum += getAFlat(" + r1 + ");\n        } else if (" + (sizeVec4Remainder === 2) + ") {\n          vec2 aVec = vec2(getAFlat(" + r1 + "), getAFlat(" + r2 + "));\n          sum += dot(ones2, aVec);\n        } else if (" + (sizeVec4Remainder === 3) + ") {\n          vec3 aVec = vec3(getAFlat(" + r1 + "), getAFlat(" + r2 + "), getAFlat(" + r3 + "));\n          sum += dot(ones3, aVec);\n        }\n\n        setOutput(sum);\n      }\n    ";
    }
    return ReduceSumProgram;
}());
exports.ReduceSumProgram = ReduceSumProgram;
//# sourceMappingURL=reducesum_gpu.js.map