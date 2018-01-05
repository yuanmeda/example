(function () {

    var store = {
        /**
         * 获取认证列表
         * @param data
         * @returns {*}
         */
        getCertificateList: function (data) {
            return $.ajax({
                url: selfUrl +  '/' + projectCode + '/experience/user/certificates',
                type: 'GET',
                data: data
            });
        }

    };

    var ViewModel = function () {

        this.model = {
            search: {
                size: 6,
                page: 0
            },
            items: [],
            offset: false
        };
    };

    ViewModel.prototype = {
        constructor: ViewModel,

        initViewModel: function (element) {
            var that = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, element);
            this.initData();
        },
        /**
         * 初始化数据
         */
        initData: function () {
            //不知道该不该传ID：{user_id: parseInt(visitorUserId || userId)}
            var that = this,
                _filter = ko.mapping.toJS(this.model.search);
            _filter.user_id = parseInt(visitorUserId || userId);
            if (_filter.user_id == visitorUserId) {
                that.model.offset(true);
            }
            store.getCertificateList(_filter).then(function (data) {
                that.model.items(data.items);
                that.pagination($('#cert_pagination'), data.total);
                send_resize();
            });
        },
        pagination: function ($pagination, total) {
            var that = this,
                currentPageIndex = this.model.search.page(),
                pageSize = this.model.search.size();
            $pagination.pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                is_show_first_last: false,
                is_show_input: false,
                is_show_total: false,
                current_page: currentPageIndex,
                prev_text: i18nHelper.getKeyValue('experience.pagination.prev'),
                next_text: i18nHelper.getKeyValue('experience.pagination.next'),
                callback: function (index) {
                    if (index != currentPageIndex) {
                        that.model.search.page(index);
                        that.initData();
                    }
                }
            });
        },
        certificateUrl: function ($data) {
            var certificateUrl = window.gaea_js_properties ? gaea_js_properties.front_certificate_url : '';

            if (!visitorUserId && $data.status == -1 || $data.status == 2) {
                return certificateUrl + '/' + projectCode + '/certificate/apply/' + $data.certificate_id;
            } else {
                return certificateUrl + '/' + projectCode + '/certificate/detail/' + $data.certificate_id;
            }
        }
    };
    $(function () {
        new ViewModel().initViewModel($('.certificate')[0]);
    });

    function send_resize(){
        window.parent.postMessage(JSON.stringify({
          "type": '$resize',
          data:{
             "width": window.innerWidth+'px',
             "height": $('body').height()+'px'
          }
        }), '*');
    }
}());