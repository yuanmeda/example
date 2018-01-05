/**
 * Created by Leo on 2016/5/30.
 */
;(function ($, ko, undefined) {
    function Trainhead(params, componentInfo) {
        this.model = params.viewModel;
    }
    ko.components.register('x-trainhead', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                return new Trainhead(params, componentInfo);
            }
        },
        synchronous: true,
        template: '<div class="box block">'+
        '        <div class="banner-header">'+
        '            <h2>基本信息</h2>'+
        '        </div>'+
        '        <div class="basebox ">'+
        '            <div data-bind="with:model" class="base-item clearfix">'+
        '                <div class="l">'+
        '                    <div class="item-img">'+
        '                        <img data-bind="attr:{src:head.cover_url() || defaultImage}">'+
        '                    </div>'+
        '                    <i data-bind="text: !!head.enabled() ? \'在线\' : \'下线\',css:{ \'on\':head.enabled,\'off\':!head.enabled() }" class="item-label">在线</i>'+
        '                </div>'+
        '                <div class="item-info">'+
        '                    <div data-bind="text:head.title" class="item-name ellipsis"></div>'+
        '                    <div class="item-dd">共<!--ko text:head.course_count--><!-- /ko -->门课/<!--ko text:head.exam_count--><!-- /ko -->个考试/<!--ko text:head.course_hour--><!-- /ko -->学时，在学人员<!--ko text:head.user_count--><!-- /ko -->人</div>'+
        '                    <div data-bind="html:head.attention" class="item-desc"></div>'+
        '                </div>'+
        '            </div>'+
        '        </div>        '+
        '    </div>'
    })
})($, ko);