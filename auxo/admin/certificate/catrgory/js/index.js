;(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    var PROJECT_CODE = GLOBAL['projectCode'];

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
                query: '/' + PROJECT_CODE + '/tags/tree',
                create: '/' + PROJECT_CODE + '/tags ',
                update: function (id) {
                    return '/' + PROJECT_CODE + '/tags/' + id;
                },
                move: function (id) {
                    return '/' + PROJECT_CODE + '/tags/' + id + '/move';
                },
                del: function (id) {
                    return '/' + PROJECT_CODE + '/certificates/certificate_types/' + id;
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