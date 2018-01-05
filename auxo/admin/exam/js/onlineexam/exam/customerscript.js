void function () {
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
            var url = '/' + projectCode + '/v1/exams/' + examId + '/script';
            return $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        },
        update: function (data) {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/script';
            return $.ajax({
                url: url,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        },
        /**
         * 执行脚本
         */
        testScript: function (data) {
            var url = '/' + projectCode + '/v1/m/other/eval';
            return $.ajax({
                url: url,
                type: 'post',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        }
    };
    var viewModel = {
        choice: {
            status: ko.observable("0")
        },
        model: {
            answers: [],
            costSeconds: 0,
            resultUrl: '',
            scriptText: '',
            codeScript: ''
        },
        init: function () {
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            ko.applyBindings(this);
            this.validator();
            store.get()
                .done(function (data) {
                    if (data) {
                        ko.mapping.fromJS(data, {}, this.model);
                        this.choice.status(this.model.resultUrl() ? '1' : '0');
                        if (this.model.resultUrl()) {
                            $('#describeDetail').attr("readonly","readonly");
                        } else {
                            $('#describeUrl').attr("readonly","readonly");
                        }
                    }
                }.bind(this));
            /*判断哪个单选按钮被选中*/
            this.choice.status.subscribe(function (newValue) {
                if (newValue == '0') {
                    viewModel.model.resultUrl('');
                    $('#describeDetail').removeAttr('readonly');
                    $('#describeUrl').attr("readonly","readonly");
                    $('#describeDetail').focus();
                } else {
                    viewModel.model.scriptText('');
                    $('#describeDetail').attr("readonly","readonly");
                    $('#describeUrl').removeAttr('readonly');
                    $('#describeUrl').focus();
                }
            });
        },
        tryParseJSON: function (jsonString) {
            try {
                var o = JSON.parse(jsonString);
                if (o && typeof o === "object" && o !== null) {
                    return o;
                }
            } catch (e) {
            }
            return false;
        },
        testScript: function (element, obj) {
            var testAnswers = $.trim($('#testAnswers').val()), resultCode='';
            if (testAnswers.length < 1) {
                $.fn.dialog2.helpers.alert('用户试卷答案不可以为空');
                return;
            }

            var testAnswersChange = this.tryParseJSON(testAnswers);
            if (!testAnswersChange) {
                $.fn.dialog2.helpers.alert('用户试卷答案不符合规则,请遵循参考答案格式');
                return;
            } else {
                var requestData = {
                    answers: testAnswersChange,
                    costSeconds: this.model.costSeconds(),
                    scriptText: this.model.codeScript(),
                    resultCode: resultCode
                }

                if (obj.describe == "结果描述") {
                    store.testScript(requestData)
                        .done(function(data){
                            requestData.resultCode = data.resultText;
                            requestData.scriptText = viewModel.model.scriptText();
                            store.testScript(requestData)
                                .done(function(data){
                                    $("#testResult").text(data.resultText?data.resultText:'');
                                })
                        })
                } else {
                    store.testScript(requestData)
                        .done(function(data){
                            $("#testResult").text(data.resultText?data.resultText:'');
                        })
                }
            }
        },
        saveData: function (callBack) {
            var newData = ko.mapping.toJS(this.model);
            delete newData.costSeconds;
            store.update(newData)
                .done(function () {
                    callBack && callBack();
                    if (!callBack) {
                        $.fn.dialog2.helpers.alert('保存成功');
                    }
                });
        },
        cancel: function () {
            location.href = '/' + projectCode + "/exam";
        },

        saveThenBack: function () {
            if (!$("#edit").valid()) {
                return;
            }
            this.saveData(function () {
                location.href = '/' + projectCode + "/exam";
            });

        },
        save: function () {
            if (!$("#edit").valid()) {
                return;
            }
            this.saveData();
        },
        validator: function () {
            var self = this;
            $.validator.addMethod("helpurl", function(value, element) {
                return $.trim(value) === "" || this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            }, "您输入的网址格式不正确");
            $("#edit").validate({
                rules: {
                    scriptText: {
                        maxlength: 50000
                    },
                    codeScript: {
                        required: true,
                        maxlength: 50000
                    },
                    resultUrl: {
                        //required: true,
                        helpurl:''
                        //maxlength: 50
                    }
                },
                messages: {
                    scriptText: {
                        maxlength:"长度不能超过50000"
                    },
                    codeScript: {
                        required: "脚本不能为空",
                        maxlength:"长度不能超过50000"
                    },
                    resultUrl: {
                        required: "url不能为空"
                    }
                },
                onkeyup: function (element) {
                    $(element).valid()
                },
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                errorElement: 'p',
                errorClass: 'help-inline',
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

}(jQuery);