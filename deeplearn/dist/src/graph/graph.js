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
var initializers_1 = require("../initializers");
var concat_util = require("../math/concat_util");
var conv_util = require("../math/conv_util");
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var GraphLayers = (function () {
    function GraphLayers(g) {
        this.g = g;
    }
    GraphLayers.prototype.dense = function (name, x, units, activation, useBias, kernelInitializer, biasInitializer) {
        if (activation === void 0) { activation = null; }
        if (useBias === void 0) { useBias = true; }
        if (kernelInitializer === void 0) { kernelInitializer = new initializers_1.VarianceScalingInitializer(); }
        if (biasInitializer === void 0) { biasInitializer = new initializers_1.ZerosInitializer(); }
        var weights = this.g.variable(name + '-weights', kernelInitializer.initialize([x.shape[0], units], x.shape[0], units));
        var out = this.g.matmul(x, weights);
        if (useBias) {
            var bias = this.g.variable(name + '-bias', biasInitializer.initialize([units], x.shape[0], units));
            out = this.g.add(out, bias);
        }
        if (activation != null) {
            out = activation(out);
        }
        return out;
    };
    return GraphLayers;
}());
exports.GraphLayers = GraphLayers;
var Graph = (function () {
    function Graph() {
        this.nodes = [];
        this.layers = new GraphLayers(this);
    }
    Graph.prototype.variable = function (name, data) {
        return this.addNodeAndReturnOutput(new VariableNode(this, name, data));
    };
    Graph.prototype.placeholder = function (name, shape) {
        return this.addNodeAndReturnOutput(new PlaceholderNode(this, name, shape));
    };
    Graph.prototype.constant = function (value) {
        var finalValue;
        if (typeof value === 'number') {
            finalValue = ndarray_1.Scalar.new(value);
        }
        else if (value instanceof ndarray_1.NDArray) {
            finalValue = value;
        }
        else if (value instanceof Array) {
            var vals = new Float32Array(util.flatten(value));
            finalValue = ndarray_1.NDArray.make(util.inferShape(value), { values: vals });
        }
        else {
            throw new Error('unimplemented constant type.');
        }
        return this.addNodeAndReturnOutput(new ConstantNode(this, finalValue));
    };
    Graph.prototype.reshape = function (x, shape) {
        return this.addNodeAndReturnOutput(new ReshapeNode(this, 'Reshape', x, shape));
    };
    Graph.prototype.fusedLinearCombination = function (x1, x2, c1, c2) {
        return this.addNodeAndReturnOutput(new FusedLinearCombinationNode(this, x1, x2, c1, c2));
    };
    Graph.prototype.add = function (x1, x2) {
        return this.addNodeAndReturnOutput(new AddNode(this, x1, x2));
    };
    Graph.prototype.subtract = function (x1, x2) {
        return this.addNodeAndReturnOutput(new SubtractNode(this, x1, x2));
    };
    Graph.prototype.multiply = function (x1, x2) {
        return this.addNodeAndReturnOutput(new MultiplyNode(this, x1, x2));
    };
    Graph.prototype.divide = function (x1, x2) {
        return this.addNodeAndReturnOutput(new DivideNode(this, x1, x2));
    };
    Graph.prototype.reduceSum = function (x) {
        return this.addNodeAndReturnOutput(new ReduceSumNode(this, x));
    };
    Graph.prototype.concat3d = function (x1, x2, axis) {
        return this.addNodeAndReturnOutput(new Concat3DNode(this, x1, x2, axis));
    };
    Graph.prototype.matmul = function (x1, x2) {
        return this.addNodeAndReturnOutput(new MatMulNode(this, x1, x2));
    };
    Graph.prototype.conv2d = function (x, w, b, fieldSize, outputDepth, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        return this.addNodeAndReturnOutput(new Convolution2DNode(this, x, w, b, fieldSize, outputDepth, stride, zeroPad));
    };
    Graph.prototype.maxPool = function (x, fieldSize, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        return this.addNodeAndReturnOutput(new MaxPoolNode(this, x, fieldSize, stride, zeroPad));
    };
    Graph.prototype.exp = function (x) {
        return this.addNodeAndReturnOutput(new ExpNode(this, x));
    };
    Graph.prototype.log = function (x) {
        return this.addNodeAndReturnOutput(new LogNode(this, x));
    };
    Graph.prototype.relu = function (x) {
        return this.addNodeAndReturnOutput(new ReLUNode(this, x));
    };
    Graph.prototype.tanh = function (x) {
        return this.addNodeAndReturnOutput(new TanHNode(this, x));
    };
    Graph.prototype.sigmoid = function (x) {
        return this.addNodeAndReturnOutput(new SigmoidNode(this, x));
    };
    Graph.prototype.square = function (x) {
        return this.addNodeAndReturnOutput(new SquareNode(this, x));
    };
    Graph.prototype.softmax = function (x) {
        return this.addNodeAndReturnOutput(new SoftmaxNode(this, x));
    };
    Graph.prototype.softmaxCrossEntropyCost = function (x, target) {
        return this.addNodeAndReturnOutput(new SoftmaxCrossEntropyCostNode(this, x, target));
    };
    Graph.prototype.meanSquaredCost = function (label, prediction) {
        return this.addNodeAndReturnOutput(new MeanSquaredCostNode(this, label, prediction));
    };
    Graph.prototype.argmax = function (x) {
        return this.addNodeAndReturnOutput(new ArgMaxNode(this, x));
    };
    Graph.prototype.argmaxEquals = function (x1, x2) {
        return this.addNodeAndReturnOutput(new ArgMaxEqualsNode(this, x1, x2));
    };
    Graph.prototype.addNodeAndReturnOutput = function (node) {
        this.nodes.push(node);
        node.validate();
        return node.output;
    };
    Graph.prototype.getNodes = function () {
        return this.nodes;
    };
    return Graph;
}());
exports.Graph = Graph;
var Tensor = (function () {
    function Tensor(shape) {
        this.shape = shape;
        this.id = Tensor.nextID++;
    }
    Tensor.nextID = 0;
    return Tensor;
}());
exports.Tensor = Tensor;
var Node = (function () {
    function Node(graph, name, inputs, output) {
        this.graph = graph;
        this.name = name;
        this.inputs = inputs;
        this.output = output;
        this.id = Node.nextID++;
        output.node = this;
    }
    Node.nextID = 0;
    return Node;
}());
exports.Node = Node;
var VariableNode = (function (_super) {
    __extends(VariableNode, _super);
    function VariableNode(graph, name, data) {
        var _this = _super.call(this, graph, name, {}, new Tensor(data.shape)) || this;
        _this.data = data;
        return _this;
    }
    VariableNode.prototype.validate = function () {
        util.assert(this.data != null, 'Error adding variable op: Data for variable \'' + this.name +
            '\' is null or undefined');
    };
    return VariableNode;
}(Node));
exports.VariableNode = VariableNode;
var PlaceholderNode = (function (_super) {
    __extends(PlaceholderNode, _super);
    function PlaceholderNode(graph, name, shape) {
        return _super.call(this, graph, name, {}, new Tensor(shape)) || this;
    }
    PlaceholderNode.prototype.validate = function () { };
    return PlaceholderNode;
}(Node));
exports.PlaceholderNode = PlaceholderNode;
var ConstantNode = (function (_super) {
    __extends(ConstantNode, _super);
    function ConstantNode(graph, data) {
        var _this = _super.call(this, graph, 'Constant', {}, new Tensor(data.shape)) || this;
        _this.data = data;
        return _this;
    }
    ConstantNode.prototype.validate = function () {
        util.assert(this.data != null, 'Error adding constant: data for placeholder \'' + this.name +
            '\' is null or undefined');
    };
    return ConstantNode;
}(Node));
exports.ConstantNode = ConstantNode;
var ReshapeNode = (function (_super) {
    __extends(ReshapeNode, _super);
    function ReshapeNode(graph, name, x, shape) {
        var _this = _super.call(this, graph, name, { x: x }, new Tensor(shape)) || this;
        _this.name = name;
        _this.x = x;
        _this.shape = shape;
        return _this;
    }
    ReshapeNode.prototype.validate = function () {
        var xSize = util.sizeFromShape(this.x.shape);
        var shapeSize = util.sizeFromShape(this.shape);
        util.assert(xSize === shapeSize, 'Error making reshape operation: input Tensor to reshape \'' +
            this.name + '\' of shape (' + this.x.shape +
            ') does not match size of requested shape ' + this.shape + '.');
    };
    ReshapeNode.X = 'x';
    return ReshapeNode;
}(Node));
exports.ReshapeNode = ReshapeNode;
var FusedLinearCombinationNode = (function (_super) {
    __extends(FusedLinearCombinationNode, _super);
    function FusedLinearCombinationNode(graph, t1, t2, c1, c2) {
        var _this = _super.call(this, graph, 'Linear Combination', { t1: t1, t2: t2, c1: c1, c2: c2 }, new Tensor(t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        _this.c1 = c1;
        _this.c2 = c2;
        return _this;
    }
    FusedLinearCombinationNode.prototype.validate = function () {
        util.assertShapesMatch(this.t1.shape, this.t2.shape);
        if (!util.isScalarShape(this.c1.shape)) {
            throw new Error('Error adding fusedLinearCombination: c1 is not a scalar, got ' +
                'shape: ' + this.c1.shape);
        }
        if (!util.isScalarShape(this.c2.shape)) {
            throw new Error('Error adding fusedLinearCombination: c2 is not a scalar, got ' +
                'shape: ' + this.c2.shape);
        }
    };
    FusedLinearCombinationNode.T1 = 't1';
    FusedLinearCombinationNode.T2 = 't2';
    FusedLinearCombinationNode.C1 = 'c1';
    FusedLinearCombinationNode.C2 = 'c2';
    return FusedLinearCombinationNode;
}(Node));
exports.FusedLinearCombinationNode = FusedLinearCombinationNode;
var AddNode = (function (_super) {
    __extends(AddNode, _super);
    function AddNode(graph, t1, t2) {
        var _this = _super.call(this, graph, 'Add', { t1: t1, t2: t2 }, new Tensor(util.sizeFromShape(t1.shape) === 1 ? t2.shape : t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        return _this;
    }
    AddNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.t1.shape) === 1 ||
            util.sizeFromShape(this.t2.shape) === 1 ||
            util.arraysEqual(this.t1.shape, this.t2.shape), 'Error adding add operation op: one of inputs must be scalar or the ' +
            'shapes ' + this.t1.shape + ' and ' + this.t2.shape +
            ' must match.');
    };
    AddNode.T1 = 't1';
    AddNode.T2 = 't2';
    return AddNode;
}(Node));
exports.AddNode = AddNode;
var SubtractNode = (function (_super) {
    __extends(SubtractNode, _super);
    function SubtractNode(graph, t1, t2) {
        var _this = _super.call(this, graph, 'Subtract', { t1: t1, t2: t2 }, new Tensor(util.sizeFromShape(t1.shape) === 1 ? t2.shape : t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        return _this;
    }
    SubtractNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.t1.shape) === 1 ||
            util.sizeFromShape(this.t2.shape) === 1 ||
            util.arraysEqual(this.t1.shape, this.t2.shape), 'Error adding subtract op: one of inputs must be scalar or the ' +
            'shapes ' + this.t1.shape + ' and ' + this.t2.shape +
            ' must match.');
    };
    SubtractNode.T1 = 't1';
    SubtractNode.T2 = 't2';
    return SubtractNode;
}(Node));
exports.SubtractNode = SubtractNode;
var MultiplyNode = (function (_super) {
    __extends(MultiplyNode, _super);
    function MultiplyNode(graph, t1, t2) {
        var _this = _super.call(this, graph, 'Multiply', { t1: t1, t2: t2 }, new Tensor(util.sizeFromShape(t1.shape) === 1 ? t2.shape : t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        return _this;
    }
    MultiplyNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.t1.shape) === 1 ||
            util.sizeFromShape(this.t2.shape) === 1 ||
            util.arraysEqual(this.t1.shape, this.t2.shape), 'Error adding multiply op: one of inputs must be scalar or the ' +
            'shapes ' + this.t1.shape + ' and ' + this.t2.shape +
            ' must match.');
    };
    MultiplyNode.T1 = 't1';
    MultiplyNode.T2 = 't2';
    return MultiplyNode;
}(Node));
exports.MultiplyNode = MultiplyNode;
var DivideNode = (function (_super) {
    __extends(DivideNode, _super);
    function DivideNode(graph, t1, t2) {
        var _this = _super.call(this, graph, 'Divide', { t1: t1, t2: t2 }, new Tensor(util.sizeFromShape(t1.shape) === 1 ? t2.shape : t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        return _this;
    }
    DivideNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.t1.shape) === 1 ||
            util.sizeFromShape(this.t2.shape) === 1 ||
            util.arraysEqual(this.t1.shape, this.t2.shape), 'Error adding divide op: one of inputs must be scalar or the ' +
            'shapes ' + this.t1.shape + ' and ' + this.t2.shape +
            ' must match.');
    };
    DivideNode.T1 = 't1';
    DivideNode.T2 = 't2';
    return DivideNode;
}(Node));
exports.DivideNode = DivideNode;
var ReduceSumNode = (function (_super) {
    __extends(ReduceSumNode, _super);
    function ReduceSumNode(graph, x) {
        return _super.call(this, graph, 'ReduceSum', { x: x }, new Tensor([])) || this;
    }
    ReduceSumNode.prototype.validate = function () { };
    ReduceSumNode.X = 'x';
    return ReduceSumNode;
}(Node));
exports.ReduceSumNode = ReduceSumNode;
var Concat3DNode = (function (_super) {
    __extends(Concat3DNode, _super);
    function Concat3DNode(graph, x1, x2, axis) {
        var _this = _super.call(this, graph, 'Concat3D', { x1: x1, x2: x2 }, new Tensor(concat_util.computeOutShape(x1.shape, x2.shape, axis))) || this;
        _this.x1 = x1;
        _this.x2 = x2;
        _this.axis = axis;
        return _this;
    }
    Concat3DNode.prototype.validate = function () {
        concat_util.assertParams(this.x1.shape, this.x2.shape, this.axis);
    };
    Concat3DNode.X1 = 'x1';
    Concat3DNode.X2 = 'x2';
    Concat3DNode.AXIS = 'axis';
    return Concat3DNode;
}(Node));
exports.Concat3DNode = Concat3DNode;
function getMatMulOutputShape(x1Shape, x2Shape) {
    if (x1Shape.length === 1 && x2Shape.length === 1) {
        return [1];
    }
    else if (x1Shape.length === 1 && x2Shape.length === 2) {
        return [x2Shape[1]];
    }
    else if (x1Shape.length === 2 && x2Shape.length === 1) {
        return [x1Shape[0]];
    }
    return [x1Shape[0], x2Shape[1]];
}
var MatMulNode = (function (_super) {
    __extends(MatMulNode, _super);
    function MatMulNode(graph, x1, x2) {
        var _this = _super.call(this, graph, 'MatMul', { x1: x1, x2: x2 }, new Tensor(getMatMulOutputShape(x1.shape, x2.shape))) || this;
        _this.x1 = x1;
        _this.x2 = x2;
        return _this;
    }
    MatMulNode.prototype.validate = function () {
        if (this.x1.shape.length === 2 && this.x2.shape.length === 2) {
            util.assert(this.x1.shape[1] === this.x2.shape[0], 'Error adding matmul op: inner shapes of matrices with shapes ' +
                this.x1.shape + ' and ' + this.x2.shape + ' must match.');
        }
        else if (this.x1.shape.length === 2 && this.x2.shape.length === 1) {
            util.assert(this.x1.shape[1] === this.x2.shape[0], 'Error adding matmul op: second dimension of matrix with shape ' +
                this.x1.shape + ' must match size of vector with shape ' +
                this.x2.shape + '.');
        }
        else if (this.x1.shape.length === 1 && this.x2.shape.length === 2) {
            util.assert(this.x1.shape[0] === this.x2.shape[0], 'Error adding matmul op: size of vector with shape ' + this.x1.shape +
                ' must match first dimension of matrix with ' +
                'shape ' + this.x2.shape + '.');
        }
        else {
            throw new Error('Error adding matmul op: inputs must be vectors or matrices.');
        }
    };
    MatMulNode.X1 = 'x1';
    MatMulNode.X2 = 'x2';
    return MatMulNode;
}(Node));
exports.MatMulNode = MatMulNode;
var Convolution2DNode = (function (_super) {
    __extends(Convolution2DNode, _super);
    function Convolution2DNode(graph, x, w, b, fieldSize, outputDepth, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        var _this = _super.call(this, graph, 'Convolution 2D', { x: x, w: w, b: b }, new Tensor(conv_util.computeOutputShape3D(x.shape, fieldSize, outputDepth, stride, zeroPad))) || this;
        _this.x = x;
        _this.w = w;
        _this.b = b;
        _this.fieldSize = fieldSize;
        _this.outputDepth = outputDepth;
        _this.stride = stride;
        _this.zeroPad = zeroPad;
        return _this;
    }
    Convolution2DNode.prototype.validate = function () {
        util.assert(this.x.shape.length === 3, 'Error adding conv2d op: input must be of rank 3, but got shape: ' +
            this.x.shape + '.');
        util.assert(this.w.shape.length === 4, 'Error adding conv2d op: weights must be of rank 4, but got shape: ' +
            this.w.shape + '.');
        util.assert(this.b.shape.length === 1, 'Error adding conv2d op: biases must be of rank 1, but got shape: ' +
            this.b.shape + '.');
        util.assert(this.x.shape[2] === this.w.shape[2], 'Error adding conv2d op: depth of input (' + this.x.shape[2] +
            ') must match input depth for weights (' + this.w.shape[2] + ').');
    };
    Convolution2DNode.X = 'x';
    Convolution2DNode.W = 'w';
    Convolution2DNode.B = 'b';
    return Convolution2DNode;
}(Node));
exports.Convolution2DNode = Convolution2DNode;
var MaxPoolNode = (function (_super) {
    __extends(MaxPoolNode, _super);
    function MaxPoolNode(graph, x, fieldSize, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        var _this = _super.call(this, graph, 'Max pool', { x: x }, new Tensor(conv_util.computeOutputShape3D(x.shape, fieldSize, x.shape[2], stride, zeroPad))) || this;
        _this.x = x;
        _this.fieldSize = fieldSize;
        _this.stride = stride;
        _this.zeroPad = zeroPad;
        return _this;
    }
    MaxPoolNode.prototype.validate = function () {
        util.assert(this.x.shape.length === 3, 'Error adding maxPool op: input must be of rank 3, but got shape: ' +
            this.x.shape + '.');
    };
    MaxPoolNode.X = 'x';
    return MaxPoolNode;
}(Node));
exports.MaxPoolNode = MaxPoolNode;
var ReLUNode = (function (_super) {
    __extends(ReLUNode, _super);
    function ReLUNode(graph, x) {
        return _super.call(this, graph, 'ReLU', { x: x }, new Tensor(x.shape)) || this;
    }
    ReLUNode.prototype.validate = function () { };
    ReLUNode.X = 'x';
    return ReLUNode;
}(Node));
exports.ReLUNode = ReLUNode;
var ExpNode = (function (_super) {
    __extends(ExpNode, _super);
    function ExpNode(graph, x) {
        return _super.call(this, graph, 'Exp', { x: x }, new Tensor(x.shape)) || this;
    }
    ExpNode.prototype.validate = function () { };
    ExpNode.X = 'x';
    return ExpNode;
}(Node));
exports.ExpNode = ExpNode;
var LogNode = (function (_super) {
    __extends(LogNode, _super);
    function LogNode(graph, x) {
        return _super.call(this, graph, 'Log', { x: x }, new Tensor(x.shape)) || this;
    }
    LogNode.prototype.validate = function () { };
    LogNode.X = 'x';
    return LogNode;
}(Node));
exports.LogNode = LogNode;
var TanHNode = (function (_super) {
    __extends(TanHNode, _super);
    function TanHNode(graph, x) {
        return _super.call(this, graph, 'TanH', { x: x }, new Tensor(x.shape)) || this;
    }
    TanHNode.prototype.validate = function () { };
    TanHNode.X = 'x';
    return TanHNode;
}(Node));
exports.TanHNode = TanHNode;
var SigmoidNode = (function (_super) {
    __extends(SigmoidNode, _super);
    function SigmoidNode(graph, x) {
        return _super.call(this, graph, 'Sigmoid', { x: x }, new Tensor(x.shape)) || this;
    }
    SigmoidNode.prototype.validate = function () { };
    SigmoidNode.X = 'x';
    return SigmoidNode;
}(Node));
exports.SigmoidNode = SigmoidNode;
var SquareNode = (function (_super) {
    __extends(SquareNode, _super);
    function SquareNode(graph, x) {
        return _super.call(this, graph, 'Square', { x: x }, new Tensor(x.shape)) || this;
    }
    SquareNode.prototype.validate = function () { };
    SquareNode.X = 'x';
    return SquareNode;
}(Node));
exports.SquareNode = SquareNode;
var SoftmaxCrossEntropyCostNode = (function (_super) {
    __extends(SoftmaxCrossEntropyCostNode, _super);
    function SoftmaxCrossEntropyCostNode(graph, x, target) {
        var _this = _super.call(this, graph, 'SoftmaxCrossEntropyCost', { x: x, target: target }, new Tensor([])) || this;
        _this.x = x;
        _this.target = target;
        return _this;
    }
    SoftmaxCrossEntropyCostNode.prototype.validate = function () {
        util.assert(util.arraysEqual(this.x.shape, this.target.shape), 'Error adding softmaxCrossEntropyCost op: x shape (' + this.x.shape +
            ') must match target shape (' + this.target.shape + ').');
    };
    SoftmaxCrossEntropyCostNode.X = 'x';
    SoftmaxCrossEntropyCostNode.TARGET = 'target';
    return SoftmaxCrossEntropyCostNode;
}(Node));
exports.SoftmaxCrossEntropyCostNode = SoftmaxCrossEntropyCostNode;
var SoftmaxNode = (function (_super) {
    __extends(SoftmaxNode, _super);
    function SoftmaxNode(graph, x) {
        var _this = _super.call(this, graph, 'Softmax', { x: x }, new Tensor(x.shape)) || this;
        _this.x = x;
        return _this;
    }
    SoftmaxNode.prototype.validate = function () {
        util.assert(this.x.shape.length === 1, 'The input to a softmax must be a 1-D tensor');
        util.assert(this.x.shape[0] >= 2, 'The input to a softmax must have at least 2 values');
    };
    SoftmaxNode.X = 'x';
    return SoftmaxNode;
}(Node));
exports.SoftmaxNode = SoftmaxNode;
var MeanSquaredCostNode = (function (_super) {
    __extends(MeanSquaredCostNode, _super);
    function MeanSquaredCostNode(graph, label, prediction) {
        var _this = _super.call(this, graph, 'Mean Squared Cost', { label: label, prediction: prediction }, new Tensor([])) || this;
        _this.label = label;
        _this.prediction = prediction;
        return _this;
    }
    MeanSquaredCostNode.prototype.validate = function () {
        util.assert(util.arraysEqual(this.label.shape, this.prediction.shape), 'Error adding meanSquaredCost op: label shape (' + this.label.shape +
            ') must match prediction shape (' + this.prediction.shape + ').');
    };
    MeanSquaredCostNode.LABEL = 'label';
    MeanSquaredCostNode.PREDICTION = 'prediction';
    return MeanSquaredCostNode;
}(Node));
exports.MeanSquaredCostNode = MeanSquaredCostNode;
var ArgMaxNode = (function (_super) {
    __extends(ArgMaxNode, _super);
    function ArgMaxNode(graph, x) {
        var _this = _super.call(this, graph, 'ArgMax', { x: x }, new Tensor([1])) || this;
        _this.x = x;
        return _this;
    }
    ArgMaxNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.x.shape) > 0, 'Error adding argmax op: input tensor must have at least one entry.');
    };
    ArgMaxNode.X = 'x';
    return ArgMaxNode;
}(Node));
exports.ArgMaxNode = ArgMaxNode;
var ArgMaxEqualsNode = (function (_super) {
    __extends(ArgMaxEqualsNode, _super);
    function ArgMaxEqualsNode(graph, x1, x2) {
        var _this = _super.call(this, graph, 'ArgMaxEquals', { x1: x1, x2: x2 }, new Tensor([1])) || this;
        _this.x1 = x1;
        _this.x2 = x2;
        return _this;
    }
    ArgMaxEqualsNode.prototype.validate = function () {
        util.assert(util.arraysEqual(this.x1.shape, this.x2.shape), 'Error adding ArgMaxEquals op: x1 shape (' + this.x1.shape +
            ') must match x2 shape (' + this.x2.shape + ').');
    };
    ArgMaxEqualsNode.X1 = 'x1';
    ArgMaxEqualsNode.X2 = 'x2';
    return ArgMaxEqualsNode;
}(Node));
exports.ArgMaxEqualsNode = ArgMaxEqualsNode;
//# sourceMappingURL=graph.js.map