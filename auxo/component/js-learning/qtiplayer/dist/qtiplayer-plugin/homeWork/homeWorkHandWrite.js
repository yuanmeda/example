//create by ylf 2016-3-7


//重写Qtiplayer.createPlayer方法，并对示例方法进行重写和扩充
(function (window, $) {

    //TODO:上线后修改为false
    var isDebug = false;

    var isHomeWork = /sys=homework/i.test(location.search);
    if (!isHomeWork && !isDebug) {
        return;
    }

    var _QtiPlayer = window.QtiPlayer;
    if (!_QtiPlayer || !_QtiPlayer.createPlayer) {
        throw '请先加载qti-player.js';
    }

    var _utils = _QtiPlayer.getUtils();
    var _logger = _QtiPlayer.getLogger();


    var nativeApi = {
        callNative: function (eventName, data) {
            _logger.debug(eventName + '---------');
            if (typeof Bridge !== 'undefined' && Bridge) {
                Bridge.callNative('com.nd.android.homework.ui.HomeworkJsBridge', eventName, data);
            }
        },
        initHWPanel: function (data) {
            this.callNative('initHWPanel', data)
        },
        destroyHWPanel: function () {
            this.callNative('destroyHWPanel', {})
        },
        showHWPanel: function (show) {
            this.callNative('showHWPanel', {show: show});
        }
    };

    var answerTypeRegex = {
        "NUM": /^\d+?$/,
        "NUM_SYMBOL": /^[+-]?[0-9]+\.?[0-9]*$/,
        "ABC": /^[a-zA-z]+$/,
        "CN":/[\u4E00-\u9FA5]+/,
        "OTHER": /^[^\u4E00-\u9FA5]+$/
    };

    //初始化native手写板信息
    var setHomeWorkHWArea = function (obj, renderId, currectAnswer) {
        var $view = $('[data-qti-id="' + renderId + '"]');
        var $hwAreas = $view.find('.qp-hwarea');

        //全屏不处理
        if (document.webkitIsFullScreen) {
            return;
        }

        if ($hwAreas.length <= 0) {
            return;
        }

        var nativeParam = {
            scrollState: obj.scrollState,
            inputArea: []
        };

        var $body = $(document.body);
        var bodyScrollTop = $body.scrollTop();
        var bodyScrollLeft = $body.scrollLeft();
        var topMg = 8;
        var bottomMg = 3;


        $hwAreas.each(function () {
            var $hwArea = $(this);
            var index = parseInt($hwArea.attr('data-index'));
            var id = $hwArea.closest('.qp-model').attr('data-model-id');
            var offset = $hwArea.offset();
            var answer = currectAnswer[id].value[index];

            var inputArea = {
                id: id + '|' + index,
                left: offset.left - bodyScrollLeft,
                top: offset.top - bodyScrollTop,
                width: $hwArea.width(),
                height: $hwArea.height(),
                type: 'OTHER',
                show: true
            };

            for (var key in answerTypeRegex) {
                if (answerTypeRegex[key].test(answer)) {
                    inputArea.type = key;
                    break;
                }
            }

            if (nativeParam.scrollState === 'START') {
                inputArea.show = false;
            } else {
                if (offset.left < obj.scrollArea.left - bodyScrollLeft || offset.left > (obj.scrollArea.left + obj.scrollArea.width - bodyScrollLeft)) {
                    inputArea.show = false;
                }

                if (offset.top < obj.scrollArea.top - bodyScrollTop - topMg || offset.top + inputArea.height > (obj.scrollArea.top + obj.scrollArea.height - bodyScrollTop + bottomMg)) {
                    inputArea.show = false;
                }

                //数字键盘弹出时，判断是否需要隐藏view
                //var keyboardInfo = getHtmlKeyboardInfo();
                //if (keyboardInfo.visible) {
                //    if (offset.top + inputArea.height > keyboardInfo.top + bottomMg) {
                //        inputArea.show = false;
                //    }
                //}
            }

            //高度增加2
            inputArea.height = inputArea.height + 2;

            nativeParam.inputArea.push(inputArea);


            if (isDebug) {
                if ($('[data-m="' + inputArea.id + '"]').length > 0) {
                    $('[data-m="' + inputArea.id + '"]').css({
                        left: (inputArea.left + 30) + 'px',
                        top: inputArea.top + 'px',
                        display: inputArea.show ? 'block' : 'none'
                    })
                } else {
                    $(document.body).append('<div data-m="' + inputArea.id + '" style=" opacity: 0.5; background: black; position: fixed;z-index: 10000;left: ' + (inputArea.left + 20) + 'px;top:' + inputArea.top + 'px;width:' + inputArea.width + 'px;height:' + inputArea.height + 'px; display:' + (inputArea.show ? 'block' : 'none') + '"></div>');
                }
            }
        });
        _logger.debug(nativeParam);
        nativeApi.initHWPanel(nativeParam);
    };


    //获取键盘高度，暂时硬编码
    var getHtmlKeyboardInfo = (function () {
        var $keyboard = $('.com_keyboard');

        return function () {
            if ($keyboard.length <= 0) {
                $keyboard = $('.com_keyboard');
            }
            return {
                top: $keyboard.length <= 0 ? 0 : $keyboard.offset().top,
                visible: $keyboard.length <= 0 ? false : !$keyboard.is(":hidden")
            }
        }
    })();


    //重写：createPlayer
    _QtiPlayer.createPlayer = function (option) {
        var player = _QtiPlayer._createPlayer(option);

        player._homework = {};


        //新增：初始化手写区域
        player.setHomeWorkHWArea = function (obj) {
            var that = this;
            this._homework.area = obj;
            var correctAnswer = this.getAssessmentModel().correctAnswer;
            setHomeWorkHWArea(this._homework.area, this._homework.renderid, correctAnswer);

            if (!this._homework.called) {
                //监听大小变化，重置坐标
                var $view = $('[data-qti-id="' + this._homework.renderid + '"]').find('.qp-player');
                $view.resize(function () {
                    _logger.debug('area resize--------------------');
                    if (that._homework.area) {
                        that._homework.area.scrollState = 'INIT';
                        setHomeWorkHWArea(that._homework.area, that._homework.renderid, correctAnswer);
                    }
                });
                this._homework.called = true;
                //第一次直接触发
                nativeApi.showHWPanel(true);
            }
        };

        //新增：设置答案
        player.renderHomeWorkHWAnswer = function (answer) {

            if (typeof answer === 'string') {
                answer = JSON.parse(answer);
            }

            var idRegex = /(.+?)\|(\d)*/i;
            var currentAnswer = this.getAnswer();
            var id = '';
            var index = 0;
            for (var key in answer) {

                var keyResult = idRegex.exec(key);
                if (keyResult && keyResult.length === 3) {
                    id = keyResult[1];
                    index = parseInt(keyResult[2]);
                } else {
                    id = key;
                    index = 0;
                }
                if (!currentAnswer[id]) {
                    _logger.error('id:' + id + '不存在');
                    continue;
                }
                if (answer[key].append) {
                    currentAnswer[id].value[index] = (currentAnswer[id].value.length > 0 ? currentAnswer[id].value[index] : '') + answer[key].value;
                } else {
                    currentAnswer[id].value[index] = answer[key].value;
                }
            }

            //答案回填
            this.setAnswer(currentAnswer);
            //渲染界面
            var $view = $('[data-qti-id="' + this._homework.renderid + '"]');
            var modelItem = this._assessmentTest._assessmentItem._modelItem;
            for (var key in modelItem) {
                var item = modelItem[key];
                if (item.renderAnswer) {
                    item.renderAnswer($view.find('[data-model-id="' + key + '"]'), this._option);
                }
            }
        };

        //新增：隐藏或显示手写板
        player.setHomeWorkHWVisible = function (visible) {
            nativeApi.showHWPanel(visible);
        };

        //重写：监听media全屏变化
        player.mediaOnFullScreenChange = function (callback) {
            this._mediaOnFullScreenChange(function (isFull) {
                nativeApi.showHWPanel(!isFull);
                callback && callback(isFull);
            });
        };

        //重写：销毁
        player.destroy = function () {
            this._destroy();
            nativeApi.destroyHWPanel();
        };

        //重写：渲染
        player.render = function (obj, option, callback) {
            var that = this;
            var type = $.type(obj);
            var $view = null;
            if (type === 'string') {
                $view = $('#' + obj);
            } else if (type === 'object') {
                if (obj instanceof jQuery) {
                    $view = obj;
                } else {
                    $view = $(obj);
                }
            }
            this._homework.renderid = _utils.getRandom();
            //设置一个唯一标识
            $view.attr('data-qti-id', this._homework.renderid);
            //重新渲染
            this._homework.called = false;
            //调用默认方法
            this._render(obj, option, callback);
        };

        //主动调用一次
        player.mediaOnFullScreenChange(function (isfull) {
            //do nothing
            _logger.debug('mediaOnFullScreenChange:' + isfull);
        });
        return player;
    };
})(window, jQuery);


