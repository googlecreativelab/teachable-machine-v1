"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("./math/ndarray");
var VarianceScalingInitializer = (function () {
    function VarianceScalingInitializer(scale, mode, distribution) {
        if (scale === void 0) { scale = 1.0; }
        if (mode === void 0) { mode = 'fan_in'; }
        if (distribution === void 0) { distribution = 'normal'; }
        this.scale = scale;
        this.mode = mode;
        this.distribution = distribution;
    }
    VarianceScalingInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        var n = 0;
        if (this.mode === 'fan_in') {
            n = inputUnits;
        }
        else if (this.mode === 'fan_out') {
            n = outputUnits;
        }
        else if (this.mode === 'fan_avg') {
            n = (inputUnits + outputUnits) / 2;
        }
        else {
            throw new Error('Unexpected mode for variance scaling initializer: ' + this.mode);
        }
        if (this.distribution === 'normal') {
            return ndarray_1.NDArray.randTruncatedNormal(weightsShape, 0.0, Math.sqrt(this.scale / n));
        }
        else if (this.distribution === 'uniform') {
            return ndarray_1.NDArray.randUniform(weightsShape, 0.0, Math.sqrt(3 * this.scale / n));
        }
        else {
            throw new Error('Unexpected distribution for variance scaling initializer: ' +
                this.distribution);
        }
    };
    return VarianceScalingInitializer;
}());
exports.VarianceScalingInitializer = VarianceScalingInitializer;
var ZerosInitializer = (function () {
    function ZerosInitializer() {
    }
    ZerosInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return ndarray_1.NDArray.zeros(weightsShape);
    };
    return ZerosInitializer;
}());
exports.ZerosInitializer = ZerosInitializer;
var OnesInitializer = (function () {
    function OnesInitializer() {
    }
    OnesInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        var values = ndarray_1.NDArray.zeros(weightsShape);
        values.fill(1);
        return values;
    };
    return OnesInitializer;
}());
exports.OnesInitializer = OnesInitializer;
var ConstantInitializer = (function () {
    function ConstantInitializer(value) {
        if (value === void 0) { value = 0; }
        this.value = value;
    }
    ConstantInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        var values = ndarray_1.NDArray.zeros(weightsShape);
        values.fill(this.value);
        return values;
    };
    return ConstantInitializer;
}());
exports.ConstantInitializer = ConstantInitializer;
var NDArrayInitializer = (function () {
    function NDArrayInitializer(ndarray) {
        this.ndarray = ndarray;
    }
    NDArrayInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return this.ndarray;
    };
    return NDArrayInitializer;
}());
exports.NDArrayInitializer = NDArrayInitializer;
var RandomNormalInitializer = (function () {
    function RandomNormalInitializer(mean, stdev) {
        if (mean === void 0) { mean = 0; }
        if (stdev === void 0) { stdev = .05; }
        this.mean = mean;
        this.stdev = stdev;
    }
    RandomNormalInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return ndarray_1.NDArray.randNormal(weightsShape, this.mean, this.stdev);
    };
    return RandomNormalInitializer;
}());
exports.RandomNormalInitializer = RandomNormalInitializer;
var RandomTruncatedNormalInitializer = (function () {
    function RandomTruncatedNormalInitializer(mean, stdev) {
        if (mean === void 0) { mean = 0; }
        if (stdev === void 0) { stdev = .05; }
        this.mean = mean;
        this.stdev = stdev;
    }
    RandomTruncatedNormalInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return ndarray_1.NDArray.randTruncatedNormal(weightsShape, this.mean, this.stdev);
    };
    return RandomTruncatedNormalInitializer;
}());
exports.RandomTruncatedNormalInitializer = RandomTruncatedNormalInitializer;
var RandomUniformInitializer = (function () {
    function RandomUniformInitializer(minval, maxval) {
        if (minval === void 0) { minval = -.05; }
        if (maxval === void 0) { maxval = .05; }
        this.minval = minval;
        this.maxval = maxval;
    }
    RandomUniformInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return ndarray_1.NDArray.randUniform(weightsShape, this.minval, this.maxval);
    };
    return RandomUniformInitializer;
}());
exports.RandomUniformInitializer = RandomUniformInitializer;
//# sourceMappingURL=initializers.js.map