/**
 * Created by Administrator on 2017.8.9.
 */
;(function ($,window) {
    var store = {
        getList: function (data) {
            return $.ajax({
                url: channelUrl+ '/v2/resources/audits/logs/search',
                type: 'POST',
                data:  JSON.stringify(data)
            });
        },

        getSourceName: function (data) {
            return $.ajax({
                url: '/' + projectCode+ '/resource_pool/resources',
                type: 'POST',
                data:  JSON.stringify(data)
            });
        },

        getChannel: function (data) {
            return $.ajax({
                url: '/' + projectCode+ '/channels',
                type: 'GET',
                data:  JSON.stringify(data)
            });
        }
    };
    var viewModel = {
        model: {
            search: {
                "channel_id": null,
                "resource_id": "",
                "user_id": null,
                "new_status": null,
                "start_time": "",
                "end_time": "",
                "program_id": "",
                "page": 0,
                "size": 10
            },

            sourceName: {
                "group_names": ["channel_opencourse_2"],
                "name" : '',
                "name_query_type": 1
            },

            list: {
                items: [],
                count: 0
            },
            selectedList :[],

            channelList: [],

            readonly: false,

            userName: ''
        },
        init: function () {
            var me = this,js_start=$("#startDate"),js_end=$("#endDate");
            this.model = ko.mapping.fromJS(this.model);
            this.uTreeOpts = {
                readonly: false,
                orgId: projectOrgId,
                selectedList: this.model.selectedList,
                config: {
                    projectCode: projectCode,
                    host: opencourse2GatewayUrl,
                    userHost: '',
                    version: 'v1',
                    userVersion: 'v0.93',
                    initData: null,
                    avatarPath:'http://cdncs.101.com/v0.1/static/cscommon/avatar/',
                    isRadio: true
                }
            };

            this._getList();

            this.channelList();

            this._select2();

            js_start.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd hh:ii',
                autoclose: true
            }).on('changeDate', function (ev) {
                js_end.datetimepicker('setStartDate', me.model.search.start_time());
            });

            js_end.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd hh:ii',
                autoclose: true
            }).on('changeDate', function (ev) {
                js_start.datetimepicker('setEndDate', me.model.search.end_time());
            });

            js_end.click(function(){js_end.datetimepicker('show')});
            js_start.click(function(){js_start.datetimepicker('show')});

            ko.applyBindings(this);
        },

        showUserTree: function () {
            $('#js-userTreeModal').modal('show');
        },

        /**
         * 课程位置
         * @return {null} null
         */
        courseLocation: function (item) {
            var arr = [];
            for (var i=0;i<item.length;i++) {
                arr.push(item[i].title)
            }
            return arr.join('、');
        },

        /**
         * 课程跳转地址
         * @return {null} null
         */
        openUrl: function (resource_id) {
            window.location.href = opencourse2GatewayUrl + '/' + projectCode + '/admin/open_course/' + resource_id + '/audit';
        },

        /**
         * 变更状态
         * @return {null} null
         */
        courseStatus: function (old_status,new_status) {
            switch(old_status)
            {
                case 0:
                    old_status = '未提交';
                    break;
                case 1:
                    old_status = '待审核';
                    break;
                case 2:
                    old_status = '审核通过';
                    break;
                case 3:
                    old_status = '审核驳回';
                    break;
                default:
                    old_status = '暂无';
            }
            switch(new_status)
            {
                case 0:
                    new_status = '未提交';
                    break;
                case 1:
                    new_status = '待审核';
                    break;
                case 2:
                    new_status = '审核通过';
                    break;
                case 3:
                    new_status = '审核驳回';
                    break;
                default:
                    new_status = '暂无';
            }
            return old_status + '>' + new_status
        },

        /**
         * 移除人员
         * @return {null} null
         */
        removeRequiredUser: function (removeItem, index) {
            var requiredUserList = this.model.selectedList();
            requiredUserList.splice(index, 1);
            this.model.selectedList(requiredUserList);
        },

        /**
         * 获取频道列表
         * @return {null} null
         */
        channelList: function () {
            var that = this;
            store.getChannel().then(function (data) {
                var cs = [{id: '', title: '全部分类'}];
                data && data.forEach(function (v, i) {
                    cs.push({id: v.id, title: v.title});
                });
                that.model.channelList(cs);
            });
        },

        /**
         * 初始化列表
         * @return {null} null
         */
        _getList: function () {
            var self = this;
            var search = ko.mapping.toJS(self.model.search);
            if (search.start_time) search.start_time = +new Date((search.start_time + ':00').replace(/-/g, "/"));
            if (search.end_time) search.end_time = +new Date((search.end_time + ':59').replace(/-/g, "/"));
            store.getList(search)
                .done(function (data) {
                    self.model.list.items(data.items);
                    self._page(data.total, self.model.search.page(), self.model.search.size());
                });
        },

        /**
         * 搜索
         * @return {null} null
         */
        search: function () {
            if (this.model.selectedList.length > 0) {
                var userId = this.model.selectedList()[0].user_id;
                this.model.search.user_id(userId);
            }
            this.model.search.page(0);
            this._getList();
        },
        /**
         * select2插件初始化
         * @return {null} null
         */
        _select2: function() {
            var query = ko.mapping.toJS(this.model.sourceName);
            $('#userSelect_js').select2({
                allowClear: true,
                width: '200px',
                placeholder: '课程名称',
                language: 'zh-CN',
                ajax: {
                    transport: function(params, success, failure) {
                        if (!params.data) {
                            return;
                        } else {
                            store.getSourceName(params.data).then(success, failure);
                        }
                    },
                    data: function(params) {
                        params.term = $.trim(params.term);
                        if (params.term) {
                            query.name = params.term;
                        } else {
                            return false;
                        }
                        return query;
                    },
                    processResults: function(data, params) {
                        var mapData = data.items.map(function(v, i, arr) {
                            return {
                                id: v.resource_id,
                                text: v.title
                            };
                        });
                        return {
                            results: mapData
                        }
                    }
                },
                minimumInputLength: 1,
                maximumInputLength: 10
            });
        },
        _page: function (total, offset, limit) {
            var self = this;
            $("#pagination").pagination(total, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != offset) {
                        self.model.search.page(index);
                        self._getList();
                    }
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery,window);