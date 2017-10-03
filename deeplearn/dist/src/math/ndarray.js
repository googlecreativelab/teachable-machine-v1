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
var environment_1 = require("../environment");
var util = require("../util");
var webgl_util = require("./webgl/webgl_util");
exports.GPGPU = null;
exports.TEXTURE_MANAGER = null;
function initializeGPU(gpgpu, textureManager) {
    exports.GPGPU = gpgpu;
    exports.TEXTURE_MANAGER = textureManager;
}
exports.initializeGPU = initializeGPU;
function throwIfGPUNotInitialized() {
    if (exports.GPGPU == null || exports.TEXTURE_MANAGER == null) {
        throw new Error('GPU not intialized.');
    }
}
var NDArray = (function () {
    function NDArray(shape, data) {
        util.assert(data.values != null || data.texture != null, 'Either `values` or `texture` must be defined');
        util.assert(data.texture == null || (data.textureShapeRC != null), '`textureShape` must be defined when `texture` is defined');
        this.size = util.sizeFromShape(shape);
        if (data.values != null) {
            util.assert(this.size === data.values.length, 'Constructing ndarray of shape (' + this.size + ') should match the' +
                ' length of values (' + data.values.length + ')');
        }
        this.shape = shape;
        this.data = data;
        var dim = this.shape.length;
        if (dim < 2) {
            this.strides = [];
        }
        else {
            this.strides = new Array(dim - 1);
            this.strides[dim - 2] = this.shape[dim - 1];
            for (var i = dim - 3; i >= 0; --i) {
                this.strides[i] = this.strides[i + 1] * this.shape[i + 1];
            }
        }
    }
    NDArray.zeros = function (shape) {
        var values = new Float32Array(util.sizeFromShape(shape));
        return NDArray.make(shape, { values: values });
    };
    NDArray.zerosLike = function (another) {
        return NDArray.zeros(another.shape);
    };
    NDArray.like = function (another) {
        var values = another.getValues();
        return NDArray.make(another.shape, { values: new Float32Array(values) });
    };
    NDArray.make = function (shape, data) {
        switch (shape.length) {
            case 0:
                return new Scalar(data);
            case 1:
                return new Array1D(data);
            case 2:
                return new Array2D(shape, data);
            case 3:
                return new Array3D(shape, data);
            case 4:
                return new Array4D(shape, data);
            default:
                return new NDArray(shape, data);
        }
    };
    NDArray.prototype.reshape = function (newShape) {
        newShape = util.inferFromImplicitShape(newShape, this.size);
        if (util.arraysEqual(this.shape, newShape)) {
            return this;
        }
        util.assert(this.size === util.sizeFromShape(newShape), 'new shape and old shape must have the same number of elements.');
        return NDArray.make(newShape, this.data);
    };
    NDArray.prototype.asScalar = function () {
        util.assert(this.size === 1, 'The array must have only 1 element.');
        return this.reshape([]);
    };
    NDArray.prototype.as1D = function () {
        return this.reshape([this.size]);
    };
    NDArray.prototype.as2D = function (rows, columns) {
        return this.reshape([rows, columns]);
    };
    NDArray.prototype.as3D = function (rows, columns, depth) {
        return this.reshape([rows, columns, depth]);
    };
    NDArray.prototype.as4D = function (rows, columns, depth, depth2) {
        return this.reshape([rows, columns, depth, depth2]);
    };
    Object.defineProperty(NDArray.prototype, "rank", {
        get: function () {
            return this.shape.length;
        },
        enumerable: true,
        configurable: true
    });
    NDArray.prototype.get = function () {
        var locs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            locs[_i] = arguments[_i];
        }
        var index = locs[locs.length - 1];
        for (var i = 0; i < locs.length - 1; ++i) {
            index += this.strides[i] * locs[i];
        }
        return this.getValues()[index];
    };
    NDArray.prototype.add = function (value) {
        var locs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            locs[_i - 1] = arguments[_i];
        }
        this.set.apply(this, [this.get.apply(this, locs) + value].concat(locs));
    };
    NDArray.prototype.set = function (value) {
        var locs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            locs[_i - 1] = arguments[_i];
        }
        var index = locs[locs.length - 1];
        for (var i = 0; i < locs.length - 1; ++i) {
            index += this.strides[i] * locs[i];
        }
        this.getValues()[index] = value;
    };
    NDArray.prototype.locToIndex = function (locs) {
        var index = locs[locs.length - 1];
        for (var i = 0; i < locs.length - 1; ++i) {
            index += this.strides[i] * locs[i];
        }
        return index;
    };
    NDArray.prototype.indexToLoc = function (index) {
        var locs = new Array(this.shape.length);
        for (var i = 0; i < locs.length - 1; ++i) {
            locs[i] = Math.floor(index / this.strides[i]);
            index -= locs[i] * this.strides[i];
        }
        locs[locs.length - 1] = index;
        return locs;
    };
    NDArray.prototype.fill = function (value) {
        this.getValues().fill(value);
    };
    NDArray.prototype.getData = function () {
        return this.data;
    };
    NDArray.prototype.getValues = function () {
        if (this.data.values == null) {
            throwIfGPUNotInitialized();
            this.data.values = exports.GPGPU.downloadMatrixFromTexture(this.data.texture, this.data.textureShapeRC[0], this.data.textureShapeRC[1]);
            this.disposeTexture();
        }
        return this.data.values;
    };
    NDArray.prototype.getValuesAsync = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.data.values != null) {
                resolve(_this.data.values);
                return;
            }
            if (!environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED')) {
                resolve(_this.getValues());
                return;
            }
            var queryFn = function () { };
            exports.GPGPU.runQuery(queryFn).then(function () {
                resolve(_this.getValues());
            });
        });
    };
    NDArray.prototype.uploadToGPU = function (preferredTexShape) {
        throwIfGPUNotInitialized();
        this.data.textureShapeRC = webgl_util.getTextureShapeFromLogicalShape(exports.GPGPU.gl, this.shape, preferredTexShape);
        this.data.texture =
            exports.TEXTURE_MANAGER.acquireTexture(this.data.textureShapeRC);
        exports.GPGPU.uploadMatrixToTexture(this.data.texture, this.data.textureShapeRC[0], this.data.textureShapeRC[1], this.data.values);
        this.data.values = null;
    };
    NDArray.prototype.getTexture = function (preferredShapeRC) {
        if (this.data.texture == null) {
            this.uploadToGPU(preferredShapeRC);
        }
        return this.data.texture;
    };
    NDArray.prototype.getTextureShapeRC = function (preferredShapeRC) {
        if (this.data.textureShapeRC == null) {
            this.uploadToGPU(preferredShapeRC);
        }
        return this.data.textureShapeRC;
    };
    NDArray.prototype.dispose = function () {
        this.data.values = null;
        this.shape = null;
        if (this.data.texture != null) {
            this.disposeTexture();
        }
    };
    NDArray.prototype.disposeTexture = function () {
        throwIfGPUNotInitialized();
        exports.TEXTURE_MANAGER.releaseTexture(this.data.texture, this.data.textureShapeRC);
        this.data.texture = null;
        this.data.textureShapeRC = null;
    };
    NDArray.prototype.inGPU = function () {
        return this.data.texture != null;
    };
    NDArray.prototype.equals = function (t) {
        return util.arraysEqual(this.shape, t.shape) &&
            util.arraysEqual(this.getValues(), t.getValues());
    };
    NDArray.rand = function (shape, randFunction) {
        var size = util.sizeFromShape(shape);
        var values = new Float32Array(size);
        for (var i = 0; i < size; i++) {
            values[i] = randFunction();
        }
        return NDArray.make(shape, { values: values });
    };
    NDArray.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    NDArray.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    NDArray.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    return NDArray;
}());
exports.NDArray = NDArray;
var Scalar = (function (_super) {
    __extends(Scalar, _super);
    function Scalar(data) {
        var _this = this;
        if (data.texture != null) {
            data.textureShapeRC = [1, 1];
        }
        _this = _super.call(this, [], data) || this;
        return _this;
    }
    Scalar.new = function (value) {
        return new Scalar({ values: new Float32Array([value]) });
    };
    Scalar.prototype.get = function () {
        return this.getValues()[0];
    };
    Scalar.prototype.set = function (value) {
        this.getValues()[0] = value;
    };
    Scalar.prototype.add = function (value) {
        this.getValues()[0] += value;
    };
    Scalar.ZERO = Scalar.new(0);
    Scalar.ONE = Scalar.new(1);
    Scalar.TWO = Scalar.new(2);
    Scalar.NEG_ONE = Scalar.new(-1);
    return Scalar;
}(NDArray));
exports.Scalar = Scalar;
var Array1D = (function (_super) {
    __extends(Array1D, _super);
    function Array1D(data) {
        var _this = this;
        var shape = (data.values != null) ?
            [data.values.length] :
            [util.sizeFromShape(data.textureShapeRC)];
        _this = _super.call(this, shape, data) || this;
        return _this;
    }
    Array1D.new = function (values) {
        if (!(values instanceof Float32Array)) {
            var inferredShape = util.inferShape(values);
            util.assert(inferredShape.length === 1, "Error constructing Array1D. Shape of values " + inferredShape + " is " +
                "not 1 dimensional.");
        }
        return new Array1D({ values: toTypedArray(values) });
    };
    Array1D.prototype.get = function (i) {
        return this.getValues()[i];
    };
    Array1D.prototype.set = function (value, i) {
        this.getValues()[i] = value;
    };
    Array1D.prototype.add = function (value, i) {
        this.getValues()[i] += value;
    };
    Array1D.prototype.locToIndex = function (loc) {
        return loc[0];
    };
    Array1D.prototype.indexToLoc = function (index) {
        return [index];
    };
    Array1D.zeros = function (shape) {
        return NDArray.zeros(shape);
    };
    Array1D.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    Array1D.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    Array1D.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    Array1D.make = function (shape, data) {
        return new Array1D(data);
    };
    return Array1D;
}(NDArray));
exports.Array1D = Array1D;
var Array2D = (function (_super) {
    __extends(Array2D, _super);
    function Array2D(shape, data) {
        var _this = this;
        util.assert(shape.length === 2, 'Shape should be of length 2');
        _this = _super.call(this, shape, data) || this;
        _this.stride0 = _this.strides[0];
        return _this;
    }
    Array2D.new = function (shape, values) {
        if (!(values instanceof Float32Array)) {
            var inferredShape = util.inferShape(values);
            if (inferredShape.length > 1) {
                util.assertShapesMatch(shape, inferredShape, "Error when constructing Array2D. Shape of values " +
                    (inferredShape + " does not match the provided shape ") +
                    (shape + ". "));
            }
        }
        return new Array2D(shape, { values: toTypedArray(values) });
    };
    Array2D.prototype.get = function (i, j) {
        return this.getValues()[this.stride0 * i + j];
    };
    Array2D.prototype.set = function (value, i, j) {
        this.getValues()[this.stride0 * i + j] = value;
    };
    Array2D.prototype.add = function (value, i, j) {
        this.getValues()[this.stride0 * i + j] += value;
    };
    Array2D.prototype.locToIndex = function (locs) {
        return this.stride0 * locs[0] + locs[1];
    };
    Array2D.prototype.indexToLoc = function (index) {
        return [Math.floor(index / this.stride0), index % this.stride0];
    };
    Array2D.zeros = function (shape) {
        return NDArray.zeros(shape);
    };
    Array2D.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    Array2D.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    Array2D.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    Array2D.make = function (shape, data) {
        return new Array2D(shape, data);
    };
    return Array2D;
}(NDArray));
exports.Array2D = Array2D;
var Array3D = (function (_super) {
    __extends(Array3D, _super);
    function Array3D(shape, data) {
        var _this = this;
        util.assert(shape.length === 3, 'Shape should be of length 3');
        _this = _super.call(this, shape, data) || this;
        _this.stride0 = _this.strides[0];
        _this.stride1 = _this.strides[1];
        return _this;
    }
    Array3D.new = function (shape, values) {
        if (!(values instanceof Float32Array)) {
            var inferredShape = util.inferShape(values);
            if (inferredShape.length > 1) {
                util.assertShapesMatch(shape, inferredShape, "Error when constructing Array3D. Shape of values " +
                    (inferredShape + " does not match the provided shape ") +
                    (shape + ". "));
            }
        }
        return new Array3D(shape, { values: toTypedArray(values) });
    };
    Array3D.prototype.get = function (i, j, k) {
        return this.getValues()[this.stride0 * i + this.stride1 * j + k];
    };
    Array3D.prototype.set = function (value, i, j, k) {
        this.getValues()[this.stride0 * i + this.stride1 * j + k] = value;
    };
    Array3D.prototype.add = function (value, i, j, k) {
        this.getValues()[this.stride0 * i + this.stride1 * j + k] += value;
    };
    Array3D.prototype.locToIndex = function (locs) {
        return this.stride0 * locs[0] + this.stride1 * locs[1] + locs[2];
    };
    Array3D.prototype.indexToLoc = function (index) {
        var i = Math.floor(index / this.stride0);
        index -= i * this.stride0;
        return [i, Math.floor(index / this.stride1), index % this.stride1];
    };
    Array3D.zeros = function (shape) {
        return NDArray.zeros(shape);
    };
    Array3D.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    Array3D.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    Array3D.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    Array3D.make = function (shape, data) {
        return new Array3D(shape, data);
    };
    return Array3D;
}(NDArray));
exports.Array3D = Array3D;
var Array4D = (function (_super) {
    __extends(Array4D, _super);
    function Array4D(shape, data) {
        var _this = this;
        util.assert(shape.length === 4, 'Shape should be of length 4');
        _this = _super.call(this, shape, data) || this;
        _this.stride0 = _this.strides[0];
        _this.stride1 = _this.strides[1];
        _this.stride2 = _this.strides[2];
        return _this;
    }
    Array4D.new = function (shape, values) {
        if (!(values instanceof Float32Array)) {
            var inferredShape = util.inferShape(values);
            if (inferredShape.length > 1) {
                util.assertShapesMatch(shape, inferredShape, "Error when constructing Array4D. Shape of values " +
                    (inferredShape + " does not match the provided shape ") +
                    (shape + ". "));
            }
        }
        return new Array4D(shape, { values: toTypedArray(values) });
    };
    Array4D.prototype.get = function (i, j, k, l) {
        return this.getValues()[this.stride0 * i + this.stride1 * j + this.stride2 * k + l];
    };
    Array4D.prototype.set = function (value, i, j, k, l) {
        this.getValues()[this.stride0 * i + this.stride1 * j + this.stride2 * k + l] = value;
    };
    Array4D.prototype.add = function (value, i, j, k, l) {
        this.getValues()[this.stride0 * i + this.stride1 * j + this.stride2 * k + l] += value;
    };
    Array4D.prototype.locToIndex = function (locs) {
        return this.stride0 * locs[0] + this.stride1 * locs[1] +
            this.stride2 * locs[2] + locs[3];
    };
    Array4D.prototype.indexToLoc = function (index) {
        var i = Math.floor(index / this.stride0);
        index -= i * this.stride0;
        var j = Math.floor(index / this.stride1);
        index -= j * this.stride1;
        return [i, j, Math.floor(index / this.stride2), index % this.stride2];
    };
    Array4D.zeros = function (shape) {
        return NDArray.zeros(shape);
    };
    Array4D.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    Array4D.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    Array4D.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    Array4D.make = function (shape, data) {
        return new Array4D(shape, data);
    };
    return Array4D;
}(NDArray));
exports.Array4D = Array4D;
function toTypedArray(a) {
    return (a instanceof Float32Array) ? a : new Float32Array(util.flatten(a));
}
//# sourceMappingURL=ndarray.js.map