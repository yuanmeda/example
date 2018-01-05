/**
 * Created by Administrator on 2017.9.1.
 */
;(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    var PROJECT_CODE = GLOBAL['project_code'];

    var ViewModel = function () {
        this.model = {

        };

        return this;
    };

    ViewModel.prototype = {

        constructor: ViewModel,

        initViewModel: function (element) {
            this.model = koMapping.fromJS(this.model);

            this.initTree();
            //ko.applyBindings(this);
        },

        initValidation: function () {

        },

        initTree: function () {
            var options = {
                query: certificate_webpage_host + '/' + PROJECT_CODE + '/tags/tree',
                create: certificate_webpage_host + '/' + PROJECT_CODE + '/tags ',
                update: function (id) {
                    return certificate_webpage_host + '/' + PROJECT_CODE + '/tags/' + id;
                },
                move: function (id) {
                    return certificate_webpage_host + '/' + PROJECT_CODE + '/tags/' + id + '/move';
                },
                del: function (id) {
                    return certificate_webpage_host + '/' + PROJECT_CODE + '/certificates/certificate_types/' + id;
                },
                level: 2,
                custom_type: 'e-certificate',
                root_name: '全部'
            };

            $('.container').Label(options);
        }

    };

    $(function () {
        (new ViewModel()).initViewModel(document.getElementById('boot'));
    });

}());