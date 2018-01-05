;(function ($, window) {
    'use strict';
    var _ = ko.utils;
    var store = {
        getPkDetail: function () {
            return $.ajax({
                url: window.self_host + '/v2/pk_details/' + window.pkId,
                dataType: 'json',
                cache: false
            });
        },
        getPkAnswer: function (data) {
            return $.ajax({
                url: window.self_host + '/v1/pk_answer/' + window.answerId + '/results',
                dataType: 'json',
                data: data,
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            pk: null,
            answer: null,
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('container'));
            setTimeout($.proxy(function () {
                this.getPkDetail();
                this.getPkAnswer();
            }, this), 2000)
        },
        getPkDetail: function () {
            var self = this;
            store.getPkDetail().done(function (res) {
                self.model.pk(res);
            })
        },
        getPkAnswer: function () {
            var self = this, user_latest_answer_time = '';
            if (window.userLatestAnswerTime) user_latest_answer_time = +new Date(Date.ajustTimeString(window.userLatestAnswerTime));
            store.getPkAnswer(user_latest_answer_time ? {user_latest_answer_time: user_latest_answer_time} : {}).done(function (res) {
                self.model.answer(res);
            })
        },
        formatStatusClass: function () {
            var STATUS_MAP = {
                '1': 'waiting',
                '2': 'sucess',
                '3': 'fail',
                '4': 'tie',
            };
            return STATUS_MAP[this.model.answer().status || '2']
        },
        formatDuration: function (time) {
            if (!time && time !== 0)return time;
            var hour = ~~(time / 60 / 60 );
            var minite = ~~((time - hour * 60 * 60 ) / 60 );
            var second = ~~((time - hour * 60 * 60 - minite * 60 ));
            return (hour < 10 ? '0' + hour : hour) + ':' + (minite < 10 ? '0' + minite : minite) + ':' + (second < 10 ? '0' + second : second);
        },
        hrefToPkSelect: function () {
            location.href = window.self_host + '/' + projectCode + '/pk/' + window.pkId + '/choose';
        },
        doAgain: function () {
            location.href = window.self_host + '/' + projectCode + '/pk/' + window.pkId + '/answer';
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
