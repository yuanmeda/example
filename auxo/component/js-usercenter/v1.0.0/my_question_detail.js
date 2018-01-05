/*!
 * 用户答疑详情组件
 */
(function ($, window) {
    'use strict';
    /**
     * 答疑详情数据模型
     * @param {Object} params 模块参数(code:项目标识,questionId:详情标识id)
     */
    function QuestionDetail(params) {
        if (!params.questionId) {
            throw new Error('不存在实例ID');
        }
        if (!params.projectCode) {
            throw new Error('不存在项目标识');
        }
        var MAX_COUNT = 200;
        var model = {
            questionInfo: null,
            replies: [],
            filter: {
                page_no: 0,
                page_size: 20
            },
            reply: {
                content: '',
                question_id: params.questionId
            },
            editTag: -1,
            wordcount: 0,
        };
        this.maxLength = MAX_COUNT;
        this.params = params || {};
        // ko校验配置
        // ko.validation.init({
        //     insertMessages:false,
        //     errorElementClass:'validationMessage'
        // },true);
        ko.validation.init();
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        // 内容监听
        this.model.reply.content.subscribe(function (val) {
            this.model.reply.content(val.substr(0, MAX_COUNT));
        }, this);
        //获取输入字数计算值
        this.model.wordcount = ko.computed(function () {
            var _content = this.model.reply.content();
            return MAX_COUNT - _content.length;
        }, this);
        // 数据仓库
        this.store = {
            // 获取答疑详情信息
            questionDetail: function () {
                var url = '/' + params.projectCode + '/mystudy/questions/' + params.questionId;

                return $.ajax({
                    url: url
                });
            },
            // 编辑答疑
            questionEdit: function (data) {
                var url = '/' + params.projectCode + '/questions/' + params.questionId;

                return $.ajax({
                    url: url,
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    type: 'PUT'
                });
            },
            // 删除答疑
            questionDel: function () {
                var url = '/' + params.projectCode + '/questions/' + params.questionId;

                return $.ajax({
                    url: url,
                    type: 'DELETE'
                });
            },
            // 答疑对应的回复信息
            questionReplies: function (filter) {
                var url = '/' + params.projectCode + '/mystudy/questions/' + params.questionId + '/answers';

                return $.ajax({
                    url: url,
                    data: filter
                });
            },
            // 回复答疑
            questionReply: function (data) {
                var url = '/' + params.projectCode + '/answers';

                return $.ajax({
                    url: url,
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    type: 'POST'
                });
            },
            // 编辑回复
            replyEdit: function (answerId, data) {
                var url = '/' + params.projectCode + '/answers/' + answerId;

                return $.ajax({
                    url: url,
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    type: 'PUT'
                });
            },
            // 删除回复
            replyDel: function (answerId) {
                var url = '/' + params.projectCode + '/answers/' + answerId;

                return $.ajax({
                    url: url,
                    type: 'DELETE'
                });
            }
        };
        // 初始化动作
        this._init();
    }

    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    QuestionDetail.prototype = {
        /**
         * 初始化事件
         * @return {null}     null
         */
        _init: function () {
            // 加载答疑详情
            this._loadQuestionDetail();
            // 加载答疑回复列表
            this._loadQuestionReplies();
            // 校验规则
            this._validate();
            // 加载事件
            setTimeout(this._eventHandler, 0);
        },
        /**
         * 事件集合
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;

        },
        /**
         * 校验器
         * @return {null} null
         */
        _validate: function () {
            this.model.reply.content.extend({
                required: {
                    params: true,
                    message: i18nHelper.getKeyValue('myStudy.questionDetail.emptyError')
                }
            });
            this.errors = ko.validation.group(this.model.reply.content);
        },
        /**
         * 加载答疑详情
         * @return {promise} promise对象
         */
        _loadQuestionDetail: function () {
            var _self = this;
            return this.store.questionDetail()
                .done(function (data) {
                    _self.model.questionInfo(data);
                })
                .always(function (data, flag, xhr) {
                    $('#my_questiondetail_js').show(200);
                });
        },
        /**
         * 加载答疑回复列表
         * @return {promise} promise对象
         */
        _loadQuestionReplies: function () {
            var _self = this,
                _filter = ko.mapping.toJS(this.model.filter);
            return this.store.questionReplies(_filter)
                .done(function (data) {
                    _self.model.replies(data.items);
                    _self._pagination(data.count);
                });
        },
        /**
         * 分页初始化
         * @param  {int} totalCount 总条数
         * @return {null}            null
         */
        _pagination: function (totalCount) {
            var _target = $('#pagination'),
                _filter = this.model.filter,
                _self = this;
            _target.pagination(totalCount, {
                items_per_page: _filter.page_size(),
                num_display_entries: 5,
                current_page: _filter.page_no(),
                is_show_total: false,
                is_show_input: false,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (page_no) {
                    if (page_no != _filter.page_no()) {
                        _filter.page_no(page_no);
                        _self._loadQuestionReplies();
                    }
                }
            });
        },
        /**
         * 答疑编辑
         * @param  {object} binds ko绑定对象
         * @return {null}       null
         */
        question_edit_js: function (binds) {
            this.model.editTag(100);
        },
        /**
         * 答疑保存事件
         * @param  {object} binds ko绑定对象
         * @param  {string} content 内容
         * @return {null} null
         */
        question_save_js: function (binds, content) {
            var _self = this;
            if (!$.trim(content)) {
                return;
            }
            this.store.questionEdit({
                content: content
            })
                .done(function (data) {
                    _self.model.questionInfo($.extend({}, _self.model.questionInfo(), data));
                });
        },
        /**
         * 答疑删除
         * @param  {object} binds ko绑定对象
         * @return {null}       null
         */
        question_del_js: function (binds) {
            var _self = this;
            $.fn.udialog.confirm(i18nHelper.getKeyValue('myStudy.questionDetail.delQuestion'), [{
                text: i18nHelper.getKeyValue('myStudy.questionDetail.confirmLabel'),
                'class': 'ui-btn-confirm',
                click: function () {
                    _self.store.questionDel(binds.id)
                        .done(function () {
                            window.location.href = window.selfUrl + '/' + _self.params.projectCode + '/mystudy/user_center?module=my-question';
                        });
                    $(this).udialog("hide");
                }
            }, {
                text: i18nHelper.getKeyValue('myStudy.questionDetail.cancelLabel'),
                'class': 'ui-btn-primary',
                click: function () {
                    $(this).udialog("hide");
                }
            }]);
        },
        /**
         * 回复编辑
         * @param  {object} binds ko绑定对象
         * @param  {int} index 索引
         * @return {null}       null
         */
        reply_edit_js: function (binds, index) {
            this.model.editTag(index);
        },
        /**
         * 回复保存事件
         * @param  {object} binds ko绑定对象
         * @param  {int} index 索引
         * @param  {string} content 内容
         * @return {null} null
         */
        reply_save_js: function (binds, index, content) {
            var _self = this;
            if (!$.trim(content)) {
                return;
            }
            this.store.replyEdit(binds.id, {
                content: content
            })
                .done(function (data) {
                    console.log(data);
                    _self.model.replies.replace(binds, $.extend({}, binds, data));
                });
        },
        /**
         * 回复删除
         * @param  {object} binds ko绑定对象
         * @param  {int} index 索引
         * @return {null}       null
         */
        reply_del_js: function (binds, index) {
            var _self = this;
            $.fn.udialog.confirm(i18nHelper.getKeyValue('myStudy.questionDetail.delReply'), [{
                text: i18nHelper.getKeyValue('myStudy.questionDetail.confirmLabel'),
                'class': 'ui-btn-confirm',
                click: function () {
                    _self.store.replyDel(binds.id)
                        .done(function (data) {
                            var _info = _self.model.questionInfo(),
                                _pageNo = _self.model.filter.page_no();
                            _info.had_reply = 0;
                            _self.model.questionInfo(_info);
                            if (_self.model.replies().length === 1) {
                                _self.model.filter.page_no(_pageNo > 0 ? (_pageNo - 1) : 0);
                                _self._loadQuestionReplies();
                            } else {
                                _self.model.replies.splice(index, 1);
                            }
                        });
                    $(this).udialog("hide");
                }
            }, {
                text: i18nHelper.getKeyValue('myStudy.questionDetail.cancelLabel'),
                'class': 'ui-btn-primary',
                click: function () {
                    $(this).udialog("hide");
                }
            }]);
        },
        /**
         * 回复答疑
         * @return {null}       null
         */
        question_reply_js: function () {
            var _data = ko.mapping.toJS(this.model.reply),
                _self = this;
            if (this.errors().length) {
                this.errors.showAllMessages();
                return;
            }
            this.store.questionReply(_data)
                .done(function (data) {
                    if (data) {
                        var _info = _self.model.questionInfo();
                        _self.model.reply.content('');
                        _info.had_reply = 1;
                        _self.model.questionInfo(_info);
                        _self._loadQuestionReplies();
                        self.scrollTo(0, 0);
                    }
                }).always(function () {
                _self.model.reply.content('');
            });
        },
        /**
         * 图片加载错误处理方式
         * @param  {object} binds ko绑定对象
         * @param  {Event} e     onerror事件
         * @return {null}       null
         */
        avatar_error_js: function (binds, e) {
            e.target.src = defaultAvatar;
        },
        /**
         * 字符串格式化函数
         * @param  {string} str 原始字符串
         * @return {string}     格式化字符串
         */
        stringFormat_js: function (str) {
            return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\r\n]/g, '<br/>').replace(/\s/g, '&nbsp;');
        }
    };

    /**
     * 注册ko组件my-question-detail
     */
    ko.components.register('my-question-detail', {
        synchronous: true,
        viewModel: QuestionDetail,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
