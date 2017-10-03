"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var argminmax_gpu = require("./argminmax_gpu");
var ArgMaxEqualsProgram = (function () {
    function ArgMaxEqualsProgram(aSize, bSize) {
        this.variableNames = ['A', 'B'];
        this.outputShape = [];
        this.params = [];
        var aSnippet = argminmax_gpu.getArgMinMaxSnippet('max', 'A', aSize);
        var bSnippet = argminmax_gpu.getArgMinMaxSnippet('max', 'B', bSize);
        this.userCode = "\n      " + aSnippet + "\n      " + bSnippet + "\n\n      void main() {\n        float argMaxA = getArgMinMaxA();\n        float argMaxB = getArgMinMaxB();\n\n        float value;\n        if (isNaN(argMaxA)) {\n          value = argMaxA;\n        } else if (isNaN(argMaxB)) {\n          value = argMaxB;\n        } else {\n          value = float(argMaxA == argMaxB);\n        }\n\n        setOutput(value);\n      }\n    ";
    }
    return ArgMaxEqualsProgram;
}());
exports.ArgMaxEqualsProgram = ArgMaxEqualsProgram;
//# sourceMappingURL=argmaxequals_gpu.js.map