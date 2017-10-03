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

class RecordOpener {
    constructor(element) {
        this.element = element;
        this.openButton = new Button(document.querySelector('#open-recorder'));

        this.openButton.element.addEventListener('click', this.open.bind(this));
        // GLOBALS.outputSection.onChangeHandler = () => {
        //     this.enable();
        // };
        if (!GLOBALS.browserUtils.isChrome || GLOBALS.browserUtils.isMobile) {
            document.getElementById('record-open-section').style.display = 'none';
        }
    }

    disable() {
        this.openButton.element.classList.add('disabled');
    }

    enable() {
        this.openButton.element.classList.remove('disabled');
    }

    open() {
        TweenLite.to(window, 0.3, {scrollTo: 1});

        if (
            GLOBALS.outputSection.currentOutput &&
            GLOBALS.outputSection.currentOutput.element.querySelector('canvas')

        ) {
            setTimeout(() => {
                GLOBALS.recordSection.setCanvas(GLOBALS.outputSection.currentOutput.element.querySelector('canvas'));
            }, 500);
        }
    }
}

import GLOBALS from './../../config.js';
import Button from './../components/Button.js';
import TweenLite from 'gsap';

export default RecordOpener;