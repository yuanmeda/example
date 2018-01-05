;(function(){
    var initCompleted = false;
    var store = {
        // 获取课程收益    
        getCourseIncome: function(){
            var url = openCourse2Url + '/v1/m/open_courses/income/stat?';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false
            })
        },
        // 获取我的课程列表
        getCourseList: function(data) {
            var url = openCourse2GatewayUrl + '/v1/m/open_courses';
            return $.ajax({
                url: url,
                data: data,
                dataType: 'json',
                cache: false
            })
        }
    };
    var viewModel = {
        model: {
            courseArr: [], // 课程列表
            courseIncome: {
                CHANNEL_CASH: '', //  人民币
                CHANNEL_EMONEY: '', // 网龙币
                CHANNEL_GOLD:'' // 积分币
            },
            options: {
                total: 0, //  数据总数
                page: 0,  // 当前页
                size: 20, // 页面的大小
                status: 0, // 课程状态：0全部 1审核通过 2已下架 3审核中 4审核不通过 5未上传
                hasIncome: true // 课程收益过滤条件， 只返回有收益的课程
            }
        },
        helpers: {
            getObjectFirstValue: function(obj){
                if(!obj) return ;
                var keys = Object.keys(obj);
                return obj[keys[0]]
            }
        },
        init: function(){
            var self = this;
            var options = this.model.options;
            self.model = ko.mapping.fromJS(self.model);
            $.when(store.getCourseIncome(), store.getCourseList({page: options.page, size: options.size, status: options.status, has_income: options.hasIncome }))
            .done(function(courseIncomeRes, courseListRes) {
                var courseIncome = courseIncomeRes[0];
                var  courseList = courseListRes[0];

                self.model.courseIncome.CHANNEL_CASH(courseIncome.CHANNEL_CASH?courseIncome.CHANNEL_CASH:'');
                self.model.courseIncome.CHANNEL_EMONEY(courseIncome.CHANNEL_EMONEY?courseIncome.CHANNEL_EMONEY:'')
                self.model.courseIncome.CHANNEL_GOLD(courseIncome.CHANNEL_GOLD?courseIncome.CHANNEL_GOLD:'');

                self.model.courseArr(courseList.items);
                self.model.options.total(courseList.total);
                // self._initPagination(ko.unwrap(self.model.options.total), ko.unwrap(self.model.options.page), ko.unwrap(self.model.options.size))
                
                ko.applyBindings(self, document.getElementById('course_income'))
                $('img.lazy').lazyload({ threshold: 300,placeholder: defaultCourseCoverUrl })
                $('#course_income').show();
                initCompleted = true
            })

        },
        // 跳转到课程详情页
        linkToCourseDetail: function(course){
            var url = businessCourseGatewayUrl + '/' + projectCode + '/course/' + course.unit_id;
            return window.open(url);
        },
        queryCourse: function() {
            var self = this;
            var options = ko.mapping.toJS(self.model.options)
            store.getCourseList({page: options.page, size: options.size, status: options.status, has_income: options.hasIncome })
            .then(function(courseList){
                self.model.courseArr(courseList.items);
                // 美化图片加载失败
                $('img.lazy').lazyload({ threshold: 300, placeholder: defaultCourseCoverUrl })
            })
        },
        loadMore: function() {
            this.model.options.size(this.model.options.size() + 20);
            this.queryCourse();
        }
    };
    
    viewModel.init();
})();