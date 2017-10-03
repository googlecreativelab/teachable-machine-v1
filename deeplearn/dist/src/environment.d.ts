export declare enum Type {
    NUMBER = 0,
    BOOLEAN = 1,
}
export interface Features {
    'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED'?: boolean;
    'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE'?: boolean;
    'WEBGL_VERSION'?: number;
    'WEBGL_FLOAT_TEXTURE_ENABLED'?: boolean;
}
export declare const URL_PROPERTIES: URLProperty[];
export interface URLProperty {
    name: keyof Features;
    type: Type;
}
export declare class Environment {
    private features;
    constructor(features?: Features);
    get<K extends keyof Features>(feature: K): Features[K];
    private evaluateFeature<K>(feature);
}
export declare let ENV: Environment;
export declare function setEnvironment(environment: Environment): void;
