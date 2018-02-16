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

class LaunchScreen {
    constructor() {
        this.element = document.querySelector('.intro');

        this.startButton = new Button(document.querySelector('#start-tutorial-button'));
        this.skipButton = document.querySelector('#skip-tutorial-button');
        this.skipButtonMobile = document.querySelector('#skip-tutorial-button-mobile');

        this.messageIsCompatible = document.querySelector('#is-compatible');
        this.messageIsNotCompatible = document.querySelector('#is-not-compatible');

        this.startButton.element.classList.add('button--disabled');
        document.querySelector('.wizard__launch-skip-paragraph').style.display = 'none';
        document.querySelector('.wizard__browser-warning').style.display = 'block';

        let facebookButton = document.querySelector('.intro__share-link--facebook');
        let twitterButton = document.querySelector('.intro__share-link--twitter');

        let intro = document.querySelector('.intro__content-mobile');
        /*eslint-disable */
        let defaultPrevent = (event) => {
            event.preventDefault();
        };
        /* eslint-enable*/
        intro.addEventListener('touchstart', defaultPrevent);
        intro.addEventListener('touchmove', defaultPrevent);


        let loader = ((el) => {
            let ajax = new XMLHttpRequest();
            ajax.open('GET', 'assets/social-facebook.svg', true);
            ajax.onload = (event) => {
                el.innerHTML = ajax.responseText;
            };
            ajax.send();
        })(facebookButton);

        loader = ((el) => {
            let ajax = new XMLHttpRequest();
            ajax.open('GET', 'assets/social-twitter.svg', true);
            ajax.onload = (event) => {
                el.innerHTML = ajax.responseText;
            };
            ajax.send();
        })(twitterButton);

        facebookButton.addEventListener('click', this.openFacebookPopup.bind(this));
        twitterButton.addEventListener('click', this.openTwitterPopup.bind(this));
        
        if (GLOBALS.browserUtils.isCompatible === true && GLOBALS.browserUtils.isMobile === false) {
            this.startButton.element.classList.remove('button--disabled');
            document.querySelector('.wizard__launch-skip-paragraph').style.display = 'block';
            document.querySelector('.wizard__browser-warning').style.display = 'none';
        }

        if (GLOBALS.browserUtils.isMobile) {
            this.messageIsCompatible.style.display = 'block';

        }else {
            this.messageIsCompatible.style.display = 'none';
        }

        if (GLOBALS.browserUtils.isMobile && !GLOBALS.browserUtils.isCompatible) {
            this.messageIsCompatible.style.display = 'none';
            this.messageIsNotCompatible.style.display = 'block';
        }

        this.skipButton.addEventListener('click', this.skipClick.bind(this));
        this.skipButtonMobile.addEventListener('touchend', this.skipClick.bind(this));
        this.skipButtonMobile.addEventListener('click', this.skipClick.bind(this));
        this.startButton.element.addEventListener('click', this.startClick.bind(this));
        this.startButton.element.addEventListener('touchend', this.startClick.bind(this));
    }

    openFacebookPopup(event) {
        event.preventDefault();
        let url = event.currentTarget.getAttribute('href');
        /* eslint-disable space-infix-ops */
        window.open(url, 'fbShareWindow', 'height=450, width=550, top='+(window.innerHeight/2-275)+', left='+(window.innerWidth/2-225)+',toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        /* eslint-enable space-infix-ops */
    }

    openTwitterPopup(event) {
        event.preventDefault();
        let url = event.currentTarget.getAttribute('href');
        /* eslint-disable space-infix-ops */
        window.open(url, 'fbShareWindow', 'height=450, width=600, top='+(window.innerHeight/2-150)+', left='+(window.innerWidth/2-225)+', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        /* eslint-enable space-infix-ops */
    }

    skipClick(event) {
        event.preventDefault();
        let intro = document.querySelector('.intro');
        let offset = intro.offsetHeight;
        GLOBALS.wizard.skip();
        gtag('event', 'wizard_skip');        

        if (GLOBALS.browserUtils.isMobile) {
            let msg = new SpeechSynthesisUtterance();
            msg.text = ' ';
            window.speechSynthesis.speak(msg);

            GLOBALS.inputSection.createCamInput();
            GLOBALS.camInput.start();
            let event = new CustomEvent('mobileLaunch');
            window.dispatchEvent(event);
        }
        TweenMax.to(intro, 0.5, {
            y: -offset,
            onComplete: () => {
                this.destroy();
                if (!GLOBALS.browserUtils.isMobile) {
                    GLOBALS.wizard.startCamera();
                }
            }
        });
    }

    destroy() {
        document.body.classList.remove('no-scroll');
        this.element.style.display = 'none';        

    }

    startClick() {
        let intro = document.querySelector('.intro');
        let offset = intro.offsetHeight;
        if (GLOBALS.browserUtils.isMobile || GLOBALS.browserUtils.isSafari) {
            GLOBALS.inputSection.createCamInput();
            GLOBALS.camInput.start();
            GLOBALS.wizard.touchPlay();
            let event = new CustomEvent('mobileLaunch');
            window.dispatchEvent(event);
        }

        TweenMax.to(intro, 0.5, {
            y: -offset,
            onComplete: () => {
                this.destroy();
                GLOBALS.wizard.start();             
            }
        });
    }
}

import TweenMax from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import GLOBALS from './../../../config.js';
import Button from './../../components/Button.js';

export default LaunchScreen;