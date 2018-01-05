/**
 * Created by Administrator on 2017.8.3.
 */
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
         * 审核人列表
         * @param data
         * @returns {*}
         */
        getAuditorList: function (data) {
            return $.ajax({
                url: '/v1/auditors/search',
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
                url: auditApiUrl + '/v1/scopes/search',
                type: 'POST',
                data:  JSON.stringify(data)
            });
        },

        /**
         * 获取类型
         * @param data
         * @returns {*}
         */
        save: function (data) {
            return $.ajax({
                url: auditApiUrl + '/v1/auditors/' +data.auditor_id,
                type: 'PUT',
                data:  JSON.stringify(data.item)
            });
        },

        /**
         * 删除审核
         * @param ids {Array}
         * @returns {*}
         */
        delete: function (auditor_id) {
            return $.ajax({
                url: auditApiUrl + '/v1/auditors/' + auditor_id,
                type: 'DELETE'
            });
        }
    };

    var ViewModel = function () {

        this.model = {
            search: {
                "program_id": programId,
                "scope_ref_id": "",
                "page": 0,
                "size": 20
            },
            typeSearch: {
                "ref_id": "",
                "program_id": programId
            },
            editeDate:{
                "program_id": programId,
                "user_name": '',
                "user_code": '',
                "scope_ref_ids": [],
                "scope_ref_names": [],
                "disabled" : false
            },

            savaData: {  //编辑保存的数据
                "auditor_id": null,
                "item": {
                    "disabled": false,
                    "scope_ref_ids": []
                }
            },

            typeList: [{ref_id: '', ref_name: '全部类型'}],

            dataList: [],               // 列表数据

            isShowType: true,          //根据类型接口返回判断是否显示类型

            checkedList: [],            // 选中的记录

            typeNameArr: [],        //存放权限名称集合

            typeIdArr: [],        //存放权限id集合

            newTypeList:[],        //编辑时的权限列表

            isChoseAll: false,

            hasInitialized: false

        };


        return this;
    };

    ViewModel.prototype = {

        constructor: ViewModel,

        initViewModel: function (element) {
            this.model = koMapping.fromJS(this.model);
            ko.applyBindings(this);
            this.model.savaData.item.scope_ref_ids.extend({
                'notify': 'always'
            }).subscribe(this._flashByTypeName, this);

            this.model.savaData.item.scope_ref_ids.extend({
                'notify': 'always'
            }).subscribe(this.allchecked, this);

            this.model.search.scope_ref_id.extend({
                'notify': 'always'
            }).subscribe(this._flashByType, this);

            this.list();
            this.typeList();
        },


        list: function () {
            var searchData = koMapping.toJS(this.model.search),
                that = this;
            store.getAuditorList(searchData).then(function (data) {
                that.model.dataList(data.items);
                that.generalPagination($('#pagination'), data.total, searchData.page, searchData.size);
                that.model.hasInitialized(true);
            });
        },

        typeList: function () {
            var searchTypeData = koMapping.toJS(this.model.typeSearch),
                that = this;
            store.getTypeList(searchTypeData).then(function (data) {
                if (data && data.length > 0) {
                    var cs = [{ref_id: '', ref_name: '全部分类'}],
                        //ss = [{ref_id: '', ref_name: '全部'}],
                        ss = [],
                        bs = [],
                        ds = [];
                    data && data.forEach(function (v, i) {
                        cs.push({ref_id: v.ref_id, ref_name: v.ref_name});
                        ss.push({ref_id: v.ref_id, ref_name: v.ref_name});
                        bs.push(v.ref_name);
                        ds.push(v.ref_id);
                    });
                    that.model.typeList(cs);
                    that.model.typeNameArr(bs);
                    that.model.newTypeList(ss);
                    that.model.typeIdArr(ds);
                } else {
                    that.model.isShowType(false);
                }
            });
        },



        choseAll: function () {
            var that = this;
            this.typeList();
            if(this.model.isChoseAll()) {
                that.model.savaData.item.scope_ref_ids(this.model.typeIdArr());
            } else {
                that.model.savaData.item.scope_ref_ids([]);
            }
        },

        allchecked: function () {
            this.typeList();
            if(this.model.savaData.item.scope_ref_ids().length < this.model.typeIdArr().length) {
                this.model.isChoseAll(false);
            } else if(this.model.savaData.item.scope_ref_ids().length == this.model.typeIdArr().length) {
                this.model.isChoseAll(true);
            }
        },


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
                        store.delete(item.auditor_id).done(function () {
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
            this.model.savaData.item.disabled(this.model.savaData.item.disabled());
            var saveData = koMapping.toJS(this.model.savaData),
                that = this;
            if(this.model.isChoseAll()) {
                that.model.savaData.item.scope_ref_ids([]);
            }
            store.save(saveData).done(function () {
                $.alert({
                    title: false,
                    content: '保存成功'
                });
                $('#editeCheckList').modal('hide');
                that.list();
            });
        },

        /**
         * 编辑审核
         * @param item
         */
        edite: function (item) {
            var that = this;
            this.list();
            this.model.editeDate.user_name(item.user_name);
            this.model.editeDate.user_code(item.user_code);
            this.model.savaData.item.disabled(item.disabled);
            this.model.savaData.auditor_id(item.auditor_id);
            if (item.scope_ref_names == null){
                that.model.editeDate.scope_ref_names(that.model.typeNameArr());
            } else (
                that.model.editeDate.scope_ref_names(item.scope_ref_names)
            );
            if (item.scope_ref_ids == null){
                that.model.isChoseAll(true);
                that.model.savaData.item.scope_ref_ids(that.model.typeIdArr());
            } else (
                that.model.savaData.item.scope_ref_ids(item.scope_ref_ids)
            )

        },

        /**
         * 转换
         * @param item
         */
        change: function (name) {
            if(name == null || name.length == this.model.typeList().length - 1){
                return '通用权限';
            } else {
                return name.join(',');
            }
        },
        /**
         * 权限选择刷新
         * @param item
         */
        _flashByTypeName: function () {
            var data = this.model.typeList(),
                nameData = [],
                idData = this.model.savaData.item.scope_ref_ids();
            for (var i=0;i<idData.length;i++) {
                data && data.forEach(function (v, j) {
                    if(v.ref_id == idData[i])
                        nameData.push( v.ref_name);
                });
            }

            this.model.editeDate.scope_ref_names(nameData);
        },

        /**
         * 改变类型刷新
         * @param item
         */
        _flashByType: function (item) {
            this.model.search.page(0);
            this.list();
        },

        /**
         * 状态
         * @param item
         */
        status: function (flag) {
            var status = null;
            if (flag){
                status = '已禁用'
            } else {status = '已启用';}
            return status;
        },
    };

    $(function () {
        (new ViewModel()).initViewModel();
    });

}());