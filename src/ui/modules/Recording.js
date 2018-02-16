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

class Recording {

    constructor(element) {
        this.element = element;
        this.canvas = element.querySelector('#recording__canvas');
        this.startButtonText = element.querySelector('#recording__start-text');
        this.downloadPreText = element.querySelector('#pre-download-message');
        this.downloadLinkSection = element.querySelector('.recording-download-container');
        this.downloadLinkButton = element.querySelector('#recording__download');
        this.recordingVideo = element.querySelector('#recording__video');
        this.recordTimer = element.querySelector('#record__timer');
        this.closeButton = element.querySelector('#close__button');
        this.recordTimer = element.querySelector('#record__timer');
        this.restart = element.querySelector('#restart');
        this.recordMessage = element.querySelector('#message');
        this.recordMessageAlt = element.querySelector('#message-alt');
        this.downloadLinkSection.style.display = 'none';
        this.sharingNotice = element.querySelector('#sharing-notice');

        this.sendSuccess = false;

        this.legal = document.querySelector('#recording__legal');
        this.checkbox = document.querySelector('#recording__checkbox');

        this.recordMessageAlt.style.display = 'none';
        this.recordingVideo.style.display = 'none';
        this.canvas.width = 680;
        this.canvas.height = 340;
        this.video = document.getElementsByTagName('video')[0];
        this.confidence1 = 0;
        this.confidence2 = 0;
        this.confidence3 = 0;
        this.recordedTime = 10;
        this.count = 3;
        this.showing = false;
        this.closeButton.addEventListener('click', this.hide.bind(this));
        this.restart.addEventListener('click', this.reset.bind(this));
        this.recordingState = 'waiting';
        this.RECORD_TIME = 10000;

        this.startButton = new Button(document.querySelector('#recording__start-button'));
        this.shareButton = new Button(document.querySelector('#recording__share-button'));
        this.startRecordEvent = this.onRecordButtonClick.bind(this);
        this.shareButton.element.addEventListener('click', this.onShareButtonClick.bind(this));
        this.shareButton.element.style.display = 'none';
        this.checkbox.addEventListener('click', this.toggleCheckbox.bind(this));
    }

    toggleCheckbox() {
        if (this.checkbox.checked) {
            this.startButton.element.addEventListener('click', this.startRecordEvent);
            this.startButton.element.classList.remove('recording-start__button--disabled');
        }else {
            this.startButton.element.removeEventListener('click', this.startRecordEvent);
            this.startButton.element.classList.add('recording-start__button--disabled');
        }
    }

    setCanvas(element) {
        this.show();
        if (element.name === 'gif') {
            this.canvasType = 'gif';
        }else {
            this.canvasType = '';
        }
        document.querySelector('#recording__start-button .button__label #icon--record').style.display = 'inline-block';
        document.querySelector('#recording__start-button .button__label #icon--stop').style.display = 'none';
        this.sourceCanvas = element;
        this.context = this.canvas.getContext('2d');
        this.showing = true;
        this.render();

        let img = new Image();
        let stamp = new Image();
        img.onload = () => {
            this.wiresImage = img;
        };
        stamp.onload = () => {
            this.stampImage = stamp;
        };
        img.src = 'assets/wires-recorder.png';
        stamp.src = 'assets/madeby.svg';
    }

