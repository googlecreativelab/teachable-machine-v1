"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var math_1 = require("../math");
var MatMulProgram = (function () {
    function MatMulProgram(aShape, bShape, aOrient, bOrient) {
        if (aOrient === void 0) { aOrient = math_1.MatrixOrientation.REGULAR; }
        if (bOrient === void 0) { bOrient = math_1.MatrixOrientation.REGULAR; }
        this.variableNames = ['matrixA', 'matrixB'];
        this.params = [aOrient, bOrient];
        var outerShapeA = (aOrient === math_1.MatrixOrientation.REGULAR) ? aShape[0] : aShape[1];
        var outerShapeB = (bOrient === math_1.MatrixOrientation.REGULAR) ? bShape[1] : bShape[0];
        this.outputShape = [outerShapeA, outerShapeB];
        var sharedDim = (aOrient === math_1.MatrixOrientation.REGULAR ? aShape[1] : aShape[0]);
        var aSnippetFromOffset = function (vec4Offset, indexVar) {
            return (aOrient === math_1.MatrixOrientation.REGULAR) ?
                "aRow, " + indexVar + " + " + vec4Offset :
                indexVar + " + " + vec4Offset + ", aRow";
        };
        var bSnippetFromOffset = function (vec4Offset, indexVar) {
            return (bOrient === math_1.MatrixOrientation.REGULAR) ?
                indexVar + " + " + vec4Offset + ", bCol" :
                "bCol, " + indexVar + " + " + vec4Offset;
        };
        var sharedDimNearestVec4 = Math.floor(sharedDim / 4) * 4;
        var sharedDimVec4Remainder = sharedDim % 4;
        this.userCode = " float dotARowBCol(int aRow, int bCol) {\n      float result = 0.0;\n      for (int i = 0; i < " + sharedDimNearestVec4 + "; i += 4) {\n        vec4 a = vec4(\n          getMatrixA(" + aSnippetFromOffset(0, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(1, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(2, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(3, 'i') + ")\n        );\n        vec4 b = vec4(\n          getMatrixB(" + bSnippetFromOffset(0, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(1, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(2, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(3, 'i') + ")\n        );\n\n        result += dot(a, b);\n      }\n\n      if (" + (sharedDimVec4Remainder === 1) + ") {\n        result += getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + ") *\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + ");\n      } else if (" + (sharedDimVec4Remainder === 2) + ") {\n        vec2 a = vec2(\n          getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(1, sharedDimNearestVec4) + ")\n        );\n        vec2 b = vec2(\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(1, sharedDimNearestVec4) + ")\n        );\n        result += dot(a, b);\n      } else if (" + (sharedDimVec4Remainder === 3) + ") {\n        vec3 a = vec3(\n          getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(1, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(2, sharedDimNearestVec4) + ")\n        );\n        vec3 b = vec3(\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(1, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(2, sharedDimNearestVec4) + ")\n        );\n        result += dot(a, b);\n      }\n\n      return result;\n    }\n\n    void main() {\n      ivec2 resRC = getOutputCoords();\n      setOutput(dotARowBCol(resRC.x, resRC.y));\n    }\n    ";
    }
    return MatMulProgram;
}());
exports.MatMulProgram = MatMulProgram;
//# sourceMappingURL=mulmat_gpu.js.map