(function ($) {
    //数据仓库
    var store = {
        errorHandler: function (jqXHR) {
            var txt = JSON.parse(jqXHR.responseText);
            if (txt.cause) {
                $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
            } else {
                $.fn.dialog2.helpers.alert(txt.message);
            }
        },

        //考试列表
        search: function (data) {
            var url = '/' + projectCode + '/exam_center/exams?' + data;
            return commonJS._ajaxHandler(url, null, 'GET');
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
    //数据模型
    var viewModel = {
        keyword: ko.observable(''), //关键字搜索
        model: {
            //课程池资源model
            courseModel: {
                show: 0,
                course: [],
                search: {
                    $offset: 0,
                    $limit: 24,
                    $orderby: 'last',
                    title: '',
                    catalog_id: ""
                },
                selectedIds: []
            },
            //公开课资源
            catalogList: [],
            items: [],
            filter: {
                pageSize: 20,
                pageIndex: 0,
                catalogs: [],
                flag: -1,
                sortword: 1
            },
            selectedIds: [],
            selectedItems: []
        },
        filterObj: {},
        clist: ko.observable({}),
        items: [],
        init: function () {
            var _self = viewModel;
            $.extend(_self, commonJS);
            _self.model = ko.mapping.fromJS(_self.model);
            ko.applyBindings(_self, document.getElementById('block'));
            this.model.selectedItems(!isCORS && window.parent.selectedCourse ? window.parent.selectedCourse : []);
            this.clist.sub("clist", function (val) {
                viewModel.model.filter.flag(val.flag());
                viewModel.model.filter.catalogs(val.catalogs());
                // viewModel.clearSelect();
                viewModel.list(0);
            });
            if (isCORS) this._initMessager();
        },
        _initMessager: function () {
            var self = this,
                selectedItems = this.model.selectedItems,
                callbackList = {
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
        _eventHandler: function () {
            //item操作事件集
            $('#courselist').on('click', '.item-check', function () {
                var _this = $(this),
                    _hasCheck = _this.hasClass('active');
                _this.closest('#courselist').find('.item').find('.item-check').removeClass('active');
                if (!_hasCheck) {
                    _this.addClass('active');
                }
            });
        },
        //加载课程池列表数据
        getExamList: function (flag) {
            var _self = this,
                _search = _self.model.courseModel.search;
            if (flag !== 0) {
                _search.$offset(0);
            }
            var searchdata = "page=" + _search.$offset() * _search.$limit() +
                "&size=" + _search.$limit() +
                "&title=" + encodeURIComponent(_search.title());
            if (data.items != null) {
                var channelCourses = self.items;
                $.each(data.items, function (i, item) {
                    var examCount = 0;
                    var videoCount = 0;
                    var documentCount = 0;
                    var resources;
                    if (item.resources != null) {
                        $.each(item.resources, function (j, resource) {
                            if (resource.type == 1)
                                videoCount = resource.count;
                            if (resource.type == 2)
                                documentCount = resource.count;
                            if (resource.type == 3)
                                examCount = resource.count;
                        });
                    }
                    resources = [{
                        type: 1,
                        count: videoCount
                    }, {
                        type: 2,
                        count: documentCount
                    }, {
                        type: 3,
                        count: examCount
                    }];
                    item.resources = resources;
                });
            }
            _self.model.courseModel.course(data.items);
            _self.page(data.count, _search.$offset(), _search.$limit());
        },
        //课程资源分页器
        page: function (count, pageIndex, pageSize) {
            var _self = this;
            $('#j_page').pagination(count, {
                items_per_page: pageSize,
                current_page: pageIndex,
                callback: function (pi) {
                    if (pi != pageIndex) {
                        _self.model.courseModel.search.$offset(pi);
                        _self.getExamList(0);
                    }
                }
            });
        },
        //获取公开课列表数据
        list: function (pageIndex) {
            if (pageIndex === 0) {
                viewModel.model.filter.pageIndex(0);
            }
            var _self = this,
                filter = _self.model.filter,
                searchData = "page=" + filter.pageIndex() +
                    "&size=" + filter.pageSize() +
                    "&order_by=" + filter.sortword() +
                    "&title=" + encodeURIComponent(_self.keyword());
            //                    "&enabled=" + filter.flag();
            //根据flag来筛选状态
            if (filter.flag() == 1) {
                searchData += "&exam_status=2";
            }
            if (filter.flag() == 2) {
                searchData += "&exam_status=3";
            }
            if (filter.flag() == 3) {
                searchData += "&enabled=false";
            }
            if (filter.flag() == 4) {
                searchData += "&enabled=true";
            }
            if (!filter.catalogs().length && filter.flag() === 0) {
                searchData += "&tag_flag=1";
            }
            if (!filter.catalogs().length && filter.flag() === -1) {
                searchData += "&tag_flag=0";
            }
            $.each(filter.catalogs(), function (i, catalog) {
                searchData += "&tag_ids=" + catalog;
            });
            store.search(searchData).done(function (data) {
                _self.items = data.items || [];
                _self.model.items(_self.items);
                _self._page(data.count, filter.pageIndex());
                //viewModel.clearSelect();
            });
        },
        doSearch: function () {
            viewModel.model.filter.pageIndex(0);
            viewModel.list();
        },
        //项目item勾选事件
        checkClick: function () {
            var ids = viewModel.model.selectedIds(),
                index = ids.indexOf(this.id);
            if (index > -1) {
                ids.splice(index, 1);
                //viewModel.clearSelect();
            } else {
                ids.push(this.id);
                viewModel.model.selectedIds([this.id]);
                window.parent.selectedCourse = {id: this.id, title: this.title};
            }
        },
        //清除选择
        clearSelect: function () {
            viewModel.model.selectedIds([]);
            window.parent.selectedCourse = null;
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
                "title": data.title,
                "image_url": null,
                "status": +data.enabled
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
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery);
