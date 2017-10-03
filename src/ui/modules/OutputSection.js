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

class OutputSection {
    constructor(element) {
        this.element = element;

        const outputs = {
            GIFOutput: new GIFOutput(),
            SoundOutput: new SoundOutput(),
            SpeechOutput: new SpeechOutput()
        };

        this.classNames = GLOBALS.classNames;
        GLOBALS.predicting = true;

        this.outputs = outputs;
        this.loadedOutputs = [];

        let outputLinks = element.querySelectorAll('.output_selector__option');
        outputLinks.forEach((link) => {
            link.addEventListener('click', this.changeOutput.bind(this));
        });
        this.currentLink = element.querySelector('.output_selector__option--selected');

        this.outputContainer = document.querySelector('#output-player');
        this.currentOutput = null;
        this.currentLink.click();

        this.arrow = new HighlightArrow(1);

        TweenMax.set(this.arrow.element, {
            rotation: -50,
            scale: -0.8,
            x: 140,
            y: -100
        });
        this.element.appendChild(this.arrow.element);
    }

    enable() {
        this.element.classList.remove('section--disabled');
    }

    highlight() {
        this.arrow.show();
        TweenMax.from(this.arrow.element, 0.3, {opacity: 0});
    }

    dehighlight() {
        TweenMax.killTweensOf(this.arrow.element);
        this.arrow.hide();
    }

    disable() {
        this.element.classList.add('section--disabled');
    }

    dim() {
        this.element.classList.add('dimmed');
    }

    undim() {
        this.element.classList.remove('dimmed');
    }

    changeOutput(event) {
        if (this.currentLink) {
            this.currentLink.classList.remove('output_selector__option--selected');
        }

        this.currentLink = event.target;
        this.currentLink.classList.add('output_selector__option--selected');
        let outputId = this.currentLink.id;

        if (this.currentOutput) {
            this.currentOutput.stop();
            this.currentOutput = null;
        }

        if (this.outputs[outputId]) {
            this.currentOutput = this.outputs[outputId];
        }


        if (this.currentOutput) {
            this.outputContainer.appendChild(this.currentOutput.element);
            this.currentOutput.start();
        }
    }

    startWizardMode() {
        this.broadcastEvents = true;
    }

    stopWizardMode() {
        this.broadcastEvents = false;
    }

    trigger(id) {
        let index = this.classNames.indexOf(id);
        this.currentOutput.trigger(index);

        if (this.broadcastEvents) {
            let event = new CustomEvent('class-triggered', {detail: {id: id}});
            window.dispatchEvent(event);
        }
    }
}

import TweenMax from 'gsap';
import GLOBALS from './../../config.js';

import Selector from './../components/Selector.js';
import Button from './../components/Button.js';
import CamInput from './../components/CamInput.js';
import HighlightArrow from './../components/HighlightArrow.js';

import SpeechOutput from './../../outputs/SpeechOutput.js';
import GIFOutput from './../../outputs/GIFOutput.js';
import SoundOutput from './../../outputs/SoundOutput.js';

export default OutputSection;