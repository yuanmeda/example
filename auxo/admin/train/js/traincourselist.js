/**
 * Created by Leo on 2016/5/27.
 */

;(function ($, window) {
    'use strict';
    var courseType = {
        require: 0,
        choose: 1
    };
    //数据仓库
    var store = {
        coursesSearch: function (data, course) {
            var url = '/' + projectCode + '/trains/' + trainId + '/courses/search';
            data.course_type = courseType[course];
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'POST',
                cache: false
            });
        },
        getTrainDetail: function () {
            var url = '/' + projectCode + '/trains/' + trainId + '/detail';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        //删除(DELETE)
        deleteCourse: function (data) {
            var url = '/' + projectCode + '/trains/' + trainId + '/courses?' + data;

            return $.ajax({
                url: url,
                type: 'DELETE',
                cache: false
            });
        },
        onOffLine: function (data) {
            var url = '/' + projectCode + '/trains/' + trainId + '/courses/status';

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        changeType: function (data) {
            var url = '/' + projectCode + '/trains/' + trainId + '/courses/type';

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        relationCourses: function (data) {
            var url = '/' + projectCode + '/trains/' + trainId + '/courses/relation';

            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                cache: false
            });
        },
        sort: function (course_id, sort_number) {
            var url = '/' + projectCode + '/trains/' + trainId + '/courses/' + course_id + '/sort_number/' + sort_number + '/';

            return $.ajax({
                url: url,
                type: 'PUT',
                cache: false
            });
        },
        //获取上传cs用的session
        getUploadSession: function () {
            var url = '/' + projectCode + '/trains/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        }
    };
    //列表数据模型
    var viewModel = {
        model: {
            head: {
                cover_url: '',
                enabled: false,
                title: '',
                course_count: '',
                exam_count: '',
                user_count: '',
                course_hour: 0,
                require_hour: 0,
                option_hour: 0,
                description: '',
                attention: ''
            },
            require: {
                items: [],
                filter: {
                    name: '',//课程名称
                    sort_type: 1//排序类型 1：综合 2：最新 3：最热
                },
                style: 'pic', //列表显示风格
                selectedArray: [],// 勾选到的item
                setSortable: '',// 设置sortable
            },
            choose: {
                items: [],
                filter: {
                    name: '',//课程名称
                    sort_type: 1//排序类型 1：综合 2：最新 3：最热
                },
                style: 'pic', //列表显示风格
                selectedArray: [],// 勾选到的item
                setSortable: '',// 设置sortable
            },
            isShowModal: false,
            relationType: 0
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            var _self = this;
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            this._tipSubscribe();

            this._initSortable();
            //ko绑定作用域
            this.koBind();
            //加载事件
            this._eventInit();
            //加载列表
            this._loadData();
        },
        koBind: function () {
            var $content = $('#js-content');
            ko.applyBindings(this, $content[0]);
            $content.show();
        },
        _getHead: function () {
            var koHead = this.model.head,
                head = ko.mapping.toJS(koHead);
            $.when(store.getTrainDetail(), store.getUploadSession()).done(function (returnData, resData) {
                var data = returnData[0];
                for (var key in head) {
                    if (head.hasOwnProperty(key)) {
                        if (key == 'attention') {
                            data.attention = data[key].replace(/\n/g, '<br/>').replace(/\$\{cs_host}/gim, resData[0].server_url);
                        }
                        koHead[key](data[key]);
                    }
                }
            });
        },
        coursePoolShow: function (type) {
            this.model.relationType(type);
            this.model.isShowModal(true);
        },
        saveFromPool: function (data) {
            var data = {
                course_type: this.model.relationType(),
                course_ids: data.map(function (item) {
                    return item.id;
                })
            }, _self = this;
            if (data.course_ids.length) {
                store.relationCourses(data).done(function () {
                    Utils.msgTip('保存成功！').done(function () {
                        _self._getHead();
                        _self._list(data.course_type === 0 ? 'require' : 'choose');
                    });
                });
            } else {
                Utils.alertTip('请选择课程！');
            }
        },
        _loadData: function () {
            this._getHead();
            this._list('require');
            this._list('choose');
        },
        _tipSubscribe: function () {
            var model = this.model, _self = this;
            ;
            ['require', 'choose'].forEach(function (item) {
                model[item].items.extend({
                    notify: 'always'
                });
                model[item].toolbarDeleteShow = ko.pureComputed(function () {
                    return !this._filterKey(model[item].selectedArray(), 'status', 1);
                }, _self);
            });
        },
        _initSortable: function () {
            var _self = this;
            ;
            ['require', 'choose'].forEach(function (item) {
                _self[item + 'Sortable'] = {
                    options: {
                        sortableOp: {
                            items: 'li.item',
                            tolerance: 'pointer',
                            delay: '100',
                            cursor: "move",
                            placeholder: 'sort-state-highlight item cf',
                        },
                        koModelOp: {
                            sortableItems: viewModel.model[item].items,//ko.observable,排序item
                            setSortable: viewModel.model[item].setSortable,//ko.observable
                        },
                        leoSortableOp: {
                            beforeInit: function ($el) {
                                $el.css('display', 'block');//chrome下自定义标签不占位导致拖拽位置计算错误
                            },
                            sortableStart: function (event, ui, targetIndex) {
                                _self.clearSelect(item);
                            },
                            sortableStop: function (event, ui, op) {
                                if (op.targetItem.course_id === op.dropItem.course_id) {
                                    return;
                                }
                                var sort_number = +op.dropItem.sort_number;
                                if (op.targetIndex > op.dropIndex) {
                                    sort_number = sort_number + 1;
                                }
                                store.sort(op.targetItem.course_id, sort_number).done(function () {
                                    _self._list('require');
                                    _self._list('choose');
                                });
                            },
                        }
                    }
                };
                _self[item + 'TableSortable'] = {
                    options: {
                        sortableOp: {
                            items: 'tr.item',
                            tolerance: 'pointer',
                            delay: '100',
                            cursor: "move",
                            helper: function (event, $item) {
                                var $clone = $item.clone().css('background', '#f9f9f9'), $cloneTds = $clone.find('td');
                                $item.find('td').each(function (i, item) {
                                    $cloneTds[i].width = $(item).outerWidth() + 'px';
                                    i === 0 && $($cloneTds[i]).removeClass('on');
                                });
                                return $clone;
                            },
                        },
                        koModelOp: {
                            sortableItems: viewModel.model[item].items,//ko.observable,排序item
                            setSortable: viewModel.model[item].setSortable,//ko.observable
                        },
                        leoSortableOp: {
                            beforeInit: function ($el) {
                                $el.css('display', 'block');//chrome下自定义标签不占位导致拖拽位置计算错误
                            },
                            sortableStart: function (event, ui, targetIndex) {
                                _self.clearSelect(item);
                            },
                            sortableStop: function (event, ui, op) {
                                if (op.targetItem.course_id === op.dropItem.course_id) {
                                    return;
                                }
                                var sort_number = +op.dropItem.sort_number;
                                if (op.targetIndex > op.dropIndex) {
                                    sort_number = sort_number + 1;
                                }
                                store.sort(op.targetItem.course_id, sort_number).done(function () {
                                    _self._list('require');
                                    _self._list('choose');
                                });
                            },
                        }
                    }
                }
            });
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventInit: function () {
            var _self = this, $jsRequire = $('#js-require'), $jsChoose = $('#js-choose');
            //item操作事件集
            $jsRequire.on('click', '.item-check', function () {
                var $checkItem = $(this), hasCheck = $checkItem.hasClass('active');
                $jsRequire.find('.item-check').removeClass('active');
                if (!hasCheck) {
                    $checkItem.addClass('active');
                }
            });
            $jsChoose.on('click', '.item-check', function () {
                var $checkItem = $(this), hasCheck = $checkItem.hasClass('active');
                $jsChoose.find('.item-check').removeClass('active');
                if (!hasCheck) {
                    $checkItem.addClass('active');
                }
            });
            //回车搜索
            $('#js-requireQuery').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch('require');
                }
            });
            $('#js-chooseQuery').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch('choose');
                }
            });
        },
        _filterKey: function (arr, key, val) {
            var i = arr.length;
            while (i--) {
                if (arr[i][key] === val) {
                    return true;
                }
            }
            return false;
        },
        /**
         * 课程列表初始化
         * @return {null} null
         */
        _list: function (course) {
            var _self = this,
                _filter = _self.model[course].filter,
                //_search = _self._filterParams(ko.mapping.toJS(_filter)),
                _search = ko.mapping.toJS(_filter);
            store.coursesSearch(_search, course).done(function (data) {
                _self.model[course].items(Array.isArray(data) ? data : []);
                _self.clearSelect(course);
            });
        },
        toChange: function (choose, status) {
            var _self = this, data = {
                course_type: status,
                course_ids: viewModel._getArrayProp(viewModel.model[choose].selectedArray(), 'course_id')
            };
            store.changeType(data).done(function (data) {
                _self._getHead();
                _self._list('require');
                _self._list('choose');
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
                    _params[key] = encodeURIComponent(params[key]);
                }
            }
            return _params;
        },
        /**
         * 图片列表模式切换
         * @param  {string} type 模式名
         * @return {null}      null
         */
        styleChange: function (choose, type) {
            this.model[choose].style(type);
        },
        /**
         * 搜索
         * @return {null} null
         */
        doSearch: function (choose) {
            this._list(choose);
        },
        _params: function (params, key) {
            var _params = "";
            params.forEach(function (item) {
                _params = _params + key + "=" + item + "&";
            });
            return _params.substring(0, _params.length - 1);
        },
        /**
         * 移除勾选的项目
         * @return {null} null
         */
        deleteItems: function (choose, data) {
            var _self = this, ids;
            if (data) {
                ids = viewModel._getArrayProp([data], 'course_id');
            } else {
                ids = viewModel._getArrayProp(viewModel.model[choose].selectedArray(), 'course_id');
            }
            Utils.confirmTip('确定删除？', {
                icon: 7,
                btn: ['确定', '取消']
            }).then(function (index) {
                store.deleteCourse(_self._params(ids, 'course_ids')).done(function () {
                    Utils.msgTip('删除成功!').done(function () {
                        _self._list(choose);
                    });
                });
            });
        },
        /**
         * 更新上下线
         */
        onOffLine: function (course, selectedArray, status) {
            var _self = this, ids, data;
            ids = viewModel._getArrayProp(Array.isArray(selectedArray) ? selectedArray : [selectedArray], 'course_id');
            data = {
                status: status,
                course_ids: ids
            };
            store.onOffLine(data).done(function (data) {
                Utils.msgTip((status == 1 ? '上线' : '下线') + '成功!').done(function () {
                    _self._getHead();
                    _self._list(course);
                });
            });
        },
        //项目item勾选事件
        checkClick: function (course) {
            var selectedArray = viewModel.model[course].selectedArray, index = selectedArray.indexOf(this);
            if (index > -1) {
                selectedArray.remove(this);
            } else {
                selectedArray.push(this)
            }
        },
        _getArrayProp: function (array, prop) {
            return array.map(function (item) {
                return item[prop];
            });
        },
        //清除选择
        clearSelect: function (course) {
            viewModel.model[course].selectedArray([]);
        },
        //通用分类事件
        orderSearch: function (course, sort_type) {
            viewModel.model[course].filter.sort_type(sort_type);
            this.doSearch(course);
            if (sort_type === 1) {
                viewModel.model[course].setSortable(['option', 'disabled', false]);
            } else {
                viewModel.model[course].setSortable(['option', 'disabled', true]);
            }
        },
    };
    /**
     * 执行程序
     */
    $(function () {
        viewModel._init();
    });
})(jQuery, window);