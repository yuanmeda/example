/**
 * Created by Administrator on 2016/9/14 0014.
 */
(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    var PROJECT_CODE = GLOBAL['projectCode'];

    var TREE = GLOBAL['tree'];

    var service = {
        getCertificateList: function (data) {
            var url = '/' + PROJECT_CODE + '/certificates/user_certificates/stat';
            return $.ajax({
                url: url,
                data: data,
                type: 'GET'
            });
        }
    };

    var ViewModel = function () {

        this.model = {

            items: [],

            search: {
                name: '',
                type_id: '',
                type_title: '全部',
                page: 0,
                size: 10,
            },


            totalCount: 0,              // 总记录数

            dataList: [],               // 列表数据
            // 选中的记录

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

        initTree: function () {
            TREE.show('-1', '#tree');
        },

        list: function () {
            var searchData = ko.mapping.toJS(this.model.search),
                that = this;
            service.getCertificateList(searchData).then(function (data) {
                var items = data.items;
                that.model.dataList(items);
                that.model.totalCount(data.count);
                that.generalPagination($('#pagination'), data.count, searchData.page, searchData.size);
                that.model.hasInitialized(true);
            });
        },

        search: function () {
            this.model.search.page(0);
            this.model.dataList([]);
            this.list();
        },

        getTrainsTitle: function (trains) {
            var result = [];
               for (var i=0;i<trains.length;i++) {
                   result.push(trains[i] ? trains[i].title : '');
               }
               return result.join('、');
        },

        keydownsearch: function (o, evt) {
            if (evt.keyCode == 13) {
                this.search();
                return false;
            }
            return true;
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
                callback: function(pageNum) {
                    if (pageNum != currentPage) {
                        that.model.search.page(pageNum);
                        that.list();
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