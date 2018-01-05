/*!
 * 我的学习中心
 */
(function (window, $) {
    'use strict';
    $.ajaxSetup({
        cache: false
    });
    // 数据仓库
    var store = {
        // 获取学习中心基础数据
        baseInfo: function (data) {
            var url = selfUrl + '';

            return $.ajax({
                url: url,
                data: data
            });
        },
        // 获取我的学习统计
        learningStatistic: function () {
            var url = selfUrl + '/' + projectCode + '/mystudy/stat';

            return $.ajax({
                url: url
            });
        },
        // 获取我的讲授info
        myTeacher: function () {
            var url = teacUrl + '/v1/lecturer_tabs';

            return $.ajax({
                url: url,
                data: {
                    user_id: userId,
                    project_id: projectId,
                    language: localLang
                }
            })
        }
    };

    // 模块属性映射
    var mapModule = {
        'my-study': {
            title: i18nHelper.getKeyValue('myStudy.common.myStudy')
        },
        'my-homework': {
            title: i18nHelper.getKeyValue('myStudy.common.myHomework')
        },
        'my-task': {
            title: i18nHelper.getKeyValue('myStudy.common.myTask')
        },
        'my-exam': {
            title: i18nHelper.getKeyValue('myStudy.common.myExam')
        },
        'my-question': {
            title: i18nHelper.getKeyValue('myStudy.common.myQuestion')
        },
        'my-rank': {
            title: i18nHelper.getKeyValue('myStudy.common.myRank')
        },
        'my-question-detail': {
            title: i18nHelper.getKeyValue('myStudy.common.myQuestionDetail')
        },
        'my-voucher': {
            title: i18nHelper.getKeyValue('myStudy.common.myVoucher')
        },
        'my-certificate': {
            title: i18nHelper.getKeyValue('myStudy.common.myCertificate')
        },
        'my-subscribe': {
            title: i18nHelper.getKeyValue('myStudy.common.mySubscribe')
        },
        'my-manual-mark': {
            title: i18nHelper.getKeyValue('myStudy.common.myManualMark')
        },
        'my-enroll': {
            title: i18nHelper.getKeyValue('myStudy.common.myEnroll')
        },
        'my-course-collection': {
            title: i18nHelper.getKeyValue('myStudy.common.courseCollection')
        },
        'my-resource-collection': {
            title: i18nHelper.getKeyValue('myStudy.common.resourceCollection')
        },
        'my-download': {
            title: i18nHelper.getKeyValue('myStudy.common.myDownload')
        },
        'my-upload': {
            title: i18nHelper.getKeyValue('myStudy.common.myUpload')
        },
        'my-income': {
            title: i18nHelper.getKeyValue('myStudy.common.myIncome')
        },
        'my-order': {
            title: i18nHelper.getKeyValue('myStudy.common.myOrder')
        },
        'my-setting': {
            title: i18nHelper.getKeyValue('myStudy.common.mySetting')
        },
        'my-course-upload': {
            title: i18nHelper.getKeyValue('myStudy.common.myUpload')
        },
        'my-note': {
            title: i18nHelper.getKeyValue('myStudy.common.myNote')
        },
        'my-hobby': {
            title: i18nHelper.getKeyValue('myStudy.common.myHobby')
        },
        'my-newtask': {
            title: i18nHelper.getKeyValue('myStudy.common.myNewTask')
        },
        'my-bxk': {
            title: i18nHelper.getKeyValue('myStudy.common.myBxk')
        },
        'my-dist-courses-uploaded': {
            title: i18nHelper.getKeyValue('myStudy.common.myDistCoursesUploaded')
        },
        'my-dist-courses-order': {
            title: i18nHelper.getKeyValue('myStudy.common.myDistCoursesOrder')
        },
        'my-dist-courses-income': {
            title: i18nHelper.getKeyValue('myStudy.common.myDistCoursesIncome')
        },
        'my-mistake': { //我的错题本
            title: i18nHelper.getKeyValue('myStudy.common.myMistakes')
        }
    };

    // 数据模型
    var viewModel = {
        model: {
            teacherInfo: null, //我的讲授信息
            iframeUrl: '', //第三方页面src
            currentModule: '', //模块名称
            baseInfo: null //用户学习统计数据
        },
        // 排行组件需要参数
        search: {
            tag: 'week_all_in', //当前选中的榜单 例如：周榜 week_all_in ，月榜 month_all_in，总榜 all_in
            start: 1, //start 开始位置，每页条数由服务端配置 --可选，默认值为 1
            rank_id: 'learnHoursSumTabs', // 如果业务方没传，默认为组件的（compentMainTabs）
            show_type: 1, // 显示类型 --可选,0:普通 1:瀑布流
            scroll_type: 1 //滚动类型：向上滚=-1 向下滚=1 ---可选,默认值向下滚1
        },
        /**
         * 初始化函数
         * @return {null} null
         */
        _init: function () {
            // ko对象绑定
            this.model = ko.mapping.fromJS(this.model);
            // 模块名称事件订阅
            this.model.currentModule.subscribe(this._updateTitle, this);
            // 加载事件
            this._eventHandler();

            // 获取统计信息
            // ko绑定
            ko.applyBindings(this, document.getElementById('js_app'));
            $(window).trigger('hashchange')
            this._loadLearningStatistic();
            // 获取讲授信息
            (!window.SWITCHES || (window.SWITCHES && window.SWITCHES['switch.lecturer'])) && this._loadTeacherInfo()
                .done(function (d) {
                    this.model.teacherInfo(d);
                    $(window).trigger('hashchange');
                }.bind(this))
                .always(function () {
                    $(window).trigger('hashchange');
                });
            if (window.addEventListener) {
                window.addEventListener('message', this._onMessage);
            } else {
                window.attachEvent('onmessage', this._onMessage);
            }
        },
        /**
         * message通信
         * @return {null} null
         */
        _onMessage: function (e) {
            if (!e) return;
            var _postData = null;
            if (e.data) {
                try {
                    _postData = JSON.parse(e.data);
                    if (_postData.type === '$resize') {
                        $('.iframe-container iframe').css({
                            height: window.parseInt(_postData.data.height, 10) + 'px'
                        });
                    } else if (_postData.type === 'iframe-resize') {
                        $('.iframe-container iframe').css({
                            height: window.parseInt(_postData.height, 10) + 'px',
                        });
                    }
                } catch (e) {

                }
            }
        },
        /**
         * dom事件处理
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
            $(window).on('hashchange', function () {
                _self._hashChange();
            });
            // 显示dom
            $('#js_app').show();
        },
        /**
         * 加载我的学习统计数据
         * @return {[type]} [description]
         */
        _loadLearningStatistic: function () {
            var _self = this;
            return store.learningStatistic()
                .done(function (data) {
                    _self.model.baseInfo(data);
                });
        },
        /**
         * 加载我的讲授信息
         * @return {[type]} [description]
         */
        _loadTeacherInfo: function () {
            var _self = this;
            var _teacherInfo = JSON.parse($.cookie('$$teacherInfo' + userId) || null);
            var _defer = $.Deferred();
            if (_teacherInfo) {
                _defer.resolve(_teacherInfo)
            } else {
                try {
                    store.myTeacher()
                        .done(function (d) {
                            $.cookie('$$teacherInfo' + userId, JSON.stringify(d), {
                                expires: new Date(d.expires_at)
                            });
                            _defer.resolve(d);
                        })
                } catch (e) {
                    $(window).trigger('hashchange');
                }
            }
            return _defer;
        },
        /**
         * 更新页面title
         * @param  {string} val 模块名称
         * @return {null}     null
         */
        _updateTitle: function (val) {
            var _moduleName = this.model.currentModule();
            if (_moduleName === 'my-teacher' && this.model.teacherInfo() && this.model.teacherInfo().show) {
                document.title = this.model.teacherInfo().name;
            } else {
                document.title = mapModule[val || _moduleName] && mapModule[val || _moduleName].title;
            }
            if (document.title === 'undefined') {
                window.location.hash = 'my-study';
            }
            this._updateIframe(val);
        },
        /**
         * 更新iframe内容
         * @param  {string} type 模块名称
         * @return {null}     null
         */
        _updateIframe: function (type) {
            var __hash, __token, __mac, __teac, __uri;
            var __defer = $.Deferred();
            switch (type) {
                case 'my-homework':
                    __hash = '/#/jump?from=elearning&to=index&lang=' + localLang.toLowerCase();
                    __token = Nova.getMacToken('INVOKE', __hash, 'sdp.nd');
                    __mac = Nova.base64.encode(__token);
                    __defer.resolve(myHomeworkUrl + __hash + '&__mac=' + __mac);
                    break;
                case 'my-task':
                    __mac = Nova.getMacToB64(myTaskUrl + '/' + projectCode + '/task_study/my');
                    __defer.resolve(myTaskUrl + '/' + projectCode + '/task_study/my?__mac=' + __mac);
                    break;
                case 'my-manual-mark':
                    __mac = Nova.getMacToB64(manualMarkUrl + '/' + projectCode + '/manual_mark');
                    __defer.resolve(manualMarkUrl + '/' + projectCode + '/manual_mark?__mac=' + __mac);
                    break;
                case 'my-download':
                    __defer.resolve(espresourceUrl + '/user-center/download-third');
                    break;
                case 'my-upload':
                    __defer.resolve(espresourceUrl + '/user-center/upload-third');
                    break;
                case 'my-income':
                    __defer.resolve(espresourceUrl + '/user-center/income-third');
                    break;
                case 'my-order':
                    __defer.resolve(espresourceUrl + '/user-center/order-third');
                    break;
                case 'my-course-collection':
                    __defer.resolve(espresourceUrl + '/user-center/course-third');
                    break;
                case 'my-resource-collection':
                    __defer.resolve(espresourceUrl + '/user-center/favorite-third');
                    break;
                case 'my-setting':
                    __defer.resolve(espresourceUrl + '/user-center/setting-third');
                    break;
                case 'my-teacher':
                    __teac = this.model.teacherInfo();
                    if (__teac) {
                        __uri = __teac.forward_url + '?lang=' + localLang + '&project_code=' + projectCode;
                        __mac = Nova.getMacToB64(__uri);
                        __defer.resolve(__uri + '&__mac=' + __mac);
                    }
                    break;
                case 'my-course-upload':
                    __defer.resolve((typeof openCourseFrontUrl == 'undefined' ? '' : openCourseFrontUrl) + '/' + projectCode + '/open_course/cloud_course/test');
                    break;
                case 'my-newtask':
                    __uri = newTaskUrl + '/' + projectCode + '/mytask';
                    __mac = Nova.getMacToB64(__uri);
                    __defer.resolve(__uri + '?__mac=' + __mac);
                    break;
                case 'my-wrong-topic':
                    __uri = elearningWrongTopicUrl + '/' + projectCode + '/wrong_question/course';
                    __mac = Nova.getMacToB64(__uri);
                    __defer.resolve(__uri + '?__mac=' + __mac);
                    break;
                case 'my-dist-courses-uploaded':
                    var search = window.location.search || '?status=1';
                    if (search.indexOf('__return_url') === -1) {
                        search += '&__return_url=' + window.encodeURIComponent(window.location.href);
                    }
                    __uri = opencourse2GwUrl + '/' + projectCode + '/open_course/my_upload' + search;
                    __mac = Nova.getMacToB64(__uri);
                    __defer.resolve(__uri + '&__mac=' + __mac);
                    break;
                case 'my-dist-courses-order':
                    __uri = payGwUrl + '/' + projectCode + '/pay/order/mine';
                    __mac = Nova.getMacToB64(__uri);
                    __defer.resolve(__uri + '?__mac=' + __mac);
                    break;
                case 'my-dist-courses-income':
                    __uri = opencourse2GwUrl + '/' + projectCode + '/open_course/course_income';
                    __mac = Nova.getMacToB64(__uri);
                    __defer.resolve(__uri + '?__mac=' + __mac);
                    break;
                case 'my-mistake':
                    __uri = wrongQuestionGatewayUrl + '/' + projectCode + '/wrong_question/course?show_chapters=false&show_course_tags=false&show_question_types=false';
                    __mac = Nova.getMacToB64(__uri);
                    __defer.resolve(__uri + '&__mac=' + __mac);
                    break;
            }
            __defer.done(function (url) {
                if (url) {
                    this.model.iframeUrl('');
                    this.model.iframeUrl(url);
                }
            }.bind(this))
        },
        /**
         * 模块切换函数
         * @param  {string} moduleName 模块名称
         * @return {null}            null
         */
        tabModule_js: function (moduleName) {
            this.model.currentModule('');
            this.model.currentModule(moduleName);
            window.location.hash = moduleName;
            window.scrollTo(0, 0)
            $('.user-layout').css({
                width: 'auto'
            })
        },
        /**
         * 后退前进调用组件调度(hash)
         * @return {null}      null
         */
        _hashChange: function () {
            var _hash = window.location.hash.slice(1);
            if (!_hash) {
                window.location.hash = tabModule || 'my-study';
                this._hashChange();
            } else {
                this.model.currentModule(_hash);
            }
        }
    };

    // 启动入口
    $(function () {
        if (window.parent != window) {
            setInterval(function () {
                window.iframeResizePostMessage && iframeResizePostMessage('mystudy');
            }, 500);
        }

        function adjustPopPosition(ret) {
            var data;
            try {
                data = JSON.parse(ret.data);
                if (data.type === 'setScrollTop') {
                    if (!$('.adjustPopPosition').is(":visible")) {
                        var mtop = data.scrollTop + data.offsetTop;
                        var style = '.adjustPopPosition { top: 0;margin-top:' + mtop + 'px !important;}';
                        $('#adjustPopPosition').length ? $('#adjustPopPosition').html(style) : $('<style id="adjustPopPosition">' + style + '</style>').appendTo("head");
                    }
                }
            } catch (e) {
            }
        }

        if (window.addEventListener) {                    //所有主流浏览器，除了 IE 8 及更早 IE版本
            window.addEventListener("message", adjustPopPosition, false);
        } else if (window.attachEvent) {                  // IE 8 及更早 IE 版本
            window.attachEvent('onmessage', adjustPopPosition);
        }

        viewModel._init();
    });


})(window, jQuery);