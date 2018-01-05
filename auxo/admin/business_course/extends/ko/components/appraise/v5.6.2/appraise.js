/**
 * 评价列表
 * @author wlj
 */
(function (w, $) {
    function Model(params) {
        this.params = params;
        this.store = {
            errorCallback: function (jqXHR) {
                if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                    $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
                } else {
                    var txt = JSON.parse(jqXHR.responseText);
                    if (txt.cause) {
                        $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                    } else {
                        $.fn.dialog2.helpers.alert(txt.message);
                    }
                    $('body').loading('hide');
                }
            },
            getAppraiseList: function (searchObj) {
                if (params && params.resourceId) {
                    searchObj.custom_id = [params.resourceId];
                    model.export_btn = true;
                }
                return $.ajax({
                    url: '/appraises/search',
                    cache: false,
                    dataType: 'json',
                    type: "POST",
                    data: JSON.stringify(searchObj)
                });
            },
            deleteAppraise: function (data) {
                return $.ajax({
                    url: '/appraises/' + data.appraise_id,
                    cache: false,
                    dataType: 'json',
                    type: "DELETE",
                    data: data.appraise_id
                });
            }
        };
        var model = {
            search: {
                content: '',
                star: '',
                custom_id: '',
                page_no: 0,
                projectCode: '',
                page_size: 10,
                course_id: '',
                course_list:[]
            },
            courses: [],
            tabIndex: 0,
            items: [],
            export_btn: 0,
            init:true
        };
        model.search.projectCode = this.params.projectCode;
        if (this.params && this.params.resourceId) {
            model.search.custom_id = this.params.resourceId;
            model.export_btn = 1;
        }

        this.model = ko.mapping.fromJS(model);
        if (this.params && this.params.resourceList) {
            var courseList = [];
            for (var i = 0; i< this.params.resourceList.length;i++){
                courseList.push(this.params.resourceList[i].id);
            }
            this.model.search.course_list(courseList);
            var resourceList  = this.params.resourceList;
            resourceList.unshift({id:'',name:'全部'});
            this.model.courses(resourceList);
        }
        this._init();

    };

    /**
     * 验证默认规则
     * @return {null} null
     */
    Model.prototype = {
        /**
         * 初始化
         */
        _init: function () {
            //ko.applyBindings(this, $('#interaction_appraise')[0]);
            var _self = this;
            //待删除
//            if (_self.model.courses().length) {
////                _self.model.search.course_list(courseList);
//                _self.model.search.course_id(_self.model.courses()[0].id);
//            }
            _self.list();
            $("#search-content").keypress(function (event) {
                if (event.keyCode == 13) {
                    _self.model.search.page_no(0);
                    _self.list();
                }
            });
        },
        tabClass: function (star) {
            this.model.tabIndex(star);
            this.model.search.page_no(0);
            this.model.search.star(star == 0 ? '' : star);
            this.list();
        },
        deleteAppraise: function (id) {
            var params = {"appraise_id": id};
            var _self = this;
            $.fn.dialog2.helpers.confirm("确认删除？", {
                "confirm": function () {
                    _self.store.deleteAppraise(params).then(function (data) {
                        _self.list();
                    });
                    return;
                },
                "decline": function () {
                    return;
                },
                buttonLabelYes: '确认',
                buttonLabelNo: '取消'
            });
        },
        list: function () {
            var search = ko.toJS(this.model.search),
                self = this;
            //兼容运营管理，运营管理只传入了projectCode
            if (search.custom_id || self.model.courses().length || (self.params && self.params.resourceList == undefined)) {
                if (self.params && self.params.resourceList) {
                    //判断是否选择全部
                    if(search.course_id != ""){//选择某个课程
                        search.custom_id = [search.course_id];
//                        search.custom_id = search.course_list;
                        delete search.course_id;
                        delete search.course_list;
                    }else{//选择全部
                        if(search.course_list && search.course_list.length ==0){
                            //选择全部并且培训和公开课下无课程时，不触发搜索，否则查出的是所有的评价数据（精品推荐）
                            self.model.items(null);
                            self.page(0, self.model.search.page_no(), null);
                            return;
                        }
                        search.custom_id = search.course_list;
                        delete search.course_id;
                        delete search.course_list;
                    }
                }else{//运营管理，啥都不传
                    search.custom_id = [];
                    delete search.course_id;
                    delete search.course_list;
                }
                self.store.getAppraiseList(search).then(function (data) {
                    self.model.items(data.items);
                    self.page(data.total ? data.total : 0, self.model.search.page_no(), data.items);
                    if(self.model.init()){
                        $("#search-content").keyup(function (event) {
                            if (event.keyCode == 13) {
                                self.model.search.page_no(0);
                                self.list();
                            }
                        });
                        self.model.init(false);
                    }
                });
            } else {
                self.model.items(null);
                self.page(0, self.model.search.page_no(), null);
            }
        },
        emoji: function (content) {
            if (content) {
                var html = content.trim().replace(/\n/g, '<br/>');
                html = jEmoji.softbankToUnified(html);
                html = jEmoji.googleToUnified(html);
                html = jEmoji.docomoToUnified(html);
                html = jEmoji.kddiToUnified(html);
                return jEmoji.unifiedToHTML(html);
            }
        },
        photo_error_js: function (binds, e) {
            e.target.src = user_default_logo;
        },
        // 导出excel
        exportExcel: function () {
            var exportFrom = $("#exportFrom");
            var search = ko.toJS(this.model.search);
            if (this.params && this.params.resourceId) {
                search.custom_id = this.params.resourceId;
            } else if (!search.custom_id) {
                delete search.custom_id;
            }
            exportFrom.attr("action", '/' + this.params.projectCode + "/appraises/export?" + $.param(search));
            exportFrom.submit();
        },
        page: function (totalCount, currentPage, items) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: self.model.search.page_size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageId) {
                    // 非第一页无记录，返回上一页
                    if ((!items || items.length == 0) && pageId > 0) {
                        pageId = pageId - 1;
                    }
                    if (pageId != currentPage) {
                        self.model.search.page_no(pageId);
                        self.list();
                    }
                }
            });
        }
    };
    ko.components.register('x-appraise-list', {
        /**
         * 组件viewModel类
         *
         * @class
         * @param params 组件viewModel实例化时的参数
         */
        viewModel: Model,
        /**
         * 组件模板
         */
        synchronous: true,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    })
})(window, jQuery);