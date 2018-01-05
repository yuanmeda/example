(function ($, window) {
    var store = {
        getNotices: function () {
            var server = noteUrl;
            var url = server + "/v0.2/received_notices?maxts=0&size=99";
            var mac = JsMAF.getAuthHeader(url, 'GET');

            return $.ajax({
                url: url,
                cache: true,
                headers: {
                    "Authorization": mac,
                    "vorg": orgName
                }
            });
        },
        getNotice: function (id) {
            var server = noteUrl;
            var url = server + "/v0.2/received_notices/" + id;
            var mac = JsMAF.getAuthHeader(url, 'GET');

            return $.ajax({
                url: url,
                cache: true,
                headers: {
                    "Authorization": mac,
                    "vorg": orgName
                }
            });
        }
    };

    var viewModel = {
        model: {
            id: 0,
            list: [],
            notice: {
                title: '',
                content: '',
                publisher: '',
                read_count: 0,
                summary: '',
                publish_time: ''
            }
        },
        init: function () {
            var t = this;
            this.model.id = t.getUrlParam("id");

            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            ucManager.isLogin().then(function (res) {
                if (res == 'true') {
                    t.next();
                }
                else {
                    location.href = '/login?returnurl=' + location.href;
                }
            });
        },
        next: function () {
            if (this.model.id()) {
                this.detail(this.model.id())
            } else {
                this.notices();
            }
        },
        notices: function () {
            var t = this;
            store.getNotices().done(function (d) {
                t.model.list(d.items);//
            });
        },
        detail: function (id) {
            var t = this;
            store.getNotice(id).done(function (d) {
                t.model.notice.title(d.title);
                t.model.notice.content(d.content);
                t.model.notice.publisher(d.publisher);
                t.model.notice.read_count(d.read_count);
                t.model.notice.summary(d.summary);
                t.model.notice.publish_time(d.publish_time);
            })
        },
        formatTime: function (time) {
            if (!time)
                return '';

            return $.format.date(time, 'yyyy-MM-dd HH:MM');
        },
        getUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }
    };

    $(function () {
        setInterval(function () {
            window.iframeResizePostMessage && iframeResizePostMessage('notice');
        }, 200);

        viewModel.init();
    });

})(jQuery, window);
