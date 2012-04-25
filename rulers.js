/*
Copyright (C) 2012 David Arbuckle

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* browser-rulers */
/* David Arbuckle */
/* April 2012 */

// ==UserScript==
// @name           browser-rulers
// @description    Be your designer's best friend. Rulers and guides for the browser. Works anywhere <canvas> does.
// @include        http://*
// @include        https://*
// ==/UserScript==

var guides = {
	canvas: null,
	context: null,
	cpToggle: null,
	cpClearAll: null,
	activeGuidesHorizontal: [],
	activeGuidesVertical: [],
	mouseInterval: null,
	mouseX: 0,
	mouseY: 0,
	dragging: false,
	dragType: 'vertical',
	stageWidth: null,
	stageHeight: null,
	init: function() {
		this.calculateCanvasDimensions();
		this.createCanvas();
		this.createControlPanel();
		this.drawRuler();
		this.restorePreviousGuides();

		document.addEventListener('scroll', this.scrollHandler, false);
		document.addEventListener('mousemove', this.mousePositionHandler, false);
		document.addEventListener('mousemove', this.guideDragHandler, false);
		document.addEventListener('mousedown', this.guideDragStart, false);
		document.addEventListener('mouseup', this.guideDragStop, false);

		this.cpToggle.addEventListener('click', this.handleControlPanel, false);
		this.cpClearAll.addEventListener('click', this.handleControlPanel, false);
	},
	calculateCanvasDimensions: function() {
		/*http://stackoverflow.com/questions/1145850/get-height-of-entire-document-with-javascript*/
		var body = document.body,
			html = document.documentElement;

		this.stageHeight = Math.max(body.scrollHeight, body.offsetHeight,
								html.clientHeight, html.scrollHeight, html.offsetHeight);

		this.stageWidth = Math.max(body.scrollWidth, body.offsetWidth,
								html.clientWidth, html.scrollWidth, html.offsetWidth);
	},
	createControlPanel: function() {
		var style = document.createElement('style');
		style.innerHTML =	"#GuideToggle {position: fixed; top: 0; left: 0; width: 20px; height: 20px; background-color: #5e5e5e; z-index: 1000;}" +
							"#GuideClearAll {display:none; position: fixed; top: 0; right: 0; width: 20px; height: 20px; background-color: rgba(255, 0, 0, 0.75); z-index: 1000;}";
		document.body.appendChild(style);

		this.cpToggle = document.createElement('div');
		this.cpToggle.id = "GuideToggle";
		this.cpToggle.title = "Toggle display of rulers and guides";
		document.body.appendChild(this.cpToggle);

		this.cpClearAll = document.createElement('div');
		this.cpClearAll.id = "GuideClearAll";
		this.cpClearAll.title = "Clear all guides";
		document.body.appendChild(this.cpClearAll);
	},
	createCanvas: function() {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext("2d");

		this.canvas.id = "Guide";
		this.canvas.width = this.stageWidth;
		this.canvas.height = this.stageHeight;
		this.canvas.style.display = 'none';
		this.canvas.style.position = 'absolute';
		this.canvas.style.top = 0;
		this.canvas.style.left = 0;
		this.canvas.style.zIndex = 999;

		document.body.appendChild(this.canvas);

		//this.context.lineWidth   = '0.5';
	},
	restorePreviousGuides: function() {
		var oldGuides = window.location.hash,
			verticals,
			horizontals,
			l_verticals,
			l_horizontals,
			i;
		if (!oldGuides) {
			return;
		}

		oldGuides = oldGuides.split(';');

		verticals = oldGuides[0].split(',');
		l_verticals = verticals.length;

		horizontals = oldGuides[1].split(',');
		l_horizontals = horizontals.length;

		for (i = 1; i < l_verticals; i ++) {
			if (verticals[i]) {
				this.activeGuidesVertical.push(Number(verticals[i]));
			}
		}
		for (i = 1; i < l_horizontals; i ++) {
			if (horizontals[i]) {
				this.activeGuidesHorizontal.push(Number(horizontals[i]));
			}
		}
		this.redrawAll();
	},
	drawGuide: function(position, axis) {
		this.context.beginPath();
		this.context.fillStyle = '#29FF00';

		if (axis === 'horizontal') {
			/* horizontal line */
			this.context.moveTo(0, position);
			//this.context.lineTo(this.stageWidth, position);
			this.context.fillRect(0, position, this.stageWidth, 1);
		} else if (axis === 'vertical') {
			/* vertical line */
			this.context.moveTo(position, 0);
			//this.context.lineTo(position, this.stageHeight);
			this.context.fillRect(position, 0, 1, this.stageHeight);
		}
		this.context.stroke();
	},
	drawRuler: function() {
		/* scroll position code adapted from: http://www.west-wind.com/weblog/posts/2006/Feb/24/Retrieving-Browser-Scroll-Position-in-JavaScript */
		var scrollTop = document.body.scrollTop,
			scrollLeft = document.body.scrollLeft;

		if (scrollTop === 0 || scrollLeft === 0) {
			if (window.pageYOffset || window.pageXOffset) {
				scrollTop = window.pageYOffset;
				scrollLeft = window.pageXOffset;
			} else {
				scrollTop = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
				scrollLeft = (document.body.parentElement) ? document.body.parentElement.scrollLeft : 0;
			}
		}

		this.context.fillStyle = 'rgba(102, 102, 102, 0.49)';
		this.context.fillRect(scrollLeft, scrollTop, this.stageWidth, 20);
		this.context.fillRect(scrollLeft, scrollTop, 20, this.stageHeight);

		this.context.fillStyle = '#FFF';
		var startPosHorizontal = scrollLeft,
			endPosHorizontal = this.stageWidth,
			startPosVertical = scrollTop,
			endPosVertical = this.stageHeight;

		for (startPosHorizontal; startPosHorizontal < endPosHorizontal; startPosHorizontal ++) {
			if (startPosHorizontal % 50 === 0) {
				this.context.fillRect(startPosHorizontal, scrollTop, 1, 20);
				this.context.fillText(startPosHorizontal, startPosHorizontal+2, scrollTop+19);
			} else if (startPosHorizontal % 10 === 0) {
				this.context.fillRect(startPosHorizontal, scrollTop, 1, 10);
			} else if (startPosHorizontal % 5 === 0) {
				this.context.fillRect(startPosHorizontal, scrollTop, 1, 5);
			}
		}
		for (startPosVertical; startPosVertical < endPosVertical; startPosVertical ++) {
			if (startPosVertical % 50 === 0) {
				this.context.fillRect(scrollLeft, startPosVertical, 20, 1);

				this.context.save();
				this.context.translate(19, startPosVertical);
				this.context.rotate(-Math.PI/2);
				this.context.textAlign = "center";
				var offset = (startPosVertical < 100) ? 8 : (startPosVertical < 1000) ? 11 : 13;
				this.context.fillText(startPosVertical, offset, scrollLeft);
				this.context.restore();

			} else if (startPosVertical % 10 === 0) {
				this.context.fillRect(scrollLeft, startPosVertical, 10, 1);
			} else if (startPosVertical % 5 === 0) {
				this.context.fillRect(scrollLeft, startPosVertical, 5, 1);
			}
		}
	},
	redrawAll: function() {
		var horizontal = this.activeGuidesHorizontal,
			h_len = horizontal.length,
			vertical = this.activeGuidesVertical,
			v_len = vertical.length,
			i;
		for	(i = 0; i < h_len; i ++) {
			this.drawGuide(horizontal[i], 'horizontal');
		}
		for (i = 0; i < v_len; i ++) {
			this.drawGuide(vertical[i], 'vertical');
		}
		this.drawRuler();
	},
	clearAllGuides: function() {
		window.history.replaceState({}, document.title, window.location.href.replace(window.location.hash, ''));
		this.activeGuidesVertical = [];
		this.activeGuidesHorizontal = [];
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawRuler();
	},
	clearCanvas: function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	newGuide: function(type) {
		if (type === 'vertical') {
			var position = this.mouseX;
			this.drawGuide(position, 'vertical');
			this.activeGuidesVertical.push(position);
		} else if (type === 'horizontal') {
			var position = this.mouseY;
			this.drawGuide(position, 'horizontal');
			this.activeGuidesHorizontal.push(position);
		}
	},
	scrollHandler: function(event) {
		guides.clearCanvas();
		guides.redrawAll();
	},
	mousePositionHandler: function(event) {
		guides.mouseX = event.pageX;
		guides.mouseY = event.pageY;
	},
	guideDragHandler: function(event) {
		if (guides.dragging) {
			var point = guides.dragType === 'horizontal' ? guides.mouseY : guides.mouseX;
			guides.clearCanvas();
			guides.drawGuide(point, guides.dragType);
			guides.redrawAll();
		}

		/* guide boundaries are 3px to either side.  similar code in guideDragStart */
		if (guides.activeGuidesVertical.indexOf(guides.mouseX) !== -1
			|| guides.activeGuidesVertical.indexOf(guides.mouseX - 1) !== -1
			|| guides.activeGuidesVertical.indexOf(guides.mouseX - 2) !== -1
			|| guides.activeGuidesVertical.indexOf(guides.mouseX - 3) !== -1
			|| guides.activeGuidesVertical.indexOf(guides.mouseX + 1) !== -1
			|| guides.activeGuidesVertical.indexOf(guides.mouseX + 2) !== -1
			|| guides.activeGuidesVertical.indexOf(guides.mouseX + 3) !== -1
			|| guides.activeGuidesHorizontal.indexOf(guides.mouseY) !== -1
			|| guides.activeGuidesHorizontal.indexOf(guides.mouseY - 1) !== -1
			|| guides.activeGuidesHorizontal.indexOf(guides.mouseY - 2) !== -1
			|| guides.activeGuidesHorizontal.indexOf(guides.mouseY - 3) !== -1
			|| guides.activeGuidesHorizontal.indexOf(guides.mouseY + 1) !== -1
			|| guides.activeGuidesHorizontal.indexOf(guides.mouseY + 2) !== -1
			|| guides.activeGuidesHorizontal.indexOf(guides.mouseY + 3) !== -1) {
			guides.canvas.style.cursor = 'pointer';
		} else {
			guides.canvas.style.cursor = 'auto';
		}
	},
	guideDragStop: function(event){
		if (guides.dragging) {
			guides.dragging = false;
			if (guides.dragType === 'horizontal' && event.clientY > 20 && event.clientX > 20) {
				guides.activeGuidesHorizontal.push(guides.mouseY);
			} else if (guides.dragType === 'vertical' && event.clientY > 20 && event.clientX > 20) {
				guides.activeGuidesVertical.push(guides.mouseX);
			}

			var guidesHash;
			if (!guides.activeGuidesVertical.length && !guides.activeGuidesHorizontal.length) {
				guidesHash = '';
			} else {
				guidesHash = '#V,' + guides.activeGuidesVertical.toString() + ';H,' + guides.activeGuidesHorizontal.toString();
			}

			window.history.replaceState({}, document.title, window.location.href.replace(window.location.hash, '') + guidesHash);
		}
		guides.clearCanvas();
		guides.redrawAll();
	},
	guideDragStart: function(event) {
		if (guides.canvas.style.display === 'none') {
			return;
		}

		var x, y, vertical, horizontal;

		x = event.pageX;
		y = event.pageY;

		if (event.clientY <= 20 && event.clientX >= 20) {
			guides.dragging = true;
			guides.dragType = 'horizontal';
			return;
		} else if (event.clientX <= 20 && event.clientY >= 20) {
			guides.dragging = true;
			guides.dragType = 'vertical';
			return;
		}

		/* guide boundaries are 3px to either side.  similar code in guideDragHandler */
		verticalIndex = guides.activeGuidesVertical.indexOf(x) !== -1 ? guides.activeGuidesVertical.indexOf(x) :
							guides.activeGuidesVertical.indexOf(x - 1)  !== -1 ? guides.activeGuidesVertical.indexOf(x - 1) :
								guides.activeGuidesVertical.indexOf(x - 2)  !== -1 ? guides.activeGuidesVertical.indexOf(x - 2) :
									guides.activeGuidesVertical.indexOf(x - 3)  !== -1 ? guides.activeGuidesVertical.indexOf(x - 3) :
										guides.activeGuidesVertical.indexOf(x + 1)  !== -1 ? guides.activeGuidesVertical.indexOf(x + 1) :
											guides.activeGuidesVertical.indexOf(x + 2)  !== -1 ? guides.activeGuidesVertical.indexOf(x + 2) :
												guides.activeGuidesVertical.indexOf(x + 3)  !== -1 ? guides.activeGuidesVertical.indexOf(x + 3) :
													-1;

		horizontalIndex = guides.activeGuidesHorizontal.indexOf(y) !== -1 ? guides.activeGuidesHorizontal.indexOf(y) :
							guides.activeGuidesHorizontal.indexOf(y - 1)  !== -1 ? guides.activeGuidesHorizontal.indexOf(y - 1) :
								guides.activeGuidesHorizontal.indexOf(y - 2)  !== -1 ? guides.activeGuidesHorizontal.indexOf(y - 2) :
									guides.activeGuidesHorizontal.indexOf(y - 3)  !== -1 ? guides.activeGuidesHorizontal.indexOf(y - 3) :
										guides.activeGuidesHorizontal.indexOf(y + 1)  !== -1 ? guides.activeGuidesHorizontal.indexOf(y + 1) :
											guides.activeGuidesHorizontal.indexOf(y + 2)  !== -1 ? guides.activeGuidesHorizontal.indexOf(y + 2) :
												guides.activeGuidesHorizontal.indexOf(y + 3)  !== -1 ? guides.activeGuidesHorizontal.indexOf(y + 3) :
													-1;

		if (verticalIndex !== -1) {
			guides.activeGuidesVertical.splice(verticalIndex, 1);
			guides.dragging = true;
			guides.dragType = 'vertical';
		} else if (horizontalIndex !== -1) {
			guides.activeGuidesHorizontal.splice(horizontalIndex, 1);
			guides.dragging = true;
			guides.dragType = 'horizontal';
		}
	},
	handleControlPanel: function(event) {
		if (event.target.id === "GuideToggle") {
			if (guides.canvas.style.display !== 'none') {
				guides.canvas.style.display = "none";
				document.getElementById('GuideClearAll').style.display = 'none';
			} else {
				guides.canvas.style.display = "";
				document.getElementById('GuideClearAll').style.display = 'block';
			}
		} else if (event.target.id === "GuideClearAll") {
			guides.clearAllGuides();
		}

	}
}
guides.init();
