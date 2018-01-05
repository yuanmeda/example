/**
 * 专业课程列表
 */

;
(function ($, window) {
    'use strict';

    // 本地调试开关
    var local_debug = false;
    if (window.location.host.indexOf('local.web.nd') > -1) {
        local_debug = false;
    }

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
        // 获取课程类别
        queryContainers: function () {
            var url = window.envconfig.service + '/v1/teaching_plans/' + specialtyId + '/containers';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        // 获取培养计划下的课程
        queryCourses: function (filter) {
            var url = '/' + projectCode + '/teachingplans/' + specialtyId + '/modulecourses';
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
        // 课程移动
        changeType: function (data) {
            var url = window.envconfig.service + '/v1/teaching_plans/' + specialtyId + '/actions/res_move';

            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                cache: false
            });
        },
        // 批量创建培养计划课程（从课程资源池添加课程）
        relationCourses: function (data) {
            var url = '/' + projectCode + '/teachingplans/courses/batch';

            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                cache: false
            });
        },
        //删除模块
        deleteModule: function (containerId, moduleId) {
            var url = window.envconfig.service + '/v1/teaching_plans/' + specialtyId + '/containers/' + containerId + '/modules/' + moduleId;
            return $.ajax({
                url: url,
                type: 'DELETE',
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
        },
        // 获取所有模块
        queryModules: function () {
            var url = window.envconfig.service + '/v1/course_module';
            return $.ajax({
                url: url,
                data: {'page': 0, 'size': 99999},
                cache: false
            });
        },
        // 增加模块
        importModule: function (container_id, dataObj) {
            var url = window.envconfig.service + '/v1/teaching_plans/' + specialtyId + '/containers/' + container_id + '/modules';
            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(dataObj),
                cache: false
            });
        }
    };
    //列表数据模型
    var viewModel = {
        // 点击按钮“从课程资源池中添加”，保存当前类别、模块信息
        coursePoolInfoObj: {},
        // 点击按钮“新建课程模块”，保存当前类别信息
        importModelInfoObj: {},

        model: {
            //类别信息
            containers: [],
            //类别、模块组合信息，移动联动下拉框用
            cmRelations: [],
            terms: [],
            activeTerm: null,
            termInfo: {
                id: 0,
                term_name: ''.model
            },
            isShowModal: false,
            // 新建课程模块弹出框中，所有的模块信息
            importModels: [],
            // 新建课程模块弹出框中，选中的模块
            selectImportModel: ''
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

            //ko绑定作用域
            this.koBind();

            // 加载课程模块
            this._queryModules();

            // 加载培养计划学期
            this._queryTermPlan();

            // $('.pre-view').hide();
        },

        _queryModules: function () {
            var _self = this;

            if (local_debug) {
            } else {
                store.queryModules().done(function (data) {
                    // 取得所有模块
                    _self.model.importModels(data.items)
                });
            }
        },

        koBind: function () {
            var $content = $('#js-content');
            this.model.activeTerm.subscribe(function (term) {
                this._loadData(term);
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
            var _self = this;

            store.queryTermPlan()
                .then(function (d) {
                    _self.model.terms(d);
                    if (d && d.length) {
                        _self.model.activeTerm(_self.model.activeTerm() || d[0].id);
                    }
                });
        },

        // 加载学期下课程
        _loadData: function () {
            var _self = this;

            store.queryContainers().done(function (data) {
                var containersCount = data.length;

                var arrayPromise = [];
                for (var i = 0; i < containersCount; i++) {
                    var id = data[i].course_container_id;
                    var oldIndex = _self.getContainerIndexById(id);

                    var _search = {};
                    if (oldIndex > -1) {
                        _search = ko.mapping.toJS(_self.model.containers()[oldIndex].filter);
                    }
                    _search.term_id = _self.model.activeTerm();
                    _search.container_id = id;

                    arrayPromise.push(store.queryCourses(_self._filterParams(_search)));
                }

                (function (arr) {
                    return $.when.apply($, arr);
                })(arrayPromise).done(function () {
                    for (var k = 0; k < arguments.length; k++) {
                        var containerData = arguments[k][0];

                        _self.updateObservableArrayItem(containerData, k);
                        //加载事件
                        _self._eventInit(containerData, k);
                    }

                    // 删除已经不存在的
                    var modelLen = _self.model.containers().length;
                    if (modelLen > 0) {
                        for (var j = modelLen; j > containersCount; j--) {
                            _self.model.containers.splice(j - 1, 1);
                        }
                    }
                });
            });
        },
        /*
         ***刷新单一类别
         * containerId：类别Id
         * newIndex：类别所在的index
         */
        _list: function (containerId, newIndex) {
            var _self = this;

            var _search = ko.mapping.toJS(_self.model.containers()[newIndex].filter);
            _search.term_id = this.model.activeTerm();
            _search.container_id = containerId;

            store.queryCourses(this._filterParams(_search)).done(function (data) {
                // 更新observableArray数据
                _self.updateObservableArrayItem(data, newIndex, true);
                //加载事件
                _self._eventInit(data, newIndex);
            });
        },
        /*
         ***更新observableArray数据
         * data：数据
         * newIndex：更新后所在的index
         * bIndexNoChange：更新前的index与更新后的是否相同
         */
        updateObservableArrayItem: function (data, newIndex, bIndexNoChange) {
            var _self = this;

            var id = data.container_id;

            var oldIndex = -1;
            if (bIndexNoChange) {
                oldIndex = newIndex;
            } else {
                oldIndex = _self.getContainerIndexById(id);
            }

            //不是新增
            if (oldIndex > -1) {
                // 取出当前数据
                var orginContainers = ko.mapping.toJS(this.model.containers()[oldIndex]);
                data.filter = orginContainers.filter;
                data.style = orginContainers.style;
            } else {
                data.filter = {
                    name: '', //课程名称
                    order: 1, //排序类型 1：综合 2：最新 3：最热
                    page: 0,
                    size: 9999
                };
                data.style = 'pic'; //列表显示风格
            }

            // 总资源数
            data.count = 0;
            // 总学分
            data.score = 0;
            // 总学时
            data.hour = 0;

            var moduleCnt = data.module_count;
            for (var i = 0; i < moduleCnt; i++) {
                var module = data.modules[i];

                // 模块勾选到的item
                module.selectedArray = [];

                // 模块总资源数
                module.count = module.courses.length;
                // 模块总学分
                module.score = (module.courses.reduce(function (score, next) {
                    return _self.getRoundNumber(score + next.score);
                }, 0));
                // 模块总学时
                module.hour = (module.courses.reduce(function (hour, next) {
                    var nextPeriod = next.extra.period ? parseFloat(next.extra.period) : 0;
                    return _self.getRoundNumber(hour + nextPeriod);
                }, 0));

                // 移动的目的类别
                module.desContainer = ko.observable();
                // 移动的目的模块
                module.desModule = ko.observable();

                // 模块总数累加到类别总数中
                data.count = _self.getRoundNumber(data.count + module.count);
                data.score = _self.getRoundNumber(data.score + module.score);
                data.hour = _self.getRoundNumber(data.hour + module.hour);
            }

            data = ko.mapping.fromJS(data);

            for (i = 0; i < moduleCnt; i++) {
                (function (moduleIndex) {
                    // 模块工具条，删除按钮是否可见
                    data.modules()[moduleIndex].toolbarDeleteShow = ko.pureComputed(function () {
                        return !this._filterKey(data.modules()[moduleIndex].selectedArray(), 'status', 1);
                    }, _self);
                })(i);

                (function (moduleIndex) {
                    // 模块工具条移动的类别、模块组合框显示用
                    data.modules()[moduleIndex].cmRelation = ko.pureComputed(function () {
                        return _self.getCmRelations();
                    }, _self);
                })(i);

            }

            if (oldIndex > -1) {
                // 不是新的
                if (oldIndex === newIndex) {
                    // 替换旧的
                    _self.model.containers.splice(newIndex, 1, data);
                } else if (oldIndex < newIndex) {
                    // 增加新的，再删除旧的（似乎不存在这种case）
                    _self.model.containers.splice(newIndex, 0, data);
                    _self.model.containers.splice(oldIndex, 1);
                } else if (oldIndex > newIndex) {
                    // 删除旧的，再增加新的
                    _self.model.containers.splice(oldIndex, 1);
                    _self.model.containers.splice(newIndex, 0, data);
                }
            } else {
                // 是新的
                _self.model.containers.splice(newIndex, 0, data);
            }
        },
        /*
         ***类别、模块组合数据取得
         */
        getCmRelations: function () {
            var retArray = [];

            var containers = this.model.containers();

            var cLen = containers.length;
            // 遍历类别
            for (var i = 0; i < cLen; i++) {
                var container = containers[i];

                var cmObj = {
                    // 取得类别ID和类别名
                    cId: container.container_id(),
                    cName: container.container_name(),
                    modules: []
                };

                var modules = container.modules();
                var mLen = modules.length;

                for (var j = 0; j < mLen; j++) {
                    var module = modules[j];

                    // 只有类别，没有模块，此时的id为空
                    if (!module.module_id()) {
                        continue;
                    }

                    // 取得模块ID和模块名
                    var moduleObj = {
                        mId: module.module_id(),
                        mName: module.name()
                    };

                    cmObj.modules.push(moduleObj);
                }
                retArray.push(cmObj)
            }

            return retArray;
        },
        /*
         ***浮点计算取得小数点后两位
         */
        getRoundNumber: function (number) {
            var num = number ? parseFloat(number) : 0;
            return Math.round((num) * 100) / 100;
        },
        /*
         ***浮点计算取得小数点后两位,空值就显示-（实践学时、周学时）
         * 时间为妙，需转化为小时
         */
        getRoundNumber2: function (number) {
            if (number === null || number === '') return '-';
            return (+number / 3600).toFixed(2);
        },
        /*
         ***根据Id取得Index
         */
        getContainerIndexById: function (containerId) {
            return this.model.containers().findIndex(function (element) {
                return element.container_id() === containerId;
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
        /*
         ***新增课程模块弹出框显示
         * cId：类别名
         * cIndex：模块序号
         */
        importModule: function (cId, cIndex) {
            this.importModelInfoObj = {
                cId: cId,
                cIndex: cIndex
            };
            $('#importModuleModal').modal('show');
        },
        /*
         ***新增课程模块弹出框
         */
        importConfirm: function () {
            var _self = this;
            // 选择为空
            if (!this.model.selectImportModel()) {
                Utils.msgTip('请选择模块', {
                    icon: 7
                });
                return;
            }

            var data = {
                "cou_module_id": _self.model.selectImportModel().course_module_id,
                "term_id": _self.model.activeTerm()
            };

            store.importModule(_self.importModelInfoObj.cId, data).then(function () {
                $('#importModuleModal').modal('hide');
                Utils.msgTip('保存成功！');
                _self._list(_self.importModelInfoObj.cId, _self.importModelInfoObj.cIndex);
            });
        },
        /*
         ***从课程资源池中添加弹出框显示
         * containerId：类别名
         * containerIndex：类别序号
         * moduleId：模块Id
         */
        coursePoolShow: function (containerId, containerIndex, moduleId) {
            this.coursePoolInfoObj = {
                relation_containerId: containerId,
                relation_containerIndex: containerIndex,
                relation_moduleId: moduleId
            };

            this.model.isShowModal(true);
        },
        /*
         ***从课程资源池中添加
         * dataParam：弹出框返回
         */
        saveFromPool: function (dataParam) {
            var _self = this;

            var data = {
                coursecontainer_id: this.coursePoolInfoObj.relation_containerId,
                coumodule_id: this.coursePoolInfoObj.relation_moduleId,
                business_course_ids: dataParam.map(function (item) {
                    return item.id;
                }),
                score: 0,
                term_id: this.model.activeTerm(),
                specialty_plan_id: specialtyId
            };
            if (data.business_course_ids.length) {
                store.relationCourses(data).done(function () {
                    Utils.msgTip('保存成功！').done(function () {
                        _self._list(
                            _self.coursePoolInfoObj.relation_containerId,
                            _self.coursePoolInfoObj.relation_containerIndex);
                    });
                });
            } else {
                Utils.alertTip('请选择课程！');
            }
        },
        /*
         ***删除模块
         * containerId：类别名
         * containerIndex：类别序号
         * moduleId：模块Id
         */
        deleteModule: function (containerId, containerIndex, moduleId) {
            var _self = this;

            Utils.confirmTip('确定删除课程模块？', {
                icon: 7,
                btn: ['确定', '取消']
            }).then(function () {
                store.deleteModule(containerId, moduleId).done(function () {
                    Utils.msgTip('删除成功！').done(function () {
                        _self._list(containerId, containerIndex);
                    });
                });
            });
        },

        _tipSubscribe: function () {
            var model = this.model;

            model.containers.extend({
                notify: 'always'
            });
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventInit: function (containerData, index) {
            var _self = this;

            var containerId = containerData.container_id;
            var moduleLen = containerData.modules.length;

            for (var i = 0; i < moduleLen; i++) {
                (function (i) {
                    var $module = $('#js-' + containerId + '-' + i);

                    //item操作事件集
                    $module.on('click', '.item-check', function () {
                        var $checkItem = $(this),
                            hasCheck = $checkItem.hasClass('active');
                        $module.find('.item-check').removeClass('active');
                        if (!hasCheck) {
                            $checkItem.addClass('active');
                        }
                    });

                })(i);
            }

            $('#js-' + containerId + '-Query').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch(containerId, index);
                }
            });
        },
        _filterKey: function (arr, key, val) {
            var i = arr.length;
            while (i--) {
                if (arr[i][key]() === val) {
                    return true;
                }
            }
            return false;
        },
        /*
         ***移动课程
         * containerIndex：课程所在类别序号
         * moduleIndex：课程所在模块序号
         */
        toChange: function (containerIndex, moduleIndex) {
            var _self = this;

            var container = ko.mapping.toJS(this.model.containers()[containerIndex]);

            var data = {};
            data.src_course_container_id = container.container_id;
            data.src_cou_module_id = container.modules[moduleIndex].module_id;
            data.course_container_id = container.modules[moduleIndex].desContainer.cId;
            data.cou_module_id = container.modules[moduleIndex].desModule ? container.modules[moduleIndex].desModule.mId : null;
            data.res_ids = viewModel._getArrayProp(container.modules[moduleIndex].selectedArray, 'id');

            if (data.src_course_container_id === data.course_container_id &&
                data.src_cou_module_id === data.cou_module_id) {
                Utils.alertTip('移动目标地址与源地址相同，操作中止，请重新选择目标地址！');
                return;
            }

            store.changeType(data).done(function (data) {
                _self._loadData()
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
         * @param containerIndex： 类别所在序号
         * @param  type： 模式名
         * @return {null} null
         */
        styleChange: function (containerIndex, type) {
            this.model.containers()[containerIndex].style(type);
        },
        /**
         * 搜索
         * @return {null} null
         */
        doSearch: function (containerId, index) {
            this._list(containerId, index);
        },
        /**
         * 移除勾选的项目
         * bData：工具条上的删除为false，在特定课程上的删除为true
         * containerIndex：类别序号
         * param：工具条上的删除传入selectArray，在特定课程上的删除传入该数据
         * @return {null} null
         */
        deleteItems: function (bData, containerIndex, param) {
            var _self = this,
                ids;

            var container = ko.mapping.toJS(this.model.containers()[containerIndex]);

            var data = null;
            if (bData) {
                data = ko.mapping.toJS(param);
            } else {
                data = container.modules[param].selectedArray;
            }
            ids = viewModel._getArrayProp(Array.isArray(data) ? data : [data], 'id');

            Utils.confirmTip('确定删除？', {
                icon: 7,
                btn: ['确定', '取消']
            }).then(function (index) {
                store.deleteCourse(ids).done(function () {
                    Utils.msgTip('删除成功!').done(function () {
                        _self._list(container.container_id, containerIndex);
                    });
                });
            });
        },
        /**
         * 更新上下线
         * bData：工具条上的删除为false，在特定课程上的删除为true
         * containerIndex：类别序号
         * param：工具条上的删除传入selectArray，在特定课程上的删除传入该数据
         * @return {null} null
         */
        onOffLine: function (bData, containerIndex, param, status) {
            var _self = this,
                ids;

            var container = ko.mapping.toJS(this.model.containers()[containerIndex]);

            var data = null;
            if (bData) {
                data = ko.mapping.toJS(param);
            } else {
                data = container.modules[param].selectedArray;
            }
            ids = viewModel._getArrayProp(Array.isArray(data) ? data : [data], 'id');

            store.onOffLine(status, ids).done(function () {
                Utils.msgTip((status === 1 ? '上线' : '下线') + '成功!').done(function () {
                    _self._list(container.container_id, containerIndex);
                });
            });
        },
        /**
         * 项目item勾选事件
         * containerIndex：类别序号
         * moduleIndex：模块序号
         * @return {null} null
         */
        checkClick: function (containerIndex, moduleIndex) {
            var selectedArray = viewModel.model.containers()[containerIndex].modules()[moduleIndex].selectedArray,
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
        /**
         * 清除选择
         * containerIndex：类别序号
         * moduleIndex：模块序号
         * @return {null} null
         */
        clearSelect: function (containerIndex, moduleIndex) {
            viewModel.model.containers()[containerIndex].modules()[moduleIndex].selectedArray([]);
        },
        /**
         * 通用分类事件
         * containerIndex：类别序号
         * moduleIndex：模块序号
         * order：综合、最新、最热
         * @return {null} null
         */
        orderSearch: function (containerIndex, containerId, order) {
            viewModel.model.containers()[containerIndex].filter.order(order);
            this.doSearch(containerId, containerIndex);
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
