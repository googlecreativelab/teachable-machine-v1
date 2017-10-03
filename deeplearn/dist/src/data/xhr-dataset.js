"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var dataset_1 = require("./dataset");
var PARSING_IMAGE_CANVAS_HEIGHT_PX = 1000;
function getXhrDatasetConfig(jsonConfigPath) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', jsonConfigPath);
        xhr.onload = function () {
            resolve(JSON.parse(xhr.responseText));
        };
        xhr.onerror = function (error) {
            reject(error);
        };
        xhr.send();
    });
}
exports.getXhrDatasetConfig = getXhrDatasetConfig;
var XhrDataset = (function (_super) {
    __extends(XhrDataset, _super);
    function XhrDataset(xhrDatasetConfig) {
        var _this = _super.call(this, xhrDatasetConfig.data.map(function (x) { return x.shape; })) || this;
        _this.xhrDatasetConfig = xhrDatasetConfig;
        return _this;
    }
    XhrDataset.prototype.getNDArray = function (info) {
        var dataPromise = info.dataType === 'png' ?
            parseTypedArrayFromPng(info, info.shape) :
            parseTypedArrayFromBinary(info);
        return dataPromise.then(function (data) {
            var inputSize = util.sizeFromShape(info.shape);
            var ndarrays = [];
            for (var i = 0; i < data.length / inputSize; i++) {
                var values = data.subarray(i * inputSize, (i + 1) * inputSize);
                var ndarray = ndarray_1.NDArray.make(info.shape, { values: new Float32Array(values) });
                ndarrays.push(ndarray);
            }
            return ndarrays;
        });
    };
    XhrDataset.prototype.fetchData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promises = _this.xhrDatasetConfig.data.map(function (x) { return _this.getNDArray(x); });
            Promise.all(promises).then(function (data) {
                _this.dataset = data;
                resolve();
            });
        });
    };
    return XhrDataset;
}(dataset_1.InMemoryDataset));
exports.XhrDataset = XhrDataset;
function parseTypedArrayFromBinary(info) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', info.path);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (event) {
            var data = (info.dataType === 'float32') ?
                new Float32Array(xhr.response) :
                new Uint8Array(xhr.response);
            resolve(data);
        };
        xhr.onerror = function (err) { return reject(err); };
        xhr.send();
    });
}
function parseGrayscaleImageData(data, result, resultOffset) {
    var idx = resultOffset;
    for (var i = 0; i < data.length; i += 4) {
        result[idx++] = data[i];
    }
}
function parseRGBImageData(data, result, resultOffset) {
    var idx = resultOffset;
    for (var i = 0; i < data.length; i += 4) {
        result[idx] = data[i];
        result[idx + 1] = data[i + 1];
        result[idx + 2] = data[i + 2];
        idx += 3;
    }
}
function parseImage(img, shape) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var N = img.height;
    var inputSize = util.sizeFromShape(shape);
    var result = new Uint8Array(N * inputSize);
    if (img.width !== shape[0] * shape[1]) {
        throw new Error("Image width (" + img.width + ") must be multiple of " +
            ("rows*columns (" + shape[0] + "*" + shape[1] + ") of the ndarray"));
    }
    canvas.width = img.width;
    canvas.height = PARSING_IMAGE_CANVAS_HEIGHT_PX;
    var sx = 0;
    var sWidth = canvas.width;
    var sHeight = canvas.height;
    var dx = 0;
    var dy = 0;
    var dWidth = sWidth;
    var dHeight = sHeight;
    var depth = shape[2];
    var offset = 0;
    var numPasses = Math.ceil(N / canvas.height);
    for (var pass = 0; pass < numPasses; ++pass) {
        var sy = pass * canvas.height;
        if ((pass === numPasses - 1) && (N % canvas.height > 0)) {
            canvas.height = N % canvas.height;
            sHeight = canvas.height;
            dHeight = sHeight;
        }
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        (depth === 1) ? parseGrayscaleImageData(data, result, offset) :
            parseRGBImageData(data, result, offset);
        offset += canvas.height * inputSize;
    }
    return result;
}
function parseTypedArrayFromPng(info, shape) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
        img.setAttribute('crossOrigin', '');
        img.onload = function () {
            var result = parseImage(img, shape);
            img.src = '';
            img = null;
            resolve(result);
        };
        img.src = info.path;
    });
}
//# sourceMappingURL=xhr-dataset.js.map