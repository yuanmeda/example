(function (window, $) {
    var store = {
        getTree: function () {
            return $.ajax({
                url: '/' + projectCode + '/specialty/nodetree?is_show_all=1',
                type: 'GET'
            });
        },
        getYear: function () {
            return $.ajax({
                url: '/' + projectCode + '/specialty/plan/start_year'
            });
        },
        delete: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/plan?specialty_plan_id=' + data,
                type: 'DELETE'
            })
        },
        search: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/plan/search',
                data: data
            });
        }
    };
    var viewModel = {
        model: {
            filter: {
                college_id: '',
                specialty_id: '',
                start_year: '',
                page: 0,
                size: 15
            },
            items: [],
            collegeList: [{id: '', title: '全部学院'}],
            specialtyList: [],
            yearList: [{id: '', title: '全部年级'}],
            tree: {},
            delId: 0
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            this.model.filter.college_id.subscribe(function (v) {
                if (v) {
                    this.specialtyList(this.tree[v]);
                }
                else {
                    this.specialtyList([]);
                }
            }, this.model);

            this.list();
            this.init2();//初始化3个下拉框
        },
        init2: function () {
            var t = this;
            store.getTree().then(function (data) {
                if (data.children && data.children.length > 0) {
                    var cs = [{id: '', title: '全部学院'}];

                    data.children && data.children.forEach(function (v, i) {
                        cs.push({id: v.id, title: v.node_name});
                        var ss = [{id: '', title: '全部专业'}];
                        v.children.forEach(function (v, i) {
                            ss.push({id: v.id, title: v.node_name});
                        })
                        t.model.tree[v.id] = ss;
                    });
                    t.model.collegeList(cs);
                } else
                    $('#tip').modal();
            });
            store.getYear().then(function (data) {
                if (data && data.length > 0) {
                    var ys = [{id: '', title: '全部年级'}];
                    ys = ys.concat(data.map(function (d) {
                        return {id: d, title: d};
                    }));
                    t.model.yearList(ys);
                }
            });
        },
        list: function () {
            var t = this;
            store.search(ko.mapping.toJS(this.model.filter)).then(function (returnData) {
                var items = returnData.items;
                t.model.items(items);
                t.pagination(returnData.total, t.model.filter.page());
            });
        },
        search: function () {
            this.model.filter.page(0);
            this.list();
        },
        del: function (obj, evt) {
            this.delId = obj.id;
            $('#delpop').modal();
        },
        delConfirm: function () {
            var t = this;
            store.delete(this.delId).done(function () {
                $('#delpop').modal('hide');
                t.list();
            });
        },
        pagination: function (total, currentPage) {
            var that = this;
            $('#pagination').pagination(total, {
                items_per_page: that.model.filter.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        that.model.filter.page(pageNum);
                        that.list();
                    }
                }
            });
        }
    };

    $(function () {
        viewModel.init();
    });
})(window, jQuery);