//依赖knockoutjs、bootstrap
ko.components.register('x-courselist', {
    viewModel: function (params) {
        var model = this.model = {
            items: ko.isObservable(params.items) ? params.items : ko.observableArray(params.item),
            selectItems: ko.isObservable(params.selectItems) ? params.selectItems : ko.observableArray(params.selectItems),
            canChecked: ko.isObservable(params.canChecked) ? params.canChecked : ko.observable(params.canChecked)
        };

        model.items.subscribe(function (val) {
            var inlineItems = model.items.peek();
            for (var i = inlineItems.length - 1; i >= 0; i--) {
                if (!inlineItems[i].customChecked) {
                    inlineItems[i].customChecked = ko.pureComputed(function () {
                            if (!this.model.canChecked())
                                return false;

                            var selectItems = this.model.selectItems();
                            if (!selectItems)
                                return false;
                            for (var i = selectItems.length - 1; i >= 0; i--) {
                                if (selectItems[i].object_id() == this.object_id) {
                                    return true;
                                }
                            }
                            return false;
                        }, {
                            model: model, object_id: inlineItems[i].object_id.peek()
                        }
                    )
                }
            }
        });
        model.items.valueHasMutated();

        this.activeClick = function ($data, event) {
            var bl = $(event.currentTarget).hasClass("x-courselist-active");
            var selectItems = model.selectItems.peek();
            if (!selectItems)
                return;
            if (!bl) {
                model.selectItems.push($data);
                return
            }
            for (var i = selectItems.length - 1; i >= 0; i--) {
                if (selectItems[i].object_id() == $data.object_id.peek()) {
                    model.selectItems.remove(selectItems[i]);
                }
            }
            model.selectItems.valueHasMutated();
        }
    },
    template: '<!-- ko template: { nodes: $componentTemplateNodes }--><!-- /ko -->'
})