    render() {
        if (!this.showing) {
            return;
        }
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = '#e4e5e6';
        this.context.fillRect(0, 0, 680, 340);

        // call its drawImage() function passing it the source canvas directly
        let maxHeight = 200;
        let videoWidth = 266;
        const padding = 20;
        const startX = 26;
        const startY = 16;

        // White boxes
        this.context.fillStyle = '#fff';
        this.context.fillRect(startX, startY, videoWidth + padding, maxHeight + 70);
        this.context.fillRect(340 + startX, startY, videoWidth + padding, maxHeight + 70);

        // The "Output" Canvas
        if (this.canvasType === 'gif') {
            let videoWidth = 260;
            this.context.drawImage(this.sourceCanvas, startX + 343 + padding / 2, 45, videoWidth, videoWidth - 50);
        }else {
            this.context.drawImage(this.sourceCanvas, startX + 355 + padding / 2, 40, videoWidth, videoWidth - 50);
        }
        if (this.wiresImage) {
            this.context.drawImage(this.wiresImage, startX + 276 + padding / 2, 45, 54, videoWidth - 50);
        }
        if (this.stampImage) {
            this.context.drawImage(this.stampImage, this.canvas.width / 2 - (videoWidth * 1.2 / 2), 302, videoWidth * 1.2, 20);
        }
        // Bars to cover it:
        // this.context.fillStyle = '#e4e5e6';
        // this.context.fillRect(startX + 340, 0, videoWidth + padding, startY);
        // this.context.fillStyle = '#fff';
        // this.context.fillRect(startX + 340, startY, videoWidth + padding, padding / 2);
        // this.context.fillRect(startX + 340, maxHeight + startY + padding / 2, videoWidth + padding, 30);

        let barsY = maxHeight + startY + padding;
        let boxSize = (videoWidth - padding) / 3;
        let boxStartX = startX + padding / 2;

        this.context.fillStyle = '#e4e5e6';
        this.context.fillRect(boxStartX, barsY, boxSize, 40);
        this.context.fillStyle = '#2baa5e';
        this.context.fillRect(boxStartX, barsY, boxSize * this.confidence1, 40);

        this.context.fillStyle = '#e4e5e6';
        this.context.fillRect(boxStartX + boxSize + padding / 2, barsY, boxSize, 40);
        this.context.fillStyle = '#c95ac5';
        this.context.fillRect(boxStartX + boxSize + padding / 2, barsY, boxSize * this.confidence2, 40);

        this.context.fillStyle = '#e4e5e6';
        this.context.fillRect(boxStartX + boxSize + boxSize + padding, barsY, boxSize, 40);
        this.context.fillStyle = '#dd4d31';
        this.context.fillRect(boxStartX + boxSize + boxSize + padding, barsY, boxSize * this.confidence3, 40);

        // Video comes in mirrored, so let's flip it:
        this.context.save();
        this.context.scale(-1, 1);
        this.context.drawImage(
            this.video,
            -(startX + padding / 2),
            startY + padding / 2,
            maxHeight * (360 / 270) * -1,
            maxHeight
            );
        this.context.restore();
        //
        // this.context.font = '18px Poppins';
        // this.context.fillStyle = '#000';
        // this.context.fillText('MADE AT: ', startX, 320);
        // this.context.fillStyle = '#3e80f6';
        // this.context.fillText('G.CO/TEACHABLEMACHINE', 110, 320);

        requestAnimationFrame(this.render.bind(this));
    }

    setMeters(colorId, confidence) {
        if (!this.showing) {
            return;
        }
        let confidencePercentage = confidence / 100;
        switch (colorId) {
            case 'green':
            this.confidence1 = confidencePercentage;
            break;
            case 'purple':
            this.confidence2 = confidencePercentage;
            break;
            case 'orange':
            this.confidence3 = confidencePercentage;
            break;
            default:
            break;
        }
    }

