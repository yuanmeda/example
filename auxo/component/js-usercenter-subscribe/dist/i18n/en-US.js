!function(k){
window.k = window.k || {};
window.k.channel = {
    common: {
        hi: 'HI~',
        student: 'student, subscribe',
        notice: 'content, we will notice you when it updates.',
        totalCount: '<em>{{count}}</em>content',
        cancel: 'unsubscribe',
        justNow: 'now',
        beforeMin: '{{num}}minutes before',
        beforeHour: '{{num}}hours before',
        beforeDay: '{{num}}days before',
        endTime: 'end time: ',
        more: 'more>',
        gotoList: 'goto list>',
        cancelSuccess: 'cancel success!',
        cancelContent:
            'cancel subscribe<!--ko text: model.data.channel_name--><!--/ko-->channel<!--ko if: model.data.tags.length > 0-->\
            "<span>\
            <!-- ko foreach: model.data.tags -->\
            <!-- ko if: $index() != 0-->\
            -\
            <!--/ko-->\
            <!--ko text: title--><!--/ko-->\
            <!--/ko-->\
            </span>"\
            tags\
            <!--/ko-->contents,you will not receive notice after unsubscribe',
        noContent: "(sorry,no content)",
        noSubscribe: "no subscribe",
        gotoLearn: "goto learn"
    },
    cell: {
        hours: 'hours',
        course: 'courses',
        exam: 'exams',
        begin: 'begin',
        end: 'end',

        enter: 'Enter',
        ended: 'Ended',
        waiting: 'Waiting',

        level: '<span class="strong">{{count}}</span> levels',

        openCourse: 'courses',
        train: 'trains'
    }
};

}(window.i18n = window.i18n || {})