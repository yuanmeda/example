/**
 * Created by Leo on 2016/5/23.
 */

;(function ($, window) {
    'use strict';
    var store = {
        trainsCreate: function (data) {
            var url = '/' + projectCode + '/trains';

            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                cache: false
            });
        },
        getTrain: function (id) {
            var url = '/' + projectCode + '/trains/' + id;

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        getTree: function () {
            var url = '/' + projectCode + '/tags/tree?custom_type=' + custom_type;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        trainsEdit: function (data) {
            var url = '/' + projectCode + '/trains/' + data.train_id;

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        getOrgTree: function () {
            var url = '/' + projectCode + '/trains/orgs';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        },
        getRange: function () {
            var url = '/' + projectCode + '/trains/' + trainId + '/visible_range';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        },
        getUsers: function (data) {
            var url = '/' + projectCode + '/trains/users';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                data: {account: data},
                dataType: 'json'
            });
        },
        getDutyTeacher: function () {
            var url = '/' + projectCode + '/trains/' + trainId + '/duty_teacher';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        },
        getMixOrgTree: function () {
            var url = '/' + projectCode + '/trains/manage_orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
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
    var viewModel = {
        treeObj: null,
        orgTreeObj: null,
        $searchOrg: null,
        $orgTreeModal: $('#js-orgTreeModal'),
        $chznSelect: null,
        $orgTreeModalBody: null,
        $orgTree: null,
        orgTreeCheckNodes: [],
        model: {
            train: {
                id: '',
                title: '',
                description: '',
                cover: '',
                attention: '',
                cover_url: '',
                draggable: '0',
                study_time_limit_type: '2',
                study_start_time: '',
                study_end_time: '',
                study_days: '',
                enabled: false,
                affiliated_org_node: null,
                visible_config: 0,
                context_id: context_id || '',
                visible_range: []
            },
            orgSettings: {
                belong: {
                    updateNodes: [],
                    orgSelectedText: '',
                    visibleType: '0',
                    chkStyle: 'radio'
                },
                available: {
                    updateNodes: [],
                    orgSelectedText: '',
                    visibleType: '0',
                    chkStyle: 'checkbox'
                },
            },
            orgInfo: {
                allNodes: [],
                disabledNodes: [],
                orgTreeModel: null,
                updateNodes: [],
                nowType: ''
            },
            teacherModel: {
                teachersIds: [],
                teachers: []
            },
            searchText: '',
            trainTagsTitle: '',
            draggableText: '',
            teachersText: '',
            readonly: !!readonly,
            mode: 0,
            treePattern: 0
        },
        uploadInfo: {
            path: '',
            server_url: '',
            service_id: '',
            session: ''
        },
        // 组织树
        _initTreeChkDisabled: function (treeData, disabledNodes) {
            disabledNodes = $.map(disabledNodes, function (v) {
                return v.node_id;
            });
            $.each(treeData, function (i, v) {
                if (!~$.inArray(v.node_id, disabledNodes)) v.chkDisabled = true;
            });
            return treeData;
        },
        findNodesByIds: function (all, ids) {
            return ids ? $.grep(all, function (v) {
                return ~$.inArray(v.node_id, ids);
            }) : [];
        },
        orgTreeSearch: function () {
            if (this.$searchOrg) {
                this.changeColor("node_name", this.$searchOrg.val());
            }
        },
        saveOrg: function () {
            if (this.orgTreeObj) this.model.orgSettings[this.model.orgInfo.nowType()].updateNodes(this.orgTreeObj.getCheckedNodes());
            this.$orgTreeModal.modal('hide');
        },
        cancelOrg: function () {
            if (this.orgTreeObj) this.model.orgSettings[this.model.orgInfo.nowType()].updateNodes([]);
            this.$orgTreeModal.modal('hide');
        },
        showOrgTree: function (type) {
            this.model.treePattern(type);
            this.$orgTreeModal.modal('show');
           
        },
        _refreshTree: function (updateNodes, chkStyle) {
            this._clearSearch();
            this.orgTreeObj.setting.check.chkStyle = chkStyle;
            this.orgTreeObj.checkAllNodes(false);
            this._checkOrgNode(updateNodes);
            this.orgTreeObj.refresh();
        },
        _clearSearch: function () {
            this.$searchOrg.val('');
            this.model.searchText('');
            this.changeColor("node_name", "")
        },
        _checkOrgNode: function (updateNodes) {
            var orgTreeObj = viewModel.orgTreeObj, orgTreeCheckNodes = updateNodes, j = orgTreeCheckNodes.length;
            if (viewModel && orgTreeCheckNodes) {
                var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes());
                for (var i = 0, len = orgTreeNodes.length; i < len; i++) {
                    var z = j, node = orgTreeNodes[i], noChecked = true;
                    while (z--) {
                        if (orgTreeCheckNodes[z].node_id === node.node_id) {
                            orgTreeObj.selectNode(node, false);
                            orgTreeObj.checkNode(node, true, false, false);
                            orgTreeObj.expandNode(node, true, false, true);
                            orgTreeCheckNodes.splice(z, 1);
                            j--;
                            noChecked = false;
                            break;
                        }
                    }
                    if (noChecked) {
                        orgTreeObj.checkNode(node, false, false, false);
                    }
                }
                orgTreeObj.cancelSelectedNode(orgTreeObj.getSelectedNodes()[0]);
            }
        },
        changeColor: function (key, value) {
            var _this = this, orgTreeObj = _this.orgTreeObj;
            if (orgTreeObj) {
                _this.$orgTree.css('display', 'none');
                value = String(value).toLowerCase();
                var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), matchNode = null;
                for (var i = 0, len = orgTreeNodes.length; i < len; i++) {
                    var node = orgTreeNodes[i];
                    if (value !== '' && _this._matchValue(node[key], value)) {
                        node.highlight = true;
                        orgTreeObj.selectNode(node, false);
                        orgTreeObj.expandNode(node, true, false, false);
                        !matchNode && (matchNode = node);
                    } else {
                        node.highlight = false;
                        orgTreeObj.expandNode(node, false, false, false);
                    }
                }
                orgTreeObj.refresh();
                _this.$orgTree.css('display', 'block');
                if (value === '') {
                    orgTreeObj.expandNode(orgTreeNodes[0], true, false, false);
                    _this.model.searchText('');
                } else if (matchNode) {
                    _this._setBodyScrollTop(matchNode.tId);
                    _this.model.searchText('');
                } else {
                    orgTreeObj.expandNode(orgTreeNodes[0], true, false, false);
                    _this.model.searchText('没有相关数据！');
                }
                _this.$searchOrg.blur();
            }
        },
        _setBodyScrollTop: function (id) {
            var $orgTreeModalBody = this.$orgTreeModalBody;
            $orgTreeModalBody.scrollTop(0);
            $orgTreeModalBody.scrollTop($('#' + id).position().top - this._getSearchFormH());
        },
        _getSearchFormH: (function () {
            var height = null;
            return function () {
                if (!height) {
                    height = $('#js-searchForm').outerHeight(true);
                }
                return height;
            }
        })(),
        _matchValue: function (match, value) {
            return (String(match).toLowerCase().indexOf(value) > -1);
        },
        _setCheckData: function (checkData, treeData) {
            if (checkData && checkData.length) {
                var checkArr = [];
                for (var i = 0, checkLen = checkData.length; i < checkLen; i++) {
                    for (var j = 0, treeLen = treeData.length; j < treeLen; j++) {
                        if (treeData[j].node_id === checkData[i]) {
                            checkArr.push(treeData[j]);
                            break;
                        }
                    }
                }
                this.orgTreeCheckNodes = checkArr;
                var orgTreeObj = viewModel.orgTreeObj;
                if (orgTreeObj) {
                    this._checkOrgNode();
                }
            }
        },
        // 组织树end
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.train.study_time_limit_type.subscribe(function (val) {
                if (val != 0) {
                    this.model.train.study_start_time("");
                    this.model.train.study_end_time("");
                }
                if (val == 1) {
                    this.model.train.study_days(0);
                } else {
                    this.model.train.study_days("");
                }
            }, this);
            $.when(this._initUploadInfo()).then($.proxy(function () {
                $.when(this._loadTree(), this._loadData()).then(function () {
                    _self._checkNodes(_self.train_tags);
                    $.when(store.getMixOrgTree(), _self._loadExtras()).then(function (data1, data2) {
                        var data = data2[0], treeData = data1[0];
                        _self.model.orgSettings['belong'].visibleType((+!!_self.model.train.affiliated_org_node()).toString());
                        _self.model.orgSettings['available'].visibleType(_self.model.train.visible_config().toString());
                        _self.model.train.visible_range(data||[]);
                        var manager = treeData.manager || {};
                        _self.mTreeOpts = {
                            readonly: _self.model.readonly,
                            nodeIds: _self.model.train.visible_range,
                            orgId: orgId,
                            multiple:true,
                            projectCode: projectCode,
                            host1: '/' + projectCode + '/trains/',
                            host2: elearningServiceUri,
                            visible: true,
                            managerNodes: manager.manager_nodes,
                            hasManager: manager.has_manage_project,
                            initData:treeData.org_tree
                        } 
                        _self.sTreeOpts = $.extend({},_self.mTreeOpts,{
                            nodeIds: _self.model.train.affiliated_org_node,
                            multiple:false
                        })
                        _self.koBind();
                    });
                });
            }, this));
            $("#js_studystarttime, #js_studyendtime").datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                autoclose: true,
                'data-date-format': "yyyy-mm-dd hh:ii"
            });
            this._initUpload($.proxy(this._uploadComplete, this), $.proxy(this._uploadError, this));
            this._validator();
            this._chosenInit();
            this._loadDutyTeacher();
        },
        _initUploadInfo: function () {
            return store.getUploadSession()
                .done($.proxy(function (resData) {
                    this.uploadInfo.path = resData.path || "";
                    this.uploadInfo.server_url = resData.server_url || "";
                    this.uploadInfo.service_id = resData.service_id || "";
                    this.uploadInfo.session = resData.session || "";
                    this._editor();
                    this.desEditor.readonly(this.model.readonly());
                }, this));
        },
        _editor: function () {
            var self = this;
            this.desEditor = KindEditor.create('#attention', {
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: true,
                resizeType: 0,
                imageUploadServer: self.uploadInfo.server_url,
                imageUploadSession: self.uploadInfo.session,
                imageUploadPath: self.uploadInfo.path,
                staticUrl: staticUrl,
                items: [
                    'source', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link', 'imageswf'
                ],
                afterChange: function () {
                    if (!this.desEditor) {
                        return;
                    }
                    if (this.desEditor.count("text") == 0) {
                        this.model.train.attention('');
                    } else {
                        this.model.train.attention(this.desEditor.html());
                    }
                }.bind(this)
            });
        },
        _chosenInit: function () {
            if (!this.model.readonly()) {
                this.$chznSelect = $("#js-chznSelect").chosen();
            }
        },
        koBind: function () {
            var $content = $('#js-content');
            ko.applyBindings(this, $content[0]);
            $content.show();
        },
        //加载初始数据
        _loadData: function () {
            var _self = this, train = _self.model.train, id = train.id(), readonly = this.model.readonly();
            if (id) {
                return store.getTrain(id).done(function (data) {
                    for (var key in train) {
                        if (train.hasOwnProperty(key)) {
                            if (key === 'draggable') {
                                train[key](data[key] + '');
                            } else if (key === 'study_time_limit_type') {
                                train[key](data[key] + '');
                            } else if (key === 'study_start_time' || key === 'study_end_time') {
                                train[key](_self.formatTime(data[key]));
                            } else if (key === 'attention') {
                                data[key] = data[key].replace(/\$\{cs_host}/gim, _self.uploadInfo.server_url);
                                _self.desEditor.html(_self.html_decode(data[key]));
                            } else if (key === 'cover_url') {
                                train[key](data[key] || window.default_cover_url);
                            } else {
                                train[key](data[key]);
                            }
                        }
                    }
                    if (readonly) {
                        _self._getTagNames(data.train_tag_base_vos);
                        _self.model.draggableText(data.draggable == 1 ? '开启' : '关闭');
                    } else {
                        _self.train_tags = data.train_tags;
                    }
                });
            }
        },
        formatTime: function (time) {
            return time ? time.split('.')[0].replace('T', ' ').substring(0, time.split('.')[0].replace('T', ' ').length - 3) : '';
        },
        _loadOrgTree: function () {
            return store.getOrgTree();
        },
        _loadDutyTeacher: function () {
            if (trainId) {
                var _this = this;
                return store.getDutyTeacher().done(function (data) {
                    if (data && data.length) {
                        var teacherModel = _this.model.teacherModel;
                        if (_this.model.readonly()) {
                            var arr = [];
                            for (var i = 0; i < data.length; i++) {
                                arr.push(data[i].name);
                            }
                            _this.model.teachersText(arr.join('、'));
                        } else {
                            for (var i = 0; i < data.length; i++) {
                                var item = data[i];
                                viewModel.model.teacherModel.teachers.push({
                                    ucUserId: item.user_id,
                                    name: item.name
                                });
                                teacherModel.teachersIds().push(item.user_id);
                            }
                            _this.$chznSelect && _this.$chznSelect.val(_this.model.teacherModel.teachersIds()).trigger('liszt:updated');
                        }
                    }
                });
            }
        },
        _loadExtras: function () {
            if (trainId) {
                return store.getRange();
            } else {
                return [false];
            }
        },
        _getTagNames: function (tags) {
            if (Array.isArray(tags)) {
                var tagNams = tags.map(function (item) {
                    return item.tag_name;
                }).join('、');
                this.model.trainTagsTitle(tagNams);
            }
        },
        addAdmin: function () {
            if (this.model.readonly()) {
                return;
            }
            var input = $("#js_admins"),
                _this = this,
                userName = input.val();

            if (!$.trim(userName).length) {
                Utils.alertTip('请输入教师的身份证号或帐号', {
                    icon: 7,
                    btn: ['确定']
                });
                return;
            }
            var cur = [];
            $.each(viewModel.model.teacherModel.teachers(), function (index, value) {
                cur.push(value.ucUserId);
            });

            var teachersIds = [];
            $.each(viewModel.model.teacherModel.teachersIds(), function (index, value) {
                teachersIds.push(value);
            });
            store.getUsers(userName).done(function (data) {
                if (data && data.user_id) {
                    if ($.inArray(data.user_id, cur) < 0) {
                        viewModel.model.teacherModel.teachers.push({
                            ucUserId: data.user_id,
                            name: data.real_name
                        });
                    }
                    if ($.inArray(data.user_id, teachersIds) < 0) {
                        viewModel.model.teacherModel.teachersIds.push(data.user_id);
                        _this.$chznSelect && _this.$chznSelect.val(viewModel.model.teacherModel.teachersIds()).trigger('liszt:updated');
                    }
                    Utils.msgTip('添加 成功!');
                } else {
                    Utils.alertTip('无该帐号', {
                        icon: 7,
                        btn: ['确定']
                    });
                }
                input.val("");
            });
        },
        toNext: function () {
            location.href = '/' + projectCode + '/train/manage';
        },
        //保存编辑信息
        _save: function (save) {
            if (!$('#js-validateForm').valid()) {
                return;
            }
            var belongOrg = this.model.orgSettings.belong, availableOrg = this.model.orgSettings.available, checkNode = null;
            var data = ko.mapping.toJS(this.model.train), method = 'trainsCreate';
            data.attention = (data.attention).replace(new RegExp("" + this.uploadInfo.server_url, "gim"), '${cs_host}');
            if (data.id) {
                data.train_id = data.id;
                method = 'trainsEdit';
            }
            var study_time_limit_type = data.study_time_limit_type,
                study_start_time = data.study_start_time ? new Date(data.study_start_time.replace(/-/g, '\/') + ':00').getTime() : null,
                study_end_time = data.study_end_time ? new Date(data.study_end_time.replace(/-/g, '\/') + ':00').getTime() : null;
            if (study_time_limit_type == "0") {
                if (!study_start_time) {
                    Utils.alertTip('学习开始时间必填', {
                        icon: 7
                    });
                    return;
                }
                if (!study_end_time) {
                    Utils.alertTip('学习结束时间必填', {
                        icon: 7
                    });
                    return;
                }
                if (study_start_time - study_end_time > 0) {
                    Utils.alertTip('学习开始时间应小于学习结束时间', {
                        icon: 7
                    });
                    return;
                }
            }
            if (study_time_limit_type == "1") {
                if (!/^[0-9]+$/.test(data.study_days) || data.study_days.length > 5 || +data.study_days === 0) {
                    Utils.alertTip('请填写有效学习天数(正整数输入，最多5位数，不允许输入负数)！', {
                        icon: 7
                    });
                    return;
                }
            }

            data.draggable = +data.draggable;
            data.train_tags = viewModel._getCheckNodes(this.treeObj, 'id');
            data.visible_config = parseInt(availableOrg.visibleType());
            data.study_start_time = data.study_start_time ? data.study_start_time.replace(' ', 'T') + ':00+0800' : "";
            data.study_end_time = data.study_end_time ? data.study_end_time.replace(' ', 'T') + ':00+0800' : "";


            //study_days: config.study_days() || null
            if (belongOrg.visibleType() === '0') {
                data.affiliated_org_node = -1;
            } else if (belongOrg.visibleType() === '1') {
                if (!data.affiliated_org_node) {
                    $.fn.dialog2.helpers.alert('请选择所属组织！');
                    return;
                }
            }
            if (availableOrg.visibleType() === '0') {
                data.visible_range = [];
            } else if (availableOrg.visibleType() === '1') {
                if (!data.visible_range.length) {
                    $.fn.dialog2.helpers.alert('请选择可见范围！');
                    return;
                }
            }
            data.duty_teacher = viewModel.model.teacherModel.teachersIds();
            var return_url = this.getQueryStringByName('return_url');
            store[method](data).done(function (data) {
                if (save) {
                    Utils.alertTip('保存成功', {
                        icon: 7
                    });
                    this.model.train.id(data.id);
                } else {
                    if (return_url) {
                        var hasParams = return_url.indexOf('?') >= 0;
                        window.location.href = return_url + (hasParams ? '&' : '?') + 'id=' + data.id;
                    }
                }
            }.bind(this));
        },
        save: function () {
            this._save(true);
        },
        cancel: function () {
            var return_url = this.getQueryStringByName('return_url');
            if (return_url)
                window.location.href = return_url;
        },
        next: function () {
            this._save();
        },
        toEdit: function () {
            location.href = '/' + projectCode + '/train/' + trainId + '/edit';
        },
        //上传初始化
        _initUpload: function (uc, ue) {
            if (this.model.readonly()) {
                return;
            }
            var swf = new SWFImageUpload({
                flashUrl: staticUrl + 'auxo/addins/swfimageupload/v1.0.0/swfimageupload.swf',
                width: 1024,
                height: 1200,
                htmlId: 'J_UploadImg',
                pSize: '600|400|360|240|270|180',
                uploadUrl: escape(storeUrl),
                imgUrl: '',
                showCancel: false,
                limit: 1,
                upload_complete: uc,
                upload_error: ue
            });
        },
        //上传成功回调
        _uploadComplete: function (data) {
            if (data) {
                this.model.train.cover(data.id);
                this.model.train.cover_url(data.absolute_url);
                this.model.mode(!this.model.mode());
            }
        },
        //上传失败回调
        _uploadError: function (code) {
            var msg;
            switch (code) {
                case 110:
                    msg = '上传文件超过规定大小';
                    break;
                case 120:
                    msg = '上传文件的格式不对，请重新上传jpg、gif、png格式图片';
                    break;
                default:
                    msg = '上传失败，请稍后再试';
                    break;
            }
            Utils.alertTip(msg, {
                icon: 7,
                btn: ['确定']
            });
        },
        _toggle: function () {
            if (!this.model.readonly()) {
                $('#js-content').scrollTop(0);
                this.model.mode(!this.model.mode());
            }
        },
        set_default_cover: function () {
            this.model.train.cover(window.default_cover_id);
            this.model.train.cover_url(window.default_cover_url);
        },
        //初始化标签树
        _loadTree: function () {
            if (this.model.readonly()) {
                return;
            }
            var _self = this;
            return store.getTree().done(function (data) {
                _self.treeObj = (new window.ZTREE(data.children, $('#J_Tree'), {
                    check: {
                        enable: true
                    },
                    callback: {
                        onClick: _self._catalogOnClick
                    }
                })).treeObj;
                _self.treeObj.expandAll(true);
            });
        },
        //初始化选中节点
        _checkNodes: function (ids) {
            if (!this.model.readonly() && Array.isArray(ids)) {
                var treeObj = viewModel.treeObj;
                ids.forEach(function (item) {
                    var node = treeObj.getNodeByParam('id', item);
                    if (node) {
                        treeObj.checkNode(node, true, false, false);
                    }
                });
            }
        },
        _getCheckNodes: function (treeObj, key) {
            return treeObj.getCheckedNodes(true).map(function (node) {
                return node[key];
            });
        },
        //选中标签事件
        _catalogOnClick: function (e, tid, tnode) {
            viewModel.treeObj.checkNode(tnode, !tnode.checked, true, false);
        },
        //表单验证规则
        _validator: function () {
            if (this.model.readonly()) {
                return;
            }
            $('#js-validateForm').validate({
                rules: {
                    title: {
                        required: true,
                        maxlength: 50
                    },
                    description: {
                        required: false,
                        maxlength: 100
                    },
                    attention: {
                        required: false,
                        maxlength: 5000
                    }
                },
                messages: {
                    title: {
                        required: '请输入培训名称',
                        maxlength: $.validator.format('培训名称不能多于{0}个字')
                    },
                    description: {
                        maxlength: $.validator.format('培训摘要不能多于{0}个字')
                    },
                    attention: {
                        maxlength: $.validator.format('培训介绍不能多于{0}个字')
                    }
                },
                onkeyup: function (element) {
                    $(element).valid();
                },
                onsubmit: true,
                errorElement: 'p',
                errorClass: 'help-inline',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid');
                    if (label.closest('.control-group').find('p').length != label.closest('.control-group').find('p.valid').length)
                        return;
                    label.closest('.control-group').addClass('success');
                }
            });
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);