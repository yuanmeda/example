;
(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    // 如果是新增则ID为空
    var ID = GLOBAL['id'];

    // projectCcode
    var PROJECT_CODE = GLOBAL['project_code'];

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
                url: certificate_srv_host + '/v1/certificates/' + id,
                type: 'GET',
                dataType: 'json'
            });
        },
        /**
         * 新建证书
         * @param id
         * @returns {*}
         */
        newCertificate: function (data) {
            return $.ajax({
                url: certificate_srv_host  + "/v1/certificates",
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data)
            });
        },
        /**
         * 编辑证书
         * @param id
         * @returns {*}
         */
        updateCertificate: function (data,id) {
            return $.ajax({
                url: certificate_srv_host + '/v1/certificates/' + id,
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(data)
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
                template_id: '',
                type_title: '',
                photo_id: '',
                enable: false,
                photo_url: '',
                background_photo_id: '',
                template_type: 1,
                background_photo_url: '',
                user_template_content: '',     //证书模板内容
                number_prefix: '',
                number_length: '',
                description: ''
            },
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
                            url: certificate_webpage_host + '/' + PROJECT_CODE + '/certificates/valid',
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
            entity.user_template_content.extend({
                required: {
                    params: true,
                    message: '请输入证书模板'
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
                                url: certificate_webpage_host + '/' + PROJECT_CODE + '/certificates/valid',
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

            var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            if(SCRIPT_REGEX.test(this.model.entity.user_template_content())) {//传入文档对象，获取整体内容
                this.model.entity.user_template_content(this.model.entity.user_template_content().replace(SCRIPT_REGEX, ' '));
            }

            var data = koMapping.toJS(this.model.entity);

            data.context_id = window.context_id;

            $("body").cover();
            if(!ID) {
                service.newCertificate(data).then(function () {
                    $.alert('新增成功');
                    setTimeout(function () {
                        if (window.return_url)
                            location.href = window.return_url + '?id=' + response.extra.id;
                        else
                            location.href = '/' + PROJECT_CODE + '/certificate/manage/index';
                    }, 1500);
                });
            } else {
                service.updateCertificate(data,ID).then(function () {
                    $.alert('编辑成功');
                    setTimeout(function () {
                        if (window.return_url)
                            location.href = window.return_url + '?id=' + response.extra.id;
                        else
                            location.href = '/' + PROJECT_CODE + '/certificate/manage/index';
                    }, 1500);
                });
            }
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
        }
    };

    $(function () {
        var viewModel = GLOBAL['viewModel'] = new ViewModel();
        viewModel.initViewModel(document.getElementById('boot'));
    });

}());/**
 * Created by Administrator on 2017.8.30.
 */
