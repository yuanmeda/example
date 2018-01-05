(function (i18n) {
    /**
     * 培训经历语言包
     * @type {{}}
     */
    i18n.experience = {
        // PK
        pk: {
            //你在与
            you: '你在与',
            //的PK中
            compare: '同学的PK中',
            //分钟
            minute: '分钟',
            //学习时间
            studyTime: '学习时间',
            //门
            course: '门',
            //完成课程
            completeCourse: '完成课程',
            //个
            certificates: '个',
            //获取认证
            getCertificate: '获取认证',

            //平分秋色，加油哦！
            equal: '平分秋色，加油哦！',
            //处于全面领先，太棒了！
            winAlmost: '处于全面领先，太棒了！',
            //略胜一筹，请继续努力！
            winLittle: '略胜一筹，请继续努力！',
            //处于下风，加油哦~
            loseLittle: '处于下风，加油哦~',
            //被全面压制，快去学习吧~
            loseAlmost: '被全面压制，快去学习吧~'


        },
        // 认证展示
        certificate: {
            //认证展示
            showCert: '认证展示',
            //点击查看更多
            seeMore: '点击查看更多',
            //您还没有获取的认证，快去学习吧！
            noCert: '没有获取的认证，快去学习吧！',
            // 访问他人时，未获取认证
            noCertOther: '暂时还未获取任何认证~',
            //马上去学
            goLearn: '马上去学',
            //立即申请
            apply: '立即申请',
            //已获取
            gotten: '已获取'
        },

        // 分页脚本
        pagination: {
            prev: '上一页',
            next: '下一页'
        },

        // 学习统计
        statistics: {
            title: '学习统计',
            race: {
                no1: '恭喜你荣登榜首！',
                info: '近30日共学习',
                beat: '分钟击败了部门',
                percent: '%的同学。',
                bad: '太不给力了，快去学习吧！',
                good: '请继续努力~',
                great: '好样的，请继续保持！',
                learnBtnLabel: '去学习',
                student: '{{name}} 同学'
            },
            rank: {
                title: '<em>{{depName}}</em>近30日部门学习排行榜',
                minute: '分钟'
            },
            chart: {
                title: '个人学习统计',
                tile: {
                    minute: '分钟',
                    hour: '小时',
                    day: '天',
                    month: '月'
                }
            }
        },

        // 培训/课程
        train: {
            tab: {
                study: '公司内部培训',
                course: '开设课程',
                train: '外部培训'
            },
            container: {
                study: {
                    status: {
                        all: '全部课程',
                        notStart: '未开始',
                        ongoing: '进行中',
                        completed: '已完成'
                    },
                    nodata: '暂无数据'
                },
                course: {
                    empty: '功能开发中，敬请期待'
                },
                train: {
                    nodata: '暂无外部培训'
                }
            }
        }


    };


}(window.i18n || (window.i18n = {})));