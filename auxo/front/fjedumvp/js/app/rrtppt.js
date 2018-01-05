(function () {
    var store = {
        getApps: function (type) {
            return $.ajax({
                url: '/fjedu/navs/load?type=' + type
            })
        }
    };
    var viewModel = {
        model: {
            appList: []
        },
        init: function () {
            var t = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            store.getApps(type).done(function (d) {
                t.model.appList(d);
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})();