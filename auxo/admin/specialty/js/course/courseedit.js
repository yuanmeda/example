;(function ($, window) {
    "use strict";
    var reg = /^\d+(\.\d{1,2})?$/;

    var store = {
        getCourse: function () {
            var url = '/' + projectCode + '/specialty/courses/' + courseId;
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                dataType: 'json'
            });
        },
        updateCourse: function (data) {
            var url = '/' + projectCode + '/specialty/courses/' + courseId;

            return $.ajax({
                url: url,
                data: JSON.stringify({
                    specialty_plan_id: specialtyId,
                    term_id: termId,
                    is_required: courseType,
                    score: data.score,
                    name: data.title,
                    summary: data.description,
                    user_suit: data.user_suit,
                    front_cover_object_id: data.pic_id
                }),
                type: 'PUT'
            });
        },
        createCourse: function (data) {
            var url = '/' + projectCode + '/specialty/courses';
            return $.ajax({
                url: url,
                data: JSON.stringify({
                    specialty_plan_id: specialtyId,
                    term_id: termId,
                    is_required: courseType,
                    score: data.score,
                    name: data.title,
                    summary: data.description,
                    user_suit: data.user_suit,
                    front_cover_object_id: data.pic_id
                }),
                cache: false,
                type: 'POST',
                dataType: 'json'
            });
        }
    };
    var viewModel = {
        model: {
            filter: {
                name: '',
                sort_type: 1
            },
            course: {
                train_id: specialtyId,
                description: '',
                title: '',
                pic_url: '',
                pic_id: '',
                user_suit: '',
                course_type: courseType,
                score: 0
            },
            readonly: status == 2,
            isEdit: status == 2
        },
        //页面初始化
        init: function () {
            $.validator.addMethod('score2', function (value) {
                return reg.test(value);
            });
            $.validator.addMethod('score1', function (value) {
                return value > 0;
            });

            this.model = ko.mapping.fromJS(this.model);
            this.model.readonly = ko.unwrap(this.model.readonly);
            this.model.rules = {
                rules: {
                    score: {
                        number: true,
                        max: 999999,
                        score1: 0,
                        score2: 2
                    }
                },
                messages: {
                    score: {
                        number: $.validator.format('请输入合法的数字'),
                        max: $.validator.format('最大不能超过{0}'),
                        score1: $.validator.format('请输入大于{0}的数字'),
                        score2: $.validator.format('小数点后{0}位')
                    }
                }
            };


            if (courseId) {
                viewModel.getCourseInfo()
            } else {
                this.koBind();
            }
        },
        koBind: function () {
            var $content = $('#js-content');
            ko.applyBindings(this, $content[0]);
            $content.show();
        },
        formatCourseObject: function (d) {
            return {
                description: d.summary,
                title: d.name,
                pic_url: d.front_cover_url,
                pic_id: d.front_cover_object_id,
                user_suit: d.user_suit,
                score: d.score
            };
        },
        getCourseInfo: function () {
            var t = this;
            var _course = this.model.course;
            store.getCourse().done(function (data) {
                if (data.project_id != projectId) {
                    t.model.readonly = true;
                }
                t.koBind();
                data = t.formatCourseObject(data);
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (ko.isObservable(_course[key])) {
                            _course[key](data[key]);
                        } else {
                            _course[key] = data[key];
                        }
                    }
                }
            })
        },
        updateCourseInfo: function (data, save) {
            store.updateCourse(data).done(function (data) {
                if (save) {
                    location.href = "/" + projectCode + "/specialty/" + specialtyId + "/coursedetail/" + courseId + "?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                } else {
                    location.href = '/' + projectCode + '/specialty/' + specialtyId + '/coursechapters/' + courseId + "?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                }
            });
        },
        _save: function (save) {
            var self = this;
            if ($('#validateForm').valid()) {
                var postData = ko.mapping.toJS(self.model.course);
                if (courseId) {
                    self.updateCourseInfo(postData, save);
                } else {
                    self.createUnitCourse(postData, save);
                }
            }
        },
        save: function () {
            this._save(true);
        },
        next: function () {
            this._save();
        },
        // toEdit: function () {
        //     location.href = '/' + projectCode + '/specialty/' + specialtyId + '/courseedit/' + courseId;
        // },
        createUnitCourse: function (data, save) {
            store.createCourse(data).done(function (data) {
                if (save) {
                    location.href = "/" + projectCode + "/specialty/" + specialtyId + "/coursedetail/" + data.id + "?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                } else {
                    location.href = '/' + projectCode + '/specialty/' + specialtyId + '/coursechapters/' + data.id + "?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);
