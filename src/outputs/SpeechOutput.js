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

class SpeechOutput {
    constructor() {
        this.id = 'SpeechOutput';

        this.canTrigger = true;
        this.currentSound = null;
        this.currentIcon = null;
        this.currentIndex = null;
        this.textToSpeech = new TextToSpeech();
        this.element = document.createElement('div');
        this.element.classList.add('output__container');
        this.element.classList.add('output__container--speech');

        this.defaultMessages = [
        'Hello',
        'Awesome',
        'Yes'
        ];

        this.classNames = GLOBALS.classNames;
        this.colors = GLOBALS.colors;
        this.numClasses = GLOBALS.numClasses;

        this.offScreen = document.createElement('div');
        this.offScreen.classList.add('output__speech');

        let options = {};

        this.inputClasses = [];
        for (let index = 0; index < this.numClasses; index += 1) {
            let id = this.classNames[index];
            let inputClass = document.createElement('div');

            let message = this.defaultMessages[index];
            inputClass.defaultMessage = message;
            inputClass.message = message;
            inputClass.classList.add('output__speech-class');
            inputClass.classList.add(`output__speech-class--${id}`);

            let speakerIcon = document.createElement('div');
            speakerIcon.classList.add('output__speech-speaker');
            speakerIcon.classList.add(`output__speech-speaker--${id}`);

            let loader = ((el) => {
                let ajax = new XMLHttpRequest();
                ajax.open('GET', 'assets/outputs/speaker-icon.svg', true);
                ajax.onload = (event) => {
                    el.innerHTML = ajax.responseText;
                };
                ajax.send();
            })(speakerIcon);

            let editIcon = document.createElement('div');
            editIcon.classList.add('output__speech-edit');
            editIcon.classList.add(`output__speech-edit--${id}`);

            let input = document.createElement('input');
            input.classId = id;
            input.classList.add('output__speech-input');
            input.classList.add(`output__speech-input--${id}`);
            input.setAttribute('maxlength', 25);
            input.value = this.defaultMessages[index];
            inputClass.appendChild(speakerIcon);
            inputClass.appendChild(editIcon);
            inputClass.appendChild(input);

            var deleteIcon = document.createElement('div');
            deleteIcon.classList.add('output__speech-delete');
            inputClass.appendChild(deleteIcon);

            inputClass.input = input;
            inputClass.icon = speakerIcon;

            deleteIcon.addEventListener('click', this.clearInput.bind(this));
            input.addEventListener('blur', this.inputBlur.bind(this));
            input.addEventListener('keyup', this.keyUp.bind(this));
            input.addEventListener('click', this.editInput.bind(this));
            // speakerIcon.addEventListener('click', this.playSound.bind(this));
            this.inputClasses[index] = inputClass;
            this.element.appendChild(inputClass);
        }
        this.buildCanvas();
    }

    clearInput(event) {
        event.target.parentNode.message = null;
        event.target.parentNode.input.value = 'Nothing';
        event.target.parentNode.input.classList.add('output__speech-input--nothing');
    }

    keyUp(event) {
        let message = event.target.value;
        event.target.parentNode.message = message;
        event.target.classList.remove('output__speech-input--nothing');
    }

    inputBlur(event) {
        let message = event.target.value;
        event.target.classList.remove('output__speech-input--nothing');
        message = event.target.value;
        event.target.parentNode.message = message;
    }

    editInput(event) {
        event.target.parentNode.input.value = '';
        this.activeInput = event.target;
        let classId = this.activeInput.classId;
    }

    filterResults() {
        let phrase = this.searchInput.value;
        if (phrase.length === 0) {
            phrase = 'Hello';
        }
        this.ttsItem.children[1].value = `"${phrase}"`;
        this.ttsItem.value = `"${phrase}"`;
    }

    soundEnded(event) {
        if (this.activeSpeaker) {
            this.activeSpeaker.classList.remove('output__speech-speaker--active');
        }
        this.canTrigger = true;
        if (this.currentSound === event.target) {
            this.currentSound.pause();
            this.currentSound = null;
            if (this.currentIcon) {
                this.currentIcon.classList.remove('output__speech-speaker--active');
                this.currentIcon = null;
            }
        }
    }

    ttsEnded() {
        if (this.activeSpeaker) {
            this.activeSpeaker.classList.remove('output__speech-speaker--active');
        }
        this.canTrigger = true;
        this.currentTTS = null;
        this.currentIcon.classList.remove('output__speech-speaker--active');
    }

    playSound(event) {
        let icon = event.target;
        let sound = icon.parentNode.message;

        if (this.currentIcon) {
            this.currentIcon.classList.remove('output__speech-speaker--active');
        }

        if (this.currentTTS) {
            this.textToSpeech.stop();
        }

        icon.classList.add('output__speech-speaker--active');
        this.textToSpeech.say(sound, this.ttsEnded.bind(this));
        this.currentTTS = true;
        this.currentIcon = icon;
    }

    trigger(index) {
        if (!GLOBALS.clearing) {
            if (this.currentIndex !== index) {
                this.canTrigger = false;
                this.currentIndex = index;

                if (this.currentIcon) {
                    this.currentIcon.classList.remove('output__speech-speaker--active');
                }

                if (this.currentBorder && this.currentClassName) {
                    this.currentBorder.classList.remove(`output__speech-input--${this.currentClassName}-selected`);
                }

                let border = this.inputClasses[index].input;
                let id = this.classNames[index];

                this.currentClassName = id;
                this.currentBorder = border;
                this.currentBorder.classList.add(`output__speech-input--${this.currentClassName}-selected`);

                if (this.currentTTS) {
                    this.textToSpeech.stop();
                }

                let icon = this.inputClasses[index].icon;
                let sound = this.inputClasses[index].message;
                if (sound) {
                    this.currentIcon = icon;
                    this.currentIcon.classList.add('output__speech-speaker--active');
                    this.textToSpeech.say(sound, this.ttsEnded.bind(this));
                    this.currentTTS = true;
                }else {
                    this.canTrigger = true;
                }
                if (this.canvas) {
                    sound === null ? sound = '(nothing)' : sound;
                    this.updateCanvas(this.currentIndex, sound);
                }
            }
        }
        if (GLOBALS.clearing) {
            if (this.currentBorder && this.currentClassName) {
                this.currentBorder.classList.remove(`output__speech-input--${this.currentClassName}-selected`);
            }
            if (this.currentIcon) {
                this.currentIcon.classList.remove('output__speech-speaker--active');
            }
            if (this.currentTTS) {
                this.textToSpeech.stop();
            }
        }
    }

    stop() {
        if (this.currentTTS) {
            this.textToSpeech.stop();
        }
        this.element.style.display = 'none';
    }

    start() {
        this.element.style.display = 'block';
    }

    buildCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'none';
        this.context = this.canvas.getContext('2d');
        this.canvas.width = 340;
        this.canvas.height = 260;
        this.element.appendChild(this.canvas);

        let img = new Image();
        img.onload = () => {
            this.canvasImage = img;
        };
        img.src = 'assets/outputs/speaker-icon.svg';
    }


    updateCanvas(colorId, sound) {
        if (sound === 'null') {
            this.sound = ' ';
        }
        let color = '#2baa5e';
        switch (colorId) {
            case 0:
                color = '#2baa5e';
                break;
            case 1:
                color = '#c95ac5';
                break;
            default:
            case 2:
                color = '#dd4d31';
                break;
        }
        if (this.canvasImage) {
            this.context.globalCompositeOperation = 'source-over';
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = 'rgb(255, 255, 255)';
            this.context.fillRect(0, 0, 300, 300);
            this.context.drawImage(this.canvasImage, 105, 52, 95, 95);
            this.context.font = '25px Poppins';
            this.context.fillStyle = '#000';
            this.context.fillText(sound, this.canvas.width / 2 - 21, 207);
            this.context.textAlign = 'center';
            this.context.globalCompositeOperation = 'screen';
            this.context.fillStyle = color;
            this.context.fillRect(0, 0, 300, 300);
        }
    }

}
import TextToSpeech from './speech/TextToSpeech.js';
import GLOBALS from './../config.js';

export default SpeechOutput;