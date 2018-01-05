;(function (window, $) {
    'use strict';
    var _ = ko.utils, _getKeyValue = i18nHelper.getKeyValue;

    function ViewModel(params) {
        this.params = params;
    }

    ViewModel.prototype.hrefToResource = function ($data, typeKey) {
        var href = window.commonUtils.formatUrl(RESOURCE_CONFIG_MAP[$data[typeKey]].info_url, $data),
            mac = Nova.getMacToB64(href);
        if (!~href.indexOf('lecturer') && window.userInfo.user_id && mac) {
            href += (~href.indexOf("?") ? "&" : "?") + '__mac=' + mac;
        }
        var w = window.open(href);
    };
    ViewModel.prototype.hrefToList = function ($data, $event) {
        $event && $event.stopPropagation();
        location.href = selfUrl + "/" + projectCode + "/channel/" + channelId + "/list?type=" + this.params.type + ($data.id ? "&tag_id=" + $data.id : "");
    };
    ViewModel.prototype.formatType = function ($data) {
        var allGroupNames = window.allGroupNames || [];
        for (var i = 0; i < allGroupNames.length; i++)
            if (allGroupNames[i].type == $data.type) return _getKeyValue("channel.groupName." + ($data.type === 'opencourse_2' ? ($data.extra.business_type ? $data.extra.business_type : $data.type) : $data.type));
    };
    ViewModel.prototype.formatTime = function (time) {
        return time ? time.split('.')[0].replace('T', ' ') : '';
    };
    ViewModel.prototype.formatPrice = function (commodity) {
        return commodity ? commodity.price ? (function () {
            var price = '';
            _.objectForEach(commodity.price, function (k, v) {
                if (!price) price = v;
            });
            return price || _getKeyValue('channel.common.free');
        })() : _getKeyValue('channel.common.free') : ''
    };
    ko.components.register('x-channel-card', {
        synchronous: true,
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(window, jQuery);

