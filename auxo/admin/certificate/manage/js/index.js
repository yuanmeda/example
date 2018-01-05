;
(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    var PROJECT_CODE = GLOBAL['projectCode'];

    // 证书分类命名空间
    var TREE = GLOBAL['tree'];

    var service = {

        /**
         * 取证书列表
         * TODO 替换MOCK数据
         * @param data
         * @returns {*}
         */
        getCertificateList: function (data) {
            return $.ajax({
                url: '/' + PROJECT_CODE + '/certificates/search',
                type: 'GET',
                dataType: 'json',
                data: master.utils.removeEmpty(data)
            });
        },
        /**
         * 删除证书
         * @param ids {Array}
         * @returns {*}
         */
        del: function (ids) {
            return $.ajax({
                url: certificate_srv_host + '/v1/certificates/' + ids,
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(ids)
            });
        },

        /**
         * 批量删除
         * @param ids {Array}
         * @returns {*}
         */
        batchDel: function (ids) {
            return $.ajax({
                url: certificate_srv_host + '/v1/certificates/actions/delete',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(ids)
            });
        }
    };

    var ViewModel = function () {

        this.model = {

            search: {
                name: '',
                type_id: '',
                type_title: '全部',
                page: 0,
                size: 10
            },

            totalCount: 0,              // 总记录数

            dataList: [],               // 列表数据

            checkedList: [],            // 选中的记录

            hasInitialized: false

        };

        return this;
    };

    ViewModel.prototype = {

        constructor: ViewModel,

        initViewModel: function (element) {
            this.model = koMapping.fromJS(this.model);

            this.initTree();
            this.search();
            ko.applyBindings(this, element);
        },

        /**
         * 初始化证书分类选择框
         */
        initTree: function () {
            TREE.show('-1', '#tree');
        },

        list: function () {
            var searchData = koMapping.toJS(this.model.search),
                that = this;
            service.getCertificateList(searchData).then(function (data) {
                var unwrapCheckedList = that.model.checkedList.peek(),
                    items = data.items;

                // 确保翻页后选中状态不丢失
                if (unwrapCheckedList.length && items.length) {
                    var checkedCount = 0;
                    $.each(items, function (i, v) {
                        var firstIndex = master.fmt.index(v, unwrapCheckedList, 'id');
                        if (firstIndex > -1) {
                            items[i] = unwrapCheckedList[firstIndex];
                            checkedCount++;
                        }
                    });
                    // 全选按钮选中/不选中
                    if (checkedCount == items.length) {
                        $('#checkAll').prop('checked', 'checked');
                    } else {
                        $('#checkAll').removeAttr('checked');
                    }
                }
                that.model.dataList(items);
                that.model.totalCount(data.count);
                that.generalPagination($('#pagination'), data.count, searchData.page, searchData.size);
                that.model.hasInitialized(true);
            });
        },

        search: function () {
            this.model.search.page(0);
            this.model.checkedList([]);
            $('#checkAll').removeAttr('checked');
            this.list();
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
         * 当前页 全选/全不选
         * @param context
         * @param e
         * @returns {boolean}
         */
        checkAll: function (context, e) {
            var isChecked = $(e.target).is(':checked'),
                checkedList = this.model.checkedList,
                unwrapCheckedList = checkedList.peek();
            $.each(this.model.dataList.peek(), function (i, v) {
                var firstIndex = checkedList.indexOf(v);
                if (isChecked && firstIndex == -1) {
                    unwrapCheckedList.push(v);
                } else if (!isChecked && firstIndex > -1) {
                    unwrapCheckedList.splice(firstIndex, 1);
                }
            });
            checkedList(unwrapCheckedList);
            return true;
        },

        /**
         * 转义
         * @param item
         */
        escape_html: function (str) {
            return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },

        /**
         * 删除单个对象
         * @param item
         */
        del: function (item) {
            var that = this;
            $.confirm({
                title: '系统提示',
                content: '确定删除[<span style="color: red;">' + this.escape_html(item.name) + '</span>]证书?',
                buttons:{
                    confirm: {
                        text: '确定',
                        btnClass: 'btn-warning',
                        action: function(){
                            service.del([item.id]).then(function () {
                                that.model.checkedList.remove(item);
                                that.list();
                            });
                        }
                    },
                    cancel:{
                        text: '取消',
                        action:　$.noop
                    }
                }
            });
        },

        /**
         * 批量删除
         */
        batchDel: function () {
            var that = this,
                unwrapCheckedList = this.model.checkedList.peek();
            if (!unwrapCheckedList.length) {
                return $.alert('请选择要删除的记录');
            }
            $.confirm({
                title: '系统提示',
                content: '确定删除选中的[<span style="color: red;">' + unwrapCheckedList.length + '</span>]个证书?',
                buttons:{
                    confirm:{
                        text: '确定',
                        btnClass: 'btn-warning',
                        action: function(){
                            var ids = [];
                            $.each(unwrapCheckedList, function (i, v) {
                                ids.push(v.id);
                            });
                            service.batchDel(ids).then(function () {
                                $('#checkAll').removeAttr('checked');
                                that.model.checkedList([]);
                                that.list();
                            });
                        }
                    },
                    cancel:{
                        text: '取消',
                        action: $.noop
                    }
                }
            });
        },
        /**
         * 选择分类
         */
        selectType: function () {
            var node = TREE.node()[0],
                search = this.model.search;
            if (node.id == -1) {
                search.type_id('');
            } else {
                search.type_id(node.id);
            }
            search.type_title(node.title);
            $('#typeModal').modal('hide');
        }
    };

    $(function () {
        (new ViewModel()).initViewModel(document.getElementById('boot'));
    });

}());