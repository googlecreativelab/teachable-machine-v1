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

/* eslint-disable consistent-return, callback-return, no-case-declarations */
import GLOBALS from './../../config.js';
import TweenLite from 'gsap';

class Wizard {
    constructor() {

        this.steps = [];
        this.steps.push({
            startTime: 0,
            stopTime: 10.4,
            triggers: [
            {
                startTime: 0,
                stopTime: 3.7,
                event: () => {
                    this.setText('This experiment lets you explore how machine learning works.');

                }
            },
            {
                startTime: 4.5,
                stopTime: 10.4,
                event: () => {
                    this.setText('You can teach the machine using your camera, and make it respond in fun ways.');
                }
            }
            ]
        });

        this.steps.push({
            startTime: 10.5,
            stopTime: 16,
            waitForEvent: true,
            triggers: [
            {
                startTime: 10.5,
                stopTime: 16,
                event: () => {
                    /*eslint-disable */
                    if (!GLOBALS.browserUtils.isMobile && !GLOBALS.isCamGranted) {
                        this.setText('First, click allow to turn on your camera.');
                    }else {
                        this.play(2);
                    }
                    /* eslint-enable */
                }
            },
            {
                startTime: 12,
                stopTime: 16,
                event: () => {
                    GLOBALS.camInput.start();
                }
            }
            ]
        });


        this.steps.push({
            startTime: 16.3,
            stopTime: 49,
            waitForEvent: true,
            triggers: [
            {
                startTime: 16.3,
                stopTime: 20.6,
                event: () => {
                    this.setText('Here is your input. You should see yourself.');
                    GLOBALS.inputSection.enable();
                    GLOBALS.inputSection.highlight();

                    GLOBALS.learningSection.dim();
                    GLOBALS.outputSection.dim();
                }

            },
            {
                startTime: 20.7,
                stopTime: 25.6,
                event: () => {
                    this.setText('Here are three classes: green, purple, orange.');
                    GLOBALS.inputSection.dehighlight();
                    GLOBALS.inputSection.dim();
                    GLOBALS.learningSection.undim();
                    GLOBALS.outputSection.dim();
                    if (GLOBALS.browserUtils.isMobile) {
                        TweenLite.to(window, 0, {scrollTo: 385});
                    }
                }

            },
            {
                startTime: 22.7,
                stopTime: 23.4,
                event: () => {
                    GLOBALS.learningSection.highlightClass(0);
                }
            },
            {
                startTime: 23.4,
                stopTime: 24,
                event: () => {
                    GLOBALS.learningSection.dehighlightClass(0);
                    GLOBALS.learningSection.highlightClass(1);
                }
            },
            {
                startTime: 24,
                stopTime: 25.6,
                event: () => {
                    GLOBALS.learningSection.dehighlightClass(0);
                    GLOBALS.learningSection.dehighlightClass(1);
                    GLOBALS.learningSection.highlightClass(2);
                }
            },
            {
                startTime: 25.6,
                stopTime: 25.7,
                event: () => {
                    GLOBALS.learningSection.dehighlightClass(2);
                }
            },
            {
                startTime: 25.7,
                stopTime: 29.7,
                event: () => {
                    this.setText('Here is the output, where the machine responds.');
                    if (GLOBALS.browserUtils.isMobile) {
                        TweenLite.to(window, 0, {scrollTo: 660});
                    }
                    GLOBALS.inputSection.dim();
                    GLOBALS.learningSection.dim();
                    GLOBALS.outputSection.undim();
                    GLOBALS.outputSection.highlight();
                }
            },
            {
                startTime: 29.8,
                stopTime: 36.8,
                event: () => {
                    GLOBALS.outputSection.dehighlight();
                    this.setText('It’s set to respond with one of these GIFs. You can also make it respond with sounds or speech.');
                }
            },
            {
                startTime: 36.8,
                stopTime: 42.2,
                event: () => {
                    GLOBALS.inputSection.undim();
                    GLOBALS.inputSection.enable();
                    GLOBALS.learningSection.undim();
                    GLOBALS.learningSection.enable();
                    GLOBALS.outputSection.undim();
                    this.setText('First, we’re going to teach it to respond with the cat GIF when you do something.');
                }
            },
            {
                startTime: 42.3,
                stopTime: 49,
                event: () => {
                    this.setText('Do something like put up your hand (see example above) and hold this green button for a couple seconds.');
                    if (GLOBALS.browserUtils.isMobile) {
                        TweenLite.to(window, 0, {scrollTo: 175});
                    }
                }
            },
            {
                startTime: 44.8,
                stopTime: 49,
                event: () => {
                    GLOBALS.inputSection.showGif(0);
                }
            },
            {
                startTime: 46.3,
                stopTime: 49,
                event: () => {
                    window.addEventListener('class-trained', this.classTrainedEvent);
                    GLOBALS.learningSection.enableClass(0);
                    GLOBALS.learningSection.highlightClass(0);
                }
            }
            ]
        });


this.steps.push({
    startTime: 49.599999999999994,
    stopTime: 78.8,
    waitForEvent: true,
    triggers: [
    {
        startTime: 49.599999999999994,
        stopTime: 53.8,
        event: () => {
            this.setText('You should now see the green bar and the cat GIF.');
        }
    },
    {
        startTime: 53.9,
        stopTime: 58.599999999999994,
        event: () => {
            this.setText('But if you move around, you’ll see that they’re always showing no matter what.');
        }
    },
    {
        startTime: 55.199999999999996,
        stopTime: 58.599999999999994,
        event: () => {
            GLOBALS.inputSection.showGif(1);
        }
    },
    {
        startTime: 58.8,
        stopTime: 64.6,
        event: () => {
            GLOBALS.inputSection.hideGif(1);
            this.setText('That’s because the machine is looking at your input, and picking which class looks most similar.');
        }
    },
    {
        startTime: 64.8,
        stopTime: 72.2,
        event: () => {
            this.setText('But since you’ve only trained the green class, it always picks that one. That’s why you need to teach it a second class.');
        }
    },
    {
        startTime: 72.39999999999999,
        stopTime: 78.8,
        event: () => {
            this.setText('So sit there with your hand down, and hold this purple button for a couple seconds.');
        }
    },
    {
        startTime: 75.1,
        stopTime: 78.8,
        event: () => {
            GLOBALS.inputSection.showGif(2);
        }
    },
    {
        startTime: 76.3,
        stopTime: 78.8,
        event: () => {
            GLOBALS.learningSection.enableClass(1);
            GLOBALS.learningSection.highlightClass(1);
        }
    }
    ]
});


this.steps.push({
    startTime: 80.8,
    stopTime: 92.8,
    waitForEvent: true,
    triggers: [
    {
        startTime: 83.39999999999999,
        stopTime: 92.8,
        event: () => {
            this.setText('Now, move your hand up and down. You should see the cat GIF when your hand’s up, and dog the GIF when it’s down. Try it.');
            GLOBALS.inputSection.hideGif(2);
        }
    },
    {
        startTime: 84.8,
        stopTime: 92.8,
        event: () => {
            GLOBALS.inputSection.showGif(3);

        }
    },
    {
        startTime: 90.8,
        stopTime: 92.8,
        event: () => {
            window.addEventListener('class-triggered', this.classTriggered.bind(this));
            GLOBALS.outputSection.startWizardMode();

        }
    }
    ]
});


this.steps.push({
    startTime: 93.2,
    stopTime: 120.89999999999999,
    waitForEvent: true,
    triggers: [
    {
        startTime: 93.2,
        stopTime: 95.6,
        event: () => {
            GLOBALS.inputSection.hideGif(3);
            this.setText('Great! Looks like it’s working.');
        }
    },
    {
        startTime: 95.7,
        stopTime: 99.2,
        event: () => {
            this.setText('The orange button works the same way.');
            GLOBALS.learningSection.enableClass(2);
            GLOBALS.learningSection.highlightClass(2);
        }
    },
    {
        startTime: 99.39999999999999,
        stopTime: 104.2,
        event: () => {
            GLOBALS.learningSection.dehighlightClass(2);
            this.setText('The x’s are for resetting your classes to teach them something new.');
        }
    },
    {
        startTime: 99.8,
        stopTime: 104.2,
        event: () => {
            GLOBALS.learningSection.dehighlightClass(2);
            GLOBALS.learningSection.highlightClassX(0);
        }
    },
    {
        startTime: 104.39999999999999,
        stopTime: 108.1,
        event: () => {
            GLOBALS.learningSection.dehighlightClassX(0);
            GLOBALS.outputSection.highlight();
            this.setText('And try the other outputs here.');
            if (GLOBALS.browserUtils.isMobile) {
                TweenLite.to(window, 0, {scrollTo: 660});
            }
        }
    },
    {
        startTime: 108.2,
        stopTime: 112.39999999999999,
        event: () => {
            GLOBALS.outputSection.dehighlight();
            this.setText('Now, start playing around. Teach your machine whatever you want.');
        }
    },
    {
        startTime: 112.6,
        stopTime: 120.7,
        event: () => {
            this.setText('Below, you’ll find some ideas for things to try, and links to learn more.');
        }
    },
    {
        startTime: 120.8,
        stopTime: 120.89999999999999,
        event: () => {
            this.setText('');
            this.skip();
            gtag('event', 'wizard_finish');            
        }
    }
    ]
});

this.steps.push({
    startTime: 131,
    stopTime: 138.8,
    waitForEvent: true,
    triggers: [
    {
        startTime: 131,
        stopTime: 138.8,
        event: () => {
            this.setText('Your machine will work best with at least 30 examples per class. Try recording some more.');
        }
    }
    ]
});

this.steps.push({
    startTime: 125.5,
    stopTime: 130.8,
    waitForEvent: true,
    triggers: [
    {
        startTime: 125.5,
        stopTime: 130.8,
        event: () => {
            this.activateWebcamButton.style.display = 'block';
            this.setText('Seems like the camera isn’t working. It might be your browser or camera settings.');
        }
    }
    ]
});

this.wizardRunning = false;
this.currentIndex = 0;

this.timer = document.querySelector('.wizard__timer');
this.timerFill = this.timer.querySelector('.wizard__timer-fill');
this.percentage = 0;
this.duration = 0;
this.baseTime = 0;
this.currentTime = 0;

this.stopTime = 0;
this.audio = new Audio();
this.loadedEvent = this.loaded.bind(this);
this.audio.addEventListener('canplaythrough', this.loadedEvent);
this.audio.src = 'assets/wizard/voice-over.mp3';

this.wizardWrapper = document.querySelector('.wizard__wrapper');
this.bar = document.querySelector('#wizard');
this.machine = document.querySelector('.machine');
this.textContainer = this.bar.querySelector('.wizard__text-inner');
this.soundButton = this.bar.querySelector('.wizard__sound-button');
this.soundIcon = this.soundButton.querySelector('.wizard__sound-icon');
this.skipButton = this.bar.querySelector('.wizard__skip-button');

this.skipButton.addEventListener('click', this.skip.bind(this));
this.soundButton.addEventListener('click', this.toggleSound.bind(this));

this.classTrainedEvent = this.classTrained.bind(this);

this.numTriggered = 0;
this.lastClassTriggered = null;

this.activateWebcamButton = document.getElementById('input__media__activate');
this.activateWebcamButton.style.display = 'none';
if (this.activateWebcamButton) {
  this.activateWebcamButton.addEventListener('click', () => {
    location.reload();
});
}


this.resizeEvent = this.size.bind(this);
this.scrollEvent = this.scroll.bind(this);
window.addEventListener('resize', this.resizeEvent);
window.addEventListener('scroll', this.scrollEvent);


this.resizeEvent();
this.scrollEvent();
}

stickBar() {
    this.bar.classList.add('wizard--fixed');
    this.stickyBar = true;
}

unstickBar() {
    this.bar.classList.remove('wizard--fixed');
    this.stickyBar = false;
}

size() {
    this.wizardWrapper.style.height = this.bar.offsetHeight + 'px';

    if (this.machine.offsetHeight + this.bar.offsetHeight - window.pageYOffset > window.innerHeight) {
        this.stickBar();
    }else if (this.stickyBar) {
        this.unstickBar();
    }
}

scroll() {
    if (this.machine.offsetHeight + this.bar.offsetHeight - window.pageYOffset <= window.innerHeight) {
        this.unstickBar();
    }else {
        this.stickBar();
    }
}


classTriggered(event) {
    let id = event.detail.id;

    if (id !== this.lastClassTriggered) {
        this.lastClassTriggered = id;
        this.numTriggered += 1;
    }

    if (this.numTriggered > 4 && !this.triggerTimer) {
        GLOBALS.outputSection.stopWizardMode();
        this.triggerTimer = setTimeout(() => {
            this.play(5);
        }, 1500);
    }
}

classTrained(event) {
    let id = event.detail.id;
    let numSamples = event.detail.numSamples;

    if (numSamples < 30) {
        this.play(6);
    }

    if (id === 'green' && numSamples >= 30) {
        GLOBALS.learningSection.dehighlightClass(0);
        GLOBALS.inputSection.hideGif(0);
        this.play(3);
    }

    if (id === 'purple' && numSamples >= 30) {
        GLOBALS.learningSection.dehighlightClass(1);
        GLOBALS.inputSection.hideGif(1);
        this.play(4);
        window.removeEventListener('class-trained', this.classTrainedEvent);
    }
}

toggleSound(event) {
    event.preventDefault();
    if (this.muted) {
        this.unmute();
    }else {
        this.mute();
    }
}

ended() {
    this.playing = false;
    this.stopAudioTimer();


    switch (this.currentIndex) {
        case 0:
        let that = this;

        if (localStorage.getItem('webcam_status') === null) {
            this.play(1);
            this.webcamEvent = this.webcamStatus.bind(this);
            window.addEventListener('webcam-status', this.webcamEvent);
        }else if (localStorage.getItem('webcam_status') === 'granted') {
            GLOBALS.camInput.start();
            this.play(2);
        }else if (localStorage.getItem('webcam_status') === 'denied') {
            this.play(7);

        }
        break;

        default:
        break;
    }
}


timeUpdate() {
    if (this.audio.currentTime > (this.currentStep.stopTime) && this.playing === true) {
        this.audio.pause();
        this.ended();
    }

    if (this.currentStep) {
        if (this.currentStep.waitForEvent) {
            this.waitingForEvent = true;
        }

        this.currentStep.triggers.forEach((step) => {
            if (this.audio.currentTime >= step.startTime && this.audio.currentTime <= step.stopTime && step.playing !== true) {
                step.playing = true;
                if (step.event) {
                    this.currentTrigger = step;
                    step.event();
                }
            }
        });
    }


    let percentage = (this.audio.currentTime - this.baseTime) / this.duration;
    if (percentage > 1) {
        percentage = 0;
        this.timer.style.opacity = 0;
    }else {
        this.timer.style.opacity = 1;
        this.timerFill.style.width = 80 * percentage + 'px';
    }

    this.audioTimer = requestAnimationFrame(this.timeUpdate.bind(this));

}

play(index) {
    this.currentIndex = index;
    this.currentStep = this.steps[index];
    this.audio.currentTime = this.currentStep.startTime;
    this.playing = true;
    this.audio.play();
}

touchPlay() {
    this.audio.play();
    this.audio.pause();
}

loaded() {
    this.audio.removeEventListener('canplaythrough', this.loadedEvent);
}

startAudioTimer() {
    this.stopAudioTimer();
    this.audioTimer = requestAnimationFrame(this.timeUpdate.bind(this));
}

stopAudioTimer() {
    if (this.audioTimer) {
        cancelAnimationFrame(this.audioTimer);
    }
}

mute() {
    this.audio.muted = true;
    this.muted = true;
    this.soundIcon.classList.remove('wizard__sound-icon--on');
}

unmute() {
    this.audio.muted = false;
    this.muted = false;
    this.soundIcon.classList.add('wizard__sound-icon--on');
}

setText(message, isTip) {
    let text = message;
    this.textContainer.textContent = message;

    if (message.length > 0) {
        this.timerFill.style.width = 0 + 'px';
        if (this.currentTrigger) {
            this.baseTime = this.currentTrigger.startTime;
            this.duration = this.currentTrigger.stopTime - this.baseTime;
        }
    }
}


clear() {
    this.textContainer.textContent = '';
}

webcamStatus(event) {
    let that = this;
    if (event.detail.granted === true) {
        localStorage.setItem('webcam_status', 'granted');
        this.play(2);
        window.removeEventListener('webcam-status', this.webcamEvent);
    }else {
        localStorage.setItem('webcam_status', 'denied');
        this.play(7);
    }
}

start() {
    let that = this;
    this.wizardRunning = true;
    this.soundButton.style.display = 'block';
    this.play(0);
    this.startAudioTimer();
    GLOBALS.launchScreen.destroy();
    gtag('event', 'wizard_start');        
}

startCamera() {
    GLOBALS.camInput.start();
}

skip(event) {
    if (event) {
        event.preventDefault();
        gtag('event', 'wizard_skip_mid');        
    }

    if (this.wizardRunning) {
        TweenLite.to(this.wizardWrapper, 0.3, {
            height: 0,
            onComplete: () => {
                this.wizardWrapper.style.display = 'none';
            }
        });
    }else {
        this.wizardWrapper.style.display = 'none';
    }

    this.stopAudioTimer();
    this.audio.pause();
    this.clear();
    this.skipButton.style.display = 'none';
    this.soundButton.style.display = 'none';
    window.removeEventListener('class-trained', this.classTrainedEvent);
    setTimeout(() => {
        GLOBALS.camInput.start();
    }, 500);
    GLOBALS.inputSection.enable();
    GLOBALS.learningSection.enable();
    GLOBALS.learningSection.enableClass(0);
    GLOBALS.learningSection.enableClass(1);
    GLOBALS.learningSection.enableClass(2);
    GLOBALS.learningSection.dehighlight();
    GLOBALS.learningSection.dehighlightClass(0);
    GLOBALS.learningSection.dehighlightClass(1);
    GLOBALS.learningSection.dehighlightClass(2);
    GLOBALS.inputSection.hideGif(0);
    GLOBALS.inputSection.hideGif(1);
    GLOBALS.inputSection.hideGif(2);
    GLOBALS.inputSection.hideGif(3);
    GLOBALS.outputSection.enable();

    window.removeEventListener('resize', this.resizeEvent);
    window.removeEventListener('scroll', this.scrollEvent);
}

}

export default Wizard;
/* eslint-enable consistent-return, callback-return, no-case-declarations */