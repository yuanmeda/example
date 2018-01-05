/*
 课程学院管理
 全局变量：projectId
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //用户列表(GET)
        userList: function (data) {
            var url = '/' + projectCode + '/courses/' + courseId + '/users/search?page_size=' + data.page_size + "&page_no=" + data.page_no;

            if(data.user_id) {
                var ids = data.user_ids ? data.user_ids : [];
                ids.push(data.user_id);
                data.user_ids = ids;
            }

            if(data.status) {
                url += "&status=" + data.status;
            }

            if (data.user_ids && data.user_ids.length > 0) {
                url += "&user_ids="
                $.each(data.user_ids, function(index, item) {
                    if(index > 0)
                        url += "," + item; 
                    else
                        url += "" + item;
                });
            }

            return $.ajax({
                url: url
            });
        },
        //审核通过
        reviewUserPass: function (data) {
            var url = '/' + projectCode + '/courses/' + courseId + '/users/pass';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'POST'
            });
        },
        //审核不通过
        reviewUserReject: function (data) {
            var url = '/' + projectCode + '/courses/' + courseId + '/users/reject';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'POST'
            });
        },
        //删除学员(DELETE)
        deleteUser: function (courseId, userId) {
            var url = '/' + projectCode + '/courses/' + courseId + '/users/' + userId;

            return $.ajax({
                url: url,
                type: 'DELETE'
            });
        },
        //批量导出
        exportUser: function (data) {
            var url = '/' + projectCode + '/courses/' + courseId + '/users/export';
            return $.ajax({
                url: url,
                data: data
            });
        },
        //删除学员(DELETE)
        batchDeleteUser: function (courseId, data) {
            var url = '/' + projectCode + '/courses/' + courseId + '/users';

            return $.ajax({
                url: url,
                type: 'DELETE',
                data: JSON.stringify(data)
            });
        },
        //批量导出
        updateManualProgress: function (data, userId) {
            var url = '/' + projectCode + '/courses/' + courseId + '/users/' + userId + '/manual_progress';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'PUT',
                dataType: 'json',
                contentType: 'application/json'
            });
        },
        getUserIds: function (orgId, userName) {
            return $.ajax({
                url: "/" + projectCode + "/v0.93/organizations/" + orgId + "/orgnodes/0/users/actions/search?name=" + userName + "&$offset=0&$limit=100",
            });
        },
        getOrgInfo: function () {
            return $.ajax({
                url: opencourseWebpage + "/" + projectCode + "/open_courses/manage_orgs",
            });
        }
    };
    var statusList = [{
        text: '全部',
        value: ''
    }, {
        text: '审核拒绝',
        value: 3
    }, {
        text: '报名成功',
        value: 1
    }, {
        text: '待审核',
        value: 2
    }];
    //学员列表数据模型
    var viewModel = {
        current_select_id: 0,
        model: {
            items: [],
            filter: {
                page_size: 20, //分页大小
                page_no: 0, //分页索引
                user_id: '', //用户id
                status: '', //状态
                user_ids: []
            },
            user_name: "",
            org_id: "",
            manualProgress: {
                userId: 0,
                userName: '',
                manual_progress: 0
            },
            statusList: [], //下拉框选项数组
            userArray: [], //所有页面下被选中的学员审核数组
            pageUserArray: [], //分页待审核数组
            pageSelectUserArray: [], //当前页被选中的用户
            exportUserId: [],
            isLoading: false,
            isLoadingText: '导出'

        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            var _this = viewModel;
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //加载下拉框数据
            this.model.statusList(statusList);
            //下拉选项变化notify
            this.model.filter.status.subscribe(function (status) {
                this._doSearch();
            }, this);
            //学员数组数据强制刷新
            this.model.items.extend({
                notify: 'always'
            });
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('content'));
            //加载事件 
            this._eventHandler();
            //加载列表
            this._list(true);
            $("#selectAllButton").change(function () {
                if ($(this).is(':checked') && _this.model.pageUserArray().length > 0) {
                    _this._selectAllFunction();
                } else {
                    _this._cancelSelectFunction();
                }
            });
            this._validator();
            _this.model.userArray.subscribe(_this.judgeIfAllSelected);

            this._bindUpload();
            store.getOrgInfo().done($.proxy(function (data) {
                this.model.org_id(data.org_tree[0].root_id);
            }, this))
        },
        showManualProgressModal: function ($data) {
            this.model.manualProgress.userId($data.uc_user_display_facade ? $data.uc_user_display_facade.user_id : '');
            this.model.manualProgress.userName(($data.uc_user_display_facade ? $data.uc_user_display_facade.display_real_name : '') + '(' + ($data.uc_user_display_facade ? $data.uc_user_display_facade.user_id : '') + ')');
            this.model.manualProgress.manual_progress($data.progress.progress_percent ? $data.progress.progress_percent : 0);
            $('#js-manualProgressModal').modal('show');
        },
        saveManualProgress: function () {
            if (!$('#js-validateForm').valid()) return;
            var manualProgress = ko.mapping.toJS(this.model.manualProgress), self = this;
            store.updateManualProgress(manualProgress.manual_progress, manualProgress.userId).done(function (data) {
                $('#js-manualProgressModal').modal('hide');
                if (data) $.fn.dialog2.helpers.alert('修改成功');
                self._list();
            });
        },
        _validator: function () {
            var _self = this;
            $("#js-validateForm").validate({
                rules: {
                    manual_progress: {
                        required: true,
                        digits: true,
                        range: [0, 100]
                    }
                },
                onkeyup: function (element) {
                    $(element).valid();
                },
                messages: {
                    manual_progress: {
                        required: '请输入进度',
                        digits: '请输入整数',
                        range: '请输入0到100'
                    }
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
            })
        },
        /**
         * 课程列表初始化
         * @return {null} null
         */
        _list: function () {
            var _self = this,
                _filter = _self.model.filter,
                _search = _self._filterParams(ko.mapping.toJS(_filter));

            var orgId = this.model.org_id(),
                userName = $.trim(this.model.user_name());

            var def = $.Deferred();

            if (userName) {
                store.getUserIds(orgId, userName).done($.proxy(function (data) {
                    $.each(data.items, $.proxy(function (index, item) {
                        this.model.filter.user_ids.push(item.user_id);
                    }, this));

                    _search = _self._filterParams(ko.mapping.toJS(_filter));

                    def.resolve();
                }, this));
            }
            else {
                this.model.filter.user_ids.removeAll();
                def.resolve();
            }

            def.done(function () {
                _self._internalList(_filter, _search);
            })
        },
        _internalList: function (_filter, _search) {
            var _self = this;

            //获取职位列表
            this.model.pageUserArray([]);
            var tempArray = [];
            store.userList(_search).done(function (returnData) {
                if (returnData.items instanceof Array) {
                    $.each(returnData.items, function (index, item) {
                        // if (item.access.access_status !== 1) {
                            tempArray.push(item.user_id + "");
                        // }
                        if (item.access) {
                            item.access.create_time = item.access.create_time ? timeZoneTrans(item.access.create_time) : '';
                        }
                        if (item.progress) {
                            item.progress.finish_time = item.progress.finish_time ? timeZoneTrans(item.progress.finish_time) : "";
                        }
                    });
                    _self.model.pageUserArray(tempArray);
                    _self.model.items(returnData.items);
                    _self.isCheckAll();
                }
                Utils.pagination(returnData.total,
                    _filter.page_size(),
                    _filter.page_no(),
                    function (no) {
                        _filter.page_no(no);
                        _self._list();
                    }
                );
                $(document).trigger('showContent');
            });
        },
        /**
         * 监听全选函数
         * @return {[type]} [description]
         */
        judgeIfAllSelected: function () {
            var _self = viewModel;
            var pageUserArray = _self.model.pageUserArray();
            var userArray = _self.model.userArray();
            var tempFlag = true;
            $.each(pageUserArray, function (index, item) {
                if (userArray.indexOf(item) < 0) {
                    tempFlag = false;
                }
            })
            $("#selectAllButton").prop("checked", tempFlag);

        },
        /**
         * 全选函数
         * @return {[type]} [description]
         */
        _selectAllFunction: function () {
            var _self = viewModel;
            var pageUserArray = _self.model.pageUserArray();
            var userArray = _self.model.userArray();
            $.each(pageUserArray, function (index, item) {
                if (userArray.indexOf(item) < 0) {
                    userArray.push(item);
                }
            });
            _self.model.userArray(userArray);
        },

        /**
         * 取消全选函数
         * @return {null} null
         */
        _cancelSelectFunction: function () {
            var _self = viewModel;
            var pageUserArray = _self.model.pageUserArray();
            var userArray = _self.model.userArray();
            if (pageUserArray.length > 0) {
                $.each(pageUserArray, function (index, item) {
                    if (userArray.indexOf(item) > -1) {
                        userArray.splice(userArray.indexOf(item), 1);
                    }
                });
                _self.model.userArray(userArray);
            }
        },

        batchUser: function () {
            store.batchDeleteUser(courseId, this.model.userArray()).done($.proxy(function () {
                $.fn.dialog2.helpers.alert("删除成功");
                this._list();
                this.model.userArray.removeAll();
            }, this));
        },

        selectFile: function () {
            $("input[type=file]").click();
        },
        _bindUpload: function () {
            this.uploader = new WebUploader.Uploader({
                swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + window.location.host + '/' + projectCode + '/courses/' + courseId + '/users/import',
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                pick: {
                    id: '#js_uploader',
                    multiple: false
                },
                fileSingleSizeLimit: 10 * 1024 * 1024,
                accept: [{
                    title: "excel",
                    extensions: "xls,xlsx,xlsm",
                    mimeTypes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12'
                }]
            });
            this.uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this.uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this));
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
                return false;
            }
        },
        uploadError: function (file, reason) {
            $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason);
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (file, response) {
            if (!response.code) {
                $.fn.dialog2.helpers.alert("导入成功！");
                $("#uploadmodal").modal('hide');
                this._list();
            } else {
                response ? $.fn.dialog2.helpers.alert(response.message) : $.fn.dialog2.helpers.alert("上传出错");
            }
        },

        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
            //回车搜索
            $('#keyword').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch();
                }
            });
            //当导出iframe加载成功说明导出失败
            document.getElementById('export').onload = function () {
                var contentText = $(this.contentWindow.document).find('pre').text();
                var _parseError = contentText ? JSON.parse($(this.contentWindow.document).find('pre').text()) : null;
                if (_parseError && _parseError.detail) {
                    _self.defer.reject(_parseError.detail.substr(8, 23));
                }
            };
        },

        /**
         *判断初始化是否选中全选
         */
        isCheckAll: function () {
            var _self = viewModel;
            var pageUserArray = _self.model.pageUserArray();
            var userArray = _self.model.userArray();
            $.each(pageUserArray, function (index, item) {
                if (userArray.indexOf(item) < 0) {
                    $("#selectAllButton").prop("checked", false);
                    return;
                } else {
                    $("#selectAllButton").prop("checked", true);
                }
            })
        },
        /**
         * 审核函数
         * @userid  {object} userid 入参
         */
        _doReview: function (userid) {
            var _self = viewModel;
            _self._doAudit([userid]);
        },
        /**
         * 审核函数
         */
        _doAudit: function (data) {
            var _self = this;
            Utils.confirmTip('', {
                btn: ['审核通过', '审核拒绝'], //按钮
                skin: 'layer-confirm',
                title: '审核确认',
                closeBtn: 0,
                shadeClose: true
            })
                .done(function () {
                    store.reviewUserPass(data)
                        .done(function () {
                            Utils.msgTip('审核成功', {
                                time: 2000
                            });
                            _self._list();
                        });
                }).fail(function () {
                    store.reviewUserReject(data).done(function () {
                        Utils.msgTip('审核拒绝', {
                            icon: 2,
                            time: 2000
                        });
                        _self._list();
                    });
                }).always(function () {
                    _self.model.userArray([]);
                });
        },
        _doMoreReview: function () {
            if (this.model.userArray().length > 0) {
                this._doAudit(this.model.userArray());
            }
        },
        /**
         * 过滤请求参数
         * @param  {object} params 入参
         * @return {object}        处理后的参数
         */
        _filterParams: function (params) {
            var _params = {};
            for (var key in params) {
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '' && key != "user_ids") {
                    _params[key] = params[key];
                }

                if (params.hasOwnProperty(key) && key == "user_ids" && params[key].length > 0) {
                    _params[key] = params[key];
                }
            }
            return _params;
        },
        /**
         * 搜索
         * @return {null} null
         */
        _doSearch: function () {
            this.model.filter.page_no(0);
            this._list();
        },
        download: function() {
            window.open("http://" + location.host + "/" + projectCode + "/courses/users/import_model");
        },
        /**
         *导出功能
         *
         */
        _doExport: function () {
            var _self = viewModel,
                _loop = 30,
                _export = {
                    course_id: courseId,
                    user_id: '',
                    status: _self.model.filter.status()
                },
                _userid = _export.user_id ? ("?user_id=" + _export.user_id) : "",
                _status = _export.status ? ((_userid ? "&" : "?") + "status=" + _export.status) : "",
                _url = '/' + projectCode + "/courses/" + courseId + "/users/export" + _userid + _status,
                _count = 1;
            _self.defer = $.Deferred();
            if (this.model.isLoading()) {
                return;
            }
            this.model.isLoading(true);
            _self.model.isLoadingText('导出中 ' + _loop);
            $('#export').attr('src', _url);
            var _timer = window.setInterval(function () {
                _self.model.isLoadingText('导出中 ' + (_loop - _count));
                _count++;
                if (_count > _loop) {
                    _self.model.isLoading(false);
                    _self.model.isLoadingText('导出');
                    window.clearInterval(_timer);
                }
            }, 1000);
            _self.defer.promise()
                .done(function (data) {
                    Utils.msgTip(data, {
                        time: 3000
                    });
                })
                .fail(function (data) {
                    Utils.msgTip(data, {
                        time: 2000,
                        icon: 7
                    });
                });
        },
        /**
         * 移除勾选的课程
         * @return {null} null
         */
        _deleteUser: function (userid, $element) {
            var _self = this;
            Utils.confirmTip('确定删除？', {
                icon: 7,
                btn: ['确定', '取消']
            })
                .then(function (index) {
                    store.deleteUser(courseId, userid)
                        .done(function () {
                            Utils.msgTip('学员删除成功!')
                                .done(function () {
                                    var _pageNo = _self.model.filter.page_no();
                                    if (_self.model.items().length === 1 && _pageNo > 0) {
                                        _self.model.filter.page_no(_pageNo - 1);
                                    }
                                    _self._list();
                                });
                        });
                });
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();

})(jQuery, window);
