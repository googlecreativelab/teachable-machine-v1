import { GPGPUContext } from './gpgpu_context';
export declare class TextureManager {
    private gpgpu;
    private numUsedTextures;
    private numFreeTextures;
    private freeTextures;
    private logEnabled;
    private usedTextureCount;
    constructor(gpgpu: GPGPUContext);
    acquireTexture(shapeRC: [number, number]): WebGLTexture;
    releaseTexture(texture: WebGLTexture, shape: [number, number]): void;
    private log();
    getNumUsedTextures(): number;
    getNumFreeTextures(): number;
    dispose(): void;
}
