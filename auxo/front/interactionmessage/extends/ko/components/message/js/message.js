/**
 * 评价列表
 * @author wlj
 */
(function (w, $) {
    function Model(params) {
        this.params = params;
        this.store = {
            getMessages: function (searchObj) {
                var url = (window.selfUrl || '') + '/' + params.projectCode + '/webmessages/search';
                return $.ajax({
                    url: url,
                    cache: false,
                    dataType: 'json',
                    type: "GET",
                    data: searchObj
                });
            },

            /**
             * 标记消息为已读
             * @param data
             * @returns {*}
             */
            markMessagesRead: function (data) {
                var url = (window.selfUrl || '') + '/' + params.projectCode + '/webmessages/read?message_id=' + data.message_id;
                return $.ajax({
                    url: url,
                    cache: false,
                    dataType: 'json',
                    type: "PUT",
                    data: JSON.stringify(data)
                });
            },

            /**
             * 获取用户未读信息数
             * @param data
             * @returns {*}
             */
            countMessagesNoRead: function (data) {
                var url = (window.selfUrl || '') + '/' + params.projectCode + '/users/' + data.user_id + '/webmessages/count';
                return $.ajax({
                    url: url,
                    cache: false,
                    dataType: 'json',
                    type: "GET",
                    data: data
                });
            }
        };
        var model = {
            messageList: [
                {
                    id: '',
                    is_read: '',
                    create_time: '',
                    title: '',
                    content: ''
                }
            ],
            //需要外面传的参数
            search: {
                user_id: '',
                is_read: ko.observable(2),
                page_no: ko.observable(0),
                page_size: ko.observable(10)
            },
            count_no_read: ''
        };
        //$.extend(model.search, this.params.value);
        model.count_no_read = this.params.count_no_read;
        this.model = ko.mapping.fromJS(model);
        this._init();
    };


    Model.prototype = {
        //数据初始化
        _init: function () {
            this._loadList();
            this.countMessagesNoRead();
        },
        //tab列表加载
        _loadList: function () {
            var _self = this;
            var _filter = ko.toJS(_self.model.search);
            if (_filter.is_read && _filter.is_read == 2) {
                _filter.is_read = '';
            }
            _self.store.getMessages(_filter).done(function (rankingList) {
                if (rankingList) {
                    //_self.model.messageList(rankingList.items);
                    ko.mapping.fromJS(rankingList.items, {}, _self.model.messageList);
                    _self.page(rankingList.total, _self.model.search.page_no());
                }
            });
        },
        _tabHandler: function (is_read) {
            if (is_read == this.model.search.is_read()) {
                return;
            }
            this.model.search.is_read(is_read);
            this.model.search.page_no(0);
            this._loadList();
        },
        countMessagesNoRead: function () {
            var _self = this;
            _self.store.countMessagesNoRead({user_id: viewModel.model.search.user_id()}).done(function (data) {
                _self.model.count_no_read(data.total);
            });
        },
        markMessageRead: function (data, is_read, $parent) {
            var _self = $parent;
            _self.store.markMessagesRead({message_id: data}).done(function () {
                //_self._loadList();
                ko.mapping.fromJS(1, {}, is_read);
            });
        },
        page: function (totalCount, currentPage) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: self.model.search.page_size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (pageId) {
                    if (pageId != currentPage) {
                        self.model.search.page_no(pageId);
                        self._loadList();
                    }
                }
            });
        }
    };
    ko.components.register('x-message-list', {
        /**
         * 组件viewModel类
         *
         * @class
         * @param params 组件viewModel实例化时的参数
         */
        viewModel: Model,
        /**
         * 组件模板
         */
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    })
})(window, jQuery);