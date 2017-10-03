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

class TextToSpeech {
	constructor() {
		this.voices = [];
		this.voice = null;
		this.message = null;
		if (typeof speechSynthesis === 'object' && typeof speechSynthesis.onvoiceschanged === 'function') {
			speechSynthesis.onvoiceschanged = this.setVoice;
		}

	}

	setVoice() {
		this.voices = window.speechSynthesis.getVoices();
		this.voice = this.voices.filter(function(voice) { 
			return voice.name === 'Google US English Female';
		})[0];
	}

	stop() {
		window.speechSynthesis.cancel();
	}

	say(text, callback) {
		this.message = new SpeechSynthesisUtterance();
		this.message.text = text;
		this.message.voice = this.voice;
		this.message.rate = 0.9;
		this.message.lang = 'en-US';
		this.message.addEventListener('end', callback);
		window.speechSynthesis.speak(this.message);
	}
}

export default TextToSpeech;