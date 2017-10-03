"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../../environment");
var util = require("../../util");
var tex_util = require("./tex_util");
function makeShader(inputsInfo, outputShape, userCode, broadcast) {
    var sampleSnippet = getSampleSnippet();
    var setOutputSnippet = getSetOutputSnippet();
    var inputPrefixSnippet = inputsInfo.map(function (x) { return "uniform sampler2D " + x.name + ";"; }).join('\n');
    var inputSamplingSnippet = inputsInfo.map(function (x) { return getInputSamplingSnippet(x, outputShape, broadcast); })
        .join('\n');
    var outTexShape = outputShape.texShape;
    var outputSamplingSnippet = getOutputSamplingSnippet(outputShape.logicalShape, outTexShape);
    var source = [
        SHADER_PREFIX, sampleSnippet, setOutputSnippet, inputPrefixSnippet,
        inputSamplingSnippet, outputSamplingSnippet, userCode
    ].join('\n');
    return source;
}
exports.makeShader = makeShader;
function getSampleSnippet() {
    return environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED') ?
        FLOAT_TEXTURE_SAMPLE_SNIPPET :
        UNSIGNED_BYTE_TEXTURE_SAMPLE_SNIPPET;
}
function getSetOutputSnippet() {
    return environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED') ?
        FLOAT_TEXTURE_SETOUTPUT_SNIPPET :
        UNSIGNED_BYTE_TEXTURE_SETOUTPUT_SNIPPET;
}
function getInputSamplingSnippet(inInfo, outShapeInfo, broadcast) {
    var shape = inInfo.shapeInfo.logicalShape;
    var texShape = inInfo.shapeInfo.texShape;
    var outTexShape = outShapeInfo.texShape;
    var res = '';
    switch (shape.length) {
        case 0:
            res += getSamplerScalar(inInfo.name);
            break;
        case 1:
            res += getSampler1D(inInfo.name, texShape);
            break;
        case 2:
            res += getSampler2D(inInfo.name, shape, texShape);
            break;
        case 3:
            res += getSampler3D(inInfo.name, shape, texShape);
            break;
        case 4:
            res += getSampler4D(inInfo.name, shape, texShape);
            break;
        default:
            throw new Error(shape.length + "-D input sampling" +
                " is not yet supported");
    }
    if (broadcast ||
        util.arraysEqual(inInfo.shapeInfo.logicalShape, outShapeInfo.logicalShape)) {
        res +=
            getSamplerAtOutputCoords(inInfo.name, texShape, outTexShape, broadcast);
    }
    res += getSamplerFlat(inInfo.name, texShape);
    return res;
}
function getOutputSamplingSnippet(outShape, outTexShape) {
    switch (outShape.length) {
        case 0:
            return '';
        case 1:
            return getOutput1DCoords(outShape, outTexShape);
        case 2:
            return getOutput2DCoords(outShape, outTexShape);
        case 3:
            return getOutput3DCoords(outShape, outTexShape);
        case 4:
            return getOutput4DCoords(outShape, outTexShape);
        default:
            throw new Error(outShape.length + "-D output sampling is not yet supported");
    }
}
var SAMPLE_1D_SNIPPET = "\nvec2 UVfrom1D(int texNumR, int texNumC, int index) {\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
var SAMPLE_2D_SNIPPET = "\nvec2 UVfrom2D(int texNumR, int texNumC, int numC, int row, int col) {\n  int index = row * numC + col;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
var SAMPLE_3D_SNIPPET = "\nvec2 UVfrom3D(int texNumR, int texNumC, int stride0,\n    int stride1, int row, int col, int depth) {\n  int index = row * stride0 + col * stride1 + depth;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
var SAMPLE_4D_SNIPPET = "\nvec2 UVfrom4D(int texNumR, int texNumC, int stride0,\n    int stride1, int stride2, int row, int col, int depth,\n    int depth2) {\n  int index = row * stride0 + col * stride1 + depth * stride2 + depth2;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
var UNSIGNED_BYTE_TEXTURE_SAMPLE_SNIPPET = "\n  uniform float NaN;\n\n  const vec4 floatDeltas = vec4(\n      1.0,\n      1.0 / 255.0,\n      1.0 / (255.0 * 255.0),\n      1.0 / (255.0 * 255.0 * 255.0)\n  );\n  const float minValue = " + tex_util.FLOAT_MIN + ".0;\n  const float maxValue = " + tex_util.FLOAT_MAX + ".0;\n  const float range = (maxValue - minValue) / 255.0;\n  const vec2 dotRange = vec2(1.0, range);\n\n  float sample(sampler2D texture, vec2 uv) {\n    vec4 sampleValue = texture2D(texture, uv);\n    if (all(equal(sampleValue, vec4(1)))) {\n      return NaN;\n    }\n\n    vec4 encValue = floor(sampleValue * 255.0 + 0.5);\n    float decodedValue = dot(encValue, floatDeltas);\n    return dot(vec2(minValue, decodedValue), dotRange);\n  }\n";
var UNSIGNED_BYTE_TEXTURE_SETOUTPUT_SNIPPET = "\n  const vec4 floatPowers = vec4(\n    1.0,\n    255.0,\n    255.0 * 255.0,\n    255.0 * 255.0 * 255.0\n  );\n  const vec2 recipRange = vec2(1.0/range);\n  const vec2 recipRange255 = vec2(1.0/(maxValue - minValue));\n\n  void setOutput(float decodedValue) {\n    if (isNaN(decodedValue)) {\n      gl_FragColor = vec4(254.0/255.0);\n      return;\n    }\n\n    float a = dot(vec2(decodedValue, -minValue), recipRange);\n    float b = fract(a) * 255.0;\n    float c = fract(b) * 255.0;\n    float d = fract(c) * 255.0;\n    gl_FragColor = floor(vec4(a, b, c, d)) / 255.0;\n\n    // TODO(dsmilkov): Version above gets better accuracy but probably slower\n    // than the version below. Benchmark to determine if the accuracy is worth\n    // the cost.\n\n    // float normValue = dot(vec2(decodedValue, -minValue), recipRange255);\n    // vec4 f = normValue * floatPowers;\n    // gl_FragColor = floor(fract(f) * 255.0) / 255.0;\n  }\n";
var FLOAT_TEXTURE_SAMPLE_SNIPPET = "\n  float sample(sampler2D texture, vec2 uv) {\n    return texture2D(texture, uv).r;\n  }\n";
var FLOAT_TEXTURE_SETOUTPUT_SNIPPET = "\n  void setOutput(float val) {\n    gl_FragColor = vec4(val, 0, 0, 0);\n  }\n";
var SHADER_PREFIX = "\n  precision highp float;\n  precision highp int;\n  varying vec2 resultUV;\n  const vec2 halfCR = vec2(0.5, 0.5);\n\n  bool isNaN(float val) {\n    return val >= " + tex_util.FLOAT_MAX + ".0 || (val == val ? false : true);\n  }\n\n  bool hasNaN(vec4 values) {\n    return any(notEqual(values, values));\n  }\n\n  float getNaN(vec4 values) {\n    return dot(vec4(1), values);\n  }\n\n  " + SAMPLE_1D_SNIPPET + "\n  " + SAMPLE_2D_SNIPPET + "\n  " + SAMPLE_3D_SNIPPET + "\n  " + SAMPLE_4D_SNIPPET + "\n";
function getOutput1DCoords(shape, texShape) {
    if (texShape[0] === 1) {
        return "\n      int getOutputCoords() {\n        return int(resultUV.x * " + texShape[1] + ".0);\n      }\n    ";
    }
    if (texShape[1] === 1) {
        return "\n      int getOutputCoords() {\n        return int(resultUV.y * " + texShape[0] + ".0);\n      }\n    ";
    }
    return "\n    int getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      return resTexRC.x * " + texShape[1] + " + resTexRC.y;\n    }\n  ";
}
function getOutput3DCoords(shape, texShape) {
    var stride0 = shape[1] * shape[2];
    var stride1 = shape[2];
    return "\n    ivec3 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n      int r = index / " + stride0 + ";\n      index -= r * " + stride0 + ";\n      int c = index / " + stride1 + ";\n      int d = index - c * " + stride1 + ";\n      return ivec3(r, c, d);\n    }\n  ";
}
function getOutput4DCoords(shape, texShape) {
    var stride2 = shape[3];
    var stride1 = shape[2] * stride2;
    var stride0 = shape[1] * stride1;
    return "\n    ivec4 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n        vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n\n      int r = index / " + stride0 + ";\n      index -= r * " + stride0 + ";\n\n      int c = index / " + stride1 + ";\n      index -= c * " + stride1 + ";\n\n      int d = index / " + stride2 + ";\n      int d2 = index - d * " + stride2 + ";\n\n      return ivec4(r, c, d, d2);\n    }\n  ";
}
function getOutput2DCoords(shape, texShape) {
    if (util.arraysEqual(shape, texShape)) {
        return "\n      ivec2 getOutputCoords() {\n        return ivec2(resultUV.yx * vec2(" + texShape[0] + ", " + texShape[1] + "));\n      }\n    ";
    }
    if (shape[1] === 1) {
        return "\n      ivec2 getOutputCoords() {\n        ivec2 resTexRC = ivec2(resultUV.yx *\n                               vec2(" + texShape[0] + ", " + texShape[1] + "));\n        int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n        return ivec2(index, 0);\n      }\n    ";
    }
    if (shape[0] === 1) {
        return "\n      ivec2 getOutputCoords() {\n        ivec2 resTexRC = ivec2(resultUV.yx *\n                               vec2(" + texShape[0] + ", " + texShape[1] + "));\n        int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n        return ivec2(0, index);\n      }\n    ";
    }
    return "\n    ivec2 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n      int r = index / " + shape[1] + ";\n      int c = index - r * " + shape[1] + ";\n      return ivec2(r, c);\n    }\n  ";
}
function getSamplerScalar(texName) {
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    return "\n    float " + funcName + "() {\n      return sample(" + texName + ", halfCR);\n    }\n  ";
}
function getSampler1D(texName, texShape) {
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    var tR = texShape[0];
    var tC = texShape[1];
    if (texShape[0] === 1 && texShape[1] === 1) {
        return "\n      float " + funcName + "(int index) {\n        return sample(" + texName + ", halfCR);\n      }\n    ";
    }
    if (texShape[1] === 1) {
        return "\n      float " + funcName + "(int index) {\n        vec2 uv = vec2(0.5, (float(index) + 0.5) / " + tR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    if (texShape[0] === 1) {
        return "\n      float " + funcName + "(int index) {\n        vec2 uv = vec2((float(index) + 0.5) / " + tC + ".0, 0.5);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    return "\n    float " + funcName + "(int index) {\n      vec2 uv = UVfrom1D(" + tR + ", " + tC + ", index);\n      return sample(" + texName + ", uv);\n    }\n  ";
}
function getSampler3D(texName, shape, texShape) {
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    var tR = texShape[0];
    var tC = texShape[1];
    var stride0 = shape[1] * shape[2];
    var stride1 = shape[2];
    if (tC === stride0) {
        return "\n      float " + funcName + "(int row, int col, int depth) {\n        int texR = row;\n        int texC = col * " + stride1 + " + depth;\n        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(" + tC + ".0, " + tR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    return "\n    float " + funcName + "(int row, int col, int depth) {\n      vec2 uv = UVfrom3D(" + tR + ", " + tC + ", " + stride0 + ", " + stride1 + ", row, col, depth);\n      return sample(" + texName + ", uv);\n    }\n  ";
}
function getSampler4D(texName, shape, texShape) {
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    var tR = texShape[0];
    var tC = texShape[1];
    var stride2 = shape[3];
    var stride1 = shape[2] * stride2;
    var stride0 = shape[1] * stride1;
    if (tC === stride0) {
        return "\n      float " + funcName + "(int row, int col, int depth, int depth2) {\n        int texR = row;\n        int texC = col * " + stride1 + " + depth * " + stride2 + " + depth2;\n        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(" + tC + ".0, " + tR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    return "\n    float " + funcName + "(int row, int col, int depth, int depth2) {\n      vec2 uv = UVfrom4D(" + tR + ", " + tC + ", " + stride0 + ", " + stride1 + ", " + stride2 + ",\n          row, col, depth, depth2);\n      return sample(" + texName + ", uv);\n    }\n  ";
}
function getSampler2D(texName, shape, texShape) {
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    var tR = texShape[0];
    var tC = texShape[1];
    if (util.arraysEqual(shape, texShape)) {
        return "\n      float " + funcName + "(int row, int col) {\n        vec2 uv = (vec2(col, row) + halfCR) / vec2(" + tC + ".0, " + tR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    if (tC === 1) {
        if (shape[0] === 1) {
            return "\n        float " + funcName + "(int row, int col) {\n          vec2 uv = vec2(0.5, (float(col) + 0.5) / " + tR + ".0);\n          return sample(" + texName + ", uv);\n        }\n      ";
        }
        if (shape[1] === 1) {
            return "\n        float " + funcName + "(int row, int col) {\n          vec2 uv = vec2(0.5, (float(row) + 0.5) / " + tR + ".0);\n          return sample(" + texName + ", uv);\n        }\n      ";
        }
        return "\n      float " + funcName + "(int row, int col) {\n        int index = row * " + shape[1] + " + col;\n        vec2 uv = vec2(0.5, (float(index) + 0.5) / " + tR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    if (tR === 1) {
        return "\n      float " + funcName + "(int row, int col) {\n        int index = row * " + shape[1] + " + col;\n        vec2 uv = vec2((float(index) + 0.5) / " + tC + ".0, 0.5);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    return "\n    float " + funcName + "(int row, int col) {\n      vec2 uv = UVfrom2D(" + tR + ", " + tC + ", " + shape[1] + ", row, col);\n      return sample(" + texName + ", uv);\n    }\n  ";
}
function getSamplerFlat(texName, texShape) {
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1) + 'Flat';
    var tNumR = texShape[0];
    var tNumC = texShape[1];
    if (tNumC === 1 && tNumR === 1) {
        return "\n      float " + funcName + "(int index) {\n        return sample(" + texName + ", halfCR);\n      }\n    ";
    }
    if (tNumC === 1) {
        return "\n      float " + funcName + "(int index) {\n        vec2 uv = vec2(0.5, (float(index) + 0.5) / " + tNumR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    if (tNumR === 1) {
        return "\n      float " + funcName + "(int index) {\n        vec2 uv = vec2((float(index) + 0.5) / " + tNumC + ".0, 0.5);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    return "\n    float " + funcName + "(int index) {\n      int texR = index / " + tNumC + ";\n      int texC = index - texR * " + tNumC + ";\n      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(" + tNumC + ".0, " + tNumR + ".0);\n      return sample(" + texName + ", uv);\n    }\n  ";
}
function getSamplerAtOutputCoords(texName, inTexShape, outTexShape, broadcast) {
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1) +
        'AtOutCoords';
    if (util.arraysEqual(inTexShape, outTexShape)) {
        return "\n      float " + funcName + "() {\n        return sample(" + texName + ", resultUV);\n      }\n    ";
    }
    var inSize = util.sizeFromShape(inTexShape);
    var broadcastSnippet = '';
    if (broadcast) {
        broadcastSnippet = "\n      int mainPart = index / " + inSize + ";\n      index -= mainPart * " + inSize + ";\n    ";
    }
    return "\n    float " + funcName + "() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + outTexShape[0] + ", " + outTexShape[1] + "));\n      int index = resTexRC.x * " + outTexShape[1] + " + resTexRC.y;\n      " + broadcastSnippet + "\n      int texR = index / " + inTexShape[1] + ";\n      int texC = index - texR * " + inTexShape[1] + ";\n      vec2 uv = (vec2(texC, texR) + halfCR) /\n                 vec2(" + inTexShape[1] + ".0, " + inTexShape[0] + ".0);\n      return sample(" + texName + ", uv);\n    }\n  ";
}
//# sourceMappingURL=shader_compiler.js.map