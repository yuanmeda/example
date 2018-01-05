/*
 培养计划
 */
;
(function (window, $) {
    ko.options.deferUpdates = true;

    var viewModel;

    var store = {
        // 获取单个培养计划
        querySpecial: function () {
            var url = '/' + projectCode + '/specialty/plan/' + specialtyId;
            return $.ajax({
                url: url,
                cache: false
            });
        },
        // 新增培养计划
        createSpecial: function (data) {
            var url = '/' + projectCode + '/specialty/plan';
            return $.ajax({
                url: url,
                cache: false,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        },
        // 修改培养计划
        editSpecial: function (data) {
            var url = '/' + projectCode + '/specialty/plan';
            return $.ajax({
                url: url,
                cache: false,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        },
        getSpecialLearningUnits: function (termId) {
            var url = '/' + projectCode + '/specialty/plans/' + specialtyId + '/learning_units/search';
            var data = {
                term_id: termId,
                order: 1,
                page: 0,
                size: 10
            }
            return $.ajax({
                url: url,
                cache: false,
                data: data
            });
        },
        // 获取培养计划列表页面年级下拉框值项
        queryGrade: function () {
            var url = '/' + projectCode + '/specialty/plan/start_year';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        // 获取学院专业组织树
        queryNodeTree: function () {
            var url = '/' + projectCode + '/specialty/nodetree?is_show_all=1';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        getUploadInfo: function () {
            return $.ajax({
                url: '/v1/upload_sessions',
                cache: false
            });
        },
        getOrgTree: function () {
            // var url = '/' + projectCode + '/specialty/manage_orgs';
            var url = '/' + projectCode + '/specialty/manage_orgs';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false
            });
        },
        getOrgTreeChildren: function (mix_node_id) {
            var url = '/' + projectCode + '/specialty/manage_orgs/' + mix_node_id + '/nodes';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false
            });
        }
    };
    var generateGrade = function (currentYear) {
        var _grades = [],
            _count = 0,
            _range = 10;
        _grades.push({
            key: currentYear,
            value: currentYear
        });
        while (_count < _range) {
            _count++;
            _grades.push({
                key: currentYear + _count,
                value: currentYear + _count
            });
            _grades.unshift({
                key: currentYear - _count,
                value: currentYear - _count
            });
        }
        return _grades;
    }
    var currentYear = new Date().getFullYear();
    var localData = {
        seasonEnum: [{
            key: 0,
            value: '春季'
        }, {
            key: 1,
            value: '秋季'
        }],
        gradeEnum: generateGrade(currentYear)
    };

    function ViewModel(sId, status) {
        this.sId = sId;
        this.status = status;
        this.flatNodeObject = {};
        this.model = {
            presentTerm: null,
            flag: '',
            $orgTreeModalBody: null,
            orgTreeObj: null,
            $orgTree: null,

            affiliated_label: 0,

            grades: localData.gradeEnum,
            colleges: [],
            majors: [],
            seasons: localData.seasonEnum,
            coverImg: defaultImage,
            specialInfo: {
                id: specialtyId,
                title: '',
                type: 2,
                cover: '',
                summary: '',
                description: '',
                start_year: currentYear,
                start_season: 0,
                status: 0,
                pass_required_score: '',
                pass_optional_score: '',
                node_id: 0,
                visible_config: 0,
                visible_nodes: [],
                affiliated_org_node: 0,
                terms: [
                    {
                        term_name: ''
                    }
                ],
                context_id: contextId
            },
            uploadInfo: {
                service_id: '',
                server_url: '',
                session: '',
                path: ''
            },

            treePattern: false,
            orgTextRadio: '点击查看或选择所属组织',
            orgTextCheckbox: '点击查看或选择组织',
            updateNodesRadio: [],
            updateNodesCheckbox: [],
            searchText: '',
            belong_config: "0",//所属配置
        }
        this._init();
        viewModel = this;
    }

    ViewModel.prototype = {
        _init: function () {
            var t = this;
            this.model = ko.mapping.fromJS(this.model);
            this._loadDate();
            this._validator();
            this.validaInfo = ko.validation.group(this.model.specialInfo);

            this.initUpload();
            this.model.affiliated_label.subscribe(function (k) {
                return k == 0 ? t.model.specialInfo.affiliated_org_node(0) : null
            })

            this.model.specialInfo.affiliated_org_node.subscribe(function (k) {
                return k != 0 ? t.model.affiliated_label(1) : null
            })

            /*获取树结构*/
            store.getOrgTree().done(function (resData) {
                if (resData && resData.manager && resData.org_tree) {
                    t._initOrgTree(resData.manager, resData.org_tree);
                }
            });
            contextId && this.setLayoutDomHide();
        },

        setLayoutDomHide: function () {
            $(".menu-main-wrap .nav, .menu-main-wrap .main-wrap .current-site").hide();
            $(".menu-main-wrap .main-wrap").css({
                'left': 0
            })
            $(".menu-main-wrap .main-wrap .content-wrap .main-content").css({
                'margin-top': 0
            })
        },

        initUpload: function () {
            store.getUploadInfo()
                .done($.proxy(function (uploadInfo) {
                    this.model.uploadInfo.path(uploadInfo.path || "");
                    this.model.uploadInfo.server_url(uploadInfo.server_url || "");
                    this.model.uploadInfo.session(uploadInfo.session || "");
                    this.model.uploadInfo.service_id(uploadInfo.service_id || "");

                    this.initEditor();
                    this.uploadInfo = uploadInfo;
                    this.initPicturePlugin('uploadCoverImg', uploadInfo);
                }, this));
        },
        initEditor: function () {
            window.desEditor = KindEditor.create('#description', {
                readonlyMode: status === 'detail',
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: true,
                allowPreviewEmoticons: false,
                allowImageUpload: true,
                resizeType: 0,
                imageUploadServer: this.model.uploadInfo.server_url(),
                imageUploadSession: this.model.uploadInfo.session(),
                imageUploadPath: this.model.uploadInfo.path(),
                staticUrl: staticUrl,
                items: [
                    'source', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link', 'imageswf'
                ],
                afterChange: function () {
                    if (!window.desEditor) {
                        return;
                    }
                    if (window.desEditor.count("text") == 0) {
                        this.model.specialInfo.description = ko.observable('');
                    } else {
                        this.model.specialInfo.description = ko.observable(window.desEditor.html());
                    }
                }.bind(this)
            });
            // document.addEventListener('DOMNodeInserted',function(){
            //     $("#imageswf_uploader .webuploader-pick div").html('选择文件')
            // },false);


        },
        initPicturePlugin: function (domId, uploadInfo) {
            var uploader = new WebUploader.Uploader({
                swf: window.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + uploadInfo.server_url + '/v0.1/upload?session=' + uploadInfo.session,
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                pick: {
                    id: '#' + domId,
                    multiple: false
                },
                formData: {
                    path: uploadInfo.path
                },
                fileSingleSizeLimit: 2 * 1024 * 1024,
                accept: [{
                    title: "Images",
                    extensions: "gif,jpg,jpeg,png",
                    mimeTypes: 'image/png,image/jpeg,image/jpg,image/gif'
                }]
            });
            uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
            uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, "#" + domId));
            uploader.on('error', $.proxy(this.selectError, this, 'picture'));
        },
        selectError: function (type, error) {
            if (error == "Q_TYPE_DENIED") {
                if (type == 'picture') {
                    $.alert('请上传格式为gif,png,jpg的图片！');
                }

            } else if (error == "F_EXCEED_SIZE") {
                $.alert('大小不能超过2M');
            }
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.alert("文件大小为0，不能上传！");
                return false;
            }
        },
        uploadError: function (uploader, domId, file, reason) {
            this.uploaderMap = this.uploaderMap || {};
            this.uploaderMap[domId] = this.uploaderMap[domId] || 0;
            if (++this.uploaderMap[domId] <= 1) {
                store.getUploadInfo()
                    .done($.proxy(function (uploadInfo) {
                        uploader.option("server", "http://" + uploadInfo.server_url + "/v0.1/upload?session=" + uploadInfo.session);
                        uploader.retry();
                    }, this));
            } else {
                $.alert('上传失败：' + reason);
            }
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (domId, file, response) {
            if (!response.code) {
                $.alert("上传成功！");
                this.model.coverImg('http://' + this.uploadInfo.server_url + '/v0.1/download?dentryId=' + response.dentry_id);
                this.model.specialInfo.cover(response.dentry_id)
            } else {
                response ? $.alert(response.message) : $.alert("上传出错");
            }
        },
        addTerm: function () {
            this.model.specialInfo.terms.push({
                term_name: ''
            })
        },
        delTerm: function (data) {
            $('#deleteTermModal').modal('show');
            this.model.presentTerm(data);
        },
        sureDeleteTerm: function (data) {
            $("#deleteTermModal").modal('hide');
            var t = this;
            if (data.id) {
                store.getSpecialLearningUnits(data.id).done(function (res) {
                    if (res.total > 0) {
                        $.alert('阶段下有配置课程/考试，不能删除！')
                    } else {
                        t.model.specialInfo.terms.remove(data())
                    }
                })
            } else {
                t.model.specialInfo.terms.remove(data())
            }
        },
        _loadDate: function () {
            var vm = this;
            $.when(this._queryNodeTree(), this._querySpecial()).done(function (nodes, info) {
                var _nodes = nodes[0],
                    _info = info ? info : null,
                    _firstNodeChilds = null;
                _nodes = _nodes.children;
                vm._flatTreeNode(_nodes);
                _firstNodeChilds = vm._filterNodeByPid(null) || [];
                // vm.model.colleges(_firstNodeChilds);
                if (_info) {
                    _info.cover ?
                        vm.model.coverImg('http://' + vm.model.uploadInfo.server_url() + '/v0.1/download?dentryId=' + _info.cover) :
                        vm.model.coverImg(defaultImage)
                    setTimeout(function () {
                        ko.mapping.fromJS(_info, {}, vm.model.specialInfo);
                        window.desEditor.html(info.description)
                    }, 0);
                } else {
                    // vm.model.specialInfo.college_id('');
                }
            });
        },
        _validator: function () {
            this.model.specialInfo.title.extend({
                required: {
                    params: true,
                    message: '请填写培养计划名称'
                }
            });
            this.model.specialInfo.pass_optional_score.extend({
                required: {
                    params: true,
                    message: '请填写选修学分'
                },
                number: {
                    params: true,
                    message: '选修学分格式错误'
                },
                min: {
                    params: 0,
                    message: '选修学分不能低于{0}'
                },
                max: {
                    params: 9999999,
                    message: '选修学分不能高于{0}'
                }
            });
        },
        // 年级查询
        _queryGrade: function () {
            var vm = this;
            store.queryGrade().done(function (d) {
                vm.model.grades(d);
            });
        },
        // 组织结构查询
        _queryNodeTree: function () {
            var vm = this;
            return store.queryNodeTree();
        },
        // 扁平化树
        _flatTreeNode: function (nodes) {
            var vm = this;
            nodes.forEach(function (node, i) {
                (vm.flatNodeObject[node.parent_id] || (vm.flatNodeObject[node.parent_id] = [])).push({
                    id: node.id,
                    node_name: node.node_name,
                    parent_id: node.parent_id,
                    status: node.status,
                    sort_num: node.sort_num,
                    node_type: node.node_type,
                    extend_info: node.extend_info
                });
                if (node.children && node.children.length) {
                    vm._flatTreeNode(node.children);
                }
            });
        },
        // 获取指定节点的子节点
        _filterNodeByPid: function (pId) {
            return this.flatNodeObject[pId] || [];
        },
        // 查询培养计划
        _querySpecial: function () {
            var vm = this,
                $deferred = $.Deferred();
            if (!specialtyId) {
                $deferred.resolve(null);
            } else {
                store.querySpecial().done(function (d) {
                    if (d.start_year - 10 > currentYear || d.start_year + 10 < currentYear) {
                        vm.model.grades(generateGrade(d.start_year));
                    }
                    $deferred.resolve(d);
                });
            }
            return $deferred.promise();
        },
        // 保存培养计划
        save: function () {
            var _postData = null,
                _promise;


            if (this.validaInfo().length) {
                this.validaInfo.showAllMessages();
                return;
            }
            if (window.desEditor.count() > 20000) {
                $.fn.dialog2.helpers.alert('简介长度不能超过20000');
                return false;
            }

            _postData = ko.mapping.toJS(this.model.specialInfo);
            _postData.node_id = _postData.specialty_id;
            _postData.pass_required_score *= 1;
            _postData.pass_optional_score *= 1;

            if (_postData.terms.length > 0){
                var terms = _postData.terms
                for(var i=0,len=terms.length;i<len;i++){
                    if(!$.trim(terms[i].term_name)){
                        $.fn.dialog2.helpers.alert('阶段名称不能为空');
                        return false;
                    }
                }
            }

            if (!specialtyId) {
                delete _postData.id;
                _promise = store.createSpecial(_postData);
            } else {
                _promise = store.editSpecial(_postData);
            }
            _promise.done(function (d) {
                $.confirm({
                    type: 'alert',
                    content: (!!specialtyId ? '编辑' : '创建') + '成功',
                    confirmButton: '关闭',
                    cancelButton: false,
                    title: false
                });
                setTimeout(function () {
                    if (returnUrl != "") {
                        status == 'create' ? 
                            window.location.href = returnUrl + '&id=' + d.id :
                            window.location.href = returnUrl
                    } else {
                        window.location.href = '/' + projectCode + '/specialty/' + d.id + '/newplandetail?source='+ source + '&return_url=' + encodeURIComponent(return_url);
                    }

                }, 1500);
            });
        },
        /* 组织树 */
        showOrgTree: function (t) {
            this.flag = t == 1 ? '所属组织' : '可见范围';
            this.treePattern = t == 1;
            this.showTree(this.flag);
        },
        showTree: function ($data) {
            if (!this.orgTreeObj) {
                $.alert("没有组织树");
                return;
            }
            if ($data == '所属组织') {
                this.flag = $data;
                this.orgTreeObj.setting.check.chkStyle = 'radio';
                this.orgTreeObj.setting.callback.onCheck = this.saveOnCheckRadio;
                this.orgTreeObj.expandAll(false);
                this.orgTreeObj.expandNode(this.orgTreeObj.getNodes()[0], true, false, false, false);
                this.$searchOrg.val('');
                var updateNodesRadio = this.model.updateNodesRadio();
                if (updateNodesRadio.length > 0) {
                    this.orgTreeObj.checkNode(updateNodesRadio[0], true);
                    this.orgTreeObj.expandNode(updateNodesRadio[0], true, false, true);
                }
            } else {
                this.flag = $data;
                this.orgTreeObj.setting.check.chkStyle = 'checkbox';
                this.orgTreeObj.setting.callback.onCheck = this.saveOnCheckBox;
                this.$searchOrg.val('');
                this.orgTreeObj.expandAll(false);
                this.orgTreeObj.expandNode(this.orgTreeObj.getNodes()[0], true, false, false, false);
                this.orgTreeObj.checkAllNodes(false);
                var updateNodesCheckbox = this.model.updateNodesCheckbox();
                if (updateNodesCheckbox.length > 0) {
                    for (var i = 0; i < updateNodesCheckbox.length; i++) {
                        this.orgTreeObj.checkNode(updateNodesCheckbox[i], true);
                        this.orgTreeObj.expandNode(updateNodesCheckbox[i], true, false, true);
                    }
                }
            }
            $.each(this.orgTreeObj.transformToArray(this.orgTreeObj.getNodes()), $.proxy(function (index, item) {
                if (item.highlight) {
                    item.highlight = false;
                    this.orgTreeObj.updateNode(item, false);
                }
            }, this));
            this.model.searchText('');
            this.orgTreeObj.refresh();
            $('#zT-orgTreeModal').modal('show');
            this.$orgTreeModalBody.scrollTop(0);
        },
        _initOrgTree: function (managerData, treeData) {
            var _this = this, orgTreeObj, setting = {
                data: {
                    key: {
                        name: 'node_name',
                        title: 'node_name'
                    }
                },
                check: {
                    enable: true,
                    chkboxType: {"Y": "", "N": ""},
                    chkStyle: "radio",
                    chkDisabledInherit: false,
                    radioType: "all"
                },
                callback: {
                    onCheck: _this.saveOnCheckRadio
                },
                view: {
                    fontCss: function (treeId, treeNode) {
                        if (treeNode.highlight) {
                            return {color: "#38adff", "font-weight": "bold"};
                        } else if (treeNode.node_type === 1) {
                            return {color: "#767cf3", "font-weight": "normal"};
                        } else if (treeNode.node_type === 2) {
                            return {color: "#000", "font-weight": "normal"};
                        } else if (treeNode.node_type === 3) {
                            return {color: "#6c6d76", "font-weight": "normal"};
                        }
                    },
                    expandSpeed: ''
                }
            };
            if (treeData) {
                _this.$orgTreeModalBody = $('#zT-orgTreeModalBody');
                orgTreeObj = _this.orgTreeObj = $.fn.zTree.init((_this.$orgTree = $("#zT-orgTree")), setting, treeData);
                orgTreeObj.checkAllNodes(false);
                var allNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), rootNode = allNodes[0];
                orgTreeObj.expandNode(rootNode, true, false, false, false);
                _this.$searchOrg = $("#zT-searchOrg").on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        _this.changeColor("node_name", _this.$searchOrg.val());
                    }
                });
                /*判断是否是已存在的考试，是则选择用户选中的节点*/
                _this._setCheckData();

                /*此处判断用户权限，禁用用户不能选择的节点,待验证*/
                // if (!managerData.has_manage_project) {//这里要做反！操作，目前修改了方便调试
                //     orgTreeObj.setChkDisabled(rootNode, true, false, true);
                //     if (managerData.manager_nodes.length > 0) {
                //         $.each(managerData.manager_nodes, function (i, v) {
                //             var availableNode = orgTreeObj.getNodeByParam("node_id", v.node_id);
                //             orgTreeObj.setChkDisabled(availableNode, false, false, true);
                //         });
                //     }
                // }
            } else {
                $("#zT-orgTreeModelBody").hide();
                $("#zT-orgTreeModelBody2").text("请在项目中配置项目的UC组织");
            }
        },
        orgTreeSearch: function () {
            this.changeColor("node_name", $('#zT-searchOrg').val());
        },
        changeColor: function (key, value) {
            var _this = this, orgTreeObj = _this.orgTreeObj;
            if (orgTreeObj && value) {
                _this.$orgTree.css('display', 'none');
                value = String($.trim(value)).toLowerCase();
                var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), matchNode = null;
                for (var i = 0, len = orgTreeNodes.length; i < len; i++) {
                    var node = orgTreeNodes[i];
                    if (value !== '' && _this._matchValue(node[key], value)) {
                        node.highlight = true;
                        orgTreeObj.selectNode(node, false);
                        orgTreeObj.expandNode(node, true, false, false);
                        !matchNode && (matchNode = node);
                        orgTreeObj.updateNode(node);
                    } else {
                        orgTreeObj.expandNode(node, false, false, false);
                    }
                }
                orgTreeObj.cancelSelectedNode(orgTreeObj.getSelectedNodes()[0]);
                _this.$orgTree.css('display', 'block');
                if (value === '') {
                    _this.model.searchText('');
                } else if (matchNode) {
                    _this._setBodyScrollTop(matchNode.tId);
                    _this.model.searchText('');
                } else {
                    _this.model.searchText('没有相关数据！');
                }
                _this.$searchOrg.blur();
            }
        },
        _matchValue: function (match, value) {
            return String(match).toLowerCase().indexOf(value) > -1;
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
                    height = $('#zT-searchForm').outerHeight(true);
                }
                return height;
            }
        })(),
        _setCheckData: function (checkData) {
            var checkDataRadioId = this.model.specialInfo.affiliated_org_node();
            var getTreeData = this.orgTreeObj.transformToArray(this.orgTreeObj.getNodes());
            /*check所属组织*/
            if (checkDataRadioId) {
                for (var j = 0, treeLen = getTreeData.length; j < treeLen; j++) {
                    if (getTreeData[j].node_id === checkDataRadioId) {
                        this.model.updateNodesRadio().push(getTreeData[j]);
                        break;
                    }
                }
                var display = this.model.updateNodesRadio().length > 0 ? this.model.updateNodesRadio()[0].node_name : '点击查看或选择组织';
                this.model.orgTextRadio(display);
            }
            /*check可见范围*/
            var checkData = this.model.specialInfo.visible_nodes();
            if (checkData && checkData.length) {
                var checkArr = [];
                for (var i = 0, checkLen = checkData.length; i < checkLen; i++) {
                    for (var j = 0, treeLen = getTreeData.length; j < treeLen; j++) {
                        if (getTreeData[j].node_id === checkData[i]) {
                            checkArr.push(getTreeData[j]);
                            break;
                        }
                    }
                }
                var orgTreeObj = viewModel.orgTreeObj;
                if (orgTreeObj) {
                    var orgArr = [];
                    this.model.updateNodesCheckbox(checkArr);
                    /*$.each(checkData, function (index, item) {
                     orgArr.push(item.org_node_id);
                     });
                     this.model.specialInfo.visible_org_node(orgArr);*/
                    var display = checkArr.length > 0 ? '已选' + checkArr[0].node_name + '等' + checkArr.length + '个部门' : '点击查看或选择组织';
                    this.model.orgTextCheckbox(display);
                }
            }
        },
        saveOnCheckRadio: function (event, treeId, treeNode) {
            var updateNodesRadio = viewModel.model.updateNodesRadio;
            if (treeNode.checked) {
                updateNodesRadio([]);
                updateNodesRadio.push(treeNode);
            } else {
                updateNodesRadio.remove(function (item) {
                    return item.node_id === treeNode.node_id;
                });
            }
        },
        saveOnCheckBox: function (event, treeId, treeNode) {
            var updateNodesCheckbox = viewModel.model.updateNodesCheckbox;
            if (treeNode.checked) {
                updateNodesCheckbox.push(treeNode);
            } else {
                updateNodesCheckbox.remove(function (item) {
                    return item.node_id === treeNode.node_id;
                });
            }
        },
        saveOrg: function () {
            if (this.flag == '所属组织') {
                var parm = this.model.updateNodesRadio().length > 0 ? this.model.updateNodesRadio()[0].node_id : null;
                var display = this.model.updateNodesRadio().length > 0 ? this.model.updateNodesRadio()[0].node_name : '点击查看或选择组织';
                var rootId = this.model.updateNodesRadio().length > 0 ? this.model.updateNodesRadio()[0].root_id : null
                this.model.specialInfo.affiliated_org_node(parm);
                this.model.orgTextRadio(display);
                // this.model.specialInfo.affiliated_org_root(rootId);
            } else {
                var checkArr = [];
                var display = this.model.updateNodesCheckbox().length > 0 ? '已选' + this.model.updateNodesCheckbox()[0].node_name + '等' + this.model.updateNodesCheckbox().length + '个部门' : '点击查看或选择组织';
                $.each(this.model.updateNodesCheckbox(), function (index, item) {
                    checkArr.push(item.node_id);
                });
                this.model.specialInfo.visible_nodes(checkArr);
                this.model.orgTextCheckbox(display);
            }
            $("#zT-orgTreeModal").modal('hide');
            this.orgTreeObj.checkAllNodes(false);
        },
        cancelAllNodes: function () {
            var _this = this, orgTreeObj = _this.orgTreeObj;
            if (this.orgTreeObj.setting.check.chkStyle == 'radio') {
                var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes());
                if (_this.model.updateNodesRadio().length > 0) {
                    $.each(orgTreeNodes, function (index, item) {
                        if (item.node_id == _this.model.updateNodesRadio()[0].node_id) {
                            orgTreeObj.checkNode(item, false);
                        }
                    });
                }
                this.model.updateNodesRadio([]);
                this.model.specialInfo.affiliated_org_node('');
                this.model.orgTextRadio('点击查看或选择组织');
            } else {
                this.model.updateNodesCheckbox([]);
                this.model.specialInfo.visible_nodes([]);
                this.model.orgTextCheckbox('点击查看或选择组织');
            }
            this.orgTreeObj.checkAllNodes(false);
            $("#zT-orgTreeModal").modal('hide');
        },
    };

    $(function () {
        ko.validation.init({
            decorateInputElement: true,
            errorElementClass: 'ele-error',
            errorClass: 'mes-error',
            registerExtenders: true
        }, true);
        ko.applyBindings(new ViewModel(specialtyId, status), document.getElementById('specialty_container_js'));
    })
})(window, jQuery);
