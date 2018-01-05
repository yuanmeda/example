//依赖knockoutjs、bootstrap
ko.components.register('x-btngroup', {
    viewModel: function (params) {
        var model = this.model = {
            items: ko.isObservable(params.items) ? params.items : ko.observableArray(params.items),//按钮数组
            isMultiple: ko.isObservable(params.isMultiple) ? params.isMultiple : ko.observable(params.isMultiple),//是否多选
            sizeClass: ko.isObservable(params.sizeClass) ? params.sizeClass : ko.observable(params.sizeClass),//大小控制：btn-large、btn-small等
            colorType: ko.isObservable(params.colorType) ? params.colorType : ko.observable(params.colorType),//颜色控制：btn-primary、btn-info等
            clickMethod: $.isFunction(params.clickMethod) ? params.clickMethod : null
        };
        this.btnClick = function ($data) {
            if (model.isMultiple.peek()) {
                $data.checked(!$data.checked.peek());
            }
            else {
                if ($data.checked.peek())
                    return;
                $.each(model.items.peek(), function (index, value) {
                    if ($data.id.peek() == value.id.peek())
                        value.checked(true);
                    else
                        value.checked(false);
                })
            }
            if (!!model.clickMethod)
                model.clickMethod();
        }
    },
    template: '<!-- ko template: { nodes: $componentTemplateNodes }--><!-- /ko -->'
})