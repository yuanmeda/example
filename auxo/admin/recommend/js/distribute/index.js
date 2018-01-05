;
(function ($, window) {
    var store = {
        create: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/recommends/configs',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        }
    };
    var viewModel = {
        model: {
            channelList: [{key: 'webPage', value: 'webPage'}, {key: 'webFront', value: 'webFront'}],
            fileList: [{
                key: 'system.properties',
                value: 'system.properties'
            }/*,{key: 'application.properties', value: 'application.properties'}*/],
            content: {
                channel: 'webPage',
                file_name: 'system.properties',
                key: 'static.version',
                value: $.format.date(new Date(),'yyyyMMddHHmmss')
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.validator();
            ko.applyBindings(this, document.getElementById('courseList'));
        },
        create: function () {
            if (!$('#distributeForm').valid()) return;
            $.fn.dialog2.helpers.confirm("您确认要保存吗？", {
                confirm: $.proxy(function () {
                    var data = ko.mapping.toJS(this.model.content);
                    store.create(data).done(function () {
                        $.fn.dialog2.helpers.alert('保存成功！');
                    });
                }, this)
            });
        },
        reset: function () {
            this.model.content.channel('webPage');
            this.model.content.value('');
        },
        validator: function () {
            $('#distributeForm').validate({
                rules: {
                    key: {
                        required: true
                    },
                    value: {
                        required: true
                    }
                },
                messages: {
                    key: {
                        required: '必填'
                    },
                    value: {
                        required: '必填'
                    }
                },
                errorElement: 'p',
                errorClass: 'help-inline',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);
