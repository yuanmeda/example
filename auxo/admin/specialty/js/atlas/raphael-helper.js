/**
 * @file: Javascript文件描述
 * @author: Administrator
 * @history: 2016/10/10
 */
;
(function($, Raphael) {

    function Shape(ele, options) {

        this.$ele = $(ele);
        this.options = $.extend(true, {}, Shape.defaultOptions, options);
        this.paper = null;
        this.dataMap = {};
        this.width = this.$ele.innerWidth();
        this.height = this.$ele.innerHeight();

        this.init();
    }

    Shape.prototype = {

        constructor: Shape,

        init: function() {

            this.initGraph();
            this.drawLayout();
            this.drawTitles();
            this.drawShapes();
            this.drawRelies();

            return this;
        },
        /**
         * 初始化图形
         * @returns {Shape}
         */
        initGraph: function() {
            // init Raphael
            this.paper = Raphael(this.$ele[0]);
            return this;
        },
        /**
         * 绘制布局
         * @returns {Shape}
         */
        drawLayout: function() {
            var data = this.options.data,
                paper = this.paper,
                dataCount = data.length,
                eleWidth = this.width,
                eleHeight = this.height;
            if (dataCount > 1) {
                var widthPerBlock = Math.round(eleWidth / dataCount),
                    x = 0,
                    lineStyle = this.options.style.line;
                for (var i = 1; i < dataCount; i++) {
                    x = i * widthPerBlock;
                    paper.path(['M', x, 0, 'L', x, eleHeight]).attr(lineStyle);
                }
            }
            return this;
        },
        /**
         * 绘制标题
         */
        drawTitles: function() {
            var data = this.options.data,
                dataCount = data.length,
                eleWidth = this.width;
            var widthPerBlock = Math.round(eleWidth / dataCount);
            for (var i = 0; i < dataCount; i++) {
                Shape.drawText(i * widthPerBlock, 20, data[i][this.options.alias.title], $.extend(true, {
                        width: widthPerBlock
                    }, this.options.style.title))
                    .appendTo(this.$ele);
            }
        },
        /**
         * 绘制元素
         * @returns {Shape}
         */
        drawShapes: function() {
            var data = this.options.data,
                paper = this.paper,
                shapeStyle = $.extend(true, {}, this.options.style.shape),
                dataCount = data.length,
                eleWidth = this.width,
                eleHeight = this.height,
                widthPerBlock = Math.round(eleWidth / dataCount),
                rectWidth = Math.min(widthPerBlock, shapeStyle.width),
                rectHeight = Math.max(20, shapeStyle.height),
                rectPaddingLeft = (widthPerBlock - rectWidth) / 2,
                fixedHeight = eleHeight,
                x = 0,
                y = 0;
            delete shapeStyle.width;
            delete shapeStyle.height;
            for (var i = 0, l = data.length; i < l; i++) {
                if (data[i].children && data[i].children) {
                    x = rectPaddingLeft + widthPerBlock * i;
                    for (var j = 0, s = data[i].children.length; j < s; j++) {
                        y = this.options.style.top + j * (rectHeight + 20);
                        fixedHeight = Math.max(fixedHeight, y + rectHeight + 20);
                        var item = data[i].children[j];
                        var rect = paper.rect(x, y, rectWidth, rectHeight, 2);
                        rect.attr({
                            fill: shapeStyle.fill,
                            stroke: shapeStyle.stroke,
                            'fill-opacity': 1,
                            'stroke-width': 1
                        });
                        var $text = Shape.drawText(x, y, item[this.options.alias.title], $.extend(true, {
                            position: 'absolute',
                            width: rectWidth,
                            height: rectHeight
                        }, shapeStyle)).appendTo(this.$ele);

                        this.dataMap[item[this.options.alias['id']]] = {
                            rect: rect,
                            item: item,
                            $ele: $text
                        };
                    }
                }
            }
            // 如果超出了容器高度，需要重绘布局
            if (fixedHeight > eleHeight) {
                // paper.setSize不能超出父容器宽度，无法处理滚动条情况
                // 此处强制重绘svg/vml高度
                this.$ele.children(':first').height(fixedHeight);
                this.height = fixedHeight;
                this.drawLayout();
            }
            return this;
        },
        /**
         * 绘制两个元素的箭头
         * @param data
         * @param target
         * @param count
         * @param index
         */
        drawRelyLine: function(data, target, count, index) {
            var beginRect = data.rect.getBBox(),
                endRect = target.rect.getBBox(),
                x1, y1, x2, y2;

            // 获取向量线的分段路径
            function getLines(x1, y1, x2, y2, size, c, i) {
                var lines = Shape.breakVectorLine(x1, y1, x2, y2, i / (c + 1));
                var ret = [];
                ret.push('M');
                ret.push(x1);
                ret.push(y1);
                $.each(lines, function(i, v) {
                    ret.push('L');
                    ret.push(x1 = v.x);
                    ret.push(y1 = v.y);
                });
                ret.push('L');
                ret.push(x2);
                ret.push(y2);

                return ret.concat(Shape.getArrowPaths(x1, y1, x2, y2, size));
            }

            x1 = beginRect.x;
            y1 = beginRect.y + beginRect.height / 2;
            x2 = endRect.x + endRect.width;
            y2 = endRect.y + endRect.height / 2;

            if (data.item.text) {
                this.$ele.append(Shape.drawText((x1 + x2) / 2, (y1 + y2) / 2, data.item.text, this.options.style.text));
            }
            //this.paper.path(getLines(x1, y1, x2, y2, 8, count, index)).attr(this.options.style.arrow);
            this.paper.path(['M', x1, y1, 'L', x2, y2].concat(Shape.getArrowPaths(x1, y1, x2, y2, 8))).attr(this.options.style.arrow);
        },
        /**
         * 绘制元素依赖箭头
         */
        drawRelies: function() {
            var data = this.options.data,
                dataMap = this.dataMap,
                alias = this.options.alias,
                that = this;
            for (var i = 0, l = data.length; i < l; i++) {
                if (data[i].children && data[i].children) {
                    for (var j = 0, s = data[i].children.length; j < s; j++) {
                        var item = data[i].children[j];
                        if (item && item[alias.relyId]) {
                            if (item[alias.relyId] instanceof Array) {
                                for (var k = 0, c = item[alias.relyId].length; k < c; k++) {
                                    that.drawRelyLine(dataMap[item[alias.id]], dataMap[item[alias.relyId][k]], c, k + 1);
                                }
                            } else {
                                that.drawRelyLine(dataMap[item[alias.id]], dataMap[item[alias.relyId]], 1, 1);
                            }
                        }
                    }
                }
            }
        }
    };

    $.extend(true, Shape, {
        defaultOptions: {
            data: [],
            alias: {
                id: 'id', // ID别名
                title: 'title', // 标题别名
                relyId: 'relyId', // 依赖ID别名
                text: 'text' // 文本别名
            },
            style: {
                top: 80,
                shape: {
                    stroke: '#666',
                    fill: '#fff',
                    width: 150,
                    height: 40,
                    color: '#666',
                    textAlign: 'center',
                    lineHeight: '40px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                },
                title: {
                    textAlign: 'center',
                    color: '#54a1f3'
                },
                text: {
                    textAlign: 'center',
                    color: '#666',
                    border: '1px solid #999',
                    margin: '-10px 0 0 -15px',
                    background: '#eee'
                },
                line: {
                    stroke: '#ddd',
                    'stroke-width': 1
                },
                arrow: {
                    stroke: '#54a1f3',
                    'stroke-width': 1
                }
            }
        },
        /**
         * 组装箭头的路径
         * @param x1
         * @param y1
         * @param x2
         * @param y2
         * @param arrowSize
         * @returns {*[]}
         */
        getArrowPaths: function(x1, y1, x2, y2, arrowSize) {
            var arrowpoints = Shape.getArrowPoints(x1, y1, x2, y2, arrowSize);
            return [
                "M", x2, y2,
                "L", arrowpoints[0].x, arrowpoints[0].y,
                "M", x2, y2,
                "L", arrowpoints[1].x, arrowpoints[1].y
            ];
        },
        /**
         * 返回箭头点坐标
         * @param x1
         * @param y1
         * @param x2
         * @param y2
         * @param arrowSize
         * @returns {*[]}
         */
        getArrowPoints: function(x1, y1, x2, y2, arrowSize) {
            var angle = Raphael.angle(x1, y1, x2, y2); // 得到两点之间的角度
            var a45 = Raphael.rad(angle - 45); // 角度转换成弧度
            var a45m = Raphael.rad(angle + 45);
            var x2a = x2 + Math.cos(a45) * arrowSize;
            var y2a = y2 + Math.sin(a45) * arrowSize;
            var x2b = x2 + Math.cos(a45m) * arrowSize;
            var y2b = y2 + Math.sin(a45m) * arrowSize;
            return [{
                x: x2a,
                y: y2a
            }, {
                x: x2b,
                y: y2b
            }];
        },
        /**
         * 向量线分割成折线（横向），直线则不分割，只返回折线部分节点
         * @param x1
         * @param y1
         * @param x2
         * @param y2
         * @param ratio 0-1之间
         * @returns {Array}
         */
        breakVectorLine: function(x1, y1, x2, y2, ratio) {
            var ret = [];
            ret.push({
                x: x1,
                y: y1
            });
            if (y1 !== y2) {
                var secX = Math.min(x1, x2) + Math.abs(x1 - x2) * ratio;
                ret.push({
                    x: secX,
                    y: y1
                });
                ret.push({
                    x: secX,
                    y: y2
                });
            }
            ret.push({
                x: x2,
                y: y2
            });
            return ret;
        },
        /**
         * 绘制文本
         * @param x
         * @param y
         * @param text
         * @param style
         * @returns {*}
         */
        drawText: function(x, y, text, style) {
            return $('<div></div>')
                .text(text || '')
                .css('position', 'absolute')
                .offset({
                    left: x,
                    top: y
                })
                .css(style);
        }
    });

    window.Shape = Shape;

}(jQuery, Raphael));
