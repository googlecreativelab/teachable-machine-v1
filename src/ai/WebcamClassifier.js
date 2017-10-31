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

/* eslint-disable camelcase, max-lines */
const IMAGE_SIZE = 227;
const INPUT_SIZE = 1000;
const TOPK = 20;
const CLASS_COUNT = 3;

const MEASURE_TIMING_EVERY_NUM_FRAMES = 20;

// The following global variables are available for use in onSpcialButtonClick:
// confidences for each class
var globConf = [0, 0, 0];
// number of TOPK images in each class
var globNCounts = [0, 0, 0] ;


function passThrough() {
  return 0;
}

function onSpecialButtonClick() {
  //REMOVE THE LINE BELOW FOR THE PSET. THIS FUNCTION SHOULD BE EMPTY
  window.alert('Confidences for each class: ' + globConf 
	       + '\n Number of the top ' + TOPK +  ' closest matches in each class: ' + globNCounts);
}

class WebcamClassifier {
  constructor() {
    this.loaded = false;
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');

    this.blankCanvas = document.createElement('canvas');
    this.blankCanvas.width = 227;
    this.blankCanvas.height = 227;
    this.timer = null;
    this.active = false;
    this.wasActive = false;
    this.latestCanvas = document.createElement('canvas');
    this.latestCanvas.width = 98;
    this.latestCanvas.height = 98;
    this.latestContext = this.latestCanvas.getContext('2d');
    this.thumbCanvas = document.createElement('canvas');
    this.thumbCanvas.width = Math.floor(this.latestCanvas.width / 3) + 1;
    this.thumbCanvas.height = Math.floor(this.latestCanvas.height / 3) + 1;
    this.thumbContext = this.thumbCanvas.getContext('2d');
    this.thumbVideoX = 0;
    this.classNames = GLOBALS.classNames;
    this.images = {};
    for (let index = 0; index < this.classNames.length; index += 1) {
      this.images[this.classNames[index]] = {
        index: index,
        down: false,
        imagesCount: 0,
        images: [],
        latestImages: [],
        latestThumbs: []
      };
    }
    this.isDown = false;
    this.current = null;

    this.useFloatTextures = !GLOBALS.browserUtils.isMobile && !GLOBALS.browserUtils.isSafari;
    
    const features = {};
    features.WEBGL_FLOAT_TEXTURE_ENABLED = this.useFloatTextures;
    const env = new Environment(features);
    environment.setEnvironment(env);

    this.gl = gpgpu_util.createWebGLContext();
    this.gpgpu = new GPGPUContext(this.gl);
    this.math = new NDArrayMathGPU(this.gpgpu);
    this.mathCPU = new NDArrayMathCPU();
    this.currentClass = null;
    this.trainLogitsMatrix = null;
    this.squashLogitsDenominator = Scalar.new(300);
    this.measureTimingCounter = 0;
    this.lastFrameTimeMs = 1000;

    this.trainClassLogitsMatrices = [];
    this.classExampleCount = [];

    for (let index = 0; index < CLASS_COUNT; index += 1) {
      this.trainClassLogitsMatrices.push(null);
      this.classExampleCount.push(0);
    }

    this.activateWebcamButton = document.getElementById('input__media__activate');
    if (this.activateWebcamButton) {
      this.activateWebcamButton.addEventListener('click', () => {
        location.reload();
      });
    }
    
    document.getElementById('specialButton').addEventListener('click', onSpecialButtonClick);
  }

  deleteClassData(index) {
    if (this.trainClassLogitsMatrices[index]) {
      this.trainClassLogitsMatrices[index].dispose();
      this.trainClassLogitsMatrices[index] = null;
      this.trainLogitsMatrix.dispose();
      this.trainLogitsMatrix = null;
      this.classExampleCount[index] = 0;
      this.images[this.classNames[index]].imagesCount = 0;
      this.images[this.classNames[index]].latestThumbs = [];
      this.images[this.classNames[index]].latestImages = [];
    }
  }

