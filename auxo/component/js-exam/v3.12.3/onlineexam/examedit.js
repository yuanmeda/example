(function (w, $) {
    'use strict';
    var store = {
        //获取上传cs用的session
        getUploadSession: function () {
            var url = '/' + projectCode + '/exams/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        }
    };

    function Model(params) {
        this.model = params.exam;
        this.show = ko.observable(false);

        this._init();
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
    };

    Model.prototype = {
        _init: function () {
            /**
             * 初始化
             */
            $('#beginTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                autoclose: true,
                showAnim: 'slideDown'
            });
            $('#endTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                autoclose: true,
                showAnim: 'slideDown'
            });
            $('#acBeginTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                autoclose: true,
                showAnim: 'slideDown'
            });
            $('#acEndTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                autoclose: true,
                showAnim: 'slideDown'
            });
            this._initUpload($.proxy(this._uploadComplete, this), $.proxy(this._uploadError, this));
            this._validateInit();
            this._bindingsExtend();
            this._initUploadInfo();
        },
        _initUploadInfo: function () {
            return store.getUploadSession()
                .done($.proxy(function (resData) {
                    this.model.uploadInfo.path(resData.path || "");
                    this.model.uploadInfo.server_url(resData.server_url || "");
                    this.model.uploadInfo.session(resData.session || "");
                    this._editor();
                    this.model.uploadInfo.service_id(resData.service_id || "");
                }, this));
        },
        /**
         * 上传初始化
         * @param  {function} uc 上传成功回调
         * @param  {function} ue 上传失败回调
         * @return {object}    上传插件对象
         */
        _initUpload: function (uc, ue) {
            var _self = this,
                _swf = new SWFImageUpload({
                    flashUrl: staticUrl + '/auxo/addins/swfimageupload/v1.0.0/swfimageupload.swf',
                    width: 1024,
                    height: 1200,
                    htmlId: 'J_UploadImg',
                    pSize: '600|400|360|240|270|180',
                    uploadUrl: escape(storeUrl),
                    imgUrl: this.model.cover_url() || '',
                    showCancel: false,
                    limit: 1,
                    upload_complete: uc,
                    upload_error: ue
                });
            return _swf;
        },
        /**
         * 上传成功回调
         * @param  {object} data 成功回调数据
         * @return {null}      null
         */
        _uploadComplete: function (data) {
            var _self = this;
            if (!data.Code) {
                // var _imgData = data.shift();
                this.model.cover(data.store_object_id);
                this.model.cover_url(data.absolute_url);
                this.show(!this.show());
            } else {
                Utils.alertTip(data.Message, {
                    title: '警告',
                    icon: 7
                });
            }
        },
        /**
         * 上传失败回调
         * @param  {int} code 上传错误码
         * @return {null}      null
         */
        _uploadError: function (code) {
            var _msg;
            switch (code) {
                case 120:
                    _msg = '上传文件的格式不对，请重新上传jpg、gif、png格式图片';
                    break;
                case 110:
                    _msg = '上传文件超过规定大小';
                    break;
                default:
                    _msg = '上传失败，请稍后再试';
                    break;
            }
            Utils.alertTip(_msg);
        },
        /**
         * 编辑-上传页切换
         * @return {null} null
         */
        _toggle: function () {
            // if(this.readOnly){
            //     return;
            // }else{
            this.show(!this.show());
            $('#hiddenTool').css('display', 'block');
            // }
        },
        set_default_cover: function () {
            this.model.cover(window.default_cover_id);
            this.model.cover_url(window.default_cover_url);
        },
        formatCoverUrl: function () {
            if (/default/.test(this.model.cover_url()) || (ko.unwrap(this.model.id) && !ko.unwrap(this.model.cover_url))) {
                return window.default_cover_url;
            }
            return this.model.cover_url() ? this.model.cover_url() + '!m300x200.jpg' : ''
        },
        //富文本编辑器
        _editor: function () {
            window.desEditor = KindEditor.create('#description', {
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: false,
                resizeType: 0,
                imageUploadServer: this.model.uploadInfo.server_url(),
                imageUploadSession: this.model.uploadInfo.session(),
                imageUploadPath: this.model.uploadInfo.path(),
                staticUrl: staticUrl,
                items: [
                    'source', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link', 'imageswf'
                ],
                afterChange: function () {
                    if (!window.desEditor) {
                        return;
                    }
                    if (window.desEditor.count("text") == 0) {
                        this.model.description('');
                    } else {
                        this.model.description(window.desEditor.html());
                    }
                }.bind(this)
            });
        },
        //添加级别
        addLevel: function () {
            var _self = this,
                index = _self.model.rating_setting_list().length;
            if (index > 9) {
                $.fn.dialog2.helpers.alert('最多为十级');
                return;
            }
            _self.model.rating_setting_list.push(
                new ratingSettingList(_self._getChineseNumber(index) + '级', '60')
            );
        },
        //删除级别
        delLevel: function (index) {
            var _self = this;
            _self.model.rating_setting_list.splice(index, 1);
        },
        _getChineseNumber: function (num) {
            num = parseInt(num, 10);
            if (isNaN(num)) {
                return 0;
            }
            var cnNum = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
            if (num > 10) {
                return;
            }
            return cnNum[num];
        },
        clearEndTime: function (ele) {
            var _self = this;
            //console.log(ele);
            this.model.end_time('');
            // $(ele).siblings('input').datetimepicker('reset');
        },
        _validateInit: function () {
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

            ko.validation.rules['endTimeRules'] = {
                validator: function (obj, params) {
                    if (!obj)
                        return true;
                    var beginTime = params;
                    var endTime = obj;
                    beginTime = beginTime.replace(/-/g, "/");
                    endTime = endTime.replace(/-/g, "/");
                    if (new Date(beginTime).getTime() >= new Date(endTime).getTime()) {
                        return false;
                    } else {
                        return true;
                    }
                }.bind(this),
                message: '结束时间不能早于开始时间'
            };
            ko.validation.rules['isScript'] = {
                validator: function (obj) {
                    var re = /<script.*?>.*?<\/script>/ig;
                    return !re.test(obj);
                },
                message: '考试介绍中包含危险信息'
            };
            ko.validation.rules['ratingSettingList'] = {
                validator: function (ratingSettingList) {
                    var result = true;
                    var ratingSettingList = ko.mapping.toJS(ratingSettingList);
                    if (ratingSettingList.length > 1) {
                        $.each(ratingSettingList, function (index, ratingSetting) {
                            if (index > 0) {
                                var lastRatingSetting = ratingSettingList[index - 1];
                                if (+lastRatingSetting.correct_rate >= +ratingSetting.correct_rate) {
                                    result = false;
                                }
                            }
                        })
                    }
                    return result;
                },
                message: '闯关结果分级需递增设置'
            };
            //注册
            ko.validation.registerExtenders();
        },
        _bindingsExtend: function () {
            var exam = this.model;
            exam.title.extend({
                required: {
                    params: true,
                    message: '考试名称不可为空'
                },
                maxLength: {
                    params: 50,
                    message: '考试名称最多{0}字符'
                }
                // pattern: {
                //     params: "^[a-zA-Z0-9 _\u4e00-\u9fa5()（）.-]*$",
                //     message: '不可含有非法字符'
                // }
            });
            exam.begin_time.extend({
                required: {
                    value: true,
                    message: '开始时间不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                }
            });
            exam.end_time.extend({
                endTimeRules: {
                    params: exam.begin_time,
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2 && exam.begin_time();
                    }, this)
                }
            });
            exam.ac_begin_time.extend({
                required: {
                    value: true,
                    message: '开始时间不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.analysis_cond_status() == '3';
                    }, this)
                },
                endTimeRules: {
                    params: exam.begin_time,
                    message: '开始时间不能早于考试开始时间',
                    onlyIf: $.proxy(function () {
                        return this.model.analysis_cond_status() == '3' && exam.begin_time() != '';
                    }, this)
                }
            });
            exam.ac_end_time.extend({
                required: {
                    value: true,
                    message: '结束时间不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.analysis_cond_status() == '3';
                    }, this)
                },
                endTimeRules: {
                    params: exam.ac_begin_time,
                    onlyIf: $.proxy(function () {
                        return this.model.analysis_cond_status() == '3' && exam.ac_begin_time() != '';
                    }, this)
                }
            });
            exam.duration.extend({
                required: {
                    value: true,
                    message: '考试时长不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() == 2;
                    }, this)
                },
                maxLength: {
                    params: 7,
                    message: '最大长度为{0}'
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '考试时长格式有误，请重新输入'
                }
            });
            exam.passing_score.extend({
                required: {
                    value: true,
                    message: '及格线不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                maxLength: {
                    params: 9,
                    message: '最大长度为{0}',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '及格线格式有误，请重新输入',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                }
            });
            exam.exam_chance.extend({
                required: {
                    value: true,
                    message: '考试机会不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                maxLength: {
                    params: 9,
                    message: '最大长度为{0}',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '考试机会格式有误，请重新输入',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                }
            });
            exam.limit_number.extend({
                required: {
                    value: true,
                    message: '考试机会不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.number_limit_type() == '1' || this.model.number_limit_type() == '2';
                    }, this)
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '考试机会格式有误，请重新输入',
                    onlyIf: $.proxy(function () {
                        return this.model.number_limit_type() == '1' || this.model.number_limit_type() == '2';
                    }, this)
                }
            });
            exam.end_answer_time.extend({
                required: {
                    value: true,
                    message: '可挑战时间不能为空',
                },
                pattern: {
                    params: "^(0|[1-9][0-9]*)$",
                    message: '格式有误，请重新输入',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                min: { params: 0, message: "请输入不小于0的整数" },
                max: { params: 100, message: "请输入不大于100的正整数" },
            });
            exam.reminding_seconds.extend({
                required: {
                    value: true,
                    message: '开考提醒不能为空'
                },
                pattern: {
                    params: "^(0|[1-9][0-9]*)$",
                    message: '格式有误，请重新输入',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                min: { params: 0, message: "请输入不小于0的整数" },
                max: { params: 1440, message: "请输入不大于1440的正整数" }
            });
            exam.description.extend({
                maxLength: {
                    params: 4000,
                    message: '最大长度不能超过{0}'
                },
                isScript: {}
            });
            exam.rating_setting_list.extend({
                ratingSettingList: {}
            });

        }
    };
    ko.components.register('x-examedit', {
        /**
         * 组件viewModel类
         *
         * @class
         * @param params 组件viewModel实例化时的参数 studentList：可选列表，selectStudentList：已选列表
         */
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        /**
         * 组件模板
         */
        template: '<div></div>'
    })
})(window, jQuery);