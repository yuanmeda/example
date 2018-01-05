(function ($) {
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        get: function () {
            var url = '/' + projectCode + '/v1/exams/' + examId;
            return $.ajax({
                url: url,
                type: 'get',
                error: this.errorCallback
            });
        },
        create: function (data) {
            var url = '/' + projectCode + '/v1/exams';
            return $.ajax({
                url: url,
                cache: false,
                type: 'post',
                data: JSON.stringify(data) || null,
                error: this.errorCallback,
                contentType: 'application/json;charset=utf8'
            });
        },
        update: function (data) {
            var url = '/' + projectCode + '/v1/exams/' + examId;
            return $.ajax({
                url: url,
                cache: false,
                type: 'put',
                data: JSON.stringify(data) || null,
                error: this.errorCallback,
                contentType: 'application/json;charset=utf8'
            });
        }
    };

    function ratingSettingList(rating_title, correct_rate) {
        ko.validation.rules["maxRate"] = {
            validator: function (val) {
                if (+val > 100) {
                    return false;
                } else {
                    return true;
                }
            },
            message: '最大值为100'
        };

        ko.validation.registerExtenders();
        this.rating_title = ko.observable(rating_title);
        this.correct_rate = ko.observable(correct_rate).extend({
            required: {
                params: true,
                message: '不可以为空'
            },
            maxRate: {},
            pattern: {
                params: "^([1-9][0-9]*)$",
                message: '请输入大于0的整数'
            }
        });
    }

    var viewModel = {
        trainData: null,
        model: {
            exam: {
                id: examId || null,
                title: "",
                sub_type: subType || 0,
                begin_time: "",
                end_time: "",
                duration: 3,
                passing_score: 60,
                description: "",
                exam_chance: 1,
                analysis_cond_status: "0",
                ac_begin_time: "",
                ac_end_time: "",
                /*enroll_type: "0",*/
                number_limit_type: "0",
                limit_number: 1,
                upload_allowed: "true",
                rating_setting_list: [],
                end_answer_time: "0",
                reminding_seconds: 0,
                ranking_able: false,
                reward_ranking_able: false,
                cover_url: '',
                cover: '',
                uploadInfo: {
                    path: '',
                    server_url: '',
                    service_id: '',
                    session: ''
                }
            }
        },
        returnStatus: true,
        init: function () {
            var _self = this;
            ko.validation.init({
                insertMessages: false,
                errorElementClass: 'input-error',
                errorMessageClass: 'error',
                decorateInputElement: true,
                grouping: {
                    deep: true,
                    live: true,
                    observable: true
                }
            }, true);
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            ko.applyBindings(this);

            /*培训跨域发送监听消息*/
            var z = window.parent;
            var n = new Nova.Notification(z, "*");
            var message_key = "train.exam." + (examId ? 'edit' : 'create');
            var message_data = {
                event_type: (examId ? 'edit' : 'create') + "_exam",
                //context_id: __context_id ? __context_id : "",
                data: {
                    sendData: true
                }
            };
            n.dispatchEvent("message:" + message_key, message_data);
            n.addEventListener(message_key, function (receiveData) {
                if (receiveData.event_type == (examId ? 'edit' : 'create') + '_exam') {
                    _self.trainData = receiveData.data;
                }
            });

            if (examId) {
                store.get()
                    .done(function (data) {
                        data.analysis_cond_status = data.analysis_cond_status + '';
                        data.ac_begin_time = '';
                        data.ac_end_time = '';
                        subType = data.sub_type = data.sub_type ? data.sub_type : 0;
                        data.upload_allowed = data.upload_allowed + "";
                        data.ranking_able = data.ranking_able;
                        data.reward_ranking_able = data.reward_ranking_able;
                        data.number_limit_type = data.number_limit_type + "";
                        data.limit_number = data.limit_number || 0;
                        data.rating_setting_list = data.rating_setting_list || [];
                        data.end_answer_time = data.end_answer_time == null ? "0" : data.end_answer_time / 3600;
                        data.reminding_seconds = data.reminding_seconds == null ? 0 : data.reminding_seconds / 60;

                        var dataRatingSettingList = data.rating_setting_list;
                        delete data.rating_setting_list;

                        var des = data.description;
                        data.description = '';
                        ko.mapping.fromJS(data, {}, this.model.exam);
                        if (des) {
                            if (!this.model.exam.uploadInfo.service_id()) {
                                this.model.exam.uploadInfo.service_id.subscribe(function (val) {
                                    if (val) {
                                        var str = des.replace(/\$\{cs_host}/gim, _self.model.exam.uploadInfo.server_url());
                                        _self.model.exam.description = ko.observable(str);
                                        window.desEditor.html(_self.model.exam.description());
                                    }
                                }, this);
                            } else {
                                this.model.exam.description = ko.observable(des.replace(/\$\{cs_host}/gim, this.model.exam.uploadInfo.server_url()));
                                window.desEditor.html(_self.model.exam.description());
                            }
                        }
                        if (data.duration != null) {
                            this.model.exam.duration(parseInt(data.duration / 60));
                        }
                        if (data.begin_time) {
                            this.model.exam.begin_time(Date.format(new Date(Date.formatTimezone(data.begin_time)), 'yyyy-MM-dd HH:mm'));
                        }
                        if (data.end_time) {
                            this.model.exam.end_time(Date.format(new Date(Date.formatTimezone(data.end_time)), 'yyyy-MM-dd HH:mm'));
                        }
                        if (data.analysis_cond_status == '3') {
                            var jsonData = JSON.parse(data.analysis_cond_data);
                            this.model.exam.ac_begin_time(Date.toJSTime(jsonData.begin_time));
                            this.model.exam.ac_end_time(Date.toJSTime(jsonData.end_time));
                        }
                        if (this.model.exam.sub_type() == 2) {
                            if (dataRatingSettingList) {
                                $.each(dataRatingSettingList, function (index, rating) {
                                    viewModel.model.exam.rating_setting_list.push(new ratingSettingList(rating.rating_title, rating.correct_rate + ''));
                                });
                            } else {
                                viewModel.model.exam.rating_setting_list.push(new ratingSettingList('一级', 70 + ''));
                                viewModel.model.exam.rating_setting_list.push(new ratingSettingList('二级', 80 + ''));
                                viewModel.model.exam.rating_setting_list.push(new ratingSettingList('三级', 90 + ''));
                            }

                        }

                    }.bind(this));
            } else {
                if (this.model.exam.sub_type() == 2) {
                    viewModel.model.exam.rating_setting_list.push(new ratingSettingList('一级', 70 + ''));
                    viewModel.model.exam.rating_setting_list.push(new ratingSettingList('二级', 80 + ''));
                    viewModel.model.exam.rating_setting_list.push(new ratingSettingList('三级', 90 + ''));

                }
            }
        },
        prepareData: function (callBack) {
            var _self = this;
            if (!_self.returnStatus) {
                return;
            }
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var data = ko.mapping.toJS(this.model.exam);
            data.sub_type = parseInt(data.sub_type);
            data.upload_allowed = data.upload_allowed == "true" ? true : false;
            data.ranking_able = data.ranking_able;// == "true" ? true : false;
            data.reward_ranking_able = data.reward_ranking_able;// == "true" ? true : false;
            data.end_answer_time = parseInt(data.end_answer_time) * 3600;
            data.reminding_seconds = data.reminding_seconds * 60;
            data.cover = data.cover;
            data.cover_url = data.cover_url;
            data.description = data.description.replace(new RegExp("" + this.model.exam.uploadInfo.server_url(), "gim"), '${cs_host}');
            /*data.enroll_type = parseInt(data.enroll_type);*/
            if (data.duration != null && data.duration != "") {
                data.duration = data.duration * 60;
            }
            if (data.begin_time) {
                data.begin_time = timeZoneTrans(data.begin_time);
            }
            if (data.end_time) {
                data.end_time = timeZoneTrans(data.end_time);
            }
            if (data.analysis_cond_status == '3') {
                data.ac_begin_time = Date.toJavaTime(data.ac_begin_time);
                data.ac_end_time = Date.toJavaTime(data.ac_end_time);
                data.analysis_cond_data = "{\"begin_time\":\"" + data.ac_begin_time + "\",\"end_time\":\"" + data.ac_end_time + "\"}";
            } else {
                data.analysis_cond_data = "";
            }
            if (data.sub_type == 2) {
                var tempRating = ko.mapping.toJS(this.model.exam.rating_setting_list);
                if (tempRating.length > 0) {
                    $.each(tempRating, function (index, rating) {
                        rating.correct_rate = +rating.correct_rate;
                    });
                    data.rating_setting_list = tempRating;
                }
                var tempData = {
                    title: data.title,
                    sub_type: data.sub_type,
                    rating_setting_list: data.rating_setting_list,
                    analysis_cond_status: 1,
                    duration: data.duration,
                    description: data.description.replace(new RegExp("" + this.model.exam.uploadInfo.server_url(), "gim"), '${cs_host}'),
                    end_answer_time: data.end_answer_time
                };
                data = tempData;
            }
            /*判断是否是业务课程*/
            if (typeof  __context_id != "undefined") {
                if (__context_id) {
                    data.custom_type = __custom_type;
                    data.context_id = __context_id;
                    data.custom_id = __custom_id;
                }
            }
            /*判断是否是培训下的考试*/
            if (_self.trainData && _self.trainData.context_id) {
                data.custom_id = _self.trainData.custom_id;
                data.custom_type = _self.trainData.custom_type;
                data.context_id = _self.trainData.context_id;
            }

            _self.returnStatus = false;
            if (examId) {
                store.update(data)
                    .done($.proxy(function (returnData) {
                        callBack && callBack();
                    }, this))
                    .always(function () {
                        _self.returnStatus = true;
                    })

            } else {
                delete data.id;
                store.create(data)
                    .done($.proxy(function (returnData) {
                        examId = returnData.id;
                        callBack && callBack();
                        _self.returnStatus = true;
                    }, this))
                    .always(function () {
                        _self.returnStatus = true;
                    })
            }
        },
        cancel: function () {
            var returnUrl = this.getQueryStringByName('return_url');
            var trainOrNot = viewModel.trainData && viewModel.trainData.cancelUrl;
            if (__parent_return_url || trainOrNot) {
                /*跨域发送消息*/
                var z = window.parent;
                var n = new Nova.Notification(z, "*");
                var message_key = trainOrNot ? "train.exam." + (examId ? 'edit' : 'create') : "open_course.course.exam.create_edit_exam";
                var message_data = {
                    event_type: trainOrNot ? (examId ? 'edit' : 'create') + '_exam' : "create_edit_exam",
                    //context_id: __context_id ? __context_id : "",
                    data: {
                        returnUrl: trainOrNot ? viewModel.trainData.cancelUrl : __parent_return_url + "?__mac=" + Nova.getMacToB64(__parent_return_url),
                        examId: examId
                    }
                }
                n.dispatchEvent("message:" + message_key, message_data);
                return;
            }
            var hasParams = returnUrl.indexOf('?') >= 0,
                hasExamId = returnUrl.indexOf('exam_id') >= 0;
            if (returnUrl) {
                if (!hasExamId)
                    returnUrl = returnUrl + (hasParams ? '&exam_id=' + ko.unwrap(examId) : '?exam_id=' + ko.unwrap(examId));
                location.href = returnUrl + '&__mac=' + Nova.getMacToB64(returnUrl);
            } else {
                location.href = '/' + projectCode + "/exam";
            }
        },
        saveThenBack: function () {
            this.prepareData($.proxy(function () {
                if (viewModel.trainData && viewModel.trainData.cancelUrl) {
                    this.cancel();
                }
                var returnUrl = this.getQueryStringByName('return_url');
                var hasParams = returnUrl.indexOf('?') >= 0,
                    hasExamId = returnUrl.indexOf('exam_id') >= 0;
                if (returnUrl) {
                    if (!hasExamId)
                        returnUrl = returnUrl + (hasParams ? '&exam_id=' + ko.unwrap(examId) : '?exam_id=' + ko.unwrap(examId));
                    location.href = returnUrl + '&__mac=' + Nova.getMacToB64(returnUrl);
                }
                else {
                    location.href = '/' + projectCode + "/exam";
                }
            }, this));

        },
        saveThenNext: function () {
            this.prepareData($.proxy(function () {
                var returnUrl = this.getQueryStringByName('return_url'), nextUrl;
                var trainOrNot = viewModel.trainData && viewModel.trainData.saveThenNextUrl;
                if (__parent_next_url || trainOrNot) {
                    if (__parent_next_url) {
                        var hasExamId = __parent_next_url.substr(7).indexOf('//');
                        if (hasExamId == -1) {
                            nextUrl = __parent_next_url + "?__mac=" + Nova.getMacToB64(__parent_next_url);
                        } else {
                            var nextArr = __parent_next_url.split('//');
                            nextUrl = nextArr[0] + "//" + nextArr[1] + '/' + examId + '/' + nextArr[2] + "?__mac=" + Nova.getMacToB64(nextArr[0] + "//" + nextArr[1] + '/' + examId + '/' + nextArr[2]);
                        }
                    } else {
                        var hasExamId = viewModel.trainData.saveThenNextUrl.indexOf('//');
                        if (hasExamId != -1) {
                            var nextArr = viewModel.trainData.saveThenNextUrl.split('//');
                            viewModel.trainData.saveThenNextUrl = nextArr[0] + '/' + examId + '/' + nextArr[1];
                        }
                    }
                    /*跨域发送消息*/
                    var z = window.parent;
                    var n = new Nova.Notification(z, "*");
                    var message_key = trainOrNot ? "train.exam." + (examId ? 'edit' : 'create') : "open_course.course.exam.paperList";
                    var message_data = {
                        event_type: trainOrNot ? (examId ? 'edit' : 'create') + '_exam' : "paperList",
                        //context_id: __context_id ? __context_id : "",
                        data: {
                            returnUrl: trainOrNot ? viewModel.trainData.saveThenNextUrl : nextUrl,
                            examId: examId
                        }
                    }
                    n.dispatchEvent("message:" + message_key, message_data);
                    return;
                }
                var hasParams = returnUrl.indexOf('?') >= 0,
                    hasExamId = returnUrl.indexOf('exam_id') >= 0;
                if (returnUrl) {
                    if (!hasExamId)
                        returnUrl = returnUrl + (hasParams ? '&exam_id=' + ko.unwrap(examId) : '?exam_id=' + ko.unwrap(examId));
                    location.href = '/' + projectCode + "/exam/paper?exam_id=" + examId + "&sub_type=" + subType + "&return_url=" + encodeURIComponent(returnUrl);
                }
                else {
                    location.href = '/' + projectCode + "/exam/paper?exam_id=" + examId + "&sub_type=" + subType;
                }
            }, this));
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery));