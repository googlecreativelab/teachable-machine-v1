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

class TrainingQuality {
	constructor(element) {
		this.element = element;

		this.percentage = 0;
		this.percentageElement = element.querySelector('.machine__value');
		this.percentageGrey = element.querySelector('.machine__percentage--grey');
		this.percentageWhite = element.querySelector('.machine__percentage--white');
		this.label = element.querySelector('.quality__status');
		this.percentageWhite.style.width = this.percentageGrey.offsetWidth + 'px';

		this.updatePercentage();
	}

	updatePercentage() {
		let rounded = Math.floor(this.percentage);
		this.percentageElement.style.width = this.percentage + '%';
		this.percentageGrey.textContent = rounded + '%';
		this.percentageWhite.textContent = rounded + '%';
	}

	setQuality(quality) {
		// this.percentage = quality * 100;
		// this.updatePercentage();
		let that = this;
		let percentage = quality * 100;

		TweenMax.to(that, 0.5, {
			percentage: percentage,
			onUpdate: () => {
				// console.log(that.percentage);
				that.updatePercentage();
			}
		});

		if (percentage < 65) {
			this.label.textContent = 'Your machine probably won’t work well';
		}else if (percentage > 90) {
			this.label.textContent = 'Perfect!';
		}else {
			this.label.textContent = 'Looking good';
		}
	}

	start() {
		// let that = this;
		// TweenMax.to(that, (Math.random() * 4) + 0.5, {
		// 	percentage: Math.floor(Math.random() * 100),
		// 	onUpdate: function() {
		// 		that.updatePercentage();
		// 	},
		// 	repeat: -1,
		// 	yoyo: true
		// });
	}
}

import TweenMax from 'gsap';

export default TrainingQuality;