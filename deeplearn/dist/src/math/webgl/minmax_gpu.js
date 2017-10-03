"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MinMaxProgram = (function () {
    function MinMaxProgram(size, op) {
        this.variableNames = ['A'];
        this.outputShape = [];
        this.params = [op];
        var sizeNearestVec4 = Math.floor(size / 4) * 4;
        var sizeVec4Remainder = size % 4;
        var r1 = sizeNearestVec4;
        var r2 = sizeNearestVec4 + 1;
        var r3 = sizeNearestVec4 + 2;
        this.userCode = "\n      void main() {\n        vec4 bestVec = vec4(getAFlat(0));\n        for (int i = 0; i < " + sizeNearestVec4 + "; i += 4) {\n          vec4 aVec = vec4(getAFlat(i), getAFlat(i+1),\n                           getAFlat(i+2), getAFlat(i+3));\n          if (hasNaN(aVec)) {\n            setOutput(getNaN(aVec));\n            return;\n          }\n          bestVec = " + op + "(bestVec, aVec);\n        }\n        vec4 aVec;\n        if (" + (sizeVec4Remainder === 1) + ") {\n          aVec = vec4(bestVec.xyz, getAFlat(" + r1 + "));\n        } else if (" + (sizeVec4Remainder === 2) + ") {\n          aVec = vec4(bestVec.xy, vec2(getAFlat(" + r1 + "), getAFlat(" + r2 + ")));\n        } else if (" + (sizeVec4Remainder === 3) + ") {\n          aVec = vec4(bestVec.x,\n                      vec3(getAFlat(" + r1 + "), getAFlat(" + r2 + "), getAFlat(" + r3 + ")));\n        }\n        if (" + (sizeVec4Remainder > 0) + ") {\n          if (hasNaN(aVec)) {\n            setOutput(getNaN(aVec));\n            return;\n          }\n          bestVec = " + op + "(bestVec, aVec);\n        }\n\n        float final = " + op + "(bestVec.x, " + op + "(bestVec.y,\n                      " + op + "(bestVec.z, bestVec.w)));\n        setOutput(final);\n      }\n    ";
    }
    return MinMaxProgram;
}());
exports.MinMaxProgram = MinMaxProgram;
//# sourceMappingURL=minmax_gpu.js.map