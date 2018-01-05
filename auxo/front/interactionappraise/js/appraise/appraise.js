/**
 * 评价列表
 * @author wlj
 */
(function (w, $) {
    function Model(params) {
        this.params = params;
        this.store = {
            /**
             * 发表评价
             * @param data
             * @returns {*}
             */
            createAppraise: function (data) {
                var url = (window.selfUrl || '') + '/' + projectCode + '/appraises';
                return $.ajax({
                    url: url,
                    type: 'POST',
                    data: JSON.stringify(data),
                    cache: false,
                    contentType: 'application/json'
                });
            },
            appraiseList: function (data) {
                var url = (window.selfUrl || '') + '/' + projectCode + '/targets/' + data.custom_id + '/appraises';
                return $.ajax({
                    url: url,
                    type: 'GET',
                    data: data,
                    cache: false
                });
            }
        };
        var model = {
            page: {
                page_size: 20,
                page_no: 0
            },
            status: {
                hasNext: true,
                loading: false
            },
            evaluateInfo: {
                avg_star: 5,
                my_appraise_star: 0,
                my_appraise_content: '',
                my_appraise_create_time: '',
                total_number: 0,
                current_user_appraise: false
            }, //评价信息
            appraiseList: [],
            defaultEvaluation: {
                star: 4,
                content: ko.observable('')
            },
            //需要外面传进的参数
            appraiseInfo: {
                avg_star: 5,
                total_number: 0,
                target_id: '',//必传 --评价对象ID
                custom_id: '',//必传
                custom_type: '',//必传
                study_process: '',//必传 --学习进度
                after_comment: null
            }
        };
        model.appraiseInfo = this.params.value;
        this.model = ko.mapping.fromJS(model);
        this._init();
    };

    Model.prototype = {
        /**
         * 初始化
         */
        _init: function () {
            var _self = this;
            ko.setTemplateEngine(new ko.nativeTemplateEngine())
            _self.loadCommentList(false);
            //监听事件
            _self.model.defaultEvaluation.content.subscribe(function (newValue) {
                if (newValue && newValue.length > 300) {
                    newValue = newValue.substr(0, 300);
                }
            });
        },
        emoji: function (content) {
            if (content) {
                var html = $.trim(content);
                html = jEmoji.softbankToUnified(html);
                html = jEmoji.googleToUnified(html);
                html = jEmoji.docomoToUnified(html);
                html = jEmoji.kddiToUnified(html);
                return jEmoji.unifiedToHTML(html);
            }
        },
        /**
         * 评价-------star
         */
        initStar: function (_self) {
            _self.star = new Star({
                target: $('.star-box.edit-star'),
                value: 5,
                hasScore: true,
                hasHover: true,
                onclick: true,
                hasLabel: true,
                starClass: 'ia-icon-star1'
            });
            _self.model.defaultEvaluation.star(this.star._getScore());
        },
        checkContent: function () {
            var _self = this;
            if (_self.model.defaultEvaluation.content().length > 300) {
                var temp = _self.model.defaultEvaluation.content().substr(0, 300);
                _self.model.defaultEvaluation.content(temp);
            }
        },
        saveMyComment: function () {
            var _self = this;
            var starScore = _self.star._getScore();
            var content = _self.model.defaultEvaluation.content();
            if (content) {
                content = content.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            }
            var myComment = {
                custom_id: _self.model.appraiseInfo.custom_id(),
                custom_type: _self.model.appraiseInfo.custom_type(),
                star: starScore,
                content: content,
                target_id: _self.model.appraiseInfo.target_id()
            };
            //提交,成功时在评价前加
            _self.store.createAppraise(myComment).done(function (_data) {
                //var page = ko.mapping.toJS(_self.model.page);
                //page.custom_id =  _self.model.appraiseInfo.custom_id();
                //_self.store.appraiseList(page).done(function (data) {
                _self.loadCommentList(false);
                //});
                _self.closeAppraise();
                if (_self.model.appraiseInfo.after_comment && typeof _self.model.appraiseInfo.after_comment == "function") {
                    var cb = _self.model.appraiseInfo.after_comment;
                    cb();
                }
                //_self.loadCommentList(false);
            });
        },
        appraise: function () {
            if (!this.star) {
                this.initStar(this);
            }
            $("#comments").show();
            $("#comments-box").addClass('show').show();
        },
        closeAppraise: function () {
            $("#comments").hide();
            $("#comments-box").removeClass('show').hide();
        },
        loadMore: function () {
            this.model.page.page_no(this.model.page.page_no() + 1);
            this.model.status.loading(true);
            this.loadCommentList(true);
        },
        loadCommentList: function (loadMore) {
            var _self = this;
            var page = ko.mapping.toJS(_self.model.page);
            page.custom_id = _self.model.appraiseInfo.custom_id();
            _self.store.appraiseList(page).done(function (data) {
                //if(data.my_appraise_create_time){
                //    data.my_appraise_create_time = data.my_appraise_create_time.replace(/T/,' ').replace(/\..*/,'');
                //}
                var temp = _self.model.appraiseList();
                ko.mapping.fromJS(data, {}, _self.model.evaluateInfo);
                ko.mapping.fromJS(data, {}, _self.model.appraiseInfo);
                if (data && data.items) {
                    if (loadMore) {
                        [].push.apply(temp, data.items);
                    } else {
                        temp = data.items;
                    }
                }

                _self.model.appraiseList(temp);
                if (data.total_number <= temp.length) {
                    _self.model.status.hasNext(false);
                }
                _self.model.status.loading(false);
            });
        },
        avatar_error_js: function (binds, e) {
            e.target.src = defaultAvatar;
        }
    };
    ko.components.register('x-front-appraise', {
        /**
         * 组件viewModel类
         *
         * @class
         * @param params 组件viewModel实例化时的参数
         */
        viewModel: Model,
        synchronous: true,
        /**
         * 组件模板
         */
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    })
})(window, jQuery);