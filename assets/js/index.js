if (!Array.prototype.filter) {
  Array.prototype.filter = function(func, thisArg) {
    'use strict';
    if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
        throw new TypeError();

    var len = this.length >>> 0,
        res = new Array(len), // preallocate array
        t = this, c = 0, i = -1;

    var kValue;
    if (thisArg === undefined){
      while (++i !== len){
        // checks to see if the key was set
        if (i in this){
          kValue = t[i]; // in case t is changed in callback
          if (func(t[i], i, t)){
            res[c++] = kValue;
          }
        }
      }
    }
    else{
      while (++i !== len){
        // checks to see if the key was set
        if (i in this){
          kValue = t[i];
          if (func.call(thisArg, t[i], i, t)){
            res[c++] = kValue;
          }
        }
      }
    }

    res.length = c; // shrink down array to proper size
    return res;
  };
}

(function(){
    if (typeof Blazy !== undefined) {
        new Blazy({});
    }

    function debounce(func, wait, immediate) {
    	var timeout;
    	return function() {
    		var context = this, args = arguments;
    		var later = function() {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		};
    		var callNow = immediate && !timeout;
    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    		if (callNow) func.apply(context, args);
    	};
    }

    var simpleParallax = (function() {
        function parallax(target) {
            var boundProperties = {},
                easing = {
                    inQuad: function (t, b, c, d) {
                    	t /= d;
                    	return c*t*t + b;
                    },
                    outQuad: function (t, b, c, d) {
                    	t /= d;
                    	return -c * t*(t-2) + b;
                    },
                    inOutQuad: function (t, b, c, d) {
                    	t /= d/2;
                    	if (t < 1) return c/2*t*t + b;
                    	t--;
                    	return -c/2 * (t*(t-2) - 1) + b;
                    },
                    inCubic: function (t, b, c, d) {
                    	t /= d;
                    	return c*t*t*t + b;
                    },
                    outCubic: function (t, b, c, d) {
                    	t /= d;
                    	t--;
                    	return c*(t*t*t + 1) + b;
                    },
                    inOutCubic: function (t, b, c, d) {
                    	t /= d/2;
                    	if (t < 1) return c/2*t*t*t + b;
                    	t -= 2;
                    	return c/2*(t*t*t + 2) + b;
                    },
                    inQuart: function (t, b, c, d) {
                    	t /= d;
                    	return c*t*t*t*t + b;
                    },
                    outQuart: function (t, b, c, d) {
                    	t /= d;
                    	t--;
                    	return -c * (t*t*t*t - 1) + b;
                    },
                    inOutQuart: function (t, b, c, d) {
                    	t /= d/2;
                    	if (t < 1) return c/2*t*t*t*t + b;
                    	t -= 2;
                    	return -c/2 * (t*t*t*t - 2) + b;
                    },
                    inQuint: function (t, b, c, d) {
                    	t /= d;
                    	return c*t*t*t*t*t + b;
                    },
                    outQuint: function (t, b, c, d) {
                    	t /= d;
                    	t--;
                    	return c*(t*t*t*t*t + 1) + b;
                    },
                    inOutQuint: function (t, b, c, d) {
                    	t /= d/2;
                    	if (t < 1) return c/2*t*t*t*t*t + b;
                    	t -= 2;
                    	return c/2*(t*t*t*t*t + 2) + b;
                    },
                    inSine: function (t, b, c, d) {
                    	return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
                    },
                    outSine: function (t, b, c, d) {
                    	return c * Math.sin(t/d * (Math.PI/2)) + b;
                    },
                    inOutSine: function (t, b, c, d) {
                    	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
                    },
                    inExpo: function (t, b, c, d) {
                    	return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
                    },
                    outExpo: function (t, b, c, d) {
                    	return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
                    },
                    inOutExpo: function (t, b, c, d) {
                    	t /= d/2;
                    	if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
                    	t--;
                    	return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
                    },
                    inCirc: function (t, b, c, d) {
                    	t /= d;
                    	return -c * (Math.sqrt(1 - t*t) - 1) + b;
                    },
                    outCirc: function (t, b, c, d) {
                    	t /= d;
                    	t--;
                    	return c * Math.sqrt(1 - t*t) + b;
                    },
                    inOutCirc: function (t, b, c, d) {
                    	t /= d/2;
                    	if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                    	t -= 2;
                    	return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
                    }
                };

            var parseStartEndPos = function(pos) {
                pos = pos.split(/(\+|\-)/);
                if (!pos.length) {
                    return 0;
                }

                var result = 0,
                    viewHeight = (window.innerHeight || document.documentElement.clientHeight),
                    documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
                for (var i = 0; i < pos.length; i++) {
                    if (i % 2) {
                        continue; //odd is +- operators
                    }

                    var value = pos[i].replace(/\D/g,'');
                    switch (pos[i].replace(/\d/g,'')) {
                        case 'vh':
                            value = value/100*viewHeight;
                            break;
                        case '%':
                            value = value/100*documentHeight;
                            break;
                        case 'px':
                        default:
                            //do nothing
                            break;
                    }

                    if (i == 0 || pos[i-1] == '+') {
                        result += +value;
                    } else {
                        result -= +value;
                    }
                }

                return result;
            };

            var animateProperties = debounce(function() {
                var scrollPos = $(target).scrollTop();

                for (var targetId in boundProperties) {
                    if (!boundProperties.hasOwnProperty(targetId) || !boundProperties[targetId].target) {
                        continue;
                    }

                    //loop over properties
                    for (var property in boundProperties[targetId].properties) {
                        if (!boundProperties[targetId].properties.hasOwnProperty(property)) {
                            continue;
                        }

                        var obj = boundProperties[targetId].properties[property],
                            newStartPos = parseStartEndPos(obj.startPos);
                            newEndPos = parseStartEndPos(obj.endPos);

                        if (scrollPos < newStartPos) {
                            var value = obj.startVal.toString() + obj.valUnit;
                        } else if (scrollPos > newEndPos) {
                            var value = obj.endVal.toString() + obj.valUnit;
                        } else {
                            var value = ((scrollPos-newStartPos)/(newEndPos-newStartPos)).toFixed(2);

                            if (obj.easing && typeof easing[obj.easing] === 'function') {
                                easing[obj.easing](obj.startVal > obj.endVal ? obj.startVal-value : value, obj.startVal, Math.max(obj.startVal, obj.endVal)-Math.min(obj.startVal, obj.endVal), Math.max(obj.startVal, obj.endVal));
                            }

                            value = ((obj.endVal-obj.startVal)*value+obj.startVal).toString() + obj.valUnit;
                        }

                        var css = {};
                        css[property] = obj.valStr ? obj.valStr.replace('$', value) : value;
                        boundProperties[targetId].target.css(css);
                    }

                    //loop over conditionals
                    boundProperties[targetId].conditionals.forEach(function(condition) {
                        var conditionParts = condition.toLowerCase().replace(/to|than|class|css/g, '').replace(/\s+(?=(?:(?:[^"]*"){2})*[^"]*"[^"]*$)|\s+(?=(?:(?:[^']*'){2})*[^']*'[^']*$)/g, '%20').split(' ').filter(function(val) { return !!val; });

                        conditionParts[1] = parseStartEndPos(conditionParts[1]);
                        if (isNaN(conditionParts[1])) {
                            return; //condition must be numeric scroll eval
                        }

                        var conditionEval = ((conditionParts[0] == 'greater' && scrollPos > +conditionParts[1]) || (conditionParts[0] == 'less' && scrollPos < +conditionParts[1]) || (conditionParts[0] == 'equal' && scrollPos == +conditionParts[1]));
                        if (conditionParts[2] == 'set') {
                            var cssParts = conditionParts[3].replace(/\'|"/g, '').replace('%20', ' ').split(':'),
                                css = {},
                                cssElse = false;

                            if (conditionParts[4] == 'else' && conditionParts[5]) {
                                cssElse = conditionParts[5].replace(/\'|"/g, '').replace('%20', ' ');
                            }

                            css[cssParts[0].trim()] = (conditionEval ? cssParts[1].trim() : (cssElse ? cssElse : ''));
                            boundProperties[targetId].target.css(css);
                        } else {
                            boundProperties[targetId].target.toggleClass(conditionParts[3], ((conditionEval && conditionParts[2] == 'add') || (!conditionEval && conditionParts[2] == 'remove')));
                        }
                    });
                }
            }, 5);

            $(window).on('scroll resize', animateProperties);

            var bindTarget = function(target) {
                var targetId = target.data('simpleParallax-id');
                if (!targetId) {
                    targetId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    target.data('simpleParallax-id', targetId);
                }

                if (typeof boundProperties[targetId] === 'undefined') {
                    boundProperties[targetId] = {
                        target: target, //jquery obj (cached for speed)
                        properties: {},
                        conditionals: []
                    };
                }

                return targetId;
            };

            this.bindProperty = function(target, property, startVal, endVal, valStr, startPos, endPos, easing) {
                if (!(target instanceof jQuery)) {
                    target = $(target);
                }

                var validateStartEndPosRegex = /^(?:\d+(px|vh|%)?(?:\+|\-|$))+$/;
                startPos = startPos.toString().toLowerCase();
                endPos = endPos.toString().toLowerCase();
                if (!target.length || !property.length || !startVal.toString().length || !endVal.toString().length || !startPos.match(validateStartEndPosRegex) || !endPos.match(validateStartEndPosRegex) || parseStartEndPos(endPos) < parseStartEndPos(startPos)) {
                    return;
                }

                targetId = bindTarget(target);

                boundProperties[targetId].properties[property] = {
                    startVal: +startVal.toString().replace(/[^\.|\d]/g,''), //numeric
                    endVal: +endVal.toString().replace(/[^\.|\d]/g,''), //numeric
                    valStr: valStr, //$ gets replaced
                    valUnit: (isNaN(startVal) ? startVal.toString().replace(/[\.|\d]/g, '').toLowerCase() : ''), //preserve provided unit (px, pt, %, etc)
                    startPos: startPos, //string of units (supports px, vh, and % units with +- operators and defaults to px if just a plain number ex: 3000px + 25%)
                    endPos: endPos, //string of units (supports px, vh, and % units with +- operators and defaults to px if just a plain number ex: 3000px + 25%)
                    easing: easing
                };

                animateProperties();
            };

            this.bindCondition = function(target, condition) {
                if (!(target instanceof jQuery)) {
                    target = $(target);
                }

                if (!target.length || !condition.length) {
                    return;
                }

                targetId = bindTarget(target);

                boundProperties[targetId].conditionals.push(condition);
            }

            this.unbind = function(target, propOrCond) {
                if (!(target instanceof jQuery)) {
                    target = $(target);
                }

                var targetId = target.data('simpleParallax-id');
                if (!targetId) {
                    return;
                }

                //remove property or conditional
                delete boundProperties[targetId].properties[propOrCond];
                var index = boundProperties[targetId].conditionals.indexOf(propOrCond);
                if (~index) {
                    boundProperties[targetId].conditionals.slice(index, 1);
                }

                if ($.isEmptyObject(boundProperties[targetId].properties) && !boundProperties[targetId].conditionals.length) {
                    //this target has zero properties or conditionals now, so clean up

                    delete boundProperties[targetId];
                    target.data('simpleParallax-id', '');
                }
            };
        }

        return parallax;
    }());

    //setup animations
    var sp = new simpleParallax(document);
    sp.bindCondition('#main-image-spacer', 'greater than 2000 set css "background-color: #9F529F"');
    sp.bindProperty('.scroll-down', 'opacity', 1, 0, '', 100, 500, 'inQuad');
    sp.bindProperty('#main-image-container .desaturated', 'opacity', 0, 1, '', 0, 750, 'inOutQuad');
    sp.bindProperty('#main-image-container .color-overlay', 'background-color', 0, 1, 'rgba(159, 82, 159, $)', 0, 2500, 'inOutQuad');
    sp.bindProperty('#main-image-container .logo', 'opacity', 0, 1, '', 1500, 2500, 'outQuad');
    sp.bindProperty('#main-image-container .logo', 'transform', 1.25, 1, 'scale($) translateX(-50%) translateY(-50%)', 1500, 1750, 'outQuad');
    sp.bindProperty('#main-image-container .logo', 'filter', '4px', '0px', 'blur($)', 1500, 1700, 'outQuad');
    sp.bindCondition('#main-image-container', 'greater than 3000 add class final');
    sp.bindCondition('#main-image-container .logo', 'greater than 3000 add class final');
    sp.bindProperty('#timeline-container .history-of-mic-container', 'opacity', 0, 1, '', '3000px+100vh-100px', '3000px+100vh+250px', 'outQuad');
    sp.bindProperty('#timeline-container .history-of-mic-container', 'transform', 50, 0, 'translateX($px)', '3000px+100vh-100px', '3000px+100vh+250px', 'outQuad');
    sp.bindCondition('#main-navigation #toggle-wrapper', 'greater than 3000px+100vh-76px add class solid');

    var raf = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame;
    var $window = $(window);
    var lastScrollTop = $window.scrollTop();
    var repositionColorLogo = function() {
        var value = parseFloat($('#main-image-container .logo').offset().top || 0) - parseFloat($('#timeline-container').offset().top || 0);
        if (value > 100) {
            value = 100;
        }
        $('#timeline-container .logo').css({ top: value + 'px' });
    };

    if (raf) {
        colorLogoLoop();
    } else {
        $(window).on('scroll resize', repositionColorLogo);
    }

    function colorLogoLoop() {
        var scrollTop = $window.scrollTop();
        if (lastScrollTop === scrollTop) {
            raf(colorLogoLoop);
            return;
        } else {
            lastScrollTop = scrollTop;
            repositionColorLogo();
            raf(colorLogoLoop);
        }
    }

    repositionColorLogo();

    setTimeout(function() {
        $('.scroll-down').removeClass('hidden');
    }, 500);
})();