  ready() {
    if (this.loaded) {
      this.startTimer();
    }else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(
      {
        video: true,
        audio: (GLOBALS.browserUtils.isChrome && !GLOBALS.browserUtils.isMobile)
      }).
      then((stream) => {
        GLOBALS.isCamGranted = true;
        if ((GLOBALS.browserUtils.isChrome && !GLOBALS.browserUtils.isMobile)) {
          GLOBALS.audioContext.createMediaStreamSource(stream);
          GLOBALS.stream = stream;
        }
        this.activateWebcamButton.style.display = 'none';
        this.active = true;
        this.stream = stream;
        this.video.addEventListener('loadedmetadata', this.videoLoaded.bind(this));
        this.video.srcObject = stream;
        this.squeezeNet = new SqueezeNet(this.gpgpu, this.math, this.useFloatTextures);
        this.squeezeNet.loadVariables().then(() => {
          this.math.scope(() => {
            const warmupInput = Array3D.zeros(
              [
              IMAGE_SIZE,
              IMAGE_SIZE,
              3
              ]
            );
            // Warmup
            const inferenceResult = this.squeezeNet.infer(warmupInput);
      
            for (const key in inferenceResult.namedActivations) {
              if (key in inferenceResult.namedActivations) {
                this.math.track(inferenceResult.namedActivations[key]);
              }
            }
            this.math.track(inferenceResult.logits);
          });

          this.loaded = true;
          this.wasActive = true;
          this.startTimer();
        });

        let event = new CustomEvent('webcam-status', {detail: {granted: true}});
        window.dispatchEvent(event);
        gtag('event', 'webcam_granted');        
      }).
      catch((error) => {
        let event = new CustomEvent('webcam-status', {
          detail: {
            granted: false,
            error: error
          }
        });
        this.activateWebcamButton.style.display = 'block';
        window.dispatchEvent(event);
        gtag('event', 'webcam_denied');
      });
    }
  }

  videoLoaded() {
    let videoRatio = this.video.videoWidth / this.video.videoHeight;
    let parent = this.video.parentNode; 
    let parentWidth = parent.offsetWidth;
    let parentHeight = parent.offsetHeight;
    let videoWidth = parentHeight * videoRatio;
    this.video.style.width = videoWidth + 'px';
    this.video.style.height = parentHeight + 'px';
    this.video.style.transform = 'scaleX(-1) translate(50%, -50%)';

    // If video is taller:
    if (videoRatio < 1) {
      this.video.style.transform = 'scale(-2, 2) translate(20%, -30%)';
    }
  }

  blur() {
    if (this.timer) {
      this.stopTimer();
    }
  }

  focus() {
    if (this.wasActive) {
      this.startTimer();
    }
  }

  saveTrainingLogits() {
    if (this.trainLogitsMatrix !== null) {
      this.trainLogitsMatrix.dispose();
      this.trainLogitsMatrix = null;
    }

    const logits = this.captureFrameSqueezeNetLogits();
    if (this.trainClassLogitsMatrices[this.current.index] === null) {
      this.trainClassLogitsMatrices[this.current.index] =
      this.math.keep(logits.as3D(1, INPUT_SIZE, 1));
    }else {
      const axis = 0;
      const newTrainLogitsMatrix = this.math.concat3D(
        this.trainClassLogitsMatrices[this.current.index].as3D(
          this.classExampleCount[this.current.index], INPUT_SIZE, 1),
        logits.as3D(1, INPUT_SIZE, 1), axis);

      this.trainClassLogitsMatrices[this.current.index].dispose();
      this.trainClassLogitsMatrices[this.current.index] =
      this.math.keep(newTrainLogitsMatrix);
    }
    this.classExampleCount[this.current.index] += 1;
  }

  getNumExamples() {
    let total = 0;
    for (let index = 0; index < this.classExampleCount.length; index += 1) {
      total += this.classExampleCount[index];
    }

    return total;
  }

  buttonDown(id, canvas, learningClass) {
    this.current = this.images[id];
    this.current.down = true;
    this.isDown = true;

    this.videoRatio = this.video.videoWidth / this.video.videoHeight;
    this.currentClass = learningClass;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.videoWidth = this.canvasHeight * this.videoRatio;

    this.thumbVideoHeight = this.canvasHeight / 3;
    this.thumbVideoWidth = this.canvasWidth / 3;
    this.thumbVideoWidthReal = this.thumbVideoHeight * this.videoRatio;
    this.thumbVideoX = -(this.thumbVideoWidthReal - this.thumbVideoWidth) / 2;
    this.currentContext = this.currentClass.canvas.getContext('2d');
  }

  buttonUp(id) {
    this.images[id].down = false;
    this.isDown = false;


    this.current = null;
    this.currentContext = null;
    this.currentClass = null;
  }

  startTimer() {
    if (this.timer) {
      this.stopTimer();
    }

    this.video.play();
    this.wasActive = true;
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  stopTimer() {
    this.active = false;
    this.wasActive = true;
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  animate() {
    if (this.isDown) {
      this.math.scope(() => {
        this.saveTrainingLogits(this.current.index);
      });
      
      if (this.currentClass.index == 0 && this.current.imagesCount > 29){
        window.alert('No more inputs to class 0 allowed. 30 input max.');
        return;
        //need to restart timer
      }
      
      this.current.imagesCount += 1;
      console.log('Current.ImagesCount ' + this.current.imagesCount); //total # images in class
      console.log('currentClass.index ' + this.currentClass.index); //0, 1, 2

      this.currentClass.setSamples(this.current.imagesCount);
      if (this.current.latestThumbs.length > 8) {
        this.current.latestThumbs.shift();
      }
      if (this.current.latestImages.length > 8) {
        this.current.latestImages.shift();
      }

      this.thumbContext.drawImage(
        this.video, this.thumbVideoX, 0, this.thumbVideoWidthReal,
        this.thumbVideoHeight);
      let data = this.thumbContext.getImageData(
        0, 0, this.canvasWidth, this.canvasHeight);
      this.current.latestThumbs.push(data);

      let cols = 0;
      let rows = 0;

      for (let index = 0; index < this.current.latestThumbs.length; index += 1) {
        this.currentContext.putImageData(
          this.current.latestThumbs[index], (2 - cols) * this.thumbCanvas.width,
          rows * this.thumbVideoHeight, 0, 0, this.thumbCanvas.width,
          this.thumbCanvas.height);
        if (cols === 2) {
          rows += 1;
          cols = 0;
        }else {
          cols += 1;
        }
      }
      this.timer = requestAnimationFrame(this.animate.bind(this));
    }else if (this.getNumExamples() > 0) {
      const numExamples = this.getNumExamples();

      let measureTimer = false;
      let start = performance.now();
      measureTimer = this.measureTimingCounter === 0;

      const knn = this.math.scope((keep) => {
        const frameLogits = this.captureFrameSqueezeNetLogits();

        if (this.trainLogitsMatrix === null) {
          let newTrainLogitsMatrix = null;

          for (let index = 0; index < CLASS_COUNT; index += 1) {
            newTrainLogitsMatrix = this.concat(
              newTrainLogitsMatrix, this.trainClassLogitsMatrices[index]);
          }

          this.trainLogitsMatrix = keep(this.math.clone(newTrainLogitsMatrix));
        }

        return this.math.matMul(
          this.trainLogitsMatrix.as2D(numExamples, 1000),
          frameLogits.as2D(1000, 1)).as1D();
      });

      const computeConfidences = () => {
	    // comment these lines
        const kVal = Math.min(TOPK, numExamples);
        const topK = this.mathCPU.topK(knn, kVal);
        knn.dispose();

        //These are the indices of the topK (sorted first by class and then the order in which they were taken)
        const indices = topK.indices.getValues();
        
        const classTopKMap = [0, 0, 0];
        
        for (let index = 0; index < indices.length; index += 1) {
          classTopKMap[this.getClassFromIndex(indices[index])] += 1;
        }

        let nCounts = [0, 0, 0];
        let confidences = [];
        for (let index = 0; index < CLASS_COUNT; index += 1) {
          nCounts[index] = classTopKMap[index];
          const probability = classTopKMap[index] / kVal;
          confidences[index] = probability;
        }

	      // set the global values to they can be used in onSpecialButtonClick
        globConf = confidences;
	      globNCounts = nCounts;
 
        console.log('Number of the top ' + TOPK +  ' closest matches in each class: ' + nCounts);
        console.log('Confidence for which the image matches each class: ' + confidences);

        GLOBALS.learningSection.setConfidences(confidences);

        this.measureTimingCounter = (this.measureTimingCounter + 1) % MEASURE_TIMING_EVERY_NUM_FRAMES;

        this.timer = requestAnimationFrame(this.animate.bind(this));
      };

      if (!GLOBALS.browserUtils.isSafari || measureTimer || !GLOBALS.browserUtils.isMobile) {
        knn.getValuesAsync().then(() => {
          this.lastFrameTimeMs = performance.now() - start;
          computeConfidences();
        });
      }else {
        setTimeout(computeConfidences, this.lastFrameTimeMs);
      }

    }else {
      this.timer = requestAnimationFrame(this.animate.bind(this));
    }
  }
  

  getClassFromIndex(index) {
    let prevSum = 0;
    for (let ind = 0; ind < CLASS_COUNT; ind += 1) {
      if (index < this.classExampleCount[ind] + prevSum) {
        return ind;
      }
      prevSum += this.classExampleCount[ind];
    }

    return 2;
  }

  concat(ndarray1, ndarray2) {
    if (ndarray1 === null) {
      return ndarray2;
    }else if (ndarray2 === null) {
      return ndarray1;
    }
    const axis = 0;

    return this.math.concat3D(
      ndarray1.as3D(ndarray1.shape[0], INPUT_SIZE, 1),
      ndarray2.as3D(ndarray2.shape[0], INPUT_SIZE, 1), axis);
  }

  captureFrameSqueezeNetLogits() {
    const canvasTexture =
    this.math.getTextureManager().acquireTexture(
      [
      IMAGE_SIZE,
      IMAGE_SIZE
      ]);
    this.gpgpu.uploadPixelDataToTexture(canvasTexture, this.video);
    const preprocessedInput =
    this.math.track(this.squeezeNet.preprocessColorTextureToArray3D(
      canvasTexture, 
      [
      IMAGE_SIZE,
      IMAGE_SIZE
      ]));
    this.math.getTextureManager().releaseTexture(
      canvasTexture, 
      [
      IMAGE_SIZE,
      IMAGE_SIZE
      ]);

    // Infer through squeezenet.
    const inferenceResult = this.squeezeNet.infer(preprocessedInput);

    for (const key in inferenceResult.namedActivations) {
      if (key in inferenceResult.namedActivations) {
        this.math.track(inferenceResult.namedActivations[key]);
      }
    }

    const squashedLogits = this.math.divide(
      inferenceResult.logits, this.squashLogitsDenominator);

    // Normalize to unit length
    const squared = this.math.multiplyStrict(squashedLogits, squashedLogits);
    const sum = this.math.sum(squared);
    const sqrtSum = this.math.sqrt(sum);

    return this.math.divide(squashedLogits, sqrtSum);
  }
}

import {GPGPUContext, NDArrayMathCPU, NDArrayMathGPU, Array1D, Array2D, Array3D, NDArray, gpgpu_util, util, Scalar, Environment, environment, ENV}from 'deeplearn';

import GLOBALS from './../config.js';
import SqueezeNet from './squeezenet';

export default WebcamClassifier;
/* eslint-enable camelcase, max-lines */
