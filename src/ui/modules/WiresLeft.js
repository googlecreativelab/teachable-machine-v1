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

import GLOBALS from './../../config.js';

class WiresLeft {
    constructor(element, learningClasses) {
        this.element = element;
        this.learningClasses = learningClasses;
        this.offsetY = 0;
        this.canvas = document.createElement('canvas');
        this.size();
        this.element.appendChild(this.canvas);
        this.wireGeneral = this.element.querySelector('.st0');
        this.wireGreen = this.element.querySelector('.wire-green');
        this.wirePurple = this.element.querySelector('.wire-purple');
        this.wireOrange = this.element.querySelector('.wire-orange');
        this.context = this.canvas.getContext('2d');
        this.vertical = true;

        window.addEventListener('resize', () => {
            this.size();
            this.render();
        });

        this.currentAnimator = null;
        this.renderOnce = true;
        this.render();
    }

    render(once) {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.lineWidth = 3;

        for (let index = 0; index < 3; index += 1) {

            let startY = this.startY + (this.startSpace * index);
            let endY = this.endY + (this.endSpace * index);

            let start = {
                x: 0,
                y: this.startY + (this.startSpace * index)
            };

            let end = {
                x: this.endX,
                y: this.endY + (this.endSpace * index)
            };

            let cp1 = {
                x: 35,
                y: start.y
            };

            let cp2 = {
                x: 10,
                y: end.y
            };

            this.context.strokeStyle = '#cfd1d2';
            
            if (this.animator[index].highlight) {
                this.context.strokeStyle = this.animator[index].color;
            }

            this.context.beginPath();
            this.context.moveTo(start.x, start.y);
            this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
            this.context.lineTo(start.x + 100, start.y);
            this.context.stroke();
        }

        if (this.renderOnce) {
            this.renderOnce = false;
        }else {
            this.timer = requestAnimationFrame(this.render.bind(this));
        }

    }

    camMode() {
        if (this.vert) {
            this.element.style.left = 50 + '%';
        }
        this.offsetY = -2;
        this.startY = (this.height / 2) + this.offsetY;
        this.renderOnce = true;
        this.render();
    }


    highlight(index) {
        this.currentAnimator = this.animator[index];
        this.currentAnimator.highlight = true;
        this.start();

        switch (index) {
            case 0:
            this.wireGreen.classList.add('animate');
            break;
            case 1:
            this.wireOrange.classList.add('animate');
            break;
            case 2:
            this.wirePurple.classList.add('animate');
            break;
            default:
        }
    }

    dehighlight(index) {
        if (this.currentAnimator) {
            this.currentAnimator.highlight = false;
            this.currentAnimator = null;
            this.stop();
            this.renderOnce = true;
            this.render();
        }
        this.wireGreen.classList.remove('animate');
        this.wirePurple.classList.remove('animate');
        this.wireOrange.classList.remove('animate');
    }

    start() {
        this.stop();
        this.timer = requestAnimationFrame(this.render.bind(this));
    }

    stop() {
        if (this.timer) {
            cancelAnimationFrame(this.timer);
        }
    }

    size() {
        const BREAKPOINT_DESKTOP = 900;

        this.width = this.element.offsetWidth;

        let firstLearningClass = this.learningClasses[0];
        let lastLearningClass = this.learningClasses[2];

        let classesHeight = lastLearningClass.offsetTop - firstLearningClass.offsetTop;

        this.height = 440;

        // remove offset on desktop
        this.element.setAttribute('style', '');
        this.endSpace = classesHeight / 2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.startSpace = 3;

        this.startX = 0;
        // this.startY = (this.height / 2);
        this.startY = (this.height / 2) + this.offsetY;
        this.endX = this.width;
        this.endY = 80;

        this.animator = {};
        for (let index = 0; index < 3; index += 1) {
            let id = GLOBALS.classNames[index];
            this.animator[index] = {
                highlight: false,
                percentage: 0,
                color: GLOBALS.colors[id],
                numParticles: 15
            };
        }

        if (window.innerWidth <= BREAKPOINT_DESKTOP) {
            this.canvas.style.display = 'none';
        }

        this.renderOnce = true;
    }

}

export default WiresLeft;