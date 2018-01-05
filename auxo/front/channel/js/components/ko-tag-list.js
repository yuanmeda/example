;(function (window, $) {
    'use strict';
    var _ = ko.utils, _getKeyValue = i18nHelper.getKeyValue;

    function array_remove_repeat(a) { // 去重
        var r = [];
        for (var i = 0; i < a.length; i++) {
            var flag = true;
            var temp = a[i];
            for (var j = 0; j < r.length; j++) {
                if (temp === r[j]) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                r.push(temp);
            }
        }
        return r;
    }

    function array_intersection(a, b) { // 交集
        var result = [];
        for (var i = 0; i < b.length; i++) {
            var temp = b[i];
            for (var j = 0; j < a.length; j++) {
                if (temp === a[j]) {
                    result.push(temp);
                    break;
                }
            }
        }
        return array_remove_repeat(result);
    }

    function ViewModel(params) {
        var display = params.setting.display;
        var model = {
            init: false,
            list: {
                items: [],
                total: 0
            },
            searchFilter: {
                page_size: 20,
                page_no: 0,
                group_names: [],
                tag_ids: [],
                status: 1,
                sort_type: display.is_sort_enabled ? display.order_type : 3,
                time_status: display.is_filter_enabled ? display.filter_type : 0,
                is_free: undefined
            },
            allGroupNames: [],
            catalogs: [],
            currentTagsSubscribed: false,
            subscribedTags: [],
            hoverUnsubscribe: false,
            logined: !!userInfo.user_id
        };
        this.model = ko.mapping.fromJS(model);
        this.model.setting = params.setting;
        this.display = display;
        this.type = params.type;
        this.state = {
            expandedTag: [ko.observable(null), ko.observable(null)],
            selectedTag: ko.observable(null),
            activeLine: ko.observable(),
            initTag: ko.observable(false)
        };
        this.subscribeData = {};
        this.tags = ko.observable(null);
        if (params.parentHasTag) {
            this.tags = ko.observable(null).subscribeTo('TAG', this.handleTag, this);
            ko.observable().publishOn('GET_TAG')(0);
        } else {
            this.initTag();
        }
    }

    ViewModel.prototype.store = {
        getResourceGroup: function () {
            return $.ajax({
                url: selfUrl + "/" + projectCode + "/channels/resource_groups",
                dataType: 'json',
                cache: false
            });
        },
        channel: {
            getCatalogs: function () {
                return $.ajax({
                    url: selfUrl + "/" + projectCode + "/channels/" + channelId + "/tags/tree",
                    dataType: "json",
                    cache: false
                });
            },
            getResource: function (data) {
                return $.ajax({
                    url: selfUrl + "/" + projectCode + "/channels/" + channelId + "/resources",
                    type: "post",
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            },
            // 查询前20条订阅的标签
            getSubscribedTags: function () {
                return $.ajax({
                    url: selfUrl + "/" + projectCode + "/channels/subscribed_tags",
                    type: "post",
                    dataType: "json",
                    contentType: "application/json;charset=utf-8"
                });
            },
            validateTagsSubscribed: function (tags, subscribedTags) {
                var data = {tags: tags, custom_type: 'el-channel'};
                if (~$.inArray(tags.join(',') || 'channel_' + channelId, subscribedTags())) {
                    return $.Deferred().resolve({existed: true, noAdd: true});
                } else {
                    return $.ajax({
                        url: selfUrl + '/' + projectCode + '/channels/' + channelId + '/tags_subscribed',
                        type: 'POST',
                        dataType: 'json',
                        contentType: "application/json;charset=utf-8",
                        data: JSON.stringify(data)
                    });
                }
            },
            subscribeTags: function (tags) {
                var data = {tags: tags, custom_type: 'el-channel'};
                return $.ajax({
                    url: selfUrl + '/' + projectCode + '/channels/' + channelId + '/subscribe_tags',
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            },
            unSubscribeTags: function (tags) {
                var data = {tags: tags, custom_type: 'el-channel'};
                return $.ajax({
                    url: selfUrl + '/' + projectCode + '/channels/' + channelId + '/unsubscribe_tags',
                    type: 'DELETE',
                    dataType: 'json',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            }
        },
        resourcePool: {
            getCatalogs: function (channelId) {
                return $.ajax({
                    url: selfUrl + "/" + projectCode + "/resource_pool/tags/tree",
                    type: "get",
                    dataType: "json",
                    cache: false
                });
            },
            getResource: function (data) {
                return $.ajax({
                    url: selfUrl + "/" + projectCode + "/resource_pool/resources",
                    type: "post",
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            },
            // 查询前20条订阅的标签
            getSubscribedTags: function () {
                return $.ajax({
                    url: selfUrl + "/" + projectCode + "/channels/subscribed_tags",
                    type: "post",
                    dataType: "json",
                    contentType: "application/json;charset=utf-8"
                });
            },
            validateTagsSubscribed: function (tags, subscribedTags) {
                var data = {tags: tags, custom_type: 'el-learning-unit'};

                if ($.inArray(tags.join(','), subscribedTags()) > -1) {
                    return $.Deferred().resolve({existed: true, noAdd: true});
                } else {
                    return $.ajax({
                        url: selfUrl + '/' + projectCode + '/channels/' + channelId + '/tags_subscribed',
                        type: 'POST',
                        dataType: 'json',
                        contentType: "application/json;charset=utf-8",
                        data: JSON.stringify(data)
                    });
                }
            },
            subscribeTags: function (tags) {
                var data = {tags: tags, custom_type: 'el-learning-unit'};
                return $.ajax({
                    url: selfUrl + '/' + projectCode + '/channels/' + channelId + '/subscribe_tags',
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            },
            unSubscribeTags: function (tags) {
                var data = {tags: tags, custom_type: 'el-learning-unit'};
                return $.ajax({
                    url: selfUrl + '/' + projectCode + '/channels/' + channelId + '/unsubscribe_tags',
                    type: 'DELETE',
                    dataType: 'json',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            }
        }
    };
    ViewModel.prototype.handleAllActive = function (children) {
        return !array_intersection($.map(children, function (v) {
            return v.id;
        }), this.model.searchFilter.tag_ids()).length
    };
    ViewModel.prototype.handleTag = function (data) {
        data = this.formatTag($.extend(true, {}, data));
        this.tags(data);
        this.state.initTag(true);
        this._initDomEvent();
        var self = this;
        var map = {};

        function flatTree(tree) {
            var children = tree.children || [];
            map[tree.id] = tree;
            for (var i = 0; i < children.length; i++) {
                flatTree(children[i]);
            }
        }

        flatTree(data);
        this.tagMap = map;
        var initTagId = this.model.setting.data.tag_id;
        this.store[this.type].getSubscribedTags().done(function (data) {
            var tags = $.map(data.items, function (item) {
                return item.tags.length ? $.map(item.tags, function (tag) {
                    return tag.id;
                }).join(',') : 'channel_' + item.channel_id;
            });
            $.extend(self.model.subscribedTags(), tags);
            if (map[initTagId] && map[map[initTagId].parent_id] && map[map[map[initTagId].parent_id].parent_id]) {
                var p = map[map[initTagId].parent_id], pp = map[map[map[initTagId].parent_id].parent_id];
                if (p && p.parent_id) {
                    if (pp && pp.parent_id) {
                        self.expandTag(0, pp);
                        ko.tasks.schedule(function () {
                            self.expandTag(1, p);
                        });
                    } else {
                        self.expandTag(0, p);
                    }
                }
            }
            self.selectTag(map[initTagId] || null);
            if (~location.hash.indexOf('autoSubscribe')) self.autoSubscribe();
        });

    };

    ViewModel.prototype.handleLine = function (dom, $data) {
        ko.tasks.schedule(function () {
            _.arrayForEach(dom, function (v) {
                if (v.className && ~v.className.indexOf('tag-filter-cell')) {
                    $data.line(v.offsetTop);
                }
            });
        });
    };

    ViewModel.prototype.expandTag = function (level, $data) {
        if (level === 0) {
            this.state.expandedTag[1](null);
            if (!$data.loaded) {
                _.arrayForEach($data.children, function (v) {
                    v.line = ko.observable(0);
                });
                $data.loaded = true;
            }
        } else {
            this.state.activeLine($data.line())
        }
        this.state.expandedTag[level]($data);
    };

    ViewModel.prototype.selectTag = function ($data, $event) {
        this.state.selectedTag($data);
        this.model.searchFilter.tag_ids($data ? [$data.id] : []);
        this.isTagsSubscribed();
        this.pageQuery();
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

        return transferTreeToDepth(data, this.display.tag_show_type === 3 ? 2 : 1);
    };
    //标签
    ViewModel.prototype.initTag = function () {
        var self = this;
        this.store[this.type].getCatalogs().done(function (data) {
            self.handleTag(self.formatTag(data));
        });
    };
    ViewModel.prototype.handleTagClick = function (id) {
        var tag_ids = this.model.searchFilter.tag_ids;
        if (this.display.tag_show_type === 2) {
            tag_ids([id])
        } else {
            if (!~$.inArray(id, tag_ids)) {
                tag_ids.push(id);
            }
        }
        this.model.searchFilter.page_no(0);
        this.pageQuery();
    };
    ViewModel.prototype.showMore = function () {
        $(this).closest('.catalog-column').toggleClass('on');
    };
    ViewModel.prototype._initDomEvent = function () {
        // 显隐事件
        $(document).on('more_able', function (e, a, b) {
            $(".column-list").each(function () {
                var top = $(this).find("li:last").length ? $(this).find("li:last").position().top : 0;
                var moreBtn = $(this).parent("div").find(".attr-more");
                if (top > 0) {
                    moreBtn.show();
                } else {
                    moreBtn.hide();
                }
            });
        });
        $(document).trigger('more_able');
    };
    ViewModel.prototype.handleAllTagClick = function (children) {
        var interArr = array_intersection($.map(children, function (v) {
            return v.id;
        }), this.model.searchFilter.tag_ids());
        if (interArr.length) this.model.searchFilter.tag_ids.remove(interArr[0]);
        this.model.searchFilter.page_no(0);
        this.pageQuery();
    };
    ViewModel.prototype.autoSubscribe = function () {
        var self = this, tagObj = JSON.parse(localStorage.getItem('tags')) || {};
        var tags = $.map(tagObj, function (value) {
            return value
        });
        $.extend(this.model.subscribedTags(), tags);
        this.model.searchFilter.tag_ids(tags);
        if (!this.model.currentTagsSubscribed()) {
            this.subscribeHandler().done(function () {
                localStorage.removeItem('tags');
                location.hash = ''
                if (!self.state.selectedTag()) self.state.selectedTag(tags[0] ? self.tagMap[tags[0]] : null);
            });
        } else {
            localStorage.removeItem('tags');
            location.hash = ''
        }
    };

    // 转去登录
    ViewModel.prototype.toLogin = function () {
        location.hash = '#autoSubscribe';
        var tag = this.state.selectedTag();
        localStorage.setItem('tags', JSON.stringify(tag ? [tag.id] : []));
        location.href = selfUrl + "/" + projectCode + '/account/login?returnurl=' + encodeURIComponent(location.href);
    };
    // 转去我的订阅
    ViewModel.prototype.toMySubscribe = function () {
        location.href = myStudyUrl + '/' + projectCode + '/mystudy/user_center#my-subscribe';
    };
    // 打开弹窗
    ViewModel.prototype.showModal = function (modal) {
        $(modal).addClass('show');
        $('.modal-mark').addClass('show');
    };
    // 关闭弹窗
    ViewModel.prototype.hideModal = function (modal) {
        $(modal).removeClass('show');
        $('.modal-mark').removeClass('show');
    };
    // 标签订阅
    ViewModel.prototype.subscribeHandler = function () {
        var self = this;
        var subscribed = this.model.currentTagsSubscribed();
        var tag = this.state.selectedTag();
        var logined = self.model.logined();

        if (!logined) {
            return self.showModal('.login-modal');
        }

        if (subscribed) {
            self.showModal('.unsubscribe-modal');
            return $.when();
        }

        return this.store[this.type].subscribeTags(tag ? [tag.id] : []).done(function (res) {
            var tagsid = $.map(res.tags, function (tag) {
                return tag.id
            }).join(',');
            var titles = $.map(res.tags, function (tag) {
                return tag.title
            });
            self.model.subscribedTags.push(tagsid);
            self.model.currentTagsSubscribed(true);
            self.showModal('.subscribe-modal');
        });
    }
    // 取消订阅
    ViewModel.prototype.unSubscribeHandler = function () {
        var self = this;
        var tag = this.state.selectedTag();
        this.store[this.type].unSubscribeTags(tag ? [tag.id] : [])
            .done(function (result) {
                var tagsid = $.map(result.tags, function (tag) {
                    return tag.id
                }).join(',');

                self.model.subscribedTags.remove(tagsid);
                self.model.currentTagsSubscribed(false);
                self.hideModal('.unsubscribe-modal');
            });
    };
    ViewModel.prototype.getChannelName = function () {
        return document.title;
    };
    ViewModel.prototype.getSubscribeBtnTxt = function () {
        var type = this.model.currentTagsSubscribed() ? this.model.hoverUnsubscribe() ? 'cancel' : 'subscribed' : 'subscribe';

        return _getKeyValue('channel.common.' + type);
    };
    ViewModel.prototype.getTagsName = function () {
        var tag = this.state.selectedTag();
        return tag ? _getKeyValue('channel.tag.tips', {tagName: tag.title}) : '';
    };
    ViewModel.prototype.isTagsSubscribed = function () {
        var self = this;
        var tag = this.state.selectedTag();
        this.store[this.type].validateTagsSubscribed(tag ? [tag.id] : [], self.model.subscribedTags)
            .done(function (result) {
                self.model.currentTagsSubscribed(result.existed);
                if (result.existed && !result.noAdd) {
                    if (tag) self.model.subscribedTags.push(tag.id);
                }
            });
    };
    // 鼠标移入订阅按钮
    ViewModel.prototype.onUnsubscribeHandler = function () {
        this.model.hoverUnsubscribe(true);
    };
    // 鼠标移出订阅按钮
    ViewModel.prototype.leaveUnsubscribeHandler = function () {
        this.model.hoverUnsubscribe(false);
    };

    //标签 end
    ViewModel.prototype.tagSearch = function (tagId) {
        this.model.searchFilter.tag_ids([tagId]);
        this.pageQuery();
    };
    ViewModel.prototype.orderSearch = function (type) {
        this.model.searchFilter.sort_type(type);
        this.model.searchFilter.page_no(0);
        this.pageQuery();
    };
    ViewModel.prototype.paySearch = function (type) {
        this.model.searchFilter.is_free(type);
        this.model.searchFilter.page_no(0);
        this.pageQuery();
    };

    ViewModel.prototype.statusSearch = function (mode) {
        var filter = this.model.searchFilter;
        if (filter.time_status() == mode) return;
        filter.time_status(mode);
        filter.page_no(0);
        this.pageQuery();
    };
    ViewModel.prototype.pageQuery = function () {
        this.state.store && this.state.store.abort();
        var self = this, filter = ko.mapping.toJS(this.model.searchFilter);
        this.state.store = this.store[this.type].getResource(this.formatFilter(filter));
        this.state.store.done(function (data) {
            for (var i = 0, j = data.items.length; i < j; i++) {
                if (data.items[i].tags && data.items[i].tags.length > 3) {
                    data.items[i].tags.length = 3;
                }
            }
            self.model.list.items(data.items);
            self.model.list.total(data.total);
            self.model.init(true);
            self.page();
            $('.lazy-image:not(.loaded)').lazyload({
                placeholder: defaultImage,
                load: function () {
                    $(this).addClass('loaded');
                }
            }).trigger('scroll');
        }).always(function () {
            self.state.store = null;
        });
    };
    ViewModel.prototype.formatFilter = function (search) {
        var newFilter = {};
        $.each(search, function (k, v) {
            if ($.isArray(v)) {
                if (v.length) newFilter[k] = v;
            } else {
                if (v !== null && v !== "" && v !== undefined) newFilter[k] = v;
            }
        });
        return newFilter;
    };
    ViewModel.prototype.page = function () {
        var self = this, searchFilter = this.model.searchFilter;
        $("#pagination").pagination(self.model.list.total(), {
            is_show_first_last: false,
            is_show_input: true,
            is_show_total: false,
            items_per_page: searchFilter.page_size(),
            num_display_entries: 5,
            current_page: searchFilter.page_no(),
            prev_text: "common.addins.pagination.prev",
            next_text: "common.addins.pagination.next",
            callback: function (index) {
                if (index != searchFilter.page_no()) {
                    searchFilter.page_no(index);
                    self.pageQuery();
                }
            }
        })
    };
    ko.components.register('x-tag-list', {
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(window, jQuery);

