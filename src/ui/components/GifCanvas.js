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

class GifCanvas {

    constructor() {
        this.element = document.createElement('div');
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.element.style.display = 'none';
        this.canvas.width = 340;
        this.canvas.height = 260;
        this.canvas.classList.add('gifler-canvas');
        this.canvas.name = 'gif';
        this.element.appendChild(this.canvas);
        this.gifs = {};
    }

    setSource(source) {
        if (GLOBALS.isRecording) {
            // Downsize the recorder gif
            let smallerSource = source.replace('200w.gif', '200_d.gif');
            if (smallerSource !== this.source) {
                this.clear();
                this.source = smallerSource;
                this.getGifler(smallerSource);
            }
        }
    }

    getGifler(source) {
        return new Promise((resolve) => {
            if (!this.gifs[source]) {
                /* eslint-disable */
                window.gifler(source)
                    .frames('canvas.gifler-canvas', this.draw.bind(this))
                    .then((response) => {
                    this.gifs[source] = response;
                    this.gifs[source].start();
                    resolve(this.gifs[source]);
                });
                /* eslint-enable */
            }
            if (this.gifs[source]) {
                this.gifs[source].start();
                resolve(this.gifs[source]);
            }
        });
    }

    draw(ctx, frame) {
        if (GLOBALS.isRecording) {
            let hRatio = this.canvas.width / frame.width;
            let vRatio = this.canvas.height / frame.height;
            let ratio = Math.min(hRatio, vRatio);
            let centerShiftX = (this.canvas.width - frame.width * ratio) / 2;
            let centerShiftY = (this.canvas.height - frame.height * ratio) / 2;
            ctx.drawImage(frame.buffer, 0, 0, frame.width, frame.height,
                centerShiftX, centerShiftY, frame.width * ratio, frame.height * ratio);
        }else {
            this.clear();
        }
    }

    clear() {
        this.source = null;
        Object.keys(this.gifs).forEach((key) => {
            let gif = this.gifs[key];
            gif.reset();
            gif.stop();
        });
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getElement() {
        return this.element;
    }
}
import GLOBALS from '../../index';
export default GifCanvas;