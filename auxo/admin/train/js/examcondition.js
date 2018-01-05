(function ($) {

    var store = {
        getCourses: function (data) {
            var url = '/' + projectCode + '/trains/' + trainId + '/courses/search';
            return $.ajax({
                url: url,
                type: 'post',
                data: JSON.stringify(data),
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        },
        getTrainDetail: function () {
            var url = '/' + projectCode + '/trains/' + trainId + '/detail';
            return $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        },
        getTrainExam: function () {
            var url = '/' + projectCode + '/trains/' + trainId + '/exams/' + examId;
            return $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        },
        save: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId + '/exams/' + examId,
                dataType: 'json',
                type: 'PUT',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data)
            });
        }
    };

    var viewModel = {
        model: {
            reqCourses: 0,
            optCourses: [],
            reference_hour: {
                require_hour: 0,
                option_hour: 0
            },
            exam: null,
            require_hour: 0,
            option_hour: 0,
            enable: false,
            haveConstraints: false
        },
        _validator: function () {
            var self = this;
            jQuery.validator.addMethod("isMaxofminour", function (value, element) {
                var minHour = parseInt($(element).attr("minHour"));
                if (parseInt(value) > minHour) {
                    return false;
                }
                return true;
            }, "设置的学时需小于对应的上限学时");
            jQuery.validator.addMethod("isMinofZero", function (value, element) {
                if (value < 0) {
                    return false;
                }
                return true;
            }, "学时的设置需大于或等于0个学时");
            $("#examConditionForm").validate({
                errorElement: 'p',
                errorClass: 'help-block',
                highlight: function (label) {
                    $(label).closest('.input-append').addClass('error').addClass("errorColor").removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid').closest('.input-append').addClass('error').addClass('success').removeClass('errorColor');
                }
            });

        },

        init: function () {
            var classHour = 0, t = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this._validator();
            store.getCourses({course_type: 0, sort_type: 1, status: 1}).done(function (data) {
                if (data) {
                    viewModel.model.reqCourses(data);
                }
            });
            store.getCourses({course_type: 1, sort_type: 1, status: 1}).done(function (data) {
                if (data) {
                    viewModel.model.optCourses(data);
                }
            });
            store.getTrainDetail().done(function (data) {
                viewModel.model.reference_hour.require_hour(data.require_hour);
                viewModel.model.reference_hour.option_hour(data.option_hour);
            });
            store.getTrainExam().done(function (data) {
                viewModel.model.exam(data);
                if (data.exam_access_rule) {
                    viewModel.model.require_hour(data.exam_access_rule.require_hour);
                    viewModel.model.option_hour(data.exam_access_rule.option_hour);
                }
            });
        },
        saveThenPrev: function () {
            if (viewModel.model.exam().enable) {
                location.href = '/' + projectCode + "/train/" + trainId + "/exam/" + examId + "/edit?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                return;
            }
            viewModel.save('prev');
        },
        saveThenNext: function () {
            if (viewModel.model.exam().enable) {
                location.href = '/' + projectCode + "/train/" + trainId + "/exam/" + examId + "/paper_strategy?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                return;
            }
            viewModel.save('next');
        },
        save: function (step) {
            var require_hour = viewModel.model.require_hour();
            var option_hour = viewModel.model.option_hour();
            if (!$("#examConditionForm").valid())
                return;

            var arr = ko.mapping.toJS(this.model.reqCourses), cons = [], result = true,
                opt = ko.mapping.toJS(this.model.optCourses);

            if (isNaN(parseInt(require_hour)) || require_hour < 0) {
                $.fn.dialog2.helpers.alert("必修课程的学时有误");
                return;
            }
            if (isNaN(parseInt(option_hour)) || option_hour < 0) {
                $.fn.dialog2.helpers.alert("选修课程的学时有误");
                return;
            }
            if (option_hour > viewModel.model.reference_hour.option_hour()) {
                $.fn.dialog2.helpers.alert("选修课程的学时大于上限学时");
                return;
            }
            if (require_hour > viewModel.model.reference_hour.require_hour()) {
                $.fn.dialog2.helpers.alert("必修课程的学时大于上限学时");
                return;
            }

            var data = ko.mapping.toJS(this.model.exam);
            data.exam_access_rule = {
                require_hour: require_hour,
                option_hour: option_hour
            }
            store.save(data).done(function () {
                if (step == 'next') {
                    location.href = '/' + projectCode + "/train/" + trainId + "/exam/" + examId + "/paper_strategy?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                }
                if (step == 'prev') {
                    location.href = '/' + projectCode + "/train/" + trainId + "/exam/" + examId + "/edit?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                }
            });
        }
    };
    $(function () {
        ko.bindingHandlers.checkInput = koUtils.checkInput();
        viewModel.init();
    });

}(jQuery));