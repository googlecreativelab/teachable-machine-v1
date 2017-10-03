import { GPGPUContext } from './gpgpu_context';
export declare function getRenderRGBShader(gpgpu: GPGPUContext, destinationWidth: number): WebGLProgram;
export declare function renderToCanvas(gpgpu: GPGPUContext, renderShader: WebGLProgram, sourceTex: WebGLTexture): void;
export declare function renderToFramebuffer(gpgpu: GPGPUContext, renderShader: WebGLProgram, sourceTex: WebGLTexture): void;
