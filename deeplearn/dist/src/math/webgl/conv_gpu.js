"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Conv2DProgram = (function () {
    function Conv2DProgram(convInfo, hasBias) {
        this.variableNames = ['x', 'W'];
        if (hasBias) {
            this.variableNames.push('bias');
        }
        this.outputShape = convInfo.outShape;
        var biasSnippet = hasBias ? 'dotProd += getBias(d2);' : '';
        var _a = convInfo.inShape, xNumRows = _a[0], xNumCols = _a[1], inputDepth = _a[2];
        var padTop = convInfo.padInfo.top;
        var padLeft = convInfo.padInfo.left;
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        this.params = [strideHeight, strideWidth, hasBias, padLeft, padTop];
        var inputDepthNearestVec4 = Math.floor(inputDepth / 4) * 4;
        var inputDepthVec4Remainder = inputDepth % 4;
        this.userCode = "\n      const ivec2 strides = ivec2(" + strideHeight + ", " + strideWidth + ");\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec3 coords = getOutputCoords();\n        int d2 = coords.z;\n\n        ivec2 xRCCorner = coords.xy * strides - pads;\n        int xRCorner = xRCCorner.x;\n        int xCCorner = xRCCorner.y;\n\n        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          int xR = xRCorner + wR;\n\n          if (xR < 0 || xR >= " + xNumRows + ") {\n            continue;\n          }\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            int xC = xCCorner + wC;\n\n            if (xC < 0 || xC >= " + xNumCols + ") {\n              continue;\n            }\n\n            for (int d1 = 0; d1 < " + inputDepthNearestVec4 + "; d1 += 4) {\n              vec4 xValues = vec4(\n                getX(xR, xC, d1),\n                getX(xR, xC, d1 + 1),\n                getX(xR, xC, d1 + 2),\n                getX(xR, xC, d1 + 3)\n              );\n              vec4 wValues = vec4(\n                getW(wR, wC, d1, d2),\n                getW(wR, wC, d1 + 1, d2),\n                getW(wR, wC, d1 + 2, d2),\n                getW(wR, wC, d1 + 3, d2)\n              );\n\n              dotProd += dot(xValues, wValues);\n            }\n\n            if (" + (inputDepthVec4Remainder === 1) + ") {\n              dotProd +=\n                getX(xR, xC, " + inputDepthNearestVec4 + ") *\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2);\n            } else if (" + (inputDepthVec4Remainder === 2) + ") {\n              vec2 xValues = vec2(\n                getX(xR, xC, " + inputDepthNearestVec4 + "),\n                getX(xR, xC, " + inputDepthNearestVec4 + " + 1)\n              );\n              vec2 wValues = vec2(\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 1, d2)\n              );\n              dotProd += dot(xValues, wValues);\n            } else if (" + (inputDepthVec4Remainder === 3) + ") {\n              vec3 xValues = vec3(\n                getX(xR, xC, " + inputDepthNearestVec4 + "),\n                getX(xR, xC, " + inputDepthNearestVec4 + " + 1),\n                getX(xR, xC, " + inputDepthNearestVec4 + " + 2)\n              );\n              vec3 wValues = vec3(\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 1, d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 2, d2)\n              );\n              dotProd += dot(xValues, wValues);\n            }\n          }\n        }\n        " + biasSnippet + "\n        setOutput(dotProd);\n      }\n    ";
    }
    return Conv2DProgram;
}());
exports.Conv2DProgram = Conv2DProgram;
//# sourceMappingURL=conv_gpu.js.map