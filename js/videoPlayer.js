$.prototype.videoPlayer = function (params) {
	$.triggerEvent = function (event, params, object) {
		if (params && params[event] && typeof (params[event]) === 'function') {
			return params[event](object);
		}
		return false;
	};

	if (!params) {
		params = {};
	}
	
	$(this).each(function () {
		var container = $(this);

		$.triggerEvent('beforePlay', params, container);

		var accepVideoParams = ['autoplay', 'loop', 'muted'];

		var paramsArray = [];


		if (params.videoParams && typeof (params.videoParams) === 'object') {
			for (ind in params.videoParams) {

				if (accepVideoParams.indexOf(params.videoParams[ind]) !== -1) {
					paramsArray.push(params.videoParams[ind]);
				}
			}
		}
		var video = $('<video ' + paramsArray.join(' ') + '></video>').attr({
			src: container.data('src'),
			height: container.innerHeight(),
			width: container.innerWidth()
		});

		video.on('click', function(){
			if(video.get(0).paused){
				video.get(0).play();
			}
			else{
				video.get(0).pause();
			}
		});
		
		video.on('pause', function () {
			$.triggerEvent('onPause', params, video);
		});

		video.on('ended', function () {
			$.triggerEvent('onEnd', params, video);
		});

		video.on('play', function () {
			$.triggerEvent('onStart', params, video);
		});

		if (params.responsive) {

			video.removeAttr('height').removeAttr('width');
			container.css({
				position: 'relative',
				overflow: 'hidden'
			});

			video.on('loadedmetadata', function () {
				var videoHeight = $(this).get(0).height;
				var videoWidth = $(this).get(0).width;
				
				var styles = {
					height: '100%',
					width: 'auto',
					top: '-100%',
					bottom: '-100%',
					left: '-100%',
					right: '-100%',
					margin: 'auto',
					position: 'absolute'
				};

				if (videoWidth < container.innerWidth()) {
					styles.height = 'auto';
					styles.width = '100%';
				}
				
				video.duration = video.get(0).duration;
				
				video.volume = video.get(0).volume;
				video.css(styles);
			});
		}
		
		if(params.controls){
			var controlPanelWrapper= $('<div></div>').addClass('video-control-panel-wrapper').css({
				'position':'absolute',
				'bottom' : '0',
				'height' : '1%',
				'width' : '100%',
				'z-index': 100
			});
			
			var controllPanel = $('<div></div>').addClass('control-panel').css({
				'position':'absolute',
				'bottom' : '0',
				'height' : '100%',
				'width' : '90%',
				'background' : 'rgba(94, 194, 43, 0.4)',
				'z-index': 100,
				'cursor' : 'pointer'
			});
			
			var progressBar = $('<div></div>').addClass('video-progress').css({
				'height' : '100%',
				'width' : '0%',
				'background' : '#5ec22b'
			});
			
		
			
			var volumeBarWrapper = $('<div></div>').addClass('volume-wrapper').css({
				height: '100%',
				width: '10%',
				float: 'right',
				background :'rgba(249, 171, 0, 0.4)',
				cursor : 'pointer'
			});
			
			var volumeBar = $('<div></div>').addClass('volume-wrapper').css({
				height: '100%',
				width: (video.volume * 100)  + '%',
				background :'rgb(249, 171, 0)',
			});
			
			volumeBarWrapper.append(volumeBar);
			controlPanelWrapper.append(volumeBarWrapper);
			
			controllPanel.append(progressBar);
			controlPanelWrapper.append(controllPanel);
			
			/*controlPanelWrapper.on('mouseover', function(){
				$(this).find('.control-panel').slideDown('fast');
			});
			
			controlPanelWrapper.on('mouseleave', function(){
				$(this).find('.control-panel').slideUp('fast');
			});*/
			
			
			var videoStart = function (func) {
				video.interval = setInterval(function () {
					var progress = (video.get(0).currentTime) * 100 / video.duration;
					progressBar.animate({width: progress + '%'}, 10);
				}, 10);
			};

			var videoStop = function () {
				clearInterval(video.interval);
			};

			video.on('pause', function () {
				videoStop();
			});

			video.on('ended', function () {
				progressBar.animate({width: '100%'}, 10);
				videoStop();
			});

			video.on('play', function () {
				videoStart();
			});
			
			controllPanel.on('click', function(e){
				var position = e.pageX - $(this).offset().left;
				var progress = position/$(this).innerWidth() * 100;
				progressBar.animate({width: progress + '%'}, 10);
				video.get(0).currentTime = video.duration*(progress/100);
				if(!video.get(0).paused)
					video.get(0).play();
			});
			
			volumeBarWrapper.on('click', function(e){
				var position = e.pageX - $(this).offset().left;
				var progress = position/$(this).innerWidth();
				volumeBar.animate({width: progress *100 + '%'}, 200);
				video.get(0).volume=progress;
			});
			
			container.append(controlPanelWrapper);
		}
		container.append(video);
	});
};