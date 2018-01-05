(function () {
    "use strict";
    var store = {
        getChannel: function () {
            return $.ajax({
                url: channelUrl + '/v1/channels/' + channelId,
                dataType: "json",
                cache: false
            })
        },
        getChannellist: function () {
            return $.ajax({
                url: "/" + projectCode + "/channels",
                dataType: "json",
                cache: false
            });
        },
        moveChannel: function (channel_id, next_channel_id) {
            return $.ajax({
                url: channelUrl + "/v1/channels/" + channel_id + "/actions/move" + (next_channel_id ? "?next_channel_id=" + next_channel_id : ""),
                type: "put",
            });
        },
        createChannel: function (data) {
            return $.ajax({
                url: channelUrl + "/v1/channels",
                type: "post",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateChannel: function (channel_id, data) {
            return $.ajax({
                url: "/" + projectCode + "/channels/" + channel_id,
                type: "put",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateChannelStatus: function (channel_id, status) {
            return $.ajax({
                url: channelUrl + "/v1/channels/" + channel_id + "/status/" + status + "/",
                type: "put"
            });
        },
        deleteChannel: function (channel_id) {
            return $.ajax({
                url: channelUrl + "/v1/channels/" + channel_id,
                type: "delete",
                dataType: "json"
            });
        }
    };
    var createChannelModel = null;
    var viewModel = {
        model: {
            channels: [],
            state: {
                init: false,
                scrolling: false,
                showSlider: false
            },
            unit_type: ''
        },
        state: {},
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.unit_type(window.unit_type ? '?unit_type=' + window.unit_type : '');
            ko.applyBindings(this, document.getElementById("channelPanel"));
            this.getChannelList(true);
            this.initContainer();
            window.ChannelPanel = {
                refreshChannel: $.proxy(this.getChannelList, this),
                removeChannel: $.proxy(this.removeChannel, this)
            };
        },
        initContainer: function () {
            var self = this;
            this.$scrollContainer = $("#scrollContainer");
            $(window).on("resize", function () {
                self.model.state.showSlider(self.$scrollContainer.width() < self.state.scrollWrapWidth);
            });
        },
        scrollToActive: function () {
            var activeItem = this.$scrollContainer.find(".active");
            if (activeItem.length) this.$scrollContainer.scrollLeft(activeItem.position().left - 40);
        },
        initSortable: function () {
            var self = this;
            $("#channelList").sortable({
                placeholder: "channel-item drag-placeholder",
                update: function (event, ui) {
                    self.state.isDrag = true;
                    var nowId = ui.item.data("id"), nextItem = ui.item.next(".channel-item").data("id");
                    store.moveChannel(nowId, nextItem).done(function () {
                        self.getChannelList();
                    }).always(function () {
                        self.state.isDrag = false;
                    });
                }
            }).disableSelection();
        },
        getChannelList: function (firstTime) {
            var self = this;
            this.state.onAjaxProgress = true;
            store.getChannellist().done(function (res) {
                if (!res.length && channelId) location.href = "/" + projectCode + "/channel/empty" + self.model.unit_type();
                self.model.channels($.map(res, function (v) {
                    v.title = ko.observable(v.title);
                    v.editing = ko.observable(false);
                    return v;
                }));
                if (firstTime) {
                    self.model.state.init(true);
                    self.scrollToActive();
                }
                self.state.scrollWrapWidth = res.length * 182;
                if (self.$scrollContainer.width() < self.state.scrollWrapWidth) self.model.state.showSlider(true);
                self.initSortable();
            }).always(function () {
                self.state.onAjaxProgress = false;
            })
        },
        dealClick: function ($data) {
            var self = this, state = this.state;
            clearTimeout(this.state.timer);
            if (!state.isDrag) {
                this.state.timer = setTimeout(function () {
                    if (!$data.editing() && !state.onAjaxProgress && !state.isDrag) {
                        location.href = "/" + projectCode + "/channel/" + $data.id + "/content" + self.model.unit_type();
                        state.isDrag = false;
                    }
                }, 200);
            }
        },
        createChannel: function ($data) {
            var self = this, sendData = {
                "title": $data.title,
                "web_enabled": $data.web_enabled,
                "mobile_enabled": $data.mobile_enabled,
                "source_type": $data.source_type,
                "web_url": $data.web_url,
                "mobile_url": $data.mobile_url,
                "url_redirect_mode": $data.url_redirect_mode,
                "is_visible": $data.is_visible
            };
            store.createChannel(sendData).done(function (data) {
                createChannelModel.hide();
                self.getChannelList();
                if (!channelId) {
                    location.href = "/" + projectCode + "/channel/" + data.id + "/content" + self.model.unit_type();
                } else {
                    $.confirm({
                        title: "系统提示",
                        content: "创建频道成功！",
                        buttons: {
                            delete: {
                                text: '访问频道',
                                btnClass: 'btn-primary',
                                action: function () {
                                    location.href = "/" + projectCode + "/channel/" + data.id + "/content" + self.model.unit_type()
                                }
                            },
                            cancel: {
                                text: '取消',
                                action: function () {

                                }
                            },
                        }
                    });
                }

            })
        },
        updateChannel: function ($data, $event) {
            if ($event && $event.type == "keyup" && $event.keyCode != 13) return;
            $data.title = $.trim(ko.toJS($data.title));
            if ($data.title === '') {
                $.alert('频道名称不能为空');
                return false;
            }
            if ($data.title.length > 20) {
                $.alert('频道名称不能超过20字');
                return false;
            }
            $event && $event.stopPropagation();
            var self = this, sendData = {
                "title": $data.title,
                "web_enabled": $data.web_enabled,
                "status": $data.status,
                "mobile_enabled": $data.mobile_enabled,
                "source_type": $data.source_type,
                "web_url": $data.web_url,
                "mobile_url": $data.mobile_url,
                "url_redirect_mode": $data.url_redirect_mode,
                "is_visible": $data.is_visible
            };
            store.updateChannel($data.id, sendData).done(function () {
                if ($data.editing) $data.editing(false);
                $.simplyToast("更新频道成功！");
                self.getChannelList();
                createChannelModel.hide();
            })
        },
        editDetail: function ($data, $event) {
            $event && $event.stopPropagation();
            createChannelModel.show(ko.mapping.toJS($data));
        },
        stopChannel: function ($data, callback) {
            var self = this;
            store.updateChannelStatus($data.id, 0).done(function () {
                $.simplyToast("停用频道成功！");
                self.getChannelList();
                callback && callback();
            })
        },
        deleteChannel: function ($data, callback) {
            var self = this;
            store.deleteChannel($data.id).done(function () {
                $.simplyToast("删除频道成功！");
                if ($data.id == channelId) {
                    location.href = "/" + projectCode + "/channel" + self.model.unit_type();
                    return;
                }
                self.getChannelList();
                callback && callback();
            })
        },
        startScroll: function (to) {
            var left = this.$scrollContainer.scrollLeft(), speed = to == "left" ? -10 : 10;
            clearInterval(this.scroller);
            this.scroller = setInterval($.proxy(function () {
                this.scrolling = true;
                this.$scrollContainer.scrollLeft(this.$scrollContainer.scrollLeft() + speed)
            }, this), 10);
            this.$scrollContainer.scrollLeft(this.$scrollContainer.scrollLeft())
        },
        endScroll: function () {
            this.scrolling = false;
            clearInterval(this.scroller);
        },
        showCreateModal: function () {
            createChannelModel.show();
        },
        editChannel: function ($data, $event) {
            var channels = this.model.channels();
            $.each(channels, function (i, v) {
                v.editing(false);
            });
            $data.editing(true);
            $($event.target).closest(".channel-item").find("input").focus();
            $event.stopPropagation();
        },
        removeChannel: function ($data, $event, callback) {
            $event && $event.stopPropagation();
            $.confirm({
                title: " ",
                content: "删除频道后，频道中的相关设置、布局将会全部删除，且无法恢复，频道下资源的引用关系将会删除，资源不会删除，在资源池中仍然可以看到。</br></br>您可以“停用频道”，以便在需要时再次启用。",
                buttons: {
                    delete: {
                        text: '停用频道',
                        btnClass: 'btn-primary',
                        action: $.proxy(this.stopChannel, this, $data, callback)
                    },
                    stop: {
                        text: '删除频道',
                        btnClass: 'btn-danger',
                        action: $.proxy(this.deleteChannel, this, $data, callback)
                    },
                    cancel: {
                        text: '取消',
                        action: function () {
                        }
                    }
                }
            });
        }
    };
    var modalHtml = '<div class="modal fade" data-backdrop="static" id="createChannelModal">\
                        <div class="modal-dialog">\
                            <div class="modal-content">\
                                <div class="modal-header">\
                                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\
                                    <h4 class="modal-title" data-bind="text: model.channel.id() ? \'频道设置\' : \'创建频道\'"></h4>\
                                </div>\
                                <div class="modal-body">\
                                    <form class="form-horizontal" role="form">\
                                    <input type="text" style="display:none;"/>\
                                        <div class="form-group">\
                                            <label for="channelTitle" class="col-xs-4 control-label">频道名称：</label>\
                                            <div class="col-xs-8">\
                                                <input type="text" class="form-control" id="channelTitle" placeholder="请输入频道名称" data-bind="textInput:model.channel.title">\
                                            </div>\
                                        </div>\
                                        <div class="form-group" data-bind="visible: model.channel.id()">\
                                            <label class="col-xs-4 control-label">频道状态：</label>\
                                            <div class="col-xs-8">\
                                                <div class="radio">\
                                                    <label>\
                                                        <input type="radio" name="status" value="1" data-bind="checkedValue: 1,checked:model.channel.status">开启\
                                                    </label>\
                                                    <label>\
                                                        <input type="radio" name="status" value="0" data-bind="checkedValue: 0,checked:model.channel.status">停用\
                                                    </label>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <div class="form-group">\
                                            <label class="col-xs-4 control-label">是否可见：</label>\
                                            <div class="col-xs-8">\
                                                <div class="radio">\
                                                    <label>\
                                                        <input type="radio" name="channelIsVisible" value="true" data-bind="checkedValue: true,checked:model.channel.is_visible">是\
                                                    </label>\
                                                    <label>\
                                                        <input type="radio" name="channelIsVisible" value="false" data-bind="checkedValue: false,checked:model.channel.is_visible">否\
                                                    </label>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <div class="form-group">\
                                            <label class="col-xs-4 control-label">频道启用范围：</label>\
                                            <div class="col-xs-8">\
                                                <div class="radio">\
                                                    <label>\
                                                        <input type="radio" name="enabledRange" value="1" data-bind="checkedValue: 1,checked:model.state.enabledRange">WEB+手机端\
                                                    </label>\
                                                    <label>\
                                                        <input type="radio" name="enabledRange" value="2" data-bind="checkedValue: 2,checked:model.state.enabledRange">WEB\
                                                    </label>\
                                                    <label>\
                                                        <input type="radio" name="enabledRange" value="3" data-bind="checkedValue: 3,checked:model.state.enabledRange">手机端\
                                                    </label>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <div class="form-group">\
                                            <label class="col-xs-4 control-label">频道内容来源：</label>\
                                            <div class="col-xs-8">\
                                                <div class="radio">\
                                                    <label>\
                                                        <input type="radio" name="channelSourceType" value="1" data-bind="checkedValue: 1,checked:model.channel.source_type, disable: model.channel.id()">elearning内部\
                                                    </label>\
                                                    <label>\
                                                        <input type="radio" name="channelSourceType" value="2" data-bind="checkedValue: 2,checked:model.channel.source_type, disable: model.channel.id()">第三方URL\
                                                    </label>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <!--ko if:model.channel.source_type() == 2 -->\
                                        <div class="form-group">\
                                            <label for="channelWebUrl" class="col-xs-4 control-label">WEB端URL：</label>\
                                            <div class="col-xs-8">\
                                                <input type="email" class="form-control" id="channelWebUrl" placeholder="请输入WEB端URL" data-bind="value:model.channel.web_url">\
                                            </div>\
                                        </div>\
                                        <div class="form-group">\
                                            <label for="channelMobileUrl" class="col-xs-4 control-label">手机端URL：</label>\
                                            <div class="col-xs-8">\
                                                <input type="email" class="form-control" id="channelMobileUrl" placeholder="请输入手机端URL" data-bind="value:model.channel.mobile_url">\
                                            </div>\
                                        </div>\
                                        <div class="form-group">\
                                            <label class="col-xs-4 control-label">URL跳转方式：</label>\
                                            <div class="col-xs-8">\
                                                <div class="radio">\
                                                    <label>\
                                                        <input type="radio" name="channelUrlRedirectMode" value="1" data-bind="checkedValue: 1,checked:model.channel.url_redirect_mode">频道内跳转\
                                                    </label>\
                                                    <label>\
                                                        <input type="radio" name="channelUrlRedirectMode" value="2" data-bind="checkedValue: 2,checked:model.channel.url_redirect_mode">新窗口打开\
                                                    </label>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <!--/ko-->\
                                    </form>\
                                </div>\
                                <div class="modal-footer">\
                                    <button type="button" class="btn btn-primary" data-bind="click:save">保存</button>\
                                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';
    createChannelModel = {
        model: {
            channel: {
                id: 0,
                title: "",
                web_enabled: true,
                mobile_enabled: true,
                source_type: 1,
                web_url: "",
                mobile_url: "",
                status: 0,
                url_redirect_mode: 1,
                is_visible: true
            },
            state: {
                enabledRange: 1
            }
        },
        init: function () {
            document.body.appendChild($(modalHtml)[0]);
            ko.validation.init({
                "errorsAsTitleOnModified": true,
                "decorateInputElement": true
            });
            ko.validation.registerExtenders();
            this.model = ko.mapping.fromJS(this.model);
            this.model.state.enabledRange.subscribe(function (v) {
                this.model.channel.web_enabled(v == 1 || v == 2);
                this.model.channel.mobile_enabled(v == 1 || v == 3);
            }, this);
            this.model.channel.title.extend({
                required: {params: true, message: "频道名称不能为空"},
                maxLength: {params: 20, message: "频道名称不能超过20字"}
            });
            this.$createChannelModal = $("#createChannelModal");
            ko.applyBindings(this, document.getElementById("createChannelModal"));
        },
        show: function (data) {
            var channel = data || {}, targetChannel = this.model.channel;
            this.model.channel.title(channel.title || "");
            this.model.channel.id(channel.id || 0);

            this.model.channel.web_enabled(data ? channel.web_enabled : true);
            this.model.channel.mobile_enabled(data ? channel.mobile_enabled : true);

            this.model.channel.source_type(channel.source_type || 1);
            this.model.channel.web_url(channel.web_url || "http://");
            this.model.channel.mobile_url(channel.mobile_url || "");
            this.model.channel.url_redirect_mode(channel.url_redirect_mode || 1);
            this.model.channel.status(channel.status || 0);
            this.model.channel.is_visible(data ? channel.is_visible : true);

            this.model.state.enabledRange(targetChannel.web_enabled() && targetChannel.mobile_enabled() ? 1 : targetChannel.web_enabled() ? 2 : 3);
            this.$createChannelModal.modal("show");
            ko.validation.group(this.model.channel).showAllMessages(false);
        },
        hide: function () {
            this.$createChannelModal.modal("hide");
        },
        save: function () {
            var errors = ko.validation.group(this.model.channel);
            if (errors().length) {
                errors.showAllMessages();
                return;
            }
            var channel = ko.mapping.toJS(this.model.channel);
            if (channel.id) viewModel.updateChannel(channel)
            else viewModel.createChannel(channel);
        }
    };
    $(function () {
        viewModel.init();
        createChannelModel.init();
    });
})();