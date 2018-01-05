/**
 * Created by Administrator on 2017.5.24.
 */
(function (window, $) {
    var store = {
        getInfo: function (specialty_plan_id) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/plan/' + specialty_plan_id + '/maps/config',
                type: 'GET'
            });
        },
        saveInfo: function (specialty_plan_id,is_map_enabled) {
            var data={
                is_map_enabled:is_map_enabled
            };
            return $.ajax({
                url: '/' + projectCode + '/specialty/plan/' + specialty_plan_id + '/maps/config',
                type: 'PUT',
                data: JSON.stringify(data)
            });
        }
    };
    var viewModel = {
        model: {
            saveInfo: {
                status: null
            },
            url: null,
            is_map_enabled: null

        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.getInfo();

        },
        getInfo: function () {
            var that = this;
            store.getInfo(window.specialtyId).then(function (data) {
                that.model.saveInfo.status(data.is_map_enabled);
            })
        },
        saveInfo: function () {
            if (this.model.saveInfo.status() === true) {
                this.model.is_map_enabled(true);
            } else {
                this.model.is_map_enabled(false);
            }
            store.saveInfo(window.specialtyId,ko.mapping.toJS(this.model.is_map_enabled)).done(function () {
                $('#reuploadModal').modal('show');
            })
        },
        saveInfoToNext: function () {
            if (this.model.saveInfo.status() === true) {
                this.model.is_map_enabled(true);
            } else {
                this.model.is_map_enabled(false);
            }
            var that = this;
            store.saveInfo(window.specialtyId,ko.mapping.toJS(this.model.is_map_enabled)).done(function () {
                location.href='/'+ projectCode + '/specialty_2/'+ window.specialtyId+ '/map/setting?source=' + source + '&return_url=' + encodeURIComponent(return_url);
            })
        },
        closeModal: function () {
            $('#reuploadModal').modal('hide');
        }
    };

    $(function () {
        viewModel.init();
    });
})(window, jQuery);