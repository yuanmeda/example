;(function ($, window) {
    var _ = ko.utils;
    var store = {
        getPkDetail: function () {
            return $.ajax({
                url: self_host + '/v2/pk_details/' + pk_id,
                dataType: 'json',
                cache: false
            });
        },
        getPkUserInfo: function () {
            return $.ajax({
                url: self_host + '/v1/pk_users?pk_id=' + pk_id + '&user_id=' + user_id,
                dataType: 'json',
                cache: false
            });
        },
        getFavoritesStatus: function (sourceRequest) {
            return $.ajax({
                url: favoriteUrl + '/v1/sources',
                dataType: 'json',
                data: JSON.stringify(sourceRequest),
                type: 'post',
                cache: false
            });
        },
        getShareLink: function (sourceRequest) {
            return $.ajax({
                url: pk_api_host + '/v1/pks/' + pk_id + '/share_link',
                dataType: 'json',
                cache: false
            });
        },
        setAsFavorite: function (data) {
            return $.ajax({
                url: favoriteUrl + '/v1/favorites',
                dataType: 'json',
                data: JSON.stringify(data),
                type: 'post',
                cache: false
            });
        },
        cancelAsFavorite: function () {
            return $.ajax({
                url: favoriteUrl + '/v1/favorites/e-pk/' + pk_id,
                type: 'delete',
                cache: false
            });
        }
    };
    var viewModel = {
        sourceRequest: [{
            source_id: pk_id || "",
            source_type: 'e-pk'
        }],
        webLink: "",
        cmbLink: "",
        model: {
            isFavorite: false,
            isPKFinished: false,
            isFirstTime: false,
            isPKStarted: false,
            pkDetail: {
                id: pk_id || "",
                ruleDescription: "",//规则说明
                name: "",
                totalSessionNumber: 0 //用户已作答次数
            },
            exam: {
                id: "",
                startTime: "",
                endTime: "",
                chance: 0,
                answerTime: 0,//作答时长
                totalScore: 60,//总分
                description: "", //描述
                questionCount: 0, //PK题数
                enabled: true
            },
            userBestPK: {
                score: 100,
                costTime: 0,
                rank: 0,
                pkPoint: 0
            }
        },
        init: function (timer, timezone) {
            this.timer = timer;
            this.model = ko.mapping.fromJS(this.model);
            // ko.applyBindings(this, document.getElementById('pk_prepare'));
            if (pk_id) {
                store.getFavoritesStatus(this.sourceRequest).done($.proxy(function (data) {
                    this.model.isFavorite(data.items && data.items.length && data.items[0].is_fav || false);
                }, this));
                store.getShareLink().done($.proxy(function (data) {
                    this.webLink = data.web_link;
                    this.cmbLink = data.cmb_link
                }, this));
            }
            $.when(store.getPkDetail(), store.getPkUserInfo()).done($.proxy(function (pkDetails, pkUserInfos) {
                var pkDetail = pkDetails && pkDetails[0];
                var pkUserInfo = pkUserInfos && pkUserInfos[0];
                if (!pkDetail.user_exam_session) { //session为空时是第一次PK
                    this.model.isFirstTime(true);
                }
                this.model.pkDetail.ruleDescription(pkDetail.rule_description || "");
                this.model.pkDetail.totalSessionNumber(pkDetail.total_session_number || 0);
                this.model.pkDetail.name(pkDetail && pkDetail.pk && pkDetail.pk.name || "");
                this.model.exam.id(pkDetail && pkDetail.pk && pkDetail.pk.id || "");
                this.model.exam.startTime(pkDetail && pkDetail.pk && timezone(pkDetail.pk.start_time) || "");
                this.model.exam.endTime(pkDetail && pkDetail.pk && timezone(pkDetail.pk.end_time) || "");
                this.model.exam.chance(pkDetail && pkDetail.pk && pkDetail.pk.chance || 0);
                this.model.exam.enabled(pkDetail && pkDetail.pk && pkDetail.pk.enabled || 0);
                this.model.exam.answerTime(pkDetail && pkDetail.pk && (pkDetail.pk.answer_time) || "");
                this.model.exam.totalScore(pkDetail && pkDetail.pk && pkDetail.pk.total_score || 0);
                this.model.exam.description(pkDetail && pkDetail.pk && pkDetail.pk.description || "");
                this.model.userBestPK.score(pkUserInfo && pkUserInfo.best_pk_answer && pkUserInfo.best_pk_answer.user_exam_session && pkUserInfo.best_pk_answer.user_exam_session.score || 0);
                this.model.userBestPK.costTime(pkUserInfo && pkUserInfo.best_pk_answer && pkUserInfo.best_pk_answer.user_exam_session && pkUserInfo.best_pk_answer.user_exam_session.fix_cost_time || 0);
                this.model.userBestPK.rank(pkUserInfo && pkUserInfo.user_rank && pkUserInfo.user_rank.rank || 0);
                this.model.userBestPK.pkPoint(pkUserInfo && pkUserInfo.pk_point || 0);

                this.timer.ready().done($.proxy(this.onTimerReady, this));
            }, this));
        },
        onTimerReady: function () {
            // this.model = ko.mapping.fromJS(this.model);
            this.model.currentTime = ko.observable(this.timer.time()); // 毫秒
            this.model.exam.answerTime = this._toTimeString(this.model.exam.answerTime() * 1000);
            this.model.userBestPK.costTime = this._toTimeString(this.model.userBestPK.costTime() * 1000);
            this.model.exam.startTimeSpan = ko.computed(function () {
                return new Date(this.model.exam.startTime()).getTime();
            }, this);

            this.model.exam.endTimeSpan = ko.computed(function () {
                return new Date(this.model.exam.endTime()).getTime();
            }, this);

            this.model.isPKStarted = ko.computed(function () {
                return this.model.exam.startTimeSpan() < this.model.currentTime();
            }, this);

            this.model.isPKFinished = ko.computed(function () {
                return this.model.exam.endTimeSpan() < this.model.currentTime();
            }, this);

            this.model.showDayInBanner = ko.computed(function () {
                var bt = new Date(this.model.exam.endTime()).getTime();
                var ct = this.model.currentTime();
                var ot = bt - ct;
                if (ot > 0 && ot > 86400000) {
                    // 大于一天开始
                    return true;
                } else if (ot > 0 && ot < 86400000) {
                    // 小于一天开始
                    return false;
                } else {
                    // 开始已经开始
                    return false;
                }
            }, this);

            this.model.hasPKChance = ko.computed(function () {
                if (this.model.exam.chance() < 0) { //-1为不限次数
                    return true;
                } else {
                    return this.model.exam.chance() > this.model.pkDetail.totalSessionNumber();
                }
            }, this);

            this.model.canPK = ko.computed(function () {
                return this.model.isPKStarted() && !this.model.isPKFinished() && this.model.hasPKChance() && this.model.exam.enabled();
            }, this);

            this.model.favoriteText = ko.computed(function () {
                if (this.model.isFavorite()) {
                    return i18n.pkComponent.prepare.cancelFavorite;
                } else {
                    return i18n.pkComponent.prepare.setFavorite;
                }
            }, this);

            ko.applyBindings(this, document.getElementById('pk_prepare'));
            this.initTimer();
        },
        setFavoriteHandle: function () {
            var isFavorite = this.model.isFavorite();
            if (!isFavorite) {
                var data = {
                    source_request: {
                        source_id: pk_id || "",
                        source_type: 'e-pk'
                    },
                    title: this.model.pkDetail.name(),
                    web_link: this.webLink,
                    link: this.cmbLink,
                    text: "",
                };
                store.setAsFavorite(data).done($.proxy(function (data) {
                    this.model.isFavorite(true);
                }, this));
            } else {
                store.cancelAsFavorite().done($.proxy(function (data) {
                    this.model.isFavorite(false);
                }, this));
            }
        },
        initTimer: function () {
            if (this.model.canPK()) {
                this.timer.appendRepeateHandler('tick', $.proxy(this.onTimerElapsed, this), Number.MAX_VALUE, 400);
            }
        },
        getDateBeginLeft: function () {
            var st = new Date(this.model.exam.endTime()).getTime(),
                ct = new Date(this.model.currentTime()).getTime(),
                dt = st - ct;

            return Math.floor(dt / 86400000);
        },
        onTimerElapsed: function () {
            this.model.currentTime(this.timer.time());
            var timeText = this._toTimeString(this.model.exam.endTimeSpan() - this.timer.time());
            $(".time").html(timeText);
        },
        _toTimeString: function (span) {
            span = Math.ceil(parseInt((span / 1000) + ""));
            var h = parseInt((span / 3600) + "");
            var m = parseInt((span / 60) + "") % 60;
            var s = span % 60;

            return (h < 10 ? '0' + h : '' + h) + ":" + (m < 10 ? '0' + m : '' + m) + ":" + (s < 10 ? '0' + s : '' + s);
        }
    };
    $(function () {
        require.config({
            baseUrl: static_url + 'auxo/',
            paths: {
                "jstimer": "front/pk/js/common/jstimer",
                "swftimer": "front/pk/js/common/swftimer",
                "timer": "front/pk/js/common/timer",
                "timezone":"addins/time-zone-trans/v1.0.0/tz-trans"
            },
            shim: {
                "timer": {
                    deps: ["jstimer", "swftimer"]
                },
                "timezone":{}
            }
        });
        require(['timer','timezone'], function (_timer, timezone) {
            var timer = _timer.Common.TimerFactory.Singleton();
            viewModel.init(timer, timezone);
        });

    });
})(jQuery, window);
