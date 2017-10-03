export declare function defaultCompare<T>(a: T, b: T): number;
export declare type Comparator<T> = (a: T, b: T) => number;
export declare type IndexObserver<T> = (t: T, newIndex: number) => void;
export declare class PriorityQueue<T> {
    private comparator;
    private indexObserver;
    private heap;
    constructor(comparator: Comparator<T>, indexObserver?: IndexObserver<T>);
    enqueue(t: T): void;
    dequeue(): T;
    update(newT: T, index: number): void;
    empty(): boolean;
    private onIndexChanged(t, newIndex);
    private getParentIndex(index);
    private getLeftChildIndex(index);
    private getRightChildIndex(index);
    private siftUpIndex(index);
    private siftUp(index);
    private siftDownIndex(index);
    private siftDown(index);
    private compare(aIndex, bIndex);
    private swap(a, b);
}
