;
(function ($, ko, global) {

    var service = {
        /**
         * 项目学员相关统计
         * @returns {*}
         */
        getTotalCount: function () {
            return $.ajax({
                url: '/v1/big_statistics/projects/total_count',
                type: 'GET'
            });
        },
        getOnlineCount: function () {
            return $.ajax({
                url: '/v1/big_statistics/projects/online_count',
                type: 'GET'
            });
        }
    };

    function ViewModel() {
        this.model = {
            title: global.moduleConfig.studyingVo.viewName || '学员学习总学时',
            userStat: {
                total_study_hour: 0,            // 学习总学时
                total_study_user: 0,            // 总用户数
                study_user: 0                  // 参与学习

            },
            onlineStat: {
                online_user_count: 0,           //当前在线人数
                history_high_count: 0           //历史最高
            },
            // 学时动画
            totalStudyHour: [
                {cur: 0, animate: true, isShow: false},
                {cur: 0, animate: true, isShow: false},
                {cur: 0, animate: true, isShow: false},
                {cur: 0, animate: true, isShow: false},
                {cur: 0, animate: true, isShow: false},
                {cur: 0, animate: true, isShow: false},
                {cur: 0, animate: true, isShow: false},
                {cur: 0, animate: true, isShow: false}
            ],
            // 总显示学时位数([5, n + 1, 8])
            showHourCount: 8
        };
    }

    ViewModel.prototype = {
        constructor: ViewModel,
        initViewModel: function (el) {
            this.model = ko.mapping.fromJS(this.model);
            $.each(this.model.totalStudyHour.peek(), function (i, v) {
                v = ko.mapping.fromJS(v);
            });
            this.update();
            ko.applyBindings(this, el);
        },
        update: function () {
            var that = this;
            var intervalTime = 12 * 60 * 60 * 1000;

            function autoUpdate() {
                setTimeout(function () {
                    that.getTotalCount(function (studyHour) {
                        autoUpdate();
                    });
                }, intervalTime);
            }

            this.getTotalCount(function (studyHour) {
                that.calHourFigures(studyHour);
                autoUpdate();
            });
        },
        /**
         * 计算学时位数
         * @param studyHour
         */
        calHourFigures: function (studyHour) {
            var minHourCount = 5;
            var maxHourCount = this.model.totalStudyHour.peek().length;
            var showHourCount = Math.max(minHourCount, Math.min(maxHourCount, ("0" + studyHour).length));
            var totalStudyHour = this.model.totalStudyHour.peek();
            for (var i = maxHourCount - 1, min = maxHourCount - showHourCount; i >= min; i--) {
                totalStudyHour[i].isShow(true);
            }
            this.model.showHourCount(showHourCount);
        },
        /**
         * 取项目学员相关统计
         * @param fn
         */
        getTotalCount: function (fn) {
            var that = this;
            service.getTotalCount().then(function (data) {
                // 随机数，方便测试，开发时使用
                //data.total_study_hour = Math.floor(Math.random() * 100000);

                that.formatHour(data.total_study_hour, that.model.totalStudyHour());
                global.utils.fromJS(that.model.userStat, data);
                if (fn) {
                    fn(data.total_study_hour);
                }
            });
            service.getOnlineCount().then(function (data) {
                //data.history_high_count = Math.floor(Math.random() * 100000);
                global.utils.fromJS(that.model.onlineStat, data);
            });
        },
        /**
         * 格式化学习总学时
         * @param value
         * @param hour
         */
        formatHour: function (value, hour) {
            var l = this.model.totalStudyHour.peek().length,
                length = Math.max(l - (value + "").length, 0),
                hasChanged = false;
            value = (+value || 0).toFixed(0);
            while (length--) {
                value = "0" + value;
            }
            for (var i = 0; i < l; i++) {
                hour[i].animate(true);
                if (+value[i] < hour[i].cur.peek()) {
                    hour[i].cur(+value[i] + 10);
                    hasChanged = true;
                } else {
                    hour[i].cur(+value[i]);
                }
            }
            if (hasChanged) {
                (function (hour) {
                    setTimeout(function () {
                        for (var i = 0, l = hour.length; i < l; i++) {
                            if (hour[i].cur.peek() > 9) {
                                hour[i].animate(false);
                                hour[i].cur(hour[i].cur.peek() - 10);
                            }
                        }
                    }, 1500);
                }(hour));
            }
        }
    };

    global.ready(function () {
        new ViewModel().initViewModel($('.md-hour')[0]);
    });

}(jQuery, window.ko, window.global || (window.global = {})));