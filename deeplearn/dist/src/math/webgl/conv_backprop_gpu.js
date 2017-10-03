"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var conv_util = require("../conv_util");
var Conv2DDerWeightsProgram = (function () {
    function Conv2DDerWeightsProgram(convInfo) {
        this.variableNames = ['x', 'dy'];
        var _a = convInfo.outShape, yNumRows = _a[0], yNumCols = _a[1], outDepth = _a[2];
        var _b = convInfo.inShape, xNumRows = _b[0], xNumCols = _b[1], inDepth = _b[2];
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        this.outputShape = conv_util.computeWeightsShape4D(inDepth, outDepth, convInfo.filterHeight, convInfo.filterWidth);
        var padTop = convInfo.padInfo.top;
        var padLeft = convInfo.padInfo.left;
        this.params = [strideHeight, strideWidth, padLeft, padTop];
        this.userCode = "\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int wR = coords.x;\n        int wC = coords.y;\n        int d1 = coords.z;\n        int d2 = coords.w;\n\n        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int yR = 0; yR < " + yNumRows + "; yR++) {\n          int xR = wR + yR * " + strideHeight + " - " + padTop + ";\n\n          if (xR < 0 || xR >= " + xNumRows + ") {\n            continue;\n          }\n\n          for (int yC = 0; yC < " + yNumCols + "; yC++) {\n            int xC = wC + yC * " + strideWidth + " - " + padLeft + ";\n\n            if (xC < 0 || xC >= " + xNumCols + ") {\n              continue;\n            }\n\n            float dyValue = getDy(yR, yC, d2);\n            float xValue = getX(xR, xC, d1);\n            dotProd += (xValue * dyValue);\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
    }
    return Conv2DDerWeightsProgram;
}());
exports.Conv2DDerWeightsProgram = Conv2DDerWeightsProgram;
var Conv2DDerInputProgram = (function () {
    function Conv2DDerInputProgram(convInfo) {
        this.variableNames = ['dy', 'W'];
        var _a = convInfo.outShape, yRows = _a[0], yCols = _a[1], outDepth = _a[2];
        this.outputShape = convInfo.inShape;
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var padTop = filterHeight - 1 - convInfo.padInfo.top;
        var padLeft = filterWidth - 1 - convInfo.padInfo.left;
        this.params = [strideHeight, strideWidth, padLeft, padTop];
        this.userCode = "\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec3 coords = getOutputCoords();\n        int d1 = coords.z;\n\n        ivec2 dyCorner = coords.xy - pads;\n        int dyRCorner = dyCorner.x;\n        int dyCCorner = dyCorner.y;\n\n        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          float dyR = float(dyRCorner + wR) / " + strideHeight + ".0;\n\n          if (dyR < 0.0 || dyR >= " + yRows + ".0 || fract(dyR) > 0.0) {\n            continue;\n          }\n          int idyR = int(dyR);\n\n          int wRPerm = " + filterHeight + " - 1 - wR;\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            float dyC = float(dyCCorner + wC) / " + strideWidth + ".0;\n\n            if (dyC < 0.0 || dyC >= " + yCols + ".0 || fract(dyC) > 0.0) {\n              continue;\n            }\n            int idyC = int(dyC);\n\n            int wCPerm = " + filterWidth + " - 1 - wC;\n\n            for (int d2 = 0; d2 < " + outDepth + "; d2++) {\n              float xValue = getDy(idyR, idyC, d2);\n              float wValue = getW(wRPerm, wCPerm, d1, d2);\n              dotProd += xValue * wValue;\n            }\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
    }
    return Conv2DDerInputProgram;
}());
exports.Conv2DDerInputProgram = Conv2DDerInputProgram;
var Conv2DDerBiasProgram = (function () {
    function Conv2DDerBiasProgram(yShape) {
        this.variableNames = ['dy'];
        this.params = [];
        var yNumRows = yShape[0], yNumCols = yShape[1], outputDepth = yShape[2];
        this.outputShape = [outputDepth];
        this.userCode = "\n      void main() {\n        int d2 = getOutputCoords();\n\n        float derBias = 0.0;\n        for (int yR = 0; yR < " + yNumRows + "; yR++) {\n          for (int yC = 0; yC < " + yNumCols + "; yC++) {\n            derBias += getDy(yR, yC, d2);\n          }\n        }\n        setOutput(derBias);\n      }\n    ";
    }
    return Conv2DDerBiasProgram;
}());
exports.Conv2DDerBiasProgram = Conv2DDerBiasProgram;
//# sourceMappingURL=conv_backprop_gpu.js.map