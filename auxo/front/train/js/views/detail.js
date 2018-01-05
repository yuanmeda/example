(function ($) {
    'use strict';
    var last_study_course_id, first_course_id, percentTop;
    var store = {
        getTrainDetail: function () {
            var url = selfUrl + '/' + projectCode + "/trains/" + train_id;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        enroll: function () {
            var url = selfUrl + '/' + projectCode + "/trains/" + train_id + '/trainees';
            return $.ajax({
                url: url,
                type: 'PUT',
                cache: false
            });
        },
        getProgress: function () {
            var url = selfUrl + '/' + projectCode + "/v1/users/trains/" + train_id + '/progress';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        getExamList: function () {
            var url = selfUrl + '/' + projectCode + "/trains/" + train_id + '/exams';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        getUserCourseList: function () {
            var url = selfUrl + '/' + projectCode + "/users/trains/" + train_id + '/courses';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        //获取培训已选课程
        getTrainSelectCourses: function () {
            var url = selfUrl + '/' + projectCode + "/v1/users/trains/" + train_id + "/selected_courses";
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        checkExam: function (exam_id) {
            var url = selfUrl + '/' + projectCode + "/trains/" + train_id + '/exams/' + exam_id + '/admission';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "text",
                cache: false
            });
        },
        checkCourse: function (course_id) {
            var url = selfUrl + '/' + projectCode + "/trains/" + train_id + '/courses/' + course_id + '/admission';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "text",
                cache: false
            });
        },
        //培训先修列表
        getPreTrainList: function () {
            var url = selfUrl + '/' + projectCode + '/trains/' + train_id + '/users/pre_trains';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        sendRequest: function (url, data, success) {
            $.ajax({
                url: url,
                cache: false,
                data: data,
                dataType: "json",
                async: true,
                type: 'GET',
                success: success
            });
        },
        //获取用户培训解锁情况
        getUserUnlock: function () {
            var url = selfUrl + '/' + projectCode + '/v1/users/trains/' + train_id + '/unlock_info';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        //获取用户可用优惠券
        getCoinCertificates: function () {
            var url = selfUrl + '/' + projectCode + '/v1/users/limit_object_id/' + train_id + '/coin_certificates';
            return $.ajax({
                url: url,
                data: {
                    "limit_object_type": 'train'
                },
                cache: false
            });
        },
        useCoin: function (couponId, data) {
            var url = selfUrl + '/' + projectCode + '/v1/users/coin_certificates/' + couponId + '/use_status';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                dataType: 'JSON',
                contentType: 'application/json;charset=utf8'
            });
        },
        getTrainees: function (data) {
            var url = selfUrl + '/' + projectCode + '/v2/trains/' + train_id + '/trainees/pages';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false,
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
        }
    };
    var config = {};
    var viewModel = {
        model: {
            init: false,
            contentTab: 1,
            isSelect: false,
            showSelectBtn: false,
            train: {
                id: '',
                cover_url: '',
                title: '',
                attention: '',
                option_hour: 0,
                require_hour: 0,
                demand_require_hour: 0,
                demand_option_hour: 0,
                user_count: 0,
                regist_num: 0,
                regist_start_time: '',
                regist_end_time: '',
                regist_attention: '',
                regist_num_limit: 0,
                study_start_time: "",
                unlock_criteria: 0,
                select_course_config: 0,
                user_train_learn_status: 0,
                user_regist_status: 0,
                require_course_count: 0,
                option_course_count: 0,
                period_display_type: 0 //学时展示方式 0:学时 1:进度百分比 2:内容数量
            },
            progress: {
                train_id: "",
                regist_status: 0,
                require_hour: 0,
                option_hour: 0,
                course_hour: 0,
                demand_require_hour: 0,
                demand_option_hour: 0,
                demand_course_hour: 0,
                finish_require_hour: 0,
                finish_option_hour: 0.0,
                finish_demand_course_hour: 0.13,
                last_study_course_id: null,
                last_study_course_name: "",
                target_id: null,
                target_type: null,
                study_time: 0,
                last_study_date: "",
                begin_study_date: "",
                user_train_study_status: 0,

                require_progress: 0, //必修学习进度（0-100）
                option_progress: 0, //选修学习进度（0-100）
                progress: 0, //学习进度（0-100）
                require_finish_resource_count: 0, //必修完成资源数
                option_finish_resource_count: 0, //选修完成资源数
                finish_resource_count: 0, //完成资源数
                require_resource_total_count: 0, //必修资源总数
                option_resource_total_count: 0, //选修资源总数
                resource_total_count: 0 //资源总数
            },
            total: 23,
            preTrain: [],
            notFinishedpreTrain: [],
            exam: {
                items: [],
                total: 0,
                init: false
            },
            course: {
                items: [],
                total: 0,
                init: false
            },
            coin: {
                showCoinModal: false,
                coinItems: [],
                selectedCoinIndex: -1
            },
            cover_url: '',
            description: '',
            name: '',
            enrollBtn: {
                btnClass: 'l-btn bc-blue enroll_class',
                btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.use'),
                goforward: null,
                entering: false,
                enteringText: ''
            },
            classmates: {
                items: [],
                total: 0
            },
            sideTab: classmateOrRank ? 'classmate' : 'ranking',
            lockStatus: 0,
            moduleFlag: {
                rank: !classmateOrRank
            },
            //评价信息
            appraiseInfo: {
                target_id: train_id, //必传 --评价对象ID
                custom_id: train_id, //必传
                custom_type: 'auxo-train', //必传
                study_process: '0' //必传
            },
            evaluteInfo: {
                avg_star: 5,
                my_appraise_star: 0,
                my_appraise_content: '',
                my_appraise_create_time: '',
                total_number: 0,
                current_user_appraise: false
            },
            appraise: {
                init: false
            },
            rank: {
                update_time: '',
                tag: 'week_all_in',
                rank_id: 'learnHoursTabs',
                class_id: projectId + '-auxo-train-' + train_id
            },
            collectionDisabled: false,
            //是否显示收藏按钮(暂时给定，随后与服务端联调)
            showFavorite: true
        },
        //页面初始化
        init: function () {
            var _self = this;
            document.title = i18nHelper.getKeyValue('trainComponent.trains.frontPage.detailTitle');
            this.model = ko.mapping.fromJS(this.model);
            this.allHosts = {
                elearningEnrollGatewayUrl: elearning_enroll_gateway_url,
                elearningPayGatewayUrl: elearningPayGatewayUrl,
                eGoodsGatewayUrl: eGoodsGatewayUrl,
                eSalesGatewayUrl: eSalesGatewayUrl,
                eCartServiceUrl: eCartServiceUrl,
                eCartGatewayUrl: eCartGatewayUrl,
            };
            ko.applyBindings(_self, document.getElementById("train-container"));
            this.initData();
            if (user_id && (!window.SWITCHES || (window.SWITCHES && window.SWITCHES['switch.assist.fav']))) {
                this.checkCollection();
            }
        },
        /*查询收藏状态*/
        checkCollection: function () {
            var _self = this;
            var postArr = [{
                source_id: train_id,
                source_type: "e-train"
            }];
            store.checkFavorites(postArr).done(function (resData) {
                if (resData && resData.items) {
                    _self.model.collectionDisabled(resData.items[0].is_fav);
                }
            });
        },
        /*新增or取消收藏功能*/
        onCollection: function () {
            var _self = this;
            if (!user_id) {
                window.location.href = window.portal_web_url + "/" + projectCode + "/account/login?returnurl=" + encodeURIComponent(location.href);
                return;
            }
            var picArr = _self.model.train.cover_url() ? _self.model.train.cover_url().split('/') : [];
            if (!this.model.collectionDisabled()) {
                var addData = {
                    "source_request": {
                        "source_id": train_id,
                        "source_type": "e-train"
                    },
                    "title": _self.model.train.title(),
                    "link": trainLink + "?trainId=" + train_id,
                    "web_link": window.location.href,
                    "text": _self.model.train.attention(),
                    "image": picArr && picArr.length > 0 ? picArr[picArr.length - 1].split('.')[0] : ""
                };
                var picUrl = _self.model.train.cover_url();
                if (picUrl) {
                    store.getCsId(picUrl).done(function (resData) {
                        addData.image = resData.dentry_id;
                        _self.accessFavorite(addData);
                    });
                } else {
                    _self.accessFavorite(addData);
                }
            } else {
                var cancelData = {
                    source_id: train_id,
                    source_type: "e-train"
                };
                store.deleteFavorites(cancelData).done(function () {
                    _self.model.collectionDisabled(false);
                }).fail(function () {
                    $.fn.udialog.alert(i18n.trainComponent.trainIntroduce.frontPage.collectionFail, {
                        width: '400px',
                        title: i18n.trainComponent.common.addins.alertTitle,
                        buttons: [{
                            text: i18n.trainComponent.common.addins.sure,
                            click: function () {
                                $(this).udialog("hide");
                            },
                            'class': 'ui-btn-primary'
                        }]
                    });
                });
            }
        },
        /*收藏访问接口*/
        accessFavorite: function (data) {
            var _self = this;
            store.addFavorites(data).done(function () {
                _self.model.collectionDisabled(true);
            }).fail(function () {
                $.fn.udialog.alert(i18n.trainComponent.trainIntroduce.frontPage.collectionFail, {
                    width: '400px',
                    title: i18n.trainComponent.common.addins.alertTitle,
                    buttons: [{
                        text: i18n.trainComponent.common.addins.sure,
                        click: function () {
                            $(this).udialog("hide");
                        },
                        'class': 'ui-btn-primary'
                    }]
                });
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
        confirmUseCoin: function () {
            var coupon = this.model.coin.coinItems()[this.model.coin.selectedCoinIndex()],
                _self = this;
            if (this.model.coin.coinItems().length == 0 || this.model.coin.selectedCoinIndex() == -1) {
                return;
            }
            $.fn.udialog.confirm(i18nHelper.getKeyValue("trainComponent.coin.confirmUseCoin") + "<br>“" + coupon.coin_certificate_vo.name + "”？", [{
                text: i18nHelper.getKeyValue("trainComponent.coin.confirm"),
                'class': 'ui-btn-confirm',
                click: function () {
                    store.useCoin(coupon.coin_certificate_vo.id, {
                        "use_object_type": "train",
                        "use_object_id": _self.model.train.id(),
                        "use_object_name": _self.model.train.title()
                    }).done(function () {
                        location.reload();
                    });
                    $(this).udialog("hide");
                }
            }, {
                text: i18nHelper.getKeyValue("trainComponent.coin.cancel"),
                'class': 'ui-btn-primary',
                click: function () {
                    $(this).udialog("hide");
                }
            }], {
                width: 368,
                title: i18nHelper.getKeyValue("trainComponent.coin.systemInfo")
            });
        },
        closeCoinModal: function () {
            this.model.coin.showCoinModal(false);
        },
        setDefaultAvatar: function ($data, $event) {
            $($event.target).attr('src', defaultAvatar);
        },
        selectCoin: function ($index) {
            this.model.coin.selectedCoinIndex($index);
        },
        getCoupon: function () {
            var _self = this;
            store.getCoinCertificates().done(function (data) {
                _self.model.coin.coinItems(data);
            });
        },
        toggleSideTab: function (tab) {
            this.model.sideTab(tab);
            if (tab == 'ranking' && !this.model.moduleFlag.rank()) this.model.moduleFlag.rank(true);
        },
        initData: function () {
            var _self = this;

            var button;
            store.getTrainDetail().done(function (data) {
                viewModel.model.train.period_display_type(data.period_display_type || 0);
                viewModel.model.rank.update_time($.format.date(new Date(data.server_time.split('T')[0].replace(/-/g, '/')).getTime() - 86400000, 'yyyy-MM-dd'));
                viewModel.model.exam.total(data.exam_count);
                viewModel.model.course.total(data.require_course_count + data.option_course_count);

                store.getTrainees({
                    train_id: train_id,
                    select: 'uc_user',
                    page: 0,
                    size: 15
                }).done(function (userdata) {
                    viewModel.model.classmates.items(userdata.items);
                    viewModel.model.classmates.total(userdata.total);
                });

                data.attention = data.attention ? data.attention.replace(/\$\{cs_host}/gim, servelUrl) : '';
                ko.mapping.fromJS(data, {}, viewModel.model.train);

                viewModel.model.evaluteInfo.avg_star(data.appraise_stat_info.avg_star);
                viewModel.model.evaluteInfo.total_number(data.appraise_stat_info.total);
                var study_start_time = data.study_start_time;
                var study_end_time = data.study_end_time;
                var regist_start_time = data.regist_start_time;
                var regist_end_time = data.regist_end_time;
                var server_time = data.server_time;
                var demand_require_hour = data.demand_require_hour;
                var demand_option_hour = data.demand_option_hour;
                var regist_type = data.regist_type;
                var regist_num_limit = data.regist_num_limit;
                var user_count = data.user_count;
                var unlock_criteria = data.unlock_criteria;
                var select_course_config = data.select_course_config;
                var user_train_learn_status = data.user_train_learn_status;

                //先修培训列表
                if (unlock_criteria == 2 || unlock_criteria == 3) {
                    store.getPreTrainList().done(function (pretrainData) {
                        viewModel.model.preTrain(pretrainData);
                        viewModel.model.notFinishedpreTrain($.grep(pretrainData, function (v) {
                            return v.user_train_status == 0;
                        }));
                    });
                }

                switch (user_train_learn_status) {
                    case 1100:
                        // 线下报名
                        button = config[11];
                        break;
                    case 1200:
                        // 学习时间已结束
                        button = config[9];
                        break;
                    case 1300:
                        // 学习时间未开始
                        button = config[6];
                        break;
                    case 1400:
                        // 报名时间已结束
                        button = config[7];
                        break;
                    case 1500:
                        // 报名时间未开始
                        button = config[8];
                        break;
                    case 1600:
                        // 报名人数已满
                        button = config[15];
                        break;
                    case 1700:
                        // 培训未解锁
                        button = config[17];
                        break;
                    case 1800:
                        // 培训未选课
                        button = config[18];
                        break;
                    case 1010:
                        // 待审核
                        button = config[13];
                        break;
                    case 1020:
                        // 重新报名
                        button = config[14];
                        break;
                    case 1030:
                        // 去报名
                        button = config[0];
                        break;
                    case 1040:
                        // 待填写表单
                        button = config[0];
                        break;
                    case 1050:
                        // 待付款
                        button = config[0];
                        break;
                    case 1001:
                        // 开始学习
                        button = config[10];
                        break;
                    case 1002:
                        // 继续学习
                        button = config[2];
                        break;
                    case 1003:
                        // 复习回顾
                        button = config[3];
                        break;
                }

                var def = $.Deferred();
                if (user_id != '') {
                    def = $.when(store.getProgress(), viewModel.getUserUnlock()).then(function (data1, data2) {
                        var data = data1[0],
                            returnData = data2[0];
                        viewModel.model.lockStatus(viewModel.model.train.unlock_criteria() == 0 ? 1 : returnData.unlock_status);
                        ko.mapping.fromJS(data, {}, viewModel.model.progress);
                        if (data.selected_option_course_count) viewModel.model.isSelect(true);
                        viewModel.model.course.total(data.selected_option_course_count ? data.selected_option_course_count + viewModel.model.train.require_course_count() : viewModel.model.course.total());
                        last_study_course_id = data.last_study_course_id;
                        var require_hour = data.finish_require_hour;
                        var option_hour = data.finish_option_hour;
                        viewModel._setPercentage(isNaN(data.progress) ? 0 : data.progress);
                        viewModel.model.train.user_regist_status(data.regist_status);
                    });
                } else {
                    def.resolve();
                }

                def.done($.proxy(function () {
                    // 无需报名情况下，做判断
                    if (user_train_learn_status == 1001 && this.model.progress.regist_status() == 2)
                        button = config[1];

                    if (this.model.progress.regist_status() == 2)
                        viewModel.model.appraiseInfo.study_process('1');

                    // 无需报名且状态为选课状态，需要做个报名操作
                    if (this.model.progress.regist_status() != 2 && user_train_learn_status == 1800)
                        button = config[19];

                    ko.mapping.fromJS(button, {}, this.model.enrollBtn);
                    this.model.init(true);
                }, viewModel));
            });
        },
        getUserUnlock: function () {
            if (viewModel.model.train.unlock_criteria() != 0)
                return store.getUserUnlock();
            else
                return $.when([false]);
        },
        goToStudy: function () {
            var _self = this;
            if (!viewModel.model.enrollBtn.entering()) {
                viewModel._selfAlert(viewModel.model.enrollBtn.enteringText());
                return;
            }
            if (last_study_course_id) {
                location.href = window.auxoCourseWebfront + '/' + projectCode + '/course/' + last_study_course_id;
            } else {
                viewModel._selfAlert(i18nHelper.getKeyValue('trainComponent.courseComponent.front.courseDetail.tip2'));
            }
        },
        enrollAndSelectCourse: function () {
            store.enroll().done(viewModel.goToSelect());
        },
        goToSelect: function () {
            window.location.href = selfUrl + '/' + projectCode + '/train/' + train_id + '/select_courses';
        },
        _setPercentage: function (val) {
            percentTop = val;
            this._load(drawCanvas);
        },
        _load: function (fn) {
            if (document.readyState === "complete") {
                return setTimeout(fn, 1);
            }
            if (document.addEventListener) {
                window.addEventListener("load", fn, false);
            } else if (document.attachEvent) {
                window.attachEvent("onload", fn);
            }
        },
        goToCourse: function (data) {
            var _self = viewModel;
            store.checkCourse(data.course_id()).done(function (message) {
                if (message) {
                    _self._selfAlert(message);
                    return;
                }

                if (data.experience_type() == 1) {
                    location.href = selfUrl + '/' + projectCode + '/train/' + train_id + '/course/' + data.course_id();
                } else {
                    if (!viewModel.model.enrollBtn.entering()) {
                        _self._selfAlert(viewModel.model.enrollBtn.enteringText());
                        return;
                    }
                    if (viewModel.model.progress.regist_status() === -1) {
                        if (viewModel.model.train.regist_type() === 0) {
                            viewModel.enroll();
                        } else {
                            _self._selfAlert(i18nHelper.getKeyValue('trainComponent.trains.frontPage.courseClickTips'));
                            return;
                        }
                    }
                    location.href = selfUrl + '/' + projectCode + '/train/' + train_id + '/course/' + data.course_id();
                }
            });
        },
        _selfAlert: function (text, icon) {
            $.fn.udialog.alert(text, {
                width: 368,
                icon: icon || '',
                title: i18nHelper.getKeyValue('trainComponent.coin.systemInfo'),
                buttons: [{
                    text: i18nHelper.getKeyValue('trainComponent.coin.aware'),
                    click: function () {
                        $(this).udialog("hide");
                    },
                    'class': 'ui-btn-primary'
                }]
            });
        },
        goToExam: function ($data) {
            var _self = viewModel;
            store.checkExam($data.exam_id).done(function (message) {
                if (message) {
                    _self._selfAlert(message);
                    return;
                }
                if (viewModel.model.progress.regist_status() === -1) {
                    if (viewModel.model.train.regist_type() === 0) {
                        viewModel.enroll();
                    } else {
                        _self._selfAlert(i18nHelper.getKeyValue('trainComponent.trains.frontPage.courseClickTips'));
                        return;
                    }
                }
                location.href = selfUrl + '/' + projectCode + '/train/' + train_id + '/exam/' + $data.exam_id;
            });
        },
        enroll: function () {
            if (!user_id) {
                window.location = window.portal_web_url + '/' + projectCode + '/account/login?returnurl=' + encodeURIComponent(window.location.href);
            } else {
                var user_train_learn_status = viewModel.model.train.user_train_learn_status();
                if (user_train_learn_status === 1020 || user_train_learn_status === 1030 || user_train_learn_status === 1040 || user_train_learn_status === 1050) {
                    var enroll_url = elearning_enroll_gateway_url + '/' + projectCode + '/enroll/enroll?unit_id=' + train_id + '&__return_url=' + encodeURIComponent(location.href);
                    location.href = enroll_url + '&__mac=' + Nova.getMacToB64(enroll_url);
                } else {
                    store.enroll().done(viewModel.initData);
                }
            }

        },
        enrollAndStudy: function () {
            store.enroll().done(function () {
                ko.mapping.fromJS(config[1], {}, viewModel.model.enrollBtn);
                viewModel.goToStudy();
            });
        },
        enrollNeedAudit: function () {
            viewModel.enroll();
        },
        //切换tab页
        switchContentTab: function (type) {
            var _self = this;
            this.model.contentTab(type);
            if (type == 2 && !_self.model.course.init()) {
                store.getUserCourseList().done(function (data) {
                    ko.mapping.fromJS(data, {}, viewModel.model.course.items);
                    _self.model.course.init(true);
                });
            }
            if (type == 3 && !_self.model.exam.init()) {
                store.getExamList().done(function (data) {
                    _self.model.exam.items(data);
                    _self.model.exam.init(true)
                });
            }
            if (type == 4 && !_self.model.appraise.init()) {
                _self.model.appraiseInfo.after_comment = $.proxy(function () {
                    store.getTrainDetail().done(function (data) {
                        _self.model.evaluteInfo.avg_star(data.appraise_stat_info.avg_star);
                        _self.model.evaluteInfo.total_number(data.appraise_stat_info.total);
                    });
                }, _self);
                _self.model.appraise.init(true);
            }
        },
        formatScore: function (score) {
            var value = 0;
            if (score) {
                return score.toFixed(1).replace(/.0$/, '');
            } else {
                return value;
            }
        },
        formatDateTime: function ($data) {
            var html = '';
            switch ($data.exam_status) {
                case 0:
                    html = $.format.toBrowserTimeZone(Date.ajustTimeString($data.begin_time), 'yyyy-MM-dd HH:mm') + '&nbsp;<em>' + i18nHelper.getKeyValue('trainComponent.details.beginExam') + '</em>';
                    break;
                case 1:
                    if ($data.end_time) {
                        html = $.format.toBrowserTimeZone(Date.ajustTimeString($data.end_time), 'yyyy-MM-dd HH:mm') + '&nbsp;<em>' + i18nHelper.getKeyValue('trainComponent.details.endExam') + '</em>';
                    } else {
                        html = '';
                    }
                    break;
                case 2:
                    html = $data.end_time ? $.format.toBrowserTimeZone(Date.ajustTimeString($data.end_time), 'yyyy-MM-dd HH:mm') + '&nbsp;<em>' + i18nHelper.getKeyValue('trainComponent.details.endExam') + '</em>' : '';
                    break;
            }
            return html;
        },
        disableBtn: function ($data) {
            var isDisable = -1;
            switch ($data.exam_status) {
                case 0:
                case 2:
                    isDisable = 1;
                    break;
                case 1:
                    switch ($data.last_user_exam_status) {
                        case 16:
                        case 101:
                            isDisable = 1;
                            break;
                        case 32:
                            isDisable = ($data.exam_chance - $data.exam_times <= 0) ? 1 : 0;
                            break;
                        default:
                            isDisable = 0;
                    }
                    break;
            }
            // var data = ko.mapping.toJS($data);
            if ($data.exam_access_rule && ($data.exam_access_rule.option_hour || $data.exam_access_rule.require_hour)) {
                if (viewModel.model.progress.finish_option_hour() < $data.exam_access_rule.option_hour || viewModel.model.progress.finish_require_hour() < $data.exam_access_rule.require_hour) {
                    isDisable = 1;
                }
            }
            return isDisable;
        },
        userExamStatus: function ($data) {
            var txt = '';
            switch ($data.exam_status) {
                case 0:
                    txt = i18nHelper.getKeyValue('trainComponent.exam.soon');
                    break;
                case 1:
                    switch ($data.last_user_exam_status) {
                        case 8:
                        case 112:
                            //                            txt = '继续考试';
                            txt = i18nHelper.getKeyValue('trainComponent.exam.continue');
                            break;
                        case 16:
                        case 101:
                            //                            txt = '等待批改';
                            txt = i18nHelper.getKeyValue('trainComponent.exam.correcting');
                            break;
                        case 32:
                            //                            txt = ($data.exam_chance() - $data.exam_times() <= 0) ? '无考试机会' : '重新考试';
                            txt = ($data.exam_chance - $data.exam_times <= 0) ? i18nHelper.getKeyValue('trainComponent.exam.noChance') : i18nHelper.getKeyValue('trainComponent.exam.retry');
                            break;
                        default:
                            txt = i18nHelper.getKeyValue('trainComponent.exam.begin');
                        //                            txt = '开始考试';
                    }
                    break;
                case 2:
                    txt = i18nHelper.getKeyValue('trainComponent.exam.end');
                    //                    txt = '已结束';
                    break;
            }
            // var data = ko.mapping.toJS($data);
            if ($data.exam_access_rule && ($data.exam_access_rule.option_hour || $data.exam_access_rule.require_hour)) {
                if (viewModel.model.progress.finish_option_hour() < $data.exam_access_rule.option_hour || viewModel.model.progress.finish_require_hour() < $data.exam_access_rule.require_hour) {
                    txt = i18nHelper.getKeyValue('trainComponent.details.hourLess');
                    //                    txt = "学时不足";
                }
            }
            return txt;
        },
        //    model.train.unlock_criteria         解锁条件
        // [0: NotLock 无, 1: CoinCertificate 兑换券,
        // 2: PreTrainOrCoinCertificate 先修培训或兑换券,
        //  3: PreTrainAndCoinCertificate 先修培训且兑换券]
        //  unlock_status   integer (int32) optional    解锁状态(0未解锁,1已解锁)
        // finish_pre_train_status integer (int32) optional    先修培训状态(0未完成,1已完成)
        // use_coin_certificate_status integer (int32) optional    使用兑换券状态(0未使用,1已使用)
        //解锁培训
        getCoinCertificates: function (type) {
            var _self = this;
            this.model.coin.selectedCoinIndex(-1);
            this.model.coin.showCoinModal(true);
            store.getCoinCertificates(train_id, 'train').done(function (data) {
                _self.model.coin.coinItems(data);
            })
        },
        unlockTrain: function () {
            var _self = this,
                criteria = _self.model.train.unlock_criteria();
            store.getUserUnlock().done(function (returnData) {
                if (returnData.unlock_status == 1) {
                    window.location.reload();
                } else if (criteria == 1 && !returnData.use_coin_certificate_status) {
                    _self.getCoinCertificates();
                } else if (criteria == 2) {
                    $.fn.udialog.confirm(i18nHelper.getKeyValue('trainComponent.coin.confirmPreTrainOrCoin'), [{
                        text: i18nHelper.getKeyValue('trainComponent.coin.useCoin'),
                        'class': 'ui-btn-confirm',
                        click: function () {
                            _self.getCoinCertificates();
                            $(this).udialog("hide");
                        }
                    }, {
                        text: i18nHelper.getKeyValue('trainComponent.coin.aware'),
                        'class': 'ui-btn-primary',
                        click: function () {
                            $(this).udialog("hide");
                        }
                    }], {
                        width: 368,
                        title: i18nHelper.getKeyValue('trainComponent.coin.useTheseWays')
                    });
                } else if (criteria == 3) {
                    if (!returnData.finish_pre_train_status && !returnData.use_coin_certificate_status) {
                        _self._selfAlert(i18nHelper.getKeyValue('trainComponent.coin.confirmPreTrainAndCoin', {
                            "preTrain": _self.model.notFinishedpreTrain().length ? _self.model.notFinishedpreTrain()[0].pre_train_detail_vo.title : '',
                            "moreThanOne": _self.model.notFinishedpreTrain().length > 1 ? "等" : ""
                        }));
                    } else if (returnData.finish_pre_train_status) {
                        $.fn.udialog.confirm(i18nHelper.getKeyValue('trainComponent.coin.AlreadyPreTrain'), [{
                            text: i18nHelper.getKeyValue('trainComponent.coin.useCoin'),
                            'class': 'ui-btn-confirm',
                            click: function () {
                                _self.getCoinCertificates();
                                $(this).udialog("hide");
                            }
                        }, {
                            text: i18nHelper.getKeyValue('trainComponent.coin.aware'),
                            'class': 'ui-btn-primary',
                            click: function () {
                                $(this).udialog("hide");
                            }
                        }], {
                            width: 368,
                            title: i18nHelper.getKeyValue('trainComponent.coin.hint')
                        });
                    } else if (returnData.use_coin_certificate_status) {
                        _self._selfAlert(i18nHelper.getKeyValue('trainComponent.coin.confirmPreTrainAndCoin', {
                            "preTrain": _self.model.notFinishedpreTrain().length ? _self.model.notFinishedpreTrain()[0].pre_train_detail_vo.title : '',
                            "moreThanOne": _self.model.notFinishedpreTrain().length > 1 ? "等" : ""
                        }));
                    }
                }
                //
            })
        },
        dateFormat: function (date) {
            if (date) {
                date = date.split('.')[0].replace('T', ' ');
                date.substring(0, date.length - 3)
            }
            return date || '';
        },
        /**
         * 点击讲师列表的讲师，跳转到portal站的讲师主页
         * @param data
         * @param event
         */
        gotoLecturer: function (data, event) {
            if (data.id) window.top.location.href = portal_web_url + '/' + projectCode + '/lecturer/' + data.id;
        }
    };
    config = [{
        btnClass: 'l-btn bc-blue enroll_class',
        btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.notEnroll'),
        goforward: viewModel.enroll,
        entering: false,
        enteringText: i18nHelper.getKeyValue('trainComponent.details.tips.enroll_first')
    }, //报名0
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.use'),
            goforward: viewModel.goToStudy,
            entering: true,
            enteringText: ''
        }, //开始学习1
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.learning'),
            goforward: viewModel.goToStudy,
            entering: true,
            enteringText: ''
        }, //继续学习2
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.finish'),
            goforward: viewModel.goToStudy,
            entering: true,
            enteringText: ''
        }, //复习回顾3
        {
            btnClass: 'l-btn bc-blue disabled',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollUnConfirm'),
            goforward: null,
            entering: false,
            enteringText: i18nHelper.getKeyValue('trainComponent.details.tips.enrollUnConfirm')
        }, //报名待审核4
        {
            btnClass: 'l-btn bc-blue enroll_class',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollAgain'),
            goforward: viewModel.enroll,
            entering: false,
            enteringText: i18nHelper.getKeyValue('trainComponent.details.tips.enroll_first')
        }, //重新报名5
        {
            btnClass: 'l-btn bc-blue disabled',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.toSelectCourse'),
            goforward: null,
            entering: false,
            enteringText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.toSelectCourse')
        }, //未开课6
        {
            btnClass: 'l-btn bc-blue disabled',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollEnded'),
            goforward: null,
            entering: false,
            enteringText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollEnded')
        }, //报名已结束7
        {
            btnClass: 'l-btn bc-blue disabled',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollNotStart'),
            goforward: null,
            entering: false,
            enteringText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollNotStart')
        }, //报名未开始8
        {
            btnClass: 'l-btn bc-blue disabled',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.ended'),
            goforward: null,
            entering: false,
            enteringText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.ended')
        }, //培训已结束9
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.use'),
            goforward: viewModel.enrollAndStudy,
            entering: true,
            enteringText: ''
        }, //不需要报名，直接学习10
        {
            btnClass: 'l-btn bc-blue disabled',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.offlineEnroll'),
            goforward: null,
            entering: false,
            enteringText: i18nHelper.getKeyValue('trainComponent.details.tips.enroll_first')
        }, //线下报名11
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.notEnroll'),
            goforward: viewModel.enrollNeedAudit,
            entering: false,
            enteringText: i18nHelper.getKeyValue('trainComponent.details.tips.enroll_first')
        }, //报名需审核12
        {
            btnClass: 'l-btn bc-blue disabled',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollUnConfirm'),
            goforward: null,
            entering: false,
            enteringText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollUnConfirm')
        }, //报名待审核13
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('common.frontPage.enrollStatus.enrollAgain'),
            goforward: viewModel.enroll,
            entering: false,
            enteringText: i18nHelper.getKeyValue('trainComponent.details.tips.enroll_first')
        }, //重新报名14
        {
            btnClass: 'l-btn bc-blue disabled',
            btnText: i18nHelper.getKeyValue('trainComponent.details.no_vacancy'),
            goforward: null,
            entering: false,
            enteringText: ''
        }, //报名人数已满15
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('trainComponent.common.frontPage.enrollStatus.unlock'),
            goforward: viewModel.enroll,
            entering: false,
            enteringText: ''
        }, //解锁培训 todo 国际化翻译16
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('trainComponent.common.frontPage.enrollStatus.unlock'),
            goforward: viewModel.unlockTrain,
            entering: false,
            enteringText: ''
        }, //解锁培训 todo 国际化翻译17
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('trainComponent.selectCourse.goSelectCourse'),
            goforward: viewModel.goToSelect,
            entering: false,
            enteringText: ''
        }, //去选课 18
        {
            btnClass: 'l-btn bc-blue',
            btnText: i18nHelper.getKeyValue('trainComponent.selectCourse.goSelectCourse'),
            goforward: viewModel.enrollAndSelectCourse,
            entering: false,
            enteringText: ''
        } //无需报名，且未报名，去选课 19
    ];
    $(function () {
        viewModel.init();
    });

    function drawCanvas() {
        if (!viewModel.model.progress.finish_option_hour() && !viewModel.model.progress.finish_require_hour())
            return;
        // var percent = Math.floor(percentTop);
        var percent;
        if (0 < percentTop < 1) {
            percent = Math.ceil(percentTop);
        }
        if (99 < percentTop < 100) {
            percent = Math.floor(percentTop);
        }
        var o = percent + '%';
        var canvas = document.getElementById('cv');
        var ctx = canvas.getContext('2d');
        var startAngle = 1.5 * Math.PI;
        var avg = 1,
            endAngle;
        var canvasText = '<div class="canvas-text"><span>' + o + '</span><p>' + i18nHelper.getKeyValue('trainComponent.details.completed') + '</p></div>';
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

        if (viewModel.model.progress.finish_option_hour() || viewModel.model.progress.finish_require_hour()) {
            $("#circle").append(canvasText);
            drawBackground();
            requestAnimationFrame(animate);
        }
    }
})(jQuery);
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
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
