/**
 * 评价列表
 * @author wlj
 */
;
(function (w, $) {
    function Model(params) {
        this.params = params;
        this.store = {
            getAppraiseInfo: function (searchObj) {
                return $.ajax({
                    url: '/' + projectCode + '/targets/' + searchObj.target_id + '/appraises',
                    cache: false,
                    dataType: 'json',
                    type: "GET",
                    data: searchObj
                });
            }
        };
        var model = {
            course: {
                target_id: '',
                title: "",
                logo_url: "",
                average_score: "",
                evaluate_count: "",
                one_count_ratio: "",
                two_count_ratio: "",
                three_count_ratio: "",
                four_count_ratio: "",
                five_count_ratio: ""
            },
            search: {
                target_id: ''
            }
        };
        model.course.title = this.params.value.title();
        model.course.target_id = this.params.value.id();
        model.course.logo_url = this.params.value.logo_url();
        model.search.target_id = this.params.value.id();
        this.model = ko.mapping.fromJS(model);
        this._init();
    }


    Model.prototype = {
        /**
         * 初始化
         */
        _init: function () {
            var _self = this;
            _self.list();
        },

        list: function () {
            var search = ko.toJS(this.model.search),
                self = this;
            self.store.getAppraiseInfo(search).then(function (data) {
                self.model.course.average_score(data.avg_star ? data.avg_star : 0);
                self.model.course.evaluate_count(data.total ? data.total : 0);
                self.model.course.one_count_ratio((data.star1_count ? 100 * data.star1_count / data.total : 0 * 100).toFixed(2));
                self.model.course.two_count_ratio((data.star2_count ? 100 * data.star2_count / data.total : 0 * 100).toFixed(2));
                self.model.course.three_count_ratio((data.star3_count ? 100 * data.star3_count / data.total : 0 * 100).toFixed(2));
                self.model.course.four_count_ratio((data.star4_count ? 100 * data.star4_count / data.total : 0 * 100).toFixed(2));
                self.model.course.five_count_ratio((data.star5_count ? 100 * data.star5_count / data.total : 0 * 100).toFixed(2));
            });
        }
    };
    ko.components.register('x-appraise-resource', {
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