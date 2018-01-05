;
(function () {

    var GLOBAL = (0, eval)('this');

    var PROJECT_CODE = GLOBAL['projectCode'];

    // 证书ID
    var CERTIFICATE_ID = GLOBAL['certificateId'];

    // 是否需要上传照片
    var NEED_PHOTO = GLOBAL['needPhoto'];

    // 是否实体证书
    var IS_ENTITY = GLOBAL['isEntity'];

    // 用户名
    var REAL_NAME = GLOBAL['realName'];

    // 身份证号
    var ID_CARD = GLOBAL['idCard'];

    // 手机号码
    var RECEIVER_PHOTO = GLOBAL['receiverPhone'];

    var service = {
        saveOrUpdateUserCertificate: function (data) {
            return $.ajax({
                url: selfUrl + '/' + PROJECT_CODE + '/usercertificatepost',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        }
    };

    var ViewModel = function () {

        this.model = {
            userCertificate: {
                // 用户证书寄送标识
                id: '',
                // 用户标识
                user_id: '',
                // 证书标识
                certificate_id: CERTIFICATE_ID,
                // 证书标识
                user_certificate_id: '',
                // 证书名称
                certificate_name: '',
                // 是否允许打印
                allow_print: '',
                // 寄送状态
                send_status: '',
                // 未寄送数量
                nosend: '',
                // 寄送中数量
                sending: '',
                // 已寄送数量
                sended: '',
                // 寄送时间
                send_time: '',
                // 寄送操作人标识
                send_operate_user_id: '',
                // 寄送操作人姓名
                send_operate_user_name: '',
                // 收件人姓名
                receiver_name: REAL_NAME,
                // 收件人手机号
                receiver_phone: RECEIVER_PHOTO,
                // 收件人地址
                receiver_address: '',
                // 快递单号
                express_number: '',
                // 快递名称
                express_name: '',
                // 备注
                remark: '',
                // 用户姓名
                real_name: REAL_NAME,
                // 身份证号
                id_card: ID_CARD,
                // 用户照片
                photo_id: '',
                photo_url: '',
                // 证书编号
                certificate_number: ''
            },
            address: {
                city: '',
                detail: ''
            }
        };
    };

    ViewModel.prototype = {
        constructor: ViewModel,

        initViewModel: function (element) {
            var that = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.userCertificate.receiver_address = ko.computed(function () {
                return (this.model.address.city() || '').replace(/\//g, '') + $.trim(this.model.address.detail());
            }, this);

            this.initValidator();
            ko.applyBindings(this, element);
            return this;
        },
        initValidator: function () {
            var entity = this.model.userCertificate,
                address = this.model.address;

            ko.validation.init({
                insertMessages: false,
                registerExtenders: true
            }, true);

            ko.validation.rules['idCard'] = {
                validator: function (val, validate) {
                    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
                    return val === null || val === "" || (validate && /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(val.toString()));
                },
                message: i18nHelper.getKeyValue('certificate.apply.inputIdNumber')  /*请输入正确的身份证号码*/
            };
            ko.validation.rules['mobile'] = {
                validator: function (val, validate) {
                    return val === null || val === "" || (validate && /^1[34578]\d{9}$/.test(val.toString()));
                },
                message: i18nHelper.getKeyValue('certificate.apply.inputPhoneNumber')/*'请输入正确的手机号码'*/
            };
            ko.validation.registerExtenders();


            entity.real_name.extend({
                required: {
                    params: true,
                    message: i18nHelper.getKeyValue('certificate.apply.inputName')  /*请输入姓名*/
                },
                maxLength: {
                    params: 20,
                    message: i18nHelper.getKeyValue('certificate.apply.nameLimit')/*'姓名字数不能超过20个字符'*/
                }
            });
            entity.id_card.extend({
                required: {
                    params: true,
                    message: i18nHelper.getKeyValue('certificate.apply.inputIDCard')/*'请输入身份证号'*/
                },
                idCard: true
            });
            if (NEED_PHOTO) {
                entity.photo_id.extend({
                    required: {
                        params: true,
                        message: i18nHelper.getKeyValue('certificate.apply.choosePhoto')/*'请选择照片'*/
                    }
                });
            }

            if (IS_ENTITY) {
                entity.receiver_name.extend({
                    required: {
                        params: true,
                        message: i18nHelper.getKeyValue('certificate.apply.inputConsignee')/*'请输入收货人'*/
                    },
                    maxLength: {
                        params: 30,
                        message: i18nHelper.getKeyValue('certificate.apply.receiverLimit')/*'收货人字数不能超过30个字符'*/
                    }
                });
                entity.receiver_phone.extend({
                    required: {
                        params: true,
                        message: i18nHelper.getKeyValue('certificate.apply.inputPhoneNum')/*'请输入手机号码'*/
                    },
                    mobile: true
                });
                address.city.extend({
                    required: {
                        params: true,
                        message: i18nHelper.getKeyValue('certificate.apply.choseRegion')  /*'请选择所在区域'*/
                    }
                });
                address.detail.extend({
                    required: {
                        params: true,
                        message: i18nHelper.getKeyValue('certificate.apply.inputDetailAddress')  /*'请输入详细地址'*/
                    },
                    maxLength: {
                        params: 150,
                        message: i18nHelper.getKeyValue('certificate.apply.addressLimit') /*'详细地址字数不能超过150个字符'*/
                    }
                });
            }

            return this;
        },
        tip: function (message) {
            var $dialog = $('#dialog');
            $dialog.show().find('.tip').text(message || '');
        },
        uploadPhoto: function (fileInput) {
            var that = this,
                file = $('#photoFile')[0],
                src = file.value || '',
                ext = (src.substring(src.indexOf('.') + 1) || '').toLowerCase(),
                acceptExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

            // 验证格式
            if (src && $.inArray(ext, acceptExt) == -1) {
                this.tip('只允许上传 [' + acceptExt.join(',') + '] 格式的文件!');
                return;
            }
            var loading = layer.load(0, {
                time: 1000 * 100
            });
            $.ajaxFileUpload({
                url : selfUrl + '/' + PROJECT_CODE + '/certificates/users/upload',
                secureuri: false,
                fileElementId : 'photoFile',
                dataType : 'json',
                success: function (response, status){
                    if (status == 'success') {
                        that.model.userCertificate.photo_id(response.id);
                        that.model.userCertificate.photo_url(that.escape(response.path));
                    }
                    layer.close(loading);
                },
                error: function (data, status, e){
                    layer.close(loading);
                }
            });
            return this;
        },
        escape: function (text) {
            if (text) {
                var div = document.createElement('div');
                div.innerHTML = text;
                text = div.innerText;
            }
            return text;
        },
        saveOrUpdate: function () {
            var that = this;
            $('#cityPicker').trigger('change');
            var validationCertificateGroup = ko.validation.group(this.model.userCertificate),
                validationAddressGroup = ko.validation.group(this.model.address),
                data = null,
                that = this;
            if (validationCertificateGroup().length > 0) {
                validationCertificateGroup.showAllMessages();
                return;
            }
            if (validationAddressGroup().length > 0) {
                validationAddressGroup.showAllMessages();
                return;
            }
            data = ko.mapping.toJS(this.model.userCertificate);
            service.saveOrUpdateUserCertificate(data).then(function () {
                location.assign(selfUrl + '/' + PROJECT_CODE + '/certificate/detail/' + CERTIFICATE_ID)
            }, function (result) {
                that.tip($.parseJSON(result.responseText).message);
            });
        }
    };

    $(function () {
        (function () {
            var loading = null;
            // ajax开始回调
            $(document).ajaxStart(function () {
                loading = layer.load(0, {
                    time: 1000 * 100
                });
            });
            // ajax结束回调
            $(document).ajaxComplete(function () {
                layer.close(loading);
            });
        }());
        GLOBAL['viewModel'] = new ViewModel().initViewModel($('#bootstrap')[0]);
    });

}());