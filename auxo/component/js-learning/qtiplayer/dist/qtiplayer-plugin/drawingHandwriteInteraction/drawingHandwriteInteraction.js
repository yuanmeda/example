(function (window, $) {

    //var isApp = false;
    var isApp = (typeof AndroidInterface != "undefined");
    if (!isApp) {
        return;
    }

    var _logger = window.QtiPlayer.getLogger();
    var _QtiPlayer = window.QtiPlayer;
    if (!_QtiPlayer.HandwriteInteraction) {
        _QtiPlayer.HandwriteInteraction = {
            clipBoardId: {},
            instances: {},
            createListener: [],
            deleteListener: [],
            removeItem: function (arry, obj) {
                for (var i = 0; i < arry.length; i++) {
                    var temp = arry[i];
                    if (!isNaN(obj)) {
                        temp = i;
                    }
                    if (temp == obj) {
                        for (var j = i; j < arry.length; j++) {
                            arry[j] = arry[j + 1];
                        }
                        arry.length = arry.length - 1;
                    }
                }
            },
            clearCache: function () {
                for (var key in _QtiPlayer.HandwriteInteraction.instances) {
                    var instance = _QtiPlayer.HandwriteInteraction.instances[key];
                    if (instance != null && !instance.isDomExist()) {
                        instance._fullScreenCallBack(false);
                        delete _QtiPlayer.HandwriteInteraction.instances[key];
                    }
                }
            },
            clearInstance: function (instance) {
                for (var key in _QtiPlayer.HandwriteInteraction.instances) {
                    if (_QtiPlayer.HandwriteInteraction.instances[key] == instance) {
                        instance._fullScreenCallBack(false);
                        delete _QtiPlayer.HandwriteInteraction.instances[key];
                    }
                }
            },
            updateAnswer: function (callback) {
                for (var key in _QtiPlayer.HandwriteInteraction.instances) {
                    var instance = _QtiPlayer.HandwriteInteraction.instances[key];
                    if (instance != null && !instance.isDomExist()) {
                        instance._fullScreenCallBack(false);
                        delete _QtiPlayer.HandwriteInteraction.instances[key];
                        continue;
                    }
                    instance.updateAnswer(callback);
                }
            },
            registerListener: function (fn, type) {
                if (type.create) {
                    this.removeItem(this.createListener, fn);
                    this.createListener.push(fn);
                } else if (type.remove) {
                    this.removeItem(this.deleteListener, fn);
                    this.deleteListener.push(fn);
                }
            },
            removeListener: function (fn) {
                this.removeItem(this.createListener, fn);
                this.removeItem(this.deleteListener, fn);
            },
            excCreateListener: function (id, res) {
                for (var i = 0; i < this.createListener.length; i++) {
                    var obj = this.createListener[i];
                    obj && obj(id, res);
                }
            },
            excRemoveListener: function (id, res) {
                for (var i = 0; i < this.deleteListener.length; i++) {
                    var obj = this.deleteListener[i];
                    obj && obj(id, res);
                }
            }
        }
    }

    //var bridgeListener = {};
    var registerNativeListener = function (key, callback) {
        if (typeof Bridge != 'undefined' && Bridge.registerListener) {
            Bridge.registerListener(key, callback);
        }
    };

    //window.QtiPlayer.HandwriteInteraction.writingCallback = {}
    registerNativeListener("HandwriteInteraction.Writing", function (obj) {
        for (var key in _QtiPlayer.HandwriteInteraction.instances) {
            var instance = _QtiPlayer.HandwriteInteraction.instances[key];
            if (instance != null && !instance.isDomExist()) {
                instance._fullScreenCallBack(false);
                delete _QtiPlayer.HandwriteInteraction.instances[key];
                continue;
            }
            instance.writing(obj && obj.id);
        }
    });

    registerNativeListener("HandwriteInteraction.updateAnswer", function (obj) {
        for (var key in _QtiPlayer.HandwriteInteraction.instances) {
            var instance = _QtiPlayer.HandwriteInteraction.instances[key];
            if (instance != null && !instance.isDomExist()) {
                instance._fullScreenCallBack(false);
                delete _QtiPlayer.HandwriteInteraction.instances[key];
                continue;
            }
            instance.updateAnswerComplete(obj && obj.id, obj && obj.base64);
        }
    });

    //创建
    var _modelHandler = {
        _name: 'drawingInteraction_handwrite',
        //获取model名称
        getName: function () {
            return this._name;
        },
        //创建渲染的方法
        create: function (modelItem) {
            _QtiPlayer.HandwriteInteraction.clearCache();

            var interaction = null;
            modelItem.init = function () {
                interaction = new DrawingHandwriteInteraction(modelItem);
                _QtiPlayer.HandwriteInteraction.instances[interaction.interactionId] = interaction;
            }
            //该model没有小题编号
            modelItem.hasNum = function () {
                return false;
            };
            modelItem.createTitleHtml = function () {
                return interaction.createTitleHtml();
            }
            modelItem.createAnswerHtml = function (option) {
                interaction.setOption(option);
                return interaction.createHtml();
            }
            modelItem.render = function ($view, option) {
                interaction.setOption(option);
            }
            modelItem.eventHandle = function ($view, option) {
                interaction.eventHandle($view);
            }
            modelItem.destroy = function () {
                QtiPlayer.HandwriteInteraction.clearInstance(interaction);
                interaction = null;
            }
        }
    };
    //注册

    _QtiPlayer.registerModelHandler(_modelHandler);


    var DrawingHandwriteInteraction = window.QtiPlayer.Class(window.QtiPlayer.BaseInteraction, (function () {

            var callNative = function (eventName, data) {
                if ((typeof Bridge != "undefined") && Bridge && Bridge.callNative) {
                    return Bridge.callNative('com.nd.pad.icr.ui.IcrJsBridge', eventName, data);
                }
                return false;
            };


            var nativeRemoveClipBoard = function (id) {
                var res = callNative('removeClipboard', {
                    id: id
                });
                //res = {success: true};
                if (res && res.success) {
                    delete  _QtiPlayer.HandwriteInteraction.clipBoardId[id];
                }
                _QtiPlayer.HandwriteInteraction.excRemoveListener(id, res);
                return res;
            }

            var nativeCreateClipBoard = function (id, l, t, r, b, bgurl) {
                var res = callNative('addClipboard', {
                    id: id,
                    left: l,
                    top: t,
                    right: r,
                    bottom: b,
                    bgUrl: bgurl
                });
                //res = {success: true};
                if (res && res.success) {
                    _QtiPlayer.HandwriteInteraction.clipBoardId[id] = id;
                }
                _QtiPlayer.HandwriteInteraction.excCreateListener(id, res);
                return res;
            }

            var nativeGetClipBoardBase64 = function (id) {
                return callNative('getClipboardContent', {
                    id: id
                });
                //return {
                //    success: true,
                //    content: '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'
                //};
            }


            //类成员
            var member = {

                /**
                 * 构造函数，并声明全局变量
                 * @param modalItem
                 * @param $view
                 * @param option
                 * @constructor
                 */
                Create: function (modalItem, $view, option) {
                    this.base(modalItem, $view, option);
                    this.canvasWidth = 0;
                    this.canvasHeight = 0;
                    this._fullScreen = false;
                    this.canvasNativeHeight = 0;
                    this.canvasId = this.interactionId + "-canvas";
                    this.nativeCanvasId = this.interactionId + "native";
                    this.contentOffset = {};
                    this.answerCount = 0;//答案计数器，用来更新答案来进行回调

                    this._fullScreenChangeHandler = this.proxy( this._fullScreenChangeHandler);
                    this._fullScreenCallBack(true);
                },
                proxy: function (fn) {
                    var thisobj = this;
                    return function () {
                        return fn.apply(thisobj, arguments);
                    };
                },
                createTitleHtml: function () {
                    return '<div class="qp-model-header">' + this.modalModel.prompt + '</div>';
                },
                /**
                 * 渲染数据
                 */
                createHtml: function () {
                    var _self = this;
                    _self.refPath = "";
                    _self.setResultXml = "";

                    var createHtml = function () {
                        var html = '';
                        var bg = _self.modalModel.object.data;
                        var style = '';
                        var cavsClass = '';
                        if (bg.length > 0) {
                            style = 'background-image: url(\'' + bg + '\');'
                        } else {
                            //无背景时，手写题在老师端显示空白背景和学生端同步
                            cavsClass = 'qp-hw-cavs-nobg-hd-pad';
                        }
                        html += '      <div class="qp-hw-drawing-content" style="visibility: hidden;" >                                                                                                                       ';
                        html += '      <div style="position: relative" class="qp-hw-drawing-box" >                                                                                                                       ';
                        html += '        <div  class="qp-hw-writing_edit" style="display: none">                                                                                                                          ';
                        html += '          <a href="javascript:void(0)" class="qp-hw-writing_botton qp-hw-classlink" style="display:none;" id="btn_back">                                                                  ';
                        html += '              <ins class="qp-hw-icon_back"></ins>                                                                                                                ';
                        html += '          </a>                                                                                                                                                ';
                        html += '          <a href="javascript:void(0)" class="qp-hw-writing_botton qp-hw-classlink" id="write">                                                                     ';
                        html += '              <ins class="qp-hw-icon_writing"></ins>                                                                                                             ';
                        html += '          </a>                                                                                                                                                ';
                        html += '              <a href="javascript:void(0)" class="qp-hw-writing_botton qp-hw-botton_clear" id="clear">                                                              ';
                        html += '                  <ins class="qp-hw-icon_clear"></ins>                                                                                                           ';
                        html += '              </a>                                                                                                                                            ';
                        html += '              <a href="javascript:void(0)"  class="qp-hw-writing_botton qp-hw-botton_allclear qp-hw-classlink" id="clearall">                                          ';
                        html += '                  <ins class="qp-hw-icon_allclear"></ins>                                                                                                        ';
                        html += '              </a>                                                                                                                                            ';
                        html += '        </div>                                                                                                   ';
                        html += '          <canvas class="' + cavsClass + ' qp-hw-cavs" id="' + _self.canvasId + '" style="' + style + '">               ';
                        html += '              Fallback content, in case the browser does not support Canvas.                                                                                  ';
                        html += '          </canvas>                                                                                                                                           ';
                        html += '      </div>                                                                                                                                                  ';
                        html += '      </div>                                                                                                                                                  ';
                        return html;
                    };
                    var init = function () {
                        return createHtml();
                    };
                    return init();
                },
                _fullScreenCallBack: function (on) {
                    on = on ? 'on' : 'off';
                    $(document)[on]('webkitfullscreenchange', this._fullScreenChangeHandler);
                },
                _fullScreenChangeHandler: function () {
                    var that = this;
                    that._fullScreenTrigger = true;
                    that._fullScreen = !that._fullScreen;
                    clearTimeout(that._fullscreenTimeoutid);
                    that._fullscreenTimeoutid = setTimeout(function () {
                        that._fullScreenTrigger = false;
                    }, 1000);
                },
                eventHandle: function ($view) {
                    var _self = this;
                    $view.attr("data-key", _self.interactionId);
                    var resizeWh = function () {
                        _self.canvasWidth = _self.modalModel.object.width;
                        _self.canvasHeight = _self.modalModel.object.height;
                        _self.canvasNativeHeight = _self.modalModel.object.height;
                        var $canvas = $view.find(".qp-hw-drawing-content canvas");
                        $canvas.css({
                            width: _self.canvasWidth,
                            height: _self.canvasHeight
                        });
                        try {
                            if ($canvas && $canvas.length > 0 && $canvas[0]) {
                                $canvas[0].width = _self.canvasWidth;
                                $canvas[0].height = _self.canvasHeight;
                            }
                        } catch (e) {
                            _logger.debug("手写题渲染异常");
                            _logger.debug($canvas);
                        }

                        $view.find('.qp-hw-drawing-box').css({
                            width: _self.canvasWidth + 3
                            //height: resize.h + 10
                        });
                    };

                    var imageLoad = function (src, callback) {
                        var img = new Image();
                        img.crossOrigin = "anonymous";
                        img.src = src;
                        if (img.complete) {
                            callback(img, true);
                        } else {
                            img.onload = function () {
                                callback(img, true);
                                img.onload = null;
                            };
                        }
                        img.onerror = function () {
                            callback(img, false);
                            img.onerror = null;
                        }
                    };


                    var imgLoadComplete = function (completeCallback) {
                        var $imgs = $view.find("img");
                        if ($imgs.length <= 0) {
                            completeCallback();
                            return;
                        } else {
                            var loadSize = 0;
                            $.each($imgs, function (index) {
                                imageLoad($($imgs[index]).attr("src"), function (img, succeed) {
                                    loadSize++;
                                    _logger.debug("loadSize:" + loadSize);
                                    if (loadSize == $imgs.length) {
                                        completeCallback();
                                    }
                                });
                            });
                        }
                    }

                    var bindEvent = function () {
                        resizeWh();
                        imgLoadComplete(function () {
                            //判断是否被移除
                            if ($view.find(".qp-hw-drawing-content").length == 0) {
                                return;
                            }
                            var offset = $view.find(".qp-hw-drawing-content").offset();
                            _self.contentOffset = offset;
                            var res = nativeCreateClipBoard(_self.nativeCanvasId, offset.left, offset.top, offset.left + _self.canvasWidth, offset.top + _self.canvasNativeHeight, _self.modalModel.object.data);
                            if (res && res.success) {
                                $view.find(".qp-hw-drawing-content").css("visibility", "hidden");
                                $view.resize(function () {

                                    //全屏导致的重绘，不进行处理
                                    if (_self._fullScreenTrigger || _self._fullScreen || document.webkitIsFullScreen) {
                                        _logger.debug('-------------fullscreent:');
                                        return;
                                    }
                                    _logger.debug("drawing-resize:"+document.webkitIsFullScreen);
                                    var $drawContent = $view.find(".qp-hw-drawing-content");
                                    if ($drawContent && $drawContent.length > 0) {
                                        var offset = $drawContent.offset();

                                        if (Math.abs(offset.left - _self.contentOffset.left) > 10 || Math.abs(offset.top - _self.contentOffset.top) > 10) {
                                            _logger.debug("drawing-resize-do");
                                            _self.contentOffset = offset;
                                            var removeRes = nativeRemoveClipBoard(_self.nativeCanvasId);
                                            if (removeRes && removeRes.success) {
                                                _self.nativeCanvasId += "1";
                                                nativeCreateClipBoard(_self.nativeCanvasId, offset.left, offset.top, offset.left + _self.canvasWidth, offset.top + _self.canvasNativeHeight, _self.modalModel.object.data);
                                            }
                                        }
                                    }
                                });
                            } else {
                                //教师端
                                $view.find(".qp-hw-drawing-content").css("visibility", "visible");
                            }
                        });

                    };


                    var setAnswer = function (answers) {
                        if (!answers || answers[0] == undefined || answers[0] == null)
                            return;
                        var rect = JSON.parse(answers[0].split('|$*-*$|')[0]);
                        var base64 = answers[0].split('|$*-*$|')[1];
                        var bg = _self.modalModel.object.data;
                        var style = 'width:' + rect.width + 'px;height:' + rect.height + 'px;border: 1px solid rgb(136, 136, 136);' + (bg.length > 0 ? 'background-image: url(\'' + bg + '\');' : '');
                        var answer = '<img style="' + style + '" src="' + base64 + '">';
                        $view.find('.qp-hw-drawing-box').attr("style", "");
                        $view.find('.qp-hw-drawing-box').html(answer);
                        $view.find(".qp-hw-drawing-content").css("visibility", "visible");
                    };

                    var initEvent = function () {
                        bindEvent();
                        //_self.setAnswer(getAnswer());
                        if (_self.option.showAnswer) {
                            setAnswer(_self.getAnswer());
                        }
                    };

                    initEvent();
                },
                getCurrentAnswer: function () {
                    var _self = this;
                    var imgBase64 = "";

                    var res = nativeGetClipBoardBase64(_self.nativeCanvasId);
                    var arry = {
                        width: _self.canvasWidth,
                        height: _self.canvasNativeHeight
                    };
                    if (res && res.success && res.content && res.content.length > 0) {
                        if (res.content.substr(0, 5) != "data:") {
                            res.content = 'data:image/png;base64,' + res.content;
                        }
                        imgBase64 = res.content;
                    }
                    var answer = [];

                    answer.push(JSON.stringify(arry) + "|$*-*$|" + imgBase64);
                    return answer;
                },
                updateAnswer: function (callback) {
                    var _self = this;
                    _self.setAnswer(_self.getCurrentAnswer());
                    this.updateAnswerCallback = callback;
                },
                writing: function (id) {
                    var _self = this;
                    if (_self.nativeCanvasId == id) {
                        _self.answerCount++;
                        _self.setAnswer([_self.answerCount]);
                    }
                },
                updateAnswerComplete: function (id, base64) {
                    var _self = this;
                    if (_self.nativeCanvasId == id) {
                        var arry = {
                            width: _self.canvasWidth,
                            height: _self.canvasNativeHeight
                        };
                        if (base64 && base64.length > 0 && base64.substr(0, 5) != "data:") {
                            base64 = 'data:image/png;base64,' + base64;
                        }
                        var answer = [];

                        answer.push(JSON.stringify(arry) + "|$*-*$|" + base64);
                        _self.setAnswer(answer);

                        _self.updateAnswerCallback && _self.updateAnswerCallback();
                    }
                }
            };
            return member;
        })()
    );
})
(window, jQuery);

