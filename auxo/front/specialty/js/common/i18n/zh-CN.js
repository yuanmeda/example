/*!
 * 专业课组件语言包
 * @type {Object}
 */
var i18n = i18n || {};
i18n.specialty = {
    college: {
        //暂无学院
        noCollege: '暂无学院',
        //年级
        grade: '级'
    },
    specialties: {
        //专业总数
        total: '共计',
        speNum: '个专业',
        //暂无专业
        noSpe: '暂无专业',
        //立即学习
        learnIm: '立即学习',
        //去学习
        toLearn: '去学习',
        waitLearn: '等待开课',
        endLearn: '已结束',
        // 开始于
        beginIn: '开始于',
        //人数
        speStudent: '人'
    },
    course: {
        // 课程数
        courseNum: "门课程",
        //通过方式
        passWay: '通过方式：',
        //人数
        courseStudent: '人',
        //总计达到
        totalTo: '总计达到',
        //必修达      
        requiredTo: '必修达',
        // 选修达
        optionalTo: '选修达',
        //学分
        credit: '学分',
        //课程学友
        studentNum: '课程学友',
        //7天学习排行榜
        rankingList: '7天学习排行榜',
        //同学
        student: '同学',
        //排行
        rank: '排行',
        //暂无数据
        noData: '暂无数据',
        //课程
        courses: '课程',
        // 教学计划
        teachingPlans: '教学计划',
        //资源
        resources: '资源',
        //课程介绍
        courseInt: '简介',
        //学员评价
        evaluation: '学员评价',
        //课程介绍
        courseIntro: '简介:',
        //课程学分详情
        courseCreditInfo: '已通过 <span class="light">{{alreadyPassed}}</span> 门 / 共计 <b>{{totalCourse}}</b>' +
        ' 门课程，已获学分 <span class="light">{{gotCredit}}</span> / 毕业达标学分 <b>{{creditStandard}}</b>',
        //课程学分详情2
        courseCreditInfoExt: '已通过课程 <span class="light">{{alreadyPassed}}</span> / <b>{{totalCourse}}</b>' +
        '，已通过考试 <span class="light">{{passedExamCount}}</span> / <b>{{examCount}}</b>；' +
        '已获必修学分 <span class="light">{{userRequiredScore}}</span> / <b>{{passRequiredScore}}</b>，'+
        '已获选修学分 <span class="light">{{userOptionalScore}}</span> / <b>{{passOptionalScore}}</b>' ,
        //课程图谱
        courseMap: '学习地图',
        //必修课
        requiredCourse: '必修',
        //选修课
        electiveCourse: '选修',
        practiceCourse: '实践',
        //暂无课程
        noCourse: '暂无课程',
        //学时
        hours: '学时',
        //友情提示
        friendshipTips: '友情提示',
        //级
        grade: '级',
        //全部阶段
        allTerm: '全部阶段',
        //全部学分
        allCredit: '全部学分',
        //1学分以下,
        lessOneCredit: '2学分以下',
        //1-2学分,
        twoCredits: '2-4学分',
        //2-3学分,
        threeCredits: '4学分以上',
        exam: '考试',
        course: '课程'
    },
    plan: {
        // 已完成
        completed: "已完成",
        //请先报名培养计划
        signUpPlan: '您未报名，请先报名。'
    },
    map: {
        finish: '已达标',
        unfinished: '未达标',
        video: '视频',
        document: '文档',
        exercise: '练习',
        chance: '考试机会：',
        unlimited: '不限',
        duration: '时长：',
        barriers: '共 <em>{{barrier}}</em> 关',
        unlock: '需先完成前置学习才能解锁︰',
        nodata: '暂无学习地图',
        loading: '数据加载中...',
        "business_course": "【公开课】",
        "standard_exam": "【考试】",
        "custom_exam": "【自定义考试】",
        "competition": "【智力竞赛】",
        "design_methodlogy_exam": "【方法论考试】",
        "design_methodlogy_exercise": "【方法论练习】",
        "barrier": "【闯关】",
        "plan_exam": "【测评】",
        "fail":"（未通过考试）"
    },
    courseMap: {
        back: '返回',
        achieveRequire: '成就要求：',
        requiredCredits: '必修学分',
        electiveCredits: '选修学分',
        completed: '已完成',
        creditReward: '积分奖励：',
        credit: '积分',
        awarded: '已获得',
        achieveTitle: '成就称号：'
    }
};
