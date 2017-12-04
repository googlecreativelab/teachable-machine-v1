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

class LearningClass {
	constructor(options) {
		this.element = options.element;
		this.section = options.section;
		this.canvas = this.element.querySelector('canvas.examples__viewer');
		this.canvas.width = 98;
		this.canvas.height = 98;
		this.context = this.canvas.getContext('2d');

		this.id = this.element.getAttribute('id');
		this.index = options.index;
		this.button = new Button(this.element.querySelector('a.button--record'));
		this.button.element.addEventListener('mousedown', this.buttonDown.bind(this));

		this.button.element.addEventListener('touchstart', this.buttonDown.bind(this));
		this.button.element.addEventListener('touchend', this.buttonUp.bind(this));

		this.resetLink = this.element.querySelector('.link--reset');
		// this.button.element.addEventListener('mouseup', this.buttonUp.bind(this));
		this.exampleCounterElement = this.element.querySelector('.examples__counter');
		this.exampleCounter = 0;

		this.percentage = 0;
		this.percentageElement = this.element.querySelector('.machine__value');
		this.percentageGrey = this.element.querySelector('.machine__percentage--grey');
		this.percentageWhite = this.element.querySelector('.machine__percentage--white');
		this.color = options.color;
		this.rgbaColor = options.rgbaColor;



		this.arrow = new HighlightArrow(3);
		this.arrow.element.style.left = 100 + '%';
		this.arrow.element.style.top = 100 + '%';
		this.arrow.element.width = 60;
		TweenMax.set(this.arrow.element, {
			rotation: 90,
			scale: 1,
			x: 10,
			y: -75
		});
		this.element.appendChild(this.arrow.element);

		this.arrowX = new HighlightArrow(2);
		this.arrowX.element.style.left = 0 + '%';
		this.arrowX.element.style.top = 0 + '%';
		this.arrowX.element.width = 60;
		TweenMax.set(this.arrowX.element, {
			rotation: -90,
			scaleX: -0.8,
			scaleY: 0.8,
			x: 37,
			y: -30
		});
		this.element.appendChild(this.arrowX.element);

		this.resetLink.addEventListener('click', this.resetClass.bind(this));
		this.size();
		window.addEventListener('resize', this.size.bind(this));
	}

	hide() {
		this.element.style.display = 'none';
	}

	show() {
		this.element.style.display = 'flex';
	}

	highlight() {
		this.arrow.show();
		TweenMax.from(this.arrow.element, 0.3, {
			opacity: 0,
			x: 40
		});
	}

	dehighlight() {
		TweenMax.killTweensOf(this.arrow.element);
		this.arrow.hide();
	}

	highlightX() {
		this.arrowX.show();
		TweenMax.from(this.arrowX.element, 0.3, {opacity: 0});
	}

	dehighlightX() {
		TweenMax.killTweensOf(this.arrowX.element);
		this.arrowX.hide();
	}

	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.setSamples(0);
	}

	resetClass(event) {
		event.preventDefault();
		GLOBALS.inputSection.resetClass(this.index);
		this.clear();
	}

	setSamples(length) {
		this.exampleCounter = length;
		let text = this.exampleCounter;	

		let recommendedNumSamples = (GLOBALS.inputType === 'cam') ? 30 : 10;

		this.exampleCounterElement.textContent = text;

		if (this.exampleCounter >= recommendedNumSamples && GLOBALS.classesTrained[this.id] === false) {
			GLOBALS.classesTrained[this.id] = true;
		}
	}

	setConfidence(percentage) {
		if (!GLOBALS.clearing) {
            // this.percentage = percentage;
            // this.updatePercentage();
            let that = this;
            GLOBALS.recordSection.setMeters(this.id, percentage);
            TweenMax.to(this, 0.5, {
                percentage: percentage,
                onUpdate: () => {
                    that.updatePercentage();
                }
            });
        }
	}

	highlightConfidence() {
		this.percentageElement.style.background = this.color;
	}

	dehighlightConfidence() {
		this.percentageElement.style.background = '#cfd1d2';
	}

	buttonDown() {
		let that = this;
		this.button.setText('Training');
		this.section.startRecording(this.index);

		this.buttonUpEvent = this.buttonUp.bind(this);
		window.addEventListener('mouseup', this.buttonUpEvent);

		GLOBALS.recording = true;
		GLOBALS.classId = this.id;

        GLOBALS.outputSection.toggleSoundOutput(false);

		setTimeout(() => {
			GLOBALS.webcamClassifier.buttonDown(this.id, this.canvas, this);
		}, 100);

		gtag('event', 'training', {'id': this.index});
	}

	buttonUp() {
		this.button.setText(`Train <br>${this.id}`);
		this.section.stopRecording();
		this.button.up();

		GLOBALS.classId = null;
		GLOBALS.recording = false;

        GLOBALS.outputSection.toggleSoundOutput(true);

		GLOBALS.webcamClassifier.buttonUp(this.id, this.canvas);

		if (this.exampleCounter > 0) {
			let event = new CustomEvent('class-trained', {
				detail: {
					id: this.id,
					numSamples: this.exampleCounter
				}
			});
			window.dispatchEvent(event);
		}

		window.removeEventListener('mouseup', this.buttonUpEvent);
	}

	updatePercentage() {
		let rounded = Math.floor(this.percentage);
		this.percentageElement.style.width = this.percentage + '%';
		this.percentageWhite.textContent = rounded + '%';

		if (this.timer) {
			clearInterval(this.timer);
		}
		this.timer = setInterval(() => {
			this.setConfidence(0);
		}, 500);
	}

	size() {
		this.percentageElement.style.width = 100 + '%';
		let width = this.percentageElement.offsetWidth;
		this.percentageWhite.style.width = width + 'px';
		this.percentageElement.style.width = 0 + '%';
	}

	start() {
		this.size();
	}
}

import GLOBALS from './../../config.js';
import TweenMax from 'gsap';
import Button from './../components/Button.js';
import HighlightArrow from './../components/HighlightArrow.js';

export default LearningClass;