    stopRecording() {
        // this.recordingState = 'Facebook';
        if (this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }

    onRecordButtonClick() {
        switch (this.recordingState) {
            case 'waiting':
            this.countdown();
            break;
            case 'countdown':
            this.stopCountdown();
            break;
            case 'recording':
            if (this.mediaRecorder) {
                if (this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.stop();
                }
                this.recordingState = 'waiting';
                this.recordTimer.style.display = 'none';
                this.startButton.element.classList.remove('animate');
            }
            break;
            case 'shareSuccess':
            this.shareOnFb();
            break;
            case 'successMessage':
            this.shareButton.element.style.display = 'none';
            this.recordingState = 'waiting';
            break;
            default:
            break;
        }
    }

    onShareButtonClick() {
        this.shareButton.element.style.display = 'none';
        this.recordingState = 'waiting';
        this.shareOnFb();
        this.downloadLinkSection.style.marginLeft = 0;
    }


    reset() {
        this.recordingState = 'waiting';
        this.recordTimer.style.display = 'block';
        this.startButton.element.style.top = 0;
        this.downloadLinkSection.style.marginLeft = '15px';
        this.recordMessage.style.display = 'block';
        this.recordMessageAlt.style.display = 'none';
        this.startButton.element.style.display = 'inline-block';
        this.legal.style.display = 'block';
        this.shareButton.element.style.display = 'none';
        this.downloadLinkSection.style.display = 'none';
        document.querySelector('#recording__start-button .button__label #icon--stop').style.display = 'none';
        document.querySelector('#recording__start-button .button__label #icon--record').style.display = 'inline-block';
        document.querySelector('#recording__start-button .button__label #recording__start-text').innerText = 'Start Recording';
        this.canvas.style.display = 'block';
        this.sharingNotice.style.display = 'none';
        this.recordingVideo.style.display = 'none';
        this.stopRecordingTime();
        this.stopCountdown();
        this.downloadPreText.innerText = 'or, ';
    }

    countdown() {
        this.recordingState = 'countdown';
        this.canvas.style.display = 'block';
        this.recordingVideo.style.display = 'none';
        this.downloadLinkSection.style.display = 'none';
        document.querySelector('#recording__start-button .button__label #icon--record').style.display = 'none';
        document.querySelector('#recording__start-button .button__label #recording__start-text').innerText = this.count;
        this.countdownTimeout = setTimeout(() => {
            this.count = this.count - 1;
            if (this.count > 0) {
                document.querySelector('#recording__start-button .button__label #recording__start-text').innerText = this.count;
                this.countdown();
            }else {
                this.startRecording();
                this.recordingTime();
                this.count = 3;
            }
        }, 1000);
    }

    recordingTime() {
        this.recordingTimeTimeout = setTimeout(() => {
         this.recordedTime = this.recordedTime - 1;
         if (this.recordedTime > 0) {
             this.recordTimer.innerText = '0:0' + this.recordedTime;
             this.recordingTime();
         }else {
             this.recordTimer.innerText = '0:00';
             this.recordedTime = 10;
         }
     }, 1000);
    }

    stopRecordingTime() {
        this.recordingState = 'waiting';
        if (this.recordingTimeTimeout) {
            clearTimeout(this.recordingTimeTimeout);
        }
        this.recordedTime = 10;
        this.recordTimer.innerText = '0:10';
    }

    stopCountdown() {
        this.recordingState = 'waiting';
        clearTimeout(this.countdownTimeout);
        this.count = 3;
        this.startButton.element.classList.remove('animate');
        document.querySelector('#recording__start-button .button__label #recording__start-text').innerText = 'Start Recording';
    }

    startRecording() {
        this.recordingState = 'recording';
        document.querySelector('#recording__start-button .button__label #icon--stop').style.display = 'inline-block';
        document.querySelector('#recording__start-button .button__label #recording__start-text').innerText = 'Stop Recording';
        let recordedChunks = [];
        this.startButton.element.classList.add('animate');
        let finalStream = new MediaStream();
        let canvasStream = this.canvas.captureStream().getVideoTracks()[0];
        finalStream.addTrack(canvasStream);
        finalStream.addTrack(GLOBALS.stream.getAudioTracks()[0]);

        this.mediaRecorder = new MediaRecorder(finalStream);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        this.mediaRecorder.start();
        this.mediaRecorder.onstop = () => {
            this.blob = new Blob(recordedChunks, {type: 'video/webm'});
            let url = URL.createObjectURL(this.blob);
            this.canvas.style.display = 'none';
            this.recordingVideo.style.display = 'block';
            this.recordMessage.style.display = 'none';
            this.recordMessageAlt.style.display = 'block';
            this.recordTimer.style.display = 'none';
            this.startButton.element.style.top = '50px';
            document.querySelector('#recording__start-button .button__label #icon--stop').style.display = 'none';
            document.querySelector('#recording__start-button .button__label #recording__start-text').innerText = '';
            this.downloadLinkSection.style.display = 'inline-block';
            this.downloadLinkButton.href = url;
            this.downloadLinkButton.download = 'teachable-machine.webm';
            this.startButton.element.style.display = 'none';
            this.legal.style.display = 'none';
            this.shareButton.element.style.display = 'inline-block';
            this.shareButton.element.style.top = '50px';
            this.recordingVideo.setAttribute('src', url);
            // this.sharingNotice.style.display = 'block';
        };
        setTimeout(() => {
            this.startButton.element.classList.remove('animate');
            this.stopRecording();
        },
        this.RECORD_TIME
        );
        gtag('event', 'recording_start');
    }

    show() {
        this.recordingState = 'waiting';
        this.showing = true;
        this.element.style.opacity = 1;
        this.element.style.pointerEvents = 'initial';
        setTimeout(() => {
            this.element.classList.add('fadein');
        }, 1);
    }

    hide() {
        this.element.classList.remove('fadein');
        setTimeout(() => {
            this.element.style.opacity = 0;
            this.element.style.pointerEvents = 'none';
            GLOBALS.isRecording = false;
            if (this.video) {
                this.recordingVideo.setAttribute('src', '');
            }
            this.reset();
        },
        300
        );
        clearTimeout(this.recordingTimeTimeout);
        clearTimeout(this.countdownTimeout);

        this.showing = false;
    }

    shareOnFb() {
        this.downloadPreText.innerText = 'Posting... ';
        window.fbWindowCallback = (data) => {
            let formData = new FormData();
            formData.append('code', data);
            let fileOfBlob = new File([this.blob], 'share.webm');

            formData.append('video', fileOfBlob);

            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/share-video');
            xhr.onload = () => {
                if (xhr.status === 200) {
                    this.downloadPreText.innerText = 'Posted to Facebook. ';
                    // console.log('Something went wrong.  Name is now ' + xhr.responseText);
                }else if (xhr.status !== 200) {
                    this.downloadPreText.innerText = 'Sorry, something went wrong. ';
                    // console.log('Request failed.  Returned status of ' + xhr.status);
                }
            };
            xhr.send(formData);
        };
        let popup = window.open('/fb', 'Share on Facebook', 'width=600, height=600');
        popup.focus();
        gtag('event', 'recording_share');
    }
}

import Button from './../components/Button.js';
import GLOBALS from './../../config.js';

export default Recording;