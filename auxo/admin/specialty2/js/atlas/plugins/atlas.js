;(function($, Raphael) {
    function Base() {}

    Base.prototype.assign = function(options) {
        $.extend(true, this, options);
        return this;
    };

    Base.prototype.clone = function(options) {
        throw new Error('clone must be overrode in subclass, but did not do so.');
    };

    /**
     * 图谱
     * @constructor
     */
    function Altas($dom, options) {

        this.$dom = $dom;
        // 容器
        this.$wrapper = null;
        // 标题容器
        this.$header = null;
        // 绘图容器
        this.$container = null;
        // 行列数组
        this.altasRow = [];
        // 行列数组
        this.altasColumn = [];
        // 数据
        this.data = [];
        // 数据MAP
        this.dataMap = {};
        // 所有单元
        this.altasCell = [];
        // 所有弧
        this.altasArc = [];
        // 弧半径
        this.arcWidth = 6;
        // 配置
        this.setting = {
            align: 'v',  // v(垂直)/h(水平)
            offset: {
                top: 50
            },
            cell: {
                width: 200,
                height: 40
            },
            intervalH: 40,
            intervalV: 80,
            alias: {
                id: 'id',
                title: 'name',
                cell: 'name',
                rely: 'rely_id',
                relyText: 'percent'
            },
            style: {
                title: {
                    position: 'absolute'
                },
                cell: {
                    position: 'absolute'
                },
                line: {
                    stroke: '#999',
                    'stroke-width': 1
                },
                arc: {
                    stroke: '#999',
                    'stroke-width': 1
                }
            }
        };

        // 对调垂直/水平间距
        if (options && options.setting && options.setting.align === 'h' && !options.setting.intervalV && !options.setting.intervalH) {
            options.setting.intervalV = this.setting.intervalH;
            options.setting.intervalH = this.setting.intervalV;
        }

        this.assign(options)
            .init()
            .mapData()
            .calAltasColumnAndRow()
            .calAltasPoint()
            .calAltasCell()
            .calAltasCellRely()
            .suitAltasSectionalLine()
            .calArcOfLine()
            // .drawPoint()
            .drawTitle()
            .drawCell()
            .drawArc();
    }

    Altas.prototype = new Base();

    Altas.prototype.init = function() {
        var maxSize = (function(data) {
                var maxSize = 0;
                $.each(data, function(i, v) {
                    if (v.children) {
                        maxSize = Math.max(maxSize, v.children.length);
                    }
                });
                return maxSize;
            }(this.data)),
            isAlignV = this.setting.align.toLowerCase() === 'v',
            css = {};
        if (isAlignV) {
            css = {
                width: this.data.length * (this.setting.cell.width + this.setting.intervalV) + this.setting.intervalV,
                height: (maxSize + 1) * (this.setting.cell.height + this.setting.intervalH)
            };
        } else {
            css = {
                width: (maxSize + 1) * (this.setting.cell.height + this.setting.intervalH) + this.setting.intervalH,
                height: this.data.length * (this.setting.cell.width + this.setting.intervalV)
            };
        }
        this.$wrapper = $('<div class="altas-wrapper"></div>').appendTo(this.$dom.empty());
        this.$header = $('<div class="altas-header"></div>').css({height: this.setting.offset.top})
            .appendTo(this.$wrapper);
        this.$container = $('<div class="altas-container"></div>')
            .css(css).appendTo(this.$wrapper);
        Paint.paper = Raphael(this.$container[0]);
        return this;
    };
    /**
     * data转map
     * @returns {Altas}
     */
    Altas.prototype.mapData = function() {
        var that = this;
        $.each(this.data, function(i, item) {
            if (!item || !item.children || !item.children.length) {
                return true;
            }
            $.each(item.children, function(j, v) {
                that.dataMap[v.id] = v;
            });
        });
        return this;
    };
    /**
     * 根据数据计算出行列
     */
    Altas.prototype.calAltasColumnAndRow = function() {
        var that = this,
            i = 0,
            rowCount = this.data.length * 2 + 1,
            columnCount = (function() {
                    var maxCount = 0;
                    $.each(that.data, function(i, v) {
                        maxCount = Math.max(maxCount, v.children.length);
                    });
                    return maxCount;
                }()) * 2 + 1;
        for (i = 0; i <= columnCount; i++) {
            this.altasColumn.push(new AltasColumn());
        }
        for (i = 0; i <= rowCount; i++) {
            this.altasRow.push(new AltasRow());
        }
        return this;
    };
    /**
     * 计算行列中所有点的位置
     */
    Altas.prototype.calAltasPoint = function() {
        var i, j, cl, rl,
            halfIntervalH = this.setting.intervalH / 2,
            halfIntervalV = this.setting.intervalV / 2,
            halfCellWidth = this.setting.cell.width / 2,
            halfCellHeight = this.setting.cell.height / 2,
            pointOffsetV = halfIntervalV + halfCellWidth,
            pointOffsetH = halfIntervalH + halfCellHeight;
        for (i = 0, rl = this.altasRow.length; i < rl; i++) {
            for (j = 0, cl = this.altasColumn.length; j < cl; j++) {
                var altasPoint = new AltasPointer({
                    x: pointOffsetV * i + halfIntervalV,
                    y: pointOffsetH * j,
                    altasRow: this.altasRow[i],
                    altasColumn: this.altasColumn[j],
                    rowIndex: i,
                    columnIndex: j
                });
                this.altasRow[i].altasPointArray.push(altasPoint);
                this.altasColumn[j].altasPointArray.push(altasPoint);
            }
        }
        return this;
    };
    /**
     * 根据数据计算所有单元
     */
    Altas.prototype.calAltasCell = function() {
        var that = this,
            align = this.setting.align.toLowerCase() === 'v';
        $.each(this.data, function(i, item) {
            if (!item || !item.children || !item.children.length) {
                return true;
            }
            $.each(item.children, function(j, v) {
                if (v) {
                    var m = i * 2 + 1,
                        n = j * 2 + 1,
                        altasPoint = align ? that.altasRow[m].altasPointArray[n] : that.altasRow[n].altasPointArray[m];
                    altasPoint.altasCell = new AltasCell({
                        width: that.setting.cell.width,
                        height: that.setting.cell.height,
                        centerPoint: altasPoint,
                        text: v[that.setting.alias.cell],
                        data: v
                    });
                    that.altasCell.push(altasPoint.altasCell);
                    v.altasCell = altasPoint.altasCell;
                }
            });
        });
        return this;
    };
    /**
     * 计算单元依赖
     */
    Altas.prototype.calAltasCellRely = function() {
        var that = this,
            isAlignV = this.setting.align.toLowerCase() === 'v',
            aliasRely = this.setting.alias.rely,
            aliasRelyText = this.setting.alias.relyText,
            aliasId = this.setting.alias.id;
        $.each(this.altasCell, function(i, altasCell) {
            var rely = altasCell.data[aliasRely];
            if (rely && rely.length) {
                // 计算依赖
                var relyAltasCell = [],
                    relyTextArray = [];
                $.each(rely, function(j, relyValue) {
                    var relyText = '';
                    if (typeof relyValue === "object") {
                        relyText = relyValue[aliasRelyText];
                        relyValue = relyValue['id'];
                    }
                    // 跳过自己依赖自己
                    if (relyValue === altasCell[aliasId]) {
                        return true;
                    }
                    // 抛弃不存在的关联单元
                    if (that.dataMap[relyValue]) {
                        relyAltasCell.push(that.dataMap[relyValue].altasCell);
                        relyTextArray.push(relyText);
                    }
                });
                if (relyAltasCell.length) {
                    altasCell.relyOut(relyAltasCell, relyTextArray, isAlignV);
                }
            }
        });
        return this;
    };

    /**
     * 最适化分段线位置
     */
    Altas.prototype.suitAltasSectionalLine = function() {
        var that = this,
            intervalH = this.setting.intervalH,
            intervalV = this.setting.intervalV;

        function calColumn() {
            $.each(that.altasColumn, function(i, altasColumn) {
                var count = 0;
                // 跳过单数的行列
                if ((i % 2 != 0) || ((count = altasColumn.altasSectionalLineArray.length) <= 1)) {
                    return true;
                }
                var middle = Math.floor(count / 2),
                    diffDistance = suitDistance(count, intervalH);

                // 排序
                altasColumn.altasSectionalLineArray.sort(function(v1, v2) {
                    var d1 = Math.abs(v1.endPoint.x - v1.startPoint.x),
                        d2 = Math.abs(v2.endPoint.x - v2.startPoint.x);
                    return d1 - d2;
                });

                $.each(altasColumn.altasSectionalLineArray, function(j, altasSectionalLine) {
                    // 跳过第一条分段线和最后一条分段线
                    if (altasSectionalLine.isFirstSectionalLine || altasSectionalLine.isLastSectionalLine) {
                        return true;
                    }
                    var distance = (j - middle) * diffDistance,
                        orginalY = altasSectionalLine.startPoint.y,
                        offsetY = orginalY + distance,
                        prevSectionalLine = altasSectionalLine,
                        nextSectionalLine = altasSectionalLine;

                    altasSectionalLine.startPoint.y = offsetY;
                    altasSectionalLine.endPoint.y = offsetY;

                    // 修正分段线关联的其他分段线的坐标值
                    while (prevSectionalLine && (prevSectionalLine = prevSectionalLine.prevSectionalLine) != null) {
                        if (prevSectionalLine.startPoint.y === orginalY) {
                            prevSectionalLine.startPoint.y = offsetY;
                        }
                        if (prevSectionalLine.endPoint.y === orginalY) {
                            prevSectionalLine.endPoint.y = offsetY;
                        }
                    }

                    // 修正分段线关联的其他分段线的坐标值
                    while (nextSectionalLine && (nextSectionalLine = nextSectionalLine.nextSectionalLine) != null) {
                        if (nextSectionalLine.startPoint.y === orginalY) {
                            nextSectionalLine.startPoint.y = offsetY;
                        }
                        if (nextSectionalLine.endPoint.y === orginalY) {
                            nextSectionalLine.endPoint.y = offsetY;
                        }
                    }
                });
            });
        }

        function calRow() {
            $.each(that.altasRow, function(i, altasRow) {
                var count = 0;
                // 跳过单数的行列
                if ((i % 2 != 0) || ((count = altasRow.altasSectionalLineArray.length) <= 1)) {
                    return true;
                }
                var middle = Math.floor(count / 2),
                    diffDistance = suitDistance(count, intervalV);

                // 排序
                altasRow.altasSectionalLineArray.sort(function(v1, v2) {
                    var d1 = Math.abs(v1.endPoint.y - v1.startPoint.y),
                        d2 = Math.abs(v2.endPoint.y - v2.startPoint.y);
                    return d1 - d2;
                });

                $.each(altasRow.altasSectionalLineArray, function(j, altasSectionalLine) {
                    // 跳过第一条分段线和最后一条分段线
                    if (altasSectionalLine.isFirstSectionalLine || altasSectionalLine.isLastSectionalLine) {
                        return true;
                    }
                    var distance = (j - middle) * diffDistance,
                        orginalX = altasSectionalLine.startPoint.x,
                        offsetX = orginalX + distance,
                        prevSectionalLine = altasSectionalLine,
                        nextSectionalLine = altasSectionalLine;

                    altasSectionalLine.startPoint.x = offsetX;
                    altasSectionalLine.endPoint.x = offsetX;

                    // 修正分段线关联的其他分段线的坐标值
                    while (prevSectionalLine && (prevSectionalLine = prevSectionalLine.prevSectionalLine) != null) {
                        if (prevSectionalLine.startPoint.x === orginalX) {
                            prevSectionalLine.startPoint.x = offsetX;
                        }
                        if (prevSectionalLine.endPoint.x === orginalX) {
                            prevSectionalLine.endPoint.x = offsetX;
                        }
                    }

                    // 修正分段线关联的其他分段线的坐标值
                    while (nextSectionalLine && (nextSectionalLine = nextSectionalLine.nextSectionalLine) != null) {
                        if (nextSectionalLine.startPoint.x === orginalX) {
                            nextSectionalLine.startPoint.x = offsetX;
                        }
                        if (nextSectionalLine.endPoint.x === orginalX) {
                            nextSectionalLine.endPoint.x = offsetX;
                        }
                    }
                });
            });
        }

        /**
         * 计算最适偏移距离
         * @param count
         * @param distance
         * @param suitDis
         * @returns {number}
         */
        function suitDistance(count, distance, suitDis) {
            var perDis = 0, expDis = that.arcWidth;
            suitDis = suitDis || expDis;
            if (count >= distance / expDis) {
                return distance / count;
            } else {
                if ((perDis = distance / count) > suitDis) {
                    perDis = suitDis;
                }
                return perDis;
            }
        }

        calColumn();
        calRow();

        return this;
    };

    /**
     * 计算出所有交叉线可能产生的的圆弧
     * 只记录横向的圆弧，因为一旦横向有了圆弧，纵向就不需要再考虑圆弧了
     */
    Altas.prototype.calArcOfLine = function() {
        var that = this;
        $.each(this.altasColumn, function(i, altasColumn) {
            $.each(altasColumn.altasSectionalLineArray, function(j, altasSectionalLine) {
                var crossAltasSectionalLineArray = getCrossAltasSectionalLineArray(altasSectionalLine);
                $.each(crossAltasSectionalLineArray, function(k, crossAltasSectionalLineMap) {
                    var count = crossAltasSectionalLineMap.altasSectionalLineArray.length;
                    if (count > 0) {
                        // 根据跨越的线条数量，设置圆弧的宽度
                        var arcWidth = that.arcWidth * count;
                        // 拆分分段线为两条分线段和一个圆弧
                        var splitAltasSectionalLine = splitAltasSectionalLineByPoint(altasSectionalLine, crossAltasSectionalLineMap.centerPoint, arcWidth, crossAltasSectionalLineMap.direction),
                            altasLine = altasSectionalLine.altasLine,
                            nextAltasSectionalLine = altasSectionalLine;
                        // 分线段被拆分为两条，所以原来的分段线的索引需要修订，只修订更大的索引
                        while ((nextAltasSectionalLine = nextAltasSectionalLine.nextSectionalLine) != null) {
                            nextAltasSectionalLine.lineIndex += 1;
                        }
                        altasLine.altasSectionalLineArray.splice(altasSectionalLine.lineIndex, 1, splitAltasSectionalLine[0], splitAltasSectionalLine[1]);
                        // 当第一次分段线被替换成两条分段线后，该分段线就需要被更新为最新的一条，根据原来分段线的方向选择。
                        altasSectionalLine = crossAltasSectionalLineMap.direction > 0 ? splitAltasSectionalLine[0] : splitAltasSectionalLine[1];
                        // 记录圆弧
                        that.altasArc.push(new AltasArc({
                            point: new AltasPointer({
                                x: crossAltasSectionalLineMap.centerPoint.x,
                                y: crossAltasSectionalLineMap.centerPoint.y
                            }),
                            arc: arcWidth,
                            dir: 1,
                            prevAltasSectionalLine: splitAltasSectionalLine[0],
                            nextAltasSectionalLine: splitAltasSectionalLine[1],
                            crossSectionalLineArray: crossAltasSectionalLineMap.altasSectionalLineArray
                        }));
                    }
                });
            });
        });

        /**
         * 拆分分段线
         * @param altasSectionalLine
         * @param splitPoint
         * @param arcWidth
         * @param direction
         */
        function splitAltasSectionalLineByPoint(altasSectionalLine, splitPoint, arcWidth, direction) {
            var altasPoint1 = altasSectionalLine.startPoint.clone({
                x: splitPoint.x + (direction < 0 ? -arcWidth : arcWidth)
            }), altasPoint2 = altasSectionalLine.endPoint.clone({
                x: splitPoint.x + (direction < 0 ? arcWidth : -arcWidth)
            }), altasSectionalLine1 = altasSectionalLine.clone({
                startPoint: altasSectionalLine.startPoint,
                endPoint: altasPoint1,
                // 拆分后的前一条分段线isLastSectionalLine=false
                isLastSectionalLine: false
            }), altasSectionalLine2 = altasSectionalLine.clone({
                startPoint: altasPoint2,
                endPoint: altasSectionalLine.endPoint,
                lineIndex: altasSectionalLine.lineIndex + 1,
                // 拆分后的后一条分段线isFirstSectionalLine=false
                isFirstSectionalLine: false
            });
            // 连接两条分线段
            altasSectionalLine1.nextSectionalLine = altasSectionalLine2;
            altasSectionalLine2.prevSectionalLine = altasSectionalLine1;
            return [altasSectionalLine1, altasSectionalLine2];
        }

        /**
         * 计算出所有跟分段线的相交的其他分段线，不包含一条线段的起止点落在另一条线段上
         * @param altasSectionalLine
         * @returns {Array}
         */
        function getCrossAltasSectionalLineArray(altasSectionalLine) {
            var crossAltasSectionalLineArray = [],
                // 线段的指向，负数向右，正数向左
                direction = altasSectionalLine.startPoint.rowIndex - altasSectionalLine.endPoint.rowIndex,
                maxIndex = Math.max(altasSectionalLine.startPoint.rowIndex, altasSectionalLine.endPoint.rowIndex),
                minIndex = Math.min(altasSectionalLine.startPoint.rowIndex, altasSectionalLine.endPoint.rowIndex);
            for (var i = minIndex; i < maxIndex; i++) {
                var altasSectionalLineArray = [],
                    altasRow = that.altasRow[i],
                    allX = 0, allY = 0;
                $.each(altasRow.altasSectionalLineArray, function(j, altasSectionalLineOfRow) {
                    var crossPoint = null;
                    if ((crossPoint = isLineCross(altasSectionalLine, altasSectionalLineOfRow)) !== false) {
                        altasSectionalLineArray.push({
                            altasSectionalLine: altasSectionalLineOfRow,
                            point: crossPoint
                        });
                        allX += crossPoint.x;
                        allY += crossPoint.y;
                    }
                });
                crossAltasSectionalLineArray.push({
                    altasSectionalLineArray: altasSectionalLineArray,
                    centerPoint: {
                        x: altasSectionalLineArray.length ? allX / altasSectionalLineArray.length : 0,
                        y: altasSectionalLineArray.length ? allY / altasSectionalLineArray.length : 0
                    },
                    direction: direction
                });
            }
            return crossAltasSectionalLineArray;
        }

        /**
         * 判断两条线段是否相交
         * @param line1
         * @param line2
         * @returns {boolean}
         */
        function isLineCross(line1, line2) {
            var a = line1.startPoint,
                b = line1.endPoint,
                c = line2.startPoint,
                d = line2.endPoint;

            // 三角形abc 面积的2倍
            var areaAbc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
            // 三角形abd 面积的2倍
            var areaAbd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);
            // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);
            if (areaAbc * areaAbd >= 0) {
                return false;
            }
            // 三角形cda 面积的2倍
            var areaCda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
            // 三角形cdb 面积的2倍
            // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.
            var areaCdb = areaCda + areaAbc - areaAbd;
            if (areaCda * areaCdb >= 0) {
                return false;
            }

            //计算交点坐标
            var t = areaCda / ( areaAbd - areaAbc );
            var dx = t * (b.x - a.x),
                dy = t * (b.y - a.y);
            return {x: a.x + dx, y: a.y + dy};
        }

        return this;
    };

    /**
     * 画标题
     */
    Altas.prototype.drawTitle = function() {
        var that = this,
            intervalV = this.setting.intervalV,
            cellWidth = this.setting.cell.width,
            cellHeight = this.setting.cell.height,
            pointFullV = intervalV + cellWidth,
            pointOffsetV = cellWidth / 2 + intervalV,
            pointOffsetH = this.setting.offset.top / 2,
            aliasTitle = this.setting.alias.title,
            styleTitle = this.setting.style.title;
        $.each(this.data, function(i, item) {
            that.$header.append(Paint.title(new AltasCell({
                text: item[aliasTitle],
                centerPoint: new AltasPointer({
                    x: pointOffsetV + pointFullV * i,
                    y: pointOffsetH
                }),
                width: cellWidth,
                height: cellHeight
            }), styleTitle));
        });
        return this;
    };

    /**
     * 画点
     * @returns {Altas}
     */
    Altas.prototype.drawPoint = function() {
        var that = this,
            stylePoint = this.setting.style.point;
        $.each(this.altasRow, function(i, altasRow) {
            $.each(altasRow.altasPointArray, function(j, altasPoint) {
                that.$container.append(Paint.point(altasPoint, stylePoint));
            });
        });
        return this;
    };
    /**
     * 画单元
     * @returns {Altas}
     */
    Altas.prototype.drawCell = function() {
        var that = this,
            styleLine = this.setting.style.line,
            $container = this.$container;
        $.each(this.altasCell, function(i, altasCell) {
            that.$container.append(Paint.cell(altasCell, that.setting.style.cell));
            $.each(altasCell.out.altasLineArray, function(j, altasLine) {
                Paint.line(altasLine, styleLine, $container);
            });
        });
        return this;
    };

    /**
     * 画狐线
     * @returns {Altas}
     */
    Altas.prototype.drawArc = function() {
        var styleArc = this.setting.style.arc;
        $.each(this.altasArc, function(i, altasArc) {
            Paint.arc(altasArc, styleArc);
        });
        return this;
    };

    /**
     * 行对象
     * @constructor
     */
    function AltasRow(options) {

        // 所有点
        this.altasPointArray = [];
        // 包含的所有分段线
        this.altasSectionalLineArray = [];

        this.assign(options);
    }

    AltasRow.prototype = new Base();

    /**
     * 列对象
     * @constructor
     */
    function AltasColumn(options) {

        // 所有点
        this.altasPointArray = [];
        // 包含的所有分段线
        this.altasSectionalLineArray = [];

        this.assign(options);
    }

    AltasColumn.prototype = new Base();

    /**
     * 点对象
     * @constructor
     */
    function AltasPointer(options) {

        // X坐标
        this.x = 0;
        // Y坐标
        this.y = 0;
        // 所属行
        this.altasRow = null;
        // 所属列
        this.altasColumn = null;
        // 所在行索引
        this.rowIndex = 0;
        // 所在列索引
        this.columnIndex = 0;
        // 点所在的单元，不存在为null
        this.altasCell = null;
        // 克隆自原来的altasPointer，通常为null
        this.copyFrom = null;

        this.assign(options);
    }

    AltasPointer.prototype = new Base();
    /**
     * 克隆对象
     * @param options
     * @param deep
     * @returns {AltasPointer}
     */
    AltasPointer.prototype.clone = function(options, deep) {
        options = options || {};
        options.copyFrom = options.copyFrom || this;
        return new AltasPointer($.extend(deep, {}, this, options));
    };
    /**
     * 计算两个点的相对位置
     * altasPointA的位置为5，返回值为altasPointB相对于A的位置
     1   2   3
     4   5   6
     7   8   9
     * @param altasPointA
     * @param altasPointB
     * @returns {number}
     * @constructor
     */
    AltasPointer.ABDirection = function(altasPointA, altasPointB) {
        /*
         1   2   3
         4   5   6
         7   8   9
         */
        var diffX = altasPointB.x - altasPointA.x,
            diffY = altasPointB.y - altasPointA.y;
        if (diffX < 0 && diffY < 0) {
            return 1;
        } else if (diffX === 0 && diffY < 0) {
            return 2;
        } else if (diffX > 0 && diffY < 0) {
            return 3;
        } else if (diffX < 0 && diffY === 0) {
            return 4;
        } else if (diffX === 0 && diffY === 0) {
            return 5;
        } else if (diffX > 0 && diffY === 0) {
            return 6;
        } else if (diffX < 0 && diffY > 0) {
            return 7;
        } else if (diffX === 0 && diffY > 0) {
            return 8;
        } else if (diffX > 0 && diffY > 0) {
            return 9;
        }
    };
    /**
     * 计算两点间路径经过的所有点
     * @param altasPointA
     * @param altasPointB
     * @param direction
     * @param isAlignV
     * @returns {*[]}
     * @constructor
     */
    AltasPointer.ABPath = function(altasPointA, altasPointB, direction, isAlignV) {
        var pathAltasPointArray = [altasPointA],
            diffX = Math.abs(altasPointA.columnIndex - altasPointB.columnIndex),
            diffY = Math.abs(altasPointA.rowIndex - altasPointB.rowIndex),
            point1, point2, point3;

        switch (direction) {
            case 1:
                if (isAlignV) {
                    // 向左
                    pathAltasPointArray.push(point1 = altasPointA.altasColumn.altasPointArray[altasPointA.rowIndex - 1]);
                    if (diffY > 2) {
                        // 向上
                        pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex - (diffX - 1)]);
                        // 向左
                        pathAltasPointArray.push(point3 = point2.altasColumn.altasPointArray[point2.rowIndex - (diffY - 1)]);
                    } else {
                        // 向上
                        pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex - diffX]);
                    }
                } else {
                    // 向上
                    pathAltasPointArray.push(point1 = altasPointA.altasRow.altasPointArray[altasPointA.columnIndex - 1]);
                    if (diffX > 2) {
                        // 向左
                        pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex - (diffY - 1)]);
                        // 向上
                        pathAltasPointArray.push(point3 = point2.altasRow.altasPointArray[point2.columnIndex - (diffX - 1)]);
                    } else {
                        // 向左
                        pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex - diffY]);
                    }
                }
                break;
            case 2:
                if (diffX > 2) {
                    // 向左
                    pathAltasPointArray.push(point1 = altasPointA.altasColumn.altasPointArray[altasPointA.rowIndex - 1]);
                    // 向上
                    pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex - diffX]);
                    break;
                } else {
                    // 向上
                    pathAltasPointArray.push(point1 = altasPointA.altasRow.altasPointArray[altasPointA.columnIndex - 1]);
                }
                break;
            case 3:
                if (isAlignV) {
                    // 向右
                    pathAltasPointArray.push(point1 = altasPointA.altasColumn.altasPointArray[altasPointA.rowIndex + 1]);
                    if (diffY > 2) {
                        // 向上
                        pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex - (diffX - 1)]);
                        // 向右
                        pathAltasPointArray.push(point3 = point2.altasColumn.altasPointArray[point2.rowIndex + (diffY - 1)]);
                    } else {
                        // 向上
                        pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex - diffX]);
                    }
                } else {
                    // 向上
                    pathAltasPointArray.push(point1 = altasPointA.altasRow.altasPointArray[altasPointA.columnIndex - 1]);
                    if (diffX > 2) {
                        // 向右
                        pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex + (diffY - 1)]);
                        // 向上
                        pathAltasPointArray.push(point3 = point2.altasRow.altasPointArray[point2.columnIndex - (diffX - 1)]);
                    } else {
                        // 向右
                        pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex + diffY]);
                    }
                }
                break;
            case 4:
                if (diffY > 2) {
                    // 向上
                    pathAltasPointArray.push(point1 = altasPointA.altasRow.altasPointArray[altasPointA.columnIndex - 1]);
                    // 向左
                    pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex - diffY]);
                } else {
                    // 向左
                    pathAltasPointArray.push(point1 = altasPointA.altasColumn.altasPointArray[altasPointA.rowIndex - 1]);
                }
                break;
            case 5:
                // 不处理自己依赖自己
                break;
            case 6:
                if (diffY > 2) {
                    // 向上
                    pathAltasPointArray.push(point1 = altasPointA.altasRow.altasPointArray[altasPointA.columnIndex - 1]);
                    // 向右
                    pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex + diffY]);
                } else {
                    // 向右
                    pathAltasPointArray.push(point1 = altasPointA.altasColumn.altasPointArray[altasPointA.rowIndex + 1]);
                }
                break;
            case 7:
                if (isAlignV) {
                    // 向左
                    pathAltasPointArray.push(point1 = altasPointA.altasColumn.altasPointArray[altasPointA.rowIndex - 1]);
                    if (diffY > 2) {
                        // 向下
                        pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex + diffX - 1]);
                        // 向左
                        pathAltasPointArray.push(point3 = point2.altasColumn.altasPointArray[point2.rowIndex - (diffY - 1)]);
                    } else {
                        // 向下
                        pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex + diffX]);
                    }
                } else {
                    // 向下
                    pathAltasPointArray.push(point1 = altasPointA.altasRow.altasPointArray[altasPointA.columnIndex + 1]);
                    if (diffX > 2) {
                        // 向左
                        pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex - (diffY - 1)]);
                        // 向下
                        pathAltasPointArray.push(point3 = point2.altasRow.altasPointArray[point2.columnIndex + (diffX - 1)]);
                    } else {
                        // 向左
                        pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex - diffY]);
                    }
                }
                break;
            case 8:
                if (diffX > 2) {
                    // 向左
                    pathAltasPointArray.push(point1 = altasPointA.altasColumn.altasPointArray[altasPointA.rowIndex - 1]);
                    // 向下
                    pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex + diffX]);
                    break;
                } else {
                    // 向下
                    pathAltasPointArray.push(point1 = altasPointA.altasRow.altasPointArray[altasPointA.columnIndex + 1]);
                }
                break;
            case 9:
                if (isAlignV) {
                    // 向右
                    pathAltasPointArray.push(point1 = altasPointA.altasColumn.altasPointArray[altasPointA.rowIndex + 1]);
                    if (diffY > 2) {
                        // 向下
                        pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex + (diffX - 1)]);
                        // 向右
                        pathAltasPointArray.push(point3 = point2.altasColumn.altasPointArray[point2.rowIndex + (diffY - 1)]);
                    } else {
                        // 向下
                        pathAltasPointArray.push(point2 = point1.altasRow.altasPointArray[point1.columnIndex + diffX]);
                    }
                } else {
                    // 向下
                    pathAltasPointArray.push(point1 = altasPointA.altasRow.altasPointArray[altasPointA.columnIndex + 1]);
                    if (diffX > 2) {
                        // 向右
                        pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex + (diffY - 1)]);
                        // 向下
                        pathAltasPointArray.push(point3 = point2.altasRow.altasPointArray[point2.columnIndex + (diffX - 1)]);
                    } else {
                        // 向右
                        pathAltasPointArray.push(point2 = point1.altasColumn.altasPointArray[point1.rowIndex + diffY]);
                    }
                }
                break;
        }
        pathAltasPointArray.push(altasPointB);
        return pathAltasPointArray;
    };

    /**
     * 单元对象
     * @constructor
     */
    function AltasCell(options) {

        // 宽度
        this.width = 200;
        // 高度
        this.height = 40;
        // 中心点位置
        this.centerPoint = null;
        // 文本
        this.text = '';
        // 存储的数据
        this.data = null;
        // top点
        this.topPoint = null;
        // right点
        this.rightPoint = null;
        // bottom点
        this.bottomPoint = null;
        // left点
        this.leftPoint = null;
        // 指向依赖
        this.out = {
            // 指向依赖
            altasCellArray: [],
            // 所有指向联通线
            altasLineArray: [],
            // top点的指向联通线
            topAltasLineArray: [],
            // right点的指向联通线
            rightAltasLineArray: [],
            // bottom点的指向联通线
            bottomAltasLineArray: [],
            // left点的指向联通线
            leftAltasLineArray: []
        };
        // 接收依赖
        this.accept = {
            // 接收依赖
            altasCellArray: [],
            // 所有接收联通线
            altasLineArray: [],
            // top点的接收联通线
            topAltasLineArray: [],
            // right点的接收联通线
            rightAltasLineArray: [],
            // bottom点的接收联通线
            bottomAltasLineArray: [],
            // left点的接收联通线
            leftAltasLineArray: []
        };

        this.assign(options)
            .init();
    }

    AltasCell.prototype = new Base();
    AltasCell.prototype.init = function() {
        var halfWidth = this.width / 2,
            halfHeight = this.height / 2;

        // 计算单元的四个出线/入线点
        this.topPoint = this.centerPoint.clone({
            y: this.centerPoint.y - halfHeight,
            altasCell: this
        });
        this.rightPoint = this.centerPoint.clone({
            x: this.centerPoint.x + halfWidth,
            altasCell: this
        });
        this.bottomPoint = this.centerPoint.clone({
            y: this.centerPoint.y + halfHeight,
            altasCell: this
        });
        this.leftPoint = this.centerPoint.clone({
            x: this.centerPoint.x - halfWidth,
            altasCell: this
        });
        return this;
    };
    /**
     * 记录出线依赖
     * @param relyAltasCellArray
     * @param relyTextArray
     * @param isAlignV
     * @returns {AltasCell}
     */
    AltasCell.prototype.relyOut = function(relyAltasCellArray, relyTextArray, isAlignV) {
        var that = this;
        $.each(relyAltasCellArray, function(i, relyAltasCell) {
            if ($.inArray(relyAltasCell, that.out.altasCellArray) === -1) {
                var altasLine = AltasLine.line(that, relyAltasCell, isAlignV);
                altasLine.assign({
                    text: relyTextArray[i] || ''
                });
                that.out.altasCellArray.push(relyAltasCell);
                that.out.altasLineArray.push(altasLine);
                relyAltasCell.accept.altasCellArray.push(this);
                relyAltasCell.accept.altasLineArray.push(altasLine);
                switch (altasLine.outDirection) {
                    case 'top':
                        that.out.topAltasLineArray.push(altasLine);
                        break;
                    case 'right':
                        that.out.rightAltasLineArray.push(altasLine);
                        break;
                    case 'bottom':
                        that.out.bottomAltasLineArray.push(altasLine);
                        break;
                    case 'left':
                        that.out.leftAltasLineArray.push(altasLine);
                        break;
                }
                switch (altasLine.inDirection) {
                    case 'top':
                        relyAltasCell.accept.topAltasLineArray.push(altasLine);
                        break;
                    case 'right':
                        relyAltasCell.accept.rightAltasLineArray.push(altasLine);
                        break;
                    case 'bottom':
                        relyAltasCell.accept.bottomAltasLineArray.push(altasLine);
                        break;
                    case 'left':
                        relyAltasCell.accept.leftAltasLineArray.push(altasLine);
                        break;
                }
            }
        });
        return this;
    };

    /**
     * 联通线对象
     * @constructor
     */
    function AltasLine(options) {

        // 起始点
        this.startPoint = null;
        // 终止点
        this.endPoint = null;
        // 组成该联通线的所有分段线
        this.altasSectionalLineArray = [];
        // 所属单元
        this.altasCell = null;
        // 指向单元
        this.toAltasCell = null;
        // 出线方向
        this.outDirection = 'none';
        // 入线方向
        this.inDirection = 'none';
        // 输出文本
        this.text = '';

        this.assign(options);
    }

    AltasLine.prototype = new Base();
    /**
     * 克隆对象
     * @param options
     * @param deep
     * @returns {AltasLine}
     */
    AltasLine.prototype.clone = function(options, deep) {
        return new AltasLine($.extend(deep, {}, this, options));
    };
    /**
     * 生成两个单元之间的联通线
     * @param altasCellA
     * @param altasCellB
     * @param isAlignV 是否垂直排列
     * @returns {AltasLine}
     */
    AltasLine.line = function(altasCellA, altasCellB, isAlignV) {
        var l = 0,
            direction = AltasPointer.ABDirection(altasCellA.centerPoint, altasCellB.centerPoint),
            diffX = Math.abs(altasCellA.centerPoint.columnIndex - altasCellB.centerPoint.columnIndex),
            diffY = Math.abs(altasCellA.centerPoint.rowIndex - altasCellB.centerPoint.rowIndex),
            isCrossCellX = diffX > 2,
            isCrossCellY = diffY > 2,
            altasLine = new AltasLine({
                altasCell: altasCellA,
                toAltasCell: altasCellB
            }),
            pathAltasPointArray = [];
        /*
         1   2   3
         4   5   6
         7   8   9
         */
        switch (direction) {
            case 1:
                if (isAlignV) {
                    altasLine.assign({
                        startPoint: altasCellA.leftPoint,
                        endPoint: isCrossCellY ? altasCellB.bottomPoint : altasCellB.rightPoint,
                        outDirection: 'left',
                        inDirection: isCrossCellY ? 'bottom' : 'right'
                    });
                } else {
                    altasLine.assign({
                        startPoint: altasCellA.topPoint,
                        endPoint: isCrossCellX ? altasCellB.rightPoint : altasCellB.bottomPoint,
                        outDirection: 'top',
                        inDirection: isCrossCellX ? 'right' : 'bottom'
                    });
                }
                break;
            case 2:
                altasLine.assign({
                    startPoint: isCrossCellX ? altasCellA.leftPoint : altasCellA.topPoint,
                    endPoint: isCrossCellX ? altasCellB.leftPoint : altasCellB.bottomPoint,
                    outDirection: isCrossCellX ? 'left' : 'top',
                    inDirection: isCrossCellX ? 'left' : 'bottom'
                });
                break;
            case 3:
                if (isAlignV) {
                    altasLine.assign({
                        startPoint: altasCellA.rightPoint,
                        endPoint: isCrossCellY ? altasCellB.bottomPoint : altasCellB.leftPoint,
                        outDirection: 'right',
                        inDirection: isCrossCellY ? 'bottom' : 'left'
                    });
                } else {
                    altasLine.assign({
                        startPoint: altasCellA.topPoint,
                        endPoint: isCrossCellX ? altasCellB.leftPoint : altasCellB.bottomPoint,
                        outDirection: 'top',
                        inDirection: isCrossCellX ? 'left' : 'bottom'
                    });
                }
                break;
            case 4:
                altasLine.assign({
                    startPoint: isCrossCellY ? altasCellA.topPoint : altasCellA.leftPoint,
                    endPoint: isCrossCellY ? altasCellB.topPoint : altasCellB.rightPoint,
                    outDirection: isCrossCellY ? 'top' : 'left',
                    inDirection: isCrossCellY ? 'top' : 'right'
                });
                break;
            case 6:
                altasLine.assign({
                    startPoint: isCrossCellY ? altasCellA.topPoint : altasCellA.rightPoint,
                    endPoint: isCrossCellY ? altasCellB.topPoint : altasCellB.leftPoint,
                    outDirection: isCrossCellY ? 'top' : 'right',
                    inDirection: isCrossCellY ? 'top' : 'left'
                });
                break;
            case 7:
                if (isAlignV) {
                    altasLine.assign({
                        startPoint: altasCellA.leftPoint,
                        endPoint: isCrossCellY ? altasCellB.topPoint : altasCellB.rightPoint,
                        outDirection: 'left',
                        inDirection: isCrossCellY ? 'top' : 'right'
                    });
                } else {
                    altasLine.assign({
                        startPoint: altasCellA.bottomPoint,
                        endPoint: isCrossCellX ? altasCellB.rightPoint : altasCellB.topPoint,
                        outDirection: 'bottom',
                        inDirection: isCrossCellX ? 'right' : 'top'
                    });
                }
                break;
            case 8:
                altasLine.assign({
                    startPoint: isCrossCellX ? altasCellA.leftPoint : altasCellA.bottomPoint,
                    endPoint: isCrossCellX ? altasCellB.leftPoint : altasCellB.topPoint,
                    outDirection: isCrossCellX ? 'left' : 'bottom',
                    inDirection: isCrossCellX ? 'left' : 'top'
                });
                break;
            case 9:
                if (isAlignV) {
                    altasLine.assign({
                        startPoint: altasCellA.rightPoint,
                        endPoint: isCrossCellY ? altasCellB.topPoint : altasCellB.leftPoint,
                        outDirection: 'right',
                        inDirection: isCrossCellY ? 'top' : 'left'
                    });
                } else {
                    altasLine.assign({
                        startPoint: altasCellA.bottomPoint,
                        endPoint: isCrossCellX ? altasCellB.leftPoint : altasCellB.topPoint,
                        outDirection: 'bottom',
                        inDirection: isCrossCellX ? 'left' : 'top'
                    });
                }
                break;
        }
        // 计算联通线路径经过的所有点
        pathAltasPointArray = AltasPointer.ABPath(altasLine.startPoint, altasLine.endPoint, direction, isAlignV);
        // 生成分段线
        l = pathAltasPointArray.length;
        $.each(pathAltasPointArray, function(i, altasPoint) {
            if (i === l - 1) {
                return false;
            }
            // 分段线的起始点使用新的点实例，不使用共享实例
            var altasSectionalLine = new AltasSectionalLine({
                startPoint: altasPoint.clone(),
                endPoint: pathAltasPointArray[i + 1].clone(),
                lineIndex: i,
                isFirstSectionalLine: i === 0,
                isLastSectionalLine: i === l - 2,
                altasLine: altasLine
            });
            altasLine.altasSectionalLineArray.push(altasSectionalLine);

            // 将分段线分配到所在行和列，出线不做偏移
            if (!altasSectionalLine.isFirstSectionalLine) {
                if (altasSectionalLine.startPoint.x === altasSectionalLine.endPoint.x) {
                    altasPoint.altasRow.altasSectionalLineArray.push(altasSectionalLine);
                } else if (altasSectionalLine.startPoint.y === altasSectionalLine.endPoint.y) {
                    altasPoint.altasColumn.altasSectionalLineArray.push(altasSectionalLine);
                }
            }
        });
        // 分段线的前后分段线关系记录
        $.each(altasLine.altasSectionalLineArray, function(i, altasSectionLine) {
            altasSectionLine.assign({
                prevSectionalLine: altasLine.altasSectionalLineArray[i - 1] || null,
                nextSectionalLine: altasLine.altasSectionalLineArray[i + 1] || null
            });
        });
        return altasLine;
    };

    /**
     * 分段线对象
     * @constructor
     */
    function AltasSectionalLine(options) {

        // 起始点
        this.startPoint = null;
        // 终止点
        this.endPoint = null;
        // 分段线属于联通线中的第几条，0表示第一条
        this.lineIndex = 0;
        // 是否为联通线的第一条分段线
        this.isFirstSectionalLine = false;
        // 是否为联通线的最后一条分段线
        this.isLastSectionalLine = false;
        // 前一条分段线，第一条时为null
        this.prevSectionalLine = null;
        // 后一条分段线，最后一条时为null
        this.nextSectionalLine = null;
        // 所属联通线
        this.altasLine = null;

        this.assign(options);
    }

    AltasSectionalLine.prototype = new Base();
    /**
     * 克隆对象
     * @param options
     * @param deep
     * @returns {AltasSectionalLine}
     */
    AltasSectionalLine.prototype.clone = function(options, deep) {
        return new AltasSectionalLine($.extend(deep, {}, this, options));
    };

    /**
     * 弧对象
     * @constructor
     */
    function AltasArc(options) {

        // 圆心
        this.point = null;
        // 半径
        this.arc = 0;
        // 方向，1-上，2-又，3-下，4-左
        this.dir = 1;
        // 前一条分段线
        this.prevAltasSectionalLine = null;
        // 后一条分段线
        this.nextAltasSectionalLine = null;
        // 跨越的分段线
        this.crossSectionalLineArray = [];

        this.assign(options);
    }

    AltasArc.prototype = new Base();

    /**
     * 绘图
     * @constructor
     */
    var Paint = {
        paper: null,
        css: {
            title: 'altas-title',
            cell: 'altas-cell',
            point: 'altas-point',
            relyText: 'altas-rely-text'
        },
        /**
         * 画标题
         * @param altasCell
         * @param style
         * @returns {*|{top}|{top, left}}
         */
        title: function(altasCell, style) {
            return $('<div></div>').addClass(this.css.title)
                .text(altasCell.text || '')
                .css(style || {})
                .offset({
                    left: altasCell.centerPoint.x - altasCell.width / 2,
                    top: altasCell.centerPoint.y - altasCell.height / 2
                });
        },
        /**
         * 画依赖文本
         * @param altasCell
         * @param style
         * @returns {*|{top}|{top, left}}
         */
        relyText: function(altasCell, style) {
            return $('<div></div>').addClass(this.css.relyText)
                .text(altasCell.text || '')
                .css(style || {})
                .offset({
                    left: altasCell.centerPoint.x - altasCell.width / 2,
                    top: altasCell.centerPoint.y - altasCell.height / 2
                });
        },
        /**
         * 画单元
         * @param altasCell
         * @param style
         * @returns {*|{left, top}|{top, left}}
         */
        cell: function(altasCell, style) {
            return $('<div></div>').addClass(this.css.cell)
                .text(altasCell.text || '')
                .css(style || {})
                .offset({
                    left: altasCell.centerPoint.x - altasCell.width / 2,
                    top: altasCell.centerPoint.y - altasCell.height / 2
                });
        },
        /**
         * 画点
         * @param altasPoint
         * @param style
         * @returns {*|{left, top}|{top, left}}
         */
        point: function(altasPoint, style) {
            return $('<div></div>').addClass(this.css.point)
                .text('(' + altasPoint.x + ',' + altasPoint.y + ')')
                .css(style || {})
                .offset({
                    left: altasPoint.x,
                    top: altasPoint.y
                });
        },
        /**
         * 得到箭头路径
         * @param x1
         * @param y1
         * @param x2
         * @param y2
         * @param arrowSize
         * @returns {*[]}
         */
        arrow: function(x1, y1, x2, y2, arrowSize) {
            var angle = Raphael.angle(x1, y1, x2, y2);  // 得到两点之间的角度
            var a45 = Raphael.rad(angle - 45);          // 角度转换成弧度
            var a45m = Raphael.rad(angle + 45);
            var x2a = x2 + Math.cos(a45) * arrowSize;
            var y2a = y2 + Math.sin(a45) * arrowSize;
            var x2b = x2 + Math.cos(a45m) * arrowSize;
            var y2b = y2 + Math.sin(a45m) * arrowSize;
            return [
                {x: x2a, y: y2a},
                {x: x2b, y: y2b}
            ];
        },
        /**
         * 画分段线
         * @param altasSectionalLine
         * @param style
         * @returns {Paint}
         */
        sectionalLine: function(altasSectionalLine, style) {
            var path = [
                'M', altasSectionalLine.startPoint.x, altasSectionalLine.startPoint.y,
                'L', altasSectionalLine.endPoint.x, altasSectionalLine.endPoint.y];
            if (altasSectionalLine.isLastSectionalLine) {
                var arrow = this.arrow(altasSectionalLine.startPoint.x, altasSectionalLine.startPoint.y,
                    altasSectionalLine.endPoint.x, altasSectionalLine.endPoint.y, 8),
                    arrowPath = [
                        'M', altasSectionalLine.endPoint.x, altasSectionalLine.endPoint.y,
                        'L', arrow[0].x, arrow[0].y,
                        'M', altasSectionalLine.endPoint.x, altasSectionalLine.endPoint.y,
                        'L', arrow[1].x, arrow[1].y
                    ];
                path = path.concat(arrowPath);
            }
            this.paper.path(path).attr(style || {});
            return this;
        },
        /**
         * 画联通线
         * @param altasLine
         * @param style
         * @param $container
         * @returns {Paint}
         */
        line: function(altasLine, style, $container) {
            var that = this;
            $.each(altasLine.altasSectionalLineArray, function(i, altasSectionalLine) {
                that.sectionalLine(altasSectionalLine, style);
            });
            // 画线上的文本
            // if (altasLine.text) {
            //     var l = altasLine.altasSectionalLineArray.length,
            //         altasSectionalLine = null,
            //         centerPoint = new AltasPointer({
            //             x: 0,
            //             y: 0
            //         });
            //     if (l > 0) {
            //         if (l <= 2) {
            //             altasSectionalLine = altasLine.altasSectionalLineArray[l - 1];
            //         } else {
            //             altasSectionalLine = altasLine.altasSectionalLineArray[l - 2];
            //         }
            //         centerPoint.assign({
            //             x: (altasSectionalLine.startPoint.x + altasSectionalLine.endPoint.x)/2,
            //             y: (altasSectionalLine.startPoint.y + altasSectionalLine.endPoint.y)/2
            //         });
            //         this.relyText(new AltasCell({
            //             centerPoint: centerPoint,
            //             width: 50,
            //             height: 30,
            //             text: altasLine.text
            //         })).appendTo($container);
            //     }
            // }
            return this;
        },
        /**
         * 画圆弧
         * @param altasArc
         * @param style
         * @returns {Paint}
         */
        arc: function(altasArc, style) {
            this.paper.path([
                'M', altasArc.point.x - altasArc.arc, altasArc.point.y,
                'C', altasArc.point.x - altasArc.arc, altasArc.point.y,
                altasArc.point.x, altasArc.point.y - altasArc.arc,
                altasArc.point.x + altasArc.arc, altasArc.point.y
            ]).attr(style || {});
            return this;
        }
    };

    // 只暴露出顶级图谱构造器
    window.Altas = Altas;
}(jQuery, Raphael));
