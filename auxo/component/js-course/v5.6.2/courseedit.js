/**
 * @file 课程编辑  jQuery、knockoutjs、bootstrap部分样式等
 * @author gqz
 */
(function (w, $) {
    var store = {
        //获取上传cs用的session
        getUploadSession: function () {
            var url = '/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        }
    };

    function Model(params) {
        this.model = params.course;
        this.maxlength = params.maxlength || 100;
        this.show = ko.observable(false);
        this.wordcount = ko.computed(function () {
            if (params.course.summary()) {
                return this.maxlength - params.course.summary().length;
            } else {
                return this.maxlength;
            }
        }, this);
        this.readOnly = params.readOnly || false;
        this.model.summary.subscribe(function (val) {
            var _maxLen = this.maxlength;
            this.model.summary(val && val.length > _maxLen ? val.substr(0, _maxLen) : val);
        }, this);
        this.validRules = $.extend({}, Model.validRules, params.rules || {});
        this._initUpload($.proxy(this._uploadComplete, this), $.proxy(this._uploadError, this));
        this._validator();
        this._initUploadInfo();
        this._bindingsExtend();

    }

    /**
     * 验证默认规则
     * @return {null} null
     */
    Model.validRules = {
        rules: {
            title: {
                required: true,
                maxlength: 50,
                minlength: 2
            },
            userSuit: {
                required: false,
                maxlength: 100
            }
        },
        onkeyup: function (element) {
            $(element).valid();
        },
        messages: {
            title: {
                required: '请输入课程名称',
                minlength: $.validator.format('课程名称长度不能小于{0}字符'),
                maxlength: $.validator.format('课程名称不能多于{0}个字')
            },
            userSuit: {
                maxlength: $.validator.format('课程介绍不能多于{0}个字')
            }
        },
        errorPlacement: function (erorr, element) {
            erorr.appendTo(element.parent());
        },
        errorElement: 'p',
        errorClass: 'help-inline',
        highlight: function (label) {
            $(label).closest('.c-group').addClass('error').removeClass('success');
        },
        success: function (label) {
            label.addClass('valid').closest('.c-group').removeClass('error').addClass('success');
        }
    };
    Model.prototype = {
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
        //富文本编辑器
        _editor: function () {
            window.desEditor = KindEditor.create('#introduction', {
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: true,
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
                        this.model.introduction('');
                    } else {
                        this.model.introduction(window.desEditor.html());
                    }
                }.bind(this)
            });
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
                    imgUrl: this.model.front_cover_url() || '',
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
                this.model.front_cover_object_id(data.store_object_id);
                this.model.front_cover_url(data.absolute_url);
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
         * 验证规则
         * @return {[type]} [summary]
         */
        _validator: function () {
            $('#validateForm').validate(this.validRules);
        },
        /**
         * 编辑-上传页切换
         * @return {null} null
         */
        _toggle: function () {
            if (this.readOnly) {
                return;
            } else {
                this.show(!this.show());
            }
        },
        set_default_cover: function () {
            this.model.front_cover_object_id(window.default_cover_id);
            this.model.front_cover_url(window.default_cover_url);
        },
        formatCoverUrl: function () {
            if (/default/.test(this.model.front_cover_url()) || (ko.unwrap(this.model.id) && !ko.unwrap(this.model.front_cover_url))) {
                return window.default_cover_url;
            }
            return this.model.front_cover_url() ? this.model.front_cover_url() + '!m300x200.jpg' : ''
        },
        /*Ko验证*/
        _bindingsExtend: function () {
            var course = this.model;
            course.introduction.extend({
                maxLength: {
                    params: 4000,
                    message: '最大长度不能超过{0}'
                }
            });
        }
    };
    ko.components.register('x-courseedit', {
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