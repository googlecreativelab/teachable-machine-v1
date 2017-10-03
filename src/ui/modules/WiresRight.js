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

class WiresRight {
    constructor(element) {
        this.element = element;

        this.canvas = document.createElement('canvas');
        this.bulbVert = true;
        this.bulbSmall = false;

        this.bulbGreen = this.element.querySelector('.wire--right-bulb-green-glow');
        this.bulbPurple = this.element.querySelector('.wire--right-bulb-purple-glow');
        this.bulbOrange = this.element.querySelector('.wire--right-bulb-orange-glow');

        this.element.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');

        this.offsetY = 0;
        this.animator = {};

        for (let index = 0; index < 3; index += 1) {

            let bulbElement = document.createElement('div');

            bulbElement.classList.add('wires__bulb');
            bulbElement.classList.add('wires__bulb-' + GLOBALS.classNames[index]);
            this.size();

            this.element.appendChild(bulbElement);

            this.animator[index] = {
                highlight: false,
                bulb: bulbElement
            };
        }

        window.addEventListener('resize', () => {
            this.size();
            this.bulbVert ? this.render() : this.renderAlt();
        });

        window.addEventListener('orientationchange', () => {
            this.size();
        });

        this.altOffset = 340;
        this.size();
        this.loops = 10;
        this.current = 0;
        this.running = false;
        this.renderOnce = true;
        this.bulbVert ? this.render() : this.renderAlt();

        if (this.bulbVert) {
            this.offsetY = -90;
            this.startY = 190 + this.offsetY;

            this.renderOnce = true;
            this.render();
        }else {
            this.altOffset = 300;
            this.size();
            this.renderAlt();
        }
    }

    render(once) {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.lineWidth = 3;

        for (let index = 0; index < 3; index += 1) {
            let startY = this.startY + (this.startSpace * index);

            let start = {
                x: this.startX,
                y: this.startY + (this.startSpace * index)
            };

            let end = {
                x: this.endX,
                y: this.endY + (this.endSpace * index)
            };

            let cp1 = {
                x: 5,
                y: start.y
            };

            let cp2 = {
                x: 25,
                y: end.y
            };
            this.context.strokeStyle = '#cfd1d2';
            this.context.beginPath();
            this.context.moveTo(start.x, start.y);
            this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
            this.context.stroke();
        }

        if (this.renderOnce) {
            this.renderOnce = false;
        }else {
            if (this.current < this.loops) {
                this.current += 1;
            }else {
                this.dehighlight();
            }
            this.running = true;
            this.timer = requestAnimationFrame(this.render.bind(this));
        }
    }

    renderAlt(once) {

        this.context.clearRect(0, 0, this.width, this.height);
        this.context.lineWidth = 3;

        for (let index = 0; index < 4; index += 1) {
            let startY = this.startY + (this.startSpace * index);

            let start = {
                x: this.startX,
                y: this.startY + (this.startSpace * index)
            };

            let end = {
                x: this.endX,
                y: this.endY + (this.endSpace * index)
            };


            this.context.strokeStyle = '#cfd1d2';
            this.context.beginPath();
            this.context.moveTo(start.x, start.y);
            this.context.lineTo(end.x, start.y);
            this.context.stroke();
        }

        if (this.renderOnce) {
            this.renderOnce = false;
        }else {
            if (this.current < this.loops) {
                this.current += 1;
            }else {
                this.dehighlight();
            }
            this.timer = requestAnimationFrame(this.renderAlt.bind(this));
        }
    }

    highlight(id) {
        let index = GLOBALS.classNames.indexOf(id);
        // console.log(index);
        // if (this.animator[index]) {
        //     let animator = this.animator[index];
        //     animator.bulb.classList.add('wires__bulb--selected');
        //     this.highlightedLineIndex = index;
        //     this.current = 0;
        //     this.start();
        // }
        switch (index) {
            case 0:
            this.bulbGreen.classList.add('bulb--selected');
            break;
            case 1:
            this.bulbOrange.classList.add('bulb--selected');
            break;
            case 2:
            this.bulbPurple.classList.add('bulb--selected');
            break;
            default:
        }
    }

    dehighlight() {
        this.bulbGreen.classList.remove('bulb--selected');
        this.bulbPurple.classList.remove('bulb--selected');
        this.bulbOrange.classList.remove('bulb--selected');
    }

    start() {
        if (!this.running) {
            this.timer = requestAnimationFrame(this.bulbVert ? this.render.bind(this) : this.renderAlt.bind(this));
        }
    }

    stop() {
        cancelAnimationFrame(this.timer);
        this.running = false;
    }

    size() {
        const BREAKPOINT_DESKTOP = 900;
        const BREAKPOINT_MED = 428;

        this.width = this.element.offsetWidth;
        let bulbs = Array.from(document.getElementsByClassName('wires__bulb'));
        this.startSpace = (this.height - 80) / 3;
        // console.log(this.startSpace);
        this.startSpace = 130;
        this.endSpace = (this.height + 45) / 5;
        this.canvas.width = 70;
        this.canvas.height = this.height;

        // this element rotated in css and using height as width
        // if (window.innerWidth >= BREAKPOINT_DESKTOP) {
            this.height = 450;

            // remove offset on desktop
            this.element.setAttribute('style', '');

            bulbs.forEach((bulb, index) => {
                bulb.style.top = this.endY + (index * this.endSpace) + 'px';
            });

            this.bulbVert = true;
        // }else {
        //     this.startSpace = (this.height) / 3.2;
        //     this.endSpace = this.height / 5;
        //     this.canvas.height = this.height + 100;
        //     this.height = BREAKPOINT_MED;
        //     this.bulbVert = false;
        //     let bulbs = Array.from(document.getElementsByClassName('wires__bulb'));
        //
        //     let scale = Math.round(window.innerWidth / 550 * 100) / 100;
        //     scale = (scale > 1) ? 1 : scale;
        //     let offset = this.altOffset * scale;
        //     let height = 60 * scale;
        //     let bulbSize = 2.5 - scale;
        //     let styles = `left: calc((-1 * (50% + 50px) + ${offset}px));
        //     transform: rotate(90deg) translateY(-100vw) scale(${scale});
        //     height: ${height}px`;
        //     this.element.setAttribute('style', styles);
        //     bulbs.forEach((bulb, index) => {
        //         bulb.style.top = 190 + ((bulbs.length - 1 - index) * this.endSpace * 1.57) + 'px';
        //         bulb.style.transform = 'scale(' + bulbSize + ')';
        //     });
        // }

        this.startX = 0;
        this.startY = 190 + this.offsetY;

        // this.endSpace = this.height / 5;
        this.endX = this.width;
        // this.endY = (this.height / 2) - (2 * this.endSpace) + 25;
        this.endY = 145;

        if (window.innerWidth <= BREAKPOINT_DESKTOP) {
            this.canvas.style.display = 'none';

            bulbs.forEach((bulb, index) => {
                bulb.style.top = 'none';
            });
        }
    }

}

import GLOBALS from './../../config.js';

export default WiresRight;