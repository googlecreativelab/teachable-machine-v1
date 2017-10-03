"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../../environment");
var tex_util = require("./tex_util");
var webgl_util = require("./webgl_util");
function getWebGLContextAttributes() {
    return {
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        depth: false,
        stencil: false,
        failIfMajorPerformanceCaveat: true
    };
}
exports.getWebGLContextAttributes = getWebGLContextAttributes;
function createWebGLContext(canvas) {
    var attributes = getWebGLContextAttributes();
    var gl;
    if (canvas != null) {
        gl = webgl_util.createWebGLRenderingContextFromCanvas(canvas, attributes);
    }
    else {
        gl = webgl_util.createWebGLRenderingContext(attributes);
    }
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.DEPTH_TEST); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.STENCIL_TEST); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.BLEND); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.DITHER); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.POLYGON_OFFSET_FILL); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.SAMPLE_COVERAGE); });
    webgl_util.callAndCheck(gl, function () { return gl.enable(gl.SCISSOR_TEST); });
    webgl_util.callAndCheck(gl, function () { return gl.enable(gl.CULL_FACE); });
    webgl_util.callAndCheck(gl, function () { return gl.cullFace(gl.BACK); });
    return gl;
}
exports.createWebGLContext = createWebGLContext;
function createVertexShader(gl) {
    var vertexShaderSource = "\n    precision highp float;\n    attribute vec3 clipSpacePos;\n    attribute vec2 uv;\n    varying vec2 resultUV;\n\n    void main() {\n      gl_Position = vec4(clipSpacePos, 1);\n      resultUV = uv;\n    }";
    return webgl_util.createVertexShader(gl, vertexShaderSource);
}
exports.createVertexShader = createVertexShader;
function createVertexBuffer(gl) {
    var vertexArray = new Float32Array([-1, 1, 0, 0, 1, -1, -1, 0, 0, 0, 1, 1, 0, 1, 1, 1, -1, 0, 1, 0]);
    return webgl_util.createStaticVertexBuffer(gl, vertexArray);
}
exports.createVertexBuffer = createVertexBuffer;
function createIndexBuffer(gl) {
    var triangleVertexIndices = new Uint16Array([0, 1, 2, 2, 1, 3]);
    return webgl_util.createStaticIndexBuffer(gl, triangleVertexIndices);
}
exports.createIndexBuffer = createIndexBuffer;
function getTextureInternalFormat(gl, numChannels) {
    if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        return gl.RGBA;
    }
    if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
        if (numChannels === 4) {
            return gl.RGBA32F;
        }
        return gl.R32F;
    }
    return gl.RGBA;
}
function getTextureFormat(gl, numChannels) {
    if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        return gl.RGBA;
    }
    if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
        if (numChannels === 4) {
            return gl.RGBA;
        }
        return gl.RED;
    }
    return gl.RGBA;
}
function getTextureType(gl) {
    if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        return gl.UNSIGNED_BYTE;
    }
    return gl.FLOAT;
}
function createAndConfigureTexture(gl, width, height, numChannels) {
    webgl_util.validateTextureSize(gl, width, height);
    var texture = webgl_util.createTexture(gl);
    var tex2d = gl.TEXTURE_2D;
    var internalFormat = getTextureInternalFormat(gl, numChannels);
    var format = getTextureFormat(gl, numChannels);
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(tex2d, texture); });
    webgl_util.callAndCheck(gl, function () { return gl.texParameteri(tex2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); });
    webgl_util.callAndCheck(gl, function () { return gl.texParameteri(tex2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); });
    webgl_util.callAndCheck(gl, function () { return gl.texParameteri(tex2d, gl.TEXTURE_MIN_FILTER, gl.NEAREST); });
    webgl_util.callAndCheck(gl, function () { return gl.texParameteri(tex2d, gl.TEXTURE_MAG_FILTER, gl.NEAREST); });
    webgl_util.callAndCheck(gl, function () { return gl.texImage2D(tex2d, 0, internalFormat, width, height, 0, format, getTextureType(gl), null); });
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, null); });
    return texture;
}
function createMatrixTexture(gl, rows, columns) {
    var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns), width = _a[0], height = _a[1];
    var numChannels = 1;
    return createAndConfigureTexture(gl, width, height, numChannels);
}
exports.createMatrixTexture = createMatrixTexture;
function createColorMatrixTexture(gl, rows, columns) {
    var _a = tex_util.getColorMatrixTextureShapeWidthHeight(rows, columns), width = _a[0], height = _a[1];
    var numChannels = 4;
    return createAndConfigureTexture(gl, width, height, numChannels);
}
exports.createColorMatrixTexture = createColorMatrixTexture;
function createPackedMatrixTexture(gl, rows, columns) {
    var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns), width = _a[0], height = _a[1];
    var numChannels = 4;
    return createAndConfigureTexture(gl, width, height, numChannels);
}
exports.createPackedMatrixTexture = createPackedMatrixTexture;
function bindVertexProgramAttributeStreams(gl, program, vertexBuffer) {
    var posOffset = 0;
    var uvOffset = 3 * 4;
    var stride = (3 * 4) + (2 * 4);
    webgl_util.callAndCheck(gl, function () { return gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); });
    webgl_util.bindVertexBufferToProgramAttribute(gl, program, 'clipSpacePos', vertexBuffer, 3, stride, posOffset);
    try {
        webgl_util.bindVertexBufferToProgramAttribute(gl, program, 'uv', vertexBuffer, 2, stride, uvOffset);
    }
    catch (e) {
        if (!e.hasOwnProperty('namedVertexAttributeNotFound')) {
            throw e;
        }
    }
}
exports.bindVertexProgramAttributeStreams = bindVertexProgramAttributeStreams;
function uploadPixelDataToTexture(gl, texture, pixels) {
    var numChannels = 4;
    var internalFormat = getTextureInternalFormat(gl, numChannels);
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, texture); });
    webgl_util.callAndCheck(gl, function () { return gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, gl.RGBA, getTextureType(gl), pixels); });
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, null); });
}
exports.uploadPixelDataToTexture = uploadPixelDataToTexture;
function uploadDataToTexture(gl, texture, width, height, data, numChannels) {
    var textureFormat = getTextureFormat(gl, numChannels);
    webgl_util.validateTextureSize(gl, width, height);
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, texture); });
    webgl_util.callAndCheck(gl, function () { return gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, textureFormat, getTextureType(gl), data); });
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, null); });
}
function uploadMatrixToTexture(gl, texture, rows, columns, matrix, numChannels) {
    var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    var unpackedArray;
    if (environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        var channelsPerTexture = numChannels === 1 ? webgl_util.getChannelsPerTexture() : numChannels;
        if (channelsPerTexture === 1) {
            unpackedArray = matrix;
        }
        else {
            unpackedArray =
                new Float32Array(tex_util.getUnpackedArraySizeFromMatrixSize(matrix.length, channelsPerTexture));
            tex_util.encodeMatrixToUnpackedArray(matrix, unpackedArray, channelsPerTexture);
        }
    }
    else {
        unpackedArray = tex_util.encodeFloatArray(matrix);
    }
    uploadDataToTexture(gl, texture, w, h, unpackedArray, numChannels);
}
exports.uploadMatrixToTexture = uploadMatrixToTexture;
function uploadMatrixToPackedTexture(gl, texture, rows, columns, matrix) {
    var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    var packedRGBA = new Float32Array(tex_util.getPackedRGBAArraySizeFromMatrixShape(rows, columns));
    tex_util.encodeMatrixToPackedRGBA(matrix, rows, columns, packedRGBA);
    var numChannels = 4;
    uploadDataToTexture(gl, texture, w, h, packedRGBA, numChannels);
}
exports.uploadMatrixToPackedTexture = uploadMatrixToPackedTexture;
function downloadMatrixFromOutputTexture(gl, rows, columns) {
    var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    var channelsPerTexture = 4;
    var isFloatTexture = environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED');
    var downloadTarget;
    if (isFloatTexture) {
        downloadTarget =
            new Float32Array(tex_util.getUnpackedArraySizeFromMatrixSize(rows * columns, channelsPerTexture));
    }
    else {
        downloadTarget = new Uint8Array(rows * columns * channelsPerTexture);
    }
    webgl_util.callAndCheck(gl, function () { return gl.readPixels(0, 0, w, h, gl.RGBA, getTextureType(gl), downloadTarget); });
    if (isFloatTexture) {
        var matrix = new Float32Array(rows * columns);
        tex_util.decodeMatrixFromUnpackedArray(downloadTarget, matrix, channelsPerTexture);
        return matrix;
    }
    else {
        return tex_util.decodeToFloatArray(downloadTarget);
    }
}
exports.downloadMatrixFromOutputTexture = downloadMatrixFromOutputTexture;
function downloadMatrixFromPackedOutputTexture(gl, rows, columns) {
    var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    var packedRGBA = new Float32Array(tex_util.getPackedRGBAArraySizeFromMatrixShape(rows, columns));
    webgl_util.callAndCheck(gl, function () { return gl.readPixels(0, 0, w, h, gl.RGBA, getTextureType(gl), packedRGBA); });
    var matrix = new Float32Array(rows * columns);
    return tex_util.decodeMatrixFromPackedRGBA(packedRGBA, rows, columns, matrix);
}
exports.downloadMatrixFromPackedOutputTexture = downloadMatrixFromPackedOutputTexture;
//# sourceMappingURL=gpgpu_util.js.map