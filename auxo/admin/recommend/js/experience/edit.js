;(function ($) {
    var store = {
        save: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/v1/recommends/point_experiences',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        }
    };
    var viewModel = {
        model: {
            exp: {
                auth: '',
                type: 1,
                points: 0,
                experiences: 0,
                reward_description: '',
                reward_object: [], //接收人
                receive_object_type: '1',
                users: ''
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this._validator();
            this.model.exp.points.subscribe(function (nv) {
                if (nv) $('input[name="experiences"]').valid();
            }, this);
            ko.applyBindings(this, document.getElementById('expEdit'));
        },
        create: function () {
            if (!$("#expForm").valid())
                return;
            var data = ko.mapping.toJS(this.model.exp);
            data.users = $("#out").val();
            //自动去重
            var userArray = data.users.split(/[/,,/，\n]/);
            var receive_object = [];
            $.each(userArray, function (i, el) {
                var trimEL = $.trim(el);
                if (trimEL && $.inArray(trimEL, receive_object) === -1) receive_object.push(trimEL);
            });
            data.reward_object = receive_object.join(',');
            data.points = data.points ? data.points : '0';
            data.experiences = data.experiences ? data.experiences : '0';
            data.receive_object_type = undefined;
            data.users = undefined;

            store.save(data)
                .done(function (res) {
                    if (res.status) {
                        location.href = '/' + projectCode + '/recommend/experience';
                    } else {
                        var exp = '', point = '';
                        if (res.failed_exp) exp = '经验补齐失败的账号：' + res.failed_exp;
                        if (res.failed_points) point = '积分补齐失败的账号：' + res.failed_points;
                        if (exp || point)$.fn.dialog2.helpers.alert(exp + '<br/>' + point);
                        else $.fn.dialogs.helpers.alert('服务故障');
                    }

                });
        },
        //表单验证
        _validator: function () {
            var self = this;
            $.validator.addMethod("user_format", function (value, element) {
                var array = value.split(/[/,,/，\n]/);
                var newArray = [];
                $.each(array, function (i, v) {
                    if ($.trim(v)) newArray.push(v);
                });
                var reg = /.+@.+/;
                var result = true;
                $.each(newArray, function (i, v) {
                    result = reg.test(v) && result;
                });
                return result;
            }, "账号格式不对");
            $.validator.addMethod("users", function (value, element) {
                var array = value.split(/[/,,/，\n]/);
                var newArray = [];
                $.each(array, function (i, v) {
                    if ($.trim(v)) newArray.push(v);
                });
                return newArray.length <= 100;
            }, "用户账号不能超过100个");
            $.validator.addMethod('zero', function (value, element) {
                return parseInt(value) || parseInt(self.model.exp.points());
            }, '积分和经验均为0，请重新输入');

            //表单验证
            $('#expForm').validate({
                rules: {
                    auth: {
                        required: true
                    },
                    points: {
                        digits: true,
                        range: [0, 10000],
                        maxlength: 5
                    },
                    experiences: {
                        digits: true,
                        range: [0, 10000],
                        maxlength: 5,
                        zero: true
                    },
                    users: {
                        required: true,
                        users: '',
                        user_format: ''
                    },
                    content: {
                        maxlength: 100
                    }
                },
                messages: {
                    auth: {
                        required: '授权必填',
                        maxlength: '长度必须小于100字符'
                    },
                    users: {
                        required: "授予人员不可为空"
                    },
                    content: {
                        maxlength: $.validator.format("内容长度必须小于{0}字符")
                    },
                    points: {
                        digits: "积分为正整数",
                        maxlength: '积分应在0-10000之间',
                        range: "积分应在0-10000之间"
                    },
                    experiences: {
                        digits: "经验为正整数",
                        maxlength: '积分应在0-10000之间',
                        range: "经验应在0-10000之间"
                    }
                },
                onkeyup: function (element) {
                    $(element).valid()
                },
                onsubmit: true,
                errorElement: 'p',
                errorClass: 'help-inline',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
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
