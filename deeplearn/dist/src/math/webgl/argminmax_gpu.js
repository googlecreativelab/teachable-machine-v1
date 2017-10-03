"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getArgMinMaxSnippet(op, texName, size) {
    var compOp = (op === 'min') ? '<' : '>';
    return "\n    float getArgMinMax" + texName + "() {\n      int bestIndex = 0;\n      float bestValue = get" + texName + "Flat(0);\n\n      for (int i = 0; i < " + size + "; i++) {\n        float candidate = get" + texName + "Flat(i);\n        if (isNaN(candidate)) {\n          return candidate;\n        }\n        if (candidate " + compOp + " bestValue) {\n          bestValue = candidate;\n          bestIndex = i;\n        }\n      }\n      return float(bestIndex);\n    }\n  ";
}
exports.getArgMinMaxSnippet = getArgMinMaxSnippet;
var ArgMinMaxProgram = (function () {
    function ArgMinMaxProgram(aSize, opType) {
        this.variableNames = ['A'];
        this.outputShape = [];
        this.params = [opType];
        var aSnippet = getArgMinMaxSnippet(opType, 'A', aSize);
        this.userCode = "\n      " + aSnippet + "\n\n      void main() {\n        setOutput(getArgMinMaxA());\n      }\n    ";
    }
    return ArgMinMaxProgram;
}());
exports.ArgMinMaxProgram = ArgMinMaxProgram;
//# sourceMappingURL=argminmax_gpu.js.map