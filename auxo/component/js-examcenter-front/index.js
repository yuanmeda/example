import tpl from './template.html'
import ko from 'knockout'
import '../../front/examcenter/js/common/util.js'
import '../../addins/jquery-ui/v1.9.1/jquery.ui.core.js'
import '../../addins/jquery-ui/v1.9.1/jquery.ui.widget.js'
import '../../addins/jquery-ui/v1.9.1/jquery.ui.mouse.js'
import '../../addins/jquery-ui/v1.9.1/jquery.ui.draggable.js'
import '../../addins/jquery-ui/v1.9.1/jquery.ui.position.js'
import '../../addins/jquery-ui/v1.9.1/jquery.ui.button.js'
import '../../addins/jquery-ui/v1.9.1/jquery.ui.dialog.js'
import '../../addins/jquery-udialog/v1.0.0/js/udialog-common.js'

function ViewModel(params) {
    this.data = [params.data];
    this.projectCode = params.projectCode;
}
ViewModel.prototype = {
    goToDetail: function (data) {
        if (data.sub_type != 2) {
            var w = window.open();
            /*这里需要添加域名吗？*/
            w.location.href = window.selfUrl + '/' + projectCode + '/' + (data.offline_exam ? 'exam/offline_exam' : 'exam') + '/prepare' + (data.offline_exam ? '?tmpl_id=' : '/') + data.id + (data.offline_exam ? '&location_source=' : '?location_source=' ) + (data.paper_location ? data.paper_location : 1)
        } else {
            $.fn.udialog.alert('请到移动端体验该考试');
        }
    },
    gotoExam: function (url) {
        window.open(url);
    }
};
ko.components.register('x-examcenter-front', {
    viewModel: ViewModel,
    template: tpl
})
