;(function ($, window) {
    'use strict';
    var _ = ko.utils;

    function QuestionListModel(params) {
        var self = this, model = {
            questions: {
                items: params.questions.items,
                qtiItems: ko.observableArray([])
            }
        };
        this.store = {
            getRefPath: function () {
                return $.ajax({
                    url: '/' + projectCode + '/exam/v2/ref_path',
                    dataType: "json",
                    cache: false
                })
            }
        };
        this.defaultOptions = {
            'staticUrl': '',
            'showExtras': false,
            'showMark': false,
            'showSequence': false,
            'showUserAnswer': false
        };
        this.params = params;
        this.model = model;
        this.options = $.extend({}, this.defaultOptions, params.options);
        this.model.actions = params.actions || {
                'answer': {func: null, desc: '答案与解析', show: false},
                'add': {func: null, desc: '加入', show: false},
                'update': {func: null, desc: '修改', show: false},
                'delete': {func: null, desc: '删除', show: false}
            };
        this.model.questions.items = params.questions.items;
        _.arrayForEach(['add', 'update', 'delete'], function (item) {
            QuestionListModel.prototype[item] = function ($data) {
                if ($.isFunction(self.model.actions[item].func))self.model.actions[item].func($data);
            };
        });
    }

    QuestionListModel.prototype.init = function () {
        this.getRefPath();
    };
    QuestionListModel.prototype.getRefPath = function () {
        var self = this;
        this.ref_path = window.ref_path || '';
        if (!this.ref_path) {
            this.store.getRefPath().done(function (data) {
                window.ref_path = data.ref_path;
                self.ref_path = data.ref_path;
                self.loadPlayer();
            });
        } else {
            self.loadPlayer();
        }
    };

    QuestionListModel.prototype.loadPlayer = function () {
        var self = this;
        this.model.questions.qtiItems(_.arrayMap(self.model.questions.items(), function (item) {
            item.qtiplayer = QtiPlayer.createPlayer({
                'swfHost': self.options.staticUrl + 'auxo/addins/flowplayer/v1.0.0/',
                'unifyTextEntry': true,
                'refPath': self.ref_path
            });
            return item;
        }));
        _.arrayForEach(this.model.questions.qtiItems(), function (item, index) {
            item.qtiplayer.on('error', function (ex) {
                self.showQtiError(index, item, ex)
            });
            item.qtiplayer.load(item.questionItem, function () {
                var renderOption = {
                    'skin': 'elearning',
                    'showQuestionName': true,
                    'showNum': self.options.showSequence,
                    'showLock': true,
                    'showHint': false,
                    'showSubSequence': self.options.showSequence,
                    'sequenceNumber': index + 1
                };
                if (self.options.showUserAnswer && item.userAnswer) {
                    renderOption.showAnswer = true;
                    item.qtiplayer.setAnswer(item.userAnswer);
                }
                item.qtiplayer.render('qti-' + item.identifier, renderOption, function () {
                    if (self.options.showExtras)self.showExtras(item);
                });
            });
        })
    };
    QuestionListModel.prototype.showQtiError = function (index, item, error) {
        $('#qti-' + item.identifier).html('<div class="error-question">' + (this.options.showSequence ? index + 1 + "、" : '') + '<strong style="color: #ff0000;font-size: 20px;margin-right: 20px;">QTIplayer报错，无法渲染此题</strong><a href="javascript:;" class="btn btn-danger" onclick="$(\'#qti-error-' + item.identifier + '\').toggleClass(\'hide\')">显示错题</a><div class="error-question-body"><textarea class="hide" id="qti-error-' + item.identifier + '" style="width: 400px;height: 200px;">' + JSON.stringify(item.questionItem) + '</textarea></div></div>');
    };
    QuestionListModel.prototype.showExtras = function ($data) {
        var extrasOption = {
            showHint: true,//显示提示
            showUserAnswer: this.options.showUserAnswer,//显示用户作答
            showCorrectAnswer: true,//显示正确答案
            showAnalyse: true//显示解析
        };
        $data.qtiplayer.showDefaultExtras(extrasOption);
    };

    QuestionListModel.prototype._removeUnknownOrNotSupportQuestion = function (questions) {
        var self = this;
        return _.arrayFilter(questions, function (item) {
            return !self._isSupportQuestionType(item);
        });
    };
    QuestionListModel.prototype._isSupportQuestionType = function (question) {
        var allowTypes = [
            'choice',
            'multiplechoice',
            'match',
            'judge',
            'order',
            'handwrite',
            'graphicgapmatch',
            'vote',
            'textentrymultiple',
            'extendedtext',
            'drawing',
            'data'
        ];
        var types = _.arrayMap(question.questionItem.items, function (item) {
            return item.type;
        });
        var diffTypes = this._diff(types, allowTypes);
        return diffTypes && diffTypes.length > 0;
    };
    QuestionListModel.prototype._diff = function (a, b) {
        return _.arrayFilter(a, function (i) {
            return b.indexOf(i) < 0;
        });
    };
    QuestionListModel.prototype.toggleAnswer = function ($data) {
        $data.isShowAnalyse = !$data.isShowAnalyse;
        var extrasOption = {
            showHint: false,//显示提示
            showUserAnswer: false,//显示用户作答
            showCorrectAnswer: $data.isShowAnalyse,//显示正确答案
            showAnalyse: $data.isShowAnalyse//显示解析
        };
        $data.qtiplayer.showDefaultExtras(extrasOption);
    };


    ko.components.register('x-question-list', {
        //synchronous: true,
        viewModel: QuestionListModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes,afterRender:init.bind($data)}"></div>'
    });
})(jQuery, window);