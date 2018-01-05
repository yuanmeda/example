(function ($) {
    var store = {
        project: {
            list: function () {
                return $.ajax({
                    url: window.elearningServiceUrl + "/v1/projects/uc_organizations/" + window.orgId + "?org_type=" + window.orgType,
                    headers: {
                        "X-Gaea-Authorization": undefined
                    }
                })
            }
        }
    };

    var viewModel = {
        model: {
            list: []
        },
        init: function () {
            var _this = this;

            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('content'));

            store.project.list().done(function (data) {
                _this.model.list(data.items);
            });
        },
        click: function (data) {
            var url = "http://" + location.host + "/" + window.orgId + "/task_study/object_choose?type=" + window.type + "&project_id=" + data.project_id;
            window.location.href = url;
        }
    };

    $(function () {
        viewModel.init();
    })
})(jQuery)