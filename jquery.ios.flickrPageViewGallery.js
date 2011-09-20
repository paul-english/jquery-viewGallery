(function($){

     $.fn.flickrPageViewGallery = function(options) {

	 var settings = {
	     'api_key': null,
	     'base_url': 'http://api.flickr.com/services/rest/',

	     'modal_classname': 'miniFlickrModal',
	     'gallery_classname': 'miniFlickrGallery',

	     'pager_autoHeight': false,
	     'pager_classname': 'miniFlickerPager',
	     'pager_height': '600px',
	     'pager_width': '800px',
	     'pager_background': '#000000',
	     'pager_tolerance': 0.5,
	     'pager_delay': 300

	 };

	 var mousedown = false;
	 var mouseX = 0;
	 var imagesLength = 0;
	 var imagesCurrent = 0;
	 var xdiff = 0;
	 var containerHeight = 0;
	 var containerWidth = 0;
	 var touchStart = 0;
	 var isInit = false;

	 return this.each(function() {
			      var $this = $(this);
			      if (options) {
				  $.extend(settings, options);
			      }

			      // Remove content in div
			      $this.empty();
			      
			      // Additional Flickr API params
			      var filter = $this.attr('rel');

			      // Size of grid thumbnails
			      var formatArray = $this.attr("lang").split("&");
			      var format = formatArray[0];
			      var formatGal = formatArray[1];
			      
			      var is_photoset = $this.attr('longdesc');

			      insert_html(this);

			      var pager = $('.' + settings.pager_classname);
			      pager.css('backgroundColor', settings.pager_background);
			      pager.prepend('<div class="imageHandler" />');

			      var imageHandler = pager.find('.imageHandler');

			      pager_init(pager, imageHandler);
			      $(window).resize(function() { isInit = false; pager_init(pager, imageHandler); });

			      build_gallery(filter, this, format, is_photoset, formatGal);

			      var $pager_ul = $('.' + settings.pager_classname + ' ul');

			      imageHandler.bind('touchstart', function(e) {
						    var touch = e.originalEvent.touches[0] ||  e.originalEvent.changedTouches[0];
						    if (!this.mousedown) {
							this.mousedown = true;
							this.mouseX = touch.pageX;
						    }
						    e.preventDefault();
						    return false;
						});
			      imageHandler.bind('touchmove', function(e) {
						    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						    if (this.mousedown) {
							xdiff = touch.pageX - this.mouseX;
							$pager_ul.css('left', -imagesCurrent * containerWidth + xdiff);
						    }
						    e.preventDefault();
						    return false;
						});
			      imageHandler.bind('touchend', function(e) {
						    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						    this.mousedown = false;
						    if (!xdiff) return false;
						    var fullWidth = parseInt(settings.pager_width);
						    var halfWidth = fullWidth / 2;
						    if (-xdiff > halfWidth * settings.pager_tolerance) {
							imagesCurrent++;
							imagesCurrent = imagesCurrent >= imagesLength ? imagesLength - 1 : imagesCurrent;
							if (imagesCurrent == (imagesLength - 1)) {
							    $('.' + settings.pager_classname + ' .caption').html('<span class="left">&laquo;</span>');
							} else {
							    $('.' + settings.pager_classname + ' .caption').html('<span class="left">&laquo;</span><span class="right">&raquo;</span>');
							}
							$pager_ul.animate({
									     left: -imagesCurrent * containerWidth
									 }, settings.pager_delay);
						    } else if (xdiff > halfWidth - fullWidth * settings.pager_tolerance) {
							imagesCurrent--;
							imagesCurrent = imagesCurrent < 0 ? 0 : imagesCurrent;
							if (imagesCurrent == 0) {
							    $('.' + settings.pager_classname + ' .caption').html('<span class="right">&raquo;</span>');
							} else {
							    $('.' + settings.pager_classname + ' .caption').html('<span class="left">&laquo;</span><span class="right">&raquo;</span>');
							}
							$pager_ul.animate({
									     left: -imagesCurrent * containerWidth
									 }, settings.pager_delay);
						    } else {
							$pager_ul.animate({
									     left: -imagesCurrent * containerWidth
									 }, settings.pager_delay);
						    }
						    xdiff = 0;
						    e.preventDefault();
						    return false;
						});
			      imageHandler.bind('mousedown', function(e) {
						    if (!this.mousedown) {
							this.mousedown = true;
							this.mouseX = e.pageX;
						    }
						    return false;
						});
			      imageHandler.bind('mousemove', function(e) {
						    if (this.mousedown) {
							xdiff = e.pageX - this.mouseX;
							$pager_ul.css('left', -imagesCurrent * containerWidth + xdiff);
						    }
						    return false;
						});
			      imageHandler.bind('mouseup', function(e) {
						    this.mousedown = false;
						    if (!xdiff) return false;
						    var fullWidth = parseInt(settings.pager_width);
						    var halfWidth = fullWidth / 2;
						    if (-xdiff > halfWidth - fullWidth * settings.pager_tolerance) {
							imagesCurrent++;
							imagesCurrent = imagesCurrent >= imagesLength ? imagesLength - 1 : imagesCurrent;
							if (imagesCurrent == (imagesLength - 1)) {
							    $('.' + settings.pager_classname + ' .caption').html('<span class="left">&laquo;</span>');
							} else {
							    $('.' + settings.pager_classname + ' .caption').html('<span class="left">&laquo;</span><span class="right">&raquo;</span>');
							}
							$pager_ul.animate({
									     left: -imagesCurrent * containerWidth
									 }, settings.pager_delay);
						    } else if (xdiff > halfWidth - fullWidth * settings.pager_tolerance) {
							imagesCurrent--;
							imagesCurrent = imagesCurrent < 0 ? 0 : imagesCurrent;
							if (imagesCurrent == 0) {
							    $('.' + settings.pager_classname + ' .caption').html('<span class="right">&raquo;</span>');
							} else {
							    $('.' + settings.pager_classname + ' .caption').html('<span class="left">&laquo;</span><span class="right">&raquo;</span>');
							}
							$pager_ul.animate({
									     left: -imagesCurrent * containerWidth
									 }, settings.pager_delay);
						    } else {
							$pager_ul.animate({
									     left: -imagesCurrent * containerWidth
									 }, settings.pager_delay);
						    }
						    xdiff = 0;
						    return false;
						});
			      imageHandler.bind('mouseleave', function(e) {
						    imageHandler.mouseup();
						});

			      $('.' + settings.modal_classname + ' .close').bind('touchend', function(e) {
										   $(this).parent().css('visibility', 'hidden')
										     .css('z-index', '-30');
									       });
			      $('.' + settings.modal_classname + ' .close').bind('mouseup', function(e) {
										   $(this).parent().css('visibility', 'hidden')
										     .css('z-index', '-30');
									       });

			      $(window).bind('scroll', function() {
						 $('.' + settings.modal_classname).css('top', $(window).scrollTop() + 'px');
						 $('.' + settings.modal_classname + ' .close').css('top', ($(window).scrollTop() + 5) + 'px');
					     });
			      setInterval(function() {
					      $('.' + settings.modal_classname).css('top', $(window).scrollTop() + 'px');
					      $('.' + settings.modal_classname + ' .close').css('top', ($(window).scrollTop() + 5) + 'px');
					  }, 100);

			  });

	 function move_to_pager_image(image) {
	     imagesCurrent = image;
	     var $pager_ul = $('.' + settings.pager_classname + ' ul');
	     $pager_ul.css('left', -imagesCurrent * containerWidth);
	     if (imagesCurrent == (imagesLength - 1)) {
		 $('.' + settings.pager_classname + ' .caption').html('<span class="left">&laquo;</span>');
	     } else if (imagesCurrent == 0) {
		 $('.' + settings.pager_classname + ' .caption').html('<span class="right">&raquo;</span>');
	     } else {
		 $('.' + settings.pager_classname + ' .caption').html('<span class="left">&laquo;</span><span class="right">&raquo;</span>');
	     }
	 }

	 function debug(text) {
	     console.log(text);
	     $('.' + settings.pager_classname + ' .caption').html(text);
	 }

	 function doResizeImage(listElement) {
	     var $listElement = $(listElement);
	     $listElement.css('height', containerHeight);
	     $listElement.css('width', containerWidth);
	     var img = $listElement.find('img');
	     if (img.width() / containerWidth > img.height() / containerHeight) {
		 img.width(containerWidth);
		 var top = parseInt((containerHeight - img.height()) / 2);
	     } else {
		 img.height(containerHeight);
		 var left = parseInt((containerWidth - img.width()) / 2);
	     }

	     $listElement.parent().css('width', imagesLength * containerWidth);
	 }

	 function pager_init(parent, imageHandler) {
	     var obj = $('.'+ settings.pager_classname + ' ul');
	     if (isInit) return;
	     isInit = true;
	     if (settings.pager_autoHeight) {
		 containerHeight = $(window).height();
		 containerWidth = $(window).width();
	     } else {
		 containerHeight = parseInt(settings.pager_height);
		 containerWidth = parseInt(settings.pager_width);
	     }
	     parent.css('height', containerHeight);
	     parent.css('width', containerWidth);
	     imageHandler.css('width', containerWidth);
	     imageHandler.css('height', containerHeight);
	     imageHandler.css('left', parent.position().left);
	     imageHandler.css('top', parent.position().top);
	     var modal = $('.' + settings.modal_classname);
	     modal.css('height', containerHeight);
	 }

	 function insert_html(obj) {

	     var css = '<style>' +
		 '.' + settings.modal_classname + ' {background:rgba(0,0,0,0.3);width:100%;height:100%;z-index:-30;position:fixed;left:0;top:0;visibility:hidden;}' + 
		 '.' + settings.gallery_classname + ' {list-style-type:none;text-align:center;padding:0;}' +
		 '.' + settings.gallery_classname + ' li {display:inline-block;padding:0 2px;text-align:center;}' +
		 '.' + settings.pager_classname + ' {overflow:hidden;}' + 
		 '.' + settings.pager_classname + ' ul {list-style-type:none;position:relative;margin:0;padding:0;}' + 
		 '.' + settings.pager_classname + ' li {display:block;float:left;text-align:center;}' + 
		 '.' + settings.pager_classname + ' li img {margin:0 auto;}' + 
		 '.' + settings.pager_classname + ' .imageHandler {position:absolute;z-index:40;cursor:pointer;}' + 
		 '.' + settings.pager_classname + ' .caption {background:rgba(0,0,0,0.5);color:#fff;text-shadow:1px 1px 1px #000;width:100%;height:35px;position:absolute;bottom:0;text-align:center;line-height:35px;font-size:16px;font-family:Arial;}' + 
		 '.' + settings.pager_classname + ' .caption span, .' + settings.modal_classname + ' .close {padding:0;border-radius:15px;background:rgba(255,255,255,0.3);color:#fff;text-shadow:1px 1px 1px rgba(0,0,0,0.5);margin:5px;height:25px;width:25px;display:inline-block;line-height:25px;}' + 
		 '.' + settings.pager_classname + ' .caption .left {float:left;}' + 
		 '.' + settings.pager_classname + ' .caption .right {float:right;}' + 
		 '.' + settings.modal_classname + ' .close {z-index:50;cursor:pointer;position:fixed;top:5px;right:5px;text-align:center;font-family:Arial;font-size:10px;}' + 
		 '</style>';

	     var html = '<div class="' + settings.modal_classname + '">' +
                     '<div class="' + settings.pager_classname + '">' +
                         '<ul />' +
                         '<div class="caption">' +
 '<span class="right">&raquo;</span>' + 
                         '</div>' + 
                     '</div>' +
                     '<div class="close" >X</div>' + 
		 '</div>' +
		 '<ul class="' + settings.gallery_classname + '" />';

	     $(obj).append(css);
	     $(obj).append(html);

	 }

	 function build_gallery(filter, obj, format, is_photoset, formatGal) {

	     var api = settings.base_url;

	     if (is_photoset == "photoset") {

		 var method = 'flickr.photosets.getPhotos';
		 api += "?method=" + method + 
		     "&api_key=" + settings.api_key + 
		     "&" + filter;

	     } else {

		 var method = 'flickr.photos.search';
		 var tag_mode = 'all';
		 api += "?method=" + method + 
		     "&api_key=" + settings.api_key + 
		     "&tag_mode=" + tag_mode + 
		     "&" + filter; 

	     }

	     api += "&format=json" + 
		 "&nojsoncallback=1";

	     $.getJSON(api, function(data) {

			   var photo = (is_photoset == "photoset") ? data.photoset.photo : data.photos.photo;

		           $.each(photo, function(i,item){   

		        	      if (typeof item.description != "undefined") {
					  var description = item.description._content;
				      } else {
					  var description = "";
				      }
				      var titleImg = item.title;

				      var gallery_attrib = {
					  src: "http://farm" + item.farm + ".static.flickr.com/" + item.server + "/" + item.id + "_" + item.secret + format + ".jpg", 
					  alt: item.title, 
					  longdesc: "http://www.flickr.com/photos/" + item.owner + "/" + item.id, 
					  rel: description, 
					  title: titleImg,
					  'data-index': imagesLength
				      };
				      
				      var $img = $('<img />').attr(gallery_attrib)
					  .appendTo($('ul.' + settings.gallery_classname))
					  .wrap('<li />')
					  .addClass('flickr-mini-gallery-thumb');
				      
				      var pager_attrib = {
					  src: "http://farm" + item.farm + ".static.flickr.com/" + item.server + "/" + item.id + "_" + item.secret + ".jpg",
					  alt: item.title,
					  logndesc: "http://www.flickr.com/photos/" + item.owner + "/" + item.id,
					  rel: description,
					  title: titleImg
				      };

				      var $pager_img = $('<img />').attr(pager_attrib)
					  .appendTo($('div.' + settings.pager_classname + ' ul'))
					  .wrap('<li />')
					  .addClass('flick-mini-pager');

				      doResizeImage($pager_img.parent()[0]);
				      imagesLength++;

				      $img.bind('touchend', function(e) {
						    e.preventDefault();
						    move_to_pager_image($(this).attr('data-index'));
						    $('.miniFlickrModal').css('visibility', 'visible')
							.css('z-index', '30');
						});
				      $img.bind('mouseup', function(e) {
						    e.preventDefault();
						    move_to_pager_image($(this).attr('data-index'));
						    $('.miniFlickrModal').css('visibility', 'visible')
							.css('z-index', '30');
						});


				  });

		       });	 

	 }

     };

 })(jQuery);

