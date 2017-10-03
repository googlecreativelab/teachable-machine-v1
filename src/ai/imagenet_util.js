// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable */

import {webgl_util, ENV} from 'deeplearn';

/**
 * Unpacks an RGB packed image texture into a 2D physical, 3D logical texture
 * with the conventional ndarray format and performs the standard imagenet image
 * preprocessing.
 */
export function getUnpackAndPreprocessInputShader(gpgpu, inputShapeRC, useFloatTextures) {
  let setOutputSnippet;

  if (useFloatTextures) {
    setOutputSnippet = `
      void setOutput(float decodedValue) {
        gl_FragColor = vec4(decodedValue, 0, 0, 0);
      }
    `;
  } else {
    setOutputSnippet = `
      const vec4 floatPowers = vec4(
        1.0,
        255.0,
        255.0 * 255.0,
        255.0 * 255.0 * 255.0
      );

      const float maxValue = 20000.0;
      const float minValue = -maxValue;
      const float range = (maxValue - minValue) / 255.0;

      const vec2 recipRange = vec2(1.0/range);
      const vec2 recipRange255 = vec2(1.0/(maxValue - minValue));

      void setOutput(float decodedValue) {
        float a = dot(vec2(decodedValue, -minValue), recipRange);
        float b = fract(a) * 255.0;
        float c = fract(b) * 255.0;
        float d = fract(c) * 255.0;
        gl_FragColor = floor(vec4(a, b, c, d)) / 255.0;
      }
    `;
  }

  const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D source;
    varying vec2 resultUV;

    const vec2 inputShapeCR = vec2(${inputShapeRC[1]}.0, ${inputShapeRC[0]}.0);

    const vec2 halfCR = vec2(0.5, 0.5);

    ${setOutputSnippet}

    void main() {
      vec2 outputCR = floor(gl_FragCoord.xy);

      vec2 sourceCR = vec2(floor(outputCR[0] / 3.0), outputCR[1]);
      vec2 sourceUV = (sourceCR + halfCR) / inputShapeCR;

      vec4 sourceValue = texture2D(source, sourceUV) * 255.0;

      float channelValue = 0.0;
      int channel = int(mod(outputCR[0], 3.0));

      if (channel == 0) {
        channelValue = sourceValue.r - 103.939;
      } else if (channel == 1) {
        channelValue = sourceValue.g - 116.779;
      } else if (channel == 2) {
        channelValue = sourceValue.b - 123.68;
      }

      setOutput(channelValue);
    }`;

  return gpgpu.createProgram(fragmentShaderSource);
}

export function preprocessInput(
  gpgpu, preprocessInputShader, sourceTex, resultTex, shapeRowCol) {
  gpgpu.setOutputMatrixTexture(resultTex, shapeRowCol[0], shapeRowCol[1]);
  gpgpu.setProgram(preprocessInputShader);
  const samplerLocation = webgl_util.getProgramUniformLocationOrThrow(
      gpgpu.gl, preprocessInputShader, 'source');
  gpgpu.setInputMatrixTexture(sourceTex, samplerLocation, 0);
  gpgpu.executeProgram();
}