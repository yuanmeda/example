import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            pkId: ko.observable(params.pkId),
            pk: ko.observable(null),
            pkUser: ko.observable(null),
        };
        this.options = params.options;
        this.projectCode = params.options.projectCode;
        this.urls = this.options.urls || {
                'api': '',
                'gateway': '',
                'static': '',
            };
        this.store = {
            getPkDetail: () => {
                return $.ajax({
                    url: this.urls.gateway + '/v2/pk_details/' + params.pkId,
                    dataType: 'json',
                    cache: false
                });
            },
            getPkUser: (data) => {
                return $.ajax({
                    url: this.urls.gateway + '/v1/pk_users',
                    dataType: 'json',
                    data: data,
                    cache: false
                });
            },
        };
        this.init();
    }

    init() {
        this.getPkDetail();
        this.getPkUser();
    }

    getPkDetail() {
        this.store.getPkDetail().done((res) => {
            this.model.pk(res);
        });
    }

    getPkUser() {
        this.store.getPkUser({'pk_id': this.model.pkId()}).done((res) => {
            this.model.pkUser(res);
        });
    }

    hrefToRecord() {
        let href = `${this.urls.gateway}/${this.projectCode}/pk/${this.model.pkId()}/record`;
        let mac = Nova.getMacToB64(href);
        var w = window.open();
        w.location.href = `${href}${mac ? '?__mac=' + mac : ''}`
    }

    hrefTo(single) {
        let href = '';
        if (single || !this.model.pk().user_exam_session) {
            href = `${this.urls.gateway}/${this.projectCode}/pk/${this.model.pkId()}/answer`;
        } else {
            href = `${this.urls.gateway}/${this.projectCode}/pk/${this.model.pkId()}/choose`
        }
        let mac = Nova.getMacToB64(href);
        var w = window.open();
        w.location.href = `${href}${mac ? '?__mac=' + mac : ''}`
    }

    formatDuration(time) {
        if (!time && time !== 0)return time;
        var hour = ~~(time / 60 / 60 );
        var minite = ~~((time - hour * 60 * 60 ) / 60 );
        var second = ~~((time - hour * 60 * 60 - minite * 60 ));
        return (hour < 10 ? '0' + hour : hour) + ':' + (minite < 10 ? '0' + minite : minite) + ':' + (second < 10 ? '0' + second : second);
    }
}
ko.components.register('x-course-detail-pk-entrance', {
    viewModel: ViewModel,
    template: tpl
});