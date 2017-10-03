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

class Storyboard2 {
	constructor() {
		this.list = [];

		// 0.4
		// 13.504
		// 19.4
		// 36.504
		// 44.4
		// 51.4
		// 60 + 2.4
		// 60 + 15.4
		// 60 + 20.4
		// 60 + 29.504
		// 60 + 34.504
		// 60 + 46.4
		// 60 + 56.504
		// 60 + 60 + 7.4
		// 60 + 60 + 24.504
		// 60 + 60 + 30.4
		// 60 + 60 + 36.4
		// 60 + 60 + 42.504


		this.list.push({
			start: 0,
			stop: 12,
			triggers: [
				{
					start: 0,
					stop: 5,
					event: () => {
						console.log('setMessage', 'This is an experiment called Teachable Machine. It lets you explore how machine learning works.');
					}
				},
				{
					start: 5.5,
					stop: 12,
					event: () => {
						console.log('setMessage', 'Your machine hasn’t been taught anything yet. You can start by teaching it to recognize you doing silly things. ');
					}
				}
			]
		});

		this.list.push({
			start: 13.504,
			stop: 19.4,
			triggers: [
				{
					start: 13.504,
					stop: 19.4,
					event: () => {
						console.log('setMessage', 'First, you’ll have to turn on your camera. Go ahead and click allow.');
					}
				},
				{
					start: 15.5,
					stop: 12,
					event: () => {
						console.log('Ask for camera permission');
					}
				}
			]
		});
	}
}

export default Storyboard2;