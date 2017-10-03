"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../util");
var concat_util = require("./concat_util");
var conv_util = require("./conv_util");
var copy2d_util = require("./copy2d_util");
var ndarray_1 = require("./ndarray");
var slice_util = require("./slice_util");
var NDArrayMath = (function () {
    function NDArrayMath(safeMode) {
        this.safeMode = safeMode;
        this.ndarrayScopes = [];
        this.ndarraysToKeep = [];
        this.activeScopeNDArraysToKeep = [];
        this.debugMode = false;
    }
    NDArrayMath.prototype.scope = function (scopeFn) {
        var _this = this;
        this.startScope();
        var keepFn = function (ndarray) { return _this.keep(ndarray); };
        var trackFn = function (ndarray) { return _this.track(ndarray); };
        var result = scopeFn(keepFn, trackFn);
        this.endScope(result);
        return result;
    };
    NDArrayMath.prototype.enableDebugMode = function () {
        this.debugMode = true;
        console.warn('Debugging mode is ON. The output of every math call will ' +
            'be downloaded to CPU and checked for NaNs. ' +
            'This significantly impacts performance.');
    };
    NDArrayMath.prototype.startScope = function () {
        var newScope = [];
        this.ndarrayScopes.push(newScope);
        this.activeScope = newScope;
        var newNDArraysToKeep = [];
        this.ndarraysToKeep.push(newNDArraysToKeep);
        this.activeScopeNDArraysToKeep = newNDArraysToKeep;
    };
    NDArrayMath.prototype.endScope = function (result) {
        var _this = this;
        var arraysToKeep = this.activeScopeNDArraysToKeep;
        if (result != null) {
            arraysToKeep = arraysToKeep.concat(result);
        }
        for (var i = 0; i < this.activeScope.length; i++) {
            var ndarray = this.activeScope[i];
            if (this.isNDArrayDataInList(ndarray, arraysToKeep)) {
                continue;
            }
            ndarray.dispose();
        }
        this.ndarrayScopes.pop();
        this.activeScope = this.ndarrayScopes.length === 0 ?
            null :
            this.ndarrayScopes[this.ndarrayScopes.length - 1];
        if (result instanceof ndarray_1.NDArray &&
            !this.isNDArrayDataInList(result, this.activeScopeNDArraysToKeep)) {
            this.track(result);
        }
        else if (Array.isArray(result)) {
            result.forEach(function (r) {
                if (r instanceof ndarray_1.NDArray &&
                    !_this.isNDArrayDataInList(r, _this.activeScopeNDArraysToKeep)) {
                    _this.track(r);
                }
            });
        }
        this.ndarraysToKeep.pop();
        this.activeScopeNDArraysToKeep = this.ndarraysToKeep.length === 0 ?
            null :
            this.ndarraysToKeep[this.ndarraysToKeep.length - 1];
    };
    NDArrayMath.prototype.isNDArrayDataInList = function (ndarray, ndarrayList) {
        for (var i = 0; i < ndarrayList.length; i++) {
            if (ndarrayList[i].getData() === ndarray.getData()) {
                return true;
            }
        }
        return false;
    };
    NDArrayMath.prototype.keep = function (result) {
        if (this.activeScope == null) {
            if (this.safeMode) {
                throw new Error('You are using math in safe mode. Enclose all ' +
                    'math.method() calls inside a scope: ' +
                    'math.scope(() => {math.method();...}) to avoid memory ' +
                    'leaks.');
            }
            return result;
        }
        this.activeScopeNDArraysToKeep.push(result);
        return result;
    };
    NDArrayMath.prototype.checkForNaN = function (vals, name) {
        for (var i = 0; i < vals.length; i++) {
            if (isNaN(vals[i])) {
                throw Error("The result of the last math." + name + " has NaNs.");
            }
        }
    };
    NDArrayMath.prototype.track = function (result) {
        if (this.activeScope == null) {
            if (this.safeMode) {
                throw new Error('You are using math in safe mode. Enclose all ' +
                    'math.method() calls inside a scope: ' +
                    'math.scope(() => {math.method();...}) to avoid memory ' +
                    'leaks.');
            }
            return result;
        }
        this.activeScope.push(result);
        return result;
    };
    NDArrayMath.prototype.matMul = function (a, b, aOrientation, bOrientation) {
        var _this = this;
        if (aOrientation === void 0) { aOrientation = MatrixOrientation.REGULAR; }
        if (bOrientation === void 0) { bOrientation = MatrixOrientation.REGULAR; }
        var innerShapeA = (aOrientation === MatrixOrientation.REGULAR) ? a.shape[1] : a.shape[0];
        var innerShapeB = (bOrientation === MatrixOrientation.REGULAR) ? b.shape[0] : b.shape[1];
        util.assert(a.rank === 2 && b.rank === 2, "Error in matMul: inputs must be rank 2, got ranks " + a.rank +
            ("and " + b.rank + "."));
        util.assert(innerShapeA === innerShapeB, "Error in matMul: inner shapes (" + innerShapeA + ") and (" +
            (innerShapeB + ") of NDArrays with shapes " + a.shape + " and ") +
            (b.shape + " and orientations " + MatrixOrientation[aOrientation]) +
            (" and " + MatrixOrientation[bOrientation] + " must match."));
        return this.executeOp('matMul', function () { return _this.matMulInternal(a, b, aOrientation, bOrientation); });
    };
    NDArrayMath.prototype.executeOp = function (name, f) {
        var start;
        if (this.debugMode) {
            start = performance.now();
        }
        var result = f();
        if (this.debugMode) {
            var vals = result.getValues();
            var time = util.rightPad((performance.now() - start) + 'ms', 9);
            var paddedName = util.rightPad(name, 25);
            var rank = result.rank;
            var size = result.size;
            var shape = util.rightPad(result.shape + '', 14);
            console.log("%c" + paddedName + "\t%c" + time + "\t%c" + rank + "D " + shape + "\t%c" + size, 'font-weight:bold', 'color:red', 'color:blue', 'color: orange');
            this.checkForNaN(vals, name);
        }
        return this.track(result);
    };
    NDArrayMath.prototype.vectorTimesMatrix = function (v, matrix) {
        util.assert(v.rank === 1, "Error in vectorTimesMatrix: first input must be rank 1, but got " +
            ("rank " + v.rank + "."));
        util.assert(matrix.rank === 2, "Error in vectorTimesMatrix: second input must be rank 2, but got " +
            ("rank " + matrix.rank + "."));
        util.assert(v.size === matrix.shape[0], "Error in vectorTimesMatrix: size of first rank 1 input (" + v.size + ") " +
            "must match inner dimension of second rank 2 input, but got " +
            ("rank " + matrix.rank + "."));
        return this.matMul(v.as2D(1, -1), matrix).as1D();
    };
    NDArrayMath.prototype.matrixTimesVector = function (matrix, v) {
        util.assert(v.rank === 1, "Error in vectorTimesMatrix: second input must rank 1, but got " +
            ("rank " + v.rank + "."));
        util.assert(matrix.rank === 2, "Error in vectorTimesMatrix: first input must be a rank 2, but got " +
            ("rank " + matrix.rank + "."));
        util.assert(v.size === matrix.shape[1], "Error in vectorTimesMatrix: size of first rank 1 input " + v.size + " " +
            "must match inner dimension of second rank 2 input, but got " +
            ("shape " + matrix.shape + "."));
        return this.matMul(matrix, v.as2D(-1, 1)).as1D();
    };
    NDArrayMath.prototype.dotProduct = function (v1, v2) {
        util.assert(v1.rank === 1 && v2.rank === 1, "Error in dotProduct: inputs must be rank 1, but got ranks " +
            (v1.rank + " and " + v2.rank + "."));
        util.assert(v1.size === v2.size, "Error in dotProduct: size of inputs (" + v1.size + ") and (" +
            (v2.size + ") must match."));
        return this.matMul(v1.as2D(1, -1), v2.as2D(-1, 1)).asScalar();
    };
    NDArrayMath.prototype.outerProduct = function (v1, v2) {
        util.assert(v1.rank === 1 && v2.rank === 1, "Error in outerProduct: inputs must be rank 1, but got ranks " +
            (v1.rank + " and " + v2.rank + "."));
        return this.matMul(v1.as2D(-1, 1), v2.as2D(1, -1));
    };
    NDArrayMath.prototype.clone = function (ndarray) {
        var _this = this;
        return this.executeOp('clone', function () { return _this.cloneInternal(ndarray); });
    };
    NDArrayMath.prototype.reshape = function (ndarray, newShape) {
        console.warn('math.reshape() is deprecated. Please call reshape() ' +
            'directly on the ndarray object');
        return ndarray.reshape(newShape);
    };
    NDArrayMath.prototype.slice1D = function (input, begin, size) {
        var _this = this;
        slice_util.assertParamsValid(input, [begin], [size]);
        return this.executeOp('slice1D', function () { return _this.slice1DInternal(input, begin, size); });
    };
    NDArrayMath.prototype.slice2D = function (input, begin, size) {
        var _this = this;
        slice_util.assertParamsValid(input, begin, size);
        return this.executeOp('slice2D', function () { return _this.slice2DInternal(input, begin, size); });
    };
    NDArrayMath.prototype.slice3D = function (input, begin, size) {
        var _this = this;
        slice_util.assertParamsValid(input, begin, size);
        return this.executeOp('slice3D', function () { return _this.slice3DInternal(input, begin, size); });
    };
    NDArrayMath.prototype.slice4D = function (input, begin, size) {
        var _this = this;
        slice_util.assertParamsValid(input, begin, size);
        return this.executeOp('slice4D', function () { return _this.slice4DInternal(input, begin, size); });
    };
    NDArrayMath.prototype.copy2D = function (source, sourceBegin, sourceSize, dest, destBegin, destSize) {
        var _this = this;
        util.assert(sourceBegin[0] + sourceSize[0] <= source.shape[0] &&
            sourceBegin[1] + sourceSize[1] <= source.shape[1], "Error in copy2D: requested source start position " + sourceBegin + " " +
            ("and source size " + sourceSize + " would overflow source NDArray") +
            ("of shape " + source.shape + "."));
        util.assert(destBegin[0] + destSize[0] <= dest.shape[0] &&
            destBegin[1] + destSize[1] <= dest.shape[1], "Error in copy2D: requested dest start position " + destBegin + " " +
            ("and source size " + destSize + " would overflow dest NDArray of") +
            ("shape " + dest.shape + "."));
        copy2d_util.validateShapes(sourceSize, destSize);
        this.executeOp('copy2D', function () {
            _this.copy2DInternal(source, sourceBegin, sourceSize, dest, destBegin, destSize);
            return dest;
        });
    };
    NDArrayMath.prototype.concat1D = function (a, b) {
        var _this = this;
        concat_util.assertParams(a.shape, b.shape, 0);
        return this.executeOp('concat1D', function () { return _this.concat1DInternal(a, b); });
    };
    NDArrayMath.prototype.concat2D = function (a, b, axis) {
        var _this = this;
        concat_util.assertParams(a.shape, b.shape, axis);
        return this.executeOp('concat2D', function () { return _this.concat2DInternal(a, b, axis); });
    };
    NDArrayMath.prototype.concat3D = function (ndarray1, ndarray2, axis) {
        var _this = this;
        concat_util.assertParams(ndarray1.shape, ndarray2.shape, axis);
        return this.executeOp('concat3D', function () { return _this.concat3DInternal(ndarray1, ndarray2, axis); });
    };
    NDArrayMath.prototype.concat4D = function (ndarray1, ndarray2, axis) {
        var _this = this;
        concat_util.assertParams(ndarray1.shape, ndarray2.shape, axis);
        return this.executeOp('concat4D', function () { return _this.concat4DInternal(ndarray1, ndarray2, axis); });
    };
    NDArrayMath.prototype.logSumExp = function (ndarray) {
        var _this = this;
        return this.executeOp('logSumExp', function () { return _this.logSumExpInternal(ndarray); });
    };
    NDArrayMath.prototype.sum = function (ndarray) {
        var _this = this;
        return this.executeOp('sum', function () { return _this.sumInternal(ndarray); });
    };
    NDArrayMath.prototype.argMin = function (ndarray) {
        var _this = this;
        return this.executeOp('argMin', function () { return _this.argMinInternal(ndarray); });
    };
    NDArrayMath.prototype.argMax = function (ndarray) {
        var _this = this;
        return this.executeOp('argMax', function () { return _this.argMaxInternal(ndarray); });
    };
    NDArrayMath.prototype.argMaxEquals = function (x1, x2) {
        var _this = this;
        util.assertShapesMatch(x1.shape, x2.shape, 'Error in argMaxEquals: ');
        return this.executeOp('argMaxEquals', function () { return _this.argMaxEqualsInternal(x1, x2); });
    };
    NDArrayMath.prototype.topK = function (ndarray, k) {
        var _this = this;
        util.assert(k <= ndarray.size, "Error in topK: k value (" + k + ") must be less than size of input " +
            ("ndarray, got shape " + ndarray.shape + "."));
        var result;
        this.executeOp('topK', function () {
            result = _this.topKInternal(ndarray, k);
            return result.values;
        });
        this.track(result.indices);
        return result;
    };
    NDArrayMath.prototype.min = function (ndarray) {
        var _this = this;
        return this.executeOp('min', function () { return _this.minInternal(ndarray); });
    };
    NDArrayMath.prototype.max = function (ndarray) {
        var _this = this;
        return this.executeOp('max', function () { return _this.maxInternal(ndarray); });
    };
    NDArrayMath.prototype.softmax = function (x) {
        var _this = this;
        return this.executeOp('softmax', function () {
            return _this.scope(function () {
                var lse = _this.logSumExp(x);
                var logResult = _this.arrayMinusScalar(x, lse);
                return _this.exp(logResult);
            });
        });
    };
    NDArrayMath.prototype.switchDim = function (a, newDim) {
        var _this = this;
        util.assert(a.rank === newDim.length, "Error in switchDim: length of input shape " + a.shape + " " +
            ("must match size of newDim array " + newDim + "."));
        return this.executeOp('switchDim', function () { return _this.switchDimInternal(a, newDim); });
    };
    NDArrayMath.prototype.scalarPlusArray = function (c, a) {
        util.assert(c.size === 1, "Error in scalarPlusArray: first argument must be rank 0, but got " +
            ("rank " + c.rank + "."));
        return this.add(c, a);
    };
    NDArrayMath.prototype.scalarMinusArray = function (c, a) {
        util.assert(c.size === 1, "Error in scalarMinusArray: first argument must be rank 0, but got " +
            ("rank " + c.rank + "."));
        return this.sub(c, a);
    };
    NDArrayMath.prototype.arrayMinusScalar = function (a, c) {
        util.assert(c.size === 1, "Error in arrayMinusScalar: second argument must be rank 0, but " +
            ("got rank " + c.rank + "."));
        return this.sub(a, c);
    };
    NDArrayMath.prototype.neg = function (a) {
        var _this = this;
        return this.executeOp('neg', function () { return _this.negInternal(a); });
    };
    NDArrayMath.prototype.add = function (a, b) {
        var _this = this;
        util.assertAndGetBroadcastedShape(a.shape, b.shape);
        return this.executeOp('add', function () { return _this.addInternal(a, b); });
    };
    NDArrayMath.prototype.addStrict = function (a, b) {
        util.assertShapesMatch(a.shape, b.shape, 'Error in addStrict: ');
        return this.add(a, b);
    };
    NDArrayMath.prototype.sub = function (a, b) {
        var _this = this;
        util.assertAndGetBroadcastedShape(a.shape, b.shape);
        return this.executeOp('sub', function () { return _this.subInternal(a, b); });
    };
    NDArrayMath.prototype.subStrict = function (a, b) {
        util.assertShapesMatch(a.shape, b.shape, 'Error in subStrict: ');
        return this.sub(a, b);
    };
    NDArrayMath.prototype.multiply = function (a, b) {
        var _this = this;
        util.assertAndGetBroadcastedShape(a.shape, b.shape);
        return this.executeOp('multiply', function () { return _this.multiplyInternal(a, b); });
    };
    NDArrayMath.prototype.elementWiseMul = function (a, b) {
        return this.multiplyStrict(a, b);
    };
    NDArrayMath.prototype.multiplyStrict = function (a, b) {
        util.assertShapesMatch(a.shape, b.shape, 'Error in multiplyStrict: ');
        return this.multiply(a, b);
    };
    NDArrayMath.prototype.divide = function (a, b) {
        var _this = this;
        util.assertAndGetBroadcastedShape(a.shape, b.shape);
        return this.executeOp('divide', function () { return _this.divideInternal(a, b); });
    };
    NDArrayMath.prototype.divideStrict = function (a, b) {
        util.assertShapesMatch(a.shape, b.shape, 'Error in divideStrict: ');
        return this.divide(a, b);
    };
    NDArrayMath.prototype.scalarDividedByArray = function (c, a) {
        util.assert(c.size === 1, "Error in scalarDividedByArray: first argument must be rank 0, but " +
            ("got NDArray of rank " + c.rank + "."));
        return this.divide(c, a);
    };
    NDArrayMath.prototype.arrayDividedByScalar = function (a, c) {
        util.assert(c.size === 1, "Error in arrayDividedByScalar: second argument must be rank 0, " +
            ("but got NDArray of rank " + c.rank + "."));
        return this.divide(a, c);
    };
    NDArrayMath.prototype.exp = function (ndarray) {
        var _this = this;
        return this.executeOp('exp', function () { return _this.expInternal(ndarray); });
    };
    NDArrayMath.prototype.log = function (ndarray) {
        var _this = this;
        return this.executeOp('log', function () { return _this.logInternal(ndarray); });
    };
    NDArrayMath.prototype.sqrt = function (ndarray) {
        var _this = this;
        return this.executeOp('sqrt', function () { return _this.sqrtInternal(ndarray); });
    };
    NDArrayMath.prototype.abs = function (ndarray) {
        var _this = this;
        return this.executeOp('abs', function () { return _this.absInternal(ndarray); });
    };
    NDArrayMath.prototype.relu = function (ndarray) {
        var _this = this;
        return this.executeOp('relu', function () { return _this.reluInternal(ndarray); });
    };
    NDArrayMath.prototype.sigmoid = function (ndarray) {
        var _this = this;
        return this.executeOp('sigmoid', function () { return _this.sigmoidInternal(ndarray); });
    };
    NDArrayMath.prototype.sin = function (ndarray) {
        var _this = this;
        return this.executeOp('sin', function () { return _this.sinInternal(ndarray); });
    };
    NDArrayMath.prototype.cos = function (ndarray) {
        var _this = this;
        return this.executeOp('cos', function () { return _this.cosInternal(ndarray); });
    };
    NDArrayMath.prototype.tan = function (ndarray) {
        var _this = this;
        return this.executeOp('tan', function () { return _this.tanInternal(ndarray); });
    };
    NDArrayMath.prototype.asin = function (ndarray) {
        var _this = this;
        return this.executeOp('asin', function () { return _this.asinInternal(ndarray); });
    };
    NDArrayMath.prototype.acos = function (ndarray) {
        var _this = this;
        return this.executeOp('acos', function () { return _this.acosInternal(ndarray); });
    };
    NDArrayMath.prototype.atan = function (ndarray) {
        var _this = this;
        return this.executeOp('atan', function () { return _this.atanInternal(ndarray); });
    };
    NDArrayMath.prototype.sinh = function (ndarray) {
        var _this = this;
        return this.executeOp('sinh', function () { return _this.sinhInternal(ndarray); });
    };
    NDArrayMath.prototype.cosh = function (ndarray) {
        var _this = this;
        return this.executeOp('cosh', function () { return _this.coshInternal(ndarray); });
    };
    NDArrayMath.prototype.tanh = function (ndarray) {
        var _this = this;
        return this.executeOp('tanh', function () { return _this.tanhInternal(ndarray); });
    };
    NDArrayMath.prototype.step = function (ndarray) {
        var _this = this;
        return this.executeOp('step', function () { return _this.stepInternal(ndarray); });
    };
    NDArrayMath.prototype.scaledArrayAdd = function (c1, a, c2, b) {
        var _this = this;
        util.assert(c1.size === 1, "Error in scaledArrayAdd: first argument must rank 0, but got " +
            (" rank " + c1.rank + "."));
        util.assert(c2.size === 1, "Error in scaledArrayAdd: third argument must be rank 0, but got " +
            ("NDArray of rank " + c2.rank + "."));
        util.assertShapesMatch(a.shape, b.shape, 'Error in scaledArrayAdd: ');
        return this.executeOp('scaledArrayAdd', function () { return _this.scaledArrayAddInternal(c1, a, c2, b); });
    };
    NDArrayMath.prototype.scalarTimesArray = function (c, a) {
        util.assert(c.size === 1, "Error in arrayDividedByScalar: first argument must be rank 0, but " +
            ("got rank " + c.rank + "."));
        return this.multiply(c, a);
    };
    NDArrayMath.prototype.elementWiseMulBroadcast = function (a, b) {
        util.assert(a.rank === 2, "Error in elementWiseMulBroadcast: first argument must be " +
            ("rank 2, but got rank " + a.rank + "."));
        util.assert(b.rank === 2, "Error in elementWiseMulBroadcast: second argument must be " +
            ("rank 2, but got rank " + b.rank + "."));
        return this.multiply(a, b);
    };
    NDArrayMath.prototype.conv2d = function (x, filter, bias, strides, pad) {
        var _this = this;
        util.assert(x.rank === 3, "Error in conv2d: x must be rank 3, but got rank " + x.rank + ".");
        util.assert(filter.rank === 4, "Error in conv2d: filter must be rank 4, but got rank " +
            (filter.rank + "."));
        if (bias != null) {
            util.assert(bias.rank === 1, "Error in conv2d: bias must be rank 1, but got rank " +
                (bias.rank + "."));
        }
        util.assert(x.shape[2] === filter.shape[2], "Error in conv2d: depth of input (" + x.shape[2] + ") must match  " +
            ("input depth for filter " + filter.shape[2] + "."));
        var filterHeight = filter.shape[0];
        var filterWidth = filter.shape[1];
        var outDepth = filter.shape[3];
        var _a = parseTupleParam(strides), strideHeight = _a[0], strideWidth = _a[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('conv2d', function () { return _this.conv2dInternal(x, filter, bias, convInfo); });
    };
    NDArrayMath.prototype.conv2dBackProp = function (x, dy, filter, strides, pad) {
        var dw = this.conv2dDerFilter(x, dy, filter.shape, strides, pad);
        var db = this.conv2dDerBias(dy);
        var dx = this.conv2dDerInput(x.shape, dy, filter, strides, pad);
        return { db: db, dw: dw, dx: dx };
    };
    NDArrayMath.prototype.conv2dDerInput = function (inShape, dy, filter, strides, pad) {
        var _this = this;
        var inDepth = inShape[2];
        var outDepth = dy.shape[2];
        util.assert(inShape.length === 3, "Error in conv2dDerInput: x must be rank 3, but got rank " +
            (inShape.length + "."));
        util.assert(dy.rank === 3, "Error in conv2dDerInput: dy must be rank 3, but got " +
            ("rank " + dy.rank));
        util.assert(filter.rank === 4, "Error in conv2dDerInput: filter must be rank 4, but got " +
            ("rank " + filter.rank));
        util.assert(inDepth === filter.shape[2], "Error in conv2dDerInput: depth of input (" + inDepth + ") must " +
            ("match input depth for filter " + filter.shape[2] + "."));
        util.assert(outDepth === filter.shape[3], "Error in conv2dDerInput: depth of output (" + outDepth + ") must" +
            ("match output depth for filter " + filter.shape[3] + "."));
        var filterHeight = filter.shape[0];
        var filterWidth = filter.shape[1];
        var _a = parseTupleParam(strides), strideHeight = _a[0], strideWidth = _a[1];
        var convInfo = conv_util.computeConvInfo(inShape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('conv2dDerInput', function () { return _this.conv2dDerInputInternal(dy, filter, convInfo); });
    };
    NDArrayMath.prototype.conv2dDerBias = function (dy) {
        return this.track(this.conv2dDerBiasInternal(dy));
    };
    NDArrayMath.prototype.conv2dDerFilter = function (x, dy, filterSize, strides, pad) {
        util.assert(x.rank === 3, "Error in conv2dDerFilter: x must be rank 3, but got shape " +
            (x.shape + "."));
        util.assert(dy.rank === 3, "Error in conv2dDerFilter: dy must be rank 3, but got shape " +
            (dy.shape + "."));
        util.assert(filterSize.length === 4, "Error in conv2dDerFilter: filterSize must be length 4, but got " +
            (filterSize + "."));
        util.assert(x.shape[2] === filterSize[2], "Error in conv2dDerFilter: depth of x " + x.shape[2] + ") must " +
            ("match input depth in filter (" + filterSize[2] + "."));
        util.assert(dy.shape[2] === filterSize[3], "Error in conv2dDerFilter: depth of dy (" + dy.shape[2] + ") must " +
            ("match output depth for filter (" + filterSize[3] + ")."));
        var filterHeight = filterSize[0];
        var filterWidth = filterSize[1];
        var outDepth = filterSize[3];
        var _a = parseTupleParam(strides), strideHeight = _a[0], strideWidth = _a[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.track(this.conv2dDerFilterInternal(x, dy, convInfo));
    };
    NDArrayMath.prototype.conv2dTranspose = function (x, filter, outputShape, strides, pad) {
        return this.conv2dDerInput(outputShape, x, filter, strides, pad);
    };
    NDArrayMath.prototype.maxPool = function (x, filterSize, strides, pad) {
        var _this = this;
        util.assert(x.rank === 3, 'Error in maxPool: x must be rank 3 but got rank ' + x.rank + '.');
        var _a = parseTupleParam(filterSize), filterHeight = _a[0], filterWidth = _a[1];
        var outDepth = x.shape[2];
        var _b = parseTupleParam(strides), strideHeight = _b[0], strideWidth = _b[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('maxPool', function () { return _this.maxPoolInternal(x, convInfo); });
    };
    NDArrayMath.prototype.maxPoolBackprop = function (dy, x, filterSize, strides, pad) {
        var _this = this;
        util.assert(dy.rank === 3, "Error in maxPoolBackprop: dy must be rank 3 but got rank " +
            (dy.rank + "."));
        util.assert(x.rank === 3, "Error in maxPoolBackprop: x must be rank 3 but got rank " +
            (x.rank + "."));
        var _a = parseTupleParam(filterSize), filterHeight = _a[0], filterWidth = _a[1];
        var outDepth = x.shape[2];
        var _b = parseTupleParam(strides), strideHeight = _b[0], strideWidth = _b[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('maxPoolBackprop', function () { return _this.maxPoolBackpropInternal(dy, x, convInfo); });
    };
    NDArrayMath.prototype.minPool = function (x, filterSize, strides, pad) {
        var _this = this;
        util.assert(x.rank === 3, "Error in minPool: x must be rank 3 but got rank " + x.rank + ".");
        var _a = parseTupleParam(filterSize), filterHeight = _a[0], filterWidth = _a[1];
        var outDepth = x.shape[2];
        var _b = parseTupleParam(strides), strideHeight = _b[0], strideWidth = _b[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('minPool', function () { return _this.minPoolInternal(x, convInfo); });
    };
    NDArrayMath.prototype.avgPool = function (x, filterSize, strides, pad) {
        var _this = this;
        util.assert(x.rank === 3, "Error in avgPool: x must be rank 3 but got rank " + x.rank + ".");
        var _a = parseTupleParam(filterSize), filterHeight = _a[0], filterWidth = _a[1];
        var outDepth = x.shape[2];
        var _b = parseTupleParam(strides), strideHeight = _b[0], strideWidth = _b[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('avgPool', function () { return _this.avgPoolInternal(x, convInfo); });
    };
    NDArrayMath.prototype.resizeBilinear3D = function (x, newShape2D, alignCorners) {
        var _this = this;
        if (alignCorners === void 0) { alignCorners = false; }
        util.assert(x.rank === 3, "Error in resizeBilinear3D: x must be rank 3 but got rank " + x.rank + ".");
        util.assert(newShape2D.length === 2, "Error in resizeBilinear3D: new shape must 2D, but got shape " +
            (newShape2D + "."));
        return this.executeOp('resizeBilinear3D', function () { return _this.resizeBilinear3DInternal(x, newShape2D, alignCorners); });
    };
    NDArrayMath.prototype.batchNormalization3D = function (x, mean, variance, varianceEpsilon, scale, offset) {
        var _this = this;
        if (varianceEpsilon === void 0) { varianceEpsilon = .001; }
        util.assert(x.rank === 3, "Error in batchNormalization3D: x must be rank 3 but got rank " +
            (x.rank + "."));
        util.assert(mean.rank === 3 || mean.rank === 1, "Error in batchNormalization3D: mean must be rank 3 or rank 1 but " +
            ("got rank " + mean.rank + "."));
        util.assert(variance.rank === 3 || variance.rank === 1, "Error in batchNormalization3D: variance must be rank 3 or rank 1 " +
            ("but got rank " + variance.rank + "."));
        if (scale != null) {
            util.assert(scale.rank === 3 || scale.rank === 1, "Error in batchNormalization3D: scale must be rank 3 or rank 1 " +
                ("but got rank " + scale.rank + "."));
        }
        if (offset != null) {
            util.assert(offset.rank === 3 || offset.rank === 1, "Error in batchNormalization3D: offset must be rank 3 or rank 1 " +
                ("but got rank " + offset.rank + "."));
        }
        return this.executeOp('batchNorm3D', function () { return _this.batchNormalization3DInternal(x, mean, variance, varianceEpsilon, scale, offset); });
    };
    NDArrayMath.prototype.multiRNNCell = function (lstmCells, data, c, h) {
        util.assert(data.shape[0] === 1, "Error in multiRNNCell: first dimension of data is " + data.shape[0] + ", " +
            "but batch sizes > 1 are not yet supported.");
        var res = this.scope(function () {
            var input = data;
            var newStates = [];
            for (var i = 0; i < lstmCells.length; i++) {
                var output = lstmCells[i](input, c[i], h[i]);
                newStates.push(output[0]);
                newStates.push(output[1]);
                input = output[1];
            }
            return newStates;
        });
        var newC = [];
        var newH = [];
        for (var i = 0; i < res.length; i += 2) {
            newC.push(res[i]);
            newH.push(res[i + 1]);
        }
        return [newC, newH];
    };
    NDArrayMath.prototype.basicLSTMCell = function (forgetBias, lstmKernel, lstmBias, data, c, h) {
        var _this = this;
        var res = this.scope(function () {
            util.assert(data.shape[0] === 1, "Error in multiRNNCell: first dimension of data is " +
                (data.shape[0] + ", but batch sizes > 1 are not yet supported."));
            var combined = _this.concat1D(data.as1D(), h.as1D());
            var weighted = _this.vectorTimesMatrix(combined, lstmKernel);
            var res = _this.addStrict(weighted, lstmBias);
            var sliceSize = res.size / 4;
            var i = _this.slice1D(res, 0, sliceSize);
            var j = _this.slice1D(res, sliceSize, sliceSize);
            var f = _this.slice1D(res, sliceSize * 2, sliceSize);
            var o = _this.slice1D(res, sliceSize * 3, sliceSize);
            var newC = _this.addStrict(_this.multiplyStrict(c.as1D(), _this.sigmoid(_this.scalarPlusArray(forgetBias, f))), _this.multiplyStrict(_this.sigmoid(i), _this.tanh(j)));
            var newH = _this.multiplyStrict(_this.tanh(newC), _this.sigmoid(o));
            return [newC, newH];
        });
        return [res[0].as2D(1, -1), res[1].as2D(1, -1)];
    };
    return NDArrayMath;
}());
exports.NDArrayMath = NDArrayMath;
var MatrixOrientation;
(function (MatrixOrientation) {
    MatrixOrientation[MatrixOrientation["REGULAR"] = 0] = "REGULAR";
    MatrixOrientation[MatrixOrientation["TRANSPOSED"] = 1] = "TRANSPOSED";
})(MatrixOrientation = exports.MatrixOrientation || (exports.MatrixOrientation = {}));
function parseTupleParam(param) {
    return typeof param === 'number' ? [param, param] : param;
}
//# sourceMappingURL=math.js.map