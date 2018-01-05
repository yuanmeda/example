import tpl from './template.html'
import dialog from './dialog'
import ko from 'knockout'
import _ from './lodash'

var _i18nValue = i18nHelper.getKeyValue;

function ViewModel(params) {
    this.model = {
        currentTime: ko.observable(""),
        resourceConfigType: ko.observableArray([]),
        subscribes: {
            items: ko.observableArray([]),
            init: ko.observable(false),
            counts: ko.observable(0),
            search: {
                page_size: 20,
                page_no: ko.observable(0)
            }
        },
        api: {
            mystudy: params.mystudy_gateway,
            qa_gateway: params.qa_gateway,
            qa_api: params.qa_api
        },
        user: {
            nickName: params.nickName
        },
        init: ko.observable(false)
    };
    this.init();
    this.bindEvent();
}

ViewModel.prototype.store = {
    getCurrentTime: function () {
        return $.ajax({
            url: gaea_js_properties.auxo_channel_url + '/v2/services/current_times',
            dataType: "json",
            cache: false
        });
    },
    getResourceConfigType: function () {
        return $.ajax({
            url: gaea_js_properties.auxo_channel_url + '/v1/resource_config/types',
            dataType: "json",
            cache: false
        });
    },
    readSubscribe: function () {
        return $.ajax({
            url: gaea_js_properties.auxo_channel_url + '/v2/tag_subscribes/actions/read',
            type: "put",
            dataType: "json",
            cache: false
        });
    },
    getSubscribes: function (params) {
        return $.ajax({
            url: gaea_js_properties.auxo_mystudy_url + '/v1/mine/tag_subscribes',
            data: params,
            dataType: "json",
            cache: false
        });
    },
    unsubscribe: function (subscribe_id) {
        return $.ajax({
            url: gaea_js_properties.auxo_channel_url + '/v2/tag_subscribes/' + subscribe_id,
            dataType: "json",
            type: "delete",
            cache: false
        });
    }
};

ViewModel.prototype.init = function () {
    this.getCurrentTime();
    this.getResourceConfigType();
    this.getSubscribes();
};

ViewModel.prototype.bindEvent = function () {
    function handleClick(e) {
        if ($(e.target).hasClass('unsubscribe')) {
            $(e.target).children(".btn-cancle").toggle();
        } else {
            $('.unsubscribe .btn-cancle').hide();
        }
    }

    $(document).unbind('click', handleClick);
    $(document).on('click', handleClick);
};

ViewModel.prototype.getResourceConfigType = function () {
    var resourceConfigType = this.model.resourceConfigType;
    this.store.getResourceConfigType().then(function (data) {
        resourceConfigType(data);
    })
};

ViewModel.prototype.getCurrentTime = function () {
    var currentTime = this.model.currentTime;
    this.store.getCurrentTime().then(function (data) {
        currentTime(data.current_time);
    })
};

ViewModel.prototype.readSubscribe = function () {
    this.store.readSubscribe()
};

ViewModel.prototype.getSubscribes = function () {
    var subscribes = this.model.subscribes;
    subscribes.items([]);
    this.store.getSubscribes(ko.mapping.toJS(subscribes.search)).then(function (res) {
        $.each(res.items, (i, item) => {
            $.each(item.resources.items, (j, resource) => {
                resource.resource_id = resource.unit_id;
            });
            item.resources.showMore = ko.observable(false);
        });
        subscribes.items(res.items);
        subscribes.counts(res.count);
        subscribes.init(true);
        this._page(subscribes.counts(), subscribes.search.page_no(), subscribes.search.page_size);
        this.readSubscribe();
    }.bind(this))
};

ViewModel.prototype.unsubscribe = function (data) {
    var self = this;
    dialog.showDialog({
        title: i18nHelper.getKeyValue("subscribe.common.cancel"),
        showCancel: true,
        showConfirm: true,
        confirm: function () {
            self.store.unsubscribe(data.subscribe_id).done(function (res) {
                self.unsubscribeSuccess();
                var subscribes = self.model.subscribes;
                _.remove(subscribes.items(), data);
                subscribes.items(subscribes.items());
                var pageNo = subscribes.search.page_no();
                if (subscribes.items().length == 0) {
                    pageNo = (pageNo - 1 >= 0 ? pageNo - 1 : 0);
                }
                subscribes.search.page_no(pageNo);
                self.getSubscribes();
            });
        },
        data: data,
        content: i18nHelper.getKeyValue("subscribe.common.cancelContent")
    });
};

ViewModel.prototype.unsubscribeSuccess = function () {
    dialog.showDialog({
        title: i18nHelper.getKeyValue("subscribe.common.cancelSuccess"),
        type: "success",
        showCancel: false,
        showConfirm: false,
        autoClose: true
    });
};

ViewModel.prototype.showMore = function (data) {
    data.showMore(true);
};

ViewModel.prototype.formatCourseDate = function (date) {
    var text = "";
    if (this.model.currentTime()) {
        var currentTime = new Date(this.formatTime(this.model.currentTime()).replace(/-/g, "/")).getTime();
        var createTime = new Date(this.formatTime(date).replace(/-/g, "/")).getTime();
        var diff = currentTime - createTime;
        if (diff < 60000) {
            text = i18nHelper.getKeyValue("subscribe.common.justNow");
        } else if (diff < 3600000) {
            text = i18nHelper.getKeyValue("subscribe.common.beforeMin", { num: Math.floor(diff / 60000) });
        } else if (diff < 86400000) {
            text = i18nHelper.getKeyValue("subscribe.common.beforeHour", { num: Math.floor(diff / 3600000) });
        } else if (diff < 604800000) {
            text = i18nHelper.getKeyValue("subscribe.common.beforeDay", { num: Math.floor(diff / 86400000) });
        } else {
            text = i18nHelper.getKeyValue("subscribe.common.beforeDay", { num: 7 });
        }
    }
    return text;
};

function formatUrl(url, data) {
    url = url || '';
    url = url.replace(/\$\{project_code\}/gi, projectCode);
    if (data) url = url.replace(/\$\{data\.(.+?)(\|(.+?))?\}/gi, function (match, m1, m2, filter) {
        var arr = m1.split('.'), d = data;
        for (var i = 0; i < arr.length; i++)
            d = d[arr[i]];
        if (filter) {
            switch (filter) {
                case 'e':
                    d = encodeURIComponent(d);
            }
        }
        return d;
    });
    return url;
}

ViewModel.prototype.hrefToResource = function ($data, typeKey) {
    var resourceConfigType = this.model.resourceConfigType;
    var href = formatUrl(_.find(resourceConfigType(), { unit_type: $data[typeKey] }).info_url, $data),
        mac = Nova.getMacToB64(href);
    if (!~href.indexOf('lecturer') && window.userInfo.user_id && mac) {
        href += (~href.indexOf("?") ? "&" : "?") + '__mac=' + mac;
    }
    window.open(href);
};

ViewModel.prototype.hrefToList = function (data) {
    var tag_id = "";
    if (data.tags.length) {
        tag_id = data.tags.map(tag => {
            return tag.id
        }).join(",")
    }
    var type = data.custom_type == "el-channel" ? "channel" : "resourcePool";
    window.open(gaea_js_properties.portal_web_url + "/" + projectCode + "/channel/" + data.channel_id + "/list?type=" + type + (tag_id ? "&tag_id=" + tag_id : ""));
};

ViewModel.prototype.formatTime = function (time) {
    return time ? time.split('.')[0].replace('T', ' ') : '';
};

ViewModel.prototype.gotoPortal = function () {
    location.href = gaea_js_properties.portal_web_url + "/" + projectCode;
};

ViewModel.prototype._page = function (total, page, size) {
    var search = this.model.subscribes.search,
        t = this;
    $('#js_qa_pagination').pagination(total, {
        items_per_page: size,
        num_display_entries: 5,
        current_page: page,
        is_show_total: false,
        is_show_input: true,
        pageClass: 'pagination-box',
        prev_text: "common.addins.pagination.prev",
        next_text: "common.addins.pagination.next",
        callback: function (pageNum) {
            if (pageNum != page) {
                search.page_no(pageNum);
                t.getSubscribes();
            }
        }
    });
};

ko.components.register('x-usercenter-subscribe', {
    viewModel: ViewModel,
    template: tpl
});

