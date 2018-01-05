void function () {
    var store = {
        //查询单个推荐
        queryRecommend: function () {
            var url = '/' + projectCode + '/recommends/courses/' + recommendId;
            return commonJS._ajaxHandler(url);
        },
        //创建推荐
        createRecommend: function (data) {
            var url = '/' + projectCode + '/v1/recommends/courses';
            return commonJS._ajaxHandler(url, JSON.stringify(data), "POST");
        },
        //更新推荐
        updateRecommend: function (data) {
            var url = '/' + projectCode + '/v1/recommends/courses/' + recommendId;
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
            recommend: { //用于新增
                id: recommendId || null,
                title: "",
                status: "1",
                custom_type: '',
                custom_id: '',
                custom_id_title: '',
                custom_order_by: '',
                custom_id_type: '',
                recommend_mode: '0',
                recommend_course_detail_list: []
            },
            btn: {
                text: {
                    'auxo-open-course': '选择公开课',
                    'auxo-train': '选择培训认证',
                    'auxo-exam-center': '选择测评中心'
                }
            },
            error: {
                max: false,
                min: false
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
                    self.treeCatalog = catalogs;
                    self.loadTree();
                });

            this.model.recommend.custom_type.subscribe(function (nv) {
                if (nv) this.model.recommend.recommend_course_detail_list([]);
            }, this);

            this.model.error.max = ko.computed(function () {
                return this.model.recommend.recommend_course_detail_list().length > 8;
            }, this);

            this.model.recommend.recommend_mode.subscribe(function (nv) {
                if (nv == 1 && !this.model.recommend.id()) this.model.recommend.custom_type('auxo-open-course');
            }, this);
            if (recommendId) {
                store.queryRecommend()
                    .done(function (data) {
                        data.status = data.status.toString();
                        data.recommend_mode = data.recommend_mode.toString();
                        data.recommend_course_detail_list = data.recommend_course_detail_list ? self.formatRecommendList(data.recommend_course_detail_list) : [];

                        self.model.recommend.custom_id_title(data.custom_id_title);
                        self.model.recommend.custom_type(data.custom_type);
                        self.model.recommend.title(data.title);
                        self.model.recommend.status(String(data.status));
                        self.model.recommend.custom_order_by(String(data.custom_order_by));
                        self.model.recommend.recommend_mode(String(data.recommend_mode));
                        self.model.recommend.recommend_course_detail_list(data.recommend_course_detail_list);
                    });
            }
            ko.applyBindings(this, document.getElementById('courseEdit'));
        },
        loadTree: function () {
            var self = this;
            var catalogs = this.treeCatalog;
            if (catalogs) {
                if (catalogs.children instanceof Array) {
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
                            chkboxType: {
                                "Y": "",
                                "N": ""
                            },
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
                                if (self.model.recommend.title() === '') self.model.recommend.title(treeNode.title);
                                if (!isRoot) self.model.recommend.custom_id_type = 'root_tag';
                            }
                        }
                    };
                    var ztreeObject = this.ztreeObject = $.fn.zTree.init($("#tree"), setting, catalogs.children);
                    ztreeObject.checkAllNodes(false);
                    ztreeObject.expandAll(true);
                } else {
                    $("#tree").text("无分类！");
                }
            } else {
                $("#tree").text("无分类！");
            }
        },
        formatCourseList: function (courses) {
            var type = this.model.recommend.custom_type();
            var result = $.map(courses, function (v, i) {
                return {
                    custom_id: v.id,
                    custom_type: type,
                    custom_title: v.title,
                    custom_status: v.status,
                    sort_number: i
                }
            });
            return result;
        },
        formatRecommendList: function (data) {
            var result = $.map(data, function (v, i) {
                return {
                    id: v.custom_id,
                    title: v.custom_title,
                    status: v.custom_status
                }
            });
            return result;
        },
        //保存或则修改课程信息
        save: function () {
            if (!$("#J_CourseForm").valid()) return;
            var data = ko.mapping.toJS(this.model.recommend), len = data.recommend_course_detail_list.length;
            if (data.recommend_mode == 1) {
                if (len > 8) return false;
                if (len === 0) {
                    this.model.error.min(true);
                    return false;
                }
                data.custom_id_type = 'root_tag';
                data.recommend_course_detail_list = this.formatCourseList(data.recommend_course_detail_list);
                data.custom_id = undefined;
                data.custom_id_title = undefined;
                data.custom_order_by = undefined;
            } else if (data.recommend_mode == 0) {
                if (!$('input[name="catelogs"]').valid()) return false;
                data.recommend_course_detail_list = undefined;
            }
            data.id = undefined;
            data.title = $.trim(data.title);
            data.custom_id_type = data.custom_id_type ? data.custom_id_type : undefined;
            if (recommendId) {
                store.updateRecommend(data)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('保存成功!', {
                            "close": function () {
                                location.href = '/' + projectCode + '/recommend/course';
                            },
                            buttonLabelOk: '返回推荐列表'
                        });
                    });
            } else {
                store.createRecommend(data)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('保存成功!', {
                            "close": function () {
                                location.href = '/' + projectCode + '/recommend/course';
                            },
                            buttonLabelOk: '返回推荐列表'
                        });
                    });
            }
        },
        move: function (index, direction) {
            if ((index === 0 && direction === -1) || (index === this.model.recommend.recommend_course_detail_list().length - 1 && direction === 1)) return;
            var courseList = this.model.recommend.recommend_course_detail_list,
                moveItme = courseList.splice(index, 1);
            courseList.splice(index + direction, 0, moveItme[0]);
        },
        del: function ($data) {
            this.model.recommend.recommend_course_detail_list.remove($data);
        },
        openModal: function () {
            var me = this;
            this.model.error.min(false);
            window.selectedCourse = this.model.recommend.recommend_course_detail_list().concat();
            var type = this.model.recommend.custom_type();
            $.recommend({
                type: type, options: true, success: function (data) {
                    if (data) {
                        me.model.recommend.recommend_course_detail_list(data);
                    }
                }
            });
        },
        saveCatalog: function () {
            $('#catalogsModal').modal('hide');
            $("#J_CourseForm").valid();
        },
        //弹出分类框（点击选择时触发）
        catalogModal: function () {
            $('#catalogsModal').modal('show');
        },
        _validator: function () {
            var self = this;
            $.validator.addMethod('catelog', function (value, element) {
                return self.model.recommend.recommend_mode() == 1 || (self.model.recommend.recommend_mode() == 0 && value !== '')
            }, '请选择推荐课程标签');
            $("#J_CourseForm").validate({
                rules: {
                    title: {
                        required: true,
                        maxlength: 50,
                        minlength: 2
                    },
                    catelogs: {
                        catelog: true
                    }
                },
                onkeyup: function (element) {
                    $(element).valid();
                },
                messages: {
                    title: {
                        required: "请输入推荐名称",
                        minlength: $.validator.format("推荐名称长度不能小于{0}字符"),
                        maxlength: $.validator.format("推荐名称不能多于{0}个字")
                    },
                    catelogs: {
                        catelog: "请选择推荐课程标签"
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
            });
        }
    };
    $(function () {
        viewModel.init();
    });
}(jQuery);
