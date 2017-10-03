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

class GIFOutput {
	constructor() {
		this.id = 'GIFOutput';
		this.element = document.createElement('div');
		this.element.classList.add('output__container');
		this.classNames = GLOBALS.classNames;
		this.colors = GLOBALS.colors;
		this.defaultGifs = [];
		this.gifs = [];
		this.currentIndex = null;
		this.currentClass = null;
		this.resultOffset = 0;
		this.numResults = 10;

		this.useCanvas = (!GLOBALS.browserUtils.isMobile) && (GLOBALS.browserUtils.isChrome);
		if (this.useCanvas) {
			this.gifCanvas = new GifCanvas();
		}

		this.defaultGifs.push({
			still: 'https://media1.giphy.com/media/vFKqnCdLPNOKc/giphy-downsized_s.gif',
			gif: 'https://media1.giphy.com/media/vFKqnCdLPNOKc/200w.gif'
		});

		this.defaultGifs.push({
			still: 'https://media3.giphy.com/media/14ivBLRRRmyQw0/giphy-downsized_s.gif',
			gif: 'https://media3.giphy.com/media/14ivBLRRRmyQw0/200w.gif'
		});

		this.defaultGifs.push({
			still: 'https://media0.giphy.com/media/I3BLTIP5Gv6h2/giphy-downsized_s.gif',
			gif: 'https://media0.giphy.com/media/I3BLTIP5Gv6h2/200w.gif'
		});

		this.edit = document.createElement('div');
		this.edit.classList.add('gif__edit');

		this.editBar = document.createElement('div');
		this.editBar.classList.add('gif__edit-bar');

		this.borders = [];

		for (let index = 0; index < 3; index += 1) {
			let id = this.classNames[index];
			let image = this.defaultGifs[index].still;

			this.gifs[index] = this.defaultGifs[index];

			let button = document.createElement('div');
			button.classList.add('gif__thumb');
			button.id = id;
			button.index = index;
			button.image = this.defaultGifs[index].gif;

			let border = document.createElement('div');
			border.classList.add('gif__thumb-border');
			border.classList.add(`gif__thumb-border--${id}`);
			button.appendChild(border);

			let imageWrapper = document.createElement('div');
			imageWrapper.classList.add('gif__thumb-image-wrapper');
			imageWrapper.style.backgroundImage = `url(${image})`;
			button.appendChild(imageWrapper);

			this.editBar.appendChild(button);
			button.imageWrapper = imageWrapper;
			button.addEventListener('mouseenter', this.editThumbOver.bind(this));
			button.addEventListener('mouseleave', this.editThumbOut.bind(this));
			button.addEventListener('click', this.editThumbClick.bind(this));

			this.borders.push(border);
		}


		this.editViewer = document.createElement('div');
		this.editViewer.classList.add('gif__edit-viewer');
		if (this.gifCanvas) {
			this.editViewer.appendChild(this.gifCanvas.getElement());
			this.gifCanvas.getElement().classList.add('gif__canvas');
		}
		this.edit.appendChild(this.editViewer);

		this.edit.appendChild(this.editBar);

		this.search = document.createElement('div');
		this.search.classList.add('gif__search');
		this.search.style.display = 'none';
		this.searchBar = document.createElement('div');
		this.searchBar.classList.add('gif__search-bar');

		this.searchInput = document.createElement('input');
		this.searchInput.setAttribute('placeholder', 'Search Giphy');
		this.searchInput.classList.add('gif__search-input');
		this.searchBar.appendChild(this.searchInput);

		this.searchBackButton = document.createElement('div');
		this.searchBackButton.classList.add('gif__search-back-button');
		this.searchBar.appendChild(this.searchBackButton);
		this.search.appendChild(this.searchBar);

		this.searchScroll = document.createElement('div');
		this.searchScroll.classList.add('gif__search-scroll');
		this.search.appendChild(this.searchScroll);

		this.searchScrollContent = document.createElement('div');
		this.searchScrollContent.classList.add('gif__search-scroll-content');

		let sponsorMessage = document.createElement('div');
		sponsorMessage.classList.add('gif__search-sponsor');
		this.searchScrollContent.appendChild(sponsorMessage);

		this.searchResults = document.createElement('div');
		this.searchResults.classList.add('gif__search-results');
		
		this.leftColumn = document.createElement('div');
		this.leftColumn.classList.add('gif__search-column');
		this.searchResults.appendChild(this.leftColumn);

		this.rightColumn = document.createElement('div');
		this.rightColumn.classList.add('gif__search-column');
		this.searchResults.appendChild(this.rightColumn);

		this.searchScrollContent.appendChild(this.searchResults);

		this.loadMore = document.createElement('div');
		this.loadMore.classList.add('gif__load-more');
		this.loadMore.textContent = 'Load more';
		this.searchScrollContent.appendChild(this.loadMore);

		this.searchScroll.appendChild(this.searchScrollContent);

		this.edit.appendChild(this.search);

		this.element.appendChild(this.edit);

	}

