;
(function ($) {
    var store = {
        getList: function (search) {
            var url = '/' + projectCode + '/v1/recommends/faq';
            return commonJS._ajaxHandler(url, search);
        },
        del: function (id) {
            var url = '/' + projectCode + '/v1/recommends/faq/' + id;
            return commonJS._ajaxHandler(url, null, 'DELETE');
        },
        update: function (id, data) {
            var url = '/' + projectCode + '/v1/recommends/faq/' + id;
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'PUT');
        },
        create: function (data) {
            var url = '/' + projectCode + '/v1/recommends/faq';
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'POST');
        },
        questionMove: function (id, sort_number) {
            var url = '/' + projectCode + '/v1/recommends/faq/' + id + '/move?sort_number=' + sort_number;
            return commonJS._ajaxHandler(url, null, 'PUT');
        }
    };
    var viewModel = {
        model: {
            search: {
                page: 0,
                size: 1000,
                question_name: '',
                question_type: '',
                custom_type: ''
            },
            list: {
                items: [],
                count: 0
            },
            question: {
                id: '',
                question_name: '',
                question_answer: 'auxo-recommend',
                custom_type: '',
                question_type: 0
            },
            channel: [
                {value: 'auxo-recommend', key: '精品推荐'},
                {value: 'auxo-all', key: 'COMMON'},
                {value: 'auxo-open-course', key: '公开课'},
                {value: 'auxo-exam-center', key: '测评中心'},
                {value: 'auxo-train', key: '培训认证'},
                {value: 'auxo-specialty', key: '专业课'}
            ],
            channelObj: {
                'auxo-all': 'COMMON',
                'auxo-recommend': '精品推荐',
                'auxo-open-course': '公开课',
                'auxo-exam-center': '测评中心',
                'auxo-train': '培训认证',
                'auxo-specialty': '专业课'
            },
            editorImgUrl: ''
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this._getList();
            this.initKindEditor();
            this._editor();
            this.validator();
            this.bindSWFUpload();
            ko.applyBindings(this, document.getElementById('faqList'));
        },
        _getList: function () {
            $("#drag").dragsort("destroy");
            var self = this;
            var search = ko.mapping.toJS(self.model.search);
            search.question_name = $.trim(search.question_name);
            store.getList(search)
                .done(function (data) {
                    self.model.list.items(data.items);
                    self.model.list.count(data.count);
                    self.drag();
                });
        },
        search: function () {
            this.model.search.page(0);
            this._getList();
        },

        del: function ($data) {
            var me = this;
            $.fn.dialog2.helpers.confirm("删除后将不展示此问题，是否确认删除", {
                "confirm": function () {
                    store.del($data)
                        .done(function () {
                            me.model.search.page(0);
                            me._getList();
                        });
                },
                buttonLabelYes: '是',
                buttonLabelNo: '否'
            });

        },
        edit: function ($data) {
            var form = $('#questionForm'), question = this.model.question;
            form.validate().resetForm();
            form.find('.error').removeClass('error');
            form.find('.success').removeClass('success');
            if (!$data.id) {
                $data = {
                    id: '',
                    question_name: '',
                    question_answer: '',
                    custom_type: 'auxo-recommend',
                    question_type: '1'
                }
            }
            question.id($data.id);
            question.question_name($data.question_name);
            question.question_answer($data.question_answer);
            question.custom_type($data.custom_type);
            question.question_type($data.question_type);
            this.desEditor.html($data.question_answer);
            $('#questionModal').modal('show');
        },
        save: function () {
            if (!$('#questionForm').valid()) return;
            var data = ko.mapping.toJS(this.model.question),
                that = this;
            if (data.question_answer === '' || this.desEditor.count("text") > 1000) {
                $.fn.dialog2.helpers.alert('回答内容不能为空且最多1000字');
                return false;
            }
            if (data.id) {
                store.update(data.id, data).then(function () {
                    $('#questionModal').modal('hide');
                    that.model.search.page(0);
                    that._getList();
                });
            } else {
                store.create(data).then(function () {
                    $('#questionModal').modal('hide');
                    that.model.search.page(0);
                    that._getList();
                });
            }
        },
        cancel: function(){
            $('#questionModal').modal('hide');
            $('#editoruploadform').modal('hide');
        },
        //富文本编辑器
        _editor: function () {
            this.desEditor = KindEditor.create('#question_answer', {
                filterMode: false,
                allowImageUpload: false,
                allowFileManager: false,
                themesPath: staticUrl + 'addins/kindeditor/v4.1.2/themes/',
                langPath: staticUrl + 'addins/kindeditor/v4.1.2/lang/',
                pluginsPath: staticUrl + 'addins/kindeditor/v4.1.2/plugins/',
                width: '600px',
                height: '300px',
                resizeType: 0,
                items: [
                    'bold', 'italic', 'underline', '|', 'insertorderedlist','insertunorderedlist', '|', 'attachImage', 'link', 'unlink','|', 'removeformat','fullscreen'],
                afterChange: function () {
                    if (!this.desEditor) {
                        return;
                    }
                    if (this.desEditor.count("text") == 0) {
                        this.model.question.question_answer('');
                    } else {
                        this.model.question.question_answer(this.desEditor.html());
                    }
                }.bind(this)
            });
        },

        initKindEditor: function () {
            var self = this, name = 'attachImage';
            KindEditor.plugin('attachImage', function (K) {
                this.clickToolbar(name, function () {
                    $('#editoruploadform').modal('show');
                    self.model.editorImgUrl('');
                });
            });
        },
        imgUpload: function () {
            this.desEditor.exec('insertimage', this.model.editorImgUrl(), '', 0, 0, 0, '');
            this.model.editorImgUrl('');
            $('#editoruploadform').modal('hide');
        },
        bindSWFUpload: function () {
            //上传(该组件存在跨域问题flash_url与upload_url参数必须保证在同个域名下)
            if (typeof this.swfu != 'undefined' || this.swfu != null)
                return;
            this.swfu = new SWFUpload({
                // Backend Settings
                upload_url: storeUrl,

                // File Upload Settings
                file_size_limit: "20MB",
                file_types: "*.jpg;*.gif;*.jpeg;*.png;*.bmp;*.svg",
                file_types_description: "Web Image Files",
                file_upload_limit: 0,

                file_queue_error_handler: fileQueueError,
                file_dialog_complete_handler: fileDialogComplete,
                upload_progress_handler: uploadProgress,
                upload_error_handler: uploadError,
                upload_success_handler: $.proxy(this.uploadSuccess, this),
                upload_complete_handler: uploadComplete,

                // Button Settings
                button_placeholder_id: "spanButtonPlaceholder",
                button_width: 85,
                button_height: 20,
                button_text: '<span class="button">选择图片</span>',
                button_text_style: '.button { font-family: Microsoft YaHei,Arial,sans-serif; font-size: 14px; line-height:1.5;text-align: center;}',
                button_text_top_padding: 0,
                button_text_left_padding: 0,
                button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                button_cursor: SWFUpload.CURSOR.HAND,

                // Flash Settings
                flash_url: staticUrl + "addins/swfupload/v2.5.0/flash/swfupload.swf",

                // Debug Settings
                debug: false
            });
        },
        uploadSuccess: function (file, serverData) {
            var serverdata = JSON.parse(serverData);
            if (serverData[0]) {
                this.model.editorImgUrl(serverdata[0].absolute_url);
            }
        },
        //拖拉组件初始化
        drag: function () {
            var _self = this;
            $("#drag").dragsort({
                dragSelector: "tr",
                dragBetween: true,
                scrollContainer: '#content',
                dragEnd: function () {
                    var question_id = this.attr("id");
                    var sort_number = this.attr("sort_number");
                    $("#drag").find("tr").each(function (index, element) {
                        if (element.id == question_id) {
                            var target_element = $(element).next();
                            if (target_element.length !== 0) {
                                var target_sort_number = target_element.attr("sort_number");
                                if (parseInt(sort_number) > parseInt(target_sort_number)) {
                                    sort_number = $(element).prev().attr("sort_number");
                                } else {
                                    sort_number = $(element).next().attr("sort_number");
                                }
                            } else {
                                sort_number = $(element).prev().attr("sort_number");
                            }
                        }
                    });
                    var param = {
                        id: question_id,
                        sort_number: parseInt(sort_number)
                    };
                    $("#drag").dragsort("destroy");
                    store.questionMove(question_id, param.sort_number).done(function (data) {
                        _self._getList();
                    });
                }

            });
        },
        validator: function () {
            $.validator.addMethod("char", function (value, element) {
                var pattern = /^[a-zA-Z\d_]+$/;
                var txt = value;
                return pattern.test(txt);
            }, "只能包含数字字母下划线");
            $('#questionForm').validate({
                errorElement: 'p',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                rules: {
                    question_name: {
                        required: true,
                        maxlength: 1000
                    },
                    question_answer: {
                        required: true,
                        maxlength: 1000
                    }
                },
                messages: {
                    question_name: {
                        required: '必填',
                        maxlength: $.validator.format('长度必须小于{0}字符')
                    },
                    question_answer: {
                        required: '必填',
                        maxlength: $.validator.format('长度必须小于{0}字符')
                    }
                },

                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid');
                    if (label.closest('.control-group').find('p').length != label.closest('.control-group').find('p.valid').length)
                        return;
                    label.closest('.control-group').addClass('success');
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
