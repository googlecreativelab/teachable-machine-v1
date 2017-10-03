"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LogSumExpProgram = (function () {
    function LogSumExpProgram(size) {
        this.variableNames = ['A'];
        this.params = [];
        this.outputShape = [];
        var sizeNearestVec4 = Math.floor(size / 4) * 4;
        var sizeVec4Remainder = size % 4;
        var r1 = sizeNearestVec4;
        var r2 = sizeNearestVec4 + 1;
        var r3 = sizeNearestVec4 + 2;
        this.userCode = "\n      const vec2 ones2 = vec2(1, 1);\n      const vec3 ones3 = vec3(1, 1, 1);\n      const vec4 ones4 = vec4(1, 1, 1, 1);\n\n      void main() {\n        vec4 maxVec = vec4(getAFlat(0));\n        for (int i = 0; i < " + sizeNearestVec4 + "; i += 4) {\n          vec4 aVec = vec4(getAFlat(i), getAFlat(i+1),\n                           getAFlat(i+2), getAFlat(i+3));\n          maxVec = max(maxVec, aVec);\n        }\n        if (" + (sizeVec4Remainder === 1) + ") {\n          maxVec = max(maxVec, vec4(maxVec.xyz, getAFlat(" + r1 + ")));\n        } else if (" + (sizeVec4Remainder === 2) + ") {\n          vec2 aVec = vec2(getAFlat(" + r1 + "), getAFlat(" + r2 + "));\n          maxVec = max(maxVec, vec4(maxVec.xy, aVec));\n        } else if (" + (sizeVec4Remainder === 3) + ") {\n          vec3 aVec = vec3(getAFlat(" + r1 + "), getAFlat(" + r2 + "), getAFlat(" + r3 + "));\n          maxVec = max(maxVec, vec4(maxVec.x, aVec));\n        }\n        float finalMax = max(maxVec.x, max(maxVec.y, max(maxVec.z, maxVec.w)));\n\n        float expSum = 0.0;\n        for (int i = 0; i < " + sizeNearestVec4 + "; i += 4) {\n          vec4 aVec = vec4(getAFlat(i), getAFlat(i+1),\n                           getAFlat(i+2), getAFlat(i+3));\n          expSum += dot(ones4, exp(aVec - finalMax));\n        }\n        if (" + (sizeVec4Remainder === 1) + ") {\n          expSum += exp(getAFlat(" + r1 + ") - finalMax);\n        } else if (" + (sizeVec4Remainder === 2) + ") {\n          vec2 aVec = vec2(getAFlat(" + r1 + "), getAFlat(" + r2 + "));\n          expSum += dot(ones2, exp(aVec - finalMax));\n        } else if (" + (sizeVec4Remainder === 3) + ") {\n          vec3 aVec = vec3(getAFlat(" + r1 + "), getAFlat(" + r2 + "), getAFlat(" + r3 + "));\n          expSum += dot(ones3, exp(aVec - finalMax));\n        }\n\n        setOutput(finalMax + log(expSum));\n      }\n    ";
    }
    return LogSumExpProgram;
}());
exports.LogSumExpProgram = LogSumExpProgram;
//# sourceMappingURL=logsumexp_gpu.js.map