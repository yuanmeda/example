(function (window, $) {
    var store = {
        getUser: function () {
            return $.ajax({
                url: PAY_SERVICE_URL + '/v1/account'
            });
        },
        createUser: function () {
            return $.ajax({
                url: PAY_SERVICE_URL + '/v1/account',
                type: 'POST'
            });
        }
    };
    var viewModel = {
        model: {
            userInfo: {
                org_id:'',
                account_id:''
            },
            enable:true
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            this.getUser();
        },
        getUser: function () {
            var t = this;
            store.getUser().then(function (data) {
                if (data){
                    t.model.enable(false);
                    t.model.userInfo.org_id(data.org_id);
                    t.model.userInfo.account_id(data.account_id);
                }
            });
        },
        create: function () {
            store.createUser().then(function () {
                location.reload();
            })
        }

    };

    $(function () {
        viewModel.init();
    });
})(window, jQuery);