	editThumbOver(event) {
		let image = event.target.image;
		this.editViewer.style.backgroundImage = `url(${image})`;
		this.showAnimation(image);
	}

	editThumbOut(event) {
		this.editViewer.style.backgroundImage = 'none';
		this.stopAnimation();
	}


	editThumbClick(event) {
		this.showSearch(event);
	}

	loadMoreResults() {
		this.searchGiphy();
	}

	selectImage(event) {
		let index = this.currentClass.index;
		this.gifs[index] = {
			gif: event.currentTarget.large,
			still: event.currentTarget.still
		};

		this.currentClass.image = this.gifs[index].gif;

		this.currentClass.imageWrapper.style.backgroundImage = `url(${this.gifs[index].still})`;
		this.hideSearch();
	}

	displaySearchResults(json) {
		this.leftColumn.innerHTML = '';
		this.rightColumn.innerHTML = '';
		let column = this.leftColumn;

		for (let index = 0; index < json.data.length; index += 1) {
			let small = json.data[index].images.fixed_width_small.url;
			// let large = json.data[index].images.downsized.url;
			let large = json.data[index].images.fixed_width.url;
			let still = json.data[index].images.downsized_still.url;
			let image = new Image();
			image.large = large;
			image.still = still;
			image.src = small;

			if (index % 2 === 0) {
				column = this.leftColumn;
			}else {
				column = this.rightColumn;
			}

			image.addEventListener('click', this.selectImage.bind(this));
			column.appendChild(image);
		}

		this.loadMore.style.opacity = 1;

	}

	searchGiphy() {
		let that = this;
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (this.status === 200 && this.readyState === 4) {
				var json = JSON.parse(request.responseText);
				that.displaySearchResults(json);
			}
		};

		var url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(this.phrase)}&api_key=l4FGxiI99hPQ0k6nS&limit=${this.numResults}&offset=${this.resultOffset}`;
		request.open('get', url, true);
		request.send();

		this.resultOffset += this.numResults;
	}

	searchKeyUp(event) {
		let value = this.searchInput.value;
		if (value.length > 0) {
			this.phrase = value;
			this.resultOffset = 0;
			this.searchGiphy();
		}
	}

	showSearch(event) {
		let id = event.currentTarget.getAttribute('id');
		this.currentClass = event.currentTarget;

		this.loadMore.style.opacity = 0;
		
		this.leftColumn.innerHTML = '';
		this.rightColumn.innerHTML = '';

		this.search.style.display = 'block';
		this.searchInput.className = 'gif__search-input';
		this.searchInput.classList.add(`gif__search-input--${id}`);
		this.searchBackButton.className = 'gif__search-back-button';
		this.searchBackButton.classList.add(`gif__search-back-button--${id}`);
		this.searchInput.focus();
		this.searchInput.value = '';
	}

	hideSearch() {
		this.search.style.display = 'none';
	}

	trigger(index) {
		this.currentIndex = index;

		if (this.currentBorder && this.currentClassName) {
			this.currentBorder.classList.remove(`gif__thumb-border--${this.currentClassName}-selected`);
		}

		let border = this.borders[index];
		let id = this.classNames[index];
		this.currentBorder = border;
		this.currentClassName = id;
		this.currentBorder.classList.add(`gif__thumb-border--${this.currentClassName}-selected`);

		let image = this.gifs[this.currentIndex].gif;
		this.editViewer.style.backgroundImage = `url(${image})`;
		this.showAnimation(image);
	}

	stop() {
		this.element.style.display = 'none';
		this.searchInput.removeEventListener('keyup', this.searchKeyUp.bind(this));
		this.searchBackButton.removeEventListener('click', this.hideSearch.bind(this));
		this.loadMore.removeEventListener('click', this.loadMoreResults.bind(this));
	}

	start() {
		this.element.style.display = 'block';
		this.searchInput.addEventListener('keyup', this.searchKeyUp.bind(this));
		this.searchBackButton.addEventListener('click', this.hideSearch.bind(this));
		this.loadMore.addEventListener('click', this.loadMoreResults.bind(this));
	}

	showAnimation(url) {
		if (this.gifCanvas) {
			this.gifCanvas.setSource(url);
		}
	}

	stopAnimation() {
		if (this.gifCanvas) {
			this.gifCanvas.clear();
		}
	}
}

import TweenMax from 'gsap';
import 'gifler';
import GifCanvas from './../ui/components/GifCanvas.js';
import GLOBALS from './../config.js';

export default GIFOutput;