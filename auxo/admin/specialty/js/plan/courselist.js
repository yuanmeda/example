/**
 * 专业课程列表
 */

;
(function ($, window) {
    'use strict';
    var courseType = {
        require: 1,
        choose: 0
    };
    //数据仓库
    var store = {
        // 获取培养计划下的学期
        queryTermPlan: function () {
            var url = '/' + projectCode + '/specialty/plan/terms/' + specialtyId;
            return $.ajax({
                url: url,
                cache: false
            });
        },
        // 获取培养计划下的课程
        coursesSearch: function (filter, type) {
            var url = '/' + projectCode + '/specialty/plans/' + specialtyId + '/learning_units/search';
            filter.is_required = courseType[type];
            return $.ajax({
                url: url,
                data: filter,
                type: 'GET',
                cache: false
            });
        },
        //批量删除培养计划课程
        deleteCourse: function (ids) {
            var url = '/' + projectCode + '/specialty/courses?ids=' + ids.join(',');
            return $.ajax({
                url: url,
                type: 'DELETE',
                cache: false
            });
        },
        // 上线/下线
        onOffLine: function (status, ids) {
            var url = '/' + projectCode + '/specialty/courses/status/' + status;
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(ids),
                contentType: 'application/json',
                cache: false
            });
        },
        // 选修必须转化
        changeType: function (isRequired, ids) {
            var url = '/' + projectCode + '/specialty/courses/is_required/' + isRequired;

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(ids),
                cache: false
            });
        },
        // 批量创建培养计划课程（从课程资源池添加课程）
        relationCourses: function (data) {
            var url = '/' + projectCode + '/specialty/courses/batch';

            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                cache: false
            });
        },
        // 培养计划课程排序
        sort: function (cId, sNum) {
            var url = '/' + projectCode + '/specialty/courses/' + cId + '/sort?sort_num=' + sNum;

            return $.ajax({
                url: url,
                type: 'PUT',
                cache: false
            });
        },
        updateTermTitle: function (id, title) {
            var url = '/' + projectCode + '/specialty/term/' + id + '/update_term_name';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify({term_name: title})
            });
        }
    };
    //列表数据模型
    var viewModel = {
        model: {
            terms: [],
            activeTerm: null,
            require: {
                items: [],
                count: 0, //总课程
                score: 0, //总学分
                hour: 0,//总学时
                filter: {
                    name: '', //课程名称
                    order: 1, //排序类型 0：综合 1：最新 2：最热
                    page: 0,
                    size: 9999
                },
                style: 'pic', //列表显示风格
                selectedArray: [], // 勾选到的item
                setSortable: '', // 设置sortable
            },
            choose: {
                items: [],
                count: 0, //总课程
                score: 0, //总学分
                hour: 0,//总学时
                filter: {
                    name: '', //课程名称
                    order: 1, //排序类型 0：综合 1：最新 2：最热
                    page: 0,
                    size: 9999
                },
                style: 'pic', //列表显示风格
                selectedArray: [], // 勾选到的item
                setSortable: '', // 设置sortable
            },
            isShowModal: false,
            relationType: 0,
            termInfo: {
                id: 0,
                term_name: ''.model
            }
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
            // 加载培养计划学期
            this._queryTermPlan();

            // $('.pre-view').hide();
        },
        koBind: function () {
            var $content = $('#js-content');
            this.model.activeTerm.subscribe(function (term) {
                this._loadData(term);
            }, this);
            this.model.require.items.subscribe(function (items) {
                this.model.require.count(items.length);
                this.model.require.score(items.reduce(function (score, next) {
                    return Math.round((score + next.score) * 100) / 100;
                }, 0));
                this.model.require.hour(items.reduce(function (hour, next) {
                    return Math.round((hour + next.extra.period ? next.extra.period : 0) * 100) / 100;
                }, 0));
            }, this);
            this.model.choose.items.subscribe(function (items) {
                this.model.choose.count(items.length);
                this.model.choose.score(items.reduce(function (score, next) {
                    return Math.round((score + next.score) * 100) / 100;
                }, 0));
                this.model.choose.hour(items.reduce(function (hour, next) {
                    return Math.round((hour + next.extra.period ? next.extra.period : 0) * 100) / 100;
                }, 0));
            }, this);
            ko.applyBindings(this, $content[0]);
            $content.show();
        },
        formatMin: function (seconds) {
            if (!seconds)
                return "无";

            return parseInt(seconds) / 60;
        },
        // 培养计划下的学期
        _queryTermPlan: function () {
            var _self = this
            store.queryTermPlan()
                .then(function (d) {
                    _self.model.terms(d);
                    if (d && d.length) {
                        _self.model.activeTerm(_self.model.activeTerm() || d[0].id);
                    }
                });
        },
        // 加载学期下课程
        _loadData: function (term) {
            this._list('require', term);
            this._list('choose', term);
        },
        // 获取课程列表
        _list: function (courseType) {
            var _self = this,
                _filter = _self.model[courseType].filter,
                _search = ko.mapping.toJS(_filter);
            _search.term_id = this.model.activeTerm();
            store.coursesSearch(this._filterParams(_search), courseType).done(function (data) {
                _self.model[courseType].items(data.items ? data.items : []);
                _self.clearSelect(courseType);
            });
        },
        onTernClick: function (binds) {
            this.model.activeTerm(binds.id);
        },
        editTermTitle: function (obj, evt) {
            evt.stopPropagation();
            this.model.termInfo.id(obj.id);
            this.model.termInfo.term_name(obj.term_name);
            $('#editTermModal').modal('show');
        },
        editConfirm: function () {
            var t = this;
            if (this.model.termInfo.term_name().trim().length < 1) {
                Utils.msgTip('请输入名称', {
                    icon: 7
                });
                return;
            }
            store.updateTermTitle(this.model.termInfo.id(), this.model.termInfo.term_name()).then(function () {
                $('#editTermModal').modal('hide');
                Utils.msgTip('保存成功！');
                t._queryTermPlan();
            });
        },
        coursePoolShow: function (type) {
            this.model.relationType(type);
            this.model.isShowModal(true);
        },
        saveFromPool: function (data) {
            var data = {
                    is_required: this.model.relationType(),
                    business_course_ids: data.map(function (item) {
                        return item.id;
                    }),
                    score: 0,
                    term_id: this.model.activeTerm(),
                    specialty_plan_id: specialtyId
                },
                _self = this;
            if (data.business_course_ids.length) {
                store.relationCourses(data).done(function () {
                    Utils.msgTip('保存成功！').done(function () {
                        _self._list(data.is_required === 1 ? 'require' : 'choose');
                    });
                });
            } else {
                Utils.alertTip('请选择课程！');
            }
        },
        _tipSubscribe: function () {
            var model = this.model,
                _self = this;
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
                            sortableItems: viewModel.model[item].items, //ko.observable,排序item
                            setSortable: viewModel.model[item].setSortable, //ko.observable
                        },
                        leoSortableOp: {
                            beforeInit: function ($el) {
                                $el.css('display', 'block'); //chrome下自定义标签不占位导致拖拽位置计算错误
                            },
                            sortableStart: function (event, ui, targetIndex) {
                                _self.clearSelect(item);
                            },
                            sortableStop: function (event, ui, op) {
                                if (op.targetItem.id === op.dropItem.id) {
                                    return;
                                }
                                var sort_num = +op.dropItem.sort_num;
                                if (op.targetIndex > op.dropIndex) {
                                    sort_num = sort_num + 1;
                                }
                                store.sort(op.targetItem.id, sort_num).done(function () {
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
                                var $clone = $item.clone().css('background', '#f9f9f9'),
                                    $cloneTds = $clone.find('td');
                                $item.find('td').each(function (i, item) {
                                    $cloneTds[i].width = $(item).outerWidth() + 'px';
                                    i === 0 && $($cloneTds[i]).removeClass('on');
                                });
                                return $clone;
                            },
                        },
                        koModelOp: {
                            sortableItems: viewModel.model[item].items, //ko.observable,排序item
                            setSortable: viewModel.model[item].setSortable, //ko.observable
                        },
                        leoSortableOp: {
                            beforeInit: function ($el) {
                                $el.css('display', 'block'); //chrome下自定义标签不占位导致拖拽位置计算错误
                            },
                            sortableStart: function (event, ui, targetIndex) {
                                _self.clearSelect(item);
                            },
                            sortableStop: function (event, ui, op) {
                                if (op.targetItem.id === op.dropItem.id) {
                                    return;
                                }
                                var sort_num = +op.dropItem.sort_num;
                                if (op.targetIndex > op.dropIndex) {
                                    sort_num = sort_num + 1;
                                }
                                store.sort(op.targetItem.id, sort_num).done(function () {
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
            var _self = this,
                $jsRequire = $('#js-require'),
                $jsChoose = $('#js-choose');
            //item操作事件集
            $jsRequire.on('click', '.item-check', function () {
                var $checkItem = $(this),
                    hasCheck = $checkItem.hasClass('active');
                $jsRequire.find('.item-check').removeClass('active');
                if (!hasCheck) {
                    $checkItem.addClass('active');
                }
            });
            $jsChoose.on('click', '.item-check', function () {
                var $checkItem = $(this),
                    hasCheck = $checkItem.hasClass('active');
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
        toChange: function (choose, status) {
            var _self = this,
                data = {
                    course_type: status,
                    course_ids: viewModel._getArrayProp(viewModel.model[choose].selectedArray(), 'id')
                };
            store.changeType(data.course_type, data.course_ids).done(function (data) {
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
                    _params[key] = params[key];
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
        /**
         * 移除勾选的项目
         * @return {null} null
         */
        deleteItems: function (choose, data) {
            var _self = this,
                ids;
            if (data) {
                ids = viewModel._getArrayProp([data], 'id');
            } else {
                ids = viewModel._getArrayProp(viewModel.model[choose].selectedArray(), 'id');
            }
            Utils.confirmTip('确定删除？', {
                icon: 7,
                btn: ['确定', '取消']
            }).then(function (index) {
                store.deleteCourse(ids).done(function () {
                    Utils.msgTip('删除成功!').done(function () {
                        _self._list(choose);
                    });
                });
            });
        },
        // 更新上下线
        onOffLine: function (course, selectedArray, status) {
            var _self = this,
                ids, data;
            ids = viewModel._getArrayProp(Array.isArray(selectedArray) ? selectedArray : [selectedArray], 'id');
            store.onOffLine(status, ids).done(function (data) {
                Utils.msgTip((status == 1 ? '上线' : '下线') + '成功!').done(function () {
                    _self._list(course);
                });
            });
        },
        //项目item勾选事件
        checkClick: function (course) {
            var selectedArray = viewModel.model[course].selectedArray,
                index = selectedArray.indexOf(this);
            if (index > -1) {
                selectedArray.remove(this);
            } else {
                selectedArray.push(this)
            }
        },
        // 获取对象数组特定属性值
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
        orderSearch: function (course, order) {
            viewModel.model[course].filter.order(order);
            this.doSearch(course);
            if (order === 1) {
                viewModel.model[course].setSortable(['option', 'disabled', false]);
            } else {
                viewModel.model[course].setSortable(['option', 'disabled', true]);
            }
        },
        // 课程图谱预览
        preview: function () {
            $('#preview_modal_js').modal('show');
        }
    };
    /**
     * 执行程序
     */
    $(function () {
        viewModel._init();
    });
})(jQuery, window);
