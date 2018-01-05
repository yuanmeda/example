(function (i18n) {
    /**
     * 培训经历语言包
     * @type {{}}
     */
    i18n.experience = {
        // PK
        pk: {
            //你在与
            you: 'You compare with',
            //的PK中
            compare: ' ',
            //分钟
            minute: 'Min',
            //学习时间
            studyTime: 'Time',
            //门
            course: 'Crs ',
            //完成课程
            completeCourse: 'Course',
            //个
            certificates: 'Cert',
            //获取认证
            getCertificate: 'Certs',

            //平分秋色，加油哦！
            equal: ' are equal，Come on!',
            //处于全面领先，太棒了！
            winAlmost: ' are overall lead，Great!',
            //略胜一筹，请继续努力！
            winLittle: ' are a stroke above!',
            //处于下风，加油哦~
            loseLittle: ' are a little worse!',
            //被全面压制，快去学习吧~
            loseAlmost: 'are completely fail!'
        },
        // 认证展示
        certificate: {
            //认证展示
            showCert: 'Certificate',
            //点击查看更多
            seeMore: 'View more',
            //您还没有获取的认证，快去学习吧！
            noCert: 'Do not have certificate, go to learn!',
            // 访问他人时，未获取认证
            noCertOther: 'Have no certificate!',
            //马上去学
            goLearn: 'Learn',
            //立即申请
            apply: 'Apply',
            //已获取
            gotten: 'Gotten'

        },

        // 分页脚本
        pagination: {
            prev: 'prev',
            next: 'next'
        },

        // 学习统计
        statistics: {
            title: 'Statistics',
            race: {
                no1: 'Congratulations!',
                info: 'Last 30 days learn',
                beat: 'minutes beat',
                percent: '% students.',
                bad: 'Too suck, go to learn!',
                good: 'Please continue fighting.',
                great: 'Good. continue maintaining!',
                learnBtnLabel: 'Learn!',
                student: 'Student {{name}}'
            },
            rank: {
                title: 'Last 30 days of the <em>{{depName}}</em> departments rank',
                minute: 'min'
            },
            chart: {
                title: 'Individual learn statistics',
                tile: {
                    minute: 'minute',
                    hour: 'hour',
                    day: 'day',
                    month: 'month'
                }
            }
        },

        // 培训/课程
        train: {
            tab: {
                study: 'Internal train',
                course: 'Course',
                train: 'Outside train'
            },
            container: {
                study: {
                    status: {
                        all: 'All',
                        notStart: 'Not start',
                        ongoing: 'Online',
                        completed: 'Completed'
                    },
                    nodata: 'No data'
                },
                course: {
                    empty: 'Functional development, please look forward to'
                },
                train: {
                    nodata: 'No external training'
                }
            }
        }


    };


}(window.i18n || (window.i18n = {})));