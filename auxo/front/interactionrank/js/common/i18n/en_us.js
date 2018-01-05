/*!
 * 我的学习语言包
 * addins->插件类,mystudy->组件类,common->公共类
 * @type {Object}
 */
i18n.rankComponent = {
    //myRankingList: {
        frontPage: {
            //我的排行（页面title）
            pageTitle: 'Ranking List',
            //学霸排行榜
            learderboard: 'Learderboard',
            //7天排行
            //'7ds': '7 Days',
            '7ds': 'Week',
            //月
            '30ds': 'Month',
            //总
            all: 'Overall',
            //根据学员的学习时长统计排序，同一课程重复学习的时长不计入
            tips1: 'Ranking statistics is based on learning minutes. The repetition is not included.',
            //排名
            rankingList: 'Ranking',
            //用户
            learner: 'Learner',
            //学习时长
            totalMins: 'Minutes',
            //我的{{rankType}}排名6位 ， 学习时长210分钟 ， 超过90%的同学
            tips2: 'My position in the {{rankType}} Ranking List is No. <i class="blue">{{place}}</i>, totally <i class="blue">{{mins}}</i> mins and exceed <i class="blue">{{percent}}</i> learners.',
            //{{mins}}分钟

            rankTip:'My position in the {{rankType}} Ranking List is No. <i class="blue">{{place}}</i>',

            totally:'totally',

            studyLenth:' <i class="blue">{{mins}}</i> mins and exceed <i class="blue">{{percent}}</i> learners.',

            mins: '{{mins}} mins',
            //点击加载更多排名...
            loadMore:'click to load more ranking list...',
            //加载中
            loading: 'loading',
            //排行榜将于每天4：00更新前一天的学习数据
            updateData: 'Ranking List updates at 04:00am everyday.',
            //已加载全部
            loadAll: 'No more.',
            //暂无数据
            noData:'No data.',
            //数据加载中
            dataLoading:'Data loading...'
        }
    //}
};
