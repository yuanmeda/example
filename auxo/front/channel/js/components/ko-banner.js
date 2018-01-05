;(function (window, $) {
    'use strict';
    var _ = ko.utils, _getKeyValue = i18nHelper.getKeyValue;

    function ViewModel(params) {
        this.model = params.model;
        this.setting = params.model.setting;
        this.data = params.model.section_data_list || [];
        _.arrayForEach(this.data, function (item) {
            if (item.web_picture && item.web_picture_url) item.web_picture_url += (~item.web_picture.indexOf('CLOUD') ? '!m1903x400.jpg' : '')
        });
        this.tags = ko.observable().subscribeTo('TAG', this.initTag, this);
        if (this.setting.display && this.setting.display.show_tags) ko.observable().publishOn('GET_TAG')(0);
        this.init();
    }

    ViewModel.prototype.init = function () {
        var self = this;
        ko.tasks.schedule(function () {
            var element = $('#banner_' + self.model.id);
            element.uswipe({
                itemNum: 1,
                slideItemNum: element.find('.slide-item').length
            });
        });
    };
    ViewModel.prototype.hrefToCatalog = function ($data) {
        location.href = selfUrl + '/' + projectCode + '/channel/' + channelId + '/list?type=channel&tag_id=' + $data.id;
    };

    ViewModel.prototype.getBannerClick = function ($data) {
        if ($data.data_type == 1) {
            //标签
            location.href = selfUrl + '/' + projectCode + '/channel/' + $data.channel_id + '/list?type=channel' + ($data.tag_id ? '&tag_id=' + $data.tag_id : '') + ($data.order_type ? '&order_type=' + $data.order_type : '');
        } else if ($data.data_type == 3) {
            //url地址
            location.href = $data.web_url;
        } else {
            //资源
            this.hrefToResource($data, 'resource_type');
        }
    };

    ViewModel.prototype.hrefToResource = function ($data, typeKey) {
        var href = window.commonUtils.formatUrl(RESOURCE_CONFIG_MAP[$data[typeKey]].info_url, $data),
            mac = Nova.getMacToB64(href);
        if (!~href.indexOf('lecturer') && window.userInfo.user_id && mac) {
            href += (~href.indexOf("?") ? "&" : "?") + '__mac=' + mac;
        }
        window.open(href);
    };
    ViewModel.prototype.initTag = function (data) {
        this.tags(this.formatTag($.extend(true, {}, data)));
    };
    ViewModel.prototype.formatTag = function (data) {
        function getChildren(array, target) {
            for (var i = 0; i < array.children.length; i++) {
                var root = $.extend(true, {}, array.children[i]);
                delete root.children;
                target.push(root);
                if (array.children[i].children.length) {
                    getChildren(array.children[i], target);
                }
            }
        }

        function transferTreeToDepth(tree, depth) {
            if (depth == 0) {
                tree.allChildren = [];
                getChildren(tree, tree.allChildren);
                tree.children = tree.allChildren;
                delete tree.allChildren;
            } else {
                var children = tree.children;
                for (var i = 0; i < children.length; i++) {
                    transferTreeToDepth(children[i], depth - 1)
                }
            }
            return tree;
        }

        return transferTreeToDepth(data, 2);
    };
    ko.components.register('x-channel-banner', {
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(window, jQuery);

