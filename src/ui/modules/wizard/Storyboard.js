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

class Storyboard {
	constructor() {
		this.list = [
		{
			text: 'This is an experiment called Teachable Machine. It lets you explore how machine learning works.',
			start: 0,
			stop: 5.8
		}, 
		{
			text: 'Right now, your machine hasn’t been taught anything yet. You can start by teaching it to recognize you doing silly things.',
			start: 6.3,
			stop: 12.5
		}, 
		{
			text: 'First, you’ll have to turn on your camera.',
			start: 13.5,
			stop: 15.4
		}, 
		{
			text: 'Go ahead and click allow.',
			start: 16.4,
			stop: 18.2
		}, 
		{
			text: 'Great.',
			start: 21.3,
			stop: 22.3
		}, 
		{
			text: 'Over here is your input. You should see yourself.',
			start: 22.8,
			stop: 26.2
		}, 
		{
			text: 'And over Here is where you teach your machine.',
			start: 26.9,
			stop: 29.2
		}, 
		{
			text: 'So machine learning is basically about teaching by example.',
			start: 30,
			stop: 33.6
		}, 
		{
			text: 'First, let’s teach it what it looks like when you’re not doing anything. Just hold this grey button down for a couple seconds.',
			start: 34.3,
			stop: 40.5
		}, 
		{
			text: 'Okay, that should do.',
			start: 42.6,
			stop: 44
		}
		];

		this.errors = [
		{
			text: 'Error 1',
			start: 0,
			stop: 5.8
		}
		];

		this.list[401] = this.errors[0];
	}


}

export default Storyboard;