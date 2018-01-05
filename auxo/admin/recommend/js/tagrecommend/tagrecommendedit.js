void function () {
    var store = {
        //查询单个推荐
        queryRecommend: function (id) {
            var url = '/' + projectCode + '/recommends/tags/' + id;
            return commonJS._ajaxHandler(url);
        },
        //创建推荐
        createRecommend: function (data) {
            var url = '/' + projectCode + '/v1/recommends/tags';
            return commonJS._ajaxHandler(url, JSON.stringify(data), "POST");
        },
        //更新推荐
        updateRecommend: function (id, data) {
            var url = '/' + projectCode + '/v1/recommends/tags/' + id;
            return commonJS._ajaxHandler(url, JSON.stringify(data), "PUT");
        },
        //标签树
        getCatalogs: function () {
            var url = '/' + projectCode + '/tags/tree';
            return commonJS._ajaxHandler(url);
        }
    };

    var viewModel = {
        treeCatalog: [],
        model: {
            recommend: {//用于新增
                id: recommendId || null,
                custom_type: '',
                custom_id: '',
                custom_id_type: '',
                custom_order_by: '',
                custom_id_title: "",
                app_store_object_id: "",
                app_store_object_url: "",
                status: "1"
            }
        },
        treeObj: null,
        init: function () {
            var self = this;
            $.extend(this, commonJS);
            this.model = ko.mapping.fromJS(this.model);

            this._validator();

            store.getCatalogs()
                .done(function (catalogs) {
                    self.treeCatalog = catalogs.children || [];
                    self._loadTree();
                    self._loadBaseInfo(recommendId || null)
                        .done(function () {
                            self._uploadParamsInit();
                        })
                });
            ko.applyBindings(this, document.getElementById('tegEdit'));

        },
        _loadTree: function () {
            var self = this;
            var setting = {
                data: {
                    key: {
                        children: "children",
                        name: "title",
                        title: "title"
                    },
                    simpleData: {
                        idKey: "id"
                    }
                },
                check: {
                    enable: true,
                    chkboxType: {"Y": "", "N": ""},
                    chkStyle: "radio",
                    radioType: "all"
                },
                view: {
                    selectedMulti: false
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        var isRoot = treeNode.getParentNode();
                        self.model.recommend.custom_type(treeNode.custom_type);
                        self.model.recommend.custom_id(treeNode.id);
                        self.model.recommend.custom_id_title(treeNode.title);
                        if (!isRoot) self.model.recommend.custom_id_type = 'root_tag';
                    }
                }
            };
            this.ztreeObject = $.fn.zTree.init($("#tree"), setting, this.treeCatalog);
            this.ztreeObject.checkAllNodes(false);
            this.ztreeObject.expandAll(true);
        },
        _loadBaseInfo: function (id) {
            var self = this;
            var _defer = $.Deferred();
            if (id) {
                store.queryRecommend(id)
                    .done(function (data) {
                        ko.mapping.fromJS(data, {}, viewModel.model.recommend);
                        self.model.recommend.status(data.status.toString());
                        _defer.resolve();
                    });
            } else {
                _defer.resolve();
            }
            return _defer.promise();
        },
        //保存或则修改课程信息
        save: function () {
            if (!$("#J_CourseForm").valid()) {
                return;
            }

            var _recommend = ko.mapping.toJS(this.model.recommend),
                _postData = {
                    custom_type: _recommend.custom_type,
                    custom_id: _recommend.custom_id,
                    custom_id_type: _recommend.custom_id_type || undefined,
                    title: _recommend.custom_id_title,
                    app_store_object_id: _recommend.app_store_object_id,
                    custom_order_by: _recommend.custom_order_by,
                    status: parseInt(_recommend.status)
                };
            if (!_recommend.app_store_object_id) {
                $.fn.dialog2.helpers.alert('请上传图片');
                return;
            }
            if (recommendId) {
                store.updateRecommend(recommendId, _postData)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('保存成功!', {
                            "close": function () {
                                location.href = "/" + projectCode + "/recommend/tag";
                            },
                            buttonLabelOk: '返回推荐列表'
                        });
                    })
            } else {
                store.createRecommend(_postData)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('保存成功!', {
                            "close": function () {
                                location.href = "/" + projectCode + "/recommend/tag";
                            },
                            buttonLabelOk: '返回推荐列表'
                        });
                    })

            }
        },
        saveCatalog: function () {
            $('#catalogsModal').modal('hide');
            $("#catelogs").valid();
        },
        //弹出分类框（点击选择时触发）
        catalogModal: function () {
            $('#catalogsModal').modal('show');
        },
        //上传参数初始化
        _uploadParamsInit: function () {
            var recommend = this.model.recommend;
            var params = [
                {
                    target: $('#app_logo'),
                    defaultUrl: recommend.app_store_object_url(),
                    cb: function (data) {
                        recommend.app_store_object_id(data[0].id);
                        recommend.app_store_object_url(data[0].relative_url);
                        $("#imgurl").valid("imgurl");
                    }
                }
            ];
            require.config({
                baseUrl: staticUrl
            });
            this._selfLoadUploadPlugin(params);
        },
        _selfLoadUploadPlugin: function (params) {

            //加载ICO图片上传模块
            require(["require", "exports", "admin/recommend/js/upload/upload-2.0"], function (require, exports, upload) {
                $.each(params, function (index, item) {
                    item.target.upload({
                        uploadOptions: {
                            uploadUrl: storeUrl,
                            fileTypes: "*.jpg;*.png;*.gif",
                            onQueued: function (e) {
                                this.startUpload();
                            },
                            fileSizeLimit: 1024 * 2,
                            onQueueError: function (fileEvent) {
                                var err = '';
                                switch (fileEvent.error) {
                                    case -110:
                                        err = "文件超出指定大小，请重新选择文件上传。";
                                        break;
                                    case -130:
                                        err = "请上传指定格式的文件（JPG、PNG、GIF）。";
                                        break;
                                    default:
                                        err = "文件不符合条件。";
                                }
                                $.fn.dialog2.helpers.alert(err);
                            }
                        },
                        clientType: 2,
                        defaultUrl: item.defaultUrl,
                        errorCallBack: function (data) {
                            var mgs = data.message || data.Message;
                            if (typeof(mgs) !== undefined && mgs !== "") {
                                $.fn.dialog2.helpers.alert("上传图片失败！<br/>错误信息：" + mgs);
                            } else {
                                $.fn.dialog2.helpers.alert("上传图片失败！" + data);
                            }
                        },
                        successCallBack: function (data) {
                            if (typeof(data) !== undefined && data !== null) {
                                if (item.cb) {
                                    item.cb(data.data);
                                }
                            }
                        }
                    });
                });
            });
        },
        //验证ruler
        _validator: function () {
            $("#J_CourseForm").validate({
                rules: {
                    catelogs: {
                        required: true
                    },
                    imgurl: {
                        required: true
                    }

                },
                onkeyup: function (element) {
                    $(element).valid()
                },
                messages: {
                    catelogs: {
                        required: "请选择推荐课程标签"
                    },
                    imgurl: {
                        required: "请添加图片"
                    }
                },
                onkeyup: function (element) {
                    $(element).valid()
                },
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                errorElement: 'p',
                errorClass: 'help-inline',
                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
                }
            });
        }

    };
    $(function () {
        viewModel.init();
    });

}(jQuery);