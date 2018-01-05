;
(function () {

    var GLOBAL = (0, eval)('this');

    var PROJECT_CODE = GLOBAL['projectCode'];

    // 被访问用户的ID
    var VISITOR_USER_ID = GLOBAL['visitorUserId'];

    // 当前登录用户ID
    var USER_ID = GLOBAL['userId'];

    var HOSTS = GLOBAL['gaea_js_properties'];

    var koMapping = ko.mapping;

    var service = {
        /**
         * 查询用户学习列表（包含学习单元信息）
         * @param data
         * @returns {*}
         */
        study: function (data) {
            return $.ajax({
                url: HOSTS.auxo_mystudy_url + '/v2/users/' + (VISITOR_USER_ID || USER_ID) + '/studies',
                type: 'GET',
                data: data
            });
        }
    };

    HOSTS['web_front_url'] = HOSTS['web_front_url'] || 'http://localhost:8081/';

    var ViewModel = function () {
        this.model = {
            trainIndex: 1,
            search: {
                study: {
                    status: '',
                    unit_type: 'open-course,auxo-train,auxo-specialty,mooc,ndu',
                    page: 0,
                    size: 9
                }
            },
            component: {
                study: {
                    items: []
                }
            },
            hasinited: false
        };
        this.store = {
            hosts: HOSTS,
            projectCode: PROJECT_CODE
        }
    };

    ViewModel.prototype = {
        construct: ViewModel,
        initViewModel: function (element) {
            this.model = koMapping.fromJS(this.model);
            this.initReady();
            this.study();
            ko.applyBindings(this, element);
        },
        initReady: function () {
            var that = this;
            this.model.search.study.status.extend({rateLimit: 200});
            this.model.search.study.status.subscribe(function () {
                that.study();
            });
        },
        switchTrainIndex: function (trainIndex) {
            this.model.trainIndex(trainIndex);
            send_resize();
        },
        switchStudyStatus: function (status) {
            this.model.search.study.page(0);
            this.model.search.study.status(status);
        },
        study: function () {
            var that = this,
                search = koMapping.toJS(this.model.search.study);
            if (search.status === '') {
                delete search.status;
            }
            service.study(search).then(function (data) {
                that.model.component.study.items(data.items);
                that.pagination($('#study-pagination'), data.count);
                that.lazyImg('.train img.lazy-image');
                that.model.hasinited(true);
                send_resize();
            });
        },
        pagination: function ($pagination, total) {
            var that = this,
                currentPageIndex = this.model.search.study.page(),
                pageSize = this.model.search.study.size();
            $pagination.pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                is_show_first_last: false,
                is_show_input: false,
                is_show_total: false,
                pageClass: 'cert_pagination',
                current_page: currentPageIndex,
                prev_text: i18nHelper.getKeyValue('experience.pagination.prev'),
                next_text: i18nHelper.getKeyValue('experience.pagination.next'),
                callback: function (index) {
                    if (index != currentPageIndex) {
                        that.model.search.study.page(index);
                        that.study();
                    }
                }
            });
        },
        lazyImg: function (selector) {
            setTimeout(function () {
                $(selector || 'img.lazy-image').lazyload({
                    skip_invisible: false
                }).trigger("appear");
            }, 0);
        }
    };

    $(function () {
        new ViewModel().initViewModel($('.train')[0]);
    });


  function send_resize(timeout){
    window.setTimeout(function(){
      window.parent.postMessage(JSON.stringify({
        "type": '$resize',
        data:{
          "width": window.innerWidth+'px',
          "height": document.documentElement.scrollHeight+'px'
        }
      }), '*');
    }, timeout || 200);
  }
}());