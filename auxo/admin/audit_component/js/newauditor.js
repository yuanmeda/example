/**
 * Created by Administrator on 2017.8.2.
 */
;
(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;


    var store = {
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
         * 保存新增审核人
         * @param data
         * @returns {*}
         */
        save: function (data) {
            return $.ajax({
                url: auditApiUrl + '/v1/auditors',
                type: 'POST',
                data:  JSON.stringify(data)
            });
        }

    };

    var ViewModel = function () {


        this.model = {
            typeSearch: {
                "ref_id": "",
                "program_id": programId
            },
            newAuditorData:{
                "program_id": programId,
                "disabled": false,
                "user_id": [],
                "scope_ref_ids": []
            },

            typeList: [],        //添加权限列表

            selectedList:[],

            readonly: false,

            isChoseAll: false,

            idArray: [],

            isShowType: true          //根据类型接口返回判断是否显示类型


        };


        return this;
    };

    ViewModel.prototype = {

        constructor: ViewModel,

        initViewModel: function (element) {
            this.model = koMapping.fromJS(this.model);
            this.uTreeOpts = {
                readonly: false,
                orgId: orgId,
                selectedList: this.model.selectedList,
                config: {
                    projectCode: projectCode,
                    host: opencourseWebpage,
                    userHost: '',
                    version: 'v1',
                    userVersion: 'v0.93',
                    initData: null,
                    avatarPath: CSAvatarPath,
                    isRadio: false
                }
            };
            this.model.newAuditorData.scope_ref_ids.extend({
                'notify': 'always'
            }).subscribe(this.allchecked, this);
            ko.applyBindings(this);


            this.typeList();
        },

        allchecked: function () {
            if(this.model.newAuditorData.scope_ref_ids().length < this.model.idArray().length) {
                this.model.isChoseAll(false);
            } else if(this.model.newAuditorData.scope_ref_ids().length == this.model.idArray().length) {
                this.model.isChoseAll(true);
            }
        },

        typeList: function () {
            var searchTypeData = koMapping.toJS(this.model.typeSearch),
                that = this;
            store.getTypeList(searchTypeData).then(function (data) {
                if (data && data.length > 0) {
                   // var cs = [{ref_id: '', ref_name: '通用权限'}];
                    var cs = [],bs = [];
                    data && data.forEach(function (v, i) {
                        cs.push({ref_id: v.ref_id, ref_name: v.ref_name});
                        bs.push(v.ref_id);
                    });
                    that.model.typeList(cs);
                    that.model.idArray(bs);
                } else {
                    that.model.isShowType(false);
                }
            });
        },

        choseAll: function () {
            var that = this;
            this.typeList();
            if(this.model.isChoseAll()) {
                that.model.newAuditorData.scope_ref_ids(that.model.idArray());
            } else {
                that.model.newAuditorData.scope_ref_ids([]);
            }
        },

        /**
         *添加人员
         * @param item
         */
        choseAuditor: function () {
            $('#choseAuditor').modal();

        },
        removeRequiredUser: function (removeItem, index) {
            var requiredUserList = this.model.selectedList();
            requiredUserList.splice(index, 1);
            this.model.selectedList(requiredUserList);
        },

        showUserTree: function () {
            $('#js-userTreeModal').modal('show');
        },

        /**
         * 保存
         * @param item
         */
        save: function () {
            var that = this,arrId = [];
            if (this.model.selectedList().length == 0) {
                $.confirm({
                    title: '提示',
                    content: '请添加审核人员',
                    confirmButtonClass: 'btn-info',
                    cancelButtonClass: 'btn-danger',
                    buttons: {
                        "确定": function () {}
                    }
                })
            } else {
                this.model.selectedList().forEach(function (v, i) {
                    arrId.push(v.user_id);
                });
                if(this.model.isChoseAll()) {
                    this.model.newAuditorData.scope_ref_ids([]);
                }
                this.model.newAuditorData.user_id(arrId);
                this.model.newAuditorData.disabled(this.model.newAuditorData.disabled());
                store.save(koMapping.toJS(this.model.newAuditorData)).done(function () {
                    $.alert({
                        title: false,
                        content: '保存成功'
                    });
                    window.location.href = '/' + projectCode + '/audit/auditor?program_id=' + programId;
                });
            }


        },



    };

    $(function () {
        (new ViewModel()).initViewModel();
    });

}());