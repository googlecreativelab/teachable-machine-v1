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

class LearningSection {
	constructor(element) {
		this.element = element;
		let learningClassesElements = element.querySelectorAll('.learning__class');
        this.condenseElement = element.querySelector('#learning-condensed-button');
        this.condenseElement.addEventListener('click', this.condenseSection.bind(this));
		let learningClasses = [];
		let that = this;
		this.condensed = false;

		that.learningClasses = [];
		let classNames = GLOBALS.classNames;
		let colors = GLOBALS.colors;
		
		learningClassesElements.forEach(function(element, index) {
			let id = classNames[index];
			let color = colors[id];
			let rgbaColor = GLOBALS.rgbaColors[id];

			let options = {
				index: index,
				element: element,
				section: that, 
				color: color, 
				rgbaColor: rgbaColor
			};

			let learningClass = new LearningClass(options);
			learningClass.index = index;
			learningClasses.push(learningClass);
			that.learningClasses[index] = learningClass;
			// learningClass.start();
		});

		// this.trainingQuality = new TrainingQuality(element.querySelector('.quality'));

		this.wiresLeft = new WiresLeft(document.querySelector('.wires--left'), learningClassesElements);
		this.wiresRight = new WiresRight(document.querySelector('.wires--right'), learningClassesElements);
		this.highestIndex = null;
		this.currentIndex = null;

		this.arrow = new HighlightArrow(2);
		TweenMax.set(this.arrow.element, {
			rotation: 90,
			scale: 0.6,
			x: 120,
			y: -175
		});
		this.element.appendChild(this.arrow.element);
	}

    condenseSection() {
		this.condensed ? this.element.classList.remove('condensed') : this.element.classList.add('condensed');
		this.condensed ? this.condensed = false : this.condensed = true;
    }

	ready() {
		this.learningClasses.forEach((learningClass) => {
			learningClass.start();
		});
	}

	
	highlight() {
		this.arrow.show();
		TweenMax.from(this.arrow.element, 0.3, {opacity: 0});
	}

	dehighlight() {
		TweenMax.killTweensOf(this.arrow.element, 0.3, {opacity: 0});
		this.arrow.hide();
	}

	enable(highlight) {
		this.element.classList.remove('section--disabled');
		this.wiresLeft.element.classList.remove('wires--disabled');
		this.wiresRight.element.classList.remove('wires--disabled');

		if (highlight) {
			this.highlight();
		}
	}

	disable() {
		this.element.classList.add('section--disabled');
		this.wiresLeft.element.classList.add('wires--disabled');
		this.wiresRight.element.classList.add('wires--disabled');
	}

	dim() {
		this.element.classList.add('dimmed');
		this.wiresLeft.element.classList.add('dimmed');
		this.wiresRight.element.classList.add('dimmed');
	}

	undim() {
		this.element.classList.remove('dimmed');
		this.wiresLeft.element.classList.remove('dimmed');
		this.wiresRight.element.classList.remove('dimmed');
	}

	highlightClass(index) {
		this.learningClasses[index].highlight();
	}

	dehighlightClass(index) {
		this.learningClasses[index].dehighlight();
	}

	highlightClassX(index) {
		this.learningClasses[index].highlightX();
	}

	dehighlightClassX(index) {
		this.learningClasses[index].dehighlightX();
	}

	enableClass(index, highlight) {
		this.learningClasses[index].element.classList.remove('learning__class--disabled');

		if (highlight) {
			this.highlightClass(index);
		}
	}

	disableClass(index) {
		this.learningClasses[index].element.classList.add('learning__class--disabled');
	}

	clearExamples() {
		this.learningClasses.forEach((learningClass) => {
			learningClass.clear();
			learningClass.setConfidence(0);
			learningClass.dehighlightConfidence();
		});
	}

	startRecording(id) {
		this.wiresLeft.highlight(id);
	}

	stopRecording() {
		this.wiresLeft.dehighlight();
	}
	
	ledOn(id) {
		this.wiresRight.dehighlight();
		this.wiresRight.highlight(id);
	}

	getMaxIndex(array) {
		let max = array[0];
		let maxIndex = 0;

		for (let index = 1; index < array.length; index += 1) {
			if (array[index] > max) {
				maxIndex = index;
				max = array[index];
			}
		}

		return maxIndex;
	}

	setConfidences(confidences) {
		const confidencesArry = Object.values(confidences);
		let maxIndex = this.getMaxIndex(confidencesArry);
		let maxValue = confidencesArry[maxIndex];
		// if (maxValue > 0.5 && this.currentIndex !== maxIndex) {
		if (maxValue > 0.5) {
			this.currentIndex = maxIndex;
			let id = GLOBALS.classNames[this.currentIndex];
			this.ledOn(id);
			GLOBALS.outputSection.trigger(id);
		}

		for (let index = 0; index < 3; index += 1) {
			this.learningClasses[index].setConfidence(confidencesArry[index] * 100);
			if (index === maxIndex) {
				this.learningClasses[index].highlightConfidence();
			}else { 
				this.learningClasses[index].dehighlightConfidence();
			}
		}
	}

	setQuality(quality) {
		// this.trainingQuality.setQuality(quality);
	}

}

import GLOBALS from './../../config.js';
import TweenMax from 'gsap';
import WiresLeft from './WiresLeft.js';
import WiresRight from './WiresRight.js';
import LearningClass from './LearningClass.js';
import TrainingQuality from './TrainingQuality.js';
import HighlightArrow from './../components/HighlightArrow.js';


export default LearningSection;