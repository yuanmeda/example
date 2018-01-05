;
(function ($, window) {
    "use strict";
    var store = {
        courseList: function (data) {
            return $.ajax({
                url: '/v1/open_courses/search',
                data: data,
                cache: false
            });
        }
    };
    var isCORS = (function () {
        var queryStr = location.search;
        queryStr = queryStr.substring(1, queryStr.length);
        var qs = queryStr.split('&'),
            flag = false;
        for (var i = 0; i < qs.length; ++i) {
            var qsArr = qs[i].split('='),
                key = qsArr[0];
            qsArr.shift();
            if (key == 'cors') {
                var val = qsArr.join('');
                if (val) {
                    flag = !flag;
                    break;
                }
            }
        }
        return flag;
    })();
    //课程列表数据模型
    var viewModel = {
        model: {
            items: [],
            filter: {
                page_size: 20, //分页大小
                page_no: 0, //分页索引
                status: 1, //状态：0下线，1上线
                name: '', //搜索关键字
                has_tag: '', //是否已贴标签（0否，1是）
                tag_ids: '', //标签ID(多值)
                top_number: '', //置顶标识（0未置顶，1已置顶）
                sort_type: 0, //排序类型：0默认创建时间倒序，1上线时间（最新），2报名人数（最热）
                is_search_stat: 1 //是否查询统计信息：0默认否，1是
            },
            selectedItems: [],
            style: 'pic', //列表显示风格
            tips: false //是否显示提示信息
        },
        clist: ko.observable({}),

        _init: function () {
            window.custom_type = 'auxo-open-course';
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.filter.name.subscribe(function (val) {
                if (val.length > 50) {
                    this.model.tips(true);
                } else {
                    this.model.tips(false);
                }
            }, this);
            ko.applyBindings(this, document.getElementById('opencourseContent'));
            this.model.selectedItems(!isCORS && window.parent.selectedCourse ? window.parent.selectedCourse : []);
            this._eventHandler();
            var selectMap = {
                '-1': {
                    prop: 'all',
                    val: ''
                },
                '0': {
                    prop: 'has_tag',
                    val: 0
                },
                '1': {
                    prop: 'top_number',
                    val: 1
                },
                '2': {
                    prop: 'status',
                    val: 1
                },
                '3': {
                    prop: 'status',
                    val: 0
                }
            };
            this.clist.sub("clist", function (val) {
                var selected = selectMap[val.flag()];
                _self._catalogSelect(selected.prop, selected.val);
                _self.model.filter.tag_ids(val.catalogs().join(','));
                _self.doSearch();
            });
            if (isCORS) this._initMessager();
        },
        _initMessager: function () {
            var self = this,
                selectedItems = this.model.selectedItems,
                callbackList = {
                    "setItems": $.proxy(function (data) {
                        this.fixTitle(data);
                        selectedItems(data.items);
                    }, self),
                    "getItems": $.proxy(function (evt) {
                        this.fixTitle(selectedItems());
                        var msg = {
                            "type": "setItems",
                            "data": {
                                "event_type": "set_items",
                                "context_id": "",
                                "data": {
                                    "items": selectedItems().concat()
                                }
                            },
                            "origin": location.host,
                            "timestamp": +new Date()
                        };
                        window.parent.postMessage(JSON.stringify(msg), '*')
                    }, self)
                };

            $(window).off("message").on("message", function (evt) {
                if (evt.originalEvent.data) {
                    var rawData = void 0;
                    try {
                        rawData = JSON.parse(evt.originalEvent.data);
                        if (rawData) {
                            callbackList[rawData.type](rawData.data.data);
                        }
                    } catch (e) {}
                    // if (rawData) callbackList[rawData.type](rawData.data.data);
                }
            });
            var msg = {
                "type": "getItems",
                "data": {
                    "event_type": "get_items",
                    "context_id": "",
                    "data": {}
                },
                "origin": location.host,
                "timestamp": +new Date()
            };
            window.parent.postMessage(JSON.stringify(msg), '*');
        },
        fixTitle: function (data) {
            var items = this.model.items();
            for (var i = 0; i < data.length; i++) {
                if (!data[i].title) {
                    var item = data[i];
                    for (var j = 0; j < items.length; j++) {
                        if (items[j].id == item.id) {
                            item.title = items[j].title;
                            item.web_link = items[j].web_link;
                            item.cmp_link = items[j].cmp_link;
                            item.image_url = items[j].image_url;
                        }
                    }
                }
            }
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
            $('#keyword').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch();
                }
            });
        },
        toggleSelectedItem: function ($data) {
            if (options) {
                var index = this.checkSelected($data),
                    items = this.model.items();
                if (~index) {
                    this.model.selectedItems.splice(index, 1);
                } else {
                    this.model.selectedItems.push(this.transferForParent($data));
                }
                if (!isCORS) window.parent.selectedCourse = this.model.selectedItems();
            } else {
                this.model.selectedItems([]);
                this.model.selectedItems([this.transferForParent($data)]);
                if (!isCORS) window.parent.selectedCourse = this.model.selectedItems()[0] || null;
            }
        },
        transferForParent: function (data) {
            return {
                "id": data.id,
                "title": data.name,
                "image_url": data.cover_url,
                "status": data.status,
                "web_link": data.web_link,
                "cmp_link": data.cmp_link
            };
        },
        checkSelected: function ($data) {
            var selectedItems = this.model.selectedItems(),
                index = -1;
            $.each(selectedItems, function (i, v) {
                if ($data.id == v.id) {
                    index = i;
                    return false;
                }
            });
            return index;
        },
        _list: function (flag) {
            var _self = this,
                _filter = _self.model.filter,
                _search = _self._filterParams(ko.mapping.toJS(_filter));
            //获取职位列表
            _search.regist_type = registType ? registType : undefined;
            store.courseList(_search).done(function (returnData) {
                if (returnData.items) _self.model.items(returnData.items);
                Utils.pagination(returnData.count,
                    _filter.page_size(),
                    _filter.page_no(),
                    function (no) {
                        _filter.page_no(no);
                        _self._list();
                    }
                );
            });
        },
        /**
         * 过滤请求参数
         * @param  {object} params 入参
         * @return {object}        处理后的参数
         */
        _filterParams: function (params) {
            var _params = {};
            for (var key in params) {
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
                    _params[key] = params[key];
                }
            }
            return _params;
        },
        styleChange: function (type) {
            this.model.style(type);
        },
        doSearch: function () {
            if (this.model.tips()) {
                return;
            }
            this.model.filter.page_no(0);
            this._list();
        },
        //项目item勾选事件
        checkClick: function ($data) {
            window.parent.selectedCourse = {
                title: $data.name,
                id: $data.id,
                image_url: $data.cover_url
            };
            viewModel.model.selected($data.id);
        },
        _getArrayProp: function (array, prop) {
            return array.map(function (item) {
                return item[prop];
            });
        },
        //状态分类事件
        _catalogSelect: function (prop, val) {
            var filter = viewModel.model.filter;
            ['has_tag', 'top_number', 'status'].forEach(function (name, i) {
                if (name === prop) {
                    filter[prop](val)
                } else {
                    filter[name]('')
                }
            });
        }
    };

    $(function () {
        viewModel._init();
    });
})(jQuery, window);
