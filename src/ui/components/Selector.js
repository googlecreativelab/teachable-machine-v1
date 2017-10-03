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

class Selector {
	constructor(element) {
		this.element = element;
		let wrapper = element.parentNode;

		this.element.addEventListener('change', this.change.bind(this));
		this.titleWrapper = document.createElement('div');
		this.titleWrapper.classList.add('output__selector-title-wrapper');
		this.title = document.createElement('span');
		this.title.classList.add('output__selector-title');
		this.titleWrapper.appendChild(this.title);		

		wrapper.appendChild(this.titleWrapper);

		this.change();
	}

	change() {
		let value = this.element.value;
		let text = this.element.options[this.element.selectedIndex].textContent;
		this.title.textContent = text;
	}
}

import GLOBALS from './../../config.js';

export default Selector;