// textEntryInteraction
(function (window, $) {
    var _QtiPlayer = window.QtiPlayer;
    var _utils = _QtiPlayer.getUtils();

    //创建
    var _modelHandler = {
        _name: 'textEntryInteraction',
        //获取model名称
        getName: function () {
            return this._name;
        },
        create: function (modelItem) {
            //创建渲染方法
            var _model = modelItem.getModel();

            //返回题目类型名称
            modelItem.getName = function () {
                return '填空题';
            };
            //该model没有小题编号
            modelItem.hasNum = function () {
                return false;
            };
            //该model没有提示
            modelItem.hasHint = function () {
                return false;
            };
            //创建html对象的方法
            modelItem.createTitleHtml = function () {
                return '';
            };
            modelItem.createAnswerHtml = function (option) {
                var that = this;
                var maxLangthAttr = '';
                if (_model.expectedLength > 0) {
                    maxLangthAttr = ' maxlength="' + _model.expectedLength + '" ';
                }
                var modelId = _model.modelId;
                var num = modelId.substring(modelId.lastIndexOf('-') + 1);
                //显示填空区域
                var result = '<span class="qp-model-content qp-blank-filling">';
                if (option.showCorrectAnswer) {
                    //显示正确答案
                    var answer = that.getCorrectAnswer();
                    var currentAnswer = '';

                    if (answer.length > 0) {
                        currentAnswer = answer[0];
                    }

                    var cls = 'qp-textentry';
                    if (currentAnswer.trim().length > 0) {
                        cls += ' qp-textentry-html';
                        //识别到公式修改样式支持高度自适应，修复bug17251
                        if (currentAnswer.match(/<latex( class="math-tex")?>[\s\S]*?<\/latex>/g)) {
                            cls += ' qp-latex';
                        }
                    } else {
                        cls += ' qp-textentry-html-empty';
                        currentAnswer = '&nbsp;';
                    }
                    if (option.showSubSequence) {
                        currentAnswer = '<i class="qp-response-num">' + num + '</i>' + currentAnswer;
                    }
                    result += '<span data-index="0" data-num="' + num + '" class="' + cls + '">' + currentAnswer;
                } else {
                    result += '<span data-index="0" data-num="' + num + '" class="qp-textentry qp-hwarea"> ';
                    if (option.hideAnswerArea) {
                        //do nothing
                    } else if (option.showStatisAnswer) {
                        //显示统计样式
                        result += '<span  class="qp-textentry-text-statis">' + num + '</span>';
                    } else {
                        //其他模式显示
                        var placeholder = '';
                        var type = _model.keyboard;
                        if (option.showSubSequence) {
                            result += '<i class="qp-response-num">' + num + '</i>';
                        }
                        //if ((typeof DigitalInput !== 'undefined') && _model.keyboard === 'number') {
                        //    result += '<span class="qp-text-input  qp-digital-container digital_keyboard_container" style="text-align: left;"   id="' + _utils.getRandom() + '"></span>';
                        //} else {
                            result += '<input step="0.000000001" style="text-align: left;" class="qp-text-input qp-textentry-input" ' + maxLangthAttr + 'placeholder="' + placeholder + '" type="text"/>';
                        //}

                    }

                }
                result += '</span></span>';
                return result;
            };

            modelItem.render = function ($view, option) {
                var that = this;
                var $input = $view.find('.qp-text-input');

                //填空点击回调
                $view.find('.qp-textentry').bind('qpTap', function () {
                    var correctAnswer = that.getCorrectAnswer();
                    that.triggerOptionClick(0, correctAnswer[0]);
                });

                if ($input.length <= 0) {
                    return;
                }

                //是否数字键盘
                var isDigital = $input.hasClass('qp-digital-container');

                if (option.showAnswerArea) {
                    if (_model.width) {
                        var width = _model.width * 18;
                        width = width < 60 ? 60 : width;
                        $input.css('width', width + 'px');
                    }
                }

                if (isDigital) {
                    //注册数字键盘
                    DigitalInput.InputManager.getInstance().register($input.get(0), function () {
                        //实时更新回调答案
                        var newValue = DigitalInput.InputManager.getInstance().getText4Dom($input.get(0));
                        var answer = [];
                        answer.push(newValue.toString());
                        that.setAnswer(answer);
                    });
                }
                if (option.showAnswer || option.showCheckedAnswer) {
                    that.renderAnswer($view, option);
                }

                if (option.showLock) {
                    if (isDigital) {
                        DigitalInput.InputManager.getInstance().setDisabled4DOM($input.get(0), true);
                    } else {
                        $input.attr('disabled', 'disabled');
                    }
                }


                var _$num = $view.find('.qp-response-num');
                //焦点判断
                if (isDigital && option.showSubSequence) {
                    DigitalInput.InputManager.getInstance().setFocusCallback4DOM($input.get(0), function () {
                        _$num.hide();
                    }, function () {
                        var newValue = DigitalInput.InputManager.getInstance().getText4Dom($input.get(0));
                        if (newValue.length > 0) {
                            _$num.hide();
                        } else {
                            _$num.show();
                        }
                    });
                }

            };
            //创建事件处理方法
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var _$input = $view.find('input');
                //中间的序号
                var _$num = $view.find('.qp-response-num');
                var isDigital = _$input.hasClass('qp-digital-container');
                if (isDigital) {
                    return;
                }
                var _timer = null;
                var _lastValue = '';
                //保存当前答案
                var saveAnswer = function (newValue) {
                    var answer = [];
                    answer.push(newValue);
                    that.setAnswer(answer);
                };
                if (!isDigital) {
                    _$num.bind('qpTap', function () {
                        _$input.trigger('focus');
                    });
                }

                //获取焦点时定时检测输入输入框变化
                _$input.bind('focus', function () {
                    _$num.hide();
                    _timer = setInterval(function () {
                        var newValue = _$input.val().trim();
                        if (newValue !== _lastValue) {
                            //输入内容有变化
                            _lastValue = newValue;
                            saveAnswer(newValue);
                        }
                    }, 500);
                });

                //输入结束后保存答案
                _$input.bind('blur', function () {
                    //清空定时器
                    clearInterval(_timer);
                    _timer = null;
                    //保存作答
                    var newValue = _$input.val().trim();
                    _$input.val(newValue);
                    _lastValue = newValue;
                    saveAnswer(newValue);
                    //失去焦点，根据答案隐藏或显示序号
                    if (newValue.length > 0) {
                        _$num.hide();
                    } else {
                        _$num.show();
                    }
                });
            };

            modelItem.renderAnswer = function ($view, option) {
                var that = this;
                var $input = $view.find('.qp-text-input');
                //是否数字键盘
                var isDigital = $input.hasClass('qp-digital-container');

                if (option.showAnswerArea || option.showAnswer || option.showCheckedAnswer) {
                    var answer = that.getAnswer();
                    if (answer.length > 0) {
                        if (isDigital) {
                            DigitalInput.InputManager.getInstance().setText4DOM(answer[0], $input.get(0));
                        } else {
                            $input.val(answer[0]);
                        }
                        //答案反馈样式
                        var correctAnswer = that.getCorrectAnswer();
                        if (option.showCheckedAnswer && correctAnswer.length > 0) {
                            var checkedClass = that.checkTextAnswer(correctAnswer[0], answer[0]) ? 'qp-answer-right' : 'qp-answer-wrong';
                            $input.addClass(checkedClass);
                        }
                        if (answer[0].length > 0) {
                            $view.find('.qp-response-num').hide();
                        }
                    }
                }
            };

        }
    };
    //注册
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


// textEntryMultipleInteraction
(function (window, $) {
    var _QtiPlayer = window.QtiPlayer;
    var _utils = _QtiPlayer.getUtils();
    //创建
    var _modelHandler = {
        _name: 'textEntryMultipleInteraction',
        //获取model名称
        getName: function () {
            return this._name;
        },
        create: function (modelItem) {
            var _model = modelItem.getModel();
            _model.textEntry = [];
            var _initAnswer = [];
            var _textEntryRegex = /<textEntry[\s\S]*?\/>/g;
            var keyboardRegex = /keyboard="([\s\S]*?)"/;
            var widthRegex = /width="(\d+)"/;
            var textEntrys = _model.prompt.match(_textEntryRegex);
            var expectedLengthRegex = /expectedLength="(\d+)"/;
            var expectedLength;
            var keyboard;
            var width;
            for (var i = 0; i < textEntrys.length; i++) {
                expectedLength = _utils.getIntValue(textEntrys[i], expectedLengthRegex);
                keyboard = _utils.getValue(textEntrys[i], keyboardRegex);
                width = _utils.getIntValue(textEntrys[i], widthRegex);
                if (!keyboard) {
                    keyboard = 'text';
                }
                _model.textEntry.push({
                    expectedLength: expectedLength,
                    keyboard: keyboard,
                    width: width
                });
                _initAnswer.push('');
            }


            var saveAnswer = function (that, index, newValue) {
                var answer = that.getAnswer();
                if (answer.length === 0) {
                    answer = _initAnswer;
                }
                answer[index] = newValue;
                that.setAnswer(answer);
            };

            //返回题目类型名称
            modelItem.getName = function () {
                return '填空题';
            };

            modelItem.createTitleHtml = function () {
                return '';
            };
            modelItem.createAnswerHtml = function (option) {
                var that = this;
                var textEntry = _model.textEntry;
                var prompt = _model.prompt;
                var index = 0;
                prompt = prompt.replace(_textEntryRegex, function (m) {
                    var num = index + 1;
                    var object = textEntry[index];
                    var maxLangthAttr = '';
                    if (object.expectedLength > 0) {
                        maxLangthAttr = ' maxlength="' + object.expectedLength + '" ';
                    }
                    //显示填空区域
                    var input = '';
                    if (option.showCorrectAnswer) {
                        //显示正确答案

                        var answer = that.getCorrectAnswer();
                        var currentAnswer = '';
                        if (answer.length > 0) {
                            currentAnswer = answer[index];
                        }

                        var cls = 'qp-textentry';
                        if (currentAnswer.trim().length > 0) {
                            cls += ' qp-textentry-html';
                            if (currentAnswer.match(/<latex( class="math-tex")?>[\s\S]*?<\/latex>/g)) {
                                cls += ' qp-latex';
                            }
                        } else {
                            cls += ' qp-textentry-html-empty';
                            currentAnswer = '&nbsp;';
                        }
                        if (option.showSubSequence) {
                            currentAnswer = '<i class="qp-response-num">' + num + '</i>' + currentAnswer;
                        }
                        input = '<span data-index="' + index + '" class="' + cls + '" >' + currentAnswer + '</span>';
                    } else {
                        input = '<span data-index="' + index + '" class="qp-textentry qp-hwarea">';
                        if (option.hideAnswerArea) {
                            //do nothing
                        } else if (option.showStatisAnswer) {
                            //显示统计样式
                            input += '<span  class="qp-textentry-text-statis">' + num + '</span>';
                        } else {
                            //其他模式显示
                            var placeholder = '';
                            if (option.showSubSequence) {
                                input += '<i class="qp-response-num">' + num + '</i>';
                            }
                            //if ((typeof DigitalInput !== 'undefined') && object.keyboard === 'number') {
                            //    input += '<span class="qp-text-input qp-digital-container digital_keyboard_container" style="text-align: left;"  data-index="' + index + '" id="' + _utils.getRandom() + '"></span>';
                            //} else {
                                input += '<input style="text-align: left;" step="0.000000001" class="qp-textentry-input qp-text-input" '
                                    + maxLangthAttr
                                    + 'placeholder="' + placeholder
                                    + '" data-index="' + index + '"'
                                    + '" type="text"/>';
                            //}

                        }
                        input += '</span>';
                    }

                    index++;
                    return input;
                });
                var result = '<div class="qp-model-content qp-textentry-multiple qp-blank-filling">'
                    + prompt
                    + '</div>';
                return result;
            };
            modelItem.render = function ($view, option) {
                var that = this;
                var $input = $view.find('.qp-text-input');

                $input.each(function () {
                    var $this = $(this);

                    var index = $this.data('index');
                    if (option.showAnswerArea) {
                        if (_model.textEntry[index].width) {
                            var width = _model.textEntry[index].width * 18;
                            width = width < 60 ? 60 : width;
                            $this.css('width', width + 'px');
                        }
                    }

                    if ($this.hasClass('qp-digital-container')) {
                        //初始化手写键盘
                        DigitalInput.InputManager.getInstance().register($this.get(0), function () {
                            //实时更新回调答案
                            var newValue = DigitalInput.InputManager.getInstance().getText4Dom($this.get(0));
                            var index = $this.data('index');
                            saveAnswer(that, index, newValue.toString());
                        });
                        if (option.showLock) {
                            DigitalInput.InputManager.getInstance().setDisabled4DOM($this.get(0), true);
                        }

                        if (option.showSubSequence) {
                            DigitalInput.InputManager.getInstance().setFocusCallback4DOM($this.get(0), function () {
                                $view.find('[data-index="' + index + '"] .qp-response-num').hide();
                            }, function () {
                                var newValue = DigitalInput.InputManager.getInstance().getText4Dom($this.get(0));
                                if (newValue.length > 0) {
                                    $view.find('[data-index="' + index + '"] .qp-response-num').hide();
                                } else {
                                    $view.find('[data-index="' + index + '"] .qp-response-num').show();
                                }
                            });
                        }

                    } else {
                        if (option.showLock) {
                            $this.attr('disabled', 'disabled');
                        }
                    }
                });

                if (option.showAnswer || option.showCheckedAnswer) {
                    that.renderAnswer($view, option);
                }

                //填空点击回调
                $view.find('.qp-textentry').bind('qpTap', function () {
                    var $this = $(this);
                    var index = $this.data('index');
                    var correctAnswer = that.getCorrectAnswer();
                    that.triggerOptionClick(index, correctAnswer[index]);
                });
            };
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var _$input = $view.find('.qp-text-input');


                var _state = {};
                //初始化状态数据
                _$input.each(function () {
                    var $this = $(this);
                    var index = $this.data('index');
                    _state[index] = {
                        timer: null,
                        lastValue: ''
                    };
                    var isDigital = $this.hasClass('qp-digital-container');
                    if (!isDigital) {
                        $view.find('[data-index="' + index + '"] .qp-response-num').bind('qpTap', function () {
                            $this.trigger('focus');
                        });
                    }
                });


                _$input.each(function () {
                    var $this = $(this);

                    if (!$this.hasClass('qp-digital-container')) {
                        //获取焦点时定时检测输入输入框变化
                        $this.bind('focus', function () {
                            //定时检测输入输入框变化
                            var $this = $(this);
                            var index = $this.data('index');
                            $view.find('[data-index="' + index + '"] .qp-response-num').hide();
                            var _thisState = _state[index];
                            _thisState.timer = setInterval(function () {
                                var newValue = $this.val().trim();
                                if (newValue !== _thisState.lastValue) {
                                    //输入内容有变化
                                    _thisState.lastValue = newValue;
                                    saveAnswer(that, index, newValue);
                                }

                            }, 500);
                        });
                        //输入结束后保存答案
                        $this.bind('blur', function () {
                            var $this = $(this);
                            var index = $this.data('index');
                            var _$num = $view.find('[data-index="' + index + '"] .qp-response-num');
                            //清除定时器
                            var _thisState = _state[index];
                            clearInterval(_thisState.timer);
                            _thisState.timer = null;
                            //保存作答
                            var newValue = $this.val().trim();
                            $this.val(newValue);
                            _thisState.lastValue = newValue;
                            saveAnswer(that, index, newValue);

                            if (newValue.length > 0) {
                                _$num.hide();
                            } else {
                                _$num.show();
                            }
                        });
                    }
                })
            };

            modelItem.renderAnswer = function ($view, option) {
                var that = this;
                var $input = $view.find('.qp-text-input');

                if (option.showAnswerArea || option.showAnswer || option.showCheckedAnswer) {
                    var answer = that.getAnswer();
                    var correctAnswer = that.getCorrectAnswer();
                    if (answer.length > 0 && answer.length === $input.length) {
                        $input.each(function () {
                            var $this = $(this);
                            var index = $this.data('index');

                            if ($this.hasClass('qp-digital-container')) {
                                DigitalInput.InputManager.getInstance().setText4DOM(answer[index], $this.get(0));
                            } else {
                                $this.val(answer[index]);
                            }
                            //答案反馈样式
                            if (option.showCheckedAnswer) {
                                var checkedClass = that.checkTextAnswer(correctAnswer[index], answer[index]) ? 'qp-answer-right' : 'qp-answer-wrong';
                                $this.addClass(checkedClass);
                            }
                            if (answer[index].length > 0) {
                                $view.find('[data-index="' + index + '"] .qp-response-num').hide();
                            }
                        });
                    }
                }
            };
        }
    };

//注册
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);