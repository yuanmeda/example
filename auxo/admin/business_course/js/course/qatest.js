(function ($, window) {
    var start = '/' + projectCode + '/course/';

    var viewModel = {
        model: {
            list: [
                {'title': '课程列表', 'href': start + 'test'},
                {'title': '基本信息', 'href': start + '{courseId}'},
                {'title': '新建课程', 'href': start + '0/edit'},
                {'title': '编辑课程', 'href': start + '{courseId}/edit'},

                {'title': '课程章节', 'href': start + '{courseId}/chapter'},
                {'title': '报名设置', 'href': start + '{courseId}/enroll_setting'},
                {'title': '学时设置', 'href': start + '{courseId}/time_rule_setting'},
                {'title': '考试管理', 'href': start + '{courseId}/exam'},

                {'title': '课程统计', 'href': start + '{courseId}/stat'},
                {'title': '学员管理', 'href': start + '{courseId}/user'}
            ],
            params: {
                courseId: '请先输入courseId(课程id)'
            }
        },
        init: function () {
            for (var i = 0, length = this.model.list.length; i < length; i++) {
                var l = this.model.list[i];
                l.href = l.href.replace('{courseId}', courseId);
            }
            //ko绑定作用域
            ko.applyBindings(this.model);
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window);