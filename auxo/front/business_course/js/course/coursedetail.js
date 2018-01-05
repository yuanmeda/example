(function ($, window) {
    'use strict';
    var store = {
        learn: {
            lesson: {
                info: function (lessionId) {
                    return $.ajax({
                        url: (window.selfUrl || '') + "/v1/business_courses/" + course_id + "/lessons/" + lessionId + "/resources",
                        type: 'GET',
                        dataType: 'JSON',
                        contentType: "application/json"
                    });
                },
                progresses: function (data) {
                    return $.ajax({
                        url: window.business_course_service_url + "/v1/business_course_study_activity/actions/search",
                        type: 'POST',
                        dataType: 'JSON',
                        data: JSON.stringify(data),
                        contentType: "application/json"
                    });
                }
            }
        },
        lecturers: function () {
            var url = window.lecturer2_gateway_url + '/v2/lecturers/search?resource_id=' + courseId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //课程详细(GET)
        courseDetail: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //课程章节(GET)
        catalogList: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/catalogs';

            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //报名(POST)
        userAccess: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/accesses';

            return $.ajax({
                url: url,
                dataType: 'JSON',
                type: 'POST'
            });
        },
        //考试列表(GET)
        examList: function (data) {
            var url = (window.selfUrl || '') + '/v1/business_courses/' + courseId + '/exams';

            return $.ajax({
                url: url,
                dataType: 'JSON',
                data: data,
                cache: false
            });
        },
        /**
         * 发表评价
         * @param data
         * @returns {*}
         */
        createAppraise: function (data) {
            var url = window.assistGatewayUrl + '/v1/appraises';

            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                data: JSON.stringify(data)
            });
        },
        //评价列表(GET)
        appraiseList: function (data) {
            var url = window.assistGatewayUrl + '/v1/appraises/search';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'JSON',
                data: data
            });
        },
        //获取用户课程解锁情况
        getUserUnlock: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/unlock_infos';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //获取用户章节解锁情况
        getUserChapterUnlock: function (resourceId) {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/resources/' + resourceId + '/lock_status';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //获取课程可用优惠券
        getCoinCertificates: function (ids, limit_object_type) {
            var url = (window.selfUrl || '') + '/' + projectCode + '/v1/users/limit_object_id/' + ids + '/coin_certificates';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                data: {
                    "limit_object_type": limit_object_type
                },
                cache: false
            });
        },
        //使用兑换券
        useCoin: function (couponId, data) {
            var url = (window.selfUrl || '') + '/' + projectCode + '/v1/users/coin_certificates/' + couponId + '/use_status';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                dataType: 'JSON',
                contentType: 'application/json;charset=utf8'
            });
        },
        //课程学员
        getCourseUser: function (data) {
            var url = (window.selfUrl || '') + '/v1/business_courses/' + courseId + '/users';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                data: data
            });
        },
        /*添加收藏*/
        addFavorites: function (data) {
            var url = assistUrl + '/v1/favorites';
            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'text',
                data: JSON.stringify(data) || null,
                cache: false
            });
        },
        /*删除收藏*/
        deleteFavorites: function (data) {
            var url = assistUrl + '/v1/favorites/' + data.source_type + "/" + data.source_id;
            return $.ajax({
                url: url,
                type: 'DELETE',
                dataType: 'text',
                cache: false
            });
        },
        /*查询收藏状态*/
        checkFavorites: function (data) {
            var url = assistUrl + '/v1/sources';
            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                data: JSON.stringify(data) || null,
                cache: false
            });
        },
        /*获取图片的CSid*/
        getCsId: function (data) {
            var url = assistUrl + '/v1/share_img?url=' + data;
            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                cache: false
            });
        },
        getPKs: function () {
            var url = window.business_course_service_url + '/v1/business_courses/' + courseId + '/pks';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        }
    };
    var skinMap = {
        blue: '#38adff'
    };
    var percentTop;

    function directSeeding() {
        if (typeof (CoursePlayer) !== 'undefined' && CoursePlayer.invokeMethodPPT) {
            CoursePlayer.invokeMethodPPT(eventName, eventData);
        }
    };

    function playback() {
        if (typeof (CoursePlayer) !== 'undefined' && CoursePlayer.invokeMethodPPT) {
            CoursePlayer.invokeMethodPPT(eventName, eventData);
        }
    };

    var viewModel = {
        model: {
            statusCode: statusCode,
            RESOURCE_TYPE: { //资源类型
                VIDEO: 0, //视频
                DOC: 1, //文档
                EVALUATE: 10 // 评测
            },
            RESOURCE_STATUS: { //资源学习状态
                UNDO: 0, //未学习
                DOING: 1, //学习中
                DONE: 2 // 已学习
            },
            description: description,
            experienceType: experienceType,
            chapterOpenList: [0], //章节打开索引组
            contentTab: tabId, //内容页签选中索引
            userInfo: null, //用户信息z
            baseInfo: null, //课程信息
            catalogInfo: null, //章节信息
            page: {
                page_size: 20,
                page_no: 0,
                target_id: courseId
            },
            status: {
                hasNext: true,
                loading: false
            },
            //评价信息
            appraiseInfo: {
                target_id: courseId, //必传 --评价对象ID
                custom_id: courseId, //必传
                custom_type: 'businesscourse_2', //必传
                study_process: '0' //必传
            },
            evaluteInfo: {
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
            appraise: {
                init: false
            },
            // defaultUrl: defaultImage,
            examItems: [],
            total: 0,
            filter: {
                limit: 999, //分页大小
                offset: 0 //分页索引
            },
            studyProcess: 0, //已学进度百分比
            envirUrl: (window.examFrontDomain || "") + '/' + projectCode + '/exam/prepare/',
            autoRgisterFlag: 1,
            courseInfo: {
                courseRegistType: parseInt(courseRegistType),
                userRegistStatus: parseInt(userRegistStatus)
            },
            coin: {
                showCoinModal: false,
                coinItems: [],
                selectedCoinIndex: -1
            },
            classmates: {
                items: [],
                total: 0
            },
            notFinishedpreTrain: [],
            collectionDisabled: false,
            //是否显示收藏按钮(暂时给定，随后与服务端联调)
            showFavorite: true,
            lecturer: {
                items: [],
                showMore: false
            },


            tab: 1,
            isHaveEvaluating: false,
            evaluatingId: '',
            knowledges: [],
            tree: null,
            keyword: "",
            lesson: {
                id: ko.observable(""),
                name: "",
                sort_num: "",
                description: [],
                knowledges: [],
                status: 0,
                standard_status: -1,
                resources: [],
                progresses: []
            },
            hasPK: false,
            PKUrl: "",
            selectedPKChapterId: ""
        },
        pkList: [],
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            $(window).load(drawCanvas);
            document.title = i18nHelper.getKeyValue('courseComponent.front.courseDetail.title');
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            this.allHosts = {
                elearningEnrollGatewayUrl: elearning_enroll_gateway_url,
                elearningPayGatewayUrl: elearningPayGatewayUrl,
                eGoodsGatewayUrl: eGoodsGatewayUrl,
                eSalesGatewayUrl: eSalesGatewayUrl,
                eCartServiceUrl: eCartServiceUrl,
                eCartGatewayUrl: eCartGatewayUrl,
            };
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('container'));
            //初始化学习进度
            this._setPercentage(progressPercent);
            this.model.studyProcess(progressPercent);
            this.onmessage();
            //展示页面
            $(document).trigger('showContent');
            this.switchContentTab(this.model.contentTab());
            var _self = this;
            _self.loadCommentList(false);
            _self.getCourseUser();
            if (priorCourseJson) _self.loadPriorCourse();
            _self.model.defaultEvaluation.content.subscribe(function (newValue) {
                if (newValue && newValue.length > 300) {
                    newValue = newValue.substr(0, 300);
                }
            });
            if (statusCode < 10) {
                this.model.appraiseInfo.study_process('0');
            } else {
                this.model.appraiseInfo.study_process('1');
            }
            if (statusCode >= '10' && (!window.SWITCHES || (window.SWITCHES && window.SWITCHES['switch.assist.fav']))) {
                this.checkCollection();
            }
            this.BroadcastUtils = new BroadcastUtils();
            this.model.description(description ? description.replace(/\$\{cs_host}/gim, servelUrl) : '');

            store.lecturers().done($.proxy(function (data) {
                this.model.lecturer.items(data.items);
            }, this));
            store.getPKs().done(function (resData) {
                if (resData && $.isArray(resData)) {
                    _self.pkList = resData;
                }
            });
        },
        onmessage: function () {
            function adjustIframeHeight(ret) {
                var data = JSON.parse(ret.data);
                $('.boxs').height(data.height);
            }

            if (window.addEventListener) {                    //所有主流浏览器，除了 IE 8 及更早 IE版本
                window.addEventListener("message", adjustIframeHeight, false);
            } else if (window.attachEvent) {                  // IE 8 及更早 IE 版本
                window.attachEvent('onmessage', adjustIframeHeight);
            }
        },
        showMoreLecturer: function () {
            this.model.lecturer.showMore(!this.model.lecturer.showMore());
        },
        openLiveCourse: function (liveStatus, liveCourseId, liveResourceId, liveId) {
            if (statusCode == 7) {
                window.location.href = (window.portal_web_url || "") + "/" + projectCode + "/account/login?returnurl=" + encodeURIComponent(location.href);
                return;
            }
            //0未开始 1直播中 2直播中断 3直播结束
            switch (liveStatus) {
                case 0:
                    break;
                case 1:
                    // directSeeding();
                    this.BroadcastUtils.broadcast(liveId, liveCourseId, liveResourceId);
                    break;
                case 2:
                case 3:
                    this.BroadcastUtils.playBack(liveId, liveCourseId, liveResourceId);
                    break;
            }
        },
        /*查询收藏状态*/
        checkCollection: function () {
            var _self = this;
            var postArr = [{
                source_id: courseId,
                source_type: "e-course"
            }];
            store.checkFavorites(postArr).done(function (resData) {
                if (resData && resData.items) {
                    _self.model.collectionDisabled(resData.items[0].is_fav);
                }
            });
        },
        /*新增or取消收藏功能*/
        onCollection: function () {
            if (statusCode == '0') {
                window.location.href = (window.portal_web_url || "") + "/" + projectCode + "/account/login?returnurl=" + encodeURIComponent(location.href);
                return;
            }
            if (this.doingCollection) return;
            var _self = this;
            if (!this.model.collectionDisabled()) {
                var addData = {
                    "source_request": {
                        "source_id": courseId,
                        "source_type": "e-course"
                    },
                    "title": courseName,
                    "link": courseLink,
                    "web_link": window.location.href,
                    "text": _self.model.description(),
                    "image": ""
                };
                if (picUrl) {
                    store.getCsId(picUrl).done(function (resData) {
                        addData.image = resData.dentry_id;
                        _self.doingCollection = true;
                        _self.accessFavorite(addData);
                    });
                } else {
                    _self.doingCollection = true;
                    _self.accessFavorite(addData);
                }
            } else {
                var cancelData = {
                    source_id: courseId,
                    source_type: "e-course"
                };
                this.doingCollection = true;
                store.deleteFavorites(cancelData).done(function () {
                    _self.model.collectionDisabled(false);
                }).fail(function () {
                    $.fn.udialog.alert(i18n.courseComponent.front.courseDetail.collectionFail, {
                        width: '400px',
                        title: i18n.courseComponent.front.courseDetail.alertTitle,
                        buttons: [{
                            text: i18n.courseComponent.front.courseDetail.sure,
                            click: function () {
                                $(this).udialog("hide");
                            },
                            'class': 'ui-btn-primary'
                        }]
                    });
                }).always(function () {
                    _self.doingCollection = false;
                });
            }
        },
        /*收藏访问接口*/
        accessFavorite: function (data) {
            var _self = this;
            store.addFavorites(data).done(function () {
                _self.model.collectionDisabled(true);
            }).fail(function () {
                $.fn.udialog.alert(i18n.courseComponent.front.courseDetail.collectionFail, {
                    width: '400px',
                    title: i18n.courseComponent.front.courseDetail.alertTitle,
                    buttons: [{
                        text: i18n.courseComponent.front.courseDetail.sure,
                        click: function () {
                            $(this).udialog("hide");
                        },
                        'class': 'ui-btn-primary'
                    }]
                });
            }).always(function () {
                _self.doingCollection = false;
            });
        },
        loadPriorCourse: function () {
            var preCourse = JSON.parse(priorCourseJson);
            this.model.notFinishedpreTrain($.grep(preCourse, function (v) {
                return !v.pass_status;
            }));
        },
        setDefaultAvatar: function ($data, $event) {
            $($event.target).attr('src', defaultAvatar);
        },
        getCourseUser: function () {
            var _self = this;
            store.getCourseUser({
                offset: 0,
                limit: 15
            }).done(function (data) {
                _self.model.classmates.items(data.items);
                _self.model.classmates.total(data.total);
            });
        },
        closeCoinModal: function () {
            this.model.coin.showCoinModal(false);
        },
        confirmUseCoin: function () {
            var coupon = this.model.coin.coinItems()[this.model.coin.selectedCoinIndex()],
                _self = this;
            if (this.model.coin.coinItems().length == 0 || this.model.coin.selectedCoinIndex() == -1) {
                return;
            }
            $.fn.udialog.confirm(i18nHelper.getKeyValue("courseComponent.coin.confirmUseCoin") + "<br>“" + coupon.coin_certificate_vo.name + "”？", [{
                text: i18nHelper.getKeyValue("courseComponent.coin.confirm"),
                'class': 'ui-btn-confirm',
                click: function () {
                    store.useCoin(coupon.coin_certificate_vo.id, {
                        "use_object_type": _self.nowType,
                        "use_object_id": _self.nowType == "course" ? customId + '_' + courseId : customId + '_' + courseId + '_' + _self.resourceId,
                        "use_object_name": _self.nowType == "course" ? courseName : _self.resourceName
                    }).done(function () {
                        window.location.reload();
                    });
                    $(this).udialog("hide");
                }
            }, {
                text: i18nHelper.getKeyValue("courseComponent.coin.cancel"),
                'class': 'ui-btn-primary',
                click: function () {
                    $(this).udialog("hide");
                }
            }], {
                width: 368,
                title: i18nHelper.getKeyValue("courseComponent.coin.systemInfo")
            });
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {

        },
        /**
         * 设置学习进度
         * @param {int} val 进度值
         */
        _setPercentage: function (val) {
            percentTop = 0;
            if (this.noProgress) {
                return;
            }
            percentTop = val;
        },
        /**
         * 内容页tab切换
         * @param  {int} index 显示tab索引
         * @return {null}       null
         */
        switchContentTab: function (index) {
            var _self = this;
            //PK
            this.model.contentTab(index);
            if (index == 4) {
                viewModel.model.page.page_no(0);
                viewModel.model.status.hasNext(true);
                viewModel.loadCommentList(false);
            }
            if (index == 3) {
                this.getExamList();
            }
            if (index == 4 && !this.model.appraise.init()) {
                _self.model.appraiseInfo.after_comment = $.proxy(function () {
                    _self.loadCommentList(false);
                }, _self);
                this.model.appraise.init(true);
            }
        },
        /**
         * 章节收缩与展开
         * @param  {int} index 章节索引
         * @param  {object} binds ko对象值
         * @param  {event} e     点击事件对象
         * @return {null}       null
         */
        switchChapter: function (index, binds, e) {
            var _chapterOpenList = this.model.chapterOpenList,
                $target = $(e.target),
                $group = $target.closest('.chapter-group'),
                $container = $target.closest('.chapter-tit').next();
            // $container.toggle(500);
            if ($group.hasClass('open')) {
                $container.stop(true, true).slideUp(300, function () {
                    $group.toggleClass('open');
                });
            } else {
                $container.stop(true, true).slideDown(300, function () {
                    $group.toggleClass('open');
                });
            }
            if (_chapterOpenList.indexOf(index) > -1) {
                _chapterOpenList.remove(index);
            } else {
                _chapterOpenList.push(index);
            }
        },
        /**
         * 用户报名
         * @param  {object} binds ko绑定对象
         * @return {null}       null
         */
        userAccess: function (binds) {
            if (statusCode == 7) {
                Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip14'), {
                    icon: 2,
                    time: 1500
                });
                return;
            }
            var enroll_url = elearning_enroll_gateway_url + '/' + projectCode + '/enroll/enroll?unit_id=' + courseId + '&__return_url=' + encodeURIComponent(location.href);
            location.href = enroll_url + '&__mac=' + Nova.getMacToB64(enroll_url);
        },
        /**
         * 去学习
         * @param  {object} binds        ko绑定对象
         * @param  {string} uuid         资源id
         * @param  {string} resourceType 资源类型
         * @return {null}              null
         */
        goToStudy: function (uuid, resourceType, flag) {
            var $resourceList = $('.catalog-list .resource-item'),
                _href, _self = this;
            //catalogId = $resourceList.find('div[data-uuid=' + uuid + ']').attr("data-id");
            if (!flag) {
                _href = (window.selfUrl || '') + '/' + projectCode + '/course/' + courseId + '/learn';
            } else {
                _href = (window.selfUrl || '') + '/' + projectCode + '/course/' + courseId + '/learn?cata_type=0&cata_id=' + window.last_study_lesson_id + '&resource_id=' + window.last_study_resource_id;
            }
            if (!_href) {
                _self._selfAlert(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip4'));
                return;

            }
            location.href = _href;
        },
        getCoinCertificates: function (type, resourceId) {
            var _self = this;
            this.model.coin.selectedCoinIndex(-1);
            store.getCoinCertificates(type == 'course' ? customId + '_' + courseId : customId + '_' + courseId + '_' + resourceId, type).done(function (data) {
                _self.model.coin.coinItems(data);
                _self.model.coin.showCoinModal(true);
            })
        },
        selectCoin: function ($index) {
            this.model.coin.selectedCoinIndex($index);
        },
        checkLocked: function (unlockType) {
            var _self = this;
            _self.nowType = 'course';
            //"解锁类型 0:无需解锁 1:兑换券或者解锁课程完成 2:兑换券且解锁课程完成 3:只使用兑换券"
            store.getUserUnlock().done(function (returnData) {
                var criteria = returnData.unlock_type;
                if (returnData.lock_status == 1) {
                    window.location.reload();
                } else if (criteria == 3 && !returnData.use_coin_certificate_status) {
                    _self.getCoinCertificates('course');
                } else if (criteria == 1) {
                    $.fn.udialog.confirm(i18nHelper.getKeyValue('courseComponent.coin.confirmPreTrainOrCoin'), [{
                        text: i18nHelper.getKeyValue('courseComponent.coin.useCoin'),
                        'class': 'ui-btn-confirm',
                        click: function () {
                            _self.getCoinCertificates('course');
                            $(this).udialog("hide");
                        }
                    }, {
                        text: i18nHelper.getKeyValue('courseComponent.coin.aware'),
                        'class': 'ui-btn-primary',
                        click: function () {
                            $(this).udialog("hide");
                        }
                    }], {
                        width: 368,
                        title: i18nHelper.getKeyValue('courseComponent.coin.useTheseWays')
                    });
                } else if (criteria == 2) {
                    if (!returnData.finish_prior_course_status && !returnData.use_coin_certificate_status) {
                        _self._selfAlert(i18nHelper.getKeyValue('courseComponent.coin.confirmPreTrainAndCoin', {
                            "preCourse": _self.model.notFinishedpreTrain().length ? _self.model.notFinishedpreTrain()[0].title : '',
                            "moreThanOne": _self.model.notFinishedpreTrain().length > 1 ? "等" : ""
                        }));
                    } else if (returnData.finish_prior_course_status) {
                        $.fn.udialog.confirm(i18nHelper.getKeyValue('courseComponent.coin.AlreadyPreTrain'), [{
                            text: i18nHelper.getKeyValue('courseComponent.coin.useCoin'),
                            'class': 'ui-btn-confirm',
                            click: function () {
                                _self.getCoinCertificates('course');
                                $(this).udialog("hide");
                            }
                        }, {
                            text: i18nHelper.getKeyValue('courseComponent.coin.aware'),
                            'class': 'ui-btn-primary',
                            click: function () {
                                $(this).udialog("hide");
                            }
                        }], {
                            width: 368,
                            title: i18nHelper.getKeyValue('courseComponent.coin.hint')
                        });
                    } else if (returnData.use_coin_certificate_status) {
                        _self._selfAlert(i18nHelper.getKeyValue('courseComponent.coin.confirmPreTrainAndCoin', {
                            "preCourse": _self.model.notFinishedpreTrain().length ? _self.model.notFinishedpreTrain()[0].title : '',
                            "moreThanOne": _self.model.notFinishedpreTrain().length > 1 ? "等" : ""
                        }));
                    }
                }
            });
        },
        /**
         * 请求考试列表
         * @param  {object} filter 入参
         * @returnData {object} returnData 返回参数
         */
        getExamList: function () {
            var _self = this,
                _filter = _self.model.filter,
                _search = _self.filterParams(ko.mapping.toJS(_filter));
            store.examList(_search).done(function (returnData) {
                if (returnData.items) {
                    $.each(returnData.items, function (index, items) {
                        items.begin_time = _self.formatTime(items.begin_time);
                        items.end_time = _self.formatTime(items.end_time);
                    })
                    _self.model.examItems(returnData.items);
                    _self.model.total(returnData.total);
                }
                $('#pagination').pagination(returnData.total, {
                    items_per_page: _filter.limit(),
                    num_display_entries: 5,
                    current_page: _filter.offset() / _filter.limit(),
                    is_show_total: false,
                    is_show_input: true,
                    pageClass: 'pagination-box',
                    prev_text: '<&nbsp;' + i18nHelper.getKeyValue('courseComponent.front.courseDetail.prev'),
                    next_text: i18nHelper.getKeyValue('courseComponent.front.courseDetail.next') + '&nbsp;>',
                    callback: function (pageNum) {
                        if (pageNum != _filter.offset() / _filter.limit()) {
                            _filter.offset(pageNum * _filter.limit());
                            _self.getExamList();
                        }
                    }
                });
            })
        },
        //格式化
        formatTime: function (data) {
            /**
             兼容IE
             **/
            if (data) {
                return $.format.toBrowserTimeZone(Date.ajustTimeString(data), 'yyyy-MM-dd HH:mm');
            }
        },
        /**
         * 过滤请求参数
         * @param  {object} params 入参
         * @return {object}        处理后的参数
         */
        filterParams: function (params) {
            var _params = {};
            for (var key in params) {
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
                    _params[key] = params[key];
                }
            }
            return _params;
        },
        /**
         Udialog 封装
         **/
        _selfAlert: function (text, icon, time) {
            $.fn.udialog.alert(text, {
                width: 368,
                icon: icon || '',
                closeTimes: time || '',
                title: i18nHelper.getKeyValue('courseComponent.coin.systemInfo'),
                buttons: [{
                    text: i18nHelper.getKeyValue('courseComponent.coin.aware'),
                    click: function () {
                        $(this).udialog("hide");
                    },
                    'class': 'ui-btn-primary'
                }]
            });
        },
        /**
         * 资源点击提示
         * @param {number} [statusCode]
         */
        disableTip: function ($data, evt) {
            var _self = this,
                eventTarget = $(evt.currentTarget).find('.cate-two'),
                resourceId = eventTarget.data('resource-id'),
                resourceName = eventTarget.data('resource-name'),
                resourceType = eventTarget.data('resource-type'),
                resourceUuid = eventTarget.data('uuid');
            var chapter = eventTarget.closest(".chapter-group"),
                chapterId;
            if (chapter.length > 0) {
                chapterId = chapter.data('id');
                resourceName = chapter.data('title');
            }
            _self.resourceId = chapter.length > 0 ? chapterId : resourceId;
            _self.resourceName = resourceName;
            _self.nowType = 'chapter';

            if (statusCode == 7) {
                window.location.href = (window.portal_web_url || "") + "/" + projectCode + "/account/login?returnurl=" + encodeURIComponent(location.href);
                return;
            }

            function checkChapter() {
                store.getUserUnlock().done(function (coursedata) {
                    if (coursedata.lock_status == 1) {
                        store.getUserChapterUnlock(resourceId).done(function (lockData) {
                            if (lockData.locked) {
                                store.getCoinCertificates(customId + '_' + courseId + '_' + _self.resourceId, 'chapter').done(function (data) {
                                    if (data.length > 0) {
                                        $.fn.udialog.confirm(i18nHelper.getKeyValue('courseComponent.coin.unlockChapterTwoWays'), [{
                                            text: i18nHelper.getKeyValue('courseComponent.coin.useCoin'),
                                            'class': 'ui-btn-confirm',
                                            click: function () {
                                                _self.model.coin.selectedCoinIndex(-1);
                                                _self.model.coin.coinItems(data);
                                                _self.model.coin.showCoinModal(true);
                                                $(this).udialog("hide");
                                            }
                                        }, {
                                            text: i18nHelper.getKeyValue('courseComponent.coin.aware'),
                                            'class': 'ui-btn-primary',
                                            click: function () {
                                                $(this).udialog("hide");
                                            }
                                        }], {
                                            width: 368,
                                            title: i18nHelper.getKeyValue('courseComponent.coin.hint')
                                        });
                                    } else {
                                        _self._selfAlert(i18nHelper.getKeyValue('courseComponent.coin.unlockChapterFirst'), '', 2000);
                                    }
                                });
                            } else {
                                window.location.href = (window.selfUrl || '') + "/" + projectCode + "/course/" + courseId + "/learn?resource_uuid=" + resourceUuid + "&resource_type=" + resourceType + "#/"
                            }
                        });
                    } else {
                        _self._selfAlert(i18nHelper.getKeyValue('courseComponent.coin.unlockPreTrainFirst'), '', 2000);
                    }
                });
            }

            if ($(evt.currentTarget).data('locked')) {
                checkChapter();
                return;
            }

            switch (statusCode) {
                case '0':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip5'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '1':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip6'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '2':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip7'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '3':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip8'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '4':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip9'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '5':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip10'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '6':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip11'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '7':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip14'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '21':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip12'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '22':
                    Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip13'), {
                        icon: 2,
                        time: 1500
                    });
                    break;
                case '23':
                    checkChapter();
                    break;
            }


        },
        /**
         * 无需报名自动报名
         */
        autoRgisterAndlink: function (binds) {
            var _self = viewModel,
                registerFlag = _self.model.autoRgisterFlag();
            // _self.model.contentTab(3);
            if (statusCode == 0) {//未登录
                Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip14'), {
                    icon: 2,
                    time: 1500
                });
                return;
            }
            if (statusCode == 1) {//未报名
                Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip5'), {
                    icon: 2,
                    time: 1500
                });
                return;
            }
            if (statusCode == 3) {//请线下报名
                Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip11'), {
                    icon: 2,
                    time: 1500
                });
                return;
            }

            if (statusCode == 11) {//即将开课
                Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip12'), {
                    icon: 2,
                    time: 1500
                });
                return;
            }
            if (statusCode == 12) {//该课程已结束
                Utils.msgTip(i18nHelper.getKeyValue('courseComponent.front.courseDetail.tip13'), {
                    icon: 2,
                    time: 1500
                });
                return;
            }

            var url = _self.model.envirUrl() + binds.id;


            window.open(url + '?__mac=' + Nova.getMacToB64(url));
            // if (courseRegistType == 1 && registerFlag == 1 && userRegistStatus == 0) {
            //     store.userAccess(courseId)
            //         .done(function (data) {
            //             window.location.href = window.location.href + '?tab_id=' + 3;
            //         });
            //     _self.model.autoRgisterFlag(0);
            // }
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
                hasLabel: true
            });
            _self.model.defaultEvaluation.star(this.star._getScore());
        },
        myHTMLEnCode: function (str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&amp;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\'/g, "'");
            s = s.replace(/\"/g, "&quot;");
            //s = s.replace(/\n/g, "<br>");
            return s;
        },
        saveMyComment: function () {
            var _self = this;
            var starScore = _self.star._getScore();
            var content = _self.model.defaultEvaluation.content();
            var myComment = {
                custom_id: courseId,
                custom_type: 'business_course',
                star: starScore,
                content: content,
                target_id: courseId
            };
            //提交,成功时在评价前加

            store.createAppraise(myComment).done(function (_data) {
                var page = ko.mapping.toJS(viewModel.model.page);
                store.appraiseList(page).done(function (data) {
                    _self.loadCommentList(false);
                });
                _self.closeAppraise();
                _self.loadCommentList(false);
            });
        },
        emoji: function (content) {
            if (content) {
                var html = $.trim(content).replace(/\n/g, '<br/>');
                html = jEmoji.softbankToUnified(html);
                html = jEmoji.googleToUnified(html);
                html = jEmoji.docomoToUnified(html);
                html = jEmoji.kddiToUnified(html);
                return jEmoji.unifiedToHTML(html);
            }
        },
        photo_error_pic: function (binds, e) {
            e.target.src = defaultAvatar;
        },
        appraise: function () {
            $("#comments").show();
            $("#comments-box").show();
        },
        closeAppraise: function () {
            $("#comments").hide();
            $("#comments-box").hide();
        },
        loadMore: function () {
            viewModel.model.page.page_no(viewModel.model.page.page_no() + 1);
            viewModel.model.status.loading(true);
            viewModel.loadCommentList(true);
        },
        userImage: function (data) {
            if (!data.user_id()) {
                return "";
            }
            return userLogoUrl + data.user_id() + '/' + data.user_id() + '.jpg?size=80'
        },
        loadCommentList: function (loadMore) {
            var _self = this;
            var page = ko.mapping.toJS(_self.model.page);
            store.appraiseList(page).done(function (data) {
                var temp = _self.model.appraiseList();
                ko.mapping.fromJS(data, {}, _self.model.evaluteInfo);
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
        /**
         * 点击讲师列表的讲师，跳转到portal站的讲师主页
         * @param data
         * @param event
         */
        gotoLecturer: function (data, event) {
            if (data.id) window.top.location.href = portal_web_url + '/' + projectCode + '/lecturer/' + data.id;
        },

        tabClick: function (mode) {
            this.model.tab(mode);
        },
        updateLesson: function (lesson) {
            //点击章节时候先隐藏评测按钮
            this.model.isHaveEvaluating(false);
            this.model.lesson.id(lesson.id);
            this.model.lesson.name(lesson.name);
            this.model.lesson.sort_num(lesson.sort_num);
            this.model.lesson.description(lesson.description);
            this.model.lesson.status(lesson.status);
            this.model.lesson.standard_status(lesson.standard_status);
            this.model.lesson.knowledges(lesson.knowledges);
            this.model.lesson.resources([]);

            this.updateResources();
        },
        updateResources: function () {
            store.learn.lesson.info(this.model.lesson.id()).done($.proxy(function (data) {
                if (user_id) {
                    var filter = {
                        "filter": this.getFilter(data),
                        "offset": 0,
                        "limit": 10000
                    };

                    store.learn.lesson.progresses(filter).done($.proxy(function (progresses) {
                        $.each(data, function (i, resource) {
                            $.each(progresses.items, function (j, progress) {
                                if (progress.target_id == resource.id) {
                                    resource.total_time = progress.total_time;
                                    resource.effective_time = progress.effective_time;
                                }
                            });
                            if (!resource.total_time) {
                                resource.total_time = 10;
                                resource.effective_time = 0;
                            }
                        });

                        this.model.lesson.resources(data);
                        this.isShowEvaluating();
                        this.model.lesson.progresses(progresses);
                    }, this));
                }
                else {
                    this.model.lesson.resources(data);
                    this.isShowEvaluating();
                    this.model.lesson.progresses([]);
                }
            }, this));
        },

        getEvaluatingUrl: function () {
            if (this.checkHasLogin()) {
                var url = "http://" + window.location.host + "/" + project_code + "/course/" + course_id + "/learn?cata_type=0&cata_id=" + this.model.lesson.id() + "&resource_id=" + this.model.evaluatingId();
                window.parent.location = url;
            }
        },

        isShowEvaluating: function () {
            $.each(this.model.lesson.resources(), function (index, items) {
                if (items.type === this.model.RESOURCE_TYPE.EVALUATE()) {
                    //当选中的课时有评测时，显示评测按钮
                    if (!this.model.isHaveEvaluating()) {
                        this.model.isHaveEvaluating(true);
                    }
                    //如果有未达标的评测资源，需跳转到未达标的第一个评测资源
                    if (items.status !== this.model.RESOURCE_STATUS.DONE()) {
                        this.model.evaluatingId(items.resource_data.id);
                        return false;
                    }
                    //如果全部达标，需定位在最后一个评测
                    this.model.evaluatingId(items.resource_data.id);
                }
            }.bind(this))
        },

        getFilter: function (resources) {
            var filter = "business_course_id eq " + course_id;
            if (user_id)
                filter += " and user_id eq " + user_id;

            filter += " and context_id like '%lesson:" + this.model.lesson.id() + "%'";
            $.each(resources, $.proxy(function (i, item) {
                if (i == 0)
                    filter += " and target_id in ("
                filter += "'" + item.id + "'"
                if (i < resources.length - 1)
                    filter += ","
                if (i == resources.length - 1)
                    filter += ")";
            }, this));

            return filter;
        },
        checkHasLogin: function () {
            if (userId == "") {
                $.fn.udialog.alert(i18n.courseComponent.front.courseDetail.courseStatus13, {
                    width: '400px',
                    title: i18n.courseComponent.front.courseDetail.alertTitle,
                    buttons: [{
                        text: i18n.courseComponent.front.courseDetail.sure,
                        click: function () {
                            $(this).udialog("hide");
                        },
                        'class': 'ui-btn-primary'
                    }]
                });

                return false;
            }

            return true;
        },
        getLearnUrl: function (data) {
            var isGoto = false;

            if (data.extra_data && data.extra_data.exp_config && (data.extra_data.exp_config.exp_type == 1)) {
                isGoto = true;
            } else if (this.checkHasLogin()) {
                isGoto = true;
            }

            if (isGoto) {
                var url = window.selfUrl + "/" + project_code + "/course/" + course_id + "/learn?cata_type=0&cata_id=" + this.model.lesson.id() + "&resource_id=" + data.id
                window.parent.location = url;
            }
        },
        getFrontCoverUrl: function (data) {
            if (data.type == 1) {
                return data.resource_data.preview;
            } else if (data.type == 0) {
                return data.resource_data.front_cover_url;
            }
        },
        toTimeString: function (span) {
            span = Math.ceil(parseInt((span / 1000) + ""));
            var h = parseInt((span / 3600) + "");
            var m = parseInt((span / 60) + "") % 60;
            var s = span % 60;

            return (h < 10 ? '0' + h : '' + h) + ":" + (m < 10 ? '0' + m : '' + m) + ":" + (s < 10 ? '0' + s : '' + s);
        },
        updateChapter: function (chapter) {
            //todo update chapter
            var _self = this;
            var pkList = _self.pkList;
            var flag = true;
            _self.model.selectedPKChapterId(chapter.id);
            if (pkList.length) {
                $.each(pkList, function (index, pk) {
                    if (pk.chapter_id == chapter.id) {
                        flag = false;
                        _self.model.hasPK(true);
                        var pkUrl = window.pkGatewayUrl + "/" + projectCode + "/pk/" + pk.pk_id;
                        _self.model.PKUrl(pkUrl + "?__mac=" + Nova.getMacToB64(pkUrl));
                    }
                });
            }
            if (flag) {
                _self.model.hasPK(false);
                _self.model.PKUrl("");
            }
        }
    };
    $(function () {
        viewModel._init();
    });

    function drawCanvas() {
        // if (percentTop == 0)
        //     return;
        // percentTop += 0.01; //处理用户没学习数，但是处于继续练习状态
        var percent;
        if (0 < percentTop < 1) {
            percent = Math.ceil(percentTop);
        }
        if (99 < percentTop < 100) {
            percent = Math.floor(percentTop);
        }
        var o = percent + '%';
        var canvas = document.getElementById('cv');
        if (!canvas)
            return;
        var ctx = canvas.getContext('2d');
        var startAngle = 1.5 * Math.PI;
        var avg = 1,
            endAngle;
        var canvasText = '<div class="canvas-text"><span>' + o + '</span><p>' + i18nHelper.getKeyValue('courseComponent.front.courseDetail.completed') + '</p></div>';
        var skinMap = {
            'blue': '#38adff',
            'green': '#3bb800',
            'red': '#ce3f3f',
            'white': '#38adff'
        };

        function drawBackground() {
            ctx.save();
            ctx.lineJoin = "round";
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#ccc';
            ctx.beginPath();
            ctx.arc(55, 55, 45, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
        }

        function drawArc() {
            ctx.save();
            ctx.lineWidth = 6;
            ctx.strokeStyle = skinMap[skinStyle];
            ctx.beginPath();
            if (typeof endAngle != 'undefined')
                ctx.arc(55, 55, 45, startAngle, endAngle);
            ctx.stroke();
            ctx.restore();
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            drawArc();
            avg += 1;
            endAngle = startAngle + avg * 360 / 100 * (Math.PI / 180);
            if (avg <= percent) requestAnimationFrame(animate);
        }

        // if (percent) {
        $("#circle").append(canvasText);
        drawBackground();
        requestAnimationFrame(animate);
        // }
    }

})(jQuery, window);

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
