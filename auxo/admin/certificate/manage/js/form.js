;
(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    // 如果是新增则ID为空
    var ID = GLOBAL['id'];

    // projectCcode
    var PROJECT_CODE = GLOBAL['projectCode'];

    // 静态站地址
    var STATIC_URL = GLOBAL['staticUrl'];

    // 图片存储地址
    var STORE_URL = GLOBAL['storeUrl'];

    // 选择证书分类命名空间
    var TREE = GLOBAL['tree'];

    var service = {
        /**
         * 查询单个证书
         * @param id
         * @returns {*}
         */
        getCertificate: function (id) {
            return $.ajax({
                url: '/' + PROJECT_CODE + '/certificates/' + id,
                type: 'GET',
                dataType: 'json'
            });
        }
    };

    var ViewModel = function () {
        this.model = {
            entity: {
                id: ID,
                name: '',
                issue_department: '',
                generate_type: 0,
                is_entity: 0,
                allow_print: 0,
                type_id: '',
                type_title: '',
                train_ids: [],
                train_vo: [],
                photo_id: '',
                photo_url: '',
                background_photo_id: '',
                background_photo_url: '',
                template_id: '',
                template_name: '',
                number_prefix: '',
                number_length: '',
                description: ''
            },
            trains: [],
            template_label: false,
            outData: ''
        };

        return this;
    };

    ViewModel.prototype = {

        constructor: ViewModel,

        initViewModel: function (element) {
            var that = this;
            this.model = koMapping.fromJS(this.model);
            this.initValidation();
            this.initSWFUpload();

            this.model.entity.is_entity.subscribe(function (value) {
                // 当没有实体证书时，下面“允许打印”默认为否，且不可编辑
                if (value == 0) {
                    that.model.entity.allow_print(0);
                }
            });

            // ID存在则为编辑
            if (ID) {
                this.getCertificate(ID);
            }
            ko.applyBindings(this, element);
            return this;
        },

        initValidation: function () {
            var entity = this.model.entity;

            ko.validation.init({
                insertMessages: false
            });

            entity.name.extend({
                required: {
                    params: true,
                    message: '请输入证书名称'
                },
                maxLength: {
                    params: 50,
                    message: '证书名称字数不能超过50个字符'
                },
                validation: {
                    async: true,
                    validator: function (val, params, callback) {
                        var options = {
                            url: '/' + PROJECT_CODE + '/certificates/valid',
                            type: 'POST',
                            global: false,
                            contentType: 'application/json',
                            data: JSON.stringify(master.utils.removeEmpty({
                                id: entity.id.peek(),
                                name: val
                            })),
                            success: callback
                        };

                        $.ajax(options);
                    },
                    message: '证书名称已存在'
                }
            }).extend({
                rateLimit: {
                    timeout: 600,
                    method: "notifyWhenChangesStop"
                }
            });
            entity.issue_department.extend({
                required: {
                    params: true,
                    message: '请输入发证单位'
                },
                maxLength: {
                    params: 50,
                    message: '发证单位字数不能超过50个字符'
                }
            });
            entity.type_title.extend({
                required: {
                    params: true,
                    message: '请选择证书分类(若无分类选择，请前往“证书分类”模块添加分类)'
                }
            });
            entity.photo_url.extend({
                required: {
                    params: true,
                    message: '请选择证书预览图片'
                }
            });
            // 编辑时不判断模版必填
            if (!ID) {
                entity.template_name.extend({
                    required: {
                        params: true,
                        message: '请选择模版'
                    }
                });
            } else {
                $('#templateRequired').remove();
            }
            if (!ID) {
                // 编辑时不允许修改的字段不做验证
                entity.number_prefix.extend({
                    required: {
                        params: true,
                        message: '请输入证书编码前缀'
                    },
                    maxLength: {
                        params: 6,
                        message: '最多允许6个字符'
                    },
                    validation: {
                        async: true,
                        validator: function (val, params, callback) {
                            var options = {
                                url: '/' + PROJECT_CODE + '/certificates/valid',
                                type: 'POST',
                                global: false,
                                contentType: 'application/json',
                                data: JSON.stringify(master.utils.removeEmpty({
                                    id: entity.id.peek(),
                                    number_prefix: val
                                })),
                                success: callback
                            };

                            $.ajax(options);
                        },
                        message: '证书编码前缀已存在'
                    }
                }).extend({
                    rateLimit: {
                        timeout: 600,
                        method: "notifyWhenChangesStop"
                    }
                });
                entity.number_length.extend({
                    required: {
                        params: true,
                        message: '请输入证书编号长度'
                    },
                    minLength: {
                        params: 1,
                        message: '至少1个字符'
                    },
                    maxLength: {
                        params: 2,
                        message: '最多允许2个字符'
                    },
                    min: {
                        params: 1,
                        message: '证书编号长度最少为1'
                    },
                    max: {
                        params: 20,
                        message: '证书编号长度最大为20'
                    },
                    digit: {
                        params: true,
                        message: '请输入正确的数字'
                    }
                });
            }
            entity.description.extend({
                maxLength: {
                    params: 2000,
                    message: '简介最多允许输入2000个字符'
                }
            });
        },

        initSWFUpload: function () {
            var that = this;

            // 预览图片上传
            new Upload('photoUploadBtn', STATIC_URL, STORE_URL, function (data) {
                that.model.entity.photo_id(data.id);
                that.model.entity.photo_url(data.absolute_url);
            });

            // 背景图片上传
            new Upload('backgroundUploadBtn', STATIC_URL, STORE_URL, function (data) {
                that.model.entity.background_photo_id(data.id);
                that.model.entity.background_photo_url(data.absolute_url);
            });
        },

        /**
         * 取证书对象
         * @param id
         */
        getCertificate: function (id) {
            var that = this;
            service.getCertificate(id).then(function (data) {

                // 填充证书分类标题
                if (!data.type_title) {
                    data.type_title = data.type_id;
                }

                // 取培训IDS
                var train_ids = [];
                $.each(data.trains, function (i, t) {
                    train_ids.push(t.id);
                });
                data.train_ids = train_ids;
                that.model.trains(data.trains);

                // 标记模版为已选择
                that.model.template_label(true);

                master.ko.fromJS(that.model.entity, data, false);
            });
        },
        /**
         * 新增/更新证书对象
         */
        saveOrUpdateCertificate: function () {
            var validationGroup = ko.validation.group(this.model.entity),
                that = this;
            if (validationGroup().length > 0) {
                validationGroup.showAllMessages();
                return;
            }
            var file = $("#template_file")[0],
                src = file.value || "",
                ext = (src.substring(src.indexOf(".") + 1) || "").toLowerCase();

            // 验证格式
            if (src && $.inArray(ext, ["html"]) == -1) {
                $.alert("只允许上传 .html 格式的文件!");
                return;
            }

            // 验证关联培训
            if (!this.model.trains().length) {
                $.alert("证书获取条件不能为空");
                return;
            } else {
                var ids = [],
                    trainVos = this.model.trains();
                $.each(trainVos, function (i, v) {
                    ids.push(v.id);
                });
                this.model.entity.train_ids(ids);
                this.model.entity.train_vo(window.encodeURI(JSON.stringify(trainVos)));
            }

            var data = koMapping.toJS(this.model.entity);

            data.context_id = window.context_id;

            $("body").cover();
            $.ajaxFileUpload({
                url: '/' + PROJECT_CODE + "/certificates" + (ID ? '/' + ID : ''),
                secureuri: false,
                fileElementId: 'template_file',
                dataType: 'json',
                data: data,
                success: function (response, status) {
                    if (status == 'success') {
                        if (response.code == 0) {
                            $.alert(ID ? '编辑成功' : '新增成功');
                            setTimeout(function () {
                                if (window.return_url)
                                    location.href = window.return_url + '&id=' + response.extra.id;
                                else
                                    location.href = '/' + PROJECT_CODE + '/certificate/manage/index';
                            }, 1500);
                        } else {
                            if (!ID) {
                                // 由于ajaxfileupload在每次上传时会创建file替换原来的文本域，所以每次都需要重新选择文件
                                // 重新提示上传模版
                                that.model.template_label(false);
                                that.model.entity.template_name("");
                            }
                            $.alert(response.message);
                        }
                    }
                    $("body").uncover();
                },
                error: function (data, status, e) {
                    $.alert("data: " + data + "\n" +
                        "status: " + status + "\n" +
                        "error: " + e);
                    if (!ID) {
                        that.model.template_label(false);
                        that.model.entity.template_name("");
                    }
                    $("body").uncover();
                }
            });
        },
        /**
         * 显示分类弹出框
         */
        showTypeModal: (function () {
            var hasInitialized = false;
            return function () {
                if (!hasInitialized) {
                    TREE.show('-1', '#tree', true);
                    hasInitialized = true;
                }
                $('#typeModal').modal('show');
            }
        }()),
        /**
         * 选择分类
         */
        selectType: function () {
            var node = TREE.node()[0],
                entity = this.model.entity;
            if (node.id == -1 || !node.id) {
                entity.type_id('');
                entity.type_title('');
            } else {
                entity.type_id(node.id);
                entity.type_title(node.title);
            }
            $('#typeModal').modal('hide');
        },
        /**
         * 显示培训选择弹出框
         */
        showTrainsModal: function () {
            $('#trainsModal').modal('show');
        },
        /**
         * 选择培训
         */
        selectTrains: function () {
            var outData = this.model.outData.peek();
            this.model.trains(outData || []);
            $('#trainsModal').modal('hide');
        },
        /**
         * 模版文件file域改变时事件
         */
        changeTemplateFile: function () {
            this.model.template_label(true);
            this.model.entity.template_name($('#template_file').val() || '1');
        }
    };

    $(function () {
        var viewModel = GLOBAL['viewModel'] = new ViewModel();
        viewModel.initViewModel(document.getElementById('boot'));
    });

}());