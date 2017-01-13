/**
 * jQuery mightySlider - Mighty Responsive Slider
 * http://mightyslider.com
 * 
 * @version:  1.1.0
 * @released: November 12, 2013
 * 
 * @author:   Hemn Chawroka
 *            http://iprodev.com/
 * 
 */
(function ($, window, undefined) {
	'use strict';

	var namespace = 'mightySlider',
		minnamespace  = 'mS',
		isTouch  = !!('ontouchstart' in window),
		videoRegularExpressions = [
			{
				reg:    /youtu\.be\//i,
				split:  '/',
				index:  3,
				iframe: 1,
				url:    "https://www.youtube.com/embed/{id}?autoplay=1&fs=1&rel=0&enablejsapi=1&wmode=opaque"
			},
			{
				reg:    /youtube\.com\/watch/i,
				split:  '=',
				index:  1,
				iframe: 1,
				url:    "https://www.youtube.com/embed/{id}?autoplay=1&fs=1&rel=0&enablejsapi=1&wmode=opaque"
			},
			{
				reg:    /vimeo\.com\//i,
				split:  '/',
				index:  3,
				iframe: 1,
				url:    "https://player.vimeo.com/video/{id}?hd=1&autoplay=1&show_title=1&show_byline=1&show_portrait=0&color=&fullscreen=1"
			},
			{
				reg:   /metacafe\.com\/watch/i,
				split: '/',
				index: 4,
				url:   "http://www.metacafe.com/fplayer/{id}/.swf?playerVars=autoPlay=yes"
			},
			{
				reg:   /dailymotion\.com\/video/i,
				split: '/',
				index: 4,
				url:   "http://www.dailymotion.com/swf/video/{id}?additionalInfos=0&autoStart=1"
			},
			{
				reg:   /gametrailers\.com/i,
				split: '/',
				index: 5,
				url:   "http://www.gametrailers.com/remote_wrap.php?mid={id}"
			},
			{
				reg:   /collegehumor\.com\/video\//i,
				split: 'video/',
				index: 1,
				url:   "http://www.collegehumor.com/moogaloop/moogaloop.jukebox.swf?autostart=true&fullscreen=1&use_node_id=true&clip_id={id}"
			},
			{
				reg:   /collegehumor\.com\/video:/i,
				split: 'video:',
				index: 1,
				url:   "http://www.collegehumor.com/moogaloop/moogaloop.swf?autoplay=true&fullscreen=1&clip_id={id}"
			},
			{
				reg:   /ustream\.tv/i,
				split: '/',
				index: 4,
				url:   "http://www.ustream.tv/flash/video/{id}?loc=%2F&autoplay=true&vid={id}&disabledComment=true&beginPercent=0.5331&endPercent=0.6292&locale=en_US"
			},
			{
				reg:   /twitvid\.com/i,
				split: '/',
				index: 3,
				url:   "http://www.twitvid.com/player/{id}"
			},
			{
				reg:   /v\.wordpress\.com/i,
				split: '/',
				index: 3,
				url:   "http://s0.videopress.com/player.swf?guid={id}&v=1.01"
			},
			{
				reg:   /google\.com\/videoplay/i,
				split: '=',
				index: 1,
				url:   "http://video.google.com/googleplayer.swf?autoplay=1&hl=en&docId={id}"
			},
			{
				reg:   /vzaar\.com\/videos/i,
				split: '/',
				index: 4,
				url:   "http://view.vzaar.com/{id}.flashplayer?autoplay=true&border=none"
			}
		],
		JSONReader = 'http://mightyslider.com/getJSON.php?url={URL}',
		photoRegularExpressions = [
			{
				reg:     /vimeo\.com\//i,
				oembed:  'https://vimeo.com/api/oembed.json?url={URL}',
				inJSON:  'thumbnail_url'
			},
			{
				reg:     /youtube\.com\/watch/i,
				oembed:  'https://www.youtube.com/oembed?url={URL}&format=json',
				inJSON:  'thumbnail_url',
				replace: {
					from: 'hqdefault.jpg',
					to:   'maxresdefault.jpg'
				}
			},
			{
				reg:    /dailymotion\.com\/video/i,
				oembed: 'http://www.dailymotion.com/services/oembed?format=json&url={URL}',
				inJSON: 'url'
			},
			{
				reg:     /500px\.com\/photo\/([0-9]+)/i,
				oembed:  '{URL}/oembed.json',
				inJSON:  'thumbnail_url',
				replace: {
					from: '3.jpg',
					to:   '5.jpg'
				}
			},
			{
				reg:    /flickr\.com\/photos\/([^\/]+)\/([0-9]+)/i,
				oembed: 'http://www.flickr.com/services/oembed?url={URL}&format=json',
				inJSON: 'url'
			},
			{
				reg:    /instagram\.com\/p\//i,
				oembed: 'http://api.instagram.com/oembed?url={URL}',
				inJSON: 'url'
			}
		],
		videoTypes = {
			'avi' : 'video/msvideo',
			'mov' : 'video/quicktime',
			'mpg' : 'video/mpeg',
			'mpeg': 'video/mpeg',
			'mp4' : 'video/mp4',
			'webm': 'video/webm',
			'ogv' : 'video/ogg',
			'3gp' : 'video/3gpp',
			'm4v' : 'video/x-m4v'
		},
		tmpArray = [],
		interactiveElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'],
		time,

		// HTML5 video tag default attributes
		videoDefaultAttributes = {
			width: '100%',
			height: '100%',
			preload: 'preload',
			autoplay: 'autoplay',
			controls: 'controls'
		},

		// iframe tag default attributes
		iframeDefaultAttributes = {
			width: '100%',
			height: '100%',
			frameborder: 0,
			webkitAllowFullScreen: true,
			mozallowfullscreen: true,
			allowFullScreen: true
		},

		// embed tag default attributes
		embedDefaultAttributes = {
			width: '100%',
			height: '100%',
			bgcolor: '#000000',
			quality: 'high',
			play: true,
			loop: true,
			menu: true,
			wmode: 'transparent',
			scale: 'showall',
			allowScriptAccess: 'always',
			allowFullScreen: true,
			fullscreen: 'yes'
		},

		captionResponsiveStyles = [
			// captions scale able styles
			'width',
			'height',
			'fontSize',
			'fontSize',
			'top',
			'left',
			'paddingTop',
			'paddingLeft',
			'paddingBottom',
			'paddingRight'
		],
		
		// Global DOM elements
		$win = $(window),
		$doc = $(document),

		// Events
		clickEvent = 'click.' + namespace + ' tap.' + namespace,
		mouseDownEvent = 'touchstart.' + namespace + ' mousedown.' + namespace,
		mouseScrollEvent = ($.fn.mousewheel) ? 'mousewheel.' + namespace : 'DOMMouseScroll.' + namespace + ' mousewheel.' + namespace,
		dragInitEvents = 'touchstart.' + namespace + ' mousedown.' + namespace,
		dragMouseEvents = 'mousemove.' + namespace + ' mouseup.' + namespace,
		dragTouchEvents = 'touchmove.' + namespace + ' touchend.' + namespace,
		keyDownEvent = 'keydown.' + namespace,
		resizeEvent = 'resize.' + namespace,
		hashChangeEvent = 'hashchange.' + namespace,
		hoverEvent = 'mouseenter.' + namespace + ' mouseleave.' + namespace,

		// Local WindowAnimationTiming interface
		requestAnimationFrame = window.requestAnimationFrame,
		cancelAnimationFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame,

		// Support indicators
		browser, transform, gpuAcceleration, browserPlugins, fullScreenApi;

	/**
	 * mightySlider.
	 *
	 * @class
	 *
	 * @param {Element} frame       DOM element of mightySlider container.
	 * @param {Object}  options     Object with options.
	 * @param {Object}  callbackMap Callbacks map.
	 */
	function mightySlider(frame, options, callbackMap) {
		var self = this;

		// Merge options deeply
		self.options = $.extend(true, {}, mightySlider.defaults, options);

		// Frame
		var $frame = $(frame),
			$parent = $(frame).parent(),
			$slideElement = $frame.children().eq(0),
			frameInlineOptions = getInlineOptions($frame),
			autoScale = self.options.autoScale && ( frameInlineOptions.height && { width: frameInlineOptions.width, height: frameInlineOptions.height } || { width: $parent.width(), height: $parent.height() }) || null,
			frameSize = 0,
			frameRatio = 1,
			slideElementSize = 0;
		self.position = {
			current: 0,
			start: 0,
			center: 0,
			end: 0,
			destination: 0
		};

			// Slides
		var $slides = 0;
		self.slides = [];
		self.relative = {
			activeSlide: -1,
			firstSlide: 0,
			centerSlide: 0,
			lastSlide: 0,
			activePage: 0
		};

			// Navigation
		var basicNav = self.options.navigation.navigationType === 'basic',
			forceCenteredNav = self.options.navigation.navigationType === 'forceCentered',
			centeredNav = self.options.navigation.navigationType === 'centered' || forceCenteredNav,
			navigationType = (basicNav || centeredNav || forceCenteredNav),

			// Pagesbar
			$pagesBar = self.options.pages.pagesBar && $(self.options.pages.pagesBar) || {},
			$pages = 0;
		self.pages = [];

			// Thumbnails bar
		var $thumbnailsBar = self.options.thumbnails.thumbnailsBar && $(self.options.thumbnails.thumbnailsBar) || {},
			$thumbnails = 0;
		self.thumbnails = [];
		var thumbnailNav = null,
			thumbnailNavOptions = {},

			// Scrolling and Dragging
			$scrollSource = self.options.scrolling.scrollSource && $(self.options.scrolling.scrollSource) || $frame,
			$dragSource = self.options.dragging.dragSource && $(self.options.dragging.dragSource) || $frame,
			dragging = {
				released: 1
			},

			// Buttons
			$forwardButton = $(self.options.buttons.forward),
			$backwardButton = $(self.options.buttons.backward),
			$prevButton = $(self.options.buttons.prev),
			$nextButton = $(self.options.buttons.next),
			$prevPageButton = $(self.options.buttons.prevPage),
			$nextPageButton = $(self.options.buttons.nextPage),
			$fullScreenButton = $(self.options.buttons.fullScreen),

			// Miscellaneous
			inserted = 0,
			hashLock = 0,
			callbacks = {},
			last = {},
			animation = {},
			move = {},
			scrolling = {
				last: 0,
				delta: 0,
				resetTime: 200
			},
			renderID = 0,
			historyID = 0,
			cycleID = 0,
			continuousID = 0,
			resizeID = 0,
			captionID = 0,
			captionHistory = [],
			mediaEnabled = null,
			i, l;

		// Expose properties
		self.initialized = 0;
		self.frame = $frame[0];
		self.slideElement = $slideElement[0];
		self.isFullScreen = 0;
		self.isPaused = 0;

		/**
		 * (Re)Loading function.
		 *
		 * Populate arrays, set sizes, bind events, ...
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		function load(immediate) {
			// Local variables
			var ignoredMargin = 0;

			// Auto scale slider if options.autoScale is enabled
			if (self.options.autoScale) {
				scaleSlider();
			}

			// Save old position
			self.position.old = $.extend({}, self.position),

			// Reset global variables
			frameSize = $frame[self.options.navigation.horizontal ? 'width' : 'height'](),
			slideElementSize = $slideElement[self.options.navigation.horizontal ? 'outerWidth' : 'outerHeight'](),
			self.pages = [],

			// Set position limits & relatives
			self.position.start = 0,
			self.position.end = Math.max(slideElementSize - frameSize, 0),
			last = {};

			// Sizes & offsets for slide based navigations
			if (navigationType) {
				// Save the number of current slides
				var lastSlidesCount = self.slides.length;

				// Reset navigationType related variables
				$slides = $slideElement.children(self.options.navigation.slideSelector);
				self.slides = [];

				// Needed variables
				var paddingStart = getPixel($slideElement, self.options.navigation.horizontal ? 'paddingLeft' : 'paddingTop'),
					paddingEnd = getPixel($slideElement, self.options.navigation.horizontal ? 'paddingRight' : 'paddingBottom'),
					marginStart = getPixel($slides, self.options.navigation.horizontal ? 'marginLeft' : 'marginTop'),
					marginEnd = getPixel($slides.slice(-1), self.options.navigation.horizontal ? 'marginRight' : 'marginBottom'),
					centerOffset = 0,
					areFloated = $slides.css('float') !== 'none';

				// Update ignored margin
				ignoredMargin = marginStart ? 0 : marginEnd;

				// Reset slideElementSize
				slideElementSize = 0;

				// Iterate through slides
				$slides.each(function (i, element) {
					// Slide
					var $slide = $(element),
						slideOptions = getInlineOptions($slide),
						slideType = getSlideType(slideOptions),
						property = slideOptions.size || self.options.navigation.slideSize,
						slideMarginStart = getPixel($slide, self.options.navigation.horizontal ? 'marginLeft' : 'marginTop'),
						slideMarginEnd = getPixel($slide, self.options.navigation.horizontal ? 'marginRight' : 'marginBottom'),
						slidePaddingStart = getPixel($slide, self.options.navigation.horizontal ? 'paddingLeft' : 'paddingTop'),
						slidePaddingEnd = getPixel($slide, self.options.navigation.horizontal ? 'paddingRight' : 'paddingBottom'),
						slideBorderStart = getPixel($slide, self.options.navigation.horizontal ? 'borderLeftWidth' : 'borderTopWidth'),
						slideBorderEnd = getPixel($slide, self.options.navigation.horizontal ? 'borderRightWidth' : 'borderBottomWidth'),
						slideExtraSize = property ? slidePaddingStart + slidePaddingEnd + slideBorderStart + slideBorderEnd : 0,
						slideSize = getSlideSize($slide, property),
						slideData = {
							element: element,
							options: slideOptions,
							type: slideType,
							captions: [],
							ID: slideOptions.ID && rawurlencode(slideOptions.ID) || i,
							size: slideSize,
							half: slideSize / 2,
							start: slideElementSize - (!i || self.options.navigation.horizontal ? 0 : slideMarginStart),
							center: slideElementSize - Math.round((frameSize / 2) - (slideSize / 2)),
							end: slideElementSize - frameSize + slideSize - (marginStart ? 0 : slideMarginEnd)
						};

					// Add captions to slideData object
					$('.' + minnamespace + 'Caption', $slide).each(function (index, caption) {
						var $caption = $(caption),
							captionOptions = getInlineOptions($caption),
							captionAnimation = getCaptionOptions($caption),
							captionStyles = $caption.data(minnamespace + 'styles'),
							captionData = {
								element: caption,
								options: captionOptions,
								animation: captionAnimation
							};

						if (captionStyles && resizeID && self.options.autoScale) {
							// Set necessary caption styles
							$caption.css(normalizeStyles($.extend({}, captionStyles, captionAnimation[captionAnimation.length - 1] && captionAnimation[captionAnimation.length - 1].style || {}), captionResponsiveStyles, frameRatio));
						}

						slideData.captions.push(captionData);
					});

					// Normalize slide size for responsive purpose
					if(property) {
						slideSize -= slideExtraSize;
						$slide[self.options.navigation.horizontal ? 'width' : 'height'](slideSize);
					}

					// Account for centerOffset & slideElement padding
					if (!i) {
						centerOffset = -(forceCenteredNav ? Math.round(frameSize / 2 - slideSize / 2) : 0) + paddingStart;
						slideElementSize += paddingStart;
					}

					// Increment slideElement size for size of the active element
					slideElementSize += slideSize;
					if (property) {
						slideElementSize += slideMarginStart + slideMarginEnd + slidePaddingStart + slidePaddingEnd + slideBorderStart + slideBorderEnd;
					}

					// Try to account for vertical margin collapsing in vertical mode
					// It's not bulletproof, but should work in 99% of cases
					if (!self.options.navigation.horizontal && !areFloated) {
						// Subtract smaller margin, but only when top margin is not 0, and this is not the first element
						if (slideMarginEnd && slideMarginStart && i > 0) {
							slideElementSize -= Math.min(slideMarginStart, slideMarginEnd);
						}
					}

					// Things to be done on last slide
					if (i === $slides.length - 1) {
						slideElementSize += paddingEnd;
					}

					// Add slide object to slides array
					self.slides.push(slideData);
				});

				// Resize slideElement to fit all slides
				$slideElement[0].style[self.options.navigation.horizontal ? 'width' : 'height'] = slideElementSize + 'px';

				// Adjust internal slideElement size for last margin
				slideElementSize -= ignoredMargin;

				// Set limits
				self.position.start = centerOffset;
				self.position.end = forceCenteredNav ? (self.slides.length ? self.slides[self.slides.length - 1].center : centerOffset) : Math.max(slideElementSize - frameSize, 0);

				// Activate last slide if previous active has been removed, or first slide
				// when there were no slides before, and new got appended.
				if (self.relative.activeSlide >= self.slides.length || lastSlidesCount === 0 && self.slides.length > 0 && (self.initialized && inserted)) {
					activate(self.slides.length > 0 ? self.slides.length - 1 : 0);
				}
			}

			// Calculate slideElement center position
			self.position.center = Math.round((self.position.end / 2) + (self.position.start / 2));

			// Update relative positions
			updateRelatives();

			// Pages
			if (frameSize > 0) {
				var tempPagePos = self.position.start,
					pagesHtml = '';

				// Populate pages array
				$.each(self.slides, function (i, slide) {
					if (forceCenteredNav || slide.start + slide.size > tempPagePos) {
						tempPagePos = slide[forceCenteredNav ? 'center' : 'start'];
						self.pages.push(tempPagePos);
						tempPagePos += frameSize;
					}
				});

				// Pages bar
				if ($pagesBar[0]) {
					for (var i = 0; i < self.pages.length; i++) {
						pagesHtml += self.options.pages.pageBuilder.call(self, i);
					}
					$pages = $pagesBar.html(pagesHtml).children();
				}
			}

			// Thumbnails
			if (self.slides.length > 0 && (!self.initialized || (self.initialized && inserted))) {
				syncThumbnailsbar();
			}

			// Fix possible overflowing
			self.activate(self.relative.activeSlide, immediate);

			// Extend relative variables object with some useful info
			self.relative.slideElementSize = slideElementSize;
			self.relative.frameSize = frameSize;

			// Set slides cover & icons
			if(!self.initialized || (self.initialized && inserted)) {
				setSlidesCovers();
				setSlidesIcons();
			}

			if (self.options.autoResize) {
				resizeFrame(within(self.relative.activeSlide, self.relative.firstSlide, self.relative.lastSlide), 1);
			}

			// Reposition slides contents
			if(self.initialized) {
				repositionCovers();
			}

			// Trigger :load event
			trigger('load');
		}
		self.reload = load;

		/**
		 * Animate to a position.
		 *
		 * @param {Int}  newPos    New position.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 * @param {Bool} dontAlign Do not align slides, use the raw position passed in first argument.
		 *
		 * @return {Void}
		 */
		function slideTo(newPos, immediate, dontAlign) {
			// Align slides
			if (dragging.released && !dontAlign) {
				var tempRel = getRelatives(newPos),
					isNotBordering = newPos > self.position.start && newPos < self.position.end;

				if (centeredNav) {
					if (isNotBordering) {
						newPos = self.slides[tempRel.centerSlide].center;
					}
					if (forceCenteredNav && self.options.navigation.activateMiddle) {
						activate(tempRel.centerSlide);
					}
				}
				else if (isNotBordering) {
					newPos = self.slides[tempRel.firstSlide].start;
				}
			}

			// Handle overflowing position limits
			if (dragging.init && dragging.slideElement && self.options.dragging.elasticBounds) {
				if (newPos > self.position.end) {
					newPos = self.position.end + (newPos - self.position.end) / 6;
				}
				else if (newPos < self.position.start) {
					newPos = self.position.start + (newPos - self.position.start) / 6;
				}
			}
			else {
				newPos = within(newPos, self.position.start, self.position.end);
			}

			// Update the animation object
			animation.start = +new Date();
			animation.time = 0;
			animation.from = self.position.current;
			animation.to = newPos;
			animation.delta = newPos - self.position.current;
			animation.tweesing = dragging.tweese || dragging.init && !dragging.slideElement;
			animation.immediate = !animation.tweesing && (immediate || dragging.init && dragging.slideElement || !self.options.speed);

			// Reset dragging tweesing request
			dragging.tweese = 0;

			// Start animation rendering
			if (newPos !== self.position.destination) {
				self.position.destination = newPos;
				// Trigger :change event
				trigger('change');
				if (!renderID) {
					render();
				}

				if (self.options.autoResize) {
					resizeFrame(self.relative.activeSlide, immediate);
				}
			}

			// Reset next cycle timeout
			resetCycle();

			// Synchronize states
			updateRelatives();
			updateButtonsState();
			syncPagesbar();
		}

		/**
		 * Render animation frame.
		 *
		 * @return {Void}
		 */
		function render() {
			// If first render call, wait for next animationFrame
			if (!renderID) {
				renderID = requestAnimationFrame(render);
				if (dragging.released) {
					// Trigger :moveStart event
					trigger('moveStart');
				}
				return;
			}

			// If immediate repositioning is requested, don't animate.
			if (animation.immediate) {
				self.position.current = animation.to;
			}
			// Use tweesing for animations without known end point
			else if (animation.tweesing) {
				animation.tweeseDelta = animation.to - self.position.current;
				// Fuck Zeno's paradox
				if (Math.abs(animation.tweeseDelta) < 0.1) {
					self.position.current = animation.to;
				} else {
					self.position.current += animation.tweeseDelta * (dragging.released ? self.options.dragging.swingSpeed : self.options.dragging.syncSpeed);
				}
			}
			// Use tweening for basic animations with known end point
			else {
				animation.time = Math.min(+new Date() - animation.start, self.options.speed);
				self.position.current = animation.from + animation.delta * jQuery.easing[self.options.easing](animation.time/self.options.speed, animation.time, 0, 1, self.options.speed);
			}

			// If there is nothing more to render break the rendering loop, otherwise request new animation frame.
			if (animation.to === self.position.current) {
				self.position.current = animation.to;
				dragging.tweese = renderID = 0;
			}
			else {
				renderID = requestAnimationFrame(render);
			}

			// Trigger :move event
			trigger('move');

			// Update slideElement position
			if (transform) {
				$slideElement[0].style[transform] = gpuAcceleration + (self.options.navigation.horizontal ? 'translateX' : 'translateY') + '(' + (-self.position.current) + 'px)';
			}
			else {
				$slideElement[0].style[self.options.navigation.horizontal ? 'left' : 'top'] = -Math.round(self.position.current) + 'px';
			}

			// When animation reached the end, and dragging is not active, trigger moveEnd
			if (!renderID && dragging.released) {
				// Set slides covers
				setSlidesCovers();

				// Trigger :moveEnd event
				trigger('moveEnd');
			}
		}

		/**
		 * Synchronizes pagesbar with slideElement.
		 *
		 * @return {Void}
		 */
		function syncPagesbar() {
			if ($pages[0] && last.page !== self.relative.activePage) {
				last.page = self.relative.activePage;
				$pages.removeClass(self.options.classes.activeClass).eq(self.relative.activePage).addClass(self.options.classes.activeClass);
				// Trigger :activePage event
				trigger('activePage', last.page);
			}
		}

		/**
		 * Synchronizes thumbnailsbar.
		 *
		 * @return {Void}
		 */
		function syncThumbnailsbar() {
			var thumbnailsHtml = '';

			// Populate thumbnails array
			$.each(self.slides, function (i, slide) {
				var thumbnail = slide.options.thumbnail || slide.options.cover || 1;

				self.thumbnails.push(thumbnail);
				if ($thumbnailsBar[0] && thumbnail) {
					thumbnailsHtml += self.options.thumbnails.thumbnailBuilder.call(self, i, thumbnail);
				}
			});

			// Thumbnails bar
			if ($thumbnailsBar[0]) {
				$thumbnails = $thumbnailsBar.html(thumbnailsHtml).children();

				if (self.options.thumbnails.thumbnailNav) {
					if (thumbnailNav) {
						thumbnailNav.destroy(1);
					}
					else {
						$.extend(true, thumbnailNavOptions, {
							moveBy: self.options.moveBy,
							speed: self.options.speed,
							easing: self.options.easing,
							startAt: self.options.startAt,

							// Navigation options
							navigation: {
								horizontal: self.options.thumbnails.horizontal,
								navigationType: self.options.thumbnails.thumbnailNav,
								slideSize: self.options.thumbnails.thumbnailSize,
								activateOn: self.options.thumbnails.activateOn
							},

							// Scrolling options
							scrolling: {
								scrollBy: self.options.thumbnails.scrollBy
							},

							// Dragging options
							dragging: {
								mouseDragging: self.options.thumbnails.mouseDragging,
								touchDragging: self.options.thumbnails.touchDragging,
								swingSpeed: self.options.dragging.swingSpeed,
								elasticBounds: self.options.dragging.elasticBounds
							}
						});
						
						thumbnailNav = new mightySlider($thumbnailsBar.parent(), thumbnailNavOptions, {
							active: function(name, index) {
								self.activate(index);
							}
						});
					}

					// Preload thumbnails then initialize thumbnails slider
					if (self.options.thumbnails.preloadThumbnails) {
						preloadimages(self.thumbnails).done(function() {
							thumbnailNav.init();
						});
					}
					else {
						thumbnailNav.init();
					}
				}
			}
		}

		/**
		 * Scale slider
		 *
		 * @return {Void}
		 */
		function scaleSlider() {
			var parentSize = $parent.width(),
				ratio = parentSize / autoScale.width;

			// Remember frame ratio
			frameRatio = ratio;

			$frame.height(autoScale.height * ratio);
		}

		/**
		 * Returns the slide object.
		 *
		 * @param {Mixed} slide
		 *
		 * @return {Object}
		 */
		self.getSlide = function (slide) {
			var index = getIndex(slide);
			return index !== -1 ? self.slides[index] : false;
		};

		/**
		 * Continuous move in a specified direction.
		 *
		 * @param  {Bool} forward True for forward movement, otherwise it'll go backwards.
		 * @param  {Int}  speed   Movement speed in pixels per frame. Overrides options.moveBy value.
		 *
		 * @return {Void}
		 */
		self.moveBy = function (speed) {
			move.speed = speed;
			// If already initiated, or there is nowhere to move, abort
			if (dragging.init || !move.speed || self.position.current === (move.speed > 0 ? self.position.end : self.position.start)) {
				return;
			}
			// Initiate move object
			move.lastTime = +new Date();
			move.startPos = self.position.current;
			// Set dragging as initiated
			continuousInit('button');
			dragging.init = 1;
			// Start movement
			// Trigger :moveStart event
			trigger('moveStart');
			cancelAnimationFrame(continuousID);
			moveLoop();
		};

		/**
		 * Continuous movement loop.
		 *
		 * @return {Void}
		 */
		function moveLoop() {
			// If there is nowhere to move anymore, stop
			if (!move.speed || self.position.current === (move.speed > 0 ? self.position.end : self.position.start)) {
				self.stop();
			}
			// Request new move loop if it hasn't been stopped
			continuousID = dragging.init ? requestAnimationFrame(moveLoop) : 0;
			// Update move object
			move.now = +new Date();
			move.pos = self.position.current + (move.now - move.lastTime) / 1000 * move.speed;
			// Slide
			slideTo(dragging.init ? move.pos : Math.round(move.pos));
			// Normally, this is triggered in render(), but if there
			// is nothing to render, we have to do it manually here.
			if (!dragging.init && self.position.current === self.position.destination) {
				// Trigger :moveEnd event
				trigger('moveEnd');
			}
			// Update times for future iteration
			move.lastTime = move.now;
		}

		/**
		 * Stops continuous movement.
		 *
		 * @return {Void}
		 */
		self.stop = function () {
			if (dragging.source === 'button') {
				dragging.init = 0;
				dragging.released = 1;
			}
		};

		/**
		 * Activate previous slide.
		 *
		 * @param {Bool}  immediate Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.prev = function (immediate) {
			self.activate(self.relative.activeSlide - 1, immediate);
		};

		/**
		 * Activate next slide.
		 *
		 * @param {Bool}  immediate Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.next = function (immediate) {
			self.activate(self.relative.activeSlide + 1, immediate);
		};

		/**
		 * Activate previous page.
		 *
		 * @param {Bool}  immediate Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.prevPage = function (immediate) {
			self.activatePage(self.relative.activePage - 1, immediate);
		};

		/**
		 * Activate next page.
		 *
		 * @param {Bool}  immediate Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.nextPage = function (immediate) {
			self.activatePage(self.relative.activePage + 1, immediate);
		};

		/**
		 * Slide slideElement by amount of pixels.
		 *
		 * @param {Int}  delta     Difference in position. Positive means forward, negative means backward.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.slideBy = function (delta, immediate) {
			if (!delta) {
				return;
			}
			if (navigationType) {
				self[centeredNav ? 'toCenter' : 'toStart'](
					within((centeredNav ? self.relative.centerSlide : self.relative.firstSlide) + self.options.scrolling.scrollBy * delta, 0, self.slides.length)
				);
			} else {
				slideTo(self.position.destination + delta, immediate);
			}
		};

		/**
		 * Animate slideElement to a specific position.
		 *
		 * @param {Int}  position       New position.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.slideTo = function (position, immediate) {
			slideTo(position, immediate);
		};

		/**
		 * Core method for handling `toLocation` methods.
		 *
		 * @param  {String} location
		 * @param  {Mixed}  slide
		 * @param  {Bool}   immediate
		 *
		 * @return {Void}
		 */
		function to(location, slide, immediate) {
			// Optional arguments logic
			if (type(slide) === 'boolean') {
				immediate = slide;
				slide = undefined;
			}

			if (slide === undefined) {
				slideTo(self.position[location], immediate);
			}
			else {
				// You can't align slides to sides of the frame
				// when centered navigation type is enabled
				if (centeredNav && location !== 'center') {
					return;
				}

				var slideObj = self.getSlide(slide);
				if (slideObj) {
					slideTo(slideObj[location], immediate, !centeredNav);
				}
			}
		}

		/**
		 * Animate element or the whole slideElement to the start of the frame.
		 *
		 * @param {Mixed} slide      Slide DOM element, or index starting at 0. Omitting will animate slideElement.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toStart = function (slide, immediate) {
			to('start', slide, immediate);
		};

		/**
		 * Animate element or the whole slideElement to the end of the frame.
		 *
		 * @param {Mixed} slide      Slide DOM element, or index starting at 0. Omitting will animate slideElement.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toEnd = function (slide, immediate) {
			to('end', slide, immediate);
		};

		/**
		 * Animate element or the whole slideElement to the center of the frame.
		 *
		 * @param {Mixed} slide      Slide DOM element, or index starting at 0. Omitting will animate slideElement.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toCenter = function (slide, immediate) {
			to('center', slide, immediate);
		};

		/**
		 * Get the index of an slide in slideElement.
		 *
		 * @param {Mixed} slide     Slide DOM element.
		 *
		 * @return {Int}  Slide     index, or -1 if not found.
		 */
		function getIndex(slide) {
			return type(slide) !== 'undefined' ?
					is_numeric(slide) ?
						slide >= 0 && slide < self.slides.length ? slide : -1 :
						$slides.index(slide) :
					-1;
		}
		// Expose getIndex without lowering the compressibility of it,
		// as it is used quite often throughout mightySlider.
		self.getIndex = getIndex;

		/**
		 * Get index of an slide in slideElement based on a variety of input types.
		 *
		 * @param  {Mixed} slide   DOM element, positive or negative integer.
		 *
		 * @return {Int}   Slide   index, or -1 if not found.
		 */
		function getRelativeIndex(slide) {
			return getIndex(is_numeric(slide) && slide < 0 ? slide + self.slides.length : slide);
		}

		/**
		 * Activates an slide.
		 *
		 * @param  {Mixed} slide       Slide DOM element, or index starting at 0.
		 *
		 * @return {Mixed} Activated   slide index or false on fail.
		 */
		function activate(slide) {
			var index = getIndex(slide);

			if (!navigationType || index < 0) {
				return false;
			}

			// Update classes, last active index, and trigger active event only when there
			// has been a change. Otherwise just return the current active index.
			if (last.active !== index) {
				// Update classes
				$slides.eq(self.relative.activeSlide).removeClass(self.options.classes.activeClass);
				$slides.eq(index).addClass(self.options.classes.activeClass);

				// Clear previous slide captions
				if (!resizeID) {
					clearCaptions(last.active);
				}

				last.active = self.relative.activeSlide = index;

				updateButtonsState();

				// Remove previous media content
				if (!resizeID && mediaEnabled) {
					removeContent();
				}

				// Clear caption timing if available
				if (captionID) {
					captionID = clearTimeout(captionID);
				}

				// Render captions in the current active slide
				if (self.slides[index].captions.length && !resizeID) {
					captionID = setTimeout(function () {
						renderCaptions(index);
						captionID = clearTimeout(captionID);
					}, self.options.speed + 100);
				}

				// Change Hashtag
				if (self.options.deeplinking.linkID && !resizeID && !hashLock && self.initialized) {
					changeHashtag(index);
				}

				// Trigger :active event
				trigger('active', index);
			}

			return index;
		}

		/**
		 * Activates an slide and helps with further navigation when options.navigation.smart is enabled.
		 *
		 * @param {Mixed} slide      Slide DOM element, or index starting at 0.
		 * @param {Bool}  immediate  Whether to reposition immediately in smart navigation.
		 *
		 * @return {Void}
		 */
		self.activate = function (slide, immediate) {
			var index = activate(slide);

			// Smart navigation
			if (self.options.navigation.smart && index !== false) {
				// When centeredNav is enabled, center the element.
				// Otherwise, determine where to position the element based on its current position.
				// If the element is currently on the far end side of the frame, assume that user is
				// moving forward and animate it to the start of the visible frame, and vice versa.
				if (centeredNav) {
					self.toCenter(index, immediate);
				}
				else if (index >= self.relative.lastSlide) {
					self.toStart(index, immediate);
				}
				else if (index <= self.relative.firstSlide) {
					self.toEnd(index, immediate);
				}
				else {
					resetCycle();
				}
			}
		};

		/**
		 * Activates a page.
		 *
		 * @param {Int}  index     Page index, starting from 0.
		 * @param {Bool} immediate Whether to reposition immediately without animation.
		 *
		 * @return {Void}
		 */
		self.activatePage = function (index, immediate) {
			if (is_numeric(index)) {
				slideTo(self.pages[within(index, 0, self.pages.length - 1)], immediate);
			}
		};

		/**
		 * Return relative positions of slides based on their visibility within FRAME.
		 *
		 * @param {Int} slideElementPos Position of slideElement.
		 *
		 * @return {Void}
		 */
		function getRelatives(slideElementPos) {
			slideElementPos = within(is_numeric(slideElementPos) ? slideElementPos : self.position.destination, self.position.start, self.position.end);

			var relatives = {},
				centerOffset = forceCenteredNav ? 0 : frameSize / 2;

			// Determine active page
			for (var p = 0, pl = self.pages.length; p < pl; p++) {
				if (slideElementPos >= self.position.end || p === self.pages.length - 1) {
					relatives.activePage = self.pages.length - 1;
					break;
				}

				if (slideElementPos <= self.pages[p] + centerOffset) {
					relatives.activePage = p;
					break;
				}
			}

			// Relative slide indexes
			var first = false,
				last = false,
				center = false;

			// From start
			for (var i = 0, il = self.slides.length; i < il; i++) {
				// First slide
				if (first === false && slideElementPos <= self.slides[i].start + self.slides[i].half) {
					first = i;
				}

				// Center slide
				if (center === false && slideElementPos <= self.slides[i].center + self.slides[i].half) {
					center = i;
				}

				// Last slide
				if (i === il - 1 || slideElementPos <= self.slides[i].end + self.slides[i].half) {
					last = i;
					break;
				}
			}

			// Safe assignment, just to be sure the false won't be returned
			relatives.firstSlide = is_numeric(first) ? first : 0;
			relatives.centerSlide = is_numeric(center) ? center : relatives.firstSlide;
			relatives.lastSlide = is_numeric(last) ? last : relatives.centerSlide;

			return relatives;
		}

		/**
		 * Update object with relative positions.
		 *
		 * @param {Int} newPos
		 *
		 * @return {Void}
		 */
		function updateRelatives(newPos) {
			$.extend(self.relative, getRelatives(newPos));
		}

		/**
		 * Disable navigation buttons when needed.
		 *
		 * Adds disabledClass, and when the button is <button> or <input>, activates :disabled state.
		 *
		 * @return {Void}
		 */
		function updateButtonsState() {
			var isStart = self.position.destination <= self.position.start,
				isEnd = self.position.destination >= self.position.end,
				slideElementPosState = isStart ? 1 : isEnd ? 2 : 3;

			// Update paging buttons only if there has been a change in slideElement position
			if (last.slideElementPosState !== slideElementPosState) {
				last.slideElementPosState = slideElementPosState;

				$prevPageButton.prop('disabled', isStart).add($backwardButton)[isStart ? 'addClass' : 'removeClass'](self.options.classes.disabledClass);
				$nextPageButton.prop('disabled', isEnd).add($forwardButton)[isEnd ? 'addClass' : 'removeClass'](self.options.classes.disabledClass);
			}

			// Forward & Backward buttons need a separate state caching because we cannot "property disable"
			// them while they are being used, as disabled buttons stop emitting mouse events.
			if (last.fwdbwdState !== slideElementPosState && dragging.released) {
				last.fwdbwdState = slideElementPosState;

				$backwardButton.prop('disabled', isStart);
				$forwardButton.prop('disabled', isEnd);
			}

			// Slide navigation
			var isFirst = self.relative.activeSlide === 0,
				isLast = self.relative.activeSlide >= self.slides.length - 1,
				slidesButtonState = isFirst ? 1 : isLast ? 2 : 3;

			if (last.slidesButtonState !== slidesButtonState) {
				last.slidesButtonState = slidesButtonState;

				$prevButton[isFirst ? 'addClass' : 'removeClass'](self.options.classes.disabledClass).prop('disabled', isFirst);
				$nextButton[isLast ? 'addClass' : 'removeClass'](self.options.classes.disabledClass).prop('disabled', isLast);
			}
		}

		/**
		 * Resume cycling.
		 *
		 * @param {Int} priority Resume pause with priority lower or equal than this. Used internally for pauseOnHover.
		 *
		 * @return {Void}
		 */
		self.resume = function (priority) {
			if (!self.options.cycling.cycleBy || !self.options.cycling.pauseTime || self.options.cycling.cycleBy === 'slides' && !self.slides[0] || priority < self.isPaused) {
				return;
			}

			self.isPaused = 0;

			if (cycleID) {
				cycleID = clearTimeout(cycleID);
			}
			else {
				// Trigger :resume event
				trigger('resume');
			}

			cycleID = setTimeout(function () {
				// Trigger :cycle event
				trigger('cycle');
				switch (self.options.cycling.cycleBy) {
					case 'slides':
						self.activate(self.relative.activeSlide >= self.slides.length - 1 ? 0 : self.relative.activeSlide + 1);
						break;

					case 'pages':
						self.activatePage(self.relative.activePage >= self.pages.length - 1 ? 0 : self.relative.activePage + 1);
						break;
				}
			}, self.options.cycling.pauseTime);
		};

		/**
		 * Pause cycling.
		 *
		 * @param {Int} priority Pause priority. 100 is default. Used internally for pauseOnHover.
		 *
		 * @return {Void}
		 */
		self.pause = function (priority) {
			if (priority < self.isPaused) {
				return;
			}

			self.isPaused = priority || 100;

			if (cycleID) {
				cycleID = clearTimeout(cycleID);
				// Trigger :pause event
				trigger('pause');
			}
		};

		/**
		 * Toggle cycling.
		 *
		 * @return {Void}
		 */
		self.toggleCycling = function () {
			self[cycleID ? 'pause' : 'resume']();
		};

		/**
		 * Enter fullscreen.
		 *
		 * @return {Void}
		 */
		self.enterFullScreen = function () {
			if (!self.isFullScreen) {
				$parent.addClass(self.options.classes.isInFullScreen);

				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen($parent[0]);
				}
				else {
					$win.triggerHandler('resize');
				}
				self.isFullScreen = 1;

				// Trigger :enterFullScreen event
				trigger('enterFullScreen');
			}
		};

		/**
		 * Exit from fullscreen.
		 *
		 * @return {Void}
		 */
		self.exitFullScreen = function () {
			if (self.isFullScreen) {
				$parent.removeClass(self.options.classes.isInFullScreen);

				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.cancelFullScreen($parent[0]);
				}
				else {
					$win.triggerHandler('resize');
				}
				self.isFullScreen = 0;

				// Trigger :exitFullScreen event
				trigger('exitFullScreen');
			}
		};

		/**
		 * Toggle fullscreen.
		 *
		 * @return {Void}
		 */
		self.toggleFullScreen = function () {
			self[self.isFullScreen ? 'exitFullScreen' : 'enterFullScreen']();
		};

		/**
		 * Updates a signle or multiple option values.
		 *
		 * @param {Mixed} name  Name of the option that should be updated, or object that will extend the options.
		 * @param {Mixed} value New option value.
		 *
		 * @return {Void}
		 */
		self.set = function (name, value) {
			if ($.isPlainObject(name)) {
				$.extend(true, self.options, name);
			}
			else if (self.options.hasOwnProperty(name)) {
				self.options[name] = value;
			}

			// Set thumbnails options if thumbnail navigation is available
			if (thumbnailNav) {
				$.extend(true, thumbnailNavOptions, {
					moveBy: self.options.moveBy,
					speed: self.options.speed,
					easing: self.options.easing,
					startAt: self.options.startAt,

					// Navigation options
					navigation: {
						horizontal: self.options.thumbnails.horizontal,
						navigationType: self.options.thumbnails.thumbnailNav,
						slideSize: self.options.thumbnails.thumbnailSize,
						activateOn: self.options.thumbnails.activateOn
					},

					// Scrolling options
					scrolling: {
						scrollBy: self.options.thumbnails.scrollBy
					},

					// Dragging options
					dragging: {
						mouseDragging: self.options.thumbnails.mouseDragging,
						touchDragging: self.options.thumbnails.touchDragging,
						swingSpeed: self.options.dragging.swingSpeed,
						elasticBounds: self.options.dragging.elasticBounds
					}
				});

				thumbnailNav.set(thumbnailNavOptions);
			}

			// Reload
			load();
		};

		/**
		 * Add one or multiple slides to the slideElement end, or a specified position index.
		 *
		 * @param {Mixed} element Node element, or HTML string.
		 * @param {Int}   index   Index of a new slide position. By default slide is appended at the end.
		 *
		 * @return {Void}
		 */
		self.add = function (element, index) {
			var $element = $(element);

			// Insert the element(s)
			if (type(index) === 'undefined' || !self.slides[0]) {
				$element.appendTo($slideElement);
			}
			else if (self.slides.length) {
				$element.insertBefore(self.slides[index].element);
			}

			// Adjust the activeSlide index
			if (index <= self.relative.activeSlide) {
				last.active = self.relative.activeSlide += $element.length;
			}

			// Mark as inserted for load new slide content
			inserted = 1;

			// Reload
			load();

			// Unmark inserted
			inserted = 0;
		};

		/**
		 * Remove an slide from slideElement.
		 *
		 * @param {Mixed} element Slide index, or DOM element.
		 * @param {Int}   index   Index of a new slide position. By default slide is appended at the end.
		 *
		 * @return {Void}
		 */
		self.remove = function (element) {
			var index = getRelativeIndex(element);

			if (index > -1) {
				// Remove the element
				$slides.eq(index).remove();

				// If the current slide is being removed, activate new one after reload
				var reactivate = index === self.relative.activeSlide && !(forceCenteredNav && self.options.navigation.activateMiddle);

				// Adjust the activeSlide index
				if (index < self.relative.activeSlide || self.relative.activeSlide >= self.slides.length - 1) {
					last.active = --self.relative.activeSlide;
				}

				// Reload
				load();

				// Activate new slide at the removed position if the current active got removed
				if (reactivate) {
					self.activate(self.relative.activeSlide);
				}
			}
		};

		/**
		 * Helps re-arranging slides.
		 *
		 * @param  {Mixed} slide     Slide DOM element, or index starting at 0. Use negative numbers to select slides from the end.
		 * @param  {Mixed} position Slide insertion anchor. Accepts same input types as slide argument.
		 * @param  {Bool}  after    Insert after instead of before the anchor.
		 *
		 * @return {Void}
		 */
		function move(slide, position, after) {
			slide = getRelativeIndex(slide);
			position = getRelativeIndex(position);

			// Move only if there is an actual change requested
			if (slide > -1 && position > -1 && slide !== position && (!after || position !== slide - 1) && (after || position !== slide + 1)) {
				$slides.eq(slide)[after ? 'insertAfter' : 'insertBefore'](self.slides[position].element);

				var shiftStart = slide < position ? slide : (after ? position : position - 1),
					shiftEnd = slide > position ? slide : (after ? position + 1 : position),
					shiftsUp = slide > position;

				// Update activeSlide index
				if (slide === self.relative.activeSlide) {
					last.active = self.relative.activeSlide = after ? (shiftsUp ? position + 1 : position) : (shiftsUp ? position : position - 1);
				}
				else if (self.relative.activeSlide > shiftStart && self.relative.activeSlide < shiftEnd) {
					last.active = self.relative.activeSlide += shiftsUp ? 1 : -1;
				}

				// Reload
				load();
			}
		}

		/**
		 * Move slide after the target anchor.
		 *
		 * @param  {Mixed} slide     Slide to be moved. Can be DOM element or slide index.
		 * @param  {Mixed} position Target position anchor. Can be DOM element or slide index.
		 *
		 * @return {Void}
		 */
		self.moveAfter = function (slide, position) {
			move(slide, position, 1);
		};

		/**
		 * Move slide before the target anchor.
		 *
		 * @param  {Mixed} slide     Slide to be moved. Can be DOM element or slide index.
		 * @param  {Mixed} position Target position anchor. Can be DOM element or slide index.
		 *
		 * @return {Void}
		 */
		self.moveBefore = function (slide, position) {
			move(slide, position);
		};

		/**
		 * Registers callbacks to be executed only once.
		 *
		 * @param  {Mixed} name  Event name, or callbacks map.
		 * @param  {Mixed} fn    Callback, or an array of callback functions.
		 *
		 * @return {Void}
		 */
		self.one = function (name, fn) {
			function proxy() {
				fn.apply(self, arguments);
				self.off(name, proxy);
			}
			self.on(name, proxy);
		};

		/**
		 * Registers callbacks.
		 *
		 * @param  {Mixed} name  Event name, or callbacks map.
		 * @param  {Mixed} fn    Callback, or an array of callback functions.
		 *
		 * @return {Void}
		 */
		self.on = function (name, fn) {
			// Callbacks map
			if (type(name) === 'object') {
				for (var key in name) {
					if (name.hasOwnProperty(key)) {
						self.on(key, name[key]);
					}
				}
			// Callback
			}
			else if (type(fn) === 'function') {
				var names = name.split(' ');
				for (var n = 0, nl = names.length; n < nl; n++) {
					callbacks[names[n]] = callbacks[names[n]] || [];
					if (callbackIndex(names[n], fn) === -1) {
						callbacks[names[n]].push(fn);
					}
				}
			// Callbacks array
			}
			else if (type(fn) === 'array') {
				for (var f = 0, fl = fn.length; f < fl; f++) {
					self.on(name, fn[f]);
				}
			}
		};

		/**
		 * Remove one or all callbacks.
		 *
		 * @param  {String} name Event name.
		 * @param  {Mixed}  fn   Callback, or an array of callback functions. Omit to remove all callbacks.
		 *
		 * @return {Void}
		 */
		self.off = function (name, fn) {
			if (fn instanceof Array) {
				for (var f = 0, fl = fn.length; f < fl; f++) {
					self.off(name, fn[f]);
				}
			}
			else {
				var names = name.split(' ');
				for (var n = 0, nl = names.length; n < nl; n++) {
					callbacks[names[n]] = callbacks[names[n]] || [];
					if (type(fn) === 'undefined') {
						callbacks[names[n]].length = 0;
					}
					else {
						var index = callbackIndex(names[n], fn);
						if (index !== -1) {
							callbacks[names[n]].splice(index, 1);
						}
					}
				}
			}
		};

		/**
		 * Returns callback array index.
		 *
		 * @param  {String}   name Event name.
		 * @param  {Function} fn   Function
		 *
		 * @return {Int} Callback array index, or -1 if isn't registered.
		 */
		function callbackIndex(name, fn) {
			for (var i = 0, l = callbacks[name].length; i < l; i++) {
				if (callbacks[name][i] === fn) {
					return i;
				}
			}
			return -1;
		}

		/**
		 * Reset next cycle timeout.
		 *
		 * @return {Void}
		 */
		function resetCycle() {
			if (dragging.released && !self.isPaused) {
				self.resume();
			}
		}

		/**
		 * Keeps track of a dragging delta history.
		 *
		 * @return {Void}
		 */
		function draggingHistoryTick() {
			// Looking at this, I know what you're thinking :) But as we need only 4 history states, doing it this way
			// as opposed to a proper loop is ~25 bytes smaller (when minified with GCC), a lot faster, and doesn't
			// generate garbage. The loop version would create 2 new variables on every tick. Unexaptable!
			dragging.history[0] = dragging.history[1];
			dragging.history[1] = dragging.history[2];
			dragging.history[2] = dragging.history[3];
			dragging.history[3] = dragging.delta;
		}

		/**
		 * Initialize continuous movement.
		 *
		 * @return {Void}
		 */
		function continuousInit(source) {
			dragging.released = 0;
			dragging.source = source;
			dragging.slideElement = source === 'slideElement';
		}

		/**
		 * Dragging initiator.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function dragInit(event) {
			// Ignore when already in progress
			if (dragging.init || mediaEnabled || isInteractive(event.target)) {
				return;
			}

			var isTouch = event.type === 'touchstart',
				source = event.data.source;

			// slideElement dragging conditions
			if (!(isTouch ? self.options.dragging.touchDragging : self.options.dragging.mouseDragging && event.which < 2)) {
				return;
			}

			if (!isTouch) {
				stopDefault(event, 1);
			}

			// Reset dragging object
			continuousInit(source);

			// Properties used in dragHandler
			dragging.init = 1;
			dragging.$source = $(event.target);
			dragging.touch = isTouch;
			dragging.pointer = isTouch ? event.originalEvent.touches[0] : event;
			dragging.initX = dragging.pointer.pageX;
			dragging.initY = dragging.pointer.pageY;
			dragging.initPos = self.position.current;
			dragging.start = +new Date();
			dragging.time = 0;
			dragging.path = 0;
			dragging.delta = 0;
			dragging.locked = 0;
			dragging.history = [0, 0, 0, 0];
			dragging.pathToLock = isTouch ? 30 : 10;
			dragging.initLoc = dragging[self.options.navigation.horizontal ? 'initX' : 'initY'];
			dragging.deltaMin = -dragging.initLoc;
			dragging.deltaMax = document[self.options.navigation.horizontal ? 'width' : 'height'] - dragging.initLoc;

			// Bind dragging events
			$doc.on(isTouch ? dragTouchEvents : dragMouseEvents, dragHandler);

			// Pause ongoing cycle
			self.pause(1);

			// Add dragging class
			$slideElement.addClass(self.options.classes.draggedClass);

			// Trigger :moveStart event
			trigger('moveStart');

			// Keep track of a dragging path history. This is later used in the
			// dragging release swing calculation when dragging slideElement.
			historyID = setInterval(draggingHistoryTick, 10);
		}

		/**
		 * Handler for dragging slideElement.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function dragHandler(event) {
			dragging.released = event.type === 'mouseup' || event.type === 'touchend';
			dragging.pointer = dragging.touch ? event.originalEvent[dragging.released ? 'changedTouches' : 'touches'][0] : event;
			dragging.pathX = dragging.pointer.pageX - dragging.initX;
			dragging.pathY = dragging.pointer.pageY - dragging.initY;
			dragging.path = Math.sqrt(Math.pow(dragging.pathX, 2) + Math.pow(dragging.pathY, 2));
			dragging.delta = within(self.options.navigation.horizontal ? dragging.pathX : dragging.pathY, dragging.deltaMin, dragging.deltaMax);

			if (!dragging.locked && dragging.path > dragging.pathToLock) {
				dragging.locked = 1;
				if (self.options.navigation.horizontal ? Math.abs(dragging.pathX) < Math.abs(dragging.pathY) : Math.abs(dragging.pathX) > Math.abs(dragging.pathY)) {
					// If path has reached the pathToLock distance, but in a wrong direction, cancel dragging
					dragging.released = 1;
				} else if (dragging.slideElement) {
					// Disable click on a source element, as it is unwelcome when dragging SLIDEELEMENT
					dragging.$source.on(clickEvent, disableOneEvent);
				}
			}

			// Cancel dragging on release
			if (dragging.released) {
				if (!dragging.touch) {
					stopDefault(event);
				}

				dragEnd();

				// Adjust path with a swing on mouse release
				if (self.options.dragging.releaseSwing && dragging.slideElement) {
					dragging.swing = (dragging.delta - dragging.history[0]) *self.options.dragging.swingSync;
					dragging.delta += dragging.swing;
					dragging.tweese = Math.abs(dragging.swing) > 10;
				}
			} else {
				stopDefault(event);
			}

			slideTo(Math.round(dragging.initPos - dragging.delta));
		}

		/**
		 * Stops dragging and cleans up after it.
		 *
		 * @return {Void}
		 */
		function dragEnd() {
			clearInterval(historyID);
			$doc.off(dragging.touch ? dragTouchEvents : dragMouseEvents, dragHandler);
			$slideElement.removeClass(self.options.classes.draggedClass);

			// Resume ongoing cycle
			self.resume(1);

			// Normally, this is triggered in render(), but if there
			// is nothing to render, we have to do it manually here.
			if (self.position.current === self.position.destination && dragging.init) {
				trigger('moveEnd');
			}

			dragging.init = 0;
		}

		/**
		 * Check whether element is interactive.
		 *
		 * @return {Boolean}
		 */
		function isInteractive(element) {
			return ~$.inArray(element.nodeName, interactiveElements) || $(element).is(self.options.dragging.interactive);
		}

		/**
		 * Continuous movement cleanup on mouseup.
		 *
		 * @return {Void}
		 */
		function movementReleaseHandler() {
			self.stop();
			$doc.off('mouseup', movementReleaseHandler);
		}

		/**
		 * Buttons navigation handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function buttonsHandler(event) {
			stopDefault(event);
			switch (this) {
				case $forwardButton[0]:
				case $backwardButton[0]:
					self.moveBy($forwardButton.is(this) ? self.options.moveBy : -self.options.moveBy);
					$doc.on('mouseup', movementReleaseHandler);
					break;

				case $prevButton[0]:
					self.prev();
					break;

				case $nextButton[0]:
					self.next();
					break;

				case $prevPageButton[0]:
					self.prevPage();
					break;

				case $nextPageButton[0]:
					self.nextPage();
					break;

				case $fullScreenButton[0]:
					self.toggleFullScreen();
					break;
			}
		}

		/**
		 * Mouse wheel delta normalization.
		 *
		 * @param  {Event} event
		 *
		 * @return {Int}
		 */
		function normalizeWheelDelta(event) {
			// event.deltaY needed only for compatibility with jQuery mousewheel plugin in FF & IE
			scrolling.curDelta = event.wheelDelta ? -event.wheelDelta / 120 : (event.detail || event.deltaY) / 3;
			if (!navigationType) {
				return scrolling.curDelta;
			}
			time = +new Date();
			if (scrolling.last < time - scrolling.resetTime) {
				scrolling.delta = 0;
			}
			scrolling.last = time;
			scrolling.delta += scrolling.curDelta;
			if (Math.abs(scrolling.delta) < 1) {
				scrolling.finalDelta = 0;
			} else {
				scrolling.finalDelta = Math.round(scrolling.delta / 1);
				scrolling.delta %= 1;
			}
			return scrolling.finalDelta;
		}

		/**
		 * Mouse scrolling handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function scrollHandler(event) {
			// Ignore if there is no scrolling to be done
			if (!self.options.scrolling.scrollBy || self.position.start === self.position.end) {
				return;
			}
			stopDefault(event, 1);
			self.slideBy(self.options.scrolling.scrollBy * normalizeWheelDelta(event.originalEvent));
		}

		/**
		 * Keyboard input handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function keyboardHandler(event) {
			if (!self.options.navigation.keyboardNavBy) {
				return;
			}

			switch (event.which) {
				// Left or Up
				case self.options.navigation.horizontal ? 37 : 38:
					stopDefault(event);
					self[self.options.navigation.keyboardNavBy === 'pages' ? 'prevPage' : 'prev']();
					break;

				// Right or Down
				case self.options.navigation.horizontal ? 39 : 40:
					stopDefault(event);
					self[self.options.navigation.keyboardNavBy === 'pages' ? 'nextPage' : 'next']();
					break;
			}
		}

		/**
		 * Slides icons click handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function iconsHandler(event) {
			var $this = $(this);

			if ($this.hasClass(minnamespace + 'Close')) {
				// Remove media content
				removeContent();
			}
			else {
				// Insert media content
				insertContent($this.parent()[0]);
			}

			return false;
		}

		/**
		 * Window resize handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function winResizeHandler() {
			if (resizeID) {
				resizeID = clearTimeout(resizeID);
			}

			resizeID = setTimeout(function () {
				self.reload(true);

				if (thumbnailNav) {
					thumbnailNav.reload(true);
				}
				// Trigger :resize event
				trigger('resize');
				resizeID = clearTimeout(resizeID);
			}, 100);
		}

		/**
		 * Window fullscreen change handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function winfullScreenHandler() {
			if (!fullScreenApi.isFullScreen()) {
				self.exitFullScreen();
			}
		}

		/**
		 * Click on slide activation handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function activateHandler() {
			/*jshint validthis:true */
			// Ignore clicks on interactive elements.
			if (isInteractive(this)) {
				event.stopPropagation();
				return;
			}
			// Accept only events from direct slideElement children.
			if (this.parentNode === $slideElement[0]) {
				self.activate(this);
			}
		}

		/**
		 * Click on page button handler.
		 *
		 * @param {Event} event
		 *
		 * @return {Void}
		 */
		function activatePageHandler() {
			/*jshint validthis:true */
			// Accept only events from direct pages bar children.
			if (this.parentNode === $pagesBar[0]) {
				self.activatePage($pages.index(this));
			}
		}

		/**
		 * Pause on hover handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function pauseOnHoverHandler(event) {
			if (self.options.cycling.pauseOnHover) {
				self[event.type === 'mouseenter' ? 'pause' : 'resume'](2);
			}
		}

		/**
		 * Trigger callbacks for event.
		 *
		 * @param  {String} name Event name.
		 * @param  {Mixed}  argX Arguments passed to callbacks.
		 *
		 * @return {Void}
		 */
		function trigger(name, arg1) {
			if (callbacks[name]) {
				l = callbacks[name].length;
				// Callbacks will be stored and executed from a temporary array to not
				// break the execution queue when one of the callbacks unbinds itself.
				tmpArray.length = 0;
				for (i = 0; i < l; i++) {
					tmpArray.push(callbacks[name][i]);
				}
				// Execute the callbacks
				for (i = 0; i < l; i++) {
					tmpArray[i].call(self, name, arg1);
				}
			}
		}

		/**
		 * Get slide size in pixels.
		 *
		 * @param {Object}   $slide    jQuery object with element.
		 * @param {Mixed}    property
		 *
		 * @return {Int}
		 */
		function getSlideSize($slide, property) {
			return parseInt(property ?
					property.indexOf('%') !== -1 ? percentToValue(property.replace('%', ''), frameSize) : property :
					$slide[self.options.navigation.horizontal ? 'outerWidth' : 'outerHeight'](true));
		}

		/**
		 * Get slides between a rane.
		 *
		 * @param {Number}   start
		 * @param {Number}   end
		 *
		 * @return {Array}
		 */
		function slidesInRange(start, end) {
			var slides = [];

			$.each(self.slides, function(i, slide) {
				var slideStart = slide.start,
					slideEnd = slideStart + slide.size;

				if ((slideStart >= start && slideEnd <= end) || (slideEnd >= start && slideStart <= start) || (slideStart <= end && slideEnd >= end)) {
					slides.push(slide);
				}
			});
			
			return slides;
		}

		/**
		 * Set slides covers.
		 *
		 * @return {Void}
		 */
		function setSlidesCovers() {
			var start = within(self.position.current, self.position.start, self.position.end + frameSize),
				end = within(self.position.current + frameSize, self.position.start, self.position.end + frameSize),
				slides = slidesInRange(start, end);

			function setCover(obj) {
				if (obj.cover) {
					// Show loader
					var loader = showLoader(obj.SlideEl);

					// Preload the cover
					preloadimages(obj.cover).done(function(img) {
						var $cover = $('<div class="' + minnamespace + 'Cover"><img src="' + obj.cover + '" ondragstart="return false" /></div>'),
						$image = $('img', $cover);

						$cover.css({ width: '100%', height: '100%', 'overflow': 'hidden' });

						// Hide loader
						hideLoader(loader);

						// Store cover natural width and height
						$image.data({ naturalWidth: img[0].width, naturalHeight: img[0].height });

						// Insert the cover into slide
						obj.SlideEl.prepend($cover);

						// Reposition slide contents
						repositionCovers(obj.slide);

						// Trigger :coverLoaded event
						trigger('coverLoaded', obj.index);
					});
				}
			}

			function eachHandler(i, slide) {
				if (slide.type === 'content') {
					return true;
				}
				
				var $slide = $(slide.element),
					processed = $slide.data('processed');

				if (processed) {
					return true;
				}

				var cover = slide.options.cover || parsePhotoURL(slide.options.video) && slide.options.video,
					parsed = parsePhotoURL(cover);

				// If cover needed to be parsed
				if (parsed) {
					// Show loader
					var loader = showLoader($slide);

					// Parse OEmbed URL via AJAX
					doAjax(parsed.oembed, function(data) {
						// Hide loader
						hideLoader(loader);

						if (data) {
							// Set cover URL
							cover = data[parsed.inJSON];

							// If replace is needed
							if (parsed.replace) {
								cover = cover.replace(parsed.replace.from, parsed.replace.to);
							}

							// Normalize cover URL
							slide.options.cover = cover;

							// Set cover image
							setCover({
								cover: cover,
								slide: slide,
								SlideEl: $slide,
								index: i
							});
						}
					});
				}
				else {
					// Set cover image
					setCover({
						cover: cover,
						slide: slide,
						SlideEl: $slide,
							index: i
					});
				}

				$slide.data('processed', 1);
			}

			$.each(slides, eachHandler);
		}

		/**
		 * Set slides icons.
		 *
		 * @return {Void}
		 */
		function setSlidesIcons() {
			function eachHandler(i, slide) {
				if (slide.type === 'content') {
					return true;
				}

				var $slide = $(slide.element),
					icon = slide.options.icon || slide.type;

				if ($('.' + minnamespace + ucfirst(icon), $slide)[0]) {
					return true;
				}

				// Set slide icon if slide type is not content and image
				if (icon !== 'content' && icon !== 'image') {
					var $icon = createSlideIcon($slide, icon);

					// Slides icons click event
					if (icon !== 'link') {
						$icon.bind(clickEvent, iconsHandler);
					}
				}
			}

			$.each(self.slides, eachHandler);
		}

		/**
		 * Create slide icon.
		 *
		 * @param {Object}   $slide    jQuery object with element.
		 * @param {String}   icon
		 *
		 * @return {Object}    jQuery object with element.
		 */
		function createSlideIcon($slide, icon) {
			var iconName = minnamespace + ucfirst(icon);

			// Return blank if icon is exists
			if ($('.' + iconName, $slide).length) {
				return;
			}

			var $icon = $('<a class="' + minnamespace + 'Icon ' + iconName + '"></a>');

			if (icon === 'link') {
				var index = getIndex($slide),
					slide = self.slides[index],
					href = slide.options.link.url && absolutizeURI(slide.options.link.url) || window.location.href,
					target = slide.options.link.target || null,
					attributes = $.extend(true, { 'href': href, 'target': target }, slide.options.link);

					if (attributes.url) {
						delete attributes.url;
					}

				$icon[$.fn.attr ? 'attr' : 'prop'](attributes);
			}

			// Append icon into $slide
			$slide.append($icon);

			return $icon;
		}

		/**
		 * Insert slide media content.
		 *
		 * @param {Mixed}     slide    Slide DOM element, or index starting at 0.
		 *
		 * @return {Void}
		 */
		function insertContent(slide) {
			var index = getIndex(slide);

			// Remove previous media content
			if (mediaEnabled) {
				removeContent();
			}

			// Reset and get slide data
			slide = self.slides[index];

			var $slide = $(slide.element);

			$slide.children().hide();

			// Generate media content
			var mediaContent = generateContent(index),
				closeButton = $('<a class="' + minnamespace + 'Icon ' + minnamespace + 'Close"></a>');

			// Insert mediaContent and closeButton
			$slide.prepend(mediaContent).prepend(closeButton);

			// Bind closeButton handler
			closeButton.bind(clickEvent, iconsHandler);

			$parent.addClass(minnamespace + 'Media');

			// Clear captions
			clearCaptions(self.relative.activeSlide);

			// Pause cycling
			self.pause();

			mediaEnabled = mediaContent;
		}

		/**
		 * Remove slide media content.
		 *
		 * @return {Void}
		 */
		function removeContent() {
			var $slide = mediaEnabled.parent();

			// Remove media content from DOM
			mediaEnabled.remove();
			mediaEnabled = null;
			$('.' + minnamespace + 'Close', $slide).unbind(clickEvent).remove();

			$parent.removeClass(minnamespace + 'Media');

			// Show slide childs
			$slide.children().show();

			// Resume cycling
			self.resume();

			// Render captions
			if (!captionID) {
				renderCaptions(self.relative.activeSlide);
			}
		}

		/**
		 * Generate slide media content.
		 *
		 * @param {Mixed}     slide    Slide DOM element, or index starting at 0.
		 *
		 * @return {Object}            jQuery DOM element
		 */
		function generateContent(slide) {
			var index = getIndex(slide);

			// Reset and get slide data
			slide = self.slides[index];

			// Get slide type
			var type = slide.type,
				slideOptions = slide.options,
				URL = slideOptions.mp4 || slideOptions.video || slideOptions.source,
				$content;

			switch (type) {
				case 'video':
					var extension = pathinfo(URL, 'PATHINFO_EXTENSION'),
						videoFrame = slideOptions.videoFrame,
						mp4 = slideOptions.mp4,
						webm = slideOptions.webm,
						ogv = slideOptions.ogv,
						localVideo = mp4 || webm || ogv || 0,
						parsedVideo = parseVideoURL(URL);

					// Normalize extension
					extension = ($.isPlainObject(extension)) ? null : extension.toLowerCase();

					// Check video URL, is video file?
					if ((/^(avi|mov|mpg|mpeg|mp4|webm|ogv|3gp|m4v)$/i).test(extension) || videoFrame || mp4 || webm || ogv) {
						// Use videoFrame if available
						if (videoFrame || (localVideo && self.options.videoFrame)) {
							var source = videoFrame || self.options.videoFrame,
							mediaFiles = [];

							// Add MP4 Video to mediaFiles
							if (mp4) {
								mediaFiles.push({
									type: videoTypes['mp4'],
									src: absolutizeURI(mp4)
								});
							}

							// Add WebM Video to mediaFiles
							if (webm) {
								mediaFiles.push({
									type: videoTypes['webm'],
									src: absolutizeURI(webm)
								});
							}

							// Add OGV Video to mediaFiles
							if (ogv) {
								mediaFiles.push({
									type: videoTypes['ogv'],
									src: absolutizeURI(ogv)
								});
							}

							if (mediaFiles.length > 0) {
								source += (parse_url(source, 'QUERY') ? '&' : '?') + minnamespace.toLowerCase() + 'videos=' + rawurlencode(JSON.stringify(mediaFiles));

								// Set cover image to the video frame
								if (slideOptions.cover) {
									source += '&' + minnamespace.toLowerCase() + 'cover=' + rawurlencode(absolutizeURI(slideOptions.cover));
								}
							}

							$content = $(createElement('iframe', { src: source, scrolling: 'no' }));
						}

						// Check that HTML5 can play this type of video file
						else if (canPlayType(videoTypes[extension]) || (mp4 && canPlayType(videoTypes['mp4'])) || (webm && canPlayType(videoTypes['webm'])) || (ogv && canPlayType(videoTypes['ogv']))) {
							var innerTags = [
								{
									name: 'source',
									type: mp4 && videoTypes['mp4'] || videoTypes[extension],
									src: URL
								}
							];

							// Add WebM Video to HTML5 video tag
							if (webm) {
								innerTags.push({
									name: 'source',
									type: videoTypes['webm'],
									src: webm
								});
							}

							// Add ogv Video to HTML5 video tag
							if (ogv) {
								innerTags.push({
									name: 'source',
									type: videoTypes['ogv'],
									src: ogv
								});
							}

							// Add HTML5 Video other inner tags
							if (slideOptions.HTML5Video) {
								$.each(slideOptions.HTML5Video, function(key, value) {
									innerTags.push($.extend({}, {
										name: key
									}, value));
								});
							}

							$content = $(createElement('video', {}, innerTags));
						}

						// Fallback to QuickTime to play video file
						else if (browserPlugins.quicktime) {
							$content = $(QT_GenerateOBJECTText(URL,'100%','100%','','SCALE','aspect','AUTOPLAY','true','LOOP','false'));
						}
						// Warn user that video is not supported
						else {
							throw "You need to install QuickTime for playing this video!";
						}
					}
					// Check video URL, is video from social video sharing?
					else if (parsedVideo) {
						$content = $(createElement(parsedVideo.type, { src: parsedVideo.source, scrolling: 'no' }));
					}
					// Warn user that video is not supported
					else {
						throw "Video not supported!";
					}
					break;

				case 'iframe':
					$content = $(createElement('iframe', { src: URL }));
					break;

				case 'flash':
					$content = $(createElement('embed', { src: URL, flashvars: slideOptions.flashvars || null }));
					break;
			}

			return $content;
		}

		/**
		 * Reposition slides covers.
		 *
		 * @param {Object}     slide    Slide data object.
		 *
		 * @return {Void}
		 */
		function repositionCovers(slide) {
			var newSlides = (slide) ? [slide] : self.slides;

			function eachHandler(i, slide) {
				if (slide.type === 'content') {
					return true;
				}

				var $slide = $(slide.element),
					$cover = $('.' + minnamespace + 'Cover img', $slide);

				if (!$cover[0]) {
					return true;
				}

				var viewport = (slide.options.viewport || self.options.viewport).toLowerCase(),
					coverData = $cover.data(),
					slideWidth = $slide.width(),
					slideHeight = $slide.height(),
					width = slideWidth,
					height = slideHeight,
					marginLeft = 0,
					marginTop = 0;

				if (viewport === 'fit') {
					var newDimensions = calculateDimensions(width, height, coverData.naturalWidth, coverData.naturalHeight);

					width = newDimensions.width,
					height = newDimensions.height;
				}
				else if (viewport === 'fill') {
					height = (width / coverData.naturalWidth) * coverData.naturalHeight;

					if (height < slideHeight) {
						width = (slideHeight / coverData.naturalHeight) * coverData.naturalWidth,
						height = slideHeight;
					}
				}
				else if (viewport === 'center') {
					var newDimensions = calculateDimensions(width, height, coverData.naturalWidth, coverData.naturalHeight, 1);

					width = coverData.naturalWidth,
					height = coverData.naturalHeight;
				}

				marginTop = ((slideHeight > height) ? slideHeight - height : -(height - slideHeight)) / 2,
				marginLeft = ((slideWidth > width) ? slideWidth - width : -(width - slideWidth)) / 2;
				
				$cover.css({ width: width, height: height, marginTop: marginTop, marginLeft: marginLeft });
			}

			$.each(newSlides, eachHandler);
		}

		/**
		 * Resize frame equal to slide size.
		 *
		 * @param  {Mixed}   slide        Slide DOM element, or index starting at 0.
		 * @param  {Bool}    immediate    Resize immediately without an animation.
		 *
		 * @return {Void}
		 */
		function resizeFrame(slide, immediate) {
			var index = getIndex(slide),
			slideSize = $(self.slides[index].element)[self.options.navigation.horizontal ? 'outerHeight' : 'outerWidth'](),
			properties = {};

			properties[self.options.navigation.horizontal ? 'height' : 'width'] = slideSize;

			$frame.stop().animate(properties, immediate ? 0 : self.options.speed, self.options.easing);
		}

		/**
		 * Normalize slider global elements.
		 *
		 * @return {Void}
		 */
		function normalizeElements() {
			// Normalizing $thumbnailsBar if thumbnails available in commands options but thumbnails bar DOM element is not available
			if (self.options.commands.thumbnails && !$thumbnailsBar[0]) {
				// Create $thumbnailsBar DOM element
				$thumbnailsBar = $('<ul></ul>');

				// Append thumbnails into $parent
				$parent.append($('<div class="' + minnamespace + 'Thumbnails"></div>').html($thumbnailsBar));
			}

			// Normalizing $pagesBar if pages available in commands options but pages bar DOM element is not available
			if (self.options.commands.pages && !$pagesBar[0]) {
				// Create $pagesBar DOM element
				$pagesBar = $('<ul class="' + minnamespace + 'Pages"></ul>');

				// Append pages into $parent
				$parent.append($pagesBar);
			}

			// Normalizing $nextPageButton if buttons available in commands options but $nextPageButton DOM element is not available
			if (self.options.commands.buttons && navigationType && !$nextPageButton[0]) {
				// Create $nextPageButton DOM element
				$nextPageButton = $('<a class="' + minnamespace + 'Buttons ' + minnamespace + 'Next"></a>');

				// Append $nextPageButton into $parent
				$parent.prepend($nextPageButton);
			}

			// Normalizing $prevPageButton if buttons available in commands options but $prevPageButton DOM element is not available
			if (self.options.commands.buttons && navigationType && !$prevPageButton[0]) {
				// Create $prevPageButton DOM element
				$prevPageButton = $('<a class="' + minnamespace + 'Buttons ' + minnamespace + 'Prev"></a>');

				// Append $prevPageButton into $parent
				$parent.prepend($prevPageButton);
			}

			// Normalizing $forwardButton if buttons available in commands options but $forwardButton DOM element is not available
			if (self.options.commands.buttons && !navigationType && !$forwardButton[0]) {
				// Create $forwardButton DOM element
				$forwardButton = $('<a class="' + minnamespace + 'Buttons ' + minnamespace + 'Next"></a>');

				// Append $forwardButton into $parent
				$parent.prepend($forwardButton);
			}

			// Normalizing $backwardButton if buttons available in commands options but $backwardButton DOM element is not available
			if (self.options.commands.buttons && !navigationType && !$backwardButton[0]) {
				// Create $backwardButton DOM element
				$backwardButton = $('<a class="' + minnamespace + 'Buttons ' + minnamespace + 'Prev"></a>');

				// Append $backwardButton into $parent
				$parent.prepend($backwardButton);
			}
		}

		/**
		 * Render captions.
		 *
		 * @param {Object}     slide       Slide DOM element, or index starting at 0.
		 *
		 * @return {Void}
		 */
		function renderCaptions(slide) {
			var index = getIndex(slide),
				slide = self.slides[index],
				$slide = $(slide.element),
				captions = slide.captions;

			function eachHandler(i, caption) {
				var $caption = $(caption.element),
					captionData = $caption.data(minnamespace + 'styles');

				// Add animation frames to captionHistory
				captionHistory[i] = {
					frames: caption.animation.length,
					timeOut: null
				};

				// Show caption & set necessary caption styles
				var css = { 'position': 'absolute' };
				//css[transform] = gpuAcceleration;
				$caption.show().addClass(self.options.classes.showedCaptionsClass).css(css);

				if (!captionData) {
					captionData = getCaptionStyles($caption);
					$caption.data(minnamespace + 'styles', captionData);
				}

				// Set necessary caption styles
				if (self.options.autoScale) {
					css = $.extend({}, css, normalizeStyles(captionData, captionResponsiveStyles, frameRatio));
					$caption.css(css);
				}

				// Animate the caption
				animateCaption($slide, $caption, i);
			}

			$.each(captions, eachHandler);
		}

		/**
		 * Clear captions.
		 *
		 * @param {Mixed} slide       Slide DOM element, or index starting at 0.
		 *
		 * @return {Void}
		 */
		function clearCaptions(slide) {
			var index = getIndex(slide);

			if (self.slides[index] && self.slides[index].captions.length) {
				$slides.eq(index).find('.' +  minnamespace + 'Caption').stop().removeAttr('style').hide().removeClass(self.options.classes.showedCaptionsClass);

				// Clear captionHistory timeout`s
				$.each(captionHistory, function (i, history) {
					clearTimeout(history.timeOut);
				});

				// Reset captions animation history
				captionHistory = [];
			}
		}

		/**
		 * Animate caption.
		 *
		 * @param {Object}     $slide
		 * @param {Object}     $caption
		 * @param {Number}     i
		 * @param {Boolean}    repeated
		 *
		 * @return {Void}
		 */
		function animateCaption($slide, $caption, i, repeated) {
			var slide = self.slides[self.relative.activeSlide],
				caption = slide.captions[i],
				options = caption.options,
				startAt = repeated && options.startAtOnRepeat || 0;

			if(startAt && caption.animation.length === captionHistory[i].frames) {
				captionHistory[i].frames = caption.animation.length - startAt;
			}
				
			var animationFrame = caption.animation.length - captionHistory[i].frames,
				animation = caption.animation[animationFrame] || {},
				style = animation.style && $.extend({}, animation.style, normalizeStyles(animation.style, captionResponsiveStyles, frameRatio)) || {};

			captionHistory[i].timeOut = setTimeout(function () {
				$caption.stop().animate(style, animation.speed || 0, animation.easing || 'swing', function () {
					captionHistory[i].frames--;

					if (captionHistory[i].frames > 0 || options.loop) {
						// Handle the loop
						if (options.loop && captionHistory[i].frames === 0) {
							captionHistory[i].frames = caption.animation.length;

							repeated = 1;
						}

						// Animate the caption
						animateCaption($slide, $caption, i, repeated);
					}
				});
			}, (repeated && options.dontDelayOnRepeat && animationFrame === startAt) ? 0 : animation.delay || 0);
		}

		/**
		 * Change Hashtag.
		 *
		 * @param {Number}  index
		 *
		 * @return {Void}
		 */
		function changeHashtag(index) {
			var slide = self.slides[index];

			hashLock = 1;
			window.location.hash = self.options.deeplinking.linkID + self.options.deeplinking.separator + slide.ID;
			hashLock = 0;
		}

		/**
		 * Get slide by ID.
		 *
		 * @param {String}     ID
		 *
		 * @return {Void}
		 */
		function getSlideById(ID) {
			var index = 0;

			$.each(self.slides, function(i, slide) {
				if (ID == slide.ID) {
					index = i;
				}
			});

			return index;
		}

		/**
		 * Handle Hashtag.
		 *
		 * @param {Event}     event
		 *
		 * @return {Void}
		 */
		function hashtagHandler(event) {
			var hash = window.location.hash.replace("#", ""),
				split = hash.split(self.options.deeplinking.separator);

			if (hashLock) {
				return;
			}

			if (event) {
				hashLock = 1;
			}

			if (split[0] === self.options.deeplinking.linkID) {
				var index = getSlideById(split[1]);
				if (self.initialized) {
					self.activate(index);
				}
				else {
					self.options.startRandom = 0;
					self.options.startAt = index;
				}
			}
			else if (event && hash.length === 0) {
				self.activate(self.options.startAt);
			}

			if (event) {
				hashLock = 0;
			}
		}

		/**
		 * Destroys instance and everything it created.
		 *
		 * @return {Void}
		 */
		self.destroy = function (thumbnails) {
			// Unbind all events
			var $unbinds = $scrollSource
				.add($pagesBar)
				.add($forwardButton)
				.add($backwardButton)
				.add($prevButton)
				.add($nextButton)
				.add($prevPageButton)
				.add($nextPageButton)
				.add($fullScreenButton)
				.add($('.' + minnamespace + 'Icon', $frame));

			if (!thumbnails) {
				$unbinds.add($doc).add($win);
			}

			$unbinds.unbind('.' + namespace);

			// Remove classes
			$prevButton
				.add($nextButton)
				.add($prevPageButton)
				.add($nextPageButton)
				.removeClass(self.options.classes.disabledClass);

			if ($slides[0]) {
				$slides.removeAttr('style').eq(self.relative.activeSlide).removeClass(self.options.classes.activeClass);

				// Remove slides covers and icons
				$('.' + minnamespace + 'Cover, .' + minnamespace + 'Icon', $slides).remove();
			}

			// Remove page slides
			if ($pagesBar[0]) {
				$pagesBar.empty();
			}

			// Remove thumbnails
			if ($thumbnailsBar[0]) {
				$thumbnailsBar.empty();
			}
			
			// Remove mightySlider created elements
			$('.' + minnamespace + 'Buttons, .' + minnamespace + 'Pages, .' + minnamespace + 'Thumbnails', $parent).remove();

			// Unbind events from frame
			$frame.unbind('.' + namespace);
			// Remove horizontal/vertical class
			$parent.removeClass(self.options.navigation.horizontal ? self.options.classes.horizontalClass : self.options.classes.verticalClass);
			// Reset slideElement and handle positions
			$slideElement.css(transform || (self.options.navigation.horizontal ? 'left' : 'top'), transform ? 'none' : 0);
			// Remove the instance from element data storage
			$frame.removeData(namespace);

			// Reset initialized status and return the instance
			self.initialized = 0;

			// Trigger :destroy event
			trigger('destroy');

			return self;
		};

		/**
		 * Initialize.
		 *
		 * @return {Object}
		 */
		self.init = function () {
			if (self.initialized) {
				return;
			}

			syncThumbnailsbar();

			// Register callbacks map
			self.on(callbackMap);

			// Activate thumbnail for requested position
			if (thumbnailNav) {
				self.on('active', function(name, index) {
					thumbnailNav.activate(index);
				});
			}

			// Set required styles to elements
			$frame.css('overflow', 'hidden');

			if (!transform && $frame.css('position') === 'static') {
				$frame.css('position', 'relative');
			}

			if (transform && gpuAcceleration) {
				$slideElement.css(transform, gpuAcceleration);;
			}
			else {
				$slideElement.css({ position: 'absolute' });
			}

			// Normalize slider global elements
			normalizeElements();

			// Load
			load();

			// Handle Hashtag
			if (self.options.deeplinking.linkID) {
				hashtagHandler();
			}

			// Set $slide position to relative
			$slides.css({ 'position': 'relative' });
			
			// If startRandom
			self.options.startAt = self.options.startRandom ? Math.floor(Math.random() * self.slides.length) : self.options.startAt;

			// Activate requested position
			self.activate(self.options.startAt, 1);

			// Navigation buttons
			if ($forwardButton[0]) {
				$forwardButton.on(mouseDownEvent, buttonsHandler);
			}
			if ($backwardButton[0]) {
				$backwardButton.on(mouseDownEvent, buttonsHandler);
			}
			if ($prevButton[0]) {
				$prevButton.on(clickEvent, buttonsHandler);
			}
			if ($nextButton[0]) {
				$nextButton.on(clickEvent, buttonsHandler);
			}
			if ($prevPageButton[0]) {
				$prevPageButton.on(clickEvent, buttonsHandler);
			}
			if ($nextPageButton[0]) {
				$nextPageButton.on(clickEvent, buttonsHandler);
			}
			if ($fullScreenButton[0]) {
				$fullScreenButton.on(clickEvent, buttonsHandler);
			}

			// Scrolling navigation
			$scrollSource.on(mouseScrollEvent, scrollHandler);

			// Click on slides navigation
			if (self.options.navigation.activateOn) {
				$frame.on(self.options.navigation.activateOn + '.' + namespace, '*', activateHandler);
			}

			// Pages navigation
			if ($pagesBar[0] && self.options.pages.activateOn) {
				$pagesBar.on(self.options.pages.activateOn + '.' + namespace, '*', activatePageHandler);
			}

			// Dragging navigation
			$dragSource.on(dragInitEvents, { source: 'slideElement' }, dragInit);

			// Keyboard navigation
			$doc.bind(keyDownEvent, keyboardHandler);

			// Window resize, fullscreen and hashchange events
			$win.bind(resizeEvent, winResizeHandler).bind(hashChangeEvent, hashtagHandler);

			if (fullScreenApi.supportsFullScreen) {
				$win.bind(fullScreenApi.fullScreenEventName + '', winfullScreenHandler);
			}

			// Pause on hover
			$frame.on(hoverEvent, pauseOnHoverHandler);

			// Add horizontal/vertical class
			$parent.addClass(self.options.navigation.horizontal ? self.options.classes.horizontalClass : self.options.classes.verticalClass).addClass(isTouch ? self.options.classes.isTouchClass : '');

			// Initiate automatic cycling
			if (self.options.cycling.cycleBy) {
				self[self.options.cycling.startPaused ? 'pause' : 'resume']();
			}

			// Mark instance as initialized
			self.initialized = 1;

			// Trigger :initialize event
			trigger('initialize');

			// Return instance
			return self;
		};
	}

	/**
	 * Return type of the value.
	 *
	 * @param  {Mixed} value
	 *
	 * @return {String}
	 */
	function type(value) {
		if (value === null) {
			return String(value);
		}

		if (typeof value === 'object' || typeof value === 'function') {
			return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
		}

		return typeof value;
	}

	/**
	 * Get slide type.
	 *
	 * @param {Object}   options
	 *
	 * @return {String}
	 */
	function getSlideType(options) {
		var type = 'content',
		cover = options.cover,
		source = options.source,
		video = options.mp4 || options.webm || options.ogv || options.video;

		if (options.type) {
			return options.type;
		}
		else if (parseVideoURL(source)) {
			return 'video';
		}

		if (cover) {
			type = 'image';
		}
		if (source) {
			type = 'iframe';
		}
		if (video) {
			type = 'video';
		}
		if (options.link) {
			type = 'link';
		}
		
		return type;
	}

	/**
	 * Get element inline options.
	 *
	 * @param {Object}   $element    jQuery object with element.
	 *
	 * @return {Object}
	 */
	function getInlineOptions($element) {
		var data = $element.data(namespace.toLowerCase());
		return data && eval("({" + data + "})") || {};
	}

	/**
	 * Get caption options.
	 *
	 * @param {Object}   $caption    jQuery object with element.
	 *
	 * @return {Object}
	 */
	function getCaptionOptions($caption) {
		var data = $caption.data(minnamespace.toLowerCase() + 'animation');
		return data && eval("([" + data + "])") || {};
	}

	/**
	 * Get caption default styles.
	 *
	 * @param {Object}   $caption    jQuery object with element.
	 *
	 * @return {Object}
	 */
	function getCaptionStyles($caption) {
		var styles = {};

		$.each(captionResponsiveStyles, function(i, property) {
			var pixel = getPixel($caption, property);
			if (pixel) {
				styles[property] = pixel;
			}
		});

		return styles;
	}

	/**
	 * Normalize styles.
	 *
	 * @param {Object}   styles
	 * @param {Object}   properties
	 * @param {Number}   ratio
	 *
	 * @return {Object}
	 */
	function normalizeStyles(styles, properties, ratio) {
		var newStyles = {};

		$.each(styles, function(property, value) {
			if ($.inArray(property, properties) === -1) {
				return true;
			}
			var pixel = value * ratio;
			newStyles[property] = pixel;
		});

		return newStyles;
	}

	/**
	 * Event preventDefault & stopPropagation helper.
	 *
	 * @param {Event} event     Event object.
	 * @param {Bool}  noBubbles Cancel event bubbling.
	 *
	 * @return {Void}
	 */
	function stopDefault(event, noBubbles) {
		event.preventDefault();
		if (noBubbles) {
			event.stopPropagation();
		}
	}

	/**
	 * Disables an event it was triggered on and unbinds itself.
	 *
	 * @param  {Event} event
	 *
	 * @return {Void}
	 */
	function disableOneEvent(event) {
		stopDefault(event, 1);
		$(event.target).off(event.type, disableOneEvent);
	}

	/**
	 * A JavaScript equivalent of PHP’s is_numeric.
	 *
	 * @param {Mixed} value
	 *
	 * @return {Boolean}
	 */
	function is_numeric(value) {
		return (typeof(value) === 'number' || typeof(value) === 'string') && value !== '' && !isNaN(value);
	}

	/**
	 * Parse style to pixels.
	 *
	 * @param {Object}   $element   jQuery object with element.
	 * @param {Property} property   CSS property to get the pixels from.
	 *
	 * @return {Int}
	 */
	function getPixel($element, property) {
		return parseInt($element.css(property), 10) || 0;
	}

	/**
	 * Make sure that number is within the limits.
	 *
	 * @param {Number} number
	 * @param {Number} min
	 * @param {Number} max
	 *
	 * @return {Number}
	 */
	function within(number, min, max) {
		return number < min ? min : number > max ? max : number;
	}

	/**
	 * Return value from percent of a number.
	 *
	 * @param {Number} percent
	 * @param {Number} total
	 *
	 * @return {Number}
	 */
	function percentToValue(percent, total) {
		return parseInt((total / 100) * percent);
	}

	/**
	 * Show slide loader.
	 *
	 * @param {Object}   $slide    jQuery object with element.
	 *
	 * @return {Object} jQuery DOM element
	 */
	function showLoader($slide) {
		var loader = $('<div class="' + minnamespace + 'Icon ' + minnamespace + 'Loader"></div>');
		$slide.prepend(loader);
		return loader;
	}

	/**
	 * Hide slide loader.
	 *
	 * @param {Object}   loader    jQuery object with element.
	 *
	 * @return {Void}
	 */
	function hideLoader(loader) {
		return loader.remove();
	}

	/**
	 * Calculate new dimensions by old dimensions.
	 *
	 * @param {Number}   width
	 * @param {Number}   height
	 * @param {Number}   width_old
	 * @param {Number}   height_old
	 * @param {Number}   factor
	 *
	 * @return {Object}
	 */
	function calculateDimensions(width, height, width_old, height_old, factor) {
		if (!factor) {
			if (!width) {
				factor = height / height_old;
			}
			else if (!height) {
				factor = width / width_old;
			}
			else {
				factor = Math.min( width / width_old, height / height_old );
			}
		}

		return {
			width: Math.round( width_old * factor ),
			height: Math.round( height_old * factor ),
			ratio:factor
		};
	}

	/**
	 * Parse video url
	 *
	 * @param {String}   url
	 *
	 * @return {Object}
	 */
	function parseVideoURL(url) {
		var result = null;

		$.each(videoRegularExpressions, function(i, object) {
			// Test url if can be parsed
			if (object.reg.test(url)) {
				var split = url.split(object.split);
				result = {
					source: object.url.replace(/\{id\}/g, split[object.index]),
					type: object.iframe && 'iframe' || 'flash'
				};

				return false;
			}
		});

		return result;
	}

	/**
	 * Parse photo url
	 *
	 * @param {String}   url
	 *
	 * @return {Object}
	 */
	function parsePhotoURL(url) {
		var result = null;

		$.each(photoRegularExpressions, function(i, object) {
			// Test url if can be parsed
			if (object.reg.test(url)) {
				result = $.extend(true, {}, object, {});
				result.oembed = absolutizeURI(object.oembed.replace(/\{URL\}/g, url), url);

				return false;
			}
		});

		return result;
	}

	/**
	 * Create DOM element
	 *
	 * @param {String}   type
	 * @param {Object}   params
	 * @param {Object}   innerTags
	 *
	 * @return {Object}  DOM element
	 */
	function createElement(type, params, innerTags) {
		var el;

		params = params || {};
		innerTags = innerTags || {};

		switch (type) {
			case 'video':
				// Create video DOM element
				el = document.createElement( "video" );

				// Set default video attributes
				params = $.extend(true, params, videoDefaultAttributes);
				break;
			case 'iframe':
				// Create iframe DOM element
				el = document.createElement( "iframe" );

				// Set default iframe attributes
				params = $.extend(true, params, iframeDefaultAttributes);
				break;
			case 'flash':
				// Create embed DOM element
				el = document.createElement( "embed" );

				// Set default embed attributes
				params = $.extend(true, params, embedDefaultAttributes);
				break;
			default :
				el = document.createElement( type );
				break;
		}

		// Insert element attributes
		insertTag(el, params);

		// Insert innerTags
		$.each(innerTags, function(i, attributes) {
			if (!attributes.name) {
				return true;
			}
			// Insert tags into el
			var newEl = document.createElement( attributes.name );

			attributes.name = null;

			// Insert element attributes
			insertTag(newEl, attributes);
			
			// Append inner tags into el
			el.appendChild(newEl);
		});

		return el;
	}

	/**
	 * Insert attributes to DOM elements
	 *
	 * @param {Object}   el                 HTML DOM element
	 * @param {String}   attributes
	 *
	 * @return {Void}
	 */
	function insertTag(el, attributes) {
		$.each(attributes, function(key, value) {
			if (!is_numeric(value) && !value) {
				return true;
			}

			// Insert attribute into el
			insertAttribute(el, key, value);
		});
	}

	/**
	 * Insert an attribute into DOM element
	 *
	 * @param {Object}   el                 HTML DOM element
	 * @param {String}   attributeName
	 * @param {Mixed}    value
	 *
	 * @return {Void}
	 */
	function insertAttribute(el, attributeName, value) {
		var nodeValue = ($.isPlainObject(value)) ? (function(){
				var query = "",
					i = 0;

				$.each(value, function(k, v) {
					if (i!==0) {
						query += "&";
					}
					query += k + "=" + rawurlencode(v);
					i++;
				});
			return query;
		}()) : value;
		el.setAttribute(attributeName, nodeValue);
	}

	/**
	 * Preload images with callback.
	 *
	 * @param {Array} arr
	 *
	 * @return {Object}
	 */
	function preloadimages(arr) {
		var newImages = [], loadedImages = 0,
			postAction = function(){};

		arr = (typeof arr !== "object") ? [arr] : arr;
			
		function imageLoadPost(){
			loadedImages++;
			if (loadedImages === arr.length) {
				// call postAction and pass in newImages array as parameter
				postAction(newImages);
			}
		}
		
		function handler() {
			imageLoadPost();
		}
		
		for (var i=0; i < arr.length; i++) {
			newImages[i] = new Image();
			newImages[i].onload = handler;
			newImages[i].onerror = handler;
			newImages[i].src = arr[i];
		}
		
		// return blank object with done() method
		return {
			done: function(f) {
				// remember user defined callback functions to be called when images load
				postAction = f || postAction;
			}
		};
	}

	/**
	 * Check HTML5 video element can play given type.
	 *
	 * @param {String} type
	 *
	 * @return {String}
	 */
	function canPlayType(type) {
		var el = document.createElement( "video" );
		return !!(el.canPlayType && el.canPlayType(type).replace(/no/, ''))
	}

	/**
	 * Do the ajax requests with callback.
	 *
	 * @param {String}   url
	 * @param {Function} callback
	 *
	 * @return {Void}
	 */
	function doAjax(url, callback) {
		var url = JSONReader.replace(/\{URL\}/g, rawurlencode(url)),
		docMode = document.documentMode || browser.version,
		ieLT10 = browser.msie && docMode < 10,
		xhr = $.ajax({
			url: url,
			dataType: ieLT10 ? 'jsonp' : 'json',
			cache: !ieLT10
		});

		xhr.success(function(data){
			callback(data);
		}).error(function(){
			callback(false);
		});

		// IE's that are lower than 10 cannot proccess json urls so we need to use jsonp
		// but because of the 'use strict' mode it's will be an error and also 'use strict'
		// mode in not supported by IE's that are lower than 10 :|
		if (ieLT10) {
			mightySliderCallback = function(data) {
				callback(data);
			};
		}
	}

	/**
	 * A JavaScript equivalent of PHP’s rawurlencode.
	 *
	 * @param {String} str
	 *
	 * @return {String}
	 */
	function rawurlencode(str) {
		str = (str + '').toString();

		// Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
		// PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
		return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
		replace(/\)/g, '%29').replace(/\*/g, '%2A');
	}

	/**
	 * A JavaScript equivalent of PHP’s ucfirst.
	 *
	 * @param {String} str
	 *
	 * @return {String}
	 */
	function ucfirst(str) {
		str += '';
		var f = str.charAt(0).toUpperCase();
		return f + str.substr(1);
	}

	/**
	 * A JavaScript equivalent of PHP’s basename.
	 *
	 * @param {String} path
	 * @param {String} suffix
	 *
	 * @return {String}
	 */
	function basename(path, suffix) {
		var b = path.replace(/^.*[\/\\]/g, '');

		if (typeof(suffix) === 'string' && b.substr(b.length - suffix.length) === suffix) {
			b = b.substr(0, b.length - suffix.length);
		}

		return b;
	}

	/**
	 * A JavaScript equivalent of PHP’s dirname.
	 *
	 * @param {String} path
	 *
	 * @return {String}
	 */
	function dirname(path) {
		return path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
	}

	/**
	 * A JavaScript equivalent of PHP’s parse_url.
	 *
	 * @param {String} url           The URL to parse.
	 * @param {String} component     Specify one of PHP_URL_SCHEME, PHP_URL_HOST, PHP_URL_PORT, PHP_URL_USER, PHP_URL_PASS, PHP_URL_PATH, PHP_URL_QUERY or PHP_URL_FRAGMENT to retrieve just a specific URL component as a string.
	 *
	 * @return {Mixed}
	 */
	function parse_url(url, component) {
		var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
			'relative', 'path', 'directory', 'file', 'query', 'fragment'],
			mode = 'php',
			parser = {
				php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
			};

		var m = parser[mode].exec(url),
			uri = {},
			i = 14;
			while (i--) {
				if (m[i]) {
					uri[key[i]] = m[i];
				}
			}

		if (component) {
			return uri[component.replace('PHP_URL_', '').toLowerCase()];
		}
		if (mode !== 'php') {
			var name = 'queryKey';
			parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
			uri[name] = {};
			query = uri[key[12]] || '';
			query.replace(parser, function ($0, $1, $2) {
				if ($1) {uri[name][$1] = $2;}
			});
		}
		delete uri.source;
		return uri;
	}

	/**
	 * Gets the absolute URI.
	 *
	 * @param {String} href     The relative URL.
	 * @param {String} base     The base URL.
	 *
	 * @return {String}         The absolute URL.
	 */
	function absolutizeURI(href, base) {// RFC 3986
		function removeDotSegments(input) {
			var output = [];
			input.replace(/^(\.\.?(\/|$))+/, '')
				 .replace(/\/(\.(\/|$))+/g, '/')
				 .replace(/\/\.\.$/, '/../')
				 .replace(/\/?[^\/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
			});
			return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
		}

		function URIComponents(url) {
			var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
			// authority = '//' + user + ':' + pass '@' + hostname + ':' port
			return (m ? {
				href     : m[0] || '',
				protocol : m[1] || '',
				authority: m[2] || '',
				host     : m[3] || '',
				hostname : m[4] || '',
				port     : m[5] || '',
				pathname : m[6] || '',
				search   : m[7] || '',
				hash     : m[8] || ''
			} : null);
		}

		href = URIComponents(href || '');
		base = URIComponents(base || window.location.href);

		return !href || !base ? null : (href.protocol || base.protocol) +
			(href.protocol || href.authority ? href.authority : base.authority) +
			removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
			(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
			href.hash;
	}

	/**
	 * A JavaScript equivalent of PHP’s pathinfo.
	 *
	 * @param {String} path
	 * @param {String} options
	 *
	 * @return {Array}
	 */
	function pathinfo(path, options) {
		var opt = '',
			optName = '',
			optTemp = 0,
			tmp_arr = {},
			cnt = 0,
			i = 0,
			have_basename = false,
			have_extension = false,
			have_filename = false;

		// Input defaulting & sanitation
		if (!path) {
			return false;
		}
		if (!options) {
			options = 'PATHINFO_ALL';
		}

		// Initialize binary arguments. Both the string & integer (constant) input is
		// allowed
		var OPTS = {
			'PATHINFO_DIRNAME': 1,
			'PATHINFO_BASENAME': 2,
			'PATHINFO_EXTENSION': 4,
			'PATHINFO_FILENAME': 8,
			'PATHINFO_ALL': 0
		};
		// PATHINFO_ALL sums up all previously defined PATHINFOs (could just pre-calculate)
		for (optName in OPTS) {
			OPTS.PATHINFO_ALL = OPTS.PATHINFO_ALL | OPTS[optName];
		}
		if (typeof options !== 'number') { // Allow for a single string or an array of string flags
			options = [].concat(options);
			for (i = 0; i < options.length; i++) {
				// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
				if (OPTS[options[i]]) {
					optTemp = optTemp | OPTS[options[i]];
				}
			}
			options = optTemp;
		}

		// Internal Functions
		var __getExt = function (path) {
			var str = path + '';
			var dotP = str.lastIndexOf('.') + 1;
			return !dotP ? false : dotP !== str.length ? str.substr(dotP) : '';
		};


		// Gather path infos
		if (options & OPTS.PATHINFO_DIRNAME) {
			var dirname = dirname(path);
			tmp_arr.dirname = dirname === path ? '.' : dirname;
		}

		if (options & OPTS.PATHINFO_BASENAME) {
			if (false === have_basename) {
				have_basename = basename(path);
			}
			tmp_arr.basename = have_basename;
		}

		if (options & OPTS.PATHINFO_EXTENSION) {
			if (false === have_basename) {
				have_basename = basename(path);
			}
			if (false === have_extension) {
				have_extension = __getExt(have_basename);
			}
			if (false !== have_extension) {
				tmp_arr.extension = have_extension;
			}
		}

		if (options & OPTS.PATHINFO_FILENAME) {
			if (false === have_basename) {
				have_basename = basename(path);
			}
			if (false === have_extension) {
				have_extension = __getExt(have_basename);
			}
			if (false === have_filename) {
				have_filename = have_basename.slice(0, have_basename.length - (have_extension ? have_extension.length + 1 : have_extension === false ? 0 : 1));
			}

			tmp_arr.filename = have_filename;
		}


		// If array contains only 1 element: return string
		cnt = 0;
		for (opt in tmp_arr) {
			cnt++;
		}
		if (cnt === 1) {
			return tmp_arr[opt];
		}

		// Return full-blown array
		return tmp_arr;
	}

	/**
	 * A JavaScript equivalent of PHP’s version_compare.
	 *
	 * @param {String} v1
	 * @param {String} v2
	 * @param {String} operator
	 *
	 * @return {Boolean}
	 */
	function version_compare(v1, v2, operator) {
		// Important: compare must be initialized at 0.
		var i = 0,
		x = 0,
		compare = 0,
		// vm maps textual PHP versions to negatives so they're less than 0.
		// PHP currently defines these as CASE-SENSITIVE. It is important to
		// leave these as negatives so that they can come before numerical versions
		// and as if no letters were there to begin with.
		// (1alpha is < 1 and < 1.1 but > 1dev1)
		// If a non-numerical value can't be mapped to this table, it receives
		// -7 as its value.
		vm = {
			'dev': -6,
			'alpha': -5,
			'a': -5,
			'beta': -4,
			'b': -4,
			'RC': -3,
			'rc': -3,
			'#': -2,
			'p': 1,
			'pl': 1
		},
		// This function will be called to prepare each version argument.
		// It replaces every _, -, and + with a dot.
		// It surrounds any nonsequence of numbers/dots with dots.
		// It replaces sequences of dots with a single dot.
		//    version_compare('4..0', '4.0') == 0
		// Important: A string of 0 length needs to be converted into a value
		// even less than an unexisting value in vm (-7), hence [-8].
		// It's also important to not strip spaces because of this.
		//   version_compare('', ' ') == 1
		prepVersion = function (v) {
			v = ('' + v).replace(/[_\-+]/g, '.');
			v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.');
			return (!v.length ? [-8] : v.split('.'));
		},
		// This converts a version component to a number.
		// Empty component becomes 0.
		// Non-numerical component becomes a negative number.
		// Numerical component becomes itself as an integer.
		numVersion = function (v) {
			return !v ? 0 : (isNaN(v) ? vm[v] || -7 : parseInt(v, 10));
		};
		v1 = prepVersion(v1);
		v2 = prepVersion(v2);
		x = Math.max(v1.length, v2.length);
		for (i = 0; i < x; i++) {
			if (v1[i] === v2[i]) {
				continue;
			}
			v1[i] = numVersion(v1[i]);
			v2[i] = numVersion(v2[i]);
			if (v1[i] < v2[i]) {
				compare = -1;
				break;
			}
			else if (v1[i] > v2[i]) {
				compare = 1;
				break;
			}
		}
		if (!operator) {
			return compare;
		}

		// "No operator" seems to be treated as "<."
		// Any other values seem to make the function return null.
		switch (operator) {
			case '>':
			return (compare > 0);
			case '>=':
			return (compare >= 0);
			case '<=':
			return (compare <= 0);
			case '==':
			return (compare === 0);
			case '!=':
			return (compare !== 0);
			case '<':
			return (compare < 0);
			default:
			return null;
		}
	}

	// Browser detect
	(function () {
		function uaMatch( ua ) {
			ua = ua.toLowerCase();

			var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		}

		var matched = uaMatch( navigator.userAgent );
		browser = {};

		if ( matched.browser ) {
			browser[ matched.browser ] = true;
			browser.version = matched.version;
		}

		// Chrome is Webkit, but Webkit is also Safari.
		if ( browser.chrome ) {
			browser.webkit = true;
		}
		else if ( browser.webkit ) {
			browser.safari = true;
		}
	}());

	// Local WindowAnimationTiming interface polyfill
	(function () {
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		var lastTime = 0;

		// For a more accurate WindowAnimationTiming interface implementation, ditch the native
		// requestAnimationFrame when cancelAnimationFrame is not present (older versions of Firefox)
		for(var i = 0, l = vendors.length; i < l && !cancelAnimationFrame; ++i) {
			cancelAnimationFrame = window[vendors[i]+'CancelAnimationFrame'] || window[vendors[i]+'CancelRequestAnimationFrame'];
			requestAnimationFrame = cancelAnimationFrame && window[vendors[i]+'RequestAnimationFrame'];
		}

		if (!cancelAnimationFrame) {
			requestAnimationFrame = function (callback) {
				var currTime = +new Date();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				lastTime = currTime + timeToCall;
				return window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
			};

			cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
	}());

	// Feature detects
	(function () {
		var prefixes = ['', 'webkit', 'moz', 'ms', 'o'];
		var el = document.createElement('div');

		function testProp(prop) {
			for (var p = 0, pl = prefixes.length; p < pl; p++) {
				var prefixedProp = prefixes[p] ? prefixes[p] + prop.charAt(0).toUpperCase() + prop.slice(1) : prop;
				if (el.style[prefixedProp] !== undefined) {
					return prefixedProp;
				}
			}
		}

		// Global support indicators
		transform = testProp('transform');
		gpuAcceleration = testProp('perspective') ? 'translateZ(0) ' : '';
	}());

	/*
		PluginDetect v0.7.9
		www.pinlady.net/PluginDetect/license/
		[ getVersion onWindowLoaded BetterIE ]
		[ Flash QuickTime Shockwave ]
	*/
	(function () {
		var PluginDetect={version:"0.7.9",name:"PluginDetect",handler:function(c,b,a){return function(){c(b,a)}},openTag:"<",isDefined:function(b){return typeof b!="undefined"},isArray:function(b){return(/array/i).test(Object.prototype.toString.call(b))},isFunc:function(b){return typeof b=="function"},isString:function(b){return typeof b=="string"},isNum:function(b){return typeof b=="number"},isStrNum:function(b){return(typeof b=="string"&&(/\d/).test(b))},getNumRegx:/[\d][\d\.\_,-]*/,splitNumRegx:/[\.\_,-]/g,getNum:function(b,c){var d=this,a=d.isStrNum(b)?(d.isDefined(c)?new RegExp(c):d.getNumRegx).exec(b):null;return a?a[0]:null},compareNums:function(h,f,d){var e=this,c,b,a,g=parseInt;if(e.isStrNum(h)&&e.isStrNum(f)){if(e.isDefined(d)&&d.compareNums){return d.compareNums(h,f)}c=h.split(e.splitNumRegx);b=f.split(e.splitNumRegx);for(a=0;a<Math.min(c.length,b.length);a++){if(g(c[a],10)>g(b[a],10)){return 1}if(g(c[a],10)<g(b[a],10)){return -1}}}return 0},formatNum:function(b,c){var d=this,a,e;if(!d.isStrNum(b)){return null}if(!d.isNum(c)){c=4}c--;e=b.replace(/\s/g,"").split(d.splitNumRegx).concat(["0","0","0","0"]);for(a=0;a<4;a++){if(/^(0+)(.+)$/.test(e[a])){e[a]=RegExp.$2}if(a>c||!(/\d/).test(e[a])){e[a]="0"}}return e.slice(0,4).join(",")},$$hasMimeType:function(a){return function(c){if(!a.isIE&&c){var f,e,b,d=a.isArray(c)?c:(a.isString(c)?[c]:[]);for(b=0;b<d.length;b++){if(a.isString(d[b])&&/[^\s]/.test(d[b])){f=navigator.mimeTypes[d[b]];e=f?f.enabledPlugin:0;if(e&&(e.name||e.description)){return f}}}}return null}},findNavPlugin:function(l,e,c){var j=this,h=new RegExp(l,"i"),d=(!j.isDefined(e)||e)?/\d/:0,k=c?new RegExp(c,"i"):0,a=navigator.plugins,g="",f,b,m;for(f=0;f<a.length;f++){m=a[f].description||g;b=a[f].name||g;if((h.test(m)&&(!d||d.test(RegExp.leftContext+RegExp.rightContext)))||(h.test(b)&&(!d||d.test(RegExp.leftContext+RegExp.rightContext)))){if(!k||!(k.test(m)||k.test(b))){return a[f]}}}return null},getMimeEnabledPlugin:function(k,m,c){var e=this,f,b=new RegExp(m,"i"),h="",g=c?new RegExp(c,"i"):0,a,l,d,j=e.isString(k)?[k]:k;for(d=0;d<j.length;d++){if((f=e.hasMimeType(j[d]))&&(f=f.enabledPlugin)){l=f.description||h;a=f.name||h;if(b.test(l)||b.test(a)){if(!g||!(g.test(l)||g.test(a))){return f}}}}return 0},getPluginFileVersion:function(f,b){var h=this,e,d,g,a,c=-1;if(h.OS>2||!f||!f.version||!(e=h.getNum(f.version))){return b}if(!b){return e}e=h.formatNum(e);b=h.formatNum(b);d=b.split(h.splitNumRegx);g=e.split(h.splitNumRegx);for(a=0;a<d.length;a++){if(c>-1&&a>c&&d[a]!="0"){return b}if(g[a]!=d[a]){if(c==-1){c=a}if(d[a]!="0"){return b}}}return e},AXO:window.ActiveXObject,getAXO:function(a){var f=null,d,b=this,c={};try{f=new b.AXO(a)}catch(d){}return f},convertFuncs:function(f){var a,g,d,b=/^[\$][\$]/,c=this;for(a in f){if(b.test(a)){try{g=a.slice(2);if(g.length>0&&!f[g]){f[g]=f[a](f);delete f[a]}}catch(d){}}}},initObj:function(e,b,d){var a,c;if(e){if(e[b[0]]==1||d){for(a=0;a<b.length;a=a+2){e[b[a]]=b[a+1]}}for(a in e){c=e[a];if(c&&c[b[0]]==1){this.initObj(c,b)}}}},initScript:function(){var d=this,a=navigator,h,i=document,l=a.userAgent||"",j=a.vendor||"",b=a.platform||"",k=a.product||"";d.initObj(d,["$",d]);for(h in d.Plugins){if(d.Plugins[h]){d.initObj(d.Plugins[h],["$",d,"$$",d.Plugins[h]],1)}}d.convertFuncs(d);d.OS=100;if(b){var g=["Win",1,"Mac",2,"Linux",3,"FreeBSD",4,"iPhone",21.1,"iPod",21.2,"iPad",21.3,"Win.*CE",22.1,"Win.*Mobile",22.2,"Pocket\\s*PC",22.3,"",100];for(h=g.length-2;h>=0;h=h-2){if(g[h]&&new RegExp(g[h],"i").test(b)){d.OS=g[h+1];break}}};d.head=i.getElementsByTagName("head")[0]||i.getElementsByTagName("body")[0]||i.body||null;d.isIE=new Function("return/*@cc_on!@*/!1")();d.verIE=d.isIE&&(/MSIE\s*(\d+\.?\d*)/i).test(l)?parseFloat(RegExp.$1,10):null;d.verIEfull=null;d.docModeIE=null;if(d.isIE){var f,n,c=document.createElement("div");try{c.style.behavior="url(#default#clientcaps)";d.verIEfull=(c.getComponentVersion("{89820200-ECBD-11CF-8B85-00AA005B4383}","componentid")).replace(/,/g,".")}catch(f){}n=parseFloat(d.verIEfull||"0",10);d.docModeIE=i.documentMode||((/back/i).test(i.compatMode||"")?5:n)||d.verIE;d.verIE=n||d.docModeIE};d.ActiveXEnabled=false;if(d.isIE){var h,m=["Msxml2.XMLHTTP","Msxml2.DOMDocument","Microsoft.XMLDOM","ShockwaveFlash.ShockwaveFlash","TDCCtl.TDCCtl","Shell.UIHelper","Scripting.Dictionary","wmplayer.ocx"];for(h=0;h<m.length;h++){if(d.getAXO(m[h])){d.ActiveXEnabled=true;break}}};d.isGecko=(/Gecko/i).test(k)&&(/Gecko\s*\/\s*\d/i).test(l);d.verGecko=d.isGecko?d.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(l)?RegExp.$1:"0.9"):null;d.isChrome=(/Chrome\s*\/\s*(\d[\d\.]*)/i).test(l);d.verChrome=d.isChrome?d.formatNum(RegExp.$1):null;d.isSafari=((/Apple/i).test(j)||(!j&&!d.isChrome))&&(/Safari\s*\/\s*(\d[\d\.]*)/i).test(l);d.verSafari=d.isSafari&&(/Version\s*\/\s*(\d[\d\.]*)/i).test(l)?d.formatNum(RegExp.$1):null;d.isOpera=(/Opera\s*[\/]?\s*(\d+\.?\d*)/i).test(l);d.verOpera=d.isOpera&&((/Version\s*\/\s*(\d+\.?\d*)/i).test(l)||1)?parseFloat(RegExp.$1,10):null;d.addWinEvent("load",d.handler(d.runWLfuncs,d))},init:function(d){var c=this,b,d,a={status:-3,plugin:0};if(!c.isString(d)){return a}if(d.length==1){c.getVersionDelimiter=d;return a}d=d.toLowerCase().replace(/\s/g,"");b=c.Plugins[d];if(!b||!b.getVersion){return a}a.plugin=b;if(!c.isDefined(b.installed)){b.installed=null;b.version=null;b.version0=null;b.getVersionDone=null;b.pluginName=d}c.garbage=false;if(c.isIE&&!c.ActiveXEnabled&&d!=="java"){a.status=-2;return a}a.status=1;return a},fPush:function(b,a){var c=this;if(c.isArray(a)&&(c.isFunc(b)||(c.isArray(b)&&b.length>0&&c.isFunc(b[0])))){a.push(b)}},callArray:function(b){var c=this,a;if(c.isArray(b)){for(a=0;a<b.length;a++){if(b[a]===null){return}c.call(b[a]);b[a]=null}}},call:function(c){var b=this,a=b.isArray(c)?c.length:-1;if(a>0&&b.isFunc(c[0])){c[0](b,a>1?c[1]:0,a>2?c[2]:0,a>3?c[3]:0)}else{if(b.isFunc(c)){c(b)}}},getVersionDelimiter:",",$$getVersion:function(a){return function(g,d,c){var e=a.init(g),f,b,h={};if(e.status<0){return null};f=e.plugin;if(f.getVersionDone!=1){f.getVersion(null,d,c);if(f.getVersionDone===null){f.getVersionDone=1}}a.cleanup();b=(f.version||f.version0);b=b?b.replace(a.splitNumRegx,a.getVersionDelimiter):b;return b}},cleanup:function(){var a=this;if(a.garbage&&a.isDefined(window.CollectGarbage)){window.CollectGarbage()}},isActiveXObject:function(d,b){var f=this,a=false,g,c='<object width="1" height="1" style="display:none" '+d.getCodeBaseVersion(b)+">"+d.HTML+f.openTag+"/object>";if(!f.head){return a}f.head.insertBefore(document.createElement("object"),f.head.firstChild);f.head.firstChild.outerHTML=c;try{f.head.firstChild.classid=d.classID}catch(g){}try{if(f.head.firstChild.object){a=true}}catch(g){}try{if(a&&f.head.firstChild.readyState<4){f.garbage=true}}catch(g){}f.head.removeChild(f.head.firstChild);return a},codebaseSearch:function(f,b){var c=this;if(!c.ActiveXEnabled||!f){return null}if(f.BIfuncs&&f.BIfuncs.length&&f.BIfuncs[f.BIfuncs.length-1]!==null){c.callArray(f.BIfuncs)}var d,o=f.SEARCH,k={};if(c.isStrNum(b)){if(o.match&&o.min&&c.compareNums(b,o.min)<=0){return true}if(o.match&&o.max&&c.compareNums(b,o.max)>=0){return false}d=c.isActiveXObject(f,b);if(d&&(!o.min||c.compareNums(b,o.min)>0)){o.min=b}if(!d&&(!o.max||c.compareNums(b,o.max)<0)){o.max=b}return d};var e=[0,0,0,0],l=[].concat(o.digits),a=o.min?1:0,j,i,h,g,m,n=function(p,r){var q=[].concat(e);q[p]=r;return c.isActiveXObject(f,q.join(","))};if(o.max){g=o.max.split(c.splitNumRegx);for(j=0;j<g.length;j++){g[j]=parseInt(g[j],10)}if(g[0]<l[0]){l[0]=g[0]}}if(o.min){m=o.min.split(c.splitNumRegx);for(j=0;j<m.length;j++){m[j]=parseInt(m[j],10)}if(m[0]>e[0]){e[0]=m[0]}}if(m&&g){for(j=1;j<m.length;j++){if(m[j-1]!=g[j-1]){break}if(g[j]<l[j]){l[j]=g[j]}if(m[j]>e[j]){e[j]=m[j]}}}if(o.max){for(j=1;j<l.length;j++){if(g[j]>0&&l[j]==0&&l[j-1]<o.digits[j-1]){l[j-1]+=1;break}}};for(j=0;j<l.length;j++){h={};for(i=0;i<20;i++){if(l[j]-e[j]<1){break}d=Math.round((l[j]+e[j])/2);if(h["a"+d]){break}h["a"+d]=1;if(n(j,d)){e[j]=d;a=1}else{l[j]=d}}l[j]=e[j];if(!a&&n(j,e[j])){a=1};if(!a){break}};return a?e.join(","):null},addWinEvent:function(d,c){var e=this,a=window,b;if(e.isFunc(c)){if(a.addEventListener){a.addEventListener(d,c,false)}else{if(a.attachEvent){a.attachEvent("on"+d,c)}else{b=a["on"+d];a["on"+d]=e.winHandler(c,b)}}}},winHandler:function(d,c){return function(){d();if(typeof c=="function"){c()}}},WLfuncs0:[],WLfuncs:[],runWLfuncs:function(a){var b={};a.winLoaded=true;a.callArray(a.WLfuncs0);a.callArray(a.WLfuncs);if(a.onDoneEmptyDiv){a.onDoneEmptyDiv()}},winLoaded:false,$$onWindowLoaded:function(a){return function(b){if(a.winLoaded){a.call(b)}else{a.fPush(b,a.WLfuncs)}}},div:null,divID:"plugindetect",divWidth:50,pluginSize:1,emptyDiv:function(){var d=this,b,h,c,a,f,g;if(d.div&&d.div.childNodes){for(b=d.div.childNodes.length-1;b>=0;b--){c=d.div.childNodes[b];if(c&&c.childNodes){for(h=c.childNodes.length-1;h>=0;h--){g=c.childNodes[h];try{c.removeChild(g)}catch(f){}}}if(c){try{d.div.removeChild(c)}catch(f){}}}}if(!d.div){a=document.getElementById(d.divID);if(a){d.div=a}}if(d.div&&d.div.parentNode){try{d.div.parentNode.removeChild(d.div)}catch(f){}d.div=null}},DONEfuncs:[],onDoneEmptyDiv:function(){var c=this,a,b;if(!c.winLoaded){return}if(c.WLfuncs&&c.WLfuncs.length&&c.WLfuncs[c.WLfuncs.length-1]!==null){return}for(a in c){b=c[a];if(b&&b.funcs){if(b.OTF==3){return}if(b.funcs.length&&b.funcs[b.funcs.length-1]!==null){return}}}for(a=0;a<c.DONEfuncs.length;a++){c.callArray(c.DONEfuncs)}c.emptyDiv()},getWidth:function(c){if(c){var a=c.scrollWidth||c.offsetWidth,b=this;if(b.isNum(a)){return a}}return -1},getTagStatus:function(m,g,a,b){var c=this,f,k=m.span,l=c.getWidth(k),h=a.span,j=c.getWidth(h),d=g.span,i=c.getWidth(d);if(!k||!h||!d||!c.getDOMobj(m)){return -2}if(j<i||l<0||j<0||i<0||i<=c.pluginSize||c.pluginSize<1){return 0}if(l>=i){return -1}try{if(l==c.pluginSize&&(!c.isIE||c.getDOMobj(m).readyState==4)){if(!m.winLoaded&&c.winLoaded){return 1}if(m.winLoaded&&c.isNum(b)){if(!c.isNum(m.count)){m.count=b}if(b-m.count>=10){return 1}}}}catch(f){}return 0},getDOMobj:function(g,a){var f,d=this,c=g?g.span:0,b=c&&c.firstChild?1:0;try{if(b&&a){d.div.focus()}}catch(f){}return b?c.firstChild:null},setStyle:function(b,g){var f=b.style,a,d,c=this;if(f&&g){for(a=0;a<g.length;a=a+2){try{f[g[a]]=g[a+1]}catch(d){}}}},insertDivInBody:function(i,g){var f,c=this,h="pd33993399",b=null,d=g?window.top.document:window.document,a=d.getElementsByTagName("body")[0]||d.body;if(!a){try{d.write('<div id="'+h+'">.'+c.openTag+"/div>");b=d.getElementById(h)}catch(f){}}a=d.getElementsByTagName("body")[0]||d.body;if(a){a.insertBefore(i,a.firstChild);if(b){a.removeChild(b)}}},insertHTML:function(f,b,g,a,k){var l,m=document,j=this,p,o=m.createElement("span"),n,i;var c=["outlineStyle","none","borderStyle","none","padding","0px","margin","0px","visibility","visible"];var h="outline-style:none;border-style:none;padding:0px;margin:0px;visibility:visible;";if(!j.isDefined(a)){a=""}if(j.isString(f)&&(/[^\s]/).test(f)){f=f.toLowerCase().replace(/\s/g,"");p=j.openTag+f+' width="'+j.pluginSize+'" height="'+j.pluginSize+'" ';p+='style="'+h+'display:inline;" ';for(n=0;n<b.length;n=n+2){if(/[^\s]/.test(b[n+1])){p+=b[n]+'="'+b[n+1]+'" '}}p+=">";for(n=0;n<g.length;n=n+2){if(/[^\s]/.test(g[n+1])){p+=j.openTag+'param name="'+g[n]+'" value="'+g[n+1]+'" />'}}p+=a+j.openTag+"/"+f+">"}else{p=a}if(!j.div){i=m.getElementById(j.divID);if(i){j.div=i}else{j.div=m.createElement("div");j.div.id=j.divID}j.setStyle(j.div,c.concat(["width",j.divWidth+"px","height",(j.pluginSize+3)+"px","fontSize",(j.pluginSize+3)+"px","lineHeight",(j.pluginSize+3)+"px","verticalAlign","baseline","display","block"]));if(!i){j.setStyle(j.div,["position","absolute","right","0px","top","0px"]);j.insertDivInBody(j.div)}}if(j.div&&j.div.parentNode){j.setStyle(o,c.concat(["fontSize",(j.pluginSize+3)+"px","lineHeight",(j.pluginSize+3)+"px","verticalAlign","baseline","display","inline"]));try{o.innerHTML=p}catch(l){};try{j.div.appendChild(o)}catch(l){};return{span:o,winLoaded:j.winLoaded,tagName:f,outerHTML:p}}return{span:null,winLoaded:j.winLoaded,tagName:"",outerHTML:p}},Plugins:{quicktime:{mimeType:["video/quicktime","application/x-quicktimeplayer","image/x-macpaint","image/x-quicktime"],progID:"QuickTimeCheckObject.QuickTimeCheck.1",progID0:"QuickTime.QuickTime",classID:"clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",minIEver:7,HTML:'<param name="src" value="" /><param name="controller" value="false" />',getCodeBaseVersion:function(a){return'codebase="#version='+a+'"'},SEARCH:{min:0,max:0,match:0,digits:[16,128,128,0]},getVersion:function(c){var f=this,d=f.$,a=null,e=null,b;if(!d.isIE){if(d.hasMimeType(f.mimeType)){e=d.OS!=3?d.findNavPlugin("QuickTime.*Plug-?in",0):null;if(e&&e.name){a=d.getNum(e.name)}}}else{if(d.isStrNum(c)){b=c.split(d.splitNumRegx);if(b.length>3&&parseInt(b[3],10)>0){b[3]="9999"}c=b.join(",")}if(d.isStrNum(c)&&d.verIE>=f.minIEver&&f.canUseIsMin()>0){f.installed=f.isMin(c);f.getVersionDone=0;return}f.getVersionDone=1;if(!a&&d.verIE>=f.minIEver){a=f.CDBASE2VER(d.codebaseSearch(f))}if(!a){e=d.getAXO(f.progID);if(e&&e.QuickTimeVersion){a=e.QuickTimeVersion.toString(16);a=parseInt(a.charAt(0),16)+"."+parseInt(a.charAt(1),16)+"."+parseInt(a.charAt(2),16)}}}f.installed=a?1:(e?0:-1);f.version=d.formatNum(a,3)},cdbaseUpper:["7,60,0,0","0,0,0,0"],cdbaseLower:["7,50,0,0",null],cdbase2ver:[function(c,b){var a=b.split(c.$.splitNumRegx);return[a[0],a[1].charAt(0),a[1].charAt(1),a[2]].join(",")},null],CDBASE2VER:function(f){var e=this,c=e.$,b,a=e.cdbaseUpper,d=e.cdbaseLower;if(f){f=c.formatNum(f);for(b=0;b<a.length;b++){if(a[b]&&c.compareNums(f,a[b])<0&&d[b]&&c.compareNums(f,d[b])>=0&&e.cdbase2ver[b]){return e.cdbase2ver[b](e,f)}}}return f},canUseIsMin:function(){var f=this,d=f.$,b,c=f.canUseIsMin,a=f.cdbaseUpper,e=f.cdbaseLower;if(!c.value){c.value=-1;for(b=0;b<a.length;b++){if(a[b]&&d.codebaseSearch(f,a[b])){c.value=1;break}if(e[b]&&d.codebaseSearch(f,e[b])){c.value=-1;break}}}f.SEARCH.match=c.value==1?1:0;return c.value},isMin:function(c){var b=this,a=b.$;return a.codebaseSearch(b,c)?0.7:-1}},flash:{mimeType:"application/x-shockwave-flash",progID:"ShockwaveFlash.ShockwaveFlash",classID:"clsid:D27CDB6E-AE6D-11CF-96B8-444553540000",getVersion:function(){var b=function(i){if(!i){return null}var e=/[\d][\d\,\.\s]*[rRdD]{0,1}[\d\,]*/.exec(i);return e?e[0].replace(/[rRdD\.]/g,",").replace(/\s/g,""):null};var j=this,g=j.$,k,h,l=null,c=null,a=null,f,m,d;if(!g.isIE){m=g.hasMimeType(j.mimeType);if(m){f=g.getDOMobj(g.insertHTML("object",["type",j.mimeType],[],"",j));try{l=g.getNum(f.GetVariable("$version"))}catch(k){}}if(!l){d=m?m.enabledPlugin:null;if(d&&d.description){l=b(d.description)}if(l){l=g.getPluginFileVersion(d,l)}}}else{for(h=15;h>2;h--){c=g.getAXO(j.progID+"."+h);if(c){a=h.toString();break}}if(!c){c=g.getAXO(j.progID)}if(a=="6"){try{c.AllowScriptAccess="always"}catch(k){return"6,0,21,0"}}try{l=b(c.GetVariable("$version"))}catch(k){}if(!l&&a){l=a}}j.installed=l?1:-1;j.version=g.formatNum(l);return true}},shockwave:{mimeType:"application/x-director",progID:"SWCtl.SWCtl",classID:"clsid:166B1BCA-3F9C-11CF-8075-444553540000",getVersion:function(){var a=null,b=null,g,f,d=this,c=d.$;if(!c.isIE){f=c.findNavPlugin("Shockwave\\s*for\\s*Director");if(f&&f.description&&c.hasMimeType(d.mimeType)){a=c.getNum(f.description)}if(a){a=c.getPluginFileVersion(f,a)}}else{try{b=c.getAXO(d.progID).ShockwaveVersion("")}catch(g){}if(c.isString(b)&&b.length>0){a=c.getNum(b)}else{if(c.getAXO(d.progID+".8")){a="8"}else{if(c.getAXO(d.progID+".7")){a="7"}else{if(c.getAXO(d.progID+".1")){a="6"}}}}}d.installed=a?1:-1;d.version=c.formatNum(a)}},zz:0}};PluginDetect.initScript();

		// Global plugins support indicators
		browserPlugins = {
			flash: (parseInt(PluginDetect.getVersion("Shockwave")) >= 0 || parseInt(PluginDetect.getVersion("Flash")) >= 0) ? true : false,
			quicktime: (parseInt(PluginDetect.getVersion("QuickTime")) >= 0) ? true : false
		};
	}());

	var gArgCountErr='The "%%" function requires an even number of arguments.\nArguments should be in the form "atttributeName", "attributeValue", ...',gTagAttrs=null,gQTGeneratorVersion=1;function AC_QuickTimeVersion(){return gQTGeneratorVersion}function _QTComplain(a,b){b=b.replace("%%",a);alert(b)}function _QTAddAttribute(a,b,c){var d;d=gTagAttrs[a+b];null==d&&(d=gTagAttrs[b]);return null!=d?(0==b.indexOf(a)&&null==c&&(c=b.substring(a.length)),null==c&&(c=b),c+'="'+d+'" '):""}function _QTAddObjectAttr(a,b){if(0==a.indexOf("emb#"))return"";0==a.indexOf("obj#")&&null==b&&(b=a.substring(4));return _QTAddAttribute("obj#",a,b)}function _QTAddEmbedAttr(a,b){if(0==a.indexOf("obj#"))return"";0==a.indexOf("emb#")&&null==b&&(b=a.substring(4));return _QTAddAttribute("emb#",a,b)}function _QTAddObjectParam(a,b){var c,d="",e=b?" />":">";-1==a.indexOf("emb#")&&(c=gTagAttrs["obj#"+a],null==c&&(c=gTagAttrs[a]),0==a.indexOf("obj#")&&(a=a.substring(4)),null!=c&&(d='  <param name="'+a+'" value="'+c+'"'+e+"\n"));return d}function _QTDeleteTagAttrs(){for(var a=0;a<arguments.length;a++){var b=arguments[a];delete gTagAttrs[b];delete gTagAttrs["emb#"+b];delete gTagAttrs["obj#"+b]}}function _QTGenerate(a,b,c){if(4>c.length||0!=c.length%2)return _QTComplain(a,gArgCountErr),"";gTagAttrs=[];gTagAttrs.src=c[0];gTagAttrs.width=c[1];gTagAttrs.height=c[2];gTagAttrs.classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B";gTagAttrs.pluginspage="http://www.apple.com/quicktime/download/";a=c[3];if(null==a||""==a)a="6,0,2,0";gTagAttrs.codebase="http://www.apple.com/qtactivex/qtplugin.cab#version="+a;for(var d,e=4;e<c.length;e+=2)d=c[e].toLowerCase(),a=c[e+1],"name"==d||"id"==d?gTagAttrs.name=a:gTagAttrs[d]=a;c="<object "+_QTAddObjectAttr("classid")+_QTAddObjectAttr("width")+_QTAddObjectAttr("height")+_QTAddObjectAttr("codebase")+_QTAddObjectAttr("name","id")+_QTAddObjectAttr("tabindex")+_QTAddObjectAttr("hspace")+_QTAddObjectAttr("vspace")+_QTAddObjectAttr("border")+_QTAddObjectAttr("align")+_QTAddObjectAttr("class")+_QTAddObjectAttr("title")+_QTAddObjectAttr("accesskey")+_QTAddObjectAttr("noexternaldata")+">\n"+_QTAddObjectParam("src",b);e="  <embed "+_QTAddEmbedAttr("src")+_QTAddEmbedAttr("width")+_QTAddEmbedAttr("height")+_QTAddEmbedAttr("pluginspage")+_QTAddEmbedAttr("name")+_QTAddEmbedAttr("align")+_QTAddEmbedAttr("tabindex");_QTDeleteTagAttrs("src","width","height","pluginspage","classid","codebase","name","tabindex","hspace","vspace","border","align","noexternaldata","class","title","accesskey");for(d in gTagAttrs)a=gTagAttrs[d],null!=a&&(e+=_QTAddEmbedAttr(d),c+=_QTAddObjectParam(d,b));return c+e+"> </embed>\n</object>"}function QT_GenerateOBJECTText(){return _QTGenerate("QT_GenerateOBJECTText",!1,arguments)};

	
	
	//Fullscreen API
	(function () {
		fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function() { return false; }, 
			requestFullScreen: function() {}, 
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		};
		var browserPrefixes = 'webkit moz o ms khtml'.split(' ');

		// check for native support
		if (typeof document.cancelFullScreen != 'undefined') {
			fullScreenApi.supportsFullScreen = true;
		} else {	 
			// check for fullscreen support by vendor prefix
			for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
				fullScreenApi.prefix = browserPrefixes[i];

				if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
					fullScreenApi.supportsFullScreen = true;
					break;
				}
			}
		}

		// update methods to do something useful
		if (fullScreenApi.supportsFullScreen) {
			fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

			fullScreenApi.isFullScreen = function() {
				switch (this.prefix) {	
					case '':
						return document.fullScreen;
						break;
					case 'webkit':
						return document.webkitIsFullScreen;
						break;
					default:
						return document[this.prefix + 'FullScreen'];
						break;
				}
			};
			fullScreenApi.requestFullScreen = function(el) {
				return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
			};
			fullScreenApi.cancelFullScreen = function(el) {
				return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
			};
		}
	}());


	/*
		Customized jQuery hashchange event v1.3
		https://github.com/cowboy/jquery-hashchange
		Copyright (c) 2010 "Cowboy" Ben Alman
		Dual licensed under the MIT and GPL licenses.
	*/
	(function () {
		var str_hashchange = "hashchange", doc = document, fake_onhashchange, special = $.event.special, doc_mode = doc.documentMode, supports_onhashchange = "on" + str_hashchange in window && (doc_mode === undefined || doc_mode > 7);
		function get_fragment(url) {
			url = url || location.href;
			return "#" + url.replace(/^[^#]*#?(.*)$/, "$1");
		}
		$.fn[str_hashchange] = function(fn) {
			return fn ? this.bind(str_hashchange, fn) : this.trigger(str_hashchange);
		};
		$.fn[str_hashchange].delay = 50;
		special[str_hashchange] = $.extend(special[str_hashchange], {setup:function() {
			if(supports_onhashchange) {
				return false;
			}
			$(fake_onhashchange.start);
		}, teardown:function() {
			if(supports_onhashchange) {
				return false;
			}
			$(fake_onhashchange.stop);
		}});
		fake_onhashchange = function() {
			var self = {}, timeout_id, last_hash = get_fragment(), fn_retval = function(val) {
				return val;
			}, history_set = fn_retval, history_get = fn_retval;
			self.start = function() {
				timeout_id || poll();
			};
			self.stop = function() {
				timeout_id && clearTimeout(timeout_id);
				timeout_id = undefined;
			};
			function poll() {
				var hash = get_fragment(), history_hash = history_get(last_hash);
				if(hash !== last_hash) {
					history_set(last_hash = hash, history_hash);
					$(window).trigger(str_hashchange);
				}else {
					if(history_hash !== last_hash) {
						location.href = location.href.replace(/#.*/, "") + history_hash;
					}
				}
				timeout_id = setTimeout(poll, $.fn[str_hashchange].delay);
			}
			(browser.msie) && !supports_onhashchange && function() {
				var iframe, iframe_src;
				self.start = function() {
					if(!iframe) {
						iframe_src = $.fn[str_hashchange].src;
						iframe_src = iframe_src && iframe_src + get_fragment();
						iframe = $('<iframe tabindex="-1" title="empty"/>').hide().one("load", function() {
							iframe_src || history_set(get_fragment());
							poll();
						}).attr("src", iframe_src || "javascript:0").insertAfter("body")[0].contentWindow;
						doc.onpropertychange = function() {
							try {
								if(event.propertyName === "title") {
									iframe.document.title = doc.title;
								}
							}catch(e) {}
						};
					}
				};
				self.stop = fn_retval;
				history_get = function() {
					return get_fragment(iframe.location.href);
				};
				history_set = function(hash, history_hash) {
					var iframe_doc = iframe.document, domain = $.fn[str_hashchange].domain;
					if(hash !== history_hash) {
						iframe_doc.title = doc.title;
						iframe_doc.open();
						domain && iframe_doc.write('<script>document.domain="' + domain + '"\x3c/script>');
						iframe_doc.close();
						iframe.location.hash = hash;
					}
				};
			}();
			return self;
		}();
	}());

	// Expose class globally
	window.mightySlider = mightySlider;

	// Begin the plugin
	$.fn.mightySlider = function(options, callbackMap) {
		if (version_compare($.fn.jquery, '1.7', '>=')) {
			var method, methodArgs;

			// Attributes logic
			if (!$.isPlainObject(options)) {
				if (type(options) === 'string' || options === false) {
					method = options === false ? 'destroy' : options;
					methodArgs = Array.prototype.slice.call(arguments, 1);
				}
				options = {};
			}

			// Apply to all elements
			return this.each(function (i, element) {
				// Call with prevention against multiple instantiations
				var plugin = $.data(element, namespace);

				if (!plugin && !method) {
					// Create a new object if it doesn't exist yet
					plugin = $.data(element, namespace, new mightySlider(element, options, callbackMap).init());
				}
				else if (plugin && method) {
					// Call method
					if (plugin[method]) {
						plugin[method].apply(plugin, methodArgs);
					}
				}
			});
		}
		else {
			throw "The jQuery version that was loaded is too old. mightySlider requires jQuery 1.7+";
		}
	};

	// Default options
	mightySlider.defaults = {
		// Mixed options
		moveBy:       300,     // Speed in pixels per second used by forward and backward buttons.
		speed:        300,     // Animations speed in milliseconds. 0 to disable animations.
		easing:       'swing', // Easing for duration based (tweening) animations.
		startAt:      0,       // Starting offset in slides.
		startRandom:  0,       // Starting offset in slides randomly, where: 1 = random, 0 = disable.
		viewport:     'fill',  // Sets the resizing method used to fit cover image within the viewport. Can be: 'center', 'fit', 'fill', 'stretch'.
		autoScale:    0,       // Automatically updates slider height based on base width.
		autoResize:   0,       // Auto resize the slider when active slide is bigger than slider FRAME.
		videoFrame:   null,    // The URL of the video frame to play videos with your custom player.

		// Navigation
		navigation: {
			horizontal:      1,               // Switch to horizontal mode.
			navigationType:  'forceCentered', // Slide navigation type. Can be: 'basic', 'centered', 'forceCentered'.
			slideSelector:   null,            // Select only slides that match this selector.
			smart:           1,               // Repositions the activated slide to help with further navigation.
			activateOn:      null,            // Activate an slide on this event. Can be: 'click', 'mouseenter', ...
			activateMiddle:  1,               // Always activate the slide in the middle of the FRAME. forceCentered only.
			slideSize:       0,               // Sets the slides size. Can be: Fixed(500) or Percent('100%') number.
			keyboardNavBy:   null             // Enable keyboard navigation by 'slides' or 'pages'.
		},

		// Deep-Linking
		deeplinking: {
			linkID:     null, // Sets the deeplinking id.
			scrollTo:   0,    // Enable scroll to slider when link changed.
			separator:  '/'   // Separator between linkID and slide ID.
		},

		// Scrolling
		scrolling: {
			scrollSource: null, // Selector or DOM element for catching the mouse wheel scrolling. Default is FRAME.
			scrollBy:     0     // Slides to move per one mouse scroll. 0 to disable scrolling.
		},

		// Dragging
		dragging: {
			dragSource:    null, // Selector or DOM element for catching dragging events. Default is FRAME.
			mouseDragging: 1,    // Enable navigation by dragging the SLIDEELEMENT with mouse cursor.
			touchDragging: 1,    // Enable navigation by dragging the SLIDEELEMENT with touch events.
			releaseSwing:  1,    // Ease out on dragging swing release.
			swingSync:     7.5,  // Swing synchronization.
			swingSpeed:    0.2,  // Swing synchronization speed, where: 1 = instant, 0 = infinite.
			elasticBounds: 1,    // Stretch SLIDEELEMENT position limits when dragging past FRAME boundaries.
			syncSpeed:     0.5,  // SLIDEELEMENT synchronization speed, where: 1 = instant, 0 = infinite.
			interactive:   null  // Selector for special interactive elements.
		},

		// Pages
		pages: {
			pagesBar:       null, // Selector or DOM element for pages bar container.
			activateOn:     null, // Event used to activate page. Can be: click, mouseenter, ...
			pageBuilder:          // Page item generator.
				function (index) {
					return '<li>' + (index + 1) + '</li>';
				}
		},

		// Thumbnails
		thumbnails: {
			thumbnailsBar:       null,    // Selector or DOM element for thumbnails bar container.
			horizontal:          1,       // Switch to horizontal mode.
			preloadThumbnails:   1,       // Enable preload thumbnails images.
			thumbnailNav:        'basic', // Thumbnail navigation type. Can be: 'basic', 'centered', 'forceCentered'.
			activateOn:          'click', // Event used to activate thumbnail. Can be: click, mouseenter, ...
			scrollBy:            1,       // Thumbnails to move per one mouse scroll. 0 to disable scrolling.
			mouseDragging:       1,       // Enable navigation by dragging the thumbnailsBar with mouse cursor.
			touchDragging:       1,       // Enable navigation by dragging the thumbnailsBar with touch events.
			thumbnailSize:       0,       // Set thumbnails size. Can be: 500 and '100%'.
			thumbnailBuilder:             // Thumbnail item generator.
				function (index, thumbnail) {
					return '<li><img src="' + thumbnail + '" /></li>';
				}
		},

		// Commands
		commands: {
			thumbnails:     0, // Enable thumbnails navigation.
			pages:          0, // Enable pages navigation.
			buttons:        0  // Enable navigation buttons.
		},

		// Navigation buttons
		buttons: {
			forward:    null, // Selector or DOM element for "forward movement" button.
			backward:   null, // Selector or DOM element for "backward movement" button.
			prev:       null, // Selector or DOM element for "previous slide" button.
			next:       null, // Selector or DOM element for "next slide" button.
			prevPage:   null, // Selector or DOM element for "previous page" button.
			nextPage:   null, // Selector or DOM element for "next page" button.
			fullScreen: null  // Selector or DOM element for "fullscreen" button.
		},

		// Automated cycling
		cycling: {
			cycleBy:       null, // Enable automatic cycling by 'slides' or 'pages'.
			pauseTime:     5000, // Delay between cycles in milliseconds.
			pauseOnHover:  0,    // Pause cycling when mouse hovers over the FRAME.
			startPaused:   0     // Whether to start in paused sate.
		},

		// Classes
		classes: {
			isTouchClass:        'isTouch',        // Class for when device has touch ability.
			draggedClass:        'dragged',        // Class for dragged SLIDEELEMENT.
			activeClass:         'active',         // Class for active slides and pages.
			disabledClass:       'disabled',       // Class for disabled navigation elements.
			verticalClass:       'vertical',       // Class for vertical sliding mode.
			horizontalClass:     'horizontal',     // Class for horizontal sliding mode.
			showedCaptionsClass: 'showed',         // Class for showed captions.
			isInFullScreen:      'isInFullScreen'  // Class for showed captions.
		}
	};
	
})(jQuery, this);