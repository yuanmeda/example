; (function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //列表(GET)
        trainsList: function (data) {
            var url = '/' + projectCode + '/trains/pages';
            return $.ajax({
                url: url,
                data: data,
                cache: false
            });
        }
    };
    var isCORS = (function () {
        var queryStr = location.search;
        queryStr = queryStr.substring(1, queryStr.length);
        var qs = queryStr.split('&'), flag = false;
        for (var i = 0; i < qs.length; ++i) {
            var qsArr = qs[i].split('='), key = qsArr[0];
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
    //列表数据模型
    var viewModel = {
        model: {
            items: [],
            filter: {
                size: 20, //分页大小
                page: 0, //分页索引
                enabled: '', //状态：false下线，true上线
                title: '',//搜索关键字
                tag_flag: '',//空标签辅助标志 0全部(缺省) 1未贴标签
                tag_ids: '',//标签ID(多值)
                order_by: 1//排序类型 1：综合 2：最新 3：最热
            },
            selectedItems: [],
            selectedArray: []// 勾选到的item
        },
        clist: ko.observable({}),
        _init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById("js-content"));
            this.model.selectedItems(!isCORS && window.parent.selectedCourse ? window.parent.selectedCourse : []);
            this._eventInit();
            var selectMap = {
                '-1': { prop: 'all', val: '' },
                '0': { prop: 'tag_flag', val: 1 },
                '1': { prop: 'enabled', val: true },
                '2': { prop: 'enabled', val: false }
            };
            this.clist.sub("clist", function (val) {
                var selected = selectMap[val.flag()];
                _self._catalogSelect(selected.prop, selected.val);
                _self.model.filter.tag_ids(val.catalogs());
                _self.doSearch();
            });
            Utils.placeholder($("#js-trainquery"));
            if (isCORS) this._initMessager();
        },
        _initMessager: function () {
            var self = this, selectedItems = this.model.selectedItems, callbackList =
                {
                    "setItems": $.proxy(function (data) {
                        selectedItems(data.items);
                    }, self),
                    "getItems": $.proxy(function (evt) {
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
                        rawData = JSON.parse(evt.originalEvent.data)
                    } catch (e) {
                    }
                    if (rawData) callbackList[rawData.type](rawData.data.data);
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
        _eventInit: function () {
            var _self = this;
            //回车搜索
            $('#js-keyword').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch();
                }
            });
        },
        _list: function () {
            var _self = this,
                _filter = _self.model.filter,
                _params = ko.mapping.toJS(_filter);
            _params.regist_type = (window.registType || window.registType === '0') ? window.registType : undefined;
            var _search = _self._filterParams(_params);
            store.trainsList(_search).done(function (data) {
                if (_self._fixPage(data.total)) {
                    _self._list();
                    return;
                }
                _self.model.items(Array.isArray(data.items) ? data.items : []);
                Utils.pagination(data.total,
                    _filter.size(),
                    _filter.page(),
                    function (no) {
                        _filter.page(no);
                        _self._list();
                    }
                );
            });
        },
        _fixPage: function (total) {
            var page = this.model.filter.page(), max = Math.ceil(total / this.model.filter.size() - 1);
            max < 0 && (max = 0);
            if (page > 0 && page > max) {
                this.model.filter.page(max);
                return true;
            }
            return false;
        },
        _filterParams: function (params) {
            var _params = "";
            for (var key in params) {
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
                    _params = _params + key + "=" + encodeURIComponent(params[key]) + "&";
                }
            }
            return _params.substring(0, _params.length - 1);
        },
        doSearch: function () {
            this.model.filter.page(0);
            this._list();
        },
        toggleSelectedItem: function ($data) {
            if (options) {
                var index = this.checkSelected($data), items = this.model.items();
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
                "title": data.title,
                "image_url": data.cover_url,
                "status": +data.enabled
            };
        },
        checkSelected: function ($data) {
            var selectedItems = this.model.selectedItems(), index = -1;
            $.each(selectedItems, function (i, v) {
                if ($data.id == v.id) {
                    index = i;
                    return false;
                }
            });
            return index;
        },
        getSelectedArray: function (list) {
            var ids = [], titles = [], image_urls = [];
            for (var i = 0; i < list.length; i++) {
                ids.push(list[i].id);
                titles.push(list[i].title);
                image_urls.push(list[i].cover_url);
            }
            return { id: ids, title: titles, image_url: image_urls };
        },
        _getArrayProp: function (array, prop) {
            return array.map(function (item) {
                return item[prop];
            });
        },
        _catalogSelect: function (prop, val) {
            var filter = viewModel.model.filter;
            ['tag_flag', 'enabled'].forEach(function (name, i) {
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