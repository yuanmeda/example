(function ($, window) {
    'use strict';
    var store = {
        query: {
            queryCourse: function () {
                var url = '/v1/business_courses/' + courseId;

                return $.ajax({
                    url: url,
                    cache: false
                });
            },
            queryChapter: function () {
                var url = '/v1/business_courses/' + courseId + '/catalogs';

                return $.ajax({
                    url: url,
                    cache: false
                })
            },
            queryResources: function (lesson_id) {
                var url = '/v1/business_courses/' + courseId + '/lessons/' + lesson_id + '/resources';

                return $.ajax({
                    url: url,
                    cache: false
                })
            }
        },
        experience: {
            create: function (data) {
                var url = learning_business_course_url + '/v1/business_courses/' + courseId + '/experience_configs';

                return $.ajax({
                    url: url,
                    cache: false,
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify({
                        business_course_id: courseId,
                        maker_course_id: data.maker_course_id,
                        lesson_id: data.lesson_id,
                        target_type: data.target_type,
                        target_id: data.target_id,
                        exp_type: data.exp_type,
                        exp_length: data.exp_length
                    }),
                    contentType: 'application/json;charset=utf8'
                });
            },
            remove: function (config_id) {
                var url = learning_business_course_url + '/v1/business_course_experience_configs/' + config_id;

                return $.ajax({
                    url: url,
                    cache: false,
                    type: 'DELETE'
                });
            },
            update: function (data) {
                var url = learning_business_course_url + '/v1/business_course_experience_configs/' + data.id;

                return $.ajax({
                    url: url,
                    cache: false,
                    type: 'PUT',
                    dataType: 'json',
                    data: JSON.stringify({
                        id: data.id,
                        business_course_id: courseId,
                        maker_course_id: data.maker_course_id,
                        lesson_id: data.lesson_id,
                        target_type: data.target_type,
                        target_id: data.target_id,
                        exp_type: data.exp_type,
                        exp_length: data.exp_length
                    }),
                    contentType: 'application/json;charset=utf8'
                });
            },
            //获取上传cs用的session
            getUploadSession: function () {
                var url = '/upload_sessions';
                return $.ajax({
                    url: url,
                    dataType: 'json',
                    cache: false
                });
            }
        }
    };
    var viewModel = {
        model: {
            course: {
                id: '', //课程id
                unit_id: 0, //元课程id
                title: '', //课程名称
                pic_id: null, //课程封面id
                pic_url: null, //课程logo地址
                video_id: 0, //课程介绍视频
                description: '', //课程描述
                user_suit: '', //课程适用人群
                course_status: 1, //课程上下线状态 0-下线 1-上线。
                video_count: 0,
                document_count: 0,
                exam_count: 0,
                exercise_count: 0
            },
            chapter: {
                id: "",
                title: "",
                sort_num: 0,
                resource_flag: false,
                children: [],
                resource_list: [],
                experience_config: null
            },
            resource: {
                exp_config: null,
                extra_data: {},
                id: null,
                type: null,
                name: '',
                status: 0,
                resource_data: {
                    duration: 0,
                    page_count: 0
                }
            },
            setting: {
                duration: null,
                type: ''
            }
        },
        cur_lesson: null,
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, LACALDATA.contentBind);

            this.initValidate();
            this.baseInfo();
            this.initEvent();
        },
        initValidate: function () {
            ko.validation.configuration.insertMessages = true;
            ko.validation.configuration.errorElementClass = 'errors';
            ko.validation.configuration.errorMessageClass = 'error';

            ko.validation.rules['num'] = {
                validator: $.proxy(function (value) {
                    if (value) {
                        return value > 0;
                    } else {
                        return true;
                    }
                }, this),
                message: '必须大于0'
            };

            ko.validation.rules['max'] = {
                validator: $.proxy(function (value) {
                    if (this.model.resource.type() == 0 || this.model.resource.type() == 101) {
                        var isOver = value <= this.model.resource.resource_data.duration();
                        if (!isOver)
                            ko.validation.rules['max'].message = '体验时长必须小于等于视频总时长';

                        return isOver;
                    } else if (this.model.resource.type() == 1 || this.model.resource.type() == 102) {
                        var isOver = value <= this.model.resource.resource_data.page_count();
                        if (!isOver)
                            ko.validation.rules['max'].message = '体验页数必须小于等于文档总页数';

                        return isOver;
                    }
                }, this),
                message: '超过允许的范围'
            };

            //注册
            ko.validation.registerExtenders();
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });

            this.model.setting.duration.extend({
                required: {
                    params: true,
                    message: '请输入整数'
                },
                maxLength: {
                    params: 10,
                    message: '最多{0}位数字'
                },
                minLength: {
                    params: 1,
                    message: '最少{0}位数字'
                },
                digit: {
                    params: true,
                    message: '请输入整数'
                },
                min: {
                    params: 1,
                    message: '请输入大于1的整数'
                },
                max: this.model.setting.duration()
            }, this);
        },
        initEvent: function () {
            $('.pm-section, .pm-chapter').live('click', function (evt) {
                $(evt.currentTarget).hasClass('fold') ? $(evt.currentTarget).removeClass('fold').addClass('unfold') : $(evt.currentTarget).removeClass('unfold').addClass('fold');
                evt.stopPropagation()
            });
            $('.pm-resource').live('click', function (evt) {
                evt.stopPropagation();
            });
            $(".pm-resource").live("hover", function () {
                $(".res-ctrl-list").hide();
            });
            $(".pm-chapter-hd").live("hover", function () {
                $(".res-ctrl-list").hide();
            });
            $(".pm-section-hd").live("hover", function () {
                $(".res-ctrl-list").hide();
            });
            $('.res-ctrl').live('click', function (evt) {
                evt.stopPropagation();

                var child = $(this).children();
                child.css("margin", "-1px 0 0 -106px");
                var windowHeight = $(window).height() + $(window).scrollTop();
                var offset = $(this).offset();
                if (windowHeight - offset.top < 200) {
                    var cw = child.eq(0).innerHeight();
                    child.css("marginTop", -cw + 23);
                }
                var isHidden = child.is(":hidden");
                if (isHidden)
                    child.show();
                else
                    child.hide();
            });
        },
        baseInfo: function () {
            if (courseId) {
                $.when(store.query.queryCourse(), store.query.queryChapter(), store.experience.getUploadSession()).done($.proxy(function (base_data, chapter_data, resData) {
                    base_data = base_data[0];
                    chapter_data = chapter_data[0];

                    if (!base_data.pic_url) {
                        base_data.pic_url = defaultImage;
                    }

                    var model = ko.mapping.toJS(this.model);
                    base_data.description = base_data.description ? base_data.description.replace(/\n/g, '<br/>').replace(/\$\{cs_host}/gim, resData[0].server_url) : '';
                    model.course = base_data;

                    this.initResourceList(chapter_data);
                    model.chapter = chapter_data;

                    ko.mapping.fromJS(model, this.model);
                    $(document).trigger('showContent');
                }, this));
            }
        },
        initResourceList(data) {
            if (data.lessons && data.lessons.length) {
                for (var i = 0; i < data.lessons.length; i++) {
                    data.lessons[i]['resource_list'] = [];
                    data.lessons[i]['hasQuery'] = false;
                }
            }
            if (data.children && data.children.length) {
                for (var i = 0; i < data.children.length; i++) {
                    this.initResourceList(data.children[i]);
                }
            }
        },
        durationFormat: function (duration) {
            duration = Math.ceil(parseInt(duration));
            var h = parseInt((duration / 3600) + "");
            var m = parseInt((duration / 60) + "") % 60;
            var s = duration % 60;

            return (h < 10 ? '0' + h : '' + h) + ":" + (m < 10 ? '0' + m : '' + m) + ":" + (s < 10 ? '0' + s : '' + s);
        },
        showModal: function (data, lesson) {
            this.cur_lesson = lesson;
            var exp_config = ko.unwrap(data.exp_config);
            ko.mapping.fromJS(ko.mapping.toJS(data), {}, this.model.resource);

            if (exp_config != null) {
                this.model.setting.duration(ko.unwrap(exp_config.exp_length));
                this.model.setting.type('PUT');
            } else {
                this.model.setting.duration("");
                this.model.setting.type('POST');
            }

            $('#settingmodal').modal('show');
        },
        save: function () {
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                return;
            }

            if (this.model.setting.type() == 'POST') {
                store.experience.create({
                    "maker_course_id": this.model.course.maker_course_id(),
                    "lesson_id": this.model.resource.lesson_id(),
                    "target_type": this.model.resource.type(),
                    "target_id": this.model.resource.id(),
                    "exp_type": 1,
                    "exp_length": this.model.setting.duration()
                }).done($.proxy(function () {
                    this.getResources(this.cur_lesson);
                    $('#settingmodal').modal('hide');
                }, this));
            } else if (this.model.setting.type() == 'PUT') {
                store.experience.update({
                    "maker_course_id": this.model.course.maker_course_id(),
                    "id": this.model.resource.exp_config().id(),
                    "lesson_id": this.model.resource.lesson_id(),
                    "target_type": this.model.resource.type(),
                    "target_id": this.model.resource.id(),
                    "exp_type": 1,
                    "exp_length": this.model.setting.duration()
                }).done($.proxy(function () {
                    this.getResources(this.cur_lesson);
                    $('#settingmodal').modal('hide');
                }, this));
            }
        },
        del: function (experience_config_id, lesson) {
            store.experience.remove(experience_config_id).done($.proxy(function () {
                this.getResources(lesson);
            }, this));
        },
        getResources: function (item) {
            if (item) {
                var data = ko.mapping.toJS(item);
                if (data.id) {
                    store.query.queryResources(data.id).done(function (res) {
                        for (var i = 0; i < res.length; i++) {
                            res[i].lesson_id = data.id
                            var exp_config = res[i].extra_data && res[i].extra_data.exp_config
                            if (exp_config && exp_config.lesson_id === data.id) {
                                res[i].exp_config = exp_config;
                            } else {
                                res[i].exp_config = null;
                            }
                        }
                        item.resource_list(res);
                        item.hasQuery(true);
                    })
                }
            }
        },
        onClickLesson: function (item) {
            if (!item.hasQuery()) {
                viewModel.getResources(item);
            }
        }
    };

    viewModel.init();
})(jQuery, window);