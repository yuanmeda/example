(function () {
    "use strict";

    function saveUrl(action, type, id) {
        return '//' + location.host + '/' + projectCode + '/resource/link' + '?context_id=' + (window.channelId ? ('el-channel:' + window.channelId) : '') + '&action=' + action + '&unit_type=' + type + (id ? ('&id=' + id) : '');
    }

    var course_config_map = {
        'teaching_course': {
            alias: "教学课",
            create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_manage?business_type=teaching_course&source=channel&__mac=${mac}",
            title: "教学课",
            update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
        },
        'exercise_course': {
            alias: "练习课",
            create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_manage?business_type=exercise_course&source=channel&__mac=${mac}",
            title: "练习课",
            update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
        },
        'offline_course': {
            alias: "线下课",
            create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_manage?business_type=offline_course&source=channel&__mac=${mac}",
            title: "线下课",
            update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
        }
    };
    var RESOURCE_CONFIG_MAP = (function () {
        var map = {}, g = window.allGroupNames;
        for (var i = 0; i < g.length; i++) {
            map[g[i].type] = g[i];
        }
        return $.extend(map, course_config_map);
    }());
    var _ = ko.utils;

    function formatUrl(url, data) {
        url = url || '';
        url = url.replace(/\$\{project_code\}/gi, projectCode);
        if (data) url = url.replace(/\$\{data\.(.+?)(\|(.+?))?\}/gi, function (match, m1, m2, filter) {
            var arr = m1.split('.'), d = data;
            for (var i = 0; i < arr.length; i++)
                d = d[arr[i]];
            if (filter) {
                switch (filter) {
                    case 'e':
                        d = encodeURIComponent(d);
                }
            }
            return d;
        });
        var url_auth = url.replace(/[?&]__mac=\${mac}/, ''),
            mac = Nova.getMacToB64(url_auth);
        url = url.replace(/\${mac}/gi, mac);
        return url;
    }

    var store = {
        getMixOrgTree: function () {
            return $.ajax({
                url: "/" + projectCode + "/manage_orgs",
                data: {org_id: window.projectOrgId},
                type: "get",
                dataType: "json",
                cache: false
            });
        },
        getTag: function () {
            return $.ajax({
                url: "/" + projectCode + "/channels/" + channelId + "/tags/tree",
                type: "get",
                dataType: "json",
                cache: false
            });
        },
        getResource: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/channels/" + channelId + "/resources",
                type: "post",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        getResourceGroup: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/channels/resource_groups",
                dataType: 'json',
                data: data,
                cache: false
            });
        },
        addChannelResource: function (data) {
            return $.ajax({
                url: channelUrl + "/v1/channels/" + channelId + "/resources",
                type: "post",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        deleteChannelResource: function (data) {
            return $.ajax({
                url: channelUrl + "/v1/channels/" + channelId + "/resources",
                type: "delete",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceStatus: function (status, data) {
            return $.ajax({
                url: channelUrl + "/v1/channels/" + channelId + "/resources/status/" + status,
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceIsTop: function (isTop, data) {
            return $.ajax({
                url: channelUrl + "/v1/channels/" + channelId + "/resources/is_top/" + isTop,
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceTags: function (data) {
            return $.ajax({
                url: channelUrl + "/v1/channels/" + channelId + "/resources/tags",
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceForcesync: function (data) {
            return $.ajax({
                url: forceSyncUrl + '/v1/resources/actions/forcesync',
                type: 'put',
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            })
        },
        updateResourcePoolStatus: function (status, data) {
            return $.ajax({
                url: channelUrl + "/v1/resources/enabled/" + status,
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        deleteFamousTeacher: function (teacher_id) {
            return $.ajax({
                url: famousSchoolTeacherUrl + "/v1/gateway_teachers/" + teacher_id,
                type: "delete",
                contentType: "application/json;charset=utf-8"
            });
        },
        deleteFamousSchool: function (school_id) {
            return $.ajax({
                url: famousSchoolTeacherUrl + "/v1/gateway_schools/" + school_id,
                type: "delete",
                contentType: "application/json;charset=utf-8"
            });
        }
    };
    var viewModel = {
        model: {
            items: [],
            total: 0,
            filter: {
                page_size: 20,
                page_no: 0,
                status: '', //状态：0下线，1上线
                online_status: '',
                name: '',//搜索关键字
                no_tag_resource: undefined,//是否查询未贴标签的资源, 默认为false
                tag_ids: [],//标签ID(多值)
                is_top: undefined,//置顶标识
                sort_type: 3,//排序类型：3综合 1最新 2最热
                time_status: '',//1即将开始 2正在开课 3已结束
                group_names: [],//学习单元分组列表
                affiliated_org_nodes: [],
                affiliated_org_node_filter_type: 0,
                audit_status: "",
                is_free: ""
            },
            isLoaded: false,
            allGroupNames: [],
            tags: [],
            listStyle: 'card', //列表显示风格
            selectedArray: [],// 勾选到的item，
            setSortable: '',// 设置sortable
            orgText: "点击查看或选择组织",
            create_resource_list: [],
            stages: {
                '$PRIMARY': '小学',
                '$MIDDLE': '初中',
                '$HIGH': '高中'
            },
            tree: {
                init: false,
                manager: null,
                org: null
            },
        },
        init: function (element) {
            this.model = ko.mapping.fromJS(this.model);
            this.model.selectTags = ko.observable({});
            this.model.payFilter = [{'key': '免费', value: true}, {'key': '收费', value: false}];
            this.model.filter.is_free.subscribe(function (v) {
                this.search();
            }, this);
            this._initComputed();
            ko.applyBindings(this, element);
            this.initTag();
            this._eventHandler();
            this._initMixOrgs();
            this.showCreateResult();
        },
        switchListStyle: function (type) {
            this.model.listStyle(type);
            this.model.filter.is_free(undefined);
        },
        showCreateResult: function () {
            if (location.hash) {
                var hash = location.hash, str = '', match = hash.match(/total=(\d+)&success=(\d+)/);
                if (match) {
                    var total = +match[1], success = +match[2], fail = total - success;
                    if (fail) {
                        $.alert('共提交' + total + '个资源，其中' + success + '个成功，' + fail + '个失败！');
                    } else {
                        $.simplyToast('共提交' + total + '个资源，全部成功！');
                    }
                }
            }
        },
        _initMixOrgs: function () {
            store.getMixOrgTree().done($.proxy(function (data) {
                this.manager_nodes = [];
                if (data.manager && !data.manager.has_manage_project) {
                    this.manager_nodes = $.map(data.manager.manager_nodes, function (v) {
                        return v.node_id;
                    }) || [];
                    this.model.filter.affiliated_org_nodes(this.manager_nodes);
                }
                this.getResourceGroup();
                this.model.tree.manager(data.manager);
                this.model.tree.org(data.org_tree);
                this.model.tree.init(true);
            }, this));
        },
        _initComputed: function () {
            this.model.allStatus = ko.pureComputed(function () {
                var filter = this.model.filter;
                return !(filter.no_tag_resource() || filter.is_top() || ~$.inArray(filter.online_status(), [0, 1]) || ~$.inArray(filter.audit_status(), [1, 2, 3]));
            }, this);
            this.model.filter.tag_ids = ko.pureComputed(function () {
                var selectTags = this.model.selectTags, arr = [];
                $.each(selectTags(), function (i, v) {
                    if (v) arr.push(v);
                });
                return arr;
            }, this);
            ko.options.deferUpdates = true;
            this.model.isAllGroupNames = ko.computed({
                read: function () {
                    var list = this.model.allGroupNames(), selected = this.model.filter.group_names();
                    return list.length && selected.length === list.length;
                },
                write: function (value) {
                    var list = this.model.allGroupNames(), selected = this.model.filter.group_names;
                    if (value) {
                        selected($.map(list, function (v) {
                            return v.name;
                        }));
                    } else {
                        selected([])
                    }
                },
                owner: this
            });
        },
        _eventHandler: function () {
            var self = this;
            $(document).on('click', function (e) {
                if (!$(e.target).closest('.item-check').length) $('.item-check').removeClass('active');
            });
            $('#js-content').on('click', '.item-check', function () {
                $('.item-check').removeClass('active');
                $(this).addClass('active');
            });
        },
        editResource: function ($data) {
            if (this.model.selectedArray().length) this.checkClick($data);
            else {
                var type = $data.type === 'opencourse_2' ? $data.extra.business_type : $data.type;
                var href = formatUrl(RESOURCE_CONFIG_MAP[type].update_url, $data);
                href += (~href.indexOf("?") ? "&" : "?") + "source=channel&return_url=" + encodeURIComponent(saveUrl('edit', $data.type, $data.resource_id));
                href += '&__mac=' + Nova.getMacToB64(href);
                location.href = href;
            }
        },
        editResourceAudit: function ($data) {
            var href = webpageUrl + "/" + projectCode;
            if ($data.type === "open-course") href = window.opencourseUrl + "/" + projectCode + "/open_course/" + $data.resource_id + "/audit_detail";
            else if ($data.type === "auxo-train") href = window.trainUrl + "/" + projectCode + "/train/" + $data.resource_id + "/audit_detail";
            else if (~$.inArray($data.type, ['standard_exam', 'custom_exam', 'competition'])) href += "/exam_center/exam/audit_detail?id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            else if ($data.type === "design_methodlogy_exam") href += "/exam_center/offline_exam/audit_detail?tmpl_id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            else if ($data.type === "design_methodlogy_exercise") href += "/exam_center/offline_exam/exercise/audit_detail?tmpl_id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            else if ($data.type === "e-certificate") href = window.certificateUrl + "/" + projectCode + "/certificate/manage/form?id=" + $data.resource_id;
            else if ($data.type === "barrier") href += "/exam_center/exam/audit_detail?id=" + $data.resource_id + "&sub_type=2";
            else if ($data.type === "lecturer") href = window.lecturerUrl + "/admin/lecturer/lecturer.html?lecturer_id=" + $data.resource_id + '&project_code=' + projectCode;
            else return;
            href += (~href.indexOf("?") ? "&" : "?") + "source=channel&return_url=" + encodeURIComponent(saveUrl('edit', $data.type, $data.resource_id));
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        courseManage: function ($data) {
            var href = '';
            if ($data.type == "lecturer") href += window.lecturerUrl + '/admin/#/lecturer/' + $data.resource_id + '/course';
            else href += window.lecturer2GatewayUrl + '/admin/#/lecturer/' + $data.resource_id + '/resource';
            href += '?project_code=' + window.projectCode + '&return_url=' + encodeURIComponent(saveUrl('edit', $data.type, $data.resource_id));
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        pkRecordManage: function ($data) {
            var href = window.pkGatewayUrl + '/' + window.projectCode + '/pk/' + $data.resource_id + '/record/manage?return_url=' + encodeURIComponent(saveUrl('edit', $data.type, $data.resource_id));
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        hrefTo: function (type) {
            location.hash = '';
            var obj = RESOURCE_CONFIG_MAP[type];
            if (!obj) return;
            var href = '';
            if (~obj.create_url.indexOf('?__mac=${mac}')) {
                obj.create_url = obj.create_url.replace('?__mac=${mac}', '');
                href = obj.create_url + (~obj.create_url.indexOf("?") ? "&" : "?") + 'context_id=el-channel:' + channelId + '&unit_type=' + type + '&return_url=' + encodeURIComponent(saveUrl('create', type)) + '&__mac=${mac}';
            } else {
                href = obj.create_url + (~obj.create_url.indexOf("?") ? "&" : "?") + 'context_id=el-channel:' + channelId + '&unit_type=' + type + '&return_url=' + encodeURIComponent(saveUrl('create', type))
            }
            location.href = formatUrl(href);
        },
        getResourceGroup: function (global) {
            var self = this;
            window.notShowCover = global;
            var res = $.extend(true, [], window.allGroupNames),
                unit_types = window.unit_type && window.unit_type.split(',');
            if (unit_types && unit_types.length) {
                res = $.grep(res, function (v) {
                    return ~$.inArray(v.type, unit_types);
                })
            }
            this.model.allGroupNames(res);
            var exam_group = [],
                course_group = [],
                result = [],
                group_names = [];
            $.each(res, function (i, v) {
                if (v.is_exam_group) {
                    exam_group.push(v);
                } else if (v.type === 'opencourse_2') {
                    course_group = [{
                        title: '教学课',
                        type: 'teaching_course'
                    }, {
                        title: '练习课',
                        type: 'exercise_course'
                    }, {
                        title: '线下课',
                        type: 'offline_course'
                    }]
                } else {
                    result.push({
                        title: '添加' + v.title,
                        type: v.type,
                        children: []
                    });
                }
                group_names.push(v.name);
            });
            if (course_group.length) {
                result = [{
                    title: '添加新课程',
                    type: '',
                    children: course_group
                }].concat(result);
            }
            if (exam_group.length) {
                result = [{
                    title: '添加测评',
                    type: '',
                    children: exam_group
                }].concat(result);
            }

            self.model.create_resource_list(result);
            self.model.filter.group_names(group_names);
            self.getList();
            self.model.filter.group_names.subscribe(function () {
                self.search();
            }, this);
        },
        setOnline: function (flag, $data) {
            var self = this, selectedArray = this.model.selectedArray();
            var postData = $data ? [$data.resource_id] : $.map(selectedArray, function (v) {
                return v.resource_id;
            });
            var enabled = $data ? $data.enabled : !($.grep(selectedArray, function (v) {
                return !v.enabled;
            })).length;
            if (flag && !enabled) {
                if (window.resourceAudit) {
                    $.confirm({
                        title: '审核提示',
                        content: "当前所选资源" + (postData.length > 1 ? "包含" : "为") + "【禁用】状态，上线后，需要到资源管理发布后才能在频道列表显示！",
                        buttons: {
                            delete: {
                                text: '确定',
                                btnClass: 'btn-primary',
                                action: function () {
                                    self.status(flag, $data, postData, selectedArray);
                                }
                            },
                            cancel: {
                                text: '取消',
                                action: function () {
                                }
                            }
                        }
                    });
                } else {
                    store.updateResourcePoolStatus(flag, postData).done(function (resPool) {
                        var result = self.formatTips(flag, $data, resPool, selectedArray, true);
                        if (result.length) {
                            store.updateResourceStatus(flag, result).done(function (resChannel) {
                                self.formatTips(flag, $data, resChannel, selectedArray);
                                window.notShowCover = true;
                                setTimeout(function () {
                                    self.getList();
                                    window.notShowCover = false;
                                }, 1000);
                            })
                        }
                    })
                }
            } else {
                this.status(flag, $data, postData, selectedArray);
            }
        },
        status: function (flag, $data, postData, selectedArray) {
            var self = this;
            store.updateResourceStatus(flag, postData).done(function (data) {
                self.formatTips(flag, $data, data, selectedArray);
                self.getList()
            });
        },

        formatTips: function (flag, $data, data, selectedArray, disable) {
            var result = [];
            if ($data) {
                if (data && data[0]) {
                    if (data[0].code == 0) {
                        if (!disable) $.simplyToast("资源" + (flag ? "上线" : "下线") + "成功！");
                        result.push(data[0].unit_id);
                    } else {
                        $.alert("资源" + (flag ? "上线" : "下线") + "失败" + "，失败原因：" + data[0].message);
                    }
                }
            } else {
                result = this.formatErrorMessage(selectedArray, data, 'unit_id', disable);
            }
            return result;
        },
        formatErrorMessage: function (source, message, idKey, disable) {
            var group = {}, str = "", errorCount = 0, reSetOnline = [];
            idKey = idKey || "resource_id";
            $.each(message || [], function (im, vm) {
                if (vm.code != "0") {
                    ++errorCount;
                    $.each(source, function (is, vs) {
                        if (vs.resource_id == vm[idKey]) {
                            var hash = encodeURIComponent(vm.message);
                            group[hash] = group[hash] || [];
                            group[hash].push(vs.title);
                        }
                    })
                } else {
                    reSetOnline.push(vm[idKey]);
                }
            });
            if (errorCount) {
                if (!disable) {
                    str = "共提交" + source.length + "个资源，其中" + (source.length - errorCount) + "个操作成功，" + errorCount + "个操作失败！<br/><br/><strong>失败原因</strong><br/>";
                }
                else {
                    str = '操作失败！失败原因：<br/>';
                }
                var index = 1;
                $.each(group, function (i, v) {
                    str += index + "、" + decodeURIComponent(i) + "<br/>资源名称为：";
                    str += v.join("、") + "<br/>";
                    ++index;
                });
                $.alert(str);
            } else {
                if (!disable) {
                    str = "共提交" + source.length + "个资源，全部成功！";
                    $.simplyToast(str);
                }
            }
            return reSetOnline;
        },
        saveSelect: function (type) {
            var self = this, selectedResource = this.model.resourcePool.selectedArray();
            // this.cancelSelect();
            if (!selectedResource.length) return;
            var postData = $.map(selectedResource, function (v) {
                return {
                    unit_id: v.resource_id,
                    type: v.type

                }
            });
            store.addChannelResource(postData).done(function (data) {
                // self.formatErrorMessage(selectedResource, data);
                self.getList();
            });
        },
        initTag: function () {
            var self = this;
            store.getTag().done(function (res) {
                if (res && res.children) self.formatTag(res);
            })
        },
        formatTag: function (data) {
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

            for (var i = 0; i < data.children.length; i++) {
                //初始化选择条件
                data.children[i].all = [];
                getChildren(data.children[i], data.children[i].all);
                data.children[i].children = data.children[i].all;
                delete data.children[i].all;
            }
            //拼凑二级标签
            this.model.tags(data.children);
        },
        getList: function () {
            this.clearSelect();
            var self = this, _filter = this.model.filter, _search = ko.mapping.toJS(_filter);
            if (!_search.group_names.length) {
                this.model.items([]);
                this.model.total(0);
                _filter.page_no(0);
                this.pagination(0,
                    _filter.page_size(),
                    _filter.page_no(),
                    $.proxy(function (no) {
                        _filter.page_no(no);
                        this.getList();
                    }, this)
                );
                return;
            }
            this.model.isLoaded(false)
            store.getResource(this.formatFilter(_search)).done(function (res) {
                self.model.items(res.items || []);
                self.model.total(res.total);
                self.model.isLoaded(true);
                self.pagination(res.total,
                    _filter.page_size(),
                    _filter.page_no(),
                    $.proxy(function (no) {
                        _filter.page_no(no);
                        this.getList();
                    }, self)
                );
            }).always(function () {
                window.notShowCover = false;
                if (location.hash) location.hash = "";
            })
        },
        formatFilter: function (search) {
            var newFilter = {};
            $.each(search, function (k, v) {
                if ($.isArray(v)) {
                    if (v.length) newFilter[k] = v;
                } else {
                    if (v !== "" && v !== undefined) newFilter[k] = v;
                }
            });
            return newFilter;
        },
        formatResourceType: function ($data) {
            var type = $data.type;
            if ($data.type === 'opencourse_2') {
                type = $data.extra.business_type;
            }
            return RESOURCE_CONFIG_MAP[type] && RESOURCE_CONFIG_MAP[type].alias || RESOURCE_CONFIG_MAP[$data.type].alias;
        },
        //清除选择
        clearSelect: function () {
            this.model.selectedArray([]);
        },
        /*组织树显示*/
        showOrgTree: function () {
            $("#zT-orgTreeModal").modal('show');
        },
        pagination: function (totalCount, pageSize, currentPage, callback, target) {
            var $target = target || $('#pagination');
            $target.pagination(totalCount, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (pageNum) {
                    if (pageNum != currentPage && callback) {
                        callback(pageNum);
                    }
                }
            });
        },
        checkClick: function ($data) {
            var selectedArray = this.model.selectedArray, index = ~selectedArray.indexOf($data);
            if (index) {
                selectedArray.remove($data);
            } else {
                selectedArray.push($data)
            }
            return true;
        },
        formatTime: function (time) {
            return $.format.date(time, 'yyyy-MM-dd HH:mm:ss');
        },
        formatPrice: function (commodity) {
            return commodity ? commodity.price ? (function () {
                var price = '';
                _.objectForEach(commodity.price, function (k, v) {
                    if (!price) price = v;
                });
                return price || '免费';
            })() : '免费' : ''
        },
        //设定查询参数
        clearStatus: function () {
            this.model.filter.no_tag_resource(undefined);
            this.model.filter.is_top(undefined);
            this.model.filter.online_status("");
            this.model.filter.audit_status("");
        },
        setTag: function (id, pid) {
            if (id) this.model.filter.no_tag_resource(false);
            var selectTags = this.model.selectTags;
            selectTags()[pid] = id;
            selectTags(selectTags());
            this.search();
        },
        setStatus: function (k, v) {
            if (k !== 'sort_type') this.clearStatus();
            if (k) {
                if (k == "no_tag_resource") this.model.selectTags({});
                this.model.filter[k](v);
            }
            this.search();
        },
        setSortType: function () {
            this.clearStatus();
            if (k) {
                if (k == "no_tag_resource") this.model.selectTags({});
                this.model.filter[k](v);
            }
            this.search();
        },
        search: function () {
            this.model.filter.page_no(0);
            this.getList();
        },
        enterSearch: function ($data, $event) {
            if ($event && $event.type == "keyup" && $event.keyCode != 13) return;
            this.search();
        },
        //设置标签
        formatSelectedTag: function (tags) {
            return tags ? ($.isArray(tags) ? $.map(tags, function (v) {
                return v.id;
            }) : []) : [];
        },
        openCatalog: function () {
            var selectedArray = this.model.selectedArray();
            if (selectedArray.length === 1) {
                this._setCatalogTree(this.formatSelectedTag(selectedArray[0].tags), [selectedArray[0].resource_id]);
            } else {
                this._setCatalogTree([], $.map(selectedArray, function (v) {
                    return v.resource_id;
                }));
            }
        },
        openUnitCatalog: function (data) {
            this._setCatalogTree(this.formatSelectedTag(data.tags), [data.resource_id]);
        },
        _setCatalogTree: function (items, ids) {
            var self = this;
            store.getTag().done(function (data) {
                new ToolBar({
                    selectObj: items,
                    treeData: data,
                    saveCallback: function (data) {
                        var modal = this,
                            options = ids.map(function (item) {
                                return {
                                    resource_id: item,
                                    tag_ids: data
                                }
                            });
                        store.updateResourceTags(options).done(function (data) {
                            $.simplyToast("标签设置成功");
                            modal.hide();
                            self.search();
                        });
                    }
                })
            });
        },
        doTop: function (flag, $data) {
            var self = this, ids = $data ? [$data.resource_id] : $.map(this.model.selectedArray(), function (v) {
                return v.resource_id;
            });
            store.updateResourceIsTop(flag, ids).done(function (data) {
                $.simplyToast((flag ? '置顶' : '取消置顶') + "成功");
                self.getList();
            });
        },
        deleteResource: function ($data) {
            var self = this,
                selectedArray = this.model.selectedArray(),
                school_id = '',
                teacher_id = '',
                ids = '';
            if ($data) {
                switch ($data.type) {
                    case 'famous_school':
                        school_id = $data.resource_id;
                        break;
                    case 'famous_teacher':
                        teacher_id = $data.resource_id;
                        break;
                    default:
                        ids = [$data.resource_id]
                }
            } else {
                ids = $.map(selectedArray, function (v) {
                    return v.resource_id;
                });
            }
            $.confirm({
                content: "确认删除资源?",
                buttons: {
                    delete: {
                        text: '确定',
                        btnClass: 'btn-primary',
                        action: function () {
                            if (ids) {
                                store.deleteChannelResource(ids).done(function (data) {
                                    $.simplyToast("删除频道下资源成功");
                                    self.getList();
                                });
                            }
                            if (school_id) {
                                store.deleteFamousSchool(school_id).done(function () {
                                    $.simplyToast("删除频道下资源成功");
                                    self.getList();
                                });
                            }
                            if (teacher_id) {
                                store.deleteFamousTeacher(teacher_id).done(function () {
                                    $.simplyToast("删除频道下资源成功");
                                    self.getList();
                                })
                            }

                        }
                    },
                    cancel: {
                        text: '取消',
                        action: function () {
                        }
                    }
                }
            });

        },
        showPeriodicExamSessions: function ($data) {
            var href = window.periodicExamgateway + '/' + projectCode + '/periodic_exam/admin/sessions?periodic_exam_id=' + $data.resource_id;
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        showPeriodicExamSessionUsers: function ($data) {
            var href = window.periodicExamgateway + '/' + projectCode + '/periodic_exam/admin/session_users?periodic_exam_id=' + $data.resource_id;
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        selectAll: function () {
            if (this.model.selectedArray().length == this.model.items().length) {
                this.model.selectedArray([]);
            } else {
                this.model.selectedArray(this.model.items().concat());
            }
            return true;
        }
    };
    $(function () {
        viewModel.init(document.body);
    });
})();