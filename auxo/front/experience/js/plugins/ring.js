/**
 * @file: Javascript文件描述
 * @author: Administrator
 * @history: 2016/11/25
 */
;(function() {

    var ieVersion = document && (function() {
            var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');
            while (
                div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
                    iElems[0]
                ) {}
            return version > 4 ? version : undefined;
        }());

    function Ring($container, options) {
        if (typeof options === "number") {
            options = {
                data: options
            };
        }
        this.$container = $container;
        this.ctx = null;
        this.options = options || (options = {});
        this.arcWidth = options.arcWidth || 10;
        this.arc = options.arc || $container.innerWidth() / 2 || 100;
        this.data = Math.min(Math.max(options.data || 0, 0), 1);
        this.time = options.time || 500;
        this.step = options.step || 16;
        this.bgColor = options.bgColor || 'RGB(238, 238, 238)';
        this.leftColor = options.leftColor || 'RGB(70, 181, 253)';
        this.rightColor = options.rightColor || 'RGB(255, 92, 96)';
        this.devicePixelRatio = options.devicePixelRatio || window.devicePixelRatio || (ieVersion < 9 ? 1 : 4);

        this.render();
    }

    Ring.prototype = {
        constructor: Ring,
        render: function() {
            var w = this.arc * 2,
                $canvas = this.$container.find('canvas:first'),
                devicePixelRatio = this.devicePixelRatio = ieVersion < 9 ? 1 : 4;
            if (!$canvas.length) {
                $canvas = $('<canvas></canvas>').appendTo(this.$container);
            }
            this.ctx = $canvas[0].getContext('2d');

            $canvas.css({
                width: w,
                height: w
            });
            $canvas.attr('width', w * devicePixelRatio)
                .attr('height', w * devicePixelRatio);
            this.ctx.scale(devicePixelRatio, devicePixelRatio);
            return this;
        },
        drawPk: function() {
            var that = this,
                animateCount = this.time / this.step,
                counter = 0,
                timer = 0,
                data = this.data,
                allAngleLeft = Math.PI * data,
                allAngleRight = Math.PI * (1 - this.data);
            this.drawArc(0, Math.PI * 2, this.bgColor, '');
            timer = setInterval(function() {
                var angleLeft = that.fixAngle(Math.PI, allAngleLeft * counter / animateCount),
                    angleRight = that.fixAngle(0, allAngleRight * counter / animateCount),
                    isLastCounter = counter === animateCount;

                if (data < 1) {
                    that.drawArc(0, -angleRight, that.leftColor, isLastCounter ? '' : 'round', true)
                        .drawArc(0, angleRight, that.leftColor, isLastCounter ? '' : 'round', false);
                }

                if (data > 0) {
                    that.drawArc(Math.PI, Math.PI + angleLeft, that.rightColor, 'round', false)
                        .drawArc(Math.PI, Math.PI - angleLeft, that.rightColor, 'round', true);
                }

                if (counter++ >= animateCount) {
                    clearInterval(timer);
                }
            }, this.step);
            return this;
        },
        drawRing: function() {
            var that = this,
                animateCount = this.time / this.step,
                counter = 0,
                timer = 0,
                startAngle = -Math.PI / 2,
                allAngle = Math.PI * 2 * this.data,
                angle;
            this.drawArc(0, Math.PI * 2, this.bgColor, '');
            if (this.data > 0) {
                timer = setInterval(function() {
                    angle = that.fixAngle(startAngle, allAngle * counter / animateCount);
                    that.drawArc(startAngle, startAngle + angle, that.rightColor, 'round', false);
                    if (counter++ >= animateCount) {
                        clearInterval(timer);
                    }
                }, this.step);
            }
            return this;
        },
        fixAngle: ieVersion && ieVersion < 9 ? function(startAngle, angle) {
            if (angle === 0) {
                angle = 0.01;
            } else if (Math.abs(angle) >= Math.PI * 2) {
                angle = Math.PI * 2 - 0.01;
            }
            return angle;
        } : function(startAngle, angle) {
            return angle;
        },
        clear: function(x, y, w, h) {
            this.ctx.clearRect(x, y, w, h);
            return this;
        },
        drawArc: function(startAngle, endAngle, strokeStyle, lineCap, anticlockwise) {
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.arc(this.arc, this.arc, this.arc - this.arcWidth/2, startAngle, endAngle, !!anticlockwise);
            ctx.lineWidth = this.arcWidth;
            ctx.lineCap = lineCap || '';
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
            ctx.restore();
            return this;
        }
    };

    window['Ring'] = Ring;

}());
