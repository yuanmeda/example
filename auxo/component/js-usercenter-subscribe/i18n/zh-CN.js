window.i18n = window.i18n || {};
window.i18n.subscribe = {
    common: {
        hi: 'HI~',
        student: '同学，您已订阅',
        notice: '组内容，所订阅的标签下有内容更新时，将会提示您。',
        totalCount: '共<em>{{count}}</em>个新内容',
        cancel: '取消订阅',
        justNow: '刚刚',
        beforeMin: '{{num}}分钟前',
        beforeHour: '{{num}}小时前',
        beforeDay: '{{num}}天前',
        endTime: '结束时间：',
        more: '显示更多>',
        gotoList: '去查看更多>',
        cancelSuccess: '取消订阅成功！',
        cancelContent:
            '正在取消订阅<!--ko text: model.data.channel_name--><!--/ko-->频道中<!--ko if: model.data.tags.length > 0-->\
            "<span>\
            <!-- ko foreach: model.data.tags -->\
            <!-- ko if: $index() != 0-->\
            -\
            <!--/ko-->\
            <!--ko text: title--><!--/ko-->\
            <!--/ko-->\
            </span>"\
            标签下\
            <!--/ko-->的内容,取消后将不再收到更新提示',
        noContent: "(sorry,此订阅组下暂时还没有内容)",
        noSubscribe: "您暂时没有订阅内容",
        gotoLearn: "去学习"
    },
    cell: {
        hours: '学时',
        course: '门课程',
        exam: '个考试',
        begin: '开始',
        end: '结束',
        enter: '进入考试',
        ended: '已结束',
        waiting: '即将开始',
        level: '共 <span class="strong">{{count}}</span> 关',
        openCourse: '公开课',
        train: '培训'
    }
};