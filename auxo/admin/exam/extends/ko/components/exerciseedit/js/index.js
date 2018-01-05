/**
 * @file 课程编辑  jQuery、knockoutjs、bootstrap部分样式等
 * @author gqz
 */
(function (w, $) {
    function Model(params) {
        this.model = params.model;
        this.model.description.subscribe(function (val) {
            this.desEditor.html(val);
        }, this);
        this._init();
    };
    Model.prototype = {
        _init: function () {
            this._validator();
            this._editor();
        },
        //富文本编辑器
        _editor: function () {
            this.desEditor = KindEditor.create('#description', {
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: false,
                resizeType: 0,
                items: [
                    'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link'],
                afterChange: function () {
                    if (!this.desEditor) {
                        return;
                    }
                    if (this.desEditor.count("text") == 0) {
                        this.model.description = '';
                    } else {
                        this.model.description = this.desEditor.html();
                    }
                }.bind(this)
            });
        },
        //规则验证
        _validator: function () {
            jQuery.validator.addMethod("title", function (value, element) {
                var reg = "^[a-zA-Z0-9 _\u4e00-\u9fa5]*$";
                return this.optional(element) || (new RegExp(reg, 'i').test(value));
            }, "你的命名含有非法字符，请改正");
            $("#edit").validate({
                rules: {
                    title: {
                        required: true,
                        maxlength: 50
                    }
                },
                messages: {
                    title: {
                        required: "练习名称不能为空",
                        maxlength: $.validator.format("练习名称长度必须小于{0}字符"),
                        minlength: $.validator.format("练习名称长度必须大于{0}字符")
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
    ko.components.register('x-exerciseedit', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    })
})(window, jQuery);