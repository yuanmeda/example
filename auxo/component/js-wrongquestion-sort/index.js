import tpl from './template.html'
import ko from 'knockout'

function ViewModel(params) {
    this._checkParams(params);
    this.callBack = params.callBack;
}

ViewModel.prototype = {
    _checkParams: function (params) {
        var sort_params = ko.mapping.toJS(params.sort_params());
        if (sort_params.length <= 0) {
            sort_params = [          //排序参数
                {
                    "sort_property": 'update_time',
                    "sort_direction": 'desc',
                    "active": true
                },
                {
                    "sort_property": 'wrong_times',
                    "sort_direction": 'desc',
                    "active": false
                }
            ];
        } else if (sort_params.length == 1) {
            if (sort_params[0].sort_property == 'update_time') {
                sort_params.push({
                    "sort_property": 'wrong_times',
                    "sort_direction": 'desc',
                    "active": false});
            } else {
                sort_params.unshift({
                    "sort_property": 'update_time',
                    "sort_direction": 'desc',
                    "active": false});
            }
        }
        this.sort_params = ko.mapping.fromJS(sort_params);
    },
    sort: function (st) {
        for (var i = 0; i < this.sort_params().length; i++) {
            var s = this.sort_params()[i];

            if (s.sort_property() == st) {
                if (s.active()) {
                    s.sort_direction(s.sort_direction() == 'desc' ? 'asc' : 'desc');
                } else {
                    s.active(true);
                }
            } else {
                s.active(false);
            }
        }
        this.onBtnClick(1);
    },
    onBtnClick: function (mode) {
        this.callBack && this.callBack(mode, ko.mapping.toJS(this.sort_params));
    }
};

ko.components.register('x-wrongquestion-sort', {
    viewModel: ViewModel,
    template: tpl
});