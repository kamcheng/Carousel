/*
 *	Inspired by and credit to Nathan Searles
 *	http://nathansearles.com/loopedslider/
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	
 *  Modified to support pagination, rotate slides forever, slides and subslides, auto start options
 */

/*
 markup example for $('#loopedSlider').loopedSlider({ autoStart: 2000 });

<div id="loopedSlider">
    <div class="slides">
        <div><img src="/img/home/slider_quote_cnet.png" width="974" height="240"  /></div>
        <div><img src="/img/home/slider_phones.png" width="974" height="240"  /></div>
        <div class="subSlides">
            <div><img src="/img/home/slider_quote_gizmodo.png" width="974" height="240"  /></div>
            <div><img src="/img/home/slider_demo.png" width="974" height="240"  /></div>
            <div><img src="/img/home/slider_quote_time.png" width="974" height="240" /></div>
            <div><img src="/img/home/slider_phones.png" width="974" height="240"  /></div>
        </div>
    </div>
</div>
*/

(function($) {
	$.fn.loopedSlider = function(options) {

        var defaults = {
            slides: '.slides',  //rotate slides
            subSlides: '.subSlides', //rotate subslides
            autoStart: 0, // Set to positive number for auto interval and interval time
            slidespeed: 300, // Speed of slide animation
            fadespeed: 300, // Speed of fade animation
            autoHeight: false, // Set to positive number for auto height and animation speed
            slideStyle: 'fade' //slider style "fade" - fade in/out effect. "slide" - slide left effect
        };

        this.each(function() {

            var obj = $(this),
                o = $.extend(defaults, options),
                size = $(o.slides,obj).children().size(),
                width = $(o.slides,obj).children().outerWidth(),
                position = 0,
                newPosition = 0,
                currentSlider = false,
                num = 0,
                newNum = 1,
                sliderIntervalID = null,
                //pq = $.urlLight.param("pq"),  //param pq(promo quote), Required and depends on js plugin jquery.urlLight.js
                pagination = $('<div class="pagination"></div>'),
                subSlides = $(o.subSlides,obj).children(),
                firstSubSlide = $(o.subSlides +' div:eq(0)', obj),
                lastSubSlide = $(subSlides).filter(':last'),
                randomNumber = 0;

            $(o.slides,obj).css({width:(size*width)});

            $(o.slides,obj).children().each(function(){
                $(this).css({position:'absolute', left:position, display:'block'});
                position = position + width;
            });

            /* add pagination on the fly*/
            if(size > 1){ //no pagination if only one slide
                pagination.append('<a href="#" class="previous">previous</a>');
                for(var i=1; i<=size; i++){
                    pagination.append('<a href="#" class="list" rel="'+ i +'">'+ i +'</a>');
                }
                pagination.append('<a href="#" class="next">next</a>');
                pagination.appendTo(obj);

                var paginationPos = (width/2) - (size * 10);
                pagination.css({'left' : paginationPos});
                $('.pagination a.list:first',obj).addClass('active');
            }

            /* with specify promo quote, e.g. www.thumbplay.com/?pq=2 
            if(pq){
                var pqNum = parseInt(pq);
                animateSlider(o.slideStyle + 'Fade', pqNum);
            } else {
                $('.pagination a.list:first',obj).addClass('active');
            }*/

            $(o.slides,obj).children(':eq('+(size-1)+')').css({position:'absolute',left:-width});

            if(o.autoHeight){ autoHeight(newNum); }

            $('.next',obj).click(function(){
                if(currentSlider===false) {
                    animateSlider(o.slideStyle + 'Next');

                    if(o.autoStart){
                        clearInterval(sliderIntervalID);
                        sliderInterval();
                    }
                } return false;
            });

            $('.previous',obj).click(function(){
                if(currentSlider===false) {
                    animateSlider(o.slideStyle + 'Prev');

                    if(o.autoStart){
                        clearInterval(sliderIntervalID);
                        sliderInterval();
                    }
                } return false;
            });

            $('.pagination a.list',obj).click(function(){
                if($(this).hasClass('active')) {
                    return false;
                } else {
                    if(currentSlider===false) {
                        newNum = $(this).attr('rel');

                        $('.pagination a.list',obj).removeClass('active');
                        $(this).addClass('active');

                        animateSlider(o.slideStyle + 'Fade');

                        if(o.autoStart){
                            clearInterval(sliderIntervalID);
                            sliderInterval();
                        }
                    } return false;

                } return false;
            });

            if (o.autoStart && (size > 1)) { //no effect is only one slide
                sliderInterval();
            }

            function sliderInterval() {
                sliderIntervalID = setInterval(function(){
                    if(currentSlider===false) {animateSlider(o.slideStyle + 'Next');}
                }, o.autoStart);
            };

            //subSlides
            randomNumber = Math.floor(Math.random() * subSlides.size());
            $(subSlides).hide();
            $(o.subSlides +' div:eq('+ randomNumber +')', obj).show();

            function subSliderInterval() {
                if($(lastSubSlide).is(':visible')) {
                    var nextElem = $(firstSubSlide);
                } else {
                    var nextElem = $(subSlides).filter(':visible').next();
                }
                $(subSlides).hide();
                $(nextElem).show();
            }
            //end subSlides

            function current(newNum) {
                if(newNum===size+1){ newNum = 1;}
                if(newNum===0){ newNum = size; }
                if(newNum===size) { subSliderInterval(); }

                $('.pagination a.list',obj).removeClass('active');
                $('.pagination a.list[rel="' + (newNum) + '"]',obj).addClass('active');
            };

            function autoHeight(newNum) {
                if(newNum===size+1){ newNum = 1; }
                if(newNum===0){ newNum = size; }
                var getHeight = $(o.slides,obj).children(':eq('+(newNum-1)+')',obj).outerHeight();
                $(o.container,obj).animate({height: getHeight},o.autoHeight);
            };

            function animateSlider(dir, anchor){
                currentSlider = true;
                switch(dir){
                    case 'slideNext':
                        newNum = newNum + 1;
                        newPosition = (-(newNum*width-width));
                        current(newNum);

                        if(o.autoHeight){ autoHeight(newNum); }

                        $(o.slides,obj).animate({left: newPosition}, o.slidespeed,function(){
                            if (newNum===size+1) {
                                newNum = 1;
                                $(o.slides,obj).css({left:0},function(){$(o.slides,obj).animate({left:newPosition})});
                                $(o.slides,obj).children(':eq(0)').css({left: 0});
                                $(o.slides,obj).children(':eq('+(size-1)+')').css({ position:'absolute',left:-width});
                            }
                            if (newNum===size) $(o.slides,obj).children(':eq(0)').css({left:(size*width)});
                            if (newNum===size-1) $(o.slides,obj).children(':eq('+(size-1)+')').css({left:size*width-width});
                            currentSlider = false;
                        });
                        break;

                    case 'slidePrev':
                        newNum = newNum-1;
                        newPosition = (-(newNum*width-width));
                        current(newNum);

                        if(o.autoHeight){ autoHeight(newNum); }

                        $(o.slides,obj).animate({left: newPosition}, o.slidespeed,function(){
                            if (newNum===0) {
                                newNum = size;
                                $(o.slides,obj).children(':eq('+(size-1)+')').css({position:'absolute',left:(size*width-width)});
                                $(o.slides,obj).css({left: -(size*width-width)});
                                $(o.slides,obj).children(':eq(0)').css({left:(size*width)});
                            }
                            if (newNum===2 ) $(o.slides,obj).children(':eq(0)').css({position:'absolute',left:0});
                            if (newNum===1) $(o.slides,obj).children(':eq('+ (size-1) +')').css({position:'absolute',left:-width});
                            currentSlider = false;
                        });
                        break;

                    case 'slideFade':
                        if(anchor) { newNum = anchor; }
                        newNum = newNum * 1;
                        newPosition = (-(newNum*width-width));

                        current(newNum);

                        if(o.autoHeight){ autoHeight(newNum); }

                        $(o.slides,obj).children().fadeOut(o.fadespeed, function(){
                            $(o.slides,obj).css({left: newPosition});
                            $(o.slides,obj).children(':eq('+(size-1)+')').css({left:size*width-width});
                            $(o.slides,obj).children(':eq(0)').css({left:0});
                            if(newNum===size){$(o.slides,obj).children(':eq(0)').css({left:(size*width)});}
                            if(newNum===1){$(o.slides,obj).children(':eq('+(size-1)+')').css({ position:'absolute',left:-width});}
                            $(o.slides,obj).children().fadeIn(o.fadespeed);
                            currentSlider = false;
                        });
                        break;

                    case 'fadeNext':
                        newNum = newNum + 1;
                        newPosition = (-(newNum*width-width));

                        current(newNum);

                        if(o.autoHeight){ autoHeight(newNum); }

                        $(o.slides,obj).children().fadeOut(o.fadespeed, function(){
                        if (newNum===size+1) newNum = 1;
                            $(o.slides,obj).css({left: newPosition});
                            $(o.slides,obj).children(':eq('+(size-1)+')').css({left:size*width-width});

                            if(newNum===1){  $(o.slides,obj).css({left: 0});  }
                            $(o.slides,obj).children().fadeIn(o.fadespeed);
                            currentSlider = false;
                        });
                        break;

                    case 'fadePrev':
                        newNum = newNum - 1;
                        newPosition = (-(newNum*width-width));

                        current(newNum);

                        if(o.autoHeight){ autoHeight(newNum); }

                        $(o.slides,obj).children().fadeOut(o.fadespeed, function(){
                        if (newNum===0) newNum = size;
                            $(o.slides,obj).css({left: newPosition});
                            $(o.slides,obj).children(':eq('+(size-1)+')').css({left:size*width-width});

                        if(newNum===size) { $(o.slides,obj).css({left:-(size*width-width)}); }
                            $(o.slides,obj).children().fadeIn(o.fadespeed);
                            currentSlider = false;
                        });
                        break;

                    case 'fadeFade':
                        if(anchor) { newNum = anchor; }
                        newNum = newNum * 1;
                        newPosition = (-(newNum*width-width));

                        current(newNum);

                        if(o.autoHeight){ autoHeight(newNum); }

                        $(o.slides,obj).children().fadeOut(o.fadespeed, function(){
                        if (newNum===size+1) newNum = 1;
                            $(o.slides,obj).css({left: newPosition});
                            $(o.slides,obj).children(':eq('+(size-1)+')').css({left:size*width-width});

                            if(newNum===1){  $(o.slides,obj).css({left: 0});  }
                            $(o.slides,obj).children().fadeIn(o.fadespeed);
                            currentSlider = false;
                        });
                        break;

                    default:
                        break;
				}
			};
		});
	};
})(jQuery);