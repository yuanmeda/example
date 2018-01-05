;(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    // 用户ID
    var USER_ID = GLOBAL['userId'];

    // 证书ID
    var CERTIFICATE_ID = GLOBAL['certificateId'];

    // projectCode
    var PROJECT_CODE = GLOBAL['projectCode'];

    var service = {
        /**
         * 查看证书
         * @param data
         * @returns {*}
         */
        getCertificateView: function (data) {
            return $.ajax({
                url: '/' + PROJECT_CODE + '/certificates/user_certificates/view',
                type: 'GET',
                dataType: 'json',
                data: data

            });
        }
    };

    var ViewModel = function () {
        this.model = {
            entity: {
                content: ''
            },
            hasInitialized: false
        };

        return this;
    };

    ViewModel.prototype = {

        constructor: ViewModel,

        initViewModel: function (element) {
            this.model = koMapping.fromJS(this.model);

            this.getCertificateView(USER_ID, CERTIFICATE_ID);
            ko.applyBindings(this, element);
        },
        /**
         * 查看证书
         * @param userId
         * @param certificateId
         */
        getCertificateView: function (userId, certificateId) {
            var that = this;
            service.getCertificateView({
                user_id: userId,
                certificate_id: certificateId
            }).then(function (data) {
                that.model.entity.content(data.content);
                that.model.hasInitialized(true);
            });
        }
    };

    $(function () {
        (new ViewModel()).initViewModel(document.getElementById('boot'));
    });

}());