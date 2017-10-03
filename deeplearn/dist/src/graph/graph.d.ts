import { Initializer } from '../initializers';
import { NDArray } from '../math/ndarray';
export declare class GraphLayers {
    private g;
    constructor(g: Graph);
    dense(name: string, x: Tensor, units: number, activation?: ((x: Tensor) => Tensor) | null, useBias?: boolean, kernelInitializer?: Initializer, biasInitializer?: Initializer): Tensor;
}
export declare class Graph {
    layers: GraphLayers;
    constructor();
    variable(name: string, data: NDArray): Tensor;
    placeholder(name: string, shape: number[]): Tensor;
    constant(value: ArrayData): Tensor;
    reshape(x: Tensor, shape: number[]): Tensor;
    fusedLinearCombination(x1: Tensor, x2: Tensor, c1: Tensor, c2: Tensor): Tensor;
    add(x1: Tensor, x2: Tensor): Tensor;
    subtract(x1: Tensor, x2: Tensor): Tensor;
    multiply(x1: Tensor, x2: Tensor): Tensor;
    divide(x1: Tensor, x2: Tensor): Tensor;
    reduceSum(x: Tensor): Tensor;
    concat3d(x1: Tensor, x2: Tensor, axis: number): Tensor;
    matmul(x1: Tensor, x2: Tensor): Tensor;
    conv2d(x: Tensor, w: Tensor, b: Tensor, fieldSize: number, outputDepth: number, stride?: number, zeroPad?: number): Tensor;
    maxPool(x: Tensor, fieldSize: number, stride?: number, zeroPad?: number): Tensor;
    exp(x: Tensor): Tensor;
    log(x: Tensor): Tensor;
    relu(x: Tensor): Tensor;
    tanh(x: Tensor): Tensor;
    sigmoid(x: Tensor): Tensor;
    square(x: Tensor): Tensor;
    softmax(x: Tensor): Tensor;
    softmaxCrossEntropyCost(x: Tensor, target: Tensor): Tensor;
    meanSquaredCost(label: Tensor, prediction: Tensor): Tensor;
    argmax(x: Tensor): Tensor;
    argmaxEquals(x1: Tensor, x2: Tensor): Tensor;
    private addNodeAndReturnOutput(node);
    getNodes(): Node[];
    private nodes;
}
export declare class Tensor {
    shape: number[];
    node: Node;
    id: number;
    constructor(shape: number[]);
    private static nextID;
}
export declare abstract class Node {
    graph: Graph;
    name: string;
    inputs: {
        [name: string]: Tensor;
    };
    output: Tensor;
    constructor(graph: Graph, name: string, inputs: {
        [name: string]: Tensor;
    }, output: Tensor);
    abstract validate(): void;
    id: number;
    private static nextID;
}
export declare class VariableNode extends Node {
    data: NDArray;
    constructor(graph: Graph, name: string, data: NDArray);
    validate(): void;
}
export declare class PlaceholderNode extends Node {
    constructor(graph: Graph, name: string, shape: number[]);
    validate(): void;
}
export declare class ConstantNode extends Node {
    data: NDArray;
    constructor(graph: Graph, data: NDArray);
    validate(): void;
}
export declare class ReshapeNode extends Node {
    name: string;
    private x;
    private shape;
    static readonly X: string;
    constructor(graph: Graph, name: string, x: Tensor, shape: number[]);
    validate(): void;
}
export declare class FusedLinearCombinationNode extends Node {
    private t1;
    private t2;
    private c1;
    private c2;
    static readonly T1: string;
    static readonly T2: string;
    static readonly C1: string;
    static readonly C2: string;
    constructor(graph: Graph, t1: Tensor, t2: Tensor, c1: Tensor, c2: Tensor);
    validate(): void;
}
export declare class AddNode extends Node {
    private t1;
    private t2;
    static readonly T1: string;
    static readonly T2: string;
    constructor(graph: Graph, t1: Tensor, t2: Tensor);
    validate(): void;
}
export declare class SubtractNode extends Node {
    private t1;
    private t2;
    static readonly T1: string;
    static readonly T2: string;
    constructor(graph: Graph, t1: Tensor, t2: Tensor);
    validate(): void;
}
export declare class MultiplyNode extends Node {
    private t1;
    private t2;
    static readonly T1: string;
    static readonly T2: string;
    constructor(graph: Graph, t1: Tensor, t2: Tensor);
    validate(): void;
}
export declare class DivideNode extends Node {
    private t1;
    private t2;
    static readonly T1: string;
    static readonly T2: string;
    constructor(graph: Graph, t1: Tensor, t2: Tensor);
    validate(): void;
}
export declare class ReduceSumNode extends Node {
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class Concat3DNode extends Node {
    private x1;
    private x2;
    axis: number;
    static readonly X1: string;
    static readonly X2: string;
    static readonly AXIS: string;
    constructor(graph: Graph, x1: Tensor, x2: Tensor, axis: number);
    validate(): void;
}
export declare class MatMulNode extends Node {
    private x1;
    private x2;
    static readonly X1: string;
    static readonly X2: string;
    constructor(graph: Graph, x1: Tensor, x2: Tensor);
    validate(): void;
}
export declare class Convolution2DNode extends Node {
    private x;
    private w;
    private b;
    fieldSize: number;
    outputDepth: number;
    stride: number;
    zeroPad: number;
    static readonly X: string;
    static readonly W: string;
    static readonly B: string;
    constructor(graph: Graph, x: Tensor, w: Tensor, b: Tensor, fieldSize: number, outputDepth: number, stride?: number, zeroPad?: number);
    validate(): void;
}
export declare class MaxPoolNode extends Node {
    private x;
    fieldSize: number;
    stride: number;
    zeroPad: number;
    static readonly X: string;
    constructor(graph: Graph, x: Tensor, fieldSize: number, stride?: number, zeroPad?: number);
    validate(): void;
}
export declare class ReLUNode extends Node {
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class ExpNode extends Node {
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class LogNode extends Node {
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class TanHNode extends Node {
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class SigmoidNode extends Node {
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class SquareNode extends Node {
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class SoftmaxCrossEntropyCostNode extends Node {
    private x;
    private target;
    static readonly X: string;
    static readonly TARGET: string;
    constructor(graph: Graph, x: Tensor, target: Tensor);
    validate(): void;
}
export declare class SoftmaxNode extends Node {
    private x;
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class MeanSquaredCostNode extends Node {
    private label;
    private prediction;
    static readonly LABEL: string;
    static readonly PREDICTION: string;
    constructor(graph: Graph, label: Tensor, prediction: Tensor);
    validate(): void;
}
export declare class ArgMaxNode extends Node {
    x: Tensor;
    static readonly X: string;
    constructor(graph: Graph, x: Tensor);
    validate(): void;
}
export declare class ArgMaxEqualsNode extends Node {
    private x1;
    private x2;
    static readonly X1: string;
    static readonly X2: string;
    constructor(graph: Graph, x1: Tensor, x2: Tensor);
    validate(): void;
}
export declare type ArrayData = NDArray | number | number[] | number[][] | number[][][] | number[][][][];
