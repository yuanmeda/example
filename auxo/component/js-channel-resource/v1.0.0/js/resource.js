;(function () {
    var _ = ko.utils;

    function ViewModel(params) {
        var model = {
            current: 0,
            channelList: [],
            enableCount: params.enableCount || 1, //可以选择的资源数
            totalCount: 0,
            tip: ''
        };
        this.model = ko.mapping.fromJS(model);
        this.params = params;
        this.parent = params.parent;
        this.init();
    }

    ViewModel.prototype.store = {
        getChannel: function () {
            return $.ajax({
                url: '/' + projectCode + '/channels/actions/query',
                data: {
                    size: 9999
                },
                cache: false
            });
        }
    };
    ViewModel.prototype.init = function () {
        var selected_course = $.isArray(this.params.selected_course()) ? this.params.selected_course() : [this.params.selected_course()]
        this.model.totalCount(this.model.totalCount() + selected_course.length);
        this.getTip();
        this.getChannel();
    };
    ViewModel.prototype.count = function () {
        this.model.totalCount = ko.computed(function () {
            var total = 0;
            _.arrayForEach(this.model.channelList(), function (item) {
                var v = item.selected && item.selected();
                if (v) {
                    total += v;
                }
            });
            return total;
        }, this);
        this.getTip();
    };
    ViewModel.prototype.getTip = function () {
        var enable = this.model.enableCount,
            total = this.model.totalCount,
            txt = total() <= enable() ? '你还可以选择' + (enable() - total()) + '个资源' : '你可以选择' + enable() + '个资源，已多选' + ( total() - enable()) + '个资源';
        this.model.tip(txt);
    };
    ViewModel.prototype.getChannel = function () {
        var that = this;
        this.store.getChannel().done(function (res) {
            _.arrayForEach(res.items, function (item) {
                var count = 0;
                item.selectedItems = ko.observableArray([]);
                _.arrayForEach(that.params.selected_course(), function (selected) {
                    if (item.id === selected.channel_id) {
                        count++;
                        item.selectedItems.push(selected);
                    }
                });
                item.clicked = ko.observable(false);
                item.selected = ko.observable(count);
                item.selected.subscribe(function (nv) {
                    that.count();
                });
                res.items[0].clicked(true);
            });
            that.model.channelList(res.items || []);
        });
    };
    ViewModel.prototype.save = function () {
        if (this.model.totalCount() > this.model.enableCount()) return;
        var that = this, result = [];
        _.arrayForEach(this.model.channelList(), function (item) {
            var v = item.selectedItems && item.selectedItems();
            if (v && v.length) {
                result = result.concat(v);
            }
        });
        if (!result.length) {
            $.alert('请选择资源');
            return false;
        }
        var repetitionMsg = '', uniqueObj = {};
        _.arrayForEach(result, function (item) {
            if (uniqueObj[item.resource_id]) {
                if (!~repetitionMsg.indexOf(item.resource_name) || !repetitionMsg) {
                    repetitionMsg += item.resource_name + '<br />'
                }
            } else {
                uniqueObj[item.resource_id] = item.resource_id;
            }
        });
        if (repetitionMsg) {
            $.alert('以下资源被重复推荐，请重新选择：<br />' + repetitionMsg);
            return;
        }
        that.params.selected_course(result);
        that.params.update_course && that.params.update_course(result);
        $('#' + this.params.id).modal('hide');
        $(".modal-backdrop").remove();
        $('body').removeClass('modal-open');
    };
    ViewModel.prototype.changeTab = function (index, $data) {
        $data.clicked(true);
        this.model.current(index);
    };
    ko.components.register('x-channel-resource-tab', {
        synchronous: true,
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})();
