/*
 培养计划
 */
;
(function (window, $) {
    ko.options.deferUpdates = true;
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
            grades: localData.gradeEnum,
            colleges: [],
            majors: [],
            seasons: localData.seasonEnum,
            coverImg: defaultImage,
            specialInfo: {
                id: specialtyId,
                start_year: currentYear,
                college_id: '',
                college_name: '',
                specialty_id: '',
                specialty_name: '',
                start_season: 0,
                status: 0,
                // pass_score: '',

                // visible_nodes: '',

                node_id: '',
                type: 1,
                cover: '',
                summary: '',
                description: '',
                pass_required_score: '',
                pass_optional_score: '',
                visible_config: 0,
                visible_nodes: [],
                affiliated_org_node: 0
            },
            uploadInfo: {
                service_id: '',
                server_url: '',
                session: '',
                path: ''
            },
        }
        this._init();
    }

    ViewModel.prototype = {
        _init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.specialInfo.college_id.subscribe(function (id) {
                var vm = this,
                    _majors = this._filterNodeByPid(id) || [],
                    _matchs = _majors.filter(function (m, i) {
                        return m.id === vm.model.specialInfo.specialty_id()
                    });
                this.model.majors(_majors);
                if (!_matchs.length) {
                    this.model.specialInfo.specialty_id('');
                }
            }, this);
            this._loadDate();
            this._validator();
            this.validaInfo = ko.validation.group(this.model.specialInfo);
            this.initUploadCover();
        },
        initUploadCover: function () {
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
                readonlyMode: status==='detail',
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: false,
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
        _loadDate: function () {
            var vm = this;
            $.when(this._queryNodeTree(), this._querySpecial()).done(function (nodes, info) {
                var _nodes = nodes[0],
                    _info = info ? info : null,
                    _firstNodeChilds = null;
                _nodes = _nodes.children;
                vm._flatTreeNode(_nodes);
                _firstNodeChilds = vm._filterNodeByPid(null) || [];
                vm.model.colleges(_firstNodeChilds);

                if (_info) {
                    _info.cover ?
                        vm.model.coverImg('http://' + vm.model.uploadInfo.server_url() + '/v0.1/download?dentryId=' + info.cover) : 
                        vm.model.coverImg(defaultImage)
                    setTimeout(function () {
                        ko.mapping.fromJS(_info, {}, vm.model.specialInfo);

                        window.desEditor && window.desEditor.html(info.description)

                    }, 0);
                } else {
                    vm.model.specialInfo.college_id('');
                }
            });
        },
        _validator: function () {
            this.model.specialInfo.start_year.extend({
                required: {
                    params: true,
                    message: '请选择年级'
                }
            });
            this.model.specialInfo.college_id.extend({
                required: {
                    params: true,
                    message: '请选择学院'
                }
            });
            this.model.specialInfo.specialty_id.extend({
                required: {
                    params: true,
                    message: '请选择专业'
                }
            });
            this.model.specialInfo.start_season.extend({
                required: {
                    params: true,
                    message: '请选择开学季节'
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
                        console.log(d.start_year)
                    if (d.start_year > currentYear - 10 && d.start_year < currentYear + 10 ) {
                        console.log(d.start_year)
                        vm.model.grades(generateGrade(currentYear));
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
                    window.location.href = '/' + projectCode + '/specialty_2/' + d.id + '/plandetail?source='+ source + '&return_url=' + encodeURIComponent(return_url);
                }, 1500);
            });
        }
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
