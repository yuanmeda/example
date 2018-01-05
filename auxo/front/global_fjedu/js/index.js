(function ($, window) {
    var loading = false;
    var store = {
        getReourcesCatalogs: function () {
            return $.ajax({
                url: '/fjedu/resource/resource_phases'
            })
        },
        getReourcesByCatalogId: function (cid) {
            return $.ajax({
                url: '/fjedu/resource/resource_read_rank?category=' + cid + '&page=1&size=10'
            })
        }
    };

    var viewModel = {
        model: {
            resources: [],
            catalogs: [],
            catalogId: ''
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.pageStart();
        },
        pageStart: function () {
            this.catalogs();
        },
        catalogs: function () {
            var t = this;
            store.getReourcesCatalogs().done(function (d) {
                d.unshift({"id": "", "name": "全部"})
                t.model.catalogs(d);
                t.resources('');
            })
        },
        chooseCatalog: function (id) {
            if (loading)
                return;

            this.model.catalogId(id);
            this.resources(id);
        },
        resources: function (id) {
            var t = this;
            if (loading)
                return;
            loading = true;
            store.getReourcesByCatalogId(id).done(function (d) {
                t.model.resources(d.items);
                loading = false;
            });
        },
        go: function (href) {
            location.href = href;
        },
        resourceGo: function () {
            window.open(this.detail_page_url);
        },
        format: function (t) {
            return t.substr(0, 10);
        }
    };


    $(function () {
        viewModel.init();
    });

    $(".fullSlide").slide({
        titCell: ".hd ul",
        mainCell: ".bd ul",
        effect: "fold",
        autoPlay: true,
        autoPage: true,
        startFun: function () {

        }
    });
})(jQuery, window)
