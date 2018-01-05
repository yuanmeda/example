/**
 * Created by Administrator on 2016.12.28.
 */
(function ($, window) {
    var store = {
        //获取树
        tree: function () {
            return $.ajax({
                url: '/v1/big_statistics/areas',
                type: 'GET'
            })
        },
        //获取列表
        list: function () {
            return $.ajax({
                url: '/v1/big_statistics/config',
                type: 'GET'
            })
        },
        //数据保存
        save: function (data, isRedis) {
            var url = isRedis ? '/v1/big_statistics/config/redis' : '/v1/big_statistics/config';
            return $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        },
        maps: function (areaId) {
            return $.ajax({
                url: '/v1/big_statistics/maps?area_id=' + areaId,
                type: 'GET'
            })
        }
    };
    var utils = {
        /**
         * 是否ko观察对象
         * @param o
         * @returns {*}
         */
        isKo: function (o) {
            return ko.isObservable(o);
        },
        /**
         * 是否ko观察数组
         * @param o
         * @returns {*|boolean}
         */
        isKoArray: function (o) {
            return this.isKo(o) && $.isArray(o.peek());
        },
        /**
         * 将data中的值赋给model，{data中没有对应值的则清空}
         * @param model ko对象
         * @param data js对象
         * @param isClear 是否清空data中没有对应值的属性
         * @returns {*}
         */
        fromJS: function (model, data) {
            if (!model || !data) {
                return model;
            }
            var isClear = $.type(arguments[2]) === 'boolean' ? arguments[2] : true,
                that = this;
            $.each(model, function (name, observableObj) {
                var v = data[name];
                if (that.isKo(observableObj)) {
                    if (that.isKoArray(observableObj)) {
                        if (!$.isArray(v)) {
                            v = v ? (v + '').split(',') : (isClear ? [] : observableObj.peek());
                        }
                    } else if (v == null) {
                        v = isClear ? '' : observableObj.peek();
                    }
                    observableObj(v);
                }
            });
        }
    };
    var tree;

    var viewModel = {
        cacheMap:{},
        $nodes: null,
        model: {
            $areaItem: [],
            cinfigData: {
                project_id: 0,
                title_vo: {
                    "module_title": "string",
                    "view_name": "string"
                },
                studying_vo: {
                    "module_title": "string",
                    "view_name": "string",
                    "status": 0
                },
                study_map_vo: {
                    "module_title": "string",
                    "view_name": "string",
                    "status": 0,
                    "map_text": "string",
                    "configmap_list": [
                        {
                            "area_id": 0,
                            "parent_id": 0,
                            "x": "string",
                            "y": "string",
                            "title": "string",
                            "update_time": "string",
                            "update_user_id": 0
                        }
                    ],
                    "area_id": 0
                },
                study_line_vo: {
                    "module_title": "string",
                    "view_name": "string",
                    "status": 0,
                    "week_or_month": 0
                },
                study_video_vo: {
                    "module_title": "string",
                    "view_name": "string",
                    "status": 0,
                    "video": "string"
                },
                study_rank_vo: {
                    "module_title": "string",
                    "view_name": "string",
                    "status": 0,
                    "stat_org_name": "string",
                    "stat_person_name": "string",
                    "stat_org_num": 0,
                    "stat_person_num": 0,
                    "person_name": "string",
                    "org_name": "string"
                },
                study_project_stat_vo: {
                    "module_title": "string",
                    "view_name": "string",
                    "status": 0,
                    "configmodule_list": [
                        {
                            "module_type": 0,
                            "module_key": "string",
                            "module_status": 0,
                            "sort_number": 0
                        }
                    ]
                },
                study_bottom_vo: {
                    "module_title": "string",
                    "view_name": "string"
                },
                map_or_table: 0
            },
            modal: {
                showMapModal: false,
                showLineModal: false,
                showVideoModal: false,
                showRankModal: false,
                showProjectModal: false,
                showErrorModal: false,
                saveSuccessModal: false,
                showLeastOneModal: false,
                showVideoNoneModal: false,
                showViewNameModal: false
            },
            mapOff: false,
            lineOff: false
        },
        //初始化事件
        init: function () {
            var _this = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('boot'));
            this.model.cinfigData.title_vo.view_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.title_vo.view_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.studying_vo.view_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.studying_vo.view_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.study_map_vo.view_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.study_map_vo.view_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.study_line_vo.view_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.study_line_vo.view_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.study_video_vo.view_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.study_video_vo.view_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.study_rank_vo.view_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.study_rank_vo.view_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.study_project_stat_vo.view_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.study_project_stat_vo.view_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.study_bottom_vo.view_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.study_bottom_vo.view_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.study_rank_vo.org_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.study_rank_vo.org_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this.model.cinfigData.study_rank_vo.person_name.subscribe(function (newValue) {
                if (newValue.length > 100) {
                    _this.model.cinfigData.study_rank_vo.person_name(newValue.substr(0,100));
                    _this.model.modal.showViewNameModal(true);
                }
            });
            this._list();
        },
        _list: function () {
            var t = this;
            store.list().done(function (data) {
                if (data.map_or_table === 1) {
                    t.model.mapOff(true);
                    t.model.lineOff(false);
                    data.study_map_vo.status = 1;
                    data.study_line_vo.status = 0;
                } else if (data.map_or_table === 2) {
                    t.model.mapOff(false);
                    t.model.lineOff(true);
                    data.study_map_vo.status = 0;
                    data.study_line_vo.status = 1;
                } else {
                    data.study_map_vo.status = 0;
                    data.study_line_vo.status = 0;
                }
                t.model.cinfigData.project_id(data.project_id);
                t.model.cinfigData.map_or_table(data.map_or_table);
                //t.model.cinfigData.title_vo(data.title_vo);
                utils.fromJS(t.model.cinfigData.title_vo, data.title_vo);
                utils.fromJS(t.model.cinfigData.studying_vo, data.studying_vo);
                utils.fromJS(t.model.cinfigData.study_map_vo, data.study_map_vo);
                utils.fromJS(t.model.cinfigData.study_line_vo, data.study_line_vo);
                utils.fromJS(t.model.cinfigData.study_video_vo, data.study_video_vo);
                utils.fromJS(t.model.cinfigData.study_rank_vo, data.study_rank_vo);
                utils.fromJS(t.model.cinfigData.study_project_stat_vo, data.study_project_stat_vo);
                utils.fromJS(t.model.cinfigData.study_bottom_vo, data.study_bottom_vo);
                t.initTree();
            });
        },
        //地图曲线二选一
        choseOne: function (vm, e) {
            var value = e.target.value;
            if (value == '2' && this.model.cinfigData.study_line_vo.status) {
                this.model.cinfigData.study_map_vo.status(false);
            } else if (value == '1' && this.model.cinfigData.study_map_vo.status) {
                this.model.cinfigData.study_line_vo.status(false);
            }
            this.model.cinfigData.map_or_table(value);
            return true;
        },
        /**
         * 正常保存配置
         */
        saveConfig: function () {
            this.save(false);
        },
        saveConfig1: function () {
            this.mapSave(false);
        },
        saveConfig2: function () {
            this.videoSave(false);
        },
        saveConfig3: function () {
            this.projectSave(false);
        },
        /**
         * 预览
         * @param type
         */
        saveRedisConfig: function (platform) {
            this.view(true).then(function (data) {
                var $win = $(window);
                var winW = $win.width(), winH = $win.height();
                var opt = ["", 1440, 769, 640];
                var path = "/" + projectCode + "/stat/data?id=" + data.id;
                window.open(path, "previous-" + (new Date()).getTime(), "depended=yes, location=no, menubar=no, resizable=no, scrollbars=yes, titlebar=yes, toolbar=no, z-look=yes, width=" + opt[platform] + ", height=900, left=" + (winW - opt[platform]) / 2 + ", top=" + Math.max(0, (winH - 900) / 2));
            });
        },
        save: function (isRedis) {
            var obj = ko.mapping.toJS(this.model.cinfigData),
                t = this,
                choseProject = [];
            $.each(obj, function (k, v) {
                if (v && v.status != null) {
                    v.status = Number(v.status);
                }
            });
            $.each(obj.study_project_stat_vo.configmodule_list, function (i, v) {
                v.module_status = Number(v.module_status);
            });
                return store.save(obj, isRedis).done(function () {
                    t.model.modal.saveSuccessModal(true);
                    t.model.modal.showLineModal(false);
                    t.model.modal.showRankModal(false);
                });

        },
        mapSave: function (isRedis) {
            var obj = ko.mapping.toJS(this.model.cinfigData),
                t = this,
                choseProject = [];
            $.each(obj, function (k, v) {
                if (v && v.status != null) {
                    v.status = Number(v.status);
                }
            });
            $.each(obj.study_project_stat_vo.configmodule_list, function (i, v) {
                v.module_status = Number(v.module_status);
            });
            if(t.verificationJson(obj.study_map_vo.map_text)) {
                return store.save(obj, isRedis).done(function () {
                    t.model.modal.saveSuccessModal(true);
                    t.model.modal.showMapModal(false);
                });
            } else {
                t.model.modal.showErrorModal(true);
            }
        },
        videoSave: function (isRedis) {
            var obj = ko.mapping.toJS(this.model.cinfigData),
                t = this,
                choseProject = [];
            $.each(obj, function (k, v) {
                if (v && v.status != null) {
                    v.status = Number(v.status);
                }
            });
            $.each(obj.study_project_stat_vo.configmodule_list, function (i, v) {
                v.module_status = Number(v.module_status);
            });
            if( obj.study_video_vo.video != "") {
                return store.save(obj, isRedis).done(function () {
                    t.model.modal.saveSuccessModal(true);
                    t.model.modal.showVideoModal(false);
                });
            }else{
                t.model.modal.showVideoNoneModal(true);
            }
        },
        projectSave: function (isRedis) {
            var obj = ko.mapping.toJS(this.model.cinfigData),
                t = this,
                choseProject = [];
            $.each(obj, function (k, v) {
                if (v && v.status != null) {
                    v.status = Number(v.status);
                }
            });
            $.each(obj.study_project_stat_vo.configmodule_list, function (i, v) {
                v.module_status = Number(v.module_status);
            });
            for (var i = 0;i< obj.study_project_stat_vo.configmodule_list.length;i++) {
                if (obj.study_project_stat_vo.configmodule_list[i].module_status === 1) {
                    choseProject.push(i);
                }
            }
            if(choseProject.length>0) {
                return store.save(obj, isRedis).done(function () {
                    t.model.modal.saveSuccessModal(true);
                    t.model.modal.showProjectModal(false);
                });
            } else {
                t.model.modal.showLeastOneModal(true);
            }
        },


        view:function (isRedis) {
            var obj = ko.mapping.toJS(this.model.cinfigData),
                t = this;
            $.each(obj, function (k, v) {
                if (v && v.status != null) {
                    v.status = Number(v.status);
                }
            });
            $.each(obj.study_project_stat_vo.configmodule_list, function (i, v) {
                v.module_status = Number(v.module_status);
            });
                return store.save(obj, isRedis).done(function () {
                    t.model.modal.showMapModal(false);
                    t.model.modal.showLineModal(false);
                    t.model.modal.showVideoModal(false);
                    t.model.modal.showRankModal(false);
                    t.model.modal.showProjectModal(false);
                });
        },
        verificationJson: function (json) {
                var str = JSON.stringify(json);
                if (str.indexOf('type') > 0 && str.indexOf('feature') > 0) {
                    return true
                } else {
                    return false;
                }
        },
        initTree: function () {
            var t = this;
            var setting = {
                data: {
                    key: {
                        name: 'title'
                    },
                    simpleData: {
                        enable: true,
                        idKey: 'id',
                        pIdKey: 'parent_id',
                        rootId: null
                    }
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        t.model.cinfigData.study_map_vo.area_id(treeNode.id);
                        var present_id = t.model.cinfigData.study_map_vo.area_id();
                        store.maps(present_id).done(function (data) {
                            t.model.cinfigData.study_map_vo.configmap_list(data.configmap_list);
                            t.model.cinfigData.study_map_vo.map_text(data.map_text);
                        })
                    }
                },
                check: {
                    enable: true,
                    chkStyle: "radio",
                    radioType: "all"
                }
            };
            store.tree().then(function (data) {
                tree = $.fn.zTree.init($("#maptree"), setting, data);
                var chosenId = t.model.cinfigData.study_map_vo.area_id();
                var allNodes = t.$nodes = tree.transformToArray(tree.getNodes());
                $.each(allNodes, function (index, item) {
                    if (item.id == chosenId) {
                        tree.expandNode(item,true);
                        tree.selectNode(item);
                        tree.checkNode(item, true);
                    }
                });
            });
        },

        showMap: function () {
            this.cacheMap = ko.mapping.toJS(this.model.cinfigData.study_map_vo);
            this.model.modal.showMapModal(true);
            this.initTree();
        },
        closeMap: function () {
            ko.mapping.fromJS(this.cacheMap, {}, this.model.cinfigData.study_map_vo);
            this.model.modal.showMapModal(false);
        },
        showLine: function () {
            this.cacheMap = ko.mapping.toJS(this.model.cinfigData.study_line_vo);
            this.model.modal.showLineModal(true);
        },
        closeLine: function () {
            ko.mapping.fromJS(this.cacheMap, {}, this.model.cinfigData.study_line_vo);
            this.model.modal.showLineModal(false);
        },
        showVideo: function () {
            this.cacheMap = ko.mapping.toJS(this.model.cinfigData.study_video_vo);
            this.model.modal.showVideoModal(true);
        },
        closeVideo: function () {
            ko.mapping.fromJS(this.cacheMap, {}, this.model.cinfigData.study_video_vo);
            this.model.modal.showVideoModal(false);
        },
        showRank: function () {
            this.cacheMap = ko.mapping.toJS(this.model.cinfigData.study_rank_vo);
            this.model.modal.showRankModal(true);
        },
        closeRank: function () {
            ko.mapping.fromJS(this.cacheMap, {}, this.model.cinfigData.study_rank_vo);
            this.model.modal.showRankModal(false);
        },
        showProject: function () {
            this.cacheMap = ko.mapping.toJS(this.model.cinfigData.study_project_stat_vo);
            this.model.modal.showProjectModal(true);
            var t = this;
            store.list().done(function (data) {
                utils.fromJS(t.model.cinfigData.study_project_stat_vo, data.study_project_stat_vo);
                if(t.model.cinfigData.study_project_stat_vo.configmodule_list.module_status === 2){
                }
            });
        },
        closeProject: function () {
            ko.mapping.fromJS(this.cacheMap, {}, this.model.cinfigData.study_project_stat_vo);
            this.model.modal.showProjectModal(false);
        },
        closeError: function () {
            this.model.modal.showErrorModal(false);
        },
        closeSaveSuccess: function () {
            this.model.modal.saveSuccessModal(false);
        },
        closeLeastOneModal: function () {
            this.model.modal.showLeastOneModal(false);
        },
        closeVideoNoneModal: function () {
            this.model.modal.showVideoNoneModal(false);
        },
        closeShowViewNameModal: function () {
            this.model.modal.showViewNameModal(false);
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);