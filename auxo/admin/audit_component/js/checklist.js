/**
 * Created by Administrator on 2017.8.2.
 */
;
(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    //var PROJECT_CODE = GLOBAL['projectCode'];

    var store = {

        /**
         * 审核列表
         * @param data
         * @returns {*}
         */
        getCheckList: function (data) {
            return $.ajax({
                url: auditApiUrl + '/v1/checklists/search',
                type: 'POST',
                data:  JSON.stringify(data)
            });
        },

        /**
         * 获取类型
         * @param data
         * @returns {*}
         */
        getTypeList: function (data) {
            return $.ajax({
                url: auditApiUrl + '/v1/checklist/types/search',
                type: 'POST',
                data:  JSON.stringify(data)
            });
        },

        /**
         * 保存审核
         * @param data
         * @returns {*}
         */
        save: function (data) {
            return $.ajax({
                url: auditApiUrl + '/v1/checklists',
                type: 'POST',
                data:  JSON.stringify(data)
            });
        },

        /**
         * 删除审核
         * @param ids {Array}
         * @returns {*}
         */
        delete: function (id) {
            return $.ajax({
                url: auditApiUrl + '/v1/checklists/' +id,
                type: 'DELETE'
            });
        },

        /**
         * 更新审核
         * @param data
         * @returns {*}
         */
        update: function (data,id) {
            return $.ajax({
                url: auditApiUrl + '/v1/checklists/' + id,
                type: 'PUT',
                data:  JSON.stringify(data)
            });
        }
    };

    var ViewModel = function () {

        this.model = {
            search: {                   //审核查询
                "program_id": programId,
                "checklist_type_ref_id": [],
                "page": 0,
                "size": 20
            },
            typeSearch: {                //权限查询
                "program_id": programId,
                "checklist_type_ref_id": [],
                "page": 0,
                "size": 20
            },
            editeDate:{              //编辑保存数据
                "program_id": programId,
                "content": '',
                "checklist_type_ref_ids": []
            },
            typeList: [{ref_id: '', ref_name: '全部类型'}],

            type: '',

            newTypeList: [],

            dataList: [],               // 列表数据

            isShowType: true,          //根据类型接口返回判断是否显示类型

            checkedList: [],            // 选中的记录

            hasInitialized: false,

            allIdArray: [],     //存放所有类型id

            updateId: null,

            isChoseAll: false,

            title:'',   //弹框标题

            creat0rEdite: true

        };


        return this;
    };

    ViewModel.prototype = {

        constructor: ViewModel,

        initViewModel: function () {
            this.model = koMapping.fromJS(this.model);
            ko.applyBindings(this);

            this.model.type.extend({
                'notify': 'always'
            }).subscribe(this._flashByType, this);

            this.model.editeDate.checklist_type_ref_ids.extend({
                'notify': 'always'
            }).subscribe(this.allchecked, this);

            this.list();

        },

        allchecked: function () {
            if(this.model.editeDate.checklist_type_ref_ids().length < this.model.allIdArray().length) {
                this.model.isChoseAll(false);
            } else if(this.model.editeDate.checklist_type_ref_ids().length == this.model.allIdArray().length) {
                this.model.isChoseAll(true);
            }
        },


        /**
         * 审核列表
         * @param item
         */
        list: function () {
            this.typeList();
            var searchData = koMapping.toJS(this.model.search),
                that = this;
            store.getCheckList(searchData).then(function (data) {
                that.model.dataList(data.items);
                that.generalPagination($('#pagination'), data.total, searchData.page, searchData.size);
                that.model.hasInitialized(true);
            });

        },

        /**
         * 获取权限列表
         * @param item
         */
        typeList: function () {
            var searchTypeData = koMapping.toJS(this.model.typeSearch),
                that = this;
            store.getTypeList(searchTypeData).then(function (data) {
                if (data && data.length > 0) {
                    var cs = [{ref_id: '', ref_name: '全部分类'}],
                        bs = [],
                        ds = [];
                    data && data.forEach(function (v, i) {
                        cs.push({ref_id: v.ref_id, ref_name: v.ref_name});
                        bs.push({ref_id: v.ref_id, ref_name: v.ref_name});
                        ds.push(v.ref_id);
                    });
                    that.model.typeList(cs);
                    that.model.newTypeList(bs);
                    that.model.allIdArray(ds);
                } else {
                    that.model.isShowType(false);
                }
            });
        },

        /**
         * 分页
         * @param item
         */
        generalPagination: function ($pagination, total, currentPage, pageSize) {
            var that = this;
            $pagination.pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        that.model.search.page(pageNum);
                        that.list();
                    }
                }
            });
        },
        /**
         * 删除审核
         * @param item
         */
        delete: function (item) {
            var that= this;
            $.confirm({
                title: '删除提示!',
                content: '确认删除？',
                confirmButtonClass: 'btn-info',
                cancelButtonClass: 'btn-danger',
                buttons: {
                    "确定": function () {
                        store.delete(item.checklist_id).done(function () {
                            $.alert({
                                title: false,
                                content: '删除成功'
                            });
                            that.list();
                        });
                    },
                    "取消": function () {

                    }
                }
            })
        },
        /**
         * 保存
         * @param item
         */
        save: function () {
            if (this.model.isChoseAll()) {
                this.model.editeDate.checklist_type_ref_ids([]);
            }
            var saveData = koMapping.toJS(this.model.editeDate),
                data = {"content": this.model.editeDate.content},
                id = this.model.updateId(),
                that = this;
            if(!saveData.content) {
                $.confirm({
                    title: '提示',
                    content: '审核标准不能为空',
                    confirmButtonClass: 'btn-info',
                    cancelButtonClass: 'btn-danger',
                    buttons: {
                        "确定": function () {}
                    }
                })
            } else {
                if (this.model.creat0rEdite()) {
                    store.save(saveData).done(function () {
                        $.alert({
                            title: false,
                            content: '保存成功'
                        });
                        that.list();
                    });
                } else {
                    store.update(koMapping.toJS(data),id).done(function () {
                        $.alert({
                            title: false,
                            content: '更新成功'
                        });
                        that.list();
                    });
                }
                $('#newCheckList').modal('hide');
            }
        },


        /**
         * 编辑审核
         * @param item
         */
        edite: function (item) {
            this.model.editeDate.content(item.content);
            this.model.updateId(item.checklist_id);
            this.model.creat0rEdite(false);
            this.model.title('编辑审核标准');
            $('#newCheckList').modal();
        },

        /**
         * 新建审核
         * @param item
         */
        creat: function () {
            this.model.creat0rEdite(true);
            this.model.editeDate.content('');
            this.model.editeDate.checklist_type_ref_ids([]);
            this.model.isChoseAll(false);
            this.model.updateId('');
            this.model.title('新增审核checklict');
            $('#newCheckList').modal();
        },

        choseAll: function () {
            var that = this;
            this.typeList();
            if(this.model.isChoseAll()) {
                that.model.editeDate.checklist_type_ref_ids(that.model.allIdArray());
            } else {
                that.model.editeDate.checklist_type_ref_ids([]);
            }
        },

        /**
         * 权限类型筛选
         * @param item
         */
        _flashByType: function () {
            var that = this;
            if (this.model.type() == '') {
                that.model.search.checklist_type_ref_id([]);
            } else {
                that.model.search.checklist_type_ref_id([]);
                that.model.search.checklist_type_ref_id.push(this.model.type);
            }
            this.model.search.page(0);
            this.list();
        },

        /**
         * 文字转换
         * @param item
         */
        typeName: function (name) {
            if (name) {
                return name
            }else
                return '通用权限'
        }
    };

    $(function () {
        (new ViewModel()).initViewModel();
    });

}());