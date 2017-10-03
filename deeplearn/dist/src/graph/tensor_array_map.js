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
var TensorArrayMapBase = (function () {
    function TensorArrayMapBase() {
        this.dict = {};
    }
    TensorArrayMapBase.prototype.get = function (tensor, skipChecks) {
        if (skipChecks === void 0) { skipChecks = false; }
        if (!skipChecks && this.dict[tensor.id] === undefined) {
            throw new Error('tensor ' + tensor.id + ' not in array map.');
        }
        var nda = this.dict[tensor.id];
        if (!skipChecks && nda === null) {
            throw new Error('tensor ' + tensor.id + ' has null array.');
        }
        return nda;
    };
    TensorArrayMapBase.prototype.delete = function (tensor) {
        delete this.dict[tensor.id];
    };
    TensorArrayMapBase.prototype.nullify = function (tensor) {
        this.dict[tensor.id] = null;
    };
    TensorArrayMapBase.prototype.disposeArray = function (tensor) {
        if (this.dict[tensor.id] === undefined) {
            return;
        }
        var nda = this.dict[tensor.id];
        if (nda === null) {
            return;
        }
        nda.dispose();
        this.dict[tensor.id] = null;
    };
    TensorArrayMapBase.prototype.size = function () {
        return Object.keys(this.dict).length;
    };
    TensorArrayMapBase.prototype.dispose = function () {
        var _this = this;
        Object.keys(this.dict).forEach(function (tensorID) {
            var nda = _this.dict[+tensorID];
            if (nda) {
                nda.dispose();
            }
        });
        this.dict = {};
    };
    TensorArrayMapBase.prototype.hasNullArray = function (tensor) {
        if (this.dict[tensor.id] === undefined) {
            throw new Error('tensor ' + tensor.id + ' not in array map.');
        }
        return this.dict[tensor.id] === null;
    };
    return TensorArrayMapBase;
}());
exports.TensorArrayMapBase = TensorArrayMapBase;
var TensorArrayMap = (function (_super) {
    __extends(TensorArrayMap, _super);
    function TensorArrayMap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TensorArrayMap.prototype.set = function (tensor, array) {
        this.dict[tensor.id] = array;
    };
    return TensorArrayMap;
}(TensorArrayMapBase));
exports.TensorArrayMap = TensorArrayMap;
var SummedTensorArrayMap = (function (_super) {
    __extends(SummedTensorArrayMap, _super);
    function SummedTensorArrayMap(math) {
        var _this = _super.call(this) || this;
        _this.math = math;
        return _this;
    }
    SummedTensorArrayMap.prototype.add = function (tensor, array) {
        if (this.dict[tensor.id] == null) {
            this.dict[tensor.id] = this.math.keep(array);
        }
        else {
            var oldValue = this.get(tensor);
            var newValue = this.math.keep(this.math.addStrict(oldValue, array));
            this.dict[tensor.id] = newValue;
            oldValue.dispose();
        }
    };
    return SummedTensorArrayMap;
}(TensorArrayMapBase));
exports.SummedTensorArrayMap = SummedTensorArrayMap;
//# sourceMappingURL=tensor_array_map.js.map