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

class IntroSection {
    constructor(element) {
        this.videoPlayButton = element.querySelector('#video-play-link');
        this.videoPlayButton.addEventListener('click', this.openVideoPlayer.bind(this));
        this.closeVideoLink = element.querySelector('#video-close-link');
        this.closeVideoLink.addEventListener('click', this.closeVideoPlayer.bind(this));
        this.videoContainer = element.querySelector('.intro__video');
        TweenMax.set(this.videoContainer, {
            transformOrigin: 'top center',
            opacity: 0
        });

        this.player = null;
        this.open = false;

    }

    startVideo() {
        this.player.playVideo();
    }

    openVideoPlayer() {
        if (this.open) {
            return;
        }

        if (GLOBALS.YOUTUBE_API_READY) {
            if (this.player) {
                this.player.seekTo(0);
            }else {
                this.player = new window.YT.Player('intro-video-player', {
                    height: '100%',
                    width: '100%',
                    videoId: 'a1Y73sPHKxw',
                    playerVars: {
                        autoplay: 0,
                        fs: 1,
                        loop: 0,
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0
                    }
                });
            }
        }



        const videoRatio = 1.7777777778;
        this.open = true;
        this.videoContainer.style.height = 'auto';
        let width = this.videoContainer.offsetWidth;
        let height = width / videoRatio;
        this.videoContainer.style.height = 0 + 'px';
        let that = this;

        TweenMax.to(this.videoPlayButton, 0.5, {
            opacity: 0,
            ease: TweenMax.Expo.easeOut
        });

        TweenMax.to(this.videoContainer, 1, {
            opacity: 1,
            height: height,
            transformOrigin: 'top center',
            ease: TweenMax.Expo.easeOut,
            onComplete: that.startVideo.bind(that)
        });
    }

    closeVideoPlayer() {
        this.open = false;
        if (this.player) {
            this.player.pauseVideo();
        }
        TweenMax.to(this.videoContainer, 0.75, {
            height: 0,
            opacity: 0,
            ease: TweenMax.Expo.easeOut
        });

        TweenMax.to(this.videoPlayButton, 0.5, {
            opacity: 1,
            delay: 0.5,
            ease: TweenMax.Expo.easeOut
        });
    }
}

import TweenMax from 'gsap';
import GLOBALS from './../../config.js';

export default IntroSection;