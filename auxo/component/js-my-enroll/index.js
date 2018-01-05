import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

function ViewModel(params) {
    var model = {
        "init": false,
        "processStatus": 0,
        "defaultImage": "",
        "search": {
            "page_no": -1,
            "page_size": 10
        },
        "data": {
            "items": [],
            "total": 0
        }
    };
    this.model = ko.mapping.fromJS(model);
    this.model.search.status = ko.pureComputed(function () {
        return [[0, 2, 5], [1, 3, 4]][this.model.processStatus()] || [];
    }, this);
    this.defaultOptions = {
        "projectCode": "onetest",
        "defaultImage": "",
        "hosts": {
            enrollGateway: "http://elearning-enroll-gateway.dev.web.nd",
            enrollApi: "http://elearning-enroll-api.dev.web.nd",
            payGateway: ""
        }
    };
    this.options = $.extend({}, this.defaultOptions, params.options);
    this.model.defaultImage(this.options.defaultImage);
    this.init();
}

ViewModel.prototype.store = {
    query: function (apiUrl, search) {
        return $.ajax({
            url: apiUrl + '/v1/user/enrollment_infos',
            data: search,
            dataType: "json",
            cache: false
        })
    }
};
ViewModel.prototype.init = function () {
    this.getDataList();
};
ViewModel.prototype.fixImage = function ($data, $event) {
    $event.target.src = this.options.defaultImage;
};
ViewModel.prototype.getDataList = function (refresh) {
    var page_no = this.model.search.page_no;
    if (this.ajaxRequest) {
        this.ajaxRequest.abort();
        page_no(page_no() - 1);
    }
    if (refresh) page_no(-1);
    var self = this, search = ko.mapping.toJS(this.model.search), data = this.model.data;
    page_no(++search.page_no);
    this.ajaxRequest = this.store.query(this.options.hosts.enrollGateway, this._getParamString(search));
    this.ajaxRequest.done(function (res) {
        if (res) {
            _.arrayForEach(res.items, function (item) {
                item.button = self.formatButton(item);
            });
            data.items(refresh ? res.items : data.items().concat(res.items));
            data.total(res.total);
        }
        self.model.init(true);
    }).always(function () {
        self.ajaxRequest = null;
    })
};
ViewModel.prototype.switchTab = function (status) {
    this.model.processStatus(status);
    this.getDataList(true);
};
ViewModel.prototype.showMore = function () {
    this.getDataList();
};
ViewModel.prototype.formatTime = function (time, needSecond) {
    var showTime = '';
    if (time) {
        if (needSecond) {
            showTime = time && time.split('.');
            showTime = showTime[0].replace('T', ' ');
        } else {
            showTime = time && time.split('T');
            showTime = showTime[0];
        }
    }
    return showTime || '';
};

ViewModel.prototype.formatButton = function (item) {
    var buttonMap = {
        //待审核
        "0": {
            "btnText": "myEnroll.verifying",
            "btnClass": "btn btn-disabled",
            "btnHref": "javascript:;",
            "btnFunc": null
        },
        //审核拒绝
        "1": {
            "btnText": "myEnroll.fail",
            "btnClass": "btn btn-disabled",
            "btnHref": "javascript:;",
            "btnFunc": null
        },
        //待付款
        "2": {
            "btnText": "myEnroll.pay",
            "btnClass": "btn btn-primary",
            "btnHref": "javascript:;",
            "btnFunc": $.proxy(this.alertMessage, this, _i18nValue("myEnroll.notSupportPay"))
        },
        //已取消
        "3": {
            "btnText": "myEnroll.cancel",
            "btnClass": "btn btn-disabled",
            "btnHref": "javascript:;",
            "btnFunc": null
        },
        //报名成功
        "4": {
            "btnText": "myEnroll.success",
            "btnClass": "btn btn-disabled",
            "btnHref": "javascript:;",
            "btnFunc": null
        },
        //待填表单
        "5": {
            "btnText": "myEnroll.enroll",
            "btnClass": "btn btn-primary",
            "btnHref": "javascript:;",
            "btnFunc": $.proxy(this.hrefEnroll, this, item)
        }
    };
    return buttonMap[item.status];
};
ViewModel.prototype.hrefEnroll = function (item) {
    var options = this.options, enroll_url = options.hosts.enrollGateway + '/' + options.projectCode + '/enroll/enroll?unit_id=' + item.unit_id + '&__return_url=' + encodeURIComponent(location.href);
    location.href = enroll_url + '&__mac=' + Nova.getMacToB64(enroll_url);
};
ViewModel.prototype.alertMessage = function (message) {
    if ($.fn.udialog) {
        $.fn.udialog.alert(message)
    } else {
        window.alert(message);
    }
};
ViewModel.prototype.triggerButton = function ($data) {
    if ($data.button.btnFunc && $.isFunction($data.button.btnFunc)) {
        $data.button.btnFunc();
    }
    return true;
};
ViewModel.prototype.hrefTo = function (type, $data) {
    var options = this.options, enroll_url = options.hosts.enrollGateway + '/' + options.projectCode + '/enroll/user_enroll_form?unit_id=' + $data.unit_id + '&__return_url=' + encodeURIComponent(location.href);
    switch (type) {
        case "form":
            location.href = enroll_url + '&__mac=' + Nova.getMacToB64(enroll_url);
            break;
    }
};
ViewModel.prototype._getParamString = function (params) {
    var str = "";
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var value = params[key], trimVal = "";
            if ($.isArray(value)) {
                var len = value.length;
                for (var i = 0; i < len; i++) {
                    trimVal = $.trim(value[i]);
                    if (trimVal !== "") str += key + '=' + trimVal + "&";
                }
            } else {
                trimVal = $.trim(value);
                if (trimVal !== "") str += key + '=' + trimVal + "&";
            }
        }
    }
    return str ? str.substring(0, str.length - 1) : str
};


ko.components.register('x-my-enroll', {
    viewModel: ViewModel,
    template: tpl
});

