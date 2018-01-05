/*!
 * 报名信息
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //获取表单配置 
        getEnrollForm: function () {
            var url = serviceDomain + '/v1/learning_units/' + unitId + '/enroll_forms';
            return $.ajax({
                url: url,
                type: 'get',
                cache: false
            });
        },
        //获取用户最近一次报名信息
        getLatestEnroll: function () {
            var url = window.self_host + '/v1/user/latest_enrollments?unit_id=' + unitId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //查询用户报名表单
        getUserEnrollDetail: function (user_enroll_id) {
            var url = serviceDomain + '/v1/user/enrollments/' + user_enroll_id + '/enroll_forms';
            return $.ajax({
                url: url,
                type: 'get',
                cache: false
            });
        },
        //获取报名配置(GET)
        getEnrollInfo: function () {
            var url = serviceDomain + '/v1/learning_units/' + unitId + '/enrolls';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        }
    };
    var validFormat = function (item) {
        this.name = item.name;
        this.input_type = item.input_type;
        this.tips = item.tips;
        this.required = item.required;
        this.code = item.code;
        this.extra = item.extra || null;
        this.answer = ko.observable(item.answer)
    };
    var viewModel = {
        model: {
            forms: [],
            user_enroll_id: '',
            enroll_form_type: 0,
            show_page: false

        },
        info: ko.observable(null),
        type: ko.observable('detail'),
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko监听数据            
            document.title = i18nHelper.getKeyValue('enrollComponent.form.myEnrollTitle');
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            //获取用户最近一次报名信息
            this._getLatestEnroll();
        },
        //获取用户最近一次报名信息
        _getLatestEnroll: function () {
            var _self = this;
            store.getLatestEnroll().done(function (data) {
                if (data) {
                    _self.model.user_enroll_id(data.id);
                    _self._getEnrollInfo();
                } else {
                    _self._selfAlert(i18nHelper.getKeyValue('enrollComponent.form.userNoEnroll'));

                }
            })
        },
        _getEnrollInfo: function () {
            var _self = this;
            return store.getEnrollInfo().done(function (data) {
                if (data.enroll_form_type) {
                    _self.initEnrollForm(_self.model.user_enroll_id());
                } else {
                    _self._selfAlert(i18nHelper.getKeyValue('enrollComponent.form.noSetForm'));
                }
            })
        },
        _selfAlert: function (text, icon, url) {
            $.fn.udialog.alert(text, {
                width: 550,
                icon: icon || '',
                title: i18nHelper.getKeyValue('enrollComponent.form.resultTitle'),
                dialogClass: 'sys-alert udialog enroll-udialog',
                buttons: [{
                    text: i18nHelper.getKeyValue('enrollComponent.common.confirm'),
                    click: function () {
                        if (url) {
                            window.location.href = url;
                        } else {
                            $(this).udialog("hide");
                        }
                    },
                    'class': 'ui-btn-confirm'
                }]
            });
        },
        initEnrollForm: function (dataid) {
            var vm = this;
            $.when(store.getEnrollForm(), store.getUserEnrollDetail(dataid))
                .done(function (formLists, details) {
                    vm.model.show_page(true);
                    var formList = formLists[0].settings;
                    var answers = details[0].settings;
                    var settingFiles = details[0].setting_files || [];
                    $.each(formList, function (index, form) {
                        switch (form.input_type) {
                            case 'date':
                                form.answer = answers[form.code] ? answers[form.code].split('T')[0] : "";
                                break;
                            case 'picture':
                            case 'attachment':
                                var uuids = answers[form.code] || [];
                                form.answer = [];
                                if (uuids.length > 0) {
                                    $.each(uuids, function (index, uuid) {
                                        var id = uuid.split(':')[1];
                                        $.each(settingFiles, function (fileIndex, file) {
                                            if (file.id == id) {
                                                form.answer.push({
                                                    id: file.id,
                                                    source_file_name: file.source_file_name,
                                                    source: file.source,
                                                    size: file.size,
                                                    url: file.urls[0]
                                                })
                                            }
                                        });
                                    });
                                }
                                break;
                            default:
                                form.answer = "" + answers[form.code] ? answers[form.code] : "";
                        }
                        vm.model.forms.push(new validFormat(form));
                    })

                });
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();
})(jQuery, window);
