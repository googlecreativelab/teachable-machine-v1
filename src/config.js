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
let AudioContext = window.AudioContext || window.webkitAudioContext;
let GLOBALS = {
	button: {
		padding: 0,
		frontHeight: 40,
		states: {
			normal: {
				x: 8,
				y: 8
			},
			pressed: {
				x: 4,
				y: 4
			}
		}
	},
	classNames: [
	'green',
	'purple',
	'orange',
	'red'
	],
	colors: {
		'green': '#2baa5e',
		'purple': '#c95ac5',
		'orange': '#dd4d31',
		'red': '#e8453c'
	},
	rgbaColors: {
		'green': 'rgba(43, 170, 94, 0.25)',
		'purple': 'rgba(201, 90, 197, 0.25)',
		'orange': 'rgba(221, 77, 49, 0.25)',
		'red': 'rgba(232, 69, 60, 0.25)'
	},
	classId: null,
	predicting: false,
	micThreshold: 25,
	classesTrained: {
		'green': false,
		'purple': false,
		'orange': false
	},
	numClasses: 3,
	audioContext: new AudioContext()
};

export default GLOBALS;