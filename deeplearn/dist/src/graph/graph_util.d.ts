import { Node, Tensor } from './graph';
import { TensorArrayMap } from './tensor_array_map';
export declare function getUnorderedEvaluationSet(nodes: Node[], terminatingNodes: Node[]): Node[];
export declare function getOrderedEvaluationSet(unorderedEvaluationSet: Node[]): Node[];
export declare function isInputNode(node: Node): boolean;
export declare function shouldBackProp(t: Tensor): boolean;
export declare function isPassthroughNode(node: Node, map: TensorArrayMap): boolean;
