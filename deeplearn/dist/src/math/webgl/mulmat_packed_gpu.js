"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var math_1 = require("../math");
var gpgpu_context_1 = require("./gpgpu_context");
var webgl_util = require("./webgl_util");
function getFragmentShaderSource(sharedDimension, aOrientation, bOrientation) {
    var sharedDimensionPacked = Math.ceil(sharedDimension / 2);
    var aSample = (aOrientation === math_1.MatrixOrientation.REGULAR) ?
        'center, resultUV.t' :
        'resultUV.t, center';
    var bSample = (bOrientation === math_1.MatrixOrientation.REGULAR) ?
        'resultUV.s, center' :
        'center, resultUV.s';
    var aSwizzle = (aOrientation === math_1.MatrixOrientation.REGULAR) ? ['a.xxzz', 'a.yyww'] :
        ['a.xxyy', 'a.zzww'];
    var bSwizzle = (bOrientation === math_1.MatrixOrientation.REGULAR) ? ['b.xyxy', 'b.zwzw'] :
        ['b.xzxz', 'b.ywyw'];
    return "\n    precision highp float;\n    uniform sampler2D matrixA;\n    uniform sampler2D matrixB;\n    varying vec2 resultUV;\n\n    const float sharedDimension = " + sharedDimensionPacked + ".0;\n\n    vec4 dot2x2ARowBCol() {\n      vec4 result = vec4(0, 0, 0, 0);\n      for (int ii = 0; ii < " + sharedDimensionPacked + "; ii++) {\n        float i = float(ii);\n        float center = (i + 0.5) / sharedDimension;\n        vec4 a = texture2D(matrixA, vec2(" + aSample + "));\n        vec4 b = texture2D(matrixB, vec2(" + bSample + "));\n        result +=\n          (" + aSwizzle[0] + " * " + bSwizzle[0] + ") + (" + aSwizzle[1] + " * " + bSwizzle[1] + ");\n      }\n      return result;\n    }\n\n    void main() {\n      gl_FragColor = dot2x2ARowBCol();\n    }";
}
exports.getFragmentShaderSource = getFragmentShaderSource;
function multiplyMatrixPacked(gpgpu, multiplyProgram, a, b, result, resultShapeRowCol) {
    gpgpu.setOutputPackedMatrixTexture(result, resultShapeRowCol[0], resultShapeRowCol[1]);
    gpgpu.setProgram(multiplyProgram);
    var matrixASamplerLocation = webgl_util.getProgramUniformLocationOrThrow(gpgpu.gl, multiplyProgram, 'matrixA');
    var matrixBSamplerLocation = webgl_util.getProgramUniformLocationOrThrow(gpgpu.gl, multiplyProgram, 'matrixB');
    gpgpu.setInputMatrixTexture(a, matrixASamplerLocation, 0);
    gpgpu.setInputMatrixTexture(b, matrixBSamplerLocation, 1);
    gpgpu.executeProgram();
}
exports.multiplyMatrixPacked = multiplyMatrixPacked;
function uploadMultiplyMatrixPackedDownload(a, aShapeRowCol, b, bShapeRowCol, aOrientation, bOrientation) {
    if (aOrientation === void 0) { aOrientation = math_1.MatrixOrientation.REGULAR; }
    if (bOrientation === void 0) { bOrientation = math_1.MatrixOrientation.REGULAR; }
    var resultNumRows = (aOrientation === math_1.MatrixOrientation.REGULAR) ?
        aShapeRowCol[0] :
        aShapeRowCol[1];
    var resultNumCols = (bOrientation === math_1.MatrixOrientation.REGULAR) ?
        bShapeRowCol[1] :
        bShapeRowCol[0];
    var sharedDimension = (aOrientation === math_1.MatrixOrientation.REGULAR) ?
        aShapeRowCol[1] :
        aShapeRowCol[0];
    var gpgpu = new gpgpu_context_1.GPGPUContext();
    var program = gpgpu.createProgram(getFragmentShaderSource(sharedDimension, aOrientation, bOrientation));
    var aTexture = gpgpu.createPackedMatrixTexture(aShapeRowCol[0], aShapeRowCol[1]);
    var bTexture = gpgpu.createPackedMatrixTexture(bShapeRowCol[0], bShapeRowCol[1]);
    var resultTexture = gpgpu.createPackedMatrixTexture(resultNumRows, resultNumCols);
    gpgpu.uploadMatrixToPackedTexture(aTexture, aShapeRowCol[0], aShapeRowCol[1], a);
    gpgpu.uploadMatrixToPackedTexture(bTexture, bShapeRowCol[0], bShapeRowCol[1], b);
    multiplyMatrixPacked(gpgpu, program, aTexture, bTexture, resultTexture, [resultNumRows, resultNumCols]);
    var result = gpgpu.downloadMatrixFromPackedTexture(resultTexture, resultNumRows, resultNumCols);
    gpgpu.deleteMatrixTexture(aTexture);
    gpgpu.deleteMatrixTexture(bTexture);
    gpgpu.deleteMatrixTexture(resultTexture);
    gpgpu.deleteProgram(program);
    gpgpu.dispose();
    return result;
}
exports.uploadMultiplyMatrixPackedDownload = uploadMultiplyMatrixPackedDownload;
//# sourceMappingURL=mulmat_packed_gpu